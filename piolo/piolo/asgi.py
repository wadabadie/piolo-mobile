"""
ASGI config for piolo project.
Expose le callable ASGI compatible WebSockets avec Django Channels & Daphne.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'piolo.settings')

# Initialiser l'application Django ASGI de base avant d'importer les modèles et consumers
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from apps.messaging.middleware import JWTAuthMiddleware
import apps.messaging.routing

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddleware(
        URLRouter(
            apps.messaging.routing.websocket_urlpatterns
        )
    ),
})
