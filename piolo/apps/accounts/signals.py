# apps/accounts/signals.py
"""
Signaux Django pour l'app accounts.

SIGNAUX :
  1. CustomUser  post_save  → points de bienvenue à la création
  2. BailleurDossier pre_save  → mémorise l'ancien statut
  3. BailleurDossier post_save → sync user + email si statut a changé
  4. social_account_added    → flag session inscription sociale (allauth optionnel)

POURQUOI pre_save + post_save :
  Dans post_save, l'instance a déjà le NOUVEAU statut en DB.
  Faire .objects.get() dans post_save lirait ce même nouveau statut → pas de diff.
  On utilise pre_save pour capturer l'ANCIEN statut avant écriture.
"""

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.utils.html import strip_tags

# allauth optionnel
try:
    from allauth.socialaccount.signals import social_account_added
    ALLAUTH_AVAILABLE = True
except ImportError:
    ALLAUTH_AVAILABLE = False

from .models import AccountStatus, BailleurDossier, CustomUser, DossierStatus, UserRole

logger = logging.getLogger('apps.accounts')

# Stockage de l'ancien statut entre pre_save et post_save
_dossier_old_status: dict[str, str | None] = {}


# ══════════════════════════════════════════════════════════════════════════════
# 1 — POINTS DE BIENVENUE & EMAIL DE BIENVENUE (Locataire / Bailleur / Pro)
# ══════════════════════════════════════════════════════════════════════════════

@receiver(post_save, sender=CustomUser)
def award_welcome_points(sender, instance, created, **kwargs):
    """
    Crédite les points de bienvenue et déclenche l'envoi de l'email
    de bienvenue personnalisé selon le rôle à la création du compte.
    """
    if not created:
        return

    # 1. Attribution des points selon le rôle
    bonus = 0
    reason = ""
    if instance.role == UserRole.BAILLEUR:
        bonus = getattr(settings, 'POINTS_CONFIG', {}).get('BAILLEUR_SIGNUP_POINTS', 45)
        reason = "Points de base — Inscription Bailleur"
    elif instance.status == AccountStatus.ACTIVE and instance.role in (UserRole.LOCATAIRE, UserRole.ARCHITECTE):
        bonus = getattr(settings, 'POINTS_CONFIG', {}).get('WELCOME_BONUS', 50)
        reason = "Points de bienvenue à l'inscription"

    if bonus > 0:
        try:
            instance.award_points(bonus, reason)
            logger.info("Points bienvenue crédités : %s (%s) → +%d pts", instance.email, instance.role, bonus)
        except Exception as e:
            logger.error("Erreur points bienvenue %s : %s", instance.email, e)

    # 2. Envoi automatique de l'email de bienvenue
    try:
        from apps.notifications.email_service import send_welcome_email
        user_copy = instance
        transaction.on_commit(lambda: send_welcome_email(user_copy))
        logger.info("Planification de l'email de bienvenue pour %s (%s)", instance.email, instance.role)
    except Exception as e:
        logger.error("Échec lors de la planification de l'email de bienvenue pour %s : %s", instance.email, e)


# ══════════════════════════════════════════════════════════════════════════════
# 2 — CAPTURE ancien statut BailleurDossier (pre_save)
# ══════════════════════════════════════════════════════════════════════════════

@receiver(pre_save, sender=BailleurDossier)
def capture_dossier_old_status(sender, instance, **kwargs):
    """
    Mémorise le statut AVANT la sauvegarde pour détecter le changement
    dans post_save. Sans ça, dans post_save on lirait déjà le nouveau statut.
    """
    if instance.pk:
        try:
            old = BailleurDossier.objects.get(pk=instance.pk)
            _dossier_old_status[str(instance.pk)] = old.status
        except BailleurDossier.DoesNotExist:
            _dossier_old_status[str(instance.pk)] = None
    else:
        # Nouvelle instance (création) — pas encore de pk, on utilise id(instance)
        _dossier_old_status[str(id(instance))] = None


# ══════════════════════════════════════════════════════════════════════════════
# 3 — SYNC user + EMAIL après changement statut dossier (post_save)
# ══════════════════════════════════════════════════════════════════════════════

@receiver(post_save, sender=BailleurDossier)
def sync_bailleur_on_dossier_change(sender, instance, created, **kwargs):
    """
    Synchronise automatiquement user.status + user.is_active + user.is_verified
    et envoie l'email de décision quand le statut du dossier KYC change.

    Déclenché que ce soit via les boutons admin, une action en masse,
    ou une modification manuelle du champ 'status'.

    Mapping :
      APPROVED  → user.status=ACTIVE,  is_active=True,  is_verified=True + email approbation
      REJECTED  → user.status=PENDING, is_active=False              + email rejet
      REJECTED (≥3 rejets) → user.status=BLOCKED, is_active=False  + email blocage
      SUSPENDED → user.status=SUSPENDED, is_active=False
      PENDING   → user.status=PENDING, is_active=False
    """
    if created:
        return  # Pas d'action à la première création du dossier

    # Récupérer l'ancien statut mémorisé par pre_save
    old_status = _dossier_old_status.pop(str(instance.pk), None)
    new_status = instance.status

    # Pas de changement → rien à faire
    if old_status == new_status:
        return

    user = instance.user
    logger.info(
        "Dossier KYC %s : %s → %s (user: %s)",
        instance.pk, old_status, new_status, user.email,
    )

    # ── Mise à jour du compte utilisateur ────────────────────────────────
    update_fields = []

    if new_status == DossierStatus.APPROVED:
        user.status      = AccountStatus.ACTIVE
        user.is_active   = True
        user.verification_level = 2
        update_fields    = ['status', 'is_active', 'verification_level']

        # Points de bienvenue bailleur (si pas déjà crédités)
        bonus = getattr(settings, 'POINTS_CONFIG', {}).get('BAILLEUR_WELCOME', 10)
        already = user.point_transactions.filter(reason__icontains="bienvenue").exists()
        if bonus > 0 and not already:
            try:
                user.award_points(bonus, "Points de bienvenue — Bailleur vérifié")
                logger.info("Points bailleur crédités : %s → +%d pts", user.email, bonus)
            except Exception as e:
                logger.error("Erreur points bailleur %s : %s", user.email, e)

        _send_bailleur_email(instance, approved=True)
        try:
            from apps.notifications.whatsapp_service import send_bailleur_kyc_status_whatsapp
            dossier_copy = instance
            transaction.on_commit(lambda: send_bailleur_kyc_status_whatsapp(dossier_copy, approved=True))
        except Exception as e:
            logger.error("Erreur notification WhatsApp bailleur approuvé : %s", e)

    elif new_status == DossierStatus.REJECTED:
        max_rej = getattr(settings, 'BAILLEUR_CONFIG', {}).get('MAX_REJECTIONS', 3)

        if instance.rejection_count >= max_rej:
            user.status    = AccountStatus.BLOCKED
            user.is_active = False
        else:
            user.status    = AccountStatus.PENDING
            user.is_active = False

        update_fields = ['status', 'is_active']
        _send_bailleur_email(instance, approved=False)
        try:
            from apps.notifications.whatsapp_service import send_bailleur_kyc_status_whatsapp
            dossier_copy = instance
            transaction.on_commit(lambda: send_bailleur_kyc_status_whatsapp(dossier_copy, approved=False))
        except Exception as e:
            logger.error("Erreur notification WhatsApp bailleur rejeté : %s", e)

    elif new_status == DossierStatus.SUSPENDED:
        user.status    = AccountStatus.SUSPENDED
        user.is_active = False
        update_fields  = ['status', 'is_active']

    elif new_status == DossierStatus.PENDING:
        user.status    = AccountStatus.PENDING
        user.is_active = False
        update_fields  = ['status', 'is_active']

    # Écriture en DB (via .filter().update() pour éviter de boucler sur post_save)
    if update_fields:
        try:
            CustomUser.objects.filter(pk=user.pk).update(
                **{f: getattr(user, f) for f in update_fields}
            )
            logger.info("User %s mis à jour : %s", user.email,
                        {f: getattr(user, f) for f in update_fields})
        except Exception as e:
            logger.error("Erreur sync user %s : %s", user.email, e)


# ── Helper email ─────────────────────────────────────────────────────────────

def _send_bailleur_email(dossier: BailleurDossier, approved: bool) -> None:
    """Envoie l'email de décision (approbation ou rejet) au bailleur."""
    user = dossier.user
    site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
    max_rej  = getattr(settings, 'BAILLEUR_CONFIG', {}).get('MAX_REJECTIONS', 3)

    if approved:
        subject  = "🎉 Votre compte Bailleur Piolo est activé !"
        template = 'emails/bailleur_approved.html'
        ctx = {
            'user':          user,
            'dossier':       dossier,
            'bonus':         getattr(settings, 'POINTS_CONFIG', {}).get('BAILLEUR_WELCOME', 10),
            'site_url':      site_url,
            'dashboard_url': f"{site_url}/dashboard/bailleur",
        }
    else:
        blocked  = dossier.rejection_count >= max_rej
        subject  = ("⛔ Compte Piolo bloqué définitivement"
                    if blocked else
                    "📋 Votre dossier Piolo nécessite des corrections")
        template = 'emails/bailleur_rejected.html'
        ctx = {
            'user':         user,
            'dossier':      dossier,
            'remaining':    max(0, max_rej - dossier.rejection_count),
            'blocked':      blocked,
            'site_url':     site_url,
            'resubmit_url': f"{site_url}/login",
        }

    try:
        html_body    = render_to_string(template, ctx)
        plain_body   = strip_tags(html_body)
        from_email   = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@piolo.cm')

        send_mail(
            subject        = subject,
            message        = plain_body,
            from_email     = from_email,
            recipient_list = [user.email],
            html_message   = html_body,
            fail_silently  = False,
        )
        logger.info("Email '%s' envoyé à %s", subject, user.email)
    except Exception as e:
        # Ne jamais faire échouer le signal pour un email raté
        logger.error("Échec envoi email à %s : %s", user.email, e)


# ══════════════════════════════════════════════════════════════════════════════
# 4 — SOCIAL LOGIN (allauth optionnel)
# ══════════════════════════════════════════════════════════════════════════════

if ALLAUTH_AVAILABLE:
    @receiver(social_account_added)
    def set_social_signup_flag(request, sociallogin, **kwargs):
        """
        Marque la session si c'est une première connexion via Google/Facebook.
        Utile pour afficher un message de bienvenue et rediriger vers choose_role.
        """
        if sociallogin.account.provider in ('google', 'facebook'):
            request.session['social_signup_pending'] = True
            request.session['social_provider']       = sociallogin.account.provider


# ══════════════════════════════════════════════════════════════════════════════
# 5 — JOURNALISATION DES CONNEXIONS (Live Traffic Audit Log)
# ══════════════════════════════════════════════════════════════════════════════

from django.contrib.auth.signals import user_logged_in, user_login_failed
from .models import AuditLog

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    try:
        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '')) if request else ''
        ua = request.META.get('HTTP_USER_AGENT', '') if request else ''
        AuditLog.objects.create(
            user=user,
            email=user.email,
            action='CONNEXION_SUCCES',
            details=f"Connexion réussie pour {user.email} ({user.role}).",
            ip_address=str(ip)[:45],
            user_agent=str(ua)[:255]
        )
    except Exception as e:
        logger.error("Error logging login success: %s", e)

@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    try:
        email = credentials.get('email', credentials.get('username', 'Anonyme')) if credentials else 'Anonyme'
        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '')) if request else ''
        ua = request.META.get('HTTP_USER_AGENT', '') if request else ''
        AuditLog.objects.create(
            user=None,
            email=str(email)[:255],
            action='CONNEXION_ECHEC',
            details=f"Échec de tentative de connexion pour l'identifiant {email}.",
            ip_address=str(ip)[:45],
            user_agent=str(ua)[:255]
        )
    except Exception as e:
        logger.error("Error logging login failure: %s", e)
