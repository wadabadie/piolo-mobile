"""
apps/accounts/urls.py

Routes d'authentification Piolo.

Inclure dans config/urls.py UNIQUEMENT ici (pas aussi dans allauth) :
    path('accounts/', include('apps.accounts.urls', namespace='accounts')),

Note : Si tu utilises allauth pour OAuth (Google/Facebook), déclare
       ses routes sous un préfixe différent pour éviter les conflits :
    path('social/', include('allauth.urls')),
"""

from django.urls import path
from django.views.generic import RedirectView
from . import views

app_name = 'accounts'

urlpatterns = [

    # ── Page principale (login + register, SPA-like) ──────────────────────
    path('',        views.auth_view,   name='auth'),
    path('login/',  views.auth_view,   name='login'),   # alias pour LOGIN_URL
    path('logout/', views.logout_view, name='logout'),

    # Compatibilité avec les liens legacy OAuth
    path(
        'google/login/',
        RedirectView.as_view(url='/social/google/login/', query_string=True),
        name='google_login_legacy',
    ),
    path(
        'facebook/login/',
        RedirectView.as_view(url='/social/facebook/login/', query_string=True),
        name='facebook_login_legacy',
    ),

    # ── Redirections post-auth ─────────────────────────────────────────────
    path('dashboard/', views.dashboard_redirect_view, name='dashboard_redirect'),
    path('locataire/', views.dashboard_locataire, name='dashboard_locataire'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/complete/', views.profile_complete_view, name='profile_complete'),
    path('pending/',   views.bailleur_pending_view,   name='bailleur_pending'),
    path('bailleur/dashboard/', views.dashboard_bailleur, name='bailleur_dashboard'),
    path('api/bailleur/register-complete/', views.register_bailleur_complete, name='api-bailleur-register-complete'),

    # ── Endpoints AJAX ────────────────────────────────────────────────────
    path('api/login/', views.login_api, name='api-login'),
    path('api/register/', views.register_api, name='api-register'),
    path('api/forgot-password/', views.forgot_password, name='api-forgot-password'),

    # ── Réinitialisation de mot de passe (Redirection transparente vers React) ───
    path(
        'password-reset/',
        RedirectView.as_view(url='/login?tab=forgot', permanent=False),
        name='password_reset',
    ),
    path(
        'password-reset/sent/',
        RedirectView.as_view(url='/login?tab=forgot', permanent=False),
        name='password_reset_done',
    ),
    path(
        'password-reset/<uidb64>/<token>/',
        RedirectView.as_view(url='/reset-password/%(uidb64)s/%(token)s', permanent=False),
        name='password_reset_confirm',
    ),
    path(
        'password-reset/complete/',
        RedirectView.as_view(url='/login', permanent=False),
        name='password_reset_complete',
    ),
    
    path('choose-role/', views.choose_role_view, name='choose_role'),
    path('social/callback/', views.social_callback_view, name='social_callback'),
]
