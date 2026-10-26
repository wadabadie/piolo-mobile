from django.db import IntegrityError, transaction

from .models import Notification


def create_notification(
    recipient,
    kind,
    title,
    body='',
    *,
    actor=None,
    url='',
    entity_type='',
    entity_id='',
    data=None,
    priority=Notification.Priority.NORMAL,
    dedupe_key=None,
    expires_at=None,
):
    """Crée une notification de façon idempotente si une clé de déduplication est fournie."""
    if not recipient or not getattr(recipient, 'pk', None):
        return None, False

    defaults = {
        'actor': actor,
        'kind': kind,
        'title': title,
        'body': body,
        'url': url,
        'entity_type': entity_type,
        'entity_id': str(entity_id or ''),
        'data': data or {},
        'priority': priority,
        'expires_at': expires_at,
    }

    if dedupe_key:
        # Le contrôle applicatif évite les doublons lors des événements répétés.
        existing = Notification.objects.filter(
            recipient=recipient,
            dedupe_key=dedupe_key,
            is_archived=False,
        ).first()
        if existing:
            return existing, False
        try:
            with transaction.atomic():
                return Notification.objects.create(
                    recipient=recipient,
                    dedupe_key=dedupe_key,
                    **defaults,
                ), True
        except IntegrityError:
            existing = Notification.objects.filter(
                recipient=recipient,
                dedupe_key=dedupe_key,
            ).first()
            return existing, False

    return Notification.objects.create(
        recipient=recipient,
        **defaults,
    ), True

