# /var/www/html/piolo/piolo/urls.py
"""
URL configuration principale de Piolo.

Règles importantes :
  - UN SEUL path('accounts/', ...) → apps.accounts.urls
  - allauth monté sous /social/ pour éviter tout conflit
  - Si tu n'utilises PAS Google/Facebook OAuth, commentes les lignes allauth
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.core import views as core_views

urlpatterns = [

    # ── Administration Django ─────────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── Authentification Piolo (login, register, KYC, dashboards…) ────────
    # ⚠️  UN SEUL path('accounts/', ...) — pas de doublon avec allauth
    path('accounts/', include('apps.accounts.urls', namespace='accounts')),

    # ── OAuth social via allauth (Google, Facebook) ────────────────────────
    # Monté sous /social/ pour ne PAS entrer en conflit avec /accounts/
    # Si tu n'utilises pas encore Google/Facebook, commente cette ligne :
    path('social/', include('allauth.urls')),

    # ── Apps métier ────────────────────────────────────────────────────────────
    path('robots.txt', core_views.robots_txt, name='robots_txt'),
    path('', include('apps.core.urls')),
    path('messages/', include('apps.messaging.urls')),
    path('properties/', include('apps.properties.urls')),

    # ── API v1 (pour React / applications mobiles) ──────────────────────────
    path('api/v1/auth/', include('apps.accounts.api.urls')),
    path('api/v1/accounts/', include(('apps.accounts.api.urls', 'api_accounts'), namespace='api_accounts_v1')),
    path('api/v1/properties/', include('apps.properties.api.urls')),
    path('api/v1/messages/', include('apps.messaging.api.urls')),
    path('api/v1/notifications/', include('apps.notifications.api.urls')),
    
]

# ── Fichiers statiques & media (dev seulement) ────────────────────────────────
from apps.core.media_views import serve_media_with_range
from django.urls import re_path

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media_with_range, name='media_serve_range'),
    ]

    # Django Debug Toolbar
    try:
        import debug_toolbar
        urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]
    except ImportError:
        pass

# ── Pages d'erreur personnalisées ─────────────────────────────────────────────
handler404 = 'apps.core.views.error_404'
handler500 = 'apps.core.views.error_500'
