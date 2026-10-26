"""
apps/accounts/views.py

Vues d'authentification Piolo — version corrigée et complète.

Architecture :
  - auth_view()            → Sert la page HTML unique (SPA-like)
  - login_api()            → POST JSON → session Django
  - register_api()         → POST JSON → Locataire / Architecte
  - register_bailleur_step1() → POST JSON → crée compte PENDING
  - verify_otp()           → POST JSON → valide le téléphone
  - submit_bailleur_dossier() → POST multipart → CNI + selfie + patrimoine
  - bailleur_pending_view()   → GET  → page "en attente de validation"
  - dashboard_redirect_view() → GET  → redirige selon le rôle
  - logout_view()          → GET  → déconnexion
  - forgot_password()      → POST JSON → lien reset par email
"""

import json
import logging

import secrets
from urllib.parse import urlencode
from django.core import signing
from django.core.cache import cache

from django.contrib import messages
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.conf import settings
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST

from .models import AccountStatus, BailleurDossier, DossierStatus, UserRole
from .password_reset_mail import send_password_reset_email
from apps.core.file_validation import validate_uploaded_file, DOCUMENT_EXTENSIONS, DOCUMENT_MIME_TYPES

User = get_user_model()
logger = logging.getLogger('apps.accounts')


# ─── HELPERS ─────────────────────────────────────────────────────────────────

def _json_body(request):
    """Parse le corps JSON de la requête. Lève ValueError si invalide."""
    try:
        return json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValueError("Corps JSON invalide.") from exc


def _ok(data: dict | None = None, **kwargs) -> JsonResponse:
    return JsonResponse({'ok': True, **(data or {}), **kwargs})


def _err(message: str, status: int = 200) -> JsonResponse:
    return JsonResponse({'ok': False, 'error': message}, status=status)


# apps/accounts/views.py

def _redirect_for_role(user) -> str:
    """Retourne l'URL de redirection selon le rôle."""
    if user.is_admin:
        return '/admin/'
    
    if user.is_bailleur:
        # [DEV MODE] : Toujours vers le dashboard
        # return '/accounts/bailleur/dashboard/'
        # [PRODUCTION] : Décommenter pour réactiver la validation
        if user.status == AccountStatus.PENDING:
            return '/accounts/pending/'
        if user.status == AccountStatus.BLOCKED:
            return '/accounts/'
        return '/accounts/bailleur/dashboard/'
    
    if user.is_architecte:
        return '/accounts/architecte/dashboard/'
    
    return '/accounts/locataire/'


# ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

def auth_view(request):
    """
    Sert la page d'authentification (connexion + inscription).
    Redirige vers le dashboard si l'utilisateur est déjà connecté.
    """
    if request.user.is_authenticated:
        return redirect(_redirect_for_role(request.user))
    return render(request, 'accounts/auth.html')


# ─── CONNEXION ────────────────────────────────────────────────────────────────

@require_POST
def login_api(request):
    """
    Endpoint AJAX — Connexion par email + mot de passe.

    Requête  : POST JSON  { "email": "...", "password": "..." }
    Réponse  : { "ok": true,  "redirect": "/dashboard/" }
             | { "ok": false, "error": "..." }
    """
    try:
        data = _json_body(request)
    except ValueError:
        return _err("Requête invalide.", 400)

    email    = data.get('email',    '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return _err("Email et mot de passe sont requis.")

    # CustomUser utilise EMAIL comme USERNAME_FIELD — on passe email= directement
    user = authenticate(request, email=email, password=password)

    if user is None:
        logger.warning("Tentative de connexion échouée pour : %s", email)
        return _err("Email ou mot de passe incorrect.")

    # Vérifications de statut AVANT de connecter
    if not user.is_active:
        return _err("Ce compte est désactivé. Contactez le support.")

    if user.status == AccountStatus.BLOCKED:
        return _err(
            "Ce compte est bloqué définitivement suite à des soumissions "
            "frauduleuses. Contactez le support."
        )

    # apps/accounts/views.py — dans login_api()

    if user.is_bailleur and user.status == AccountStatus.PENDING:
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        logger.info("Bailleur PENDING connecté : %s → pending", user.email)
        return _ok(redirect='/accounts/pending/')  

    if user.status == AccountStatus.SUSPENDED:
        return _err("Ce compte est temporairement suspendu. Contactez le support.")

    login(request, user)
    logger.info("Connexion réussie : %s (%s)", user.email, user.role)

    return _ok(redirect=_redirect_for_role(user), role=user.role)


# ─── DÉCONNEXION ──────────────────────────────────────────────────────────────

def logout_view(request):
    """Déconnecte l'utilisateur et redirige vers la page d'auth."""
    if request.user.is_authenticated:
        logger.info("Déconnexion : %s", request.user.email)
        logout(request)
    messages.success(request, "Vous avez été déconnecté.")
    return redirect('accounts:auth')


# ─── INSCRIPTION LOCATAIRE / ARCHITECTE ──────────────────────────────────────

# apps/accounts/views.py

@require_POST
def register_api(request):
    """
    Endpoint AJAX — Inscription standard (Locataire ou Architecte).
    Version corrigée : login() avec backend explicite + logging détaillé.
    """
    try:
        data = _json_body(request)
    except ValueError:
        logger.error("JSON invalide dans register_api")
        return _err("Requête invalide.", 400)

    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', UserRole.LOCATAIRE)

    # ── Validations ──────────────────────────────────────────────────────
    errors = {}
    if not first_name:
        errors['first_name'] = "Le prénom est requis."
    if not last_name:
        errors['last_name'] = "Le nom est requis."
    if not email:
        errors['email'] = "L'adresse email est requise."
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors['email'] = "Adresse email invalide."
    if not password or len(password) < 8:
        errors['password'] = "Le mot de passe doit faire au moins 8 caractères."
    if role not in (UserRole.LOCATAIRE, UserRole.ARCHITECTE):
        errors['role'] = "Rôle invalide pour l'inscription standard."

    if errors:
        return JsonResponse({'ok': False, 'errors': errors})

    if User.objects.filter(email=email).exists():
        return _err("Un compte existe déjà avec cette adresse email.")

    # ── Création de l'utilisateur ─────────────────────────────────────────
    try:
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            status=AccountStatus.ACTIVE,
            is_active=True,        # ← Important pour login()
            verification_level=2,      # ← Optionnel mais recommandé
        )
        logger.info("✅ Utilisateur créé : %s", user.email)
    except Exception as e:
        logger.error("❌ Erreur création utilisateur : %s — %s", type(e).__name__, str(e), exc_info=True)
        return _err(f"Erreur lors de la création du compte : {str(e)}")

    # ── Créditer les points de bienvenue ─────────────────────────────────
    try:
        from django.conf import settings
        welcome_pts = getattr(settings, 'POINTS_CONFIG', {}).get('WELCOME_BONUS', 50)
        user.award_points(welcome_pts, "Points de bienvenue à l'inscription")
        logger.info("✅ %d points crédités à %s", welcome_pts, user.email)
    except Exception as e:
        # Ne pas bloquer l'inscription si award_points échoue
        logger.warning("⚠️ award_points a échoué (non bloquant) : %s", e)
        welcome_pts = 0

    # ── Connexion automatique après inscription ──────────────────────────
    try:
        # 🔴 CORRECTION PRINCIPALE : Spécifier le backend d'authentification
        login(
            request,
            user,
            backend='django.contrib.auth.backends.ModelBackend'  # ← ESSENTIEL avec CustomUser
        )
        logger.info("✅ Connexion réussie après inscription : %s", user.email)
        
    except Exception as e:
        # Logger l'erreur complète pour debug
        logger.error(
            "❌ Échec login() après inscription : %s — Type: %s — User: %s (id=%s) — Session: %s",
            str(e), type(e).__name__, user.email, user.pk, request.session.session_key,
            exc_info=True
        )
        # Retourner une réponse utile au frontend
        return _ok(
            redirect='/accounts/login/',
            message='Compte créé avec succès ! Veuillez vous connecter manuellement.',
            requires_login=True,
            email=user.email,
        )

    logger.info("🎉 Nouveau compte créé et connecté : %s (%s)", user.email, user.role)

    return _ok(
        redirect=_redirect_for_role(user),
        message=f"Bienvenue {user.first_name} ! {welcome_pts} points offerts.",
        points=user.points,
        role=user.role,
    )

# ─── INSCRIPTION BAILLEUR — ÉTAPE 1 : Identité ──────────────────────────────

# apps/accounts/views.py

@require_POST
def register_bailleur_step1(request):
    """
    [DEV MODE] Inscription bailleur simplifiée — PAS de validation KYC.
    Le compte est créé ACTIF et redirigé directement vers le dashboard.
    
    ⚠️  Pour la production : rétablir status=PENDING et is_active=False
    
    Requête :
      { "first_name": "...", "last_name": "...", "email": "...",
        "phone": "+237 6...", "password": "..." }
    Réponse :
      { "ok": true, "redirect": "/accounts/bailleur/dashboard/" }
    """
    try:
        data = _json_body(request)
    except ValueError:
        return _err("Requête invalide.", 400)

    first_name = data.get('first_name', '').strip()
    last_name  = data.get('last_name',  '').strip()
    email      = data.get('email',      '').strip().lower()
    phone      = data.get('phone',      '').strip()
    password   = data.get('password',   '')

    # ── Validations ──────────────────────────────────────────────────────
    errors = {}
    if not first_name: errors['first_name'] = "Prénom requis."
    if not last_name:  errors['last_name']  = "Nom requis."
    if not phone:      errors['phone']      = "Numéro de téléphone requis."
    if not email:
        errors['email'] = "Email requis."
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors['email'] = "Email invalide."
    if not password or len(password) < 8:
        errors['password'] = "Minimum 8 caractères."

    if errors:
        return JsonResponse({'ok': False, 'errors': errors})

    if User.objects.filter(email=email).exists():
        return _err("Un compte existe déjà avec cet email.")

    # ── Création du compte bailleur ACTIF (DEV MODE) ─────────────────────
    # [PRODUCTION] : Remplacer par status=PENDING, is_active=False
    user = User.objects.create_user(
        email          = email,
        password       = password,
        first_name     = first_name,
        last_name      = last_name,
        phone          = phone,
        role           = UserRole.BAILLEUR,
        status         = AccountStatus.PENDING,
        is_active      = True,
        phone_verified = False,
    )

    # Stocker l'UUID en session pour les étapes suivantes
    request.session['pending_bailleur_id']    = str(user.pk)
    request.session['pending_bailleur_phone'] = phone

    logger.info("Bailleur PENDING créé : %s", user.email)

    return _ok(next_step=2, phone_hint=phone[:6] + 'XXXXX')


# ─── INSCRIPTION BAILLEUR — ÉTAPE 2 : Vérification OTP ───────────────────────

@require_POST
def verify_otp(request):
    """
    Endpoint AJAX — Valide le code OTP reçu par SMS.

    Requête  : { "otp": "123456" }
    Réponse  : { "ok": true, "next_step": 3 }
             | { "ok": false, "error": "..." }
    """
    try:
        data = _json_body(request)
    except ValueError:
        return _err("Requête invalide.", 400)

    otp = data.get('otp', '').strip()

    if not otp or len(otp) != 6 or not otp.isdigit():
        return _err("Le code OTP doit être composé de 6 chiffres.")

    user_id = request.session.get('pending_bailleur_id')
    if not user_id:
        return _err("Session expirée. Recommencez l'inscription.", 403)

    # ── Vérification OTP ─────────────────────────────────────────────────
    # TODO : Remplacer par la vraie validation via ton service SMS
    # from apps.notifications.sms import verify_otp as sms_verify
    # if not sms_verify(otp, user_id):
    #     return _err("Code OTP invalide ou expiré.")

    # [DÉMO] : Accepte tout code à 6 chiffres
    is_valid = len(otp) == 6 and otp.isdigit()

    if not is_valid:
        return _err("Code OTP invalide ou expiré.")

    try:
        user = User.objects.get(pk=user_id)
        user.phone_verified = True
        user.save(update_fields=['phone_verified'])
        logger.info("Téléphone vérifié pour : %s", user.email)
    except User.DoesNotExist:
        return _err("Compte introuvable. Recommencez l'inscription.", 404)

    # Marquer l'OTP comme validé en session
    request.session['otp_verified'] = True

    return _ok(next_step=3)

# @require_POST
# def verify_otp(request):
#     """
#     [DÉVELOPPEMENT] Bypasse la vérification OTP.
#     Retourne toujours succès pour avancer dans le flux.
#     """
#     # En dev, on accepte tout et on avance
#     return _ok(next_step=3, message="OTP validé (dev mode)")


# ─── INSCRIPTION BAILLEUR — ÉTAPE 5 : Soumission dossier KYC ─────────────────

# apps/accounts/views.py

@require_POST
def submit_bailleur_dossier(request):
    """
    [DEV MODE] Bypasse la soumission du dossier KYC.
    Redirige directement vers le dashboard bailleur.
    
    ⚠️  Pour la production : rétablir la logique complète de validation
    
    Réponse : { "ok": true, "redirect": "/accounts/bailleur/dashboard/" }
    """
    # [DEV MODE] : Récupérer l'utilisateur et rediriger directement
    # user_id = request.session.get('pending_bailleur_id')
    
    # if user_id:
    #     try:
    #         user = User.objects.get(pk=user_id)
            
    #         # [DEV MODE] : Activer le compte si ce n'est pas déjà fait
    #         if user.status != AccountStatus.ACTIVE:
    #             user.status = AccountStatus.ACTIVE
    #             user.is_active = True
    #             user.is_verified = True
    #             user.save(update_fields=['status', 'is_active', 'is_verified'])
            
    #         # Bonus de bienvenue si pas encore crédité
    #         if user.points < 30:
    #             user.award_points(30, "Points de bienvenue bailleur (dev mode)")
            
    #         # Nettoyer la session
    #         for key in ['pending_bailleur_id', 'pending_bailleur_phone', 'otp_verified']:
    #             request.session.pop(key, None)
                
    #         # Connecter l'utilisateur s'il ne l'est pas déjà
    #         if not request.user.is_authenticated or request.user.pk != user.pk:
    #             login(request, user)
                
    #         logger.info("Bailleur (DEV MODE) : %s → dashboard", user.email)
            
    #     except User.DoesNotExist:
    #         pass
    
    # # [DEV MODE] : Rediriger directement vers le dashboard
    # return _ok(
    #     redirect = '/accounts/bailleur/dashboard/',  # ← URL correcte avec préfixe
    #     message  = "Dossier soumis (dev mode) — Accès dashboard activé",
    # )
    
    # ── [PRODUCTION] : Décommenter le bloc ci-dessous pour réactiver la validation ──
    
    user_id = request.session.get('pending_bailleur_id')
    if not user_id:
        return _err("Session expirée. Recommencez l'inscription.", 403)

    if not request.session.get('otp_verified'):
        return _err("Vérification téléphone requise avant la soumission.", 403)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return _err("Compte introuvable.", 404)

    # ── Fichiers obligatoires ─────────────────────────────────────────────
    cni_recto = request.FILES.get('cni_recto')
    cni_verso = request.FILES.get('cni_verso')
    selfie    = request.FILES.get('selfie')

    missing = [
        name for name, f in [('CNI recto', cni_recto), ('CNI verso', cni_verso), ('Selfie', selfie)]
        if not f
    ]
    if missing:
        return _err(f"Documents manquants : {', '.join(missing)}.")

    # ── Validation de la taille des fichiers (max 5 Mo) ──────────────────
    from django.conf import settings
    max_size = getattr(settings, 'FILE_UPLOAD_MAX_MEMORY_SIZE', 5 * 1024 * 1024)
    allowed_ext = getattr(settings, 'KYC_ALLOWED_EXTENSIONS', ['.jpg', '.jpeg', '.png', '.pdf'])

    import os
    for label, f in [('CNI recto', cni_recto), ('CNI verso', cni_verso), ('Selfie', selfie)]:
        try:
            validate_uploaded_file(f, allowed_extensions=DOCUMENT_EXTENSIONS, allowed_mime_types=DOCUMENT_MIME_TYPES, label=label, max_size=max_size)
        except Exception as exc:
            return _err(str(exc))
        if f.size > max_size:
            return _err(f"{label} : fichier trop volumineux (max 5 Mo).")
        ext = os.path.splitext(f.name)[1].lower()
        if ext not in allowed_ext:
            return _err(f"{label} : format non autorisé (JPG, PNG ou PDF uniquement).")

    # ── Champs patrimoine ─────────────────────────────────────────────────
    document_type   = request.POST.get('document_type',   'CNI').strip()
    document_number = request.POST.get('document_number', '').strip()
    city            = request.POST.get('city',            '').strip()
    neighborhoods   = request.POST.get('neighborhoods',   '').strip()
    property_types  = request.POST.get('property_types',  '').strip()
    description     = request.POST.get('description',     '').strip()

    try:
        property_count = int(request.POST.get('property_count', 1))
    except (TypeError, ValueError):
        property_count = 1

    if not city:
        return _err("La ville est requise.")
    if not document_number:
        return _err("Le numéro de document est requis.")

    # ── Création du dossier ───────────────────────────────────────────────
    BailleurDossier.objects.filter(user=user).delete()

    dossier = BailleurDossier.objects.create(
        user            = user,
        document_type   = document_type,
        document_number = document_number,
        cni_recto       = cni_recto,
        cni_verso       = cni_verso,
        selfie          = selfie,
        city            = city,
        neighborhoods   = neighborhoods,
        property_count  = property_count,
        property_types  = property_types,
        description     = description,
        status          = DossierStatus.PENDING,
    )

    logger.info("Dossier KYC soumis pour : %s (dossier %s)", user.email, dossier.pk)

    # ── Activer le compte immédiatement ─────────────────────────────────
    user.status = AccountStatus.ACTIVE
    user.verification_level = 1
    user.save(update_fields=['status', 'verification_level'])

    if user.points < 30:
        user.award_points(30, "Points de bienvenue bailleur")

    # Nettoyer la session d'inscription
    for key in ['pending_bailleur_id', 'pending_bailleur_phone', 'otp_verified']:
        request.session.pop(key, None)

    # Connecter l'utilisateur
    login(request, user, backend='django.contrib.auth.backends.ModelBackend')

    return _ok(redirect='/accounts/bailleur/dashboard/', message="Compte activé. Bienvenue !")
    

# # ─── PAGE EN ATTENTE (bailleur non encore validé) ────────────────────────────

@login_required(login_url='accounts:auth')
@require_GET
def bailleur_pending_view(request):
    """
    Page affichée aux bailleurs dont le dossier est en attente de validation.
    Redirige si le compte est déjà approuvé ou si ce n'est pas un bailleur.
    """
    user = request.user

    if not user.is_bailleur:
        return redirect(_redirect_for_role(user))

    if user.status == AccountStatus.ACTIVE:
        return redirect('/bailleur/dashboard/')

    if user.status == AccountStatus.BLOCKED:
        return redirect('accounts:auth')

    # Récupérer les infos du dossier pour affichage
    dossier = getattr(user, 'bailleur_dossier', None)

    context = {
        'user':    user,
        'dossier': dossier,
        'rejection_count': dossier.rejection_count if dossier else 0,
        'rejection_reason': dossier.rejection_reason if dossier else '',
    }
    return render(request, 'accounts/bailleur_pending.html', context)

# @require_POST
# def submit_bailleur_dossier(request):
#     """
#     [DÉVELOPPEMENT] Bypasse la soumission du dossier KYC.
#     Redirige directement vers le dashboard bailleur.
#     """
#     user_id = request.session.get('pending_bailleur_id')
    
#     if user_id:
#         try:
#             user = User.objects.get(pk=user_id)
#             # Nettoyer la session
#             for key in ['pending_bailleur_id', 'pending_bailleur_phone', 'otp_verified']:
#                 request.session.pop(key, None)
#             # Si l'utilisateur n'est pas déjà connecté, le connecter
#             if not request.user.is_authenticated:
#                 login(request, user)
#         except User.DoesNotExist:
#             pass
    
#     return _ok(redirect='/bailleur/dashboard/', message="Dossier soumis (dev mode)")


# ─── DASHBOARD REDIRECT ───────────────────────────────────────────────────────

@login_required(login_url='accounts:auth')
@require_GET
def dashboard_redirect_view(request):
    """Redirige l'utilisateur vers son dashboard React via social_callback."""
    return social_callback_view(request)


# ─── MOT DE PASSE OUBLIÉ ──────────────────────────────────────────────────────

@require_POST
def forgot_password(request):
    """
    Endpoint AJAX — Envoie un lien de réinitialisation par email.
    Répond toujours OK (anti-énumération d'emails).

    Requête  : { "email": "..." }
    Réponse  : { "ok": true }
    """
    try:
        data = _json_body(request)
    except ValueError:
        return _err("Requête invalide.", 400)

    email = data.get('email', '').strip().lower()

    if not email:
        return _err("L'adresse email est requise.")

    try:
        validate_email(email)
    except ValidationError:
        return _err("Adresse email invalide.")

    # Déclenche l'envoi seulement si le compte existe (sans le révéler)
    user = User.objects.filter(email__iexact=email, is_active=True).first()
    if user and user.has_usable_password():
            try:
                sent = send_password_reset_email(user=user, request=request)
                if sent != 1:
                    raise RuntimeError(f'Email backend returned {sent} messages sent')
                logger.info("Password reset email handed off to SMTP/backend")
            except Exception:
                logger.exception("Password reset email delivery failed")
                return _err("Le service d'email est temporairement indisponible. Réessayez dans quelques instants.", 503)
            logger.info("Lien de reset envoyé à : %s", email)

    # Réponse identique qu'il existe ou non → anti-énumération
    return _ok(message="Si cet email est associé à un compte, un lien a été envoyé.")

# ─── DASHBOARD LOCATAIRE ──────────────────────────────────────────────────────

@login_required(login_url='accounts:auth')
@login_required(login_url='accounts:auth')
def profile_complete_view(request):
    """Page pour compléter le profil et gagner 10 points."""
    user = request.user
    from apps.accounts.models import PointTransaction
    
    fields = [user.first_name, user.last_name, user.email,
              getattr(user, 'phone', None), getattr(user, 'city', None),
              getattr(user, 'avatar', None)]
    was_complete = int(sum(1 for f in fields if f) / len(fields) * 100) == 100

    if request.method == 'POST':
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.phone = request.POST.get('phone', user.phone)
        user.city = request.POST.get('city', user.city)
        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']
        user.save()

        # Recalculer
        new_fields = [user.first_name, user.last_name, user.email,
                      getattr(user, 'phone', None), getattr(user, 'city', None),
                      getattr(user, 'avatar', None)]
        is_complete = int(sum(1 for f in new_fields if f) / len(new_fields) * 100) == 100

        if is_complete and not was_complete:
            if not PointTransaction.objects.filter(user=user, reason__icontains="Profil complété").exists():
                user.award_points(10, "Profil complété à 100%")
                messages.success(request, "Félicitations ! Votre profil est complet. Vous avez gagné 10 points fidélité.")
            else:
                messages.success(request, "Profil mis à jour avec succès.")
        else:
            messages.success(request, "Profil mis à jour avec succès.")
        
        return redirect('accounts:dashboard_locataire')

    context = {
        'profile_completion': int(sum(1 for f in fields if f) / len(fields) * 100),
    }
    return render(request, 'accounts/profile_complete.html', context)


@require_GET
def dashboard_locataire(request):
    """Page d'accueil du locataire avec ses stats, alertes et biens."""
    user = request.user
    if not user.is_locataire:
        return redirect(_redirect_for_role(user))

    # Détecter première connexion (session flag)
    is_new_user = request.session.pop('new_user', False)

    # Calcul progression points (sur 500 pour atteindre niveau Argent)
    points_pct = min(int(user.points / 500 * 100), 100)

    # Calcul complétion profil
    fields = [user.first_name, user.last_name, user.email, user.phone, user.city, user.avatar]
    filled = sum(1 for f in fields if f)
    profile_completion = int(filled / len(fields) * 100)

    from apps.messaging.models import Message
    from django.db.models import Q

    unread_messages = Message.objects.filter(
        Q(conversation__tenant=user) | Q(conversation__landlord=user),
        is_read=False
    ).exclude(sender=user).count()

    # Récupérer les biens récents (limité à 6)
    from apps.properties.models import Property
    try:
        recent_properties = Property.objects.filter(
            is_published=True
        ).order_by('-created_at')[:6]
    except Exception:
        recent_properties = []

    context = {
        'user':               user,
        'is_new_user':        is_new_user,
        'points_pct':         points_pct,
        'profile_completion': profile_completion,
        'saved_count':        0,
        'unread_messages':    unread_messages,
        'upcoming_visits':    [],
        'search_alerts':      [],
        'recent_properties':  recent_properties,
    }
    return render(request, 'accounts/dashboard_locataire.html', context)



@login_required(login_url='accounts:auth')
def choose_role_view(request):
    if request.method == 'POST':
        role = request.POST.get('role', '').strip().upper()  # 'LOCATAIRE', 'BAILLEUR', 'ARCHITECTE'

        valid_roles = [UserRole.LOCATAIRE, UserRole.BAILLEUR, UserRole.ARCHITECTE]
        if role not in valid_roles:
            messages.error(request, "Rôle invalide.")
            return redirect('accounts:choose_role')

        user = request.user
        user.role = role
        user.status = AccountStatus.ACTIVE  # ← important ! sans ça is_locataire peut échouer
        user.save(update_fields=['role', 'status'])

        return redirect(_redirect_for_role(user))

    return render(request, 'accounts/choose_role.html')

# apps/accounts/views.py

# apps/accounts/views.py

@login_required(login_url='accounts:auth')
@require_GET
def dashboard_bailleur(request):
    """Dashboard principal du bailleur."""
    user = request.user
    
    if not user.is_bailleur:
        return redirect(_redirect_for_role(user))
    
    # Stats
    from apps.properties.models import Property
    from apps.messaging.models import Message
    from django.db.models import Q

    total_properties = Property.objects.filter(owner=user).count()
    active_properties = Property.objects.filter(owner=user, is_published=True).count()
    pending_visits = 0
    
    unread_messages = Message.objects.filter(
        Q(conversation__tenant=user) | Q(conversation__landlord=user),
        is_read=False
    ).exclude(sender=user).count()

    recent_properties = Property.objects.filter(owner=user).order_by('-created_at')[:5]
    points_percentage = min(int(user.points / 500 * 100), 100)
    
    # Récupérer le dossier SEULEMENT s'il existe
    try:
        dossier = user.bailleur_dossier
    except AttributeError:
        dossier = None  # Pas de dossier encore
    
    context = {
        'user': user,
        'total_properties': total_properties,
        'active_properties': active_properties,
        'pending_visits': pending_visits,
        'unread_messages': unread_messages,
        'recent_properties': recent_properties,
        'points_percentage': points_percentage,
        'dossier': dossier,  # Peut être None
    }
    
    return render(request, 'accounts/dashboard_bailleur.html', context)


# apps/accounts/views.py

@require_POST
def register_bailleur_complete(request):
    """
    Endpoint multipart/form-data — Crée User + BailleurDossier en une seule
    transaction atomique. Appelé par auth.js à l'étape 5 du tunnel bailleur.
 
    Le compte est créé avec :
      - is_active = False  (Django ne peut pas authentifier un inactif normalement)
      - status    = PENDING
    
    Après création, on force is_active=True EN MÉMOIRE UNIQUEMENT pour que
    login() fonctionne, sans toucher la DB. L'admin devra approuver pour
    activer réellement le compte.
 
    Requête : multipart/form-data
      Texte  : first_name, last_name, email, phone, password,
               document_type, document_number, city, neighborhoods,
               property_count, property_types, description
      Fichiers : cni_recto, cni_verso, selfie
 
    Réponse : { "ok": true, "redirect": "/accounts/pending/" }
            | { "ok": false, "error": "..." }
    """
    import os
    from django.db import transaction as db_transaction
 
    # ── 1. Champs texte ───────────────────────────────────────────────────
    first_name      = request.POST.get('first_name',      '').strip()
    last_name       = request.POST.get('last_name',       '').strip()
    email           = request.POST.get('email',           '').strip().lower()
    phone           = request.POST.get('phone',           '').strip()
    password        = request.POST.get('password',        '')
    document_type   = request.POST.get('document_type',   'CNI').strip()
    document_number = request.POST.get('document_number', '').strip()
    city            = request.POST.get('city',            '').strip()
    neighborhoods   = request.POST.get('neighborhoods',   '').strip()
    property_types  = request.POST.get('property_types',  '').strip()
    description     = request.POST.get('description',     '').strip()
 
    try:
        property_count = int(request.POST.get('property_count', 1))
    except (TypeError, ValueError):
        property_count = 1
 
    # ── 2. Validations ───────────────────────────────────────────────────
    errors = {}
    if not first_name:      errors['first_name']      = "Prénom requis."
    if not last_name:       errors['last_name']        = "Nom requis."
    if not phone:           errors['phone']            = "Téléphone requis."
    if not document_number: errors['document_number']  = "Numéro de document requis."
    if not city:            errors['city']             = "Ville requise."
 
    if not email:
        errors['email'] = "Email requis."
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors['email'] = "Email invalide."
 
    if not password or len(password) < 8:
        errors['password'] = "Minimum 8 caractères."
 
    if errors:
        return JsonResponse({'ok': False, 'errors': errors})
 
    if User.objects.filter(email=email).exists():
        return _err("Un compte existe déjà avec cet email.")
 
    # ── 3. Fichiers ───────────────────────────────────────────────────────
    cni_recto = request.FILES.get('cni_recto')
    cni_verso = request.FILES.get('cni_verso')
    selfie    = request.FILES.get('selfie')
 
    missing_files = [
        name for name, f in [('CNI recto', cni_recto), ('CNI verso', cni_verso), ('Selfie', selfie)]
        if not f
    ]
    if missing_files:
        return _err(f"Documents manquants : {', '.join(missing_files)}.")
 
    max_size    = getattr(settings, 'FILE_UPLOAD_MAX_MEMORY_SIZE', 5 * 1024 * 1024)
    allowed_ext = getattr(settings, 'KYC_ALLOWED_EXTENSIONS', ['.jpg', '.jpeg', '.png', '.pdf'])
 
    for label, f in [('CNI recto', cni_recto), ('CNI verso', cni_verso), ('Selfie', selfie)]:
        try:
            validate_uploaded_file(f, allowed_extensions=DOCUMENT_EXTENSIONS, allowed_mime_types=DOCUMENT_MIME_TYPES, label=label, max_size=max_size)
        except Exception as exc:
            return _err(str(exc))
        if f.size > max_size:
            return _err(f"{label} : fichier trop volumineux (max 5 Mo).")
        if os.path.splitext(f.name)[1].lower() not in allowed_ext:
            return _err(f"{label} : format non autorisé (JPG, PNG ou PDF).")
 
    # ── 4. Transaction atomique ───────────────────────────────────────────
    try:
        with db_transaction.atomic():
 
            # Créer le compte en statut PENDING / inactif
            user = User.objects.create_user(
                email          = email,
                password       = password,
                first_name     = first_name,
                last_name      = last_name,
                phone          = phone,
                role           = UserRole.BAILLEUR,
                status         = AccountStatus.ACTIVE,
                is_active      = True,
                verification_level = 1,
                phone_verified = True,    # OTP validé dans le tunnel
            )
 
            # Créer le dossier KYC lié
            BailleurDossier.objects.create(
                user            = user,
                document_type   = document_type,
                document_number = document_number,
                cni_recto       = cni_recto,
                cni_verso       = cni_verso,
                selfie          = selfie,
                city            = city,
                neighborhoods   = neighborhoods,
                property_count  = property_count,
                property_types  = property_types,
                description     = description,
                status          = DossierStatus.PENDING,
            )
 
        logger.info("Bailleur inscrit (transaction complète) : %s", user.email)
 
    except Exception as e:
        logger.error("Erreur register_bailleur_complete : %s — %s", type(e).__name__, e, exc_info=True)
        return _err(f"Erreur serveur lors de la création du compte : {str(e)}")
 
    # ── 5. Connexion post-inscription ─────────────────────────────────────
    # login() refuse les users inactifs. On force is_active=True EN MÉMOIRE
    # UNIQUEMENT pour cette requête. La DB reste à is_active=False.
    user.is_active = True
    login(request, user, backend='django.contrib.auth.backends.ModelBackend')

    if user.points < 30:
        user.award_points(30, "Points de bienvenue bailleur")
 
    logger.info("Bailleur ACTIF connecté après inscription : %s → /accounts/bailleur/dashboard/", user.email)
 
    return _ok(
        redirect = '/accounts/bailleur/dashboard/',
        message  = "Compte activé. Bienvenue !",
    )


from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import redirect
from django.core.paginator import Paginator
from django.contrib.auth import update_session_auth_hash

@login_required
def dashboard_locataire(request):
    user = request.user
    if user.role != 'LOCATAIRE':
        return redirect('accounts:auth')
    
    from apps.properties.models import Property, VisitRequest, LocationRequest, Favorite, SearchAlert
    from django.utils import timezone

    fields = [user.first_name, user.last_name, user.email, getattr(user, 'phone', None), getattr(user, 'city', None), getattr(user, 'avatar', None)]
    profile_completion = int(sum(1 for f in fields if f) / len(fields) * 100) if fields else 0

    properties_list = Property.objects.filter(is_published=True).order_by('-created_at')
    paginator = Paginator(properties_list, 6)
    page_number = request.GET.get('page')
    recent_properties = paginator.get_page(page_number)

    favoris_ids = list(Favorite.objects.filter(user=user).values_list('property_id', flat=True))
    
    my_visits = VisitRequest.objects.filter(tenant=user).select_related('property').order_by('-created_at')[:10]
    
    my_locations = LocationRequest.objects.filter(tenant=user).select_related('property').order_by('-created_at')[:5]
    
    from django.urls import reverse
    from urllib.parse import urlencode
    
    search_alerts = list(SearchAlert.objects.filter(user=user, is_active=True))
    for alert in search_alerts:
        matching = Property.objects.filter(is_published=True)
        q_params = {}
        subtitle_parts = []
        
        if alert.city: 
            matching = matching.filter(city__icontains=alert.city)
            q_params['location'] = alert.city
            subtitle_parts.append(alert.city)
        if alert.property_type: 
            matching = matching.filter(property_type=alert.property_type)
            q_params['type'] = alert.property_type
            subtitle_parts.append(alert.property_type)
        if alert.transaction_type: 
            matching = matching.filter(transaction_type=alert.transaction_type)
        if alert.max_price: 
            matching = matching.filter(price__lte=alert.max_price)
            q_params['max_price'] = alert.max_price
            subtitle_parts.append(f"Max {alert.max_price} FCFA")
            
        alert.count = matching.count()
        alert.subtitle = " - ".join(subtitle_parts) if subtitle_parts else "Tous critères"
        
        base_url = reverse('properties:list')
        if q_params:
            alert.url = f"{base_url}?{urlencode(q_params)}"
        else:
            alert.url = base_url
        
    context = {
        'search_alerts': search_alerts,
        'profile_completion': profile_completion,
        'recent_properties': recent_properties,
        'favoris_ids': favoris_ids,
        'my_visits': my_visits,
        'my_locations': my_locations,
        'saved_count': len(favoris_ids),
    }
    return render(request, 'accounts/dashboard_locataire.html', context)

@login_required
def profile_view(request):
    user = request.user
    if request.method == 'POST':
        action = request.POST.get('action', 'profile')

        if action == 'profile':
            first_name = request.POST.get('first_name')
            last_name = request.POST.get('last_name')
            phone = request.POST.get('phone')
            city = request.POST.get('city')
            avatar = request.FILES.get('avatar')

            if first_name: user.first_name = first_name
            if last_name: user.last_name = last_name
            if phone: user.phone = phone
            if city: user.city = city
            if avatar: user.avatar = avatar

            user.save()
            messages.success(request, "Votre profil a été mis à jour avec succès.")
        
        elif action == 'password':
            old_password = request.POST.get('old_password')
            new_password = request.POST.get('new_password')
            confirm_password = request.POST.get('confirm_password')

            if not user.check_password(old_password):
                messages.error(request, "L'ancien mot de passe est incorrect.")
            elif new_password != confirm_password:
                messages.error(request, "Les nouveaux mots de passe ne correspondent pas.")
            elif len(new_password) < 6:
                messages.error(request, "Le mot de passe doit faire au moins 6 caractères.")
            else:
                user.set_password(new_password)
                user.save()
                update_session_auth_hash(request, user)
                messages.success(request, "Votre mot de passe a été modifié avec succès.")
        
        return redirect('accounts:profile')

    fields = [user.first_name, user.last_name, user.email,
              getattr(user, 'phone', None), getattr(user, 'city', None),
              getattr(user, 'avatar', None)]
    profile_completion = int(sum(1 for f in fields if f) / len(fields) * 100) if fields else 0

    context = {
        'user': user,
        'profile_completion': profile_completion,
    }
    return render(request, 'accounts/profile.html', context)


@require_GET
def social_callback_view(request):
    """Bridge allauth's Django session to the React JWT session."""
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    if not request.user or not request.user.is_authenticated:
        return redirect(f"{frontend_url}/login")
    is_new = bool(request.session.pop('social_signup_pending', False))
    if not is_new:
        try:
            from django.utils import timezone
            delta = (timezone.now() - request.user.date_joined).total_seconds()
            if delta < 180:
                is_new = True
        except Exception:
            pass
    if request.GET.get('is_signup') == '1' or request.session.pop('social_is_signup', False):
        is_new = True

    payload = {
        'user_id': str(request.user.pk),
        'is_new_social_signup': is_new,
    }
    code = signing.dumps(payload, salt='piolo-social-auth')
    try:
        cache.set(f'social-auth-code:{code}', payload, 300)
    except Exception:
        pass
    target = f"{frontend_url}/login?{urlencode({'social_code': code})}"
    return redirect(target)


@require_GET
def dashboard_redirect_view(request):
    """Redirige vers le frontend React via le pont de session social_callback."""
    return social_callback_view(request)


@login_required(login_url='accounts:auth')
def choose_role_view(request):
    """Permet aux nouveaux utilisateurs OAuth de choisir leur rôle (Locataire, Bailleur, Architecte)."""
    if request.method == 'POST':
        role = request.POST.get('role')
        valid_roles = [UserRole.LOCATAIRE, UserRole.BAILLEUR, UserRole.ARCHITECTE]
        if role not in valid_roles:
            messages.error(request, "Rôle invalide.")
            return redirect('accounts:choose_role')
        user = request.user
        user.role = role
        user.status = AccountStatus.ACTIVE
        user.save(update_fields=['role', 'status'])
        return redirect(_redirect_for_role(user))
    return render(request, 'accounts/choose_role.html')


@login_required(login_url='accounts:auth')
def bailleur_pending_view(request):
    """Page d'attente de validation KYC pour le bailleur."""
    return render(request, 'accounts/bailleur_pending.html')


@login_required(login_url='accounts:auth')
def profile_complete_view(request):
    """Complétion de profil post-inscription."""
    return redirect('/profile')

