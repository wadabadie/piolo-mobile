# apps/accounts/adapters.py
import logging
import secrets
from urllib.parse import urlencode

from django.conf import settings
from django.core import signing
from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect

from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import perform_login
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

from .models import AccountStatus, UserRole

logger = logging.getLogger('apps.accounts')
User = get_user_model()


def _get_react_social_redirect(request):
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    if request.user and request.user.is_authenticated:
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
        # Also mirror in cache as fallback
        try:
            cache.set(f'social-auth-code:{code}', payload, 300)
        except Exception:
            pass
        return f"{frontend_url}/login?{urlencode({'social_code': code})}"
    return f"{frontend_url}/login"


class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        return _get_react_social_redirect(request)


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):

    def get_app(self, request, provider, client_id=None):
        try:
            return super().get_app(request, provider, client_id=client_id)
        except Exception:
            apps = self.list_apps(request, provider=provider, client_id=client_id)
            if apps:
                return apps[0]
            raise

    def pre_social_login(self, request, sociallogin):
        if sociallogin.is_existing:
            return
        email = sociallogin.account.extra_data.get('email')
        if not email and sociallogin.user:
            email = sociallogin.user.email
        if not email:
            return
        email = email.strip().lower()
        try:
            user = User.objects.filter(email__iexact=email).first()
            if user:
                if not sociallogin.account.pk:
                    sociallogin.account.user = user
                    sociallogin.account.save()
                sociallogin.user = user
                perform_login(
                    request, user,
                    email_verification=getattr(settings, 'ACCOUNT_EMAIL_VERIFICATION', 'none'),
                    signal_kwargs={'sociallogin': sociallogin},
                )
                redirect_url = _get_react_social_redirect(request)
                logger.info("Google auto-link %s -> %s", user.email, redirect_url)
                raise ImmediateHttpResponse(HttpResponseRedirect(redirect_url))
        except ImmediateHttpResponse:
            raise
        except Exception as e:
            logger.warning("pre_social_login error: %s", e)

    def is_auto_signup_allowed(self, request, sociallogin):
        return True

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        if not user.role or user.role not in (UserRole.LOCATAIRE, UserRole.BAILLEUR, UserRole.ARCHITECTE):
            user.role = UserRole.LOCATAIRE
            user.status = AccountStatus.ACTIVE
            user.save(update_fields=['role', 'status'])
        if sociallogin.state.get('process') != 'connect':
            try:
                bonus = getattr(settings, 'POINTS_CONFIG', {}).get('WELCOME_BONUS', 50)
                if user.points == 0 and bonus > 0:
                    user.award_points(bonus, f"Bienvenue - {sociallogin.account.provider.capitalize()}")
            except Exception as e:
                logger.warning("points bienvenue OAuth error: %s", e)
        request.session['social_signup_pending'] = True
        request.session['social_provider'] = sociallogin.account.provider
        logger.info("New OAuth user: %s via %s", user.email, sociallogin.account.provider)
        return user

    def get_login_redirect_url(self, request):
        return _get_react_social_redirect(request)