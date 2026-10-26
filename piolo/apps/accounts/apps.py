# apps/accounts/apps.py
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name  = 'apps.accounts'
    label = 'accounts'
    verbose_name = 'Authentification & Utilisateurs'

    def ready(self):
        """Importer les signaux au démarrage de l'app."""
        try:
            import apps.accounts.signals  # noqa: F401
        except ImportError:
            pass