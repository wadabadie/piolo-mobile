from django.core.management.base import BaseCommand
from django.conf import settings
from apps.notifications.whatsapp_service import send_whatsapp_message, normalize_phone_number


class Command(BaseCommand):
    help = "Teste l'envoi d'une notification WhatsApp via Meta Cloud API ou passerelle configurée"

    def add_arguments(self, parser):
        parser.add_argument('--phone', type=str, required=True, help="Numéro de téléphone de destination (ex: 699001122 ou +237699001122)")
        parser.add_argument('--message', type=str, default="🔔 Message de test officiel depuis Piolo Immobilier !", help="Message texte à envoyer")
        parser.add_argument('--template', action='store_true', help="Utiliser le template Meta piolo_notification au lieu de texte brut")
        parser.add_argument('--hello-world', action='store_true', help="Utiliser le template universel Meta hello_world")

    def handle(self, *args, **options):
        phone = options['phone']
        msg = options['message']
        use_template = options['template']
        use_hello_world = options['hello_world']

        clean = normalize_phone_number(phone)
        self.stdout.write(self.style.NOTICE(f"=== TEST NOTIFICATION WHATSAPP PIOLO ==="))
        self.stdout.write(f"Numero normalise : +{clean}")
        self.stdout.write(f"Fournisseur configure : {getattr(settings, 'WHATSAPP_API_PROVIDER', 'META')}")
        self.stdout.write(f"Token present : {'OUI' if bool(getattr(settings, 'WHATSAPP_API_TOKEN', '')) else 'NON (Mode Simulation)'}")
        self.stdout.write(f"Phone Number ID : {getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', '(non defini)')}")

        if use_hello_world:
            from apps.notifications.whatsapp_service import send_whatsapp_hello_world
            self.stdout.write("Tentative d'envoi via Template officiel Meta (hello_world)...")
            success = send_whatsapp_hello_world(phone)
        elif use_template:
            self.stdout.write("Tentative d'envoi via Template piolo_notification...")
            success = send_whatsapp_message(
                phone_number=phone,
                message_text=msg,
                recipient_name="Utilisateur Test Piolo",
                action_title="Test de Connexion Meta Cloud API",
                details_text=msg
            )
        else:
            self.stdout.write("Tentative d'envoi en message texte direct...")
            success = send_whatsapp_message(
                phone_number=phone,
                message_text=msg
            )

        if success:
            self.stdout.write(self.style.SUCCESS(f"[OK] Envoi WhatsApp reussi (ou simule) vers +{clean} !"))
        else:
            self.stdout.write(self.style.ERROR(f"[ERREUR] Echec de l'envoi WhatsApp vers +{clean}. Verifiez votre token Meta."))
