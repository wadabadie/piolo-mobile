"""
config/settings.py
# Configuration Django pour le projet Piolo Immobilier. (Google + Facebook OAuth credentials active)
"""

import os
from pathlib import Path

import environ

# ─── INITIALISATION ENVIRON ───────────────────────────────────────────────────
env = environ.Env(DEBUG=(bool, False))

BASE_DIR = Path(__file__).resolve().parent.parent
environ.Env.read_env(os.path.join(BASE_DIR, '.env'), overwrite=True)

# ─── SÉCURITÉ ─────────────────────────────────────────────────────────────────
SECRET_KEY    = env('SECRET_KEY')
DEBUG         = env('DEBUG')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# ─── APPLICATIONS ─────────────────────────────────────────────────────────────
DJANGO_APPS = [
    'daphne',                       # Requis par Django Channels en tout premier
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',         # Requis par allauth
    'django_extensions',
]

THIRD_PARTY_APPS = [
    'channels',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'crispy_forms',
    'crispy_bootstrap5',
    'django_filters',
    # ── allauth (OAuth Google / Facebook) ──
    # Installe avec : pip install django-allauth
    # Désactive ces 3 lignes si tu n'utilises pas l'OAuth social :
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
]

LOCAL_APPS = [
    'apps.core',
    'apps.accounts',      # ← Contient CustomUser (AUTH_USER_MODEL)
    'apps.properties',
    'apps.bookings',
    'apps.messaging',
    'apps.notifications',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

ASGI_APPLICATION = 'piolo.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
# ⚠️ CorsMiddleware doit être AVANT CommonMiddleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.gzip.GZipMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Middleware allauth (requis si allauth installé) :
    'allauth.account.middleware.AccountMiddleware',
]

if DEBUG:
    try:
        import debug_toolbar   # noqa: F401
        MIDDLEWARE.insert(3, 'debug_toolbar.middleware.DebugToolbarMiddleware')
        INSTALLED_APPS.append('debug_toolbar')
        INTERNAL_IPS = ['127.0.0.1']
    except ImportError:
        pass

# ─── URLS & WSGI ──────────────────────────────────────────────────────────────
ROOT_URLCONF = 'piolo.urls'
WSGI_APPLICATION = 'piolo.wsgi.application'

# ─── TEMPLATES ────────────────────────────────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],   # Templates globaux
        'APP_DIRS': True,                   # + templates dans chaque app
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',  # Requis allauth
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'apps.accounts.context_processors.locataire_sidebar',
            ],
        },
    },
]

# ─── BASE DE DONNÉES ──────────────────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': env('DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME':   env('DB_NAME',   default=str(BASE_DIR / 'db.sqlite3')),
        'USER':   env('DB_USER',   default=''),
        'PASSWORD': env('DB_PASSWORD', default=''),
        'HOST':   env('DB_HOST',   default='localhost'),
        'PORT':   env('DB_PORT',   default='3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        } if env('DB_ENGINE', default='') == 'django.db.backends.mysql' else {},
    }
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ─── AUTHENTIFICATION ─────────────────────────────────────────────────────────

# ⚠️ DOIT être défini AVANT la première migration
AUTH_USER_MODEL = 'accounts.CustomUser'

# Backends d'authentification
# CustomUser utilise email comme USERNAME_FIELD :
#   - ModelBackend authentifie via email (pas username)
#   - allauth.AuthenticationBackend gère l'OAuth social
AUTHENTICATION_BACKENDS = [
    # Backend Django standard — fonctionne avec USERNAME_FIELD='email'
    'django.contrib.auth.backends.ModelBackend',
    # Backend allauth (OAuth Google/Facebook) — désactive si non utilisé :
    'allauth.account.auth_backends.AuthenticationBackend',
]

# ── Configuration allauth ──────────────────────────────────────────────────
# Allauth est utilisé UNIQUEMENT pour l'OAuth social (Google/Facebook).
# Notre propre login/register/logout est géré par apps/accounts/views.py.
SITE_ID = 1

ACCOUNT_AUTHENTICATION_METHOD   = 'email'
ACCOUNT_EMAIL_REQUIRED           = True
ACCOUNT_USERNAME_REQUIRED        = False   # Pas de champ username sur CustomUser
ACCOUNT_UNIQUE_EMAIL             = True
ACCOUNT_EMAIL_VERIFICATION       = 'optional'
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_SESSION_REMEMBER         = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
# ── ALLAUTH SOCIAL ACCOUNT ────────────────────────────────
SOCIALACCOUNT_QUERY_EMAIL        = True
SOCIALACCOUNT_EMAIL_REQUIRED     = True
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'   # Pas de reverif email pour OAuth 
SOCIALACCOUNT_AUTO_SIGNUP = True  # crée le compte automatiquement sans formulaire
SOCIALACCOUNT_LOGIN_ON_GET = True  # Lancement direct du flux OAuth sans écran intermédiaire
# Adapters custom Piolo (redirection vers React & auto-connect)
ACCOUNT_ADAPTER = 'apps.accounts.adapters.CustomAccountAdapter'
SOCIALACCOUNT_ADAPTER = 'apps.accounts.adapters.CustomSocialAccountAdapter'
 
# Providers configurés
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        # Pour éviter l'erreur DoesNotExist, on définit l'APP ici
        'APP': {
            'client_id': env('GOOGLE_OAUTH_CLIENT_ID', default=''),
            'secret': env('GOOGLE_OAUTH_SECRET', default=''),
            'key': ''
        }
    },
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'AUTH_PARAMS': {'auth_type': 'reauthenticate'},
        'FIELDS': ['id', 'email', 'name', 'first_name', 'last_name'],
        'EXCHANGE_TOKEN': True,
        'VERIFIED_EMAIL': False,
        'VERSION': 'v20.0',
        'APP': {
            'client_id': env('FACEBOOK_OAUTH_CLIENT_ID', default=''),
            'secret': env('FACEBOOK_OAUTH_SECRET', default=''),
            'key': ''
        }
    },
}

# ⚠️ NE PAS mettre ACCOUNT_USER_MODEL_USERNAME_FIELD = None
# → Ce paramètre est inutile avec AbstractBaseUser et casse ModelBackend.
# allauth le détecte automatiquement via USERNAME_FIELD.

# ── Redirections ──────────────────────────────────────────────────────────
# On pointe vers notre propre vue, pas celle d'allauth 
LOGIN_URL           = 'accounts:auth'
LOGIN_REDIRECT_URL  = 'accounts:social_callback'
LOGOUT_REDIRECT_URL = 'accounts:auth'

# ── Validation des mots de passe ───────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ─── INTERNATIONALISATION ─────────────────────────────────────────────────────
LANGUAGE_CODE      = 'fr-fr'
TIME_ZONE          = 'Africa/Douala'
USE_I18N           = True
USE_TZ             = True
FIRST_DAY_OF_WEEK  = 1   # Lundi

DATE_FORMAT          = 'd F Y'
DATETIME_FORMAT      = 'd F Y H:i'
SHORT_DATE_FORMAT    = 'd/m/Y'
SHORT_DATETIME_FORMAT = 'd/m/Y H:i'

# ─── FICHIERS STATIQUES & MÉDIA ───────────────────────────────────────────────
STATIC_URL     = '/static/'
STATIC_ROOT    = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

MEDIA_URL  = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Limite upload (documents KYC, images, vidéos 2 min HD/4K)
FILE_UPLOAD_MAX_MEMORY_SIZE  = 50 * 1024 * 1024    # 50 Mo en mémoire avant fichier temporaire
DATA_UPLOAD_MAX_MEMORY_SIZE  = 250 * 1024 * 1024   # 250 Mo max (autorise vidéos 2 min HD/4K)
KYC_ALLOWED_EXTENSIONS       = ['.jpg', '.jpeg', '.png', '.pdf']

# ─── DEFAULT AUTO FIELD ───────────────────────────────────────────────────────
# Les modèles avec UUID primary key ne sont pas affectés par ce paramètre,
# mais il est requis pour les modèles tiers (admin, sessions…)
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── CRISPY FORMS ─────────────────────────────────────────────────────────────
CRISPY_ALLOWED_TEMPLATE_PACKS = ['bootstrap5']
CRISPY_TEMPLATE_PACK          = 'bootstrap5'

# ─── DJANGO REST FRAMEWORK ────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '120/min',
        'user': '300/min',
        'auth': '10/min',
        'password_reset': '3/hour',
        'email_verification': '5/10min',
        'chat': '30/min',
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': (
        ['rest_framework.renderers.JSONRenderer',
         'rest_framework.renderers.BrowsableAPIRenderer']
        if DEBUG else
        ['rest_framework.renderers.JSONRenderer']
    ),
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:5173',   # Vite dev server
    'http://localhost:5174',   # Vite dev server alt
    'http://localhost:5175',   # Vite dev server alt
])
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization',
    'content-type', 'dnt', 'origin', 'user-agent',
    'x-csrftoken', 'x-requested-with',
    'range',
]
CORS_EXPOSE_HEADERS = ['Content-Disposition', 'Content-Length', 'Accept-Ranges', 'Content-Range']
# Couvre aussi /media/ (servi par Django en DEV) + /api/ + /auth/
CORS_URLS_REGEX = r'^/(api|auth|media|static)/.*$'


# ─── CSRF TRUSTED ORIGINS ───────────────────────────────────────────────────
_DEFAULT_CSRF_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
]
CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(_DEFAULT_CSRF_ORIGINS + env.list('CSRF_TRUSTED_ORIGINS', default=[])))

# ─── SÉCURITÉ PRODUCTION ─────────────────────────────────────────────────────
if not DEBUG:
    SECURE_SSL_REDIRECT              = True
    SESSION_COOKIE_SECURE            = True
    CSRF_COOKIE_SECURE               = True
    SECURE_BROWSER_XSS_FILTER        = True
    SECURE_CONTENT_TYPE_NOSNIFF      = True
    X_FRAME_OPTIONS                  = 'DENY'
    SECURE_HSTS_SECONDS              = 31536000   # 1 an
    SECURE_HSTS_INCLUDE_SUBDOMAINS   = True
    SECURE_HSTS_PRELOAD              = True

# Sessions
SESSION_COOKIE_AGE        = 86400 * 30   # 30 jours
SESSION_SAVE_EVERY_REQUEST = True

# ─── EMAIL ─────────────────────────────────────────────────────────────────────
EMAIL_BACKEND     = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='Piolo <noreply@piolo.cm>')
SERVER_EMAIL       = env('SERVER_EMAIL',       default='admin@piolo.cm')
FRONTEND_URL       = env('FRONTEND_URL', default='http://localhost:3000').rstrip('/')
SITE_URL           = env('SITE_URL', default=FRONTEND_URL).rstrip('/')
EMAIL_NOTIFICATIONS_ENABLED = env.bool('EMAIL_NOTIFICATIONS_ENABLED', default=True)

# La configuration SMTP doit aussi fonctionner en développement : cela permet
# de tester les vrais emails depuis localhost sans devoir désactiver DEBUG.
if EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend':
    EMAIL_HOST          = env('EMAIL_HOST',     default='smtp.gmail.com')
    EMAIL_PORT          = env.int('EMAIL_PORT', default=587)
    EMAIL_USE_TLS       = env.bool('EMAIL_USE_TLS', default=True)
    EMAIL_USE_SSL       = env.bool('EMAIL_USE_SSL', default=False)
    EMAIL_TIMEOUT       = env.int('EMAIL_TIMEOUT', default=20)
    EMAIL_HOST_USER     = env('EMAIL_HOST_USER',     default='')
    EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')

    # ── Correctif SSL Windows ──────────────────────────────────────────────────
    # Sur Windows, les certificats CA système ne sont pas toujours accessibles
    # par Python, ce qui provoque SSLCertVerificationError avec smtp.gmail.com.
    # Solution : on substitue ssl.create_default_context par une version qui
    # retourne toujours un contexte avec vérification désactivée.
    # Keep SMTP TLS certificate and hostname verification enabled.

# ─── URLS DU SITE ─────────────────────────────────────────────────────────────
FRONTEND_URL = env('FRONTEND_URL', default='https://piolo-immo.tech')
SITE_URL     = env('SITE_URL', default='https://piolo-immo.tech')

# ─── WHATSAPP CLOUD API (META) ────────────────────────────────────────────────
WHATSAPP_NOTIFICATIONS_ENABLED = env.bool('WHATSAPP_NOTIFICATIONS_ENABLED', default=True)
WHATSAPP_API_PROVIDER         = env('WHATSAPP_API_PROVIDER', default='META')
WHATSAPP_API_TOKEN            = env('WHATSAPP_API_TOKEN', default='')
WHATSAPP_PHONE_NUMBER_ID      = env('WHATSAPP_PHONE_NUMBER_ID', default='')
WHATSAPP_BUSINESS_ACCOUNT_ID  = env('WHATSAPP_BUSINESS_ACCOUNT_ID', default='')
WHATSAPP_WEBHOOK_VERIFY_TOKEN = env('WHATSAPP_WEBHOOK_VERIFY_TOKEN', default='piolo_wa_webhook_verify_2026')
WHATSAPP_DEFAULT_TEMPLATE     = env('WHATSAPP_DEFAULT_TEMPLATE', default='piolo_notification')

# ─── LOGGING ──────────────────────────────────────────────────────────────────
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} [{module}] {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'piolo.log',
            'maxBytes': 10 * 1024 * 1024,   # 10 Mo
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['file', 'console'] if DEBUG else ['file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'] if DEBUG else ['file'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps.accounts': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}

# ─── CONFIGURATION PIOLO ──────────────────────────────────────────────────────

POINTS_CONFIG = {
    'WELCOME_BONUS':          50,    # Points offerts à l'inscription (Locataires / Architectes)
    'BAILLEUR_SIGNUP_POINTS': 45,    # Points de base offerts à l'inscription d'un bailleur
    'BAILLEUR_WELCOME':       10,    # Points bonus pour bailleur vérifié par l'admin
    'VISITE_CONFIRMEE':       0,     # Désactivé pour le moment
    'PARRAINAGE':             20,    # Points par parrainage réussi
    'ANNONCE_PUBLIEE':        0,     # Désactivé pour le moment
    'EXPIRATION_DAYS':        365,   # Expiration des points (jours)
}

BAILLEUR_CONFIG = {
    'MAX_REJECTIONS':       3,    # Blocage définitif après N rejets
    'REVIEW_TIMEOUT_HOURS': 48,   # Délai max de traitement admin
    'REQUIRED_DOCUMENTS':   ['cni_recto', 'cni_verso', 'selfie'],
}

GOOGLE_MAPS_API_KEY = env('GOOGLE_MAPS_API_KEY', default='')
