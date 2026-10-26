import logging
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import TenantSubscription, SubscriptionStatus
from apps.notifications.models import Notification

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Vérifie les abonnements Locataire VIP arrivant à expiration et envoie les rappels automatiques (J-5, J-2, J-0)."

    def handle(self, *args, **options):
        now = timezone.now()
        self.stdout.write(self.style.NOTICE(f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] Vérification des abonnements VIP..."))

        active_subs = TenantSubscription.objects.filter(status=SubscriptionStatus.ACTIVE)
        expired_count = 0
        j2_count = 0
        j5_count = 0

        for sub in active_subs:
            user = sub.user
            time_left = sub.expires_at - now

            # ── 1. Échéance atteinte (J-0) ──
            if sub.expires_at <= now:
                sub.status = SubscriptionStatus.EXPIRED
                sub.reminded_j0 = True
                sub.save(update_fields=['status', 'reminded_j0'])
                expired_count += 1

                Notification.objects.create(
                    recipient=user,
                    kind=Notification.Kind.ACCOUNT,
                    priority=Notification.Priority.HIGH,
                    title="Votre Pass VIP a expiré",
                    body=f"Votre {sub.get_plan_type_display()} a pris fin. Renouvelez dès maintenant pour conserver vos visites illimitées et alertes prioritaires WhatsApp.",
                    url="/dashboard/locataire",
                    dedupe_key=f"sub_expired_{sub.id}",
                )
                try:
                    from apps.notifications.email_service import send_subscription_expiring_email
                    send_subscription_expiring_email(sub, days_left=0)
                except Exception as err:
                    logger.warning("Erreur email expiration J-0: %s", err)
                logger.info(f"[J-0] Abonnement expiré pour {user.email} (ID: {sub.id})")

            # ── 2. Rappel J-2 (48h restantes) ──
            elif time_left <= timedelta(days=2) and not sub.reminded_j2:
                sub.reminded_j2 = True
                sub.save(update_fields=['reminded_j2'])
                j2_count += 1

                Notification.objects.create(
                    recipient=user,
                    kind=Notification.Kind.ACCOUNT,
                    priority=Notification.Priority.HIGH,
                    title="Votre Pass VIP expire dans 48 heures",
                    body="Ne perdez pas votre avantage sur les nouveaux logements. Prolongez votre pass en 1 clic pour garder la priorité.",
                    url="/dashboard/locataire",
                    dedupe_key=f"sub_remind_j2_{sub.id}",
                )
                try:
                    from apps.notifications.email_service import send_subscription_expiring_email
                    send_subscription_expiring_email(sub, days_left=2)
                except Exception as err:
                    logger.warning("Erreur email rappel J-2: %s", err)
                logger.info(f"[J-2] Rappel 48h envoyé à {user.email}")

            # ── 3. Rappel J-5 (5 jours restants) ──
            elif time_left <= timedelta(days=5) and not sub.reminded_j5:
                sub.reminded_j5 = True
                sub.save(update_fields=['reminded_j5'])
                j5_count += 1

                Notification.objects.create(
                    recipient=user,
                    kind=Notification.Kind.ACCOUNT,
                    priority=Notification.Priority.NORMAL,
                    title="Bilan : Votre Pass VIP expire dans 5 jours",
                    body="Consultez les dernières annonces exclusives avant l'échéance de votre pass.",
                    url="/dashboard/locataire",
                    dedupe_key=f"sub_remind_j5_{sub.id}",
                )
                try:
                    from apps.notifications.email_service import send_subscription_expiring_email
                    send_subscription_expiring_email(sub, days_left=5)
                except Exception as err:
                    logger.warning("Erreur email rappel J-5: %s", err)
                logger.info(f"[J-5] Rappel 5 jours envoyé à {user.email}")


        self.stdout.write(self.style.SUCCESS(
            f"Vérification terminée avec succès : {expired_count} expiré(s), {j2_count} rappel(s) J-2, {j5_count} rappel(s) J-5."
        ))
