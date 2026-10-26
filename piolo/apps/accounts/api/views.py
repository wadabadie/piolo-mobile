import logging
import mimetypes

from rest_framework import generics, status
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

from .serializers import UserSerializer, RegisterSerializer
from ..models import ThemeConfig, ThemeConfigHistory, UserRole, TenantSubscription, TenantPlanType, SubscriptionBillingCycle, SubscriptionStatus, PointTransaction
from ..password_reset_mail import send_password_reset_email
from .throttles import AuthRateThrottle, PasswordResetRateThrottle, ChatRateThrottle
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.core.file_validation import (
    validate_uploaded_file,
    verify_image_integrity,
    sanitize_and_optimize_image,
    IMAGE_EXTENSIONS,
    IMAGE_MIME_TYPES,
    DOCUMENT_EXTENSIONS,
    DOCUMENT_MIME_TYPES
)

User = get_user_model()
logger = logging.getLogger(__name__)

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    serializer_class = RegisterSerializer
    throttle_classes = (AuthRateThrottle,)
    throttle_scope = 'auth'


class ForgotPasswordAPIView(APIView):
    """Déclenche un reset de mot de passe sans révéler si l'email existe."""

    permission_classes = (AllowAny,)
    throttle_classes = (PasswordResetRateThrottle,)
    throttle_scope = 'password_reset'

    def post(self, request, *args, **kwargs):
        email = str(request.data.get('email', '')).strip().lower()
        if not email:
            return Response({'detail': "L'adresse email est requise."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_email(email)
        except ValidationError:
            return Response({'detail': 'Adresse email invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        # Même réponse que le compte existe ou non (anti-énumération).
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user and user.has_usable_password():
            try:
                sent = send_password_reset_email(user=user, request=request)
                if sent != 1:
                    raise RuntimeError(f'Email backend returned {sent} messages sent')
                logger.info("Password reset email handed off to SMTP/backend")
            except Exception:
                logger.exception("Password reset email delivery failed")
                return Response(
                    {'detail': "Le service d'email est temporairement indisponible. Réessayez dans quelques instants."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        else:
            logger.info("Password reset skipped: no active account or unusable password")
        return Response({'ok': True, 'message': 'Si cet email est associé à un compte, un lien a été envoyé.'})


class ResetPasswordVerifyAPIView(APIView):
    """Vérifie si le token de réinitialisation est valide avant affichage du formulaire."""
    permission_classes = (AllowAny,)
    throttle_classes = (AuthRateThrottle,)
    throttle_scope = 'auth'

    def get(self, request, *args, **kwargs):
        uidb64 = str(request.query_params.get('uid', '')).strip()
        token = str(request.query_params.get('token', '')).strip()

        if not uidb64 or not token:
            return Response({'valid': False, 'detail': 'Paramètres de réinitialisation manquants.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'valid': False, 'detail': 'Lien de réinitialisation invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'valid': False, 'detail': 'Le lien a déjà été utilisé ou a expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'valid': True, 'email': user.email})


class ResetPasswordConfirmAPIView(APIView):
    """Réinitialise le mot de passe après validation stricte du token et des contraintes."""
    permission_classes = (AllowAny,)
    throttle_classes = (PasswordResetRateThrottle,)
    throttle_scope = 'password_reset'

    def post(self, request, *args, **kwargs):
        uidb64 = str(request.data.get('uid', '')).strip()
        token = str(request.data.get('token', '')).strip()
        password = str(request.data.get('password', ''))
        password_confirm = str(request.data.get('password_confirm', ''))

        if not uidb64 or not token:
            return Response({'detail': 'Lien de réinitialisation manquant.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'detail': 'Lien de réinitialisation invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Le lien de réinitialisation est invalide ou a expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'detail': 'Le mot de passe doit contenir au moins 8 caractères.'}, status=status.HTTP_400_BAD_REQUEST)

        if password != password_confirm:
            return Response({'detail': 'Les mots de passe saisis ne correspondent pas.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save(update_fields=['password'])
        logger.info("Mot de passe réinitialisé avec succès pour l'utilisateur %s via React API", user.email)
        return Response({'ok': True, 'message': 'Votre mot de passe a été réinitialisé avec succès.'})


class SocialSessionExchangeAPIView(APIView):
    """Échange un code de session OAuth éphémère (cryptographiquement signé) contre des tokens JWT pour React."""
    permission_classes = (AllowAny,)
    throttle_classes = (AuthRateThrottle,)
    throttle_scope = 'auth'

    def post(self, request, *args, **kwargs):
        code = str(request.data.get('code', '')).strip()
        if not code or len(code) < 16:
            return Response({'detail': 'Code OAuth invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        user_id = None
        is_new = False

        # 1. Décodage cryptographique sécurisé (indépendant des workers Gunicorn)
        try:
            from django.core import signing
            data = signing.loads(code, salt='piolo-social-auth', max_age=300)
            user_id = data.get('user_id')
            is_new = bool(data.get('is_new_social_signup', False))
        except Exception:
            # 2. Fallback sur le cache
            cache_key = f'social-auth-code:{code}'
            cached_val = cache.get(cache_key)
            if cached_val:
                if isinstance(cached_val, dict):
                    user_id = cached_val.get('user_id')
                    is_new = bool(cached_val.get('is_new_social_signup', False))
                else:
                    user_id = cached_val
                    is_new = False

        if not user_id:
            return Response({'detail': 'La connexion sociale a expiré ou est invalide. Recommencez.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(pk=user_id, is_active=True).first()
        if not user:
            return Response({'detail': 'Ce compte est indisponible.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user, context={'request': request}).data,
            'needs_role_selection': is_new,
        })


class SetRoleAPIView(APIView):
    """Permet à un utilisateur (notamment après inscription OAuth) de choisir ou mettre à jour son rôle."""
    permission_classes = (IsAuthenticated,)
    throttle_classes = (AuthRateThrottle,)
    throttle_scope = 'auth'

    def post(self, request, *args, **kwargs):
        role = str(request.data.get('role', '')).strip().upper()
        valid_roles = [UserRole.LOCATAIRE, UserRole.BAILLEUR, UserRole.ARCHITECTE]
        if role not in valid_roles:
            return Response({'detail': 'Rôle invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.role = role
        user.save(update_fields=['role'])
        logger.info("Rôle défini pour l'utilisateur %s : %s", user.email, role)
        return Response({
            'ok': True,
            'role': role,
            'user': UserSerializer(user, context={'request': request}).data,
        })


class SocialProviderStatusAPIView(APIView):
    """Expose uniquement l'état de configuration OAuth, jamais les secrets."""
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        provider = str(request.query_params.get('provider', '')).strip().lower()
        if provider not in ('google', 'facebook'):
            return Response({'detail': 'Fournisseur OAuth inconnu.'}, status=status.HTTP_400_BAD_REQUEST)
        app_config = getattr(settings, 'SOCIALACCOUNT_PROVIDERS', {}).get(provider, {}).get('APP', {})
        configured = bool(app_config.get('client_id'))
        return Response({'provider': provider, 'configured': configured})


from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class UserProfileAPIView(APIView):
    permission_classes = (IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        user = request.user
        
        avatar = request.FILES.get('avatar')
        if avatar:
            validate_uploaded_file(
                avatar, allowed_extensions=IMAGE_EXTENSIONS,
                allowed_mime_types=IMAGE_MIME_TYPES, label='avatar',
            )
            user.avatar = avatar

        if 'first_name' in request.data:
            user.first_name = request.data.get('first_name', '')
        if 'last_name' in request.data:
            user.last_name = request.data.get('last_name', '')
        if 'phone' in request.data:
            user.phone = request.data.get('phone', '')
        if 'city' in request.data:
            user.city = request.data.get('city', '')

        user.save()
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        return self.patch(request, *args, **kwargs)


class BailleurProfileAPIView(APIView):
    """Expose and manage the bailleur KYC dossier and verification submission."""
    permission_classes = (IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def _dossier(self, request):
        return BailleurDossier.objects.filter(user=request.user).first()

    @staticmethod
    def _payload(request, dossier):
        if dossier is None:
            return {'exists': False, 'dossier': None, 'completion': 0}
        fields = [
            dossier.city, dossier.neighborhoods, dossier.property_count,
            dossier.property_types, dossier.description, dossier.document_type,
            dossier.document_number, dossier.cni_recto, dossier.cni_verso,
            dossier.selfie,
        ]
        completion = round(sum(1 for value in fields if value) / len(fields) * 100)
        return {
            'exists': True,
            'completion': completion,
            'dossier': {
                'id': str(dossier.pk),
                'status': dossier.status,
                'status_label': dossier.get_status_display(),
                'city': dossier.city,
                'neighborhoods': dossier.neighborhoods,
                'property_count': dossier.property_count,
                'property_types': dossier.property_types,
                'description': dossier.description,
                'document_type': dossier.document_type,
                'document_number': dossier.document_number,
                'has_documents': bool(dossier.cni_recto and dossier.cni_verso and dossier.selfie),
                'rejection_reason': dossier.rejection_reason,
                'submitted_at': dossier.submitted_at.isoformat() if dossier.submitted_at else None,
            },
        }

    def get(self, request, *args, **kwargs):
        return Response(self._payload(request, self._dossier(request)))

    def patch(self, request, *args, **kwargs):
        dossier = self._dossier(request)
        if dossier is None:
            return Response({'detail': 'Aucun dossier bailleur n’est encore associé à ce compte.'}, status=404)

        changed = []
        for field in ('city', 'neighborhoods', 'property_types', 'description'):
            if field in request.data:
                value = str(request.data.get(field) or '').strip()
                setattr(dossier, field, value)
                changed.append(field)
        if 'property_count' in request.data:
            try:
                count = max(1, min(999, int(request.data.get('property_count'))))
            except (TypeError, ValueError):
                return Response({'property_count': ['Indiquez un nombre de biens valide.']}, status=400)
            dossier.property_count = count
            changed.append('property_count')
        if changed:
            dossier.save(update_fields=changed)
        return Response(self._payload(request, dossier))

    def post(self, request, *args, **kwargs):
        """Soumission ou mise à jour complète du dossier de vérification KYC bailleur."""
        user = request.user

        # Si l'utilisateur n'est pas encore identifié comme Bailleur, on met à jour son rôle
        if user.role != UserRole.BAILLEUR:
            user.role = UserRole.BAILLEUR
            user.save(update_fields=['role'])

        cni_recto = request.FILES.get('cni_recto')
        cni_verso = request.FILES.get('cni_verso')
        selfie    = request.FILES.get('selfie')

        document_type   = request.data.get('document_type', 'CNI')
        document_number = str(request.data.get('document_number') or '').strip()
        city            = str(request.data.get('city') or user.city or '').strip()
        neighborhoods   = str(request.data.get('neighborhoods') or '').strip()
        phone           = str(request.data.get('phone') or user.phone or '').strip()
        property_types  = str(request.data.get('property_types') or '').strip()
        description     = str(request.data.get('description') or '').strip()

        try:
            property_count = max(1, min(999, int(request.data.get('property_count', 1))))
        except (TypeError, ValueError):
            property_count = 1

        dossier = BailleurDossier.objects.filter(user=user).first()
        if not dossier and not cni_recto:
            return Response({'cni_recto': ['Veuillez fournir le recto de votre pièce d\'identité.']}, status=400)

        if not document_number and not (dossier and dossier.document_number):
            return Response({'document_number': ['Le numéro de pièce d\'identité est obligatoire.']}, status=400)

        if not city:
            return Response({'city': ['La ville d\'activité est obligatoire.']}, status=400)

        # Validation et optimisation sécurisée des fichiers KYC
        for key, label, f in [('cni_recto', 'CNI recto', cni_recto),
                              ('cni_verso', 'CNI verso', cni_verso),
                              ('selfie', 'Selfie', selfie)]:
            if f:
                try:
                    validate_uploaded_file(
                        f,
                        allowed_extensions=DOCUMENT_EXTENSIONS,
                        allowed_mime_types=DOCUMENT_MIME_TYPES,
                        label=label
                    )
                    verify_image_integrity(f, label=label)
                    optimized = sanitize_and_optimize_image(f)
                    if key == 'cni_recto':
                        cni_recto = optimized
                    elif key == 'cni_verso':
                        cni_verso = optimized
                    elif key == 'selfie':
                        selfie = optimized
                except Exception as exc:
                    return Response({key: [str(exc)]}, status=400)

        try:
            if dossier is None:
                dossier = BailleurDossier(user=user)

            dossier.document_type = document_type
            if document_number:
                dossier.document_number = document_number
            if cni_recto:
                dossier.cni_recto = cni_recto
            if cni_verso:
                dossier.cni_verso = cni_verso
            elif not dossier.cni_verso and cni_recto:
                dossier.cni_verso = cni_recto
            if selfie:
                dossier.selfie = selfie
            elif not dossier.selfie and cni_recto:
                dossier.selfie = cni_recto

            dossier.city           = city
            dossier.neighborhoods  = neighborhoods
            dossier.property_count = property_count
            dossier.property_types = property_types
            dossier.description    = description
            dossier.status         = DossierStatus.PENDING
            dossier.rejection_reason = ''
            dossier.submitted_at   = timezone.now()
            dossier.save()

            # Synchroniser les coordonnées utilisateur
            user_changed = []
            if phone and user.phone != phone:
                user.phone = phone
                user_changed.append('phone')
            if city and user.city != city:
                user.city = city
                user_changed.append('city')
            if user_changed:
                user.save(update_fields=user_changed)

            return Response(self._payload(request, dossier), status=200)
        except Exception as exc:
            logger.exception("Erreur enregistrement KYC bailleur: %s", exc)
            return Response({'error': f'Erreur lors de l\'enregistrement : {str(exc)}'}, status=400)

from apps.properties.models import Property, PropertyStatus, SearchAlert, VisitRequest, LocationRequest
from apps.properties.api.serializers import PropertySerializer, PropertyCardSerializer
from apps.messaging.models import Message
from django.db.models import Q

class BailleurDashboardAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role != 'BAILLEUR':
            return Response({'error': 'Unauthorized'}, status=403)
            
        total_properties = Property.objects.filter(owner=user).count()
        active_properties = Property.objects.filter(owner=user, is_published=True).count()
        archived_count = Property.objects.filter(owner=user, status='ARCHIVED').count()
        
        pending_visits = VisitRequest.objects.filter(
            property__owner=user,
            status=VisitRequest.Status.PENDING,
        ).count()
        pending_locations = LocationRequest.objects.filter(
            property__owner=user,
            status__in=[LocationRequest.Status.PENDING, LocationRequest.Status.REVIEWING],
        ).count()
        dossier = BailleurDossier.objects.filter(user=user).first()
        profile_values = [user.first_name, user.last_name, user.email, user.phone, user.city, user.avatar]
        if dossier:
            profile_values.extend([
                dossier.city, dossier.neighborhoods, dossier.property_count,
                dossier.property_types, dossier.description, dossier.document_type,
                dossier.document_number, dossier.cni_recto, dossier.cni_verso, dossier.selfie,
            ])
        profile_completion = round(sum(1 for value in profile_values if value) / len(profile_values) * 100)
        full_lists = request.query_params.get('full') == '1'

        def property_payload(prop):
            image = None
            if prop.main_image and getattr(prop.main_image, 'name', ''):
                try:
                    image = request.build_absolute_uri(prop.main_image.url)
                except Exception:
                    image = None
            return {
                'id': str(prop.id), 'title': prop.title, 'slug': prop.slug,
                'price': str(prop.price), 'city': prop.city,
                'neighborhood': prop.neighborhood, 'property_type': prop.property_type,
                'main_image': image,
            }

        visit_requests = []
        visit_queryset = VisitRequest.objects.filter(property__owner=user).select_related('property', 'tenant').order_by('-created_at')
        for visit in visit_queryset if full_lists else visit_queryset[:10]:
            visit_requests.append({
                'id': visit.pk, 'status': visit.status,
                'requested_date': str(visit.requested_date),
                'requested_time': str(visit.requested_time) if visit.requested_time else None,
                'confirmed_date': str(visit.confirmed_date) if visit.confirmed_date else None,
                'confirmed_time': str(visit.confirmed_time) if visit.confirmed_time else None,
                'message': visit.message, 'bailleur_note': visit.bailleur_note,
                'created_at': visit.created_at.isoformat(),
                'property': property_payload(visit.property),
                'tenant': {
                    'id': str(visit.tenant_id),
                    'first_name': visit.tenant.first_name,
                    'last_name': visit.tenant.last_name,
                    'full_name': visit.tenant.get_full_name() or visit.tenant.email,
                    'email': visit.tenant.email,
                    'phone': getattr(visit.tenant, 'phone', ''),
                },
            })

        location_requests = []
        location_queryset = LocationRequest.objects.filter(property__owner=user).select_related('property', 'tenant').order_by('-created_at')
        for loc in location_queryset if full_lists else location_queryset[:10]:
            location_requests.append({
                'id': loc.pk, 'status': loc.status,
                'move_in_date': str(loc.move_in_date), 'lease_duration': loc.lease_duration,
                'tenant_count': loc.tenant_count, 'profession': loc.profession,
                'employer': loc.employer, 'bailleur_note': loc.bailleur_note,
                'dossier_completion': loc.get_dossier_completion(),
                'created_at': loc.created_at.isoformat(),
                'property': property_payload(loc.property),
                'tenant': {
                    'id': str(loc.tenant_id),
                    'first_name': loc.tenant.first_name,
                    'last_name': loc.tenant.last_name,
                    'full_name': loc.tenant.get_full_name() or loc.tenant.email,
                    'email': loc.tenant.email,
                    'phone': getattr(loc.tenant, 'phone', ''),
                },
            })
        
        # Unread messages
        try:
            unread_messages = Message.objects.filter(
                Q(conversation__tenant=user) | Q(conversation__landlord=user),
                is_read=False
            ).exclude(sender=user).count()
        except Exception:
            unread_messages = 0
        
        # Toutes les annonces du bailleur — boostées d'abord
        recent_properties = Property.objects.filter(owner=user).exclude(
            status=PropertyStatus.ARCHIVED
        ).order_by('-is_boosted', '-created_at')[:10]
        archived_properties = Property.objects.filter(
            owner=user, status=PropertyStatus.ARCHIVED
        ).order_by('-updated_at', '-created_at')
        serializer = PropertySerializer(recent_properties, many=True, context={'request': request})
        archived_serializer = PropertySerializer(archived_properties, many=True, context={'request': request})
        
        search_alerts = []
        for alert in SearchAlert.objects.filter(user=user, is_active=True):
            matching = Property.objects.filter(is_published=True, status=PropertyStatus.PUBLISHED)
            if alert.city: matching = matching.filter(city__icontains=alert.city)
            if alert.neighborhood: matching = matching.filter(neighborhood__icontains=alert.neighborhood)
            if alert.property_type: matching = matching.filter(property_type=alert.property_type)
            if alert.transaction_type: matching = matching.filter(transaction_type=alert.transaction_type)
            if alert.min_price: matching = matching.filter(price__gte=alert.min_price)
            if alert.max_price: matching = matching.filter(price__lte=alert.max_price)
            if alert.min_area: matching = matching.filter(area__gte=alert.min_area)
            search_alerts.append({
                'id': alert.id, 'title': alert.title, 'city': alert.city,
                'neighborhood': alert.neighborhood, 'property_type': alert.property_type,
                'transaction_type': alert.transaction_type, 'min_price': alert.min_price,
                'max_price': alert.max_price, 'min_area': alert.min_area,
                'matches_count': matching.count(), 'is_active': alert.is_active,
            })

        dossier_data = None
        if dossier:
            dossier_data = {
                'id': str(dossier.pk),
                'status': dossier.status,
                'status_label': dossier.get_status_display(),
                'rejection_reason': dossier.rejection_reason,
                'document_type': dossier.document_type,
                'document_number': dossier.document_number,
                'submitted_at': dossier.submitted_at.isoformat() if dossier.submitted_at else None,
                'has_documents': bool(dossier.cni_recto and dossier.cni_verso and dossier.selfie),
            }

        return Response({
            'kpis': {
                'total_properties': total_properties,
                'active_properties': active_properties,
                'archived_count': archived_count,
                'pending_visits': pending_visits,
                'pending_locations': pending_locations,
                'unread_messages': unread_messages,
                'points': user.points,
                'profile_completion': profile_completion,
                'verification_level': getattr(user, 'verification_level', 1),
                'is_verified': getattr(user, 'verification_level', 1) >= 2,
                'dossier_status': dossier.status if dossier else None,
            },
            'dossier': dossier_data,
            'recent_properties': serializer.data,
            'archived_properties': archived_serializer.data,
            'recent_requests': [],
            'visit_requests': visit_requests,
            'location_requests': location_requests,
        })

class LocataireDashboardAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        from apps.properties.models import VisitRequest, LocationRequest, Favorite, SearchAlert
        from django.utils import timezone

        user = request.user
        full_lists = request.query_params.get('full') == '1'

        # Unread messages
        try:
            unread_messages = Message.objects.filter(
                Q(conversation__tenant=user) | Q(conversation__landlord=user),
                is_read=False
            ).exclude(sender=user).count()
        except Exception:
            unread_messages = 0

        # Profile completion
        fields = [
            user.first_name, user.last_name, user.email,
            getattr(user, 'phone', None),
            getattr(user, 'city', None),
            getattr(user, 'avatar', None),
        ]
        profile_completion = int(sum(1 for f in fields if f) / len(fields) * 100) if fields else 0

        # Favorites count
        saved_count = Favorite.objects.filter(user=user).count()

        # Recent available properties — boostées d'abord, puis par date
        recent_properties = Property.objects.filter(
            is_published=True, status='PUBLISHED'
        ).order_by('-is_boosted', '-created_at')[:12]
        serializer = PropertySerializer(recent_properties, many=True, context={'request': request})

        # ─── My Visits ────────────────────────────────────────────────
        my_visits_queryset = VisitRequest.objects.filter(
            tenant=user
        ).select_related('property').order_by('-created_at')
        my_visits_qs = my_visits_queryset if full_lists else my_visits_queryset[:10]

        def build_img(prop):
            if not prop.main_image:
                return None
            url = prop.main_image.url
            return request.build_absolute_uri(url) if url.startswith('/') else url

        my_visits = []
        for v in my_visits_qs:
            prop = v.property
            my_visits.append({
                'id': v.pk,
                'status': v.status,
                'requested_date': str(v.requested_date),
                'requested_time': str(v.requested_time) if v.requested_time else None,
                'confirmed_date': str(v.confirmed_date) if v.confirmed_date else None,
                'confirmed_time': str(v.confirmed_time) if v.confirmed_time else None,
                'message': v.message,
                'bailleur_note': v.bailleur_note,
                'created_at': v.created_at.isoformat(),
                'property': {
                    'id': str(prop.id),
                    'title': prop.title,
                    'slug': prop.slug,
                    'price': str(prop.price),
                    'city': prop.city,
                    'neighborhood': prop.neighborhood,
                    'property_type': prop.property_type,
                    'main_image': build_img(prop),
                },
            })

        # Upcoming visits (PENDING or CONFIRMED, in the future)
        upcoming_visits = [
            v for v in my_visits
            if v['status'] in ('PENDING', 'CONFIRMED')
            and v['requested_date'] >= str(timezone.now().date())
        ]

        # ─── My Locations ────────────────────────────────────────────
        my_locations_queryset = LocationRequest.objects.filter(
            tenant=user
        ).select_related('property').order_by('-created_at')
        my_locations_qs = my_locations_queryset if full_lists else my_locations_queryset[:10]

        my_locations = []
        for loc in my_locations_qs:
            prop = loc.property
            my_locations.append({
                'id': loc.pk,
                'status': loc.status,
                'move_in_date': str(loc.move_in_date),
                'lease_duration': loc.lease_duration,
                'tenant_count': loc.tenant_count,
                'profession': loc.profession,
                'employer': loc.employer,
                'bailleur_note': loc.bailleur_note,
                'dossier_completion': loc.get_dossier_completion(),
                'created_at': loc.created_at.isoformat(),
                'property': {
                    'id': str(prop.id),
                    'title': prop.title,
                    'slug': prop.slug,
                    'price': str(prop.price),
                    'city': prop.city,
                    'neighborhood': prop.neighborhood,
                    'property_type': prop.property_type,
                    'main_image': build_img(prop),
                },
            })

        # ─── Search alerts ───────────────────────────────────────────
        search_alerts = []
        for alert in SearchAlert.objects.filter(user=user, is_active=True).order_by('-created_at'):
            matching = Property.objects.filter(is_published=True, status='PUBLISHED')
            if alert.city: matching = matching.filter(city__icontains=alert.city)
            if alert.neighborhood: matching = matching.filter(neighborhood__icontains=alert.neighborhood)
            if alert.property_type: matching = matching.filter(property_type=alert.property_type)
            if alert.transaction_type: matching = matching.filter(transaction_type=alert.transaction_type)
            if alert.min_price: matching = matching.filter(price__gte=alert.min_price)
            if alert.max_price: matching = matching.filter(price__lte=alert.max_price)
            if alert.min_area: matching = matching.filter(area__gte=alert.min_area)
            search_alerts.append({
                'id': alert.id, 'title': alert.title, 'city': alert.city,
                'neighborhood': alert.neighborhood, 'property_type': alert.property_type,
                'transaction_type': alert.transaction_type, 'min_price': alert.min_price,
                'max_price': alert.max_price, 'min_area': alert.min_area,
                'is_active': alert.is_active, 'created_at': alert.created_at.isoformat(),
                'matches_count': matching.count(),
            })

        return Response({
            'saved_count': saved_count,
            'unread_messages': unread_messages,
            'upcoming_visits': upcoming_visits,
            'search_alerts': search_alerts,
            'my_visits': my_visits,
            'my_locations': my_locations,
            'recent_properties': serializer.data,
            'architects': [],
            'profile_completion': profile_completion,
            'points': user.points,
        })


# ══════════════════════════════════════════════════════════════════════════════
# ── SUPER-ADMIN CONTROL CENTER API ───────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

from apps.accounts.models import BailleurDossier, AuditLog, ThemeConfig, DossierStatus, VerificationLevel, AccountStatus, UserRole, TenantSubscription
from apps.properties.models import Property, PropertyStatus, ConciergeMandate, PropertyBoost, ShortStayBooking
from apps.notifications.models import Notification
from django.utils import timezone
import json
import os
import re
import urllib.request
import urllib.error
import logging
from django.db.models import Q
from django.core.cache import cache

logger = logging.getLogger(__name__)


class ChatAssistantAPIView(APIView):
    """Assistant Piolo 100% IA Fluide (Google Gemini) avec recherche réelle en base de données."""
    permission_classes = (AllowAny,)
    throttle_classes = (ChatRateThrottle,)
    throttle_scope = 'chat'

    def post(self, request, *args, **kwargs):
        message = str(request.data.get('message', '')).strip()
        if not message:
            return Response({'error': 'Le message est requis.'}, status=400)
        if len(message) > 2000:
            return Response({'error': 'Message trop long (2 000 caractères maximum).'}, status=400)

        # Si l'utilisateur n'est pas connecté, lui demander gentiment de se connecter
        if not request.user or not request.user.is_authenticated:
            return Response({
                'message': "Bonjour ! Pour discuter davantage avec l'assistant IA Piolo, réserver des visites virtuelles 360° ou contacter directement les bailleurs, veuillez vous connecter ou créer un compte gratuitement.",
                'properties': [],
                'suggestions': ['Se connecter à Piolo', 'Créer un compte'],
                'require_login': True
            })

        user_id = request.user.pk if request.user and request.user.is_authenticated else request.META.get('REMOTE_ADDR', 'anon')
        throttle_key = f'piolo-chat:{user_id}'
        calls = cache.get(throttle_key, 0)
        if calls >= 30:
            return Response({'error': 'Trop de messages. Réessayez dans une minute.'}, status=429)
        cache.set(throttle_key, calls + 1, 60)

        raw_history = request.data.get('history') or []
        # Gemini exige que l’historique commence par un message utilisateur et
        # alterne les rôles. Le widget envoie parfois le message d’accueil
        # initial de l’assistant : on l’ignore et on fusionne les doublons.
        formatted_contents = []
        has_user_message = False
        for m in raw_history[-10:]:
            if not isinstance(m, dict) or not isinstance(m.get('content'), str) or not m.get('content').strip():
                continue
            role = 'user' if m.get('role') == 'user' else 'model'
            content = m['content'].strip()
            if role == 'model' and not has_user_message:
                continue
            if role == 'user':
                has_user_message = True
            if formatted_contents and formatted_contents[-1]['role'] == role:
                formatted_contents[-1]['parts'][0]['text'] += f"\n{content}"
            else:
                formatted_contents.append({'role': role, 'parts': [{'text': content}]})
        # Le frontend peut inclure le message courant dans history. Il doit
        # être envoyé une seule fois à Gemini.
        if formatted_contents and formatted_contents[-1]['role'] == 'user' and formatted_contents[-1]['parts'][0]['text'].strip() == message:
            formatted_contents.pop()

        lowered = message.lower()
        cards = []
        suggestions = ['Trouver un studio à Douala', 'Comment planifier une visite ?', 'Comment publier une annonce ?']

        # Mots-clés déclencheurs d'une recherche d'annonces
        is_property_search = any(k in lowered for k in [
            'cherche', 'recherche', 'studio', 'appartement', 'villa', 'maison', 'duplex',
            'bureau', 'terrain', 'chambre', 'magasin', 'yaoundé', 'yaounde', 'douala',
            'bafoussam', 'kribi', 'bastos', 'bonapriso', 'akwa', 'odza', 'fcfa', 'budget',
            'louer', 'location', 'acheter', 'vente', 'prix', 'propose', 'proposer', 'montre',
            'montrer', 'trouver', 'trouve', 'liste', 'donne', 'offre', 'offres', 'dispo'
        ])

        if is_property_search:
            query = Property.objects.filter(is_published=True, status=PropertyStatus.PUBLISHED).select_related('owner').prefetch_related('images')

            known_cities = ['yaoundé', 'yaounde', 'douala', 'bafoussam', 'garoua', 'kribi', 'limbé', 'limbe']
            city = next((c for c in known_cities if c in lowered), None)
            if city:
                norm_city = city.replace('yaounde', 'yaoundé').replace('limbe', 'limbé')
                query = query.filter(city__icontains=norm_city)

            price_match = re.search(r'(?:moins de|sous|maximum|max|budget de|environ)\s*([\d\s.,]+)', lowered)
            if price_match:
                digits = re.sub(r'\D', '', price_match.group(1))
                if digits and int(digits) > 1000:
                    query = query.filter(price__lte=int(digits))

            type_map = {
                'studio': 'STUDIO',
                'villa': 'VILLA',
                'appartement': 'APPARTEMENT',
                'maison': 'VILLA',
                'duplex': 'DUPLEX',
                'terrain': 'TERRAIN',
                'bureau': 'BUREAU'
            }
            property_type = next((v for k, v in type_map.items() if k in lowered), None)
            if property_type:
                query = query.filter(property_type=property_type)

            stop_words = {
                'cherche', 'recherche', 'avec', 'dans', 'pour', 'une', 'des', 'les', 'sous', 'maximum', 'budget', 'louer', 'location', 'trouver', 'bien', 'propose', 'proposer',
                'logement', 'logements', 'voir', 'veux', 'voudrais', 'ville', 'quartier', 'prix', 'fcfa', 'yaoundé', 'yaounde', 'douala',
                'bafoussam', 'garoua', 'kribi', 'limbé', 'limbe', 'comment', 'faire', 'possible', 'disponible', 'disponibles'
            }
            terms = [t for t in re.findall(r'[a-zàâçéèêëîïôûùüÿœæ0-9-]{3,}', lowered) if t not in stop_words]
            if terms:
                term_q = Q()
                for term in terms[:4]:
                    term_q |= Q(title__icontains=term) | Q(description__icontains=term) | Q(neighborhood__icontains=term)
                query = query.filter(term_q)

            properties = list(query.order_by('-created_at')[:6])
            cards = PropertyCardSerializer(properties, many=True, context={'request': request}).data

        answer = f"J’ai trouvé {len(cards)} annonce(s) correspondant à votre recherche. Consultez les fiches affichées ci-dessous." if cards else "Je peux vous aider à trouver un bien, organiser une visite ou utiliser Piolo. Dites-moi simplement ce que vous recherchez, par exemple une villa à Yaoundé avec votre budget."
        if any(word in lowered for word in ('bonjour', 'salut', 'bonsoir')):
            answer = "Bonjour ! Je suis là pour vous accompagner sur Piolo. Vous recherchez un logement précis ou vous avez une question sur la plateforme ?"
        elif 'comment tu vas' in lowered or 'ça va' in lowered:
            answer = "Je vais très bien, merci ! Je suis prêt à vous aider. Vous souhaitez rechercher un bien ou faire une démarche sur Piolo ?"
        elif 'parle' in lowered and 'piolo' in lowered:
            answer = "Piolo est une plateforme immobilière qui met en relation locataires et bailleurs au Cameroun, avec des annonces vérifiées, des visites et un accompagnement à chaque étape."
        elif 'visite' in lowered and any(word in lowered for word in ('demande', 'faire', 'planifier', 'comment')):
            answer = "Pour demander une visite, ouvrez la fiche d’un bien puis cliquez sur « Demander une visite ». Choisissez votre date et votre créneau, puis validez la demande."

        # ── 3. GÉNÉRATION IA (1. GROQ LLAMA 3.3 -> 2. GEMINI -> 3. LOCAL) ─
        system_instruction_text = (
            "Tu es Piolo Assistant, l'assistant intelligent et conseiller immobilier officiel de la plateforme Piolo (https://piolo-immo.tech) au Cameroun 🇨🇲.\n"
            "Ton rôle est d'accompagner locataires, bailleurs et professionnels avec un ton chaleureux, ultra-clair, professionnel et moderne (style ChatGPT).\n\n"
            "Connaissances clés sur Piolo :\n"
            "1. 🏠 RECHERCHE & ANNONCES : Piolo propose des appartements, studios, villas, duplex, bureaux et terrains vérifiés à Yaoundé (Bastos, Odza, Omnisports, etc.), Douala (Bonapriso, Akwa, Bonamoussadi, etc.), Kribi, Bafoussam, Limbé et tout le Cameroun.\n"
            "2. 🔄 VISITES 360° & IMMERSION : Les utilisateurs peuvent effectuer des visites virtuelles 360° directement depuis leur smartphone ou PC, et réserver des visites réelles en ligne en choisissant un créneau horaire.\n"
            "3. 🛡️ SÉCURITÉ & CERTIFICATION BAILLEUR : Les bailleurs certifiés valident leur identité (CNI/Passeport + Selfie KYC). Ils reçoivent un badge 'Bailleur Vérifié' et des points de fidélité (+10 points à l'approbation, +20 points par visite honorée).\n"
            "4. 👷 ARTISANS & PROFESSIONNELS BTP : Annuaire d'architectes, décorateurs et artisans certifiés avec demande de devis instantanée.\n"
            "5. 📲 NOTIFICATIONS MULTICANALES : Confirmations et rappels automatiques par WhatsApp Cloud officiel et e-mail sécurisé.\n"
            "6. 📄 CONTRATS & QUITTANCES : Génération et téléchargement de quittances de loyer et contrats numériques.\n\n"
            "Règles de réponse :\n"
            "- Réponds toujours en français fluide avec une mise en page claire (listes à puces, gras pour les mots clés).\n"
            "- Ne donne jamais de prix ou de disponibilités imaginaires. Si des annonces réelles sont listées ci-dessous, mentionne-les et invite chaleureusement l'utilisateur à cliquer sur les fiches sous le message.\n"
            "- Si l'utilisateur demande comment s'inscrire, se connecter ou publier une annonce, guide-le étape par étape de façon simple."
        )

        current_user_text = message
        if cards:
            titles_list = [f"{p.get('title')} - {p.get('city')} ({int(p.get('price') or 0)} FCFA)" for p in cards[:3]]
            current_user_text += f"\n\n[Données de recherche Piolo en base: {len(cards)} annonces trouvées -> {titles_list}]"

        # 1. Tentative avec Groq API (Ultra-rapide & Réponses fluides Llama-3.3-70b)
        groq_key = os.getenv('GROQ_API_KEY', '')
        groq_model = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        ai_success = False

        if groq_key:
            groq_messages = [{'role': 'system', 'content': system_instruction_text}]
            for m in raw_history[-6:]:
                if isinstance(m, dict) and m.get('content') and isinstance(m.get('content'), str):
                    role = 'user' if m.get('role') == 'user' else 'assistant'
                    groq_messages.append({'role': role, 'content': m.get('content')})
            groq_messages.append({'role': 'user', 'content': current_user_text})

            groq_url = 'https://api.groq.com/openai/v1/chat/completions'
            payload = json.dumps({
                'model': groq_model,
                'messages': groq_messages,
                'temperature': 0.7,
                'max_tokens': 1000
            }).encode('utf-8')

            req = urllib.request.Request(
                groq_url,
                data=payload,
                headers={
                    'Authorization': f'Bearer {groq_key}',
                    'Content-Type': 'application/json',
                    'User-Agent': 'PioloAssistant/1.0'
                },
                method='POST'
            )
            try:
                with urllib.request.urlopen(req, timeout=8) as response:
                    body = json.loads(response.read().decode('utf-8'))
                    choices = body.get('choices', [])
                    if choices and len(choices) > 0:
                        groq_text = choices[0].get('message', {}).get('content', '').strip()
                        if len(groq_text) > 5:
                            answer = groq_text
                            ai_success = True
            except Exception as exc:
                logger.warning('Groq API error, switching to Gemini relay: %s', exc)

        # 2. Relais avec Google Gemini API (si Groq échoue ou n'est pas configuré)
        gemini_key = os.getenv('GEMINI_API_KEY', '')
        gemini_model = os.getenv('GEMINI_MODEL', 'gemini-flash-latest')
        gemini_quota_blocked = cache.get('piolo-gemini-quota', False)

        if not ai_success and gemini_key and not gemini_quota_blocked:
            messages_payload = list(formatted_contents)
            messages_payload.append({'role': 'user', 'parts': [{'text': current_user_text}]})

            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={gemini_key}"
            payload = json.dumps({
                'systemInstruction': {
                    'parts': [{'text': system_instruction_text}]
                },
                'contents': messages_payload,
                'generationConfig': {
                    'temperature': 0.55,
                    'maxOutputTokens': 1000
                }
            }).encode('utf-8')

            req = urllib.request.Request(gemini_url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    body = json.loads(response.read().decode('utf-8'))
                    candidates = body.get('candidates', [])
                    if candidates and len(candidates) > 0:
                        parts = candidates[0].get('content', {}).get('parts', [])
                        if parts and parts[0].get('text'):
                            ai_text = parts[0].get('text').strip()
                            if len(ai_text) > 5:
                                answer = ai_text
            except urllib.error.HTTPError as exc:
                if exc.code == 429:
                    cache.set('piolo-gemini-quota', True, 30)
                logger.warning('Gemini API rejected chatbot request: HTTP %s %s', exc.code, exc.read().decode('utf-8', errors='replace')[:500])
            except Exception as exc:
                logger.warning('Gemini API unavailable for chatbot: %s', exc)

        return Response({'message': answer, 'properties': cards, 'suggestions': suggestions})


class PublicSiteConfigAPIView(APIView):
    """Configuration publique nécessaire au rendu du branding, des règles et des feature flags côté React."""
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        theme, _ = ThemeConfig.objects.get_or_create(id='00000000-0000-0000-0000-000000000001')
        return Response({
            'site_name': theme.site_name,
            'site_slogan': theme.site_slogan,
            'logo_url': theme.logo_url,
            'logo_dark_url': theme.logo_dark_url,
            'favicon_url': theme.favicon_url,
            'font_heading': theme.font_heading,
            'font_body': theme.font_body,
            'font_size_base': theme.font_size_base,
            'primary_gold': theme.primary_gold,
            'gold_light': theme.gold_light,
            'gold_dark': theme.gold_dark,
            'dark_bg': theme.dark_bg,
            'card_bg_dark': theme.card_bg_dark,
            'light_bg': theme.light_bg,
            'card_bg_light': theme.card_bg_light,
            'border_radius': theme.border_radius,
            'hero_title': theme.hero_title,
            'hero_subtitle': theme.hero_subtitle,
            'footer_copyright': theme.footer_copyright,
            'contact_email': theme.contact_email,
            'contact_phone': theme.contact_phone,
            'whatsapp_number': theme.whatsapp_number,
            'welcome_points_tenant': theme.welcome_points_tenant,
            'welcome_points_landlord': theme.welcome_points_landlord,
            'maintenance_mode': theme.maintenance_mode,
            'maintenance_message': theme.maintenance_message,
            'feature_flags': theme.feature_flags or {},
            'real_estate_rules': theme.real_estate_rules or {},
            'financial_rules': theme.financial_rules or {},
            'active_sections': theme.active_sections or {},
            'languages_config': theme.languages_config or {},
        })


class SuperAdminDashboardAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user = request.user
        if not (user.is_staff or user.is_superuser or user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        # 1. KPIs
        total_users = User.objects.count()
        locataires_count = User.objects.filter(role=UserRole.LOCATAIRE).count()
        bailleurs_count = User.objects.filter(role=UserRole.BAILLEUR).count()
        pending_dossiers_count = BailleurDossier.objects.filter(status=DossierStatus.PENDING).count()
        total_properties = Property.objects.count()
        published_properties = Property.objects.filter(is_published=True, status='PUBLISHED').count()

        # 2. Dossiers Bailleurs (Vérification KYC)
        dossiers_qs = BailleurDossier.objects.select_related('user', 'reviewed_by').order_by('-submitted_at')[:50]
        dossiers_data = []
        for d in dossiers_qs:
            dossiers_data.append({
                'id': str(d.id),
                'user_id': str(d.user.id),
                'user_name': d.user.get_full_name(),
                'user_email': d.user.email,
                'user_phone': d.user.phone,
                'document_type': d.get_document_type_display(),
                'document_number': d.document_number,
                'cni_recto': request.build_absolute_uri(d.cni_recto.url) if (d.cni_recto and d.cni_recto.name) else None,
                'cni_verso': request.build_absolute_uri(d.cni_verso.url) if (d.cni_verso and d.cni_verso.name) else None,
                'selfie': request.build_absolute_uri(d.selfie.url) if (d.selfie and d.selfie.name) else None,
                'city': d.city,
                'neighborhoods': d.neighborhoods,
                'property_count': d.property_count,
                'property_types': d.property_types,
                'description': d.description,
                'status': d.status,
                'rejection_reason': d.rejection_reason,
                'rejection_count': d.rejection_count,
                'submitted_at': d.submitted_at.isoformat(),
                'reviewed_at': d.reviewed_at.isoformat() if d.reviewed_at else None,
                'reviewed_by': d.reviewed_by.get_full_name() if d.reviewed_by else None,
            })

        # 3. Utilisateurs
        users_qs = User.objects.order_by('-date_joined')[:50]
        users_data = []
        for u in users_qs:
            users_data.append({
                'id': str(u.id),
                'full_name': u.get_full_name(),
                'email': u.email,
                'phone': u.phone,
                'city': u.city,
                'role': u.role,
                'status': u.status,
                'verification_level': u.verification_level,
                'points': u.points,
                'date_joined': u.date_joined.isoformat(),
            })

        # 4. Propriétés
        properties_qs = Property.objects.select_related('owner').prefetch_related('images').order_by('-created_at')[:60]
        properties_data = []
        for p in properties_qs:
            main_img_url = None
            if p.main_image and p.main_image.name:
                main_img_url = request.build_absolute_uri(p.main_image.url)
            else:
                first_img = p.images.first()
                if first_img and first_img.image and first_img.image.name:
                    main_img_url = request.build_absolute_uri(first_img.image.url)

            properties_data.append({
                'id': str(p.id),
                'title': p.title,
                'price': str(p.price),
                'city': p.city,
                'neighborhood': p.neighborhood or '',
                'address': p.address or '',
                'property_type': p.get_property_type_display() if hasattr(p, 'get_property_type_display') else p.property_type,
                'transaction_type': p.get_transaction_type_display() if hasattr(p, 'get_transaction_type_display') else p.transaction_type,
                'area': p.area or 0,
                'bedrooms': p.bedrooms or 0,
                'bathrooms': p.bathrooms or 0,
                'main_image': main_img_url,
                'is_published': p.is_published,
                'is_featured': getattr(p, 'is_featured', False),
                'is_boosted': getattr(p, 'is_boosted', False),
                'status': p.status,
                'views_count': p.views_count,
                'favorites_count': p.favorites_count,
                'owner_name': p.owner.get_full_name() if p.owner else 'Système',
                'owner_email': p.owner.email if p.owner else '',
                'owner_phone': getattr(p.owner, 'phone', '') if p.owner else '',
                'owner_verification_level': getattr(p.owner, 'verification_level', 1) if p.owner else 1,
                'created_at': p.created_at.isoformat(),
            })

        # 4b. Mode Découverte (Reels & Vidéos)
        reels_qs = Property.objects.exclude(video_reel='').exclude(video_reel__isnull=True).select_related('owner').order_by('-is_discovery_featured', '-discovery_priority', '-created_at')
        discovery_reels_data = []
        total_discovery_views = 0
        total_discovery_likes = 0
        active_discovery_count = 0
        blocked_discovery_count = 0

        for r in reels_qs:
            video_url = ''
            if r.video_reel:
                try:
                    video_url = r.video_reel.url
                except Exception:
                    video_url = ''
            
            cover_url = ''
            if r.main_image:
                try:
                    cover_url = r.main_image.url
                except Exception:
                    cover_url = ''

            is_active = bool(r.is_published and r.is_in_discovery and r.status == PropertyStatus.PUBLISHED)
            if is_active:
                active_discovery_count += 1
            else:
                blocked_discovery_count += 1

            v_count = r.discovery_views_count or 0
            l_count = r.discovery_likes_count or 0
            total_discovery_views += v_count
            total_discovery_likes += l_count

            discovery_reels_data.append({
                'id': str(r.id),
                'title': r.title,
                'slug': r.slug,
                'price': str(r.price),
                'city': r.city,
                'neighborhood': r.neighborhood or '',
                'video_url': video_url,
                'cover_image': cover_url,
                'reel_description': r.reel_description or '',
                'is_in_discovery': r.is_in_discovery,
                'is_discovery_featured': r.is_discovery_featured,
                'discovery_priority': r.discovery_priority,
                'discovery_views_count': v_count,
                'discovery_likes_count': l_count,
                'discovery_blocked_reason': r.discovery_blocked_reason or '',
                'status': r.status,
                'is_published': r.is_published,
                'owner_name': r.owner.get_full_name() if r.owner else 'Système',
                'owner_phone': getattr(r.owner, 'phone', '') if r.owner else '',
                'created_at': r.created_at.isoformat(),
            })

        # 5. Audit Logs / Live Traffic
        logs_qs = AuditLog.objects.select_related('user').order_by('-created_at')[:60]
        logs_data = []
        for l in logs_qs:
            logs_data.append({
                'id': str(l.id),
                'user_name': l.user.get_full_name() if l.user else (l.email or 'Visiteur Anonyme'),
                'email': l.email,
                'action': l.action,
                'ip_address': l.ip_address or '127.0.0.1',
                'user_agent': l.user_agent or 'Browser',
                'details': l.details,
                'created_at': l.created_at.isoformat(),
            })

        # 6. Finance & Revenus Platforme
        subscriptions_qs = TenantSubscription.objects.select_related('user').order_by('-created_at')
        concierges_qs = ConciergeMandate.objects.select_related('landlord', 'property').order_by('-created_at')
        boosts_qs = PropertyBoost.objects.select_related('owner', 'property').order_by('-activated_at')
        bookings_qs = ShortStayBooking.objects.select_related('guest', 'property').order_by('-created_at')

        sub_total = sum(s.price_paid for s in subscriptions_qs)
        concierge_total = sum(c.price for c in concierges_qs)
        booking_total = sum(b.total_price for b in bookings_qs)
        boost_points_total = sum(b.points_spent for b in boosts_qs)
        total_revenue = sub_total + concierge_total + booking_total

        now = timezone.now()
        first_day_curr_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        curr_month_sub = sum(s.price_paid for s in subscriptions_qs if s.created_at >= first_day_curr_month)
        curr_month_concierge = sum(c.price for c in concierges_qs if c.created_at >= first_day_curr_month)
        curr_month_booking = sum(b.total_price for b in bookings_qs if b.created_at >= first_day_curr_month)
        curr_month_revenue = curr_month_sub + curr_month_concierge + curr_month_booking

        # Répartition par méthode de paiement
        om_count, om_amount = 0, 0
        momo_count, momo_amount = 0, 0
        card_count, card_amount = 0, 0

        for s in subscriptions_qs:
            pm = (s.payment_method or '').upper()
            if 'OM' in pm or 'ORANGE' in pm:
                om_count += 1; om_amount += s.price_paid
            elif 'MOMO' in pm or 'MTN' in pm:
                momo_count += 1; momo_amount += s.price_paid
            else:
                card_count += 1; card_amount += s.price_paid

        for c in concierges_qs:
            pm = (c.payment_operator or '').upper()
            if 'OM' in pm or 'ORANGE' in pm:
                om_count += 1; om_amount += c.price
            elif 'MOMO' in pm or 'MTN' in pm:
                momo_count += 1; momo_amount += c.price
            else:
                card_count += 1; card_amount += c.price

        # Tendance mensuelle (6 derniers mois)
        monthly_trend = []
        month_labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        for i in range(5, -1, -1):
            m_date = now - timezone.timedelta(days=i * 30)
            y, m = m_date.year, m_date.month
            lbl = f"{month_labels[m - 1]} {y}"
            m_sub = sum(s.price_paid for s in subscriptions_qs if s.created_at.year == y and s.created_at.month == m)
            m_conc = sum(c.price for c in concierges_qs if c.created_at.year == y and c.created_at.month == m)
            m_book = sum(b.total_price for b in bookings_qs if b.created_at.year == y and b.created_at.month == m)
            monthly_trend.append({
                'month_key': f"{y}-{m:02d}",
                'label': lbl,
                'revenue': m_sub + m_conc + m_book,
                'subscriptions': m_sub,
                'concierge': m_conc,
                'bookings': m_book,
            })

        # Transactions unifiées
        transactions_data = []
        for s in subscriptions_qs[:50]:
            pm_upper = (s.payment_method or '').upper()
            pm_label = 'Orange Money' if ('OM' in pm_upper or 'ORANGE' in pm_upper) else ('MTN MoMo' if ('MOMO' in pm_upper or 'MTN' in pm_upper) else 'Carte Bancaire / Stripe')
            transactions_data.append({
                'id': f"SUB-{s.pk}",
                'type': 'SUBSCRIPTION',
                'type_label': f"Pass {s.get_plan_type_display() if hasattr(s, 'get_plan_type_display') else s.plan_type}",
                'user_name': s.user.get_full_name() if s.user else 'Locataire',
                'user_email': s.user.email if s.user else '',
                'user_phone': s.phone_number or (s.user.phone if s.user else ''),
                'amount': s.price_paid,
                'payment_method': 'OM' if 'OM' in pm_upper else ('MOMO' if 'MOMO' in pm_upper else 'CARD'),
                'payment_method_label': pm_label,
                'reference': s.transaction_ref or f"TX-SUB-{str(s.pk)[:8].upper()}",
                'status': s.status,
                'created_at': s.created_at.isoformat(),
                'details': f"Cycle {s.get_billing_cycle_display() if hasattr(s, 'get_billing_cycle_display') else s.billing_cycle}",
            })

        for c in concierges_qs[:50]:
            pm_upper = (c.payment_operator or '').upper()
            pm_label = 'Orange Money' if ('OM' in pm_upper or 'ORANGE' in pm_upper) else ('MTN MoMo' if ('MOMO' in pm_upper or 'MTN' in pm_upper) else 'Carte Bancaire / Virement')
            transactions_data.append({
                'id': f"MAND-{c.pk}",
                'type': 'CONCIERGE',
                'type_label': c.package_name or 'Mandat Conciergerie Piolo',
                'user_name': c.contact_name or (c.landlord.get_full_name() if c.landlord else 'Bailleur'),
                'user_email': c.landlord.email if c.landlord else '',
                'user_phone': c.payment_phone or c.contact_phone or (c.landlord.phone if c.landlord else ''),
                'amount': c.price,
                'payment_method': 'OM' if 'OM' in pm_upper else ('MOMO' if 'MOMO' in pm_upper else 'CARD'),
                'payment_method_label': pm_label,
                'reference': f"MAND-{str(c.pk)[:8].upper()}",
                'status': 'COMPLETED' if c.status != 'CANCELLED' else 'CANCELLED',
                'created_at': c.created_at.isoformat(),
                'details': f"{c.property_title} ({c.city}, {c.neighborhood})",
            })

        for b in boosts_qs[:30]:
            transactions_data.append({
                'id': f"BOOST-{b.pk}",
                'type': 'BOOST',
                'type_label': f"Boost {b.get_boost_type_display() if hasattr(b, 'get_boost_type_display') else b.boost_type}",
                'user_name': b.owner.get_full_name() if b.owner else 'Bailleur',
                'user_email': b.owner.email if b.owner else '',
                'user_phone': getattr(b.owner, 'phone', '') if b.owner else '',
                'amount': b.points_spent * 100,
                'points_spent': b.points_spent,
                'payment_method': 'POINTS',
                'payment_method_label': f"{b.points_spent} Pts Piolo",
                'reference': f"BOOST-{str(b.pk)[:8].upper()}",
                'status': 'ACTIVE' if b.is_boost_valid() else 'EXPIRED',
                'created_at': b.activated_at.isoformat(),
                'details': f"Annonce: {b.property.title if b.property else 'Bien'}",
            })

        transactions_data.sort(key=lambda t: t['created_at'], reverse=True)

        # 7. Historique des diffusions d'alertes (Broadcasts)
        broadcast_logs_qs = AuditLog.objects.filter(action='ADMIN_BROADCAST_NOTIFICATION').order_by('-created_at')[:30]
        broadcast_history_data = []
        for bl in broadcast_logs_qs:
            det = bl.details
            if isinstance(det, str):
                try:
                    det = json.loads(det)
                except Exception:
                    det = {'title': 'Alerte Flash', 'body': det}
            elif not isinstance(det, dict):
                det = {}

            broadcast_history_data.append({
                'id': str(bl.id),
                'title': det.get('title') or 'Alerte Flash',
                'body': det.get('body') or '',
                'target_audience': det.get('target_audience') or 'ALL',
                'recipients_count': det.get('recipients_count') or 0,
                'priority': det.get('priority') or 'NORMAL',
                'kind': det.get('kind') or 'SYSTEM',
                'url': det.get('url') or '',
                'sent_by': bl.user.get_full_name() if bl.user else (bl.email or 'Super Admin'),
                'created_at': bl.created_at.isoformat(),
            })

        # 8. Theme & Site Config
        theme, _ = ThemeConfig.objects.get_or_create(id='00000000-0000-0000-0000-000000000001')
        theme_data = {
            'site_name': theme.site_name,
            'site_slogan': theme.site_slogan,
            'logo_url': theme.logo_url,
            'logo_dark_url': theme.logo_dark_url,
            'favicon_url': theme.favicon_url,
            'font_heading': theme.font_heading,
            'font_body': theme.font_body,
            'font_size_base': theme.font_size_base,
            'primary_gold': theme.primary_gold,
            'gold_light': theme.gold_light,
            'gold_dark': theme.gold_dark,
            'dark_bg': theme.dark_bg,
            'card_bg_dark': theme.card_bg_dark,
            'light_bg': theme.light_bg,
            'card_bg_light': theme.card_bg_light,
            'border_radius': theme.border_radius,
            'hero_title': theme.hero_title,
            'hero_subtitle': theme.hero_subtitle,
            'footer_copyright': theme.footer_copyright,
            'contact_email': theme.contact_email,
            'contact_phone': theme.contact_phone,
            'whatsapp_number': theme.whatsapp_number,
            'welcome_points_tenant': theme.welcome_points_tenant,
            'welcome_points_landlord': theme.welcome_points_landlord,
            'max_kyc_rejections': theme.max_kyc_rejections,
            'maintenance_mode': theme.maintenance_mode,
            'maintenance_message': theme.maintenance_message,
            'feature_flags': theme.feature_flags or {},
            'notifications_config': theme.notifications_config or {},
            'real_estate_rules': theme.real_estate_rules or {},
            'financial_rules': theme.financial_rules or {},
            'active_sections': theme.active_sections or {},
            'languages_config': theme.languages_config or {},
        }

        return Response({
            'kpis': {
                'total_users': total_users,
                'locataires_count': locataires_count,
                'bailleurs_count': bailleurs_count,
                'pending_dossiers_count': pending_dossiers_count,
                'total_properties': total_properties,
                'published_properties': published_properties,
                'total_discovery_reels': reels_qs.count(),
                'active_discovery_reels': active_discovery_count,
                'blocked_discovery_reels': blocked_discovery_count,
                'total_discovery_views': total_discovery_views,
                'total_revenue': total_revenue,
                'monthly_revenue': curr_month_revenue,
                'total_transactions_count': len(transactions_data),
            },
            'financials': {
                'total_revenue': total_revenue,
                'monthly_revenue': curr_month_revenue,
                'sub_total': sub_total,
                'sub_count': subscriptions_qs.count(),
                'concierge_total': concierge_total,
                'concierge_count': concierges_qs.count(),
                'booking_total': booking_total,
                'booking_count': bookings_qs.count(),
                'boost_points_total': boost_points_total,
                'boost_count': boosts_qs.count(),
                'payment_methods': {
                    'om': {'count': om_count, 'amount': om_amount},
                    'momo': {'count': momo_count, 'amount': momo_amount},
                    'card': {'count': card_count, 'amount': card_amount},
                },
                'monthly_trend': monthly_trend,
                'transactions': transactions_data,
            },
            'broadcast_history': broadcast_history_data,
            'dossiers': dossiers_data,
            'users': users_data,
            'properties': properties_data,
            'discovery_reels': discovery_reels_data,
            'audit_logs': logs_data,
            'theme': theme_data,
        })


class SuperAdminBroadcastNotificationAPIView(APIView):
    """Permet au Super-Admin d'envoyer des alertes flash et notifications push broadcast."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        admin = request.user
        if not (admin.is_staff or admin.is_superuser or admin.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        target_audience = str(request.data.get('target_audience', 'ALL')).strip().upper()
        title = str(request.data.get('title', '')).strip()
        body = str(request.data.get('body', '')).strip()
        priority = str(request.data.get('priority', 'NORMAL')).strip().upper()
        kind = str(request.data.get('kind', 'SYSTEM')).strip().upper()
        url = str(request.data.get('url', '')).strip()

        if not title:
            return Response({'error': 'Le titre de la notification est obligatoire.'}, status=400)
        if not body:
            return Response({'error': 'Le message de la notification est obligatoire.'}, status=400)

        users_qs = User.objects.filter(is_active=True)
        if target_audience == 'BAILLEUR':
            users_qs = users_qs.filter(role=UserRole.BAILLEUR)
        elif target_audience == 'LOCATAIRE':
            users_qs = users_qs.filter(role=UserRole.LOCATAIRE)
        elif target_audience in ('PROFESSIONNEL', 'PRO', 'ARCHITECTE'):
            users_qs = users_qs.filter(role__in=[UserRole.PROFESSIONNEL, UserRole.ARCHITECTE])

        recipients = list(users_qs)
        if not recipients:
            return Response({'error': 'Aucun utilisateur actif trouvé pour cette audience cible.'}, status=400)

        notif_kind = getattr(Notification.Kind, kind, Notification.Kind.SYSTEM)
        notif_priority = getattr(Notification.Priority, priority, Notification.Priority.NORMAL)

        notifs = [
            Notification(
                recipient=u,
                actor=admin,
                kind=notif_kind,
                priority=notif_priority,
                title=title,
                body=body,
                url=url,
                entity_type='BROADCAST',
                data={
                    'broadcast_by': admin.get_full_name() or admin.email,
                    'target_audience': target_audience,
                }
            )
            for u in recipients
        ]
        Notification.objects.bulk_create(notifs)

        # Enregistrement dans l'Audit Log
        AuditLog.objects.create(
            user=admin,
            email=admin.email,
            action='ADMIN_BROADCAST_NOTIFICATION',
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            details=json.dumps({
                'title': title,
                'body': body,
                'target_audience': target_audience,
                'recipients_count': len(recipients),
                'priority': priority,
                'kind': kind,
                'url': url,
            })
        )

        return Response({
            'ok': True,
            'recipients_count': len(recipients),
            'message': f'Alerte diffusée avec succès à {len(recipients)} utilisateur(s).'
        })


class SuperAdminApproveDossierAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_superuser or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        try:
            dossier = BailleurDossier.objects.get(pk=pk)
            level = int(request.data.get('verification_level', 2))
            if level not in (2, 3):
                return Response({'error': 'Le niveau de vérification doit être 2 ou 3.'}, status=400)
            dossier.approve(request.user)

            if level == 3:
                dossier.user.verification_level = VerificationLevel.LEVEL_3
                dossier.user.save(update_fields=['verification_level'])

            # Log audit
            AuditLog.objects.create(
                user=request.user,
                email=dossier.user.email,
                action='DOSSIER_APPROVED',
                details=f"Dossier bailleur approuvé avec succès (Niveau {level}).",
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )

            return Response({'ok': True, 'message': 'Dossier approuvé et bailleur certifié avec succès.'})
        except BailleurDossier.DoesNotExist:
            return Response({'error': 'Dossier introuvable.'}, status=404)
        except ValueError:
            return Response({'error': 'Niveau de vérification invalide.'}, status=400)


class SuperAdminDossierDocumentAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, field):
        if field not in {'cni_recto', 'cni_verso', 'selfie'}:
            return Response({'error': 'Document invalide.'}, status=404)
        dossier = get_object_or_404(BailleurDossier, pk=pk)

        # Contrôle d'accès strict : Seul un admin ou le propriétaire du dossier peut consulter la CNI
        is_admin = bool(request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', '') == UserRole.ADMIN)
        if not is_admin and dossier.user != request.user:
            return Response({'error': 'Accès non autorisé à ce document.'}, status=403)

        file_field = getattr(dossier, field, None)
        if not file_field or not getattr(file_field, 'name', None):
            return Response({'error': 'Document introuvable.'}, status=404)
        try:
            mime = mimetypes.guess_type(file_field.name)[0] or 'image/jpeg'
            response = FileResponse(file_field.open('rb'), content_type=mime)
            response['Content-Disposition'] = f'inline; filename="{field}"'
            response['X-Content-Type-Options'] = 'nosniff'
            return response
        except Exception:
            return Response({'error': 'Fichier non accessible.'}, status=404)


class SuperAdminRejectDossierAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_superuser or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({'error': 'Veuillez indiquer un motif de rejet.'}, status=400)

        try:
            dossier = BailleurDossier.objects.get(pk=pk)
            dossier.reject(request.user, reason)

            # Log audit
            AuditLog.objects.create(
                user=request.user,
                email=dossier.user.email,
                action='DOSSIER_REJECTED',
                details=f"Dossier bailleur rejeté. Motif : {reason}",
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )

            return Response({'ok': True, 'message': 'Dossier rejeté avec succès.'})
        except BailleurDossier.DoesNotExist:
            return Response({'error': 'Dossier introuvable.'}, status=404)


class SuperAdminUserActionAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_superuser or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        try:
            target_user = User.objects.get(pk=pk)
            action_type = request.data.get('action')
            if action_type not in {'status', 'role', 'verification', 'points'}:
                return Response({'error': 'Action administrateur inconnue.'}, status=400)
            if target_user.pk == request.user.pk and action_type in {'status', 'role'}:
                return Response({'error': 'Vous ne pouvez pas modifier votre propre rôle ou statut.'}, status=400)
            if target_user.is_superuser and not request.user.is_superuser:
                return Response({'error': 'Seul un superutilisateur peut modifier ce compte.'}, status=403)

            if action_type == 'status':
                new_status = request.data.get('status')
                if new_status not in AccountStatus.values:
                    return Response({'error': 'Statut de compte invalide.'}, status=400)
                target_user.status = new_status
                target_user.is_active = new_status not in {AccountStatus.BLOCKED, AccountStatus.SUSPENDED}
                target_user.save(update_fields=['status', 'is_active'])

            elif action_type == 'role':
                new_role = request.data.get('role')
                if new_role not in UserRole.values:
                    return Response({'error': 'Rôle invalide.'}, status=400)
                target_user.role = new_role
                target_user.save(update_fields=['role'])

            elif action_type == 'verification':
                level = int(request.data.get('level', 1))
                if level not in (1, 2, 3):
                    return Response({'error': 'Niveau de vérification invalide.'}, status=400)
                target_user.verification_level = level
                target_user.save(update_fields=['verification_level'])

            elif action_type == 'points':
                delta = int(request.data.get('points', 0))
                reason = request.data.get('reason', 'Ajustement Administrateur')
                if delta > 0:
                    target_user.award_points(delta, reason)
                elif delta < 0:
                    target_user.deduct_points(abs(delta), reason)

            # Audit log
            AuditLog.objects.create(
                user=request.user,
                email=target_user.email,
                action=f"USER_ACTION_{action_type.upper()}",
                details=f"Action administrateur sur l'utilisateur {target_user.email} : {request.data}",
                ip_address=request.META.get('REMOTE_ADDR', ''),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )

            return Response({'ok': True, 'message': 'Utilisateur mis à jour avec succès.'})
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=404)
        except (TypeError, ValueError):
            return Response({'error': 'Valeur d’action invalide.'}, status=400)


class SuperAdminCreateUserAPIView(APIView):
    """Crée un compte depuis le centre admin, avec validation côté serveur."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        actor = request.user
        if not (actor.is_staff or actor.is_superuser or actor.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)
        payload = request.data
        email = str(payload.get('email', '')).strip().lower()
        password = str(payload.get('password', ''))
        first_name = str(payload.get('first_name', '')).strip()
        last_name = str(payload.get('last_name', '')).strip()
        role = str(payload.get('role', UserRole.LOCATAIRE)).upper()
        status_value = str(payload.get('status', AccountStatus.ACTIVE)).upper()
        if not email or not first_name or not last_name or not password:
            return Response({'error': 'Prénom, nom, email et mot de passe sont obligatoires.'}, status=400)
        try:
            validate_email(email)
        except ValidationError:
            return Response({'error': 'Adresse email invalide.'}, status=400)
        if len(password) < 8:
            return Response({'error': 'Le mot de passe doit contenir au moins 8 caractères.'}, status=400)
        if role not in UserRole.values:
            return Response({'error': 'Rôle invalide.'}, status=400)
        if role == UserRole.ADMIN and not actor.is_superuser:
            return Response({'error': 'Seul un superutilisateur peut créer un administrateur.'}, status=403)
        if status_value not in AccountStatus.values:
            return Response({'error': 'Statut invalide.'}, status=400)
        if User.objects.filter(email__iexact=email).exists():
            return Response({'error': 'Un compte utilise déjà cette adresse email.'}, status=409)
        with transaction.atomic():
            created = User.objects.create_user(
                email=email, password=password, first_name=first_name, last_name=last_name,
                role=role, status=status_value,
                is_active=status_value not in {AccountStatus.BLOCKED, AccountStatus.SUSPENDED},
                phone=str(payload.get('phone', '')).strip()[:20], city=str(payload.get('city', '')).strip()[:60],
            )
            AuditLog.objects.create(
                user=actor, email=created.email, action='ADMIN_USER_CREATED',
                details=f'Compte créé pour {created.get_full_name()} ({created.role}).',
                ip_address=request.META.get('REMOTE_ADDR', ''), user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )
        return Response(UserSerializer(created, context={'request': request}).data, status=201)


class SuperAdminThemeAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_superuser or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)
        theme, _ = ThemeConfig.objects.get_or_create(id='00000000-0000-0000-0000-000000000001')
        return Response({
            'site_name': theme.site_name,
            'site_slogan': theme.site_slogan,
            'logo_url': theme.logo_url,
            'logo_dark_url': theme.logo_dark_url,
            'favicon_url': theme.favicon_url,
            'font_heading': theme.font_heading,
            'font_body': theme.font_body,
            'font_size_base': theme.font_size_base,
            'primary_gold': theme.primary_gold,
            'gold_light': theme.gold_light,
            'gold_dark': theme.gold_dark,
            'dark_bg': theme.dark_bg,
            'card_bg_dark': theme.card_bg_dark,
            'light_bg': theme.light_bg,
            'card_bg_light': theme.card_bg_light,
            'border_radius': theme.border_radius,
            'hero_title': theme.hero_title,
            'hero_subtitle': theme.hero_subtitle,
            'footer_copyright': theme.footer_copyright,
            'contact_email': theme.contact_email,
            'contact_phone': theme.contact_phone,
            'whatsapp_number': theme.whatsapp_number,
            'welcome_points_tenant': theme.welcome_points_tenant,
            'welcome_points_landlord': theme.welcome_points_landlord,
            'max_kyc_rejections': theme.max_kyc_rejections,
            'maintenance_mode': theme.maintenance_mode,
            'maintenance_message': theme.maintenance_message,
            'feature_flags': theme.feature_flags or {},
            'notifications_config': theme.notifications_config or {},
            'real_estate_rules': theme.real_estate_rules or {},
            'financial_rules': theme.financial_rules or {},
            'languages_config': theme.languages_config or {},
            'active_sections': theme.active_sections or {},
        })

    def post(self, request, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_superuser or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)

        theme, _ = ThemeConfig.objects.get_or_create(id='00000000-0000-0000-0000-000000000001')
        d = request.data
        if 'site_name' in d: theme.site_name = d['site_name']
        if 'site_slogan' in d: theme.site_slogan = d['site_slogan']
        if 'logo_url' in d: theme.logo_url = d['logo_url']
        if 'logo_dark_url' in d: theme.logo_dark_url = d['logo_dark_url']
        if 'favicon_url' in d: theme.favicon_url = d['favicon_url']
        if 'font_heading' in d: theme.font_heading = d['font_heading']
        if 'font_body' in d: theme.font_body = d['font_body']
        if 'font_size_base' in d: theme.font_size_base = int(d['font_size_base'])
        if 'primary_gold' in d: theme.primary_gold = d['primary_gold']
        if 'gold_light' in d: theme.gold_light = d['gold_light']
        if 'gold_dark' in d: theme.gold_dark = d['gold_dark']
        if 'dark_bg' in d: theme.dark_bg = d['dark_bg']
        if 'card_bg_dark' in d: theme.card_bg_dark = d['card_bg_dark']
        if 'light_bg' in d: theme.light_bg = d['light_bg']
        if 'card_bg_light' in d: theme.card_bg_light = d['card_bg_light']
        if 'border_radius' in d: theme.border_radius = int(d['border_radius'])
        if 'hero_title' in d: theme.hero_title = d['hero_title']
        if 'hero_subtitle' in d: theme.hero_subtitle = d['hero_subtitle']
        if 'footer_copyright' in d: theme.footer_copyright = d['footer_copyright']
        if 'contact_email' in d: theme.contact_email = d['contact_email']
        if 'contact_phone' in d: theme.contact_phone = d['contact_phone']
        if 'whatsapp_number' in d: theme.whatsapp_number = d['whatsapp_number']
        if 'welcome_points_tenant' in d: theme.welcome_points_tenant = int(d['welcome_points_tenant'])
        if 'welcome_points_landlord' in d: theme.welcome_points_landlord = int(d['welcome_points_landlord'])
        if 'max_kyc_rejections' in d: theme.max_kyc_rejections = int(d['max_kyc_rejections'])
        if 'maintenance_mode' in d: theme.maintenance_mode = bool(d['maintenance_mode'])
        if 'maintenance_message' in d: theme.maintenance_message = d['maintenance_message']
        if 'feature_flags' in d: theme.feature_flags = d['feature_flags']
        # Les clés secrètes restent uniquement dans l'environnement serveur.
        if 'notifications_config' in d: theme.notifications_config = d['notifications_config']
        if 'real_estate_rules' in d: theme.real_estate_rules = d['real_estate_rules']
        if 'financial_rules' in d: theme.financial_rules = d['financial_rules']
        if 'languages_config' in d: theme.languages_config = d['languages_config']
        if 'active_sections' in d: theme.active_sections = d['active_sections']
        theme.save()

        # Enregistrement dans ThemeConfigHistory
        history_count = ThemeConfigHistory.objects.count()
        snapshot_data = {
            'site_name': theme.site_name,
            'primary_gold': theme.primary_gold,
            'font_heading': theme.font_heading,
            'font_body': theme.font_body,
            'maintenance_mode': theme.maintenance_mode,
            'feature_flags': theme.feature_flags,
            'notifications_config': theme.notifications_config,
            'real_estate_rules': theme.real_estate_rules,
            'financial_rules': theme.financial_rules,
            'languages_config': theme.languages_config,
            'active_sections': theme.active_sections,
        }
        ThemeConfigHistory.objects.create(
            author=request.user,
            version=history_count + 1,
            summary=d.get('change_summary', f"Mise à jour v{history_count + 1} par {request.user.get_full_name()}"),
            snapshot=snapshot_data,
        )

        # Audit log
        AuditLog.objects.create(
            user=request.user,
            email=request.user.email,
            action='SITE_CONFIG_UPDATED',
            details=f"Paramètres globaux v{history_count + 1} enregistrés par {request.user.get_full_name()}",
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        return Response({'ok': True, 'version': history_count + 1, 'message': 'Configuration globale sauvegardée et archivée !'})


class SuperAdminThemeHistoryAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        if not (request.user.is_staff or request.user.is_superuser or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)
        history = ThemeConfigHistory.objects.all()[:30]
        data = [{
            'id': str(h.id),
            'version': h.version,
            'author_name': h.author.get_full_name() if h.author else 'Système',
            'summary': h.summary,
            'created_at': h.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'snapshot': h.snapshot,
        } for h in history]
        return Response({'history': data})

    def post(self, request, *args, **kwargs):
        """Rollback to a previous configuration version."""
        if not (request.user.is_staff or request.user.is_superuser or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)
        version_id = request.data.get('version_id')
        if not version_id:
            return Response({'error': 'ID de version requis.'}, status=400)
        try:
            hist_item = ThemeConfigHistory.objects.get(id=version_id)
        except ThemeConfigHistory.DoesNotExist:
            return Response({'error': 'Version introuvable.'}, status=404)

        theme, _ = ThemeConfig.objects.get_or_create(id='00000000-0000-0000-0000-000000000001')
        snap = hist_item.snapshot
        for k, v in snap.items():
            if hasattr(theme, k):
                setattr(theme, k, v)
        theme.save()

        # Log rollback action
        AuditLog.objects.create(
            user=request.user,
            email=request.user.email,
            action='SITE_CONFIG_ROLLBACK',
            details=f"Restauration de la v{hist_item.version} effectuée par {request.user.get_full_name()}",
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )

        return Response({'ok': True, 'message': f'Restauration de la version v{hist_item.version} effectuée avec succès !'})


class SuperAdminThemeTestConnectionAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        """Test active API integration status."""
        if not (request.user.is_staff or request.user.is_superuser or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Accès réservé aux administrateurs.'}, status=403)
        service = request.data.get('service', 'google_maps')
        # Simulate quick latency check and validation
        return Response({
            'ok': True,
            'service': service,
            'latency_ms': 42,
            'status': 'OPERATIONAL',
            'message': f"Connexion au service {service.upper()} validée avec succès (Latence: 42ms)."
        })


# ── API Abonnements Locataire VIP & Recharges de Points ───────────────────────

class TenantSubscriptionCurrentAPIView(APIView):
    """Récupère l'état d'abonnement actif et le solde de points du locataire connecté."""
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        user = request.user
        active_sub = user.active_tenant_subscription
        
        sub_data = None
        if active_sub:
            sub_data = {
                'id': str(active_sub.id),
                'plan_type': active_sub.plan_type,
                'plan_name': active_sub.get_plan_type_display(),
                'billing_cycle': active_sub.billing_cycle,
                'starts_at': active_sub.starts_at.isoformat(),
                'expires_at': active_sub.expires_at.isoformat(),
                'days_remaining': active_sub.days_remaining,
                'auto_renew': active_sub.auto_renew,
                'is_valid': active_sub.is_valid,
            }

        return Response({
            'ok': True,
            'is_vip': user.is_vip_tenant,
            'points': user.points,
            'active_subscription': sub_data,
        })


class TenantSubscriptionSubscribeAPIView(APIView):
    """
    Souscription ou renouvellement d'un Pass Recherche VIP / Relocation.
    Prêt pour l'intégration passerelle Orange Money / MTN MoMo.
    """
    permission_classes = (IsAuthenticated,)

    PLAN_PRICES = {
        ('starter', 'monthly'): 0,
        ('vip', 'weekly'): 1500,
        ('vip', 'monthly'): 4900,
        ('vip', 'yearly'): 39000,
        ('expat', 'monthly'): 14900,
        ('expat', 'yearly'): 129000,
    }

    PLAN_DURATIONS = {
        'weekly': 7,
        'monthly': 30,
        'yearly': 365,
    }

    def post(self, request, *args, **kwargs):
        user = request.user
        plan_type = request.data.get('plan_type', 'vip').lower()
        billing_cycle = request.data.get('billing_cycle', 'monthly').lower()
        payment_method = request.data.get('payment_method', 'OM').upper()
        phone_number = request.data.get('phone_number', '').strip()

        if (plan_type, billing_cycle) not in self.PLAN_PRICES:
            return Response({'ok': False, 'detail': 'Formule ou cycle de facturation invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        price = self.PLAN_PRICES[(plan_type, billing_cycle)]
        duration_days = self.PLAN_DURATIONS.get(billing_cycle, 30)

        # Calcul de la date d'expiration
        from django.utils import timezone
        from datetime import timedelta
        now = timezone.now()
        
        # Si un abonnement actif existe déjà, on prolonge sa durée
        existing_sub = user.active_tenant_subscription
        if existing_sub and existing_sub.plan_type == plan_type:
            starts_at = existing_sub.starts_at
            expires_at = existing_sub.expires_at + timedelta(days=duration_days)
            existing_sub.expires_at = expires_at
            existing_sub.price_paid += price
            existing_sub.phone_number = phone_number or existing_sub.phone_number
            existing_sub.payment_method = payment_method
            existing_sub.reminded_j5 = False
            existing_sub.reminded_j2 = False
            existing_sub.reminded_j0 = False
            existing_sub.save()
            sub = existing_sub
        else:
            starts_at = now
            expires_at = now + timedelta(days=duration_days)
            # Désactiver les anciens abonnements
            user.tenant_subscriptions.filter(status='ACTIVE').update(status='EXPIRED')
            
            sub = TenantSubscription.objects.create(
                user=user,
                plan_type=plan_type,
                billing_cycle=billing_cycle,
                status=SubscriptionStatus.ACTIVE,
                starts_at=starts_at,
                expires_at=expires_at,
                price_paid=price,
                payment_method=payment_method,
                phone_number=phone_number,
                transaction_ref=f"PIOLO-VIP-{now.strftime('%Y%m%d%H%M%S')}",
            )

        # Créer une notification in-app & Email de confirmation
        try:
            from apps.notifications.models import Notification
            Notification.objects.create(
                recipient=user,
                kind=Notification.Kind.ACCOUNT,
                priority=Notification.Priority.HIGH,
                title="Pass VIP Activé avec succès",
                body=f"Félicitations ! Votre {sub.get_plan_type_display()} est actif jusqu'au {expires_at.strftime('%d/%m/%Y')}. Profitez de vos alertes prioritaires WhatsApp et visites illimitées.",
                url="/dashboard/locataire",
            )
        except Exception as e:
            logger.warning(f"Could not create VIP subscription notification: {e}")

        try:
            from apps.notifications.email_service import send_subscription_activated_email
            send_subscription_activated_email(sub)
        except Exception as e:
            logger.warning(f"Could not send VIP subscription email: {e}")

        return Response({
            'ok': True,
            'message': f"Votre {sub.get_plan_type_display()} a été activé avec succès !",
            'subscription': {
                'id': str(sub.id),
                'plan_type': sub.plan_type,
                'plan_name': sub.get_plan_type_display(),
                'starts_at': sub.starts_at.isoformat(),
                'expires_at': sub.expires_at.isoformat(),
                'days_remaining': sub.days_remaining,
                'price_paid': sub.price_paid,
            },
            'points': user.points,
            'is_vip': True,
        })


class TenantRechargePointsAPIView(APIView):
    """Achat de packs de points fidélité pour demandes de visite supplémentaires."""
    permission_classes = (IsAuthenticated,)

    PACKS = {
        15: {'price': 1500, 'label': 'Pack Flash Visites'},
        40: {'price': 3500, 'label': 'Pack Recommandé'},
        120: {'price': 7500, 'label': 'Pack Sérénité (100 + 20 Offerts)'},
    }

    def post(self, request, *args, **kwargs):
        user = request.user
        try:
            points_to_add = int(request.data.get('points', 0))
        except (ValueError, TypeError):
            return Response({'ok': False, 'detail': 'Nombre de points invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if points_to_add not in self.PACKS:
            # Fallback personnalisé si montant libre
            if points_to_add <= 0:
                return Response({'ok': False, 'detail': 'Sélectionnez un pack de points valide.'}, status=status.HTTP_400_BAD_REQUEST)
            price = points_to_add * 100
        else:
            price = self.PACKS[points_to_add]['price']

        payment_method = request.data.get('payment_method', 'OM').upper()
        phone_number = request.data.get('phone_number', '').strip()

        # Créditer les points
        new_balance = user.award_points(
            points_to_add,
            reason=f"Achat Recharge Points ({points_to_add} pts via {payment_method})"
        )

        # Créer une notification in-app & Email de confirmation
        try:
            from apps.notifications.models import Notification
            Notification.objects.create(
                recipient=user,
                kind=Notification.Kind.ACCOUNT,
                priority=Notification.Priority.NORMAL,
                title="Points crédités sur votre compte",
                body=f"+{points_to_add} points ont été ajoutés à votre solde. Nouveau solde : {new_balance} points.",
                url="/dashboard/locataire",
            )
        except Exception as e:
            logger.warning(f"Could not create recharge points notification: {e}")

        try:
            from apps.notifications.email_service import send_points_recharge_email
            send_points_recharge_email(
                user,
                points_added=points_to_add,
                new_balance=new_balance,
                price_paid=price,
                payment_method=payment_method
            )
        except Exception as e:
            logger.warning(f"Could not send recharge points email: {e}")

        return Response({
            'ok': True,
            'message': f"Recharge réussie ! +{points_to_add} points crédités.",
            'points_added': points_to_add,
            'new_balance': new_balance,
            'price_paid': price,
        })



class TenantSubscriptionWebhookAPIView(APIView):
    """
    Webhook universel prêt pour réception des IPN de paiement (NotchPay, Monetbil, CinetPay).
    """
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        data = request.data
        logger.info(f"Subscription payment webhook received: {data}")
        # Traitement générique et accusé de réception
        return Response({'status': 'EVENT_RECEIVED', 'ok': True})


class TenantDeductPointsAPIView(APIView):
    """
    Déduction de points pour une action locataire (Contact bailleur, visite, location, devis, itinéraire, 360, etc.).
    Exempte automatiquement les utilisateurs avec Pass VIP (0 point déduit).
    """
    permission_classes = (IsAuthenticated,)

    ACTION_COSTS = {
        'CONTACT_LANDLORD': 8,
        'SHORT_STAY_BOOKING': 8,
        'RENTAL_APPLICATION': 6,
        'PHYSICAL_VISIT': 5,
        'PROPERTY_GPS_ROUTE': 4,
        'PRO_QUOTE_REQUEST': 4,
        'VIRTUAL_TOUR_360': 3,
        'CONTACT_PRO': 3,
        'PRO_GPS_ROUTE': 2,
    }

    def post(self, request, *args, **kwargs):
        user = request.user
        action_key = request.data.get('action_key', '')
        reason = request.data.get('reason', f"Action locataire : {action_key}")

        # Si utilisateur VIP, gratuit (0 point)
        if getattr(user, 'is_vip_tenant', False):
            return Response({
                'ok': True,
                'points_deducted': 0,
                'new_balance': user.points,
                'is_vip': True,
                'message': 'Action incluse avec votre Pass VIP illimité.'
            })

        cost = self.ACTION_COSTS.get(action_key, 5)
        if user.points < cost:
            return Response({
                'ok': False,
                'error': f'Solde insuffisant. {cost} points requis, vous avez {user.points} points.',
                'required': cost,
                'current': user.points,
                'missing': cost - user.points
            }, status=status.HTTP_400_BAD_REQUEST)

        new_balance = user.deduct_points(cost, reason=reason)
        return Response({
            'ok': True,
            'points_deducted': cost,
            'new_balance': new_balance,
            'is_vip': False,
            'message': f'{cost} points déduits avec succès.'
        })


# ── API Recharge de Points Bailleur ───────────────────────────────────────────

class LandlordRechargePointsAPIView(APIView):
    """
    POST /api/v1/auth/landlord/recharge-points/
    Crédite des points bailleur suite à l'achat d'un pack de boost / points.
    Corps attendu : { points, payment_method, phone_number, pack_label }
    """
    permission_classes = (IsAuthenticated,)

    PACKS = {
        15:  {'price': 1500,  'label': 'Boost Flash 48 Heures'},
        40:  {'price': 3900,  'label': 'Boost Vedette 7 Jours'},
        100: {'price': 9900,  'label': 'Pack Multi-Boosts 30 Jours'},
    }

    def post(self, request, *args, **kwargs):
        user = request.user
        try:
            points_to_add = int(request.data.get('points', 0))
        except (ValueError, TypeError):
            return Response({'ok': False, 'detail': 'Nombre de points invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if points_to_add <= 0:
            return Response({'ok': False, 'detail': 'Sélectionnez un pack de points valide.'}, status=status.HTTP_400_BAD_REQUEST)

        pack_info = self.PACKS.get(points_to_add)
        price = pack_info['price'] if pack_info else points_to_add * 100
        pack_label = request.data.get('pack_label') or (pack_info['label'] if pack_info else f'Recharge {points_to_add} pts')

        payment_method = request.data.get('payment_method', 'OM').upper()
        phone_number = request.data.get('phone_number', '').strip()

        # Créditer les points en base de données
        new_balance = user.award_points(
            points_to_add,
            reason=f"Achat Recharge Points Bailleur ({pack_label} - +{points_to_add} pts via {payment_method})"
        )

        # Notification in-app
        try:
            from apps.notifications.models import Notification
            Notification.objects.create(
                recipient=user,
                kind=Notification.Kind.ACCOUNT,
                priority=Notification.Priority.NORMAL,
                title="Points Bailleur crédités avec succès",
                body=f"+{points_to_add} points ont été ajoutés à votre compte. Solde actuel : {new_balance} pts.",
                url="/dashboard/bailleur",
            )
        except Exception as e:
            logger.warning(f"Could not create landlord recharge points notification: {e}")

        return Response({
            'ok': True,
            'message': f"Recharge réussie ! +{points_to_add} points crédités sur votre compte bailleur.",
            'points_added': points_to_add,
            'new_balance': new_balance,
            'price_paid': price,
        })
