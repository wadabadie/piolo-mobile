import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone


class Notification(models.Model):
    """Notification in-app persistante, destinée à un seul utilisateur."""

    class Kind(models.TextChoices):
        MESSAGE = 'MESSAGE', 'Message'
        VISIT = 'VISIT', 'Visite'
        RENTAL = 'RENTAL', 'Dossier de location'
        ALERT = 'ALERT', 'Alerte de recherche'
        FAVORITE = 'FAVORITE', 'Favori'
        PROPERTY = 'PROPERTY', 'Annonce'
        ACCOUNT = 'ACCOUNT', 'Compte'
        SYSTEM = 'SYSTEM', 'Système'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Basse'
        NORMAL = 'NORMAL', 'Normale'
        HIGH = 'HIGH', 'Haute'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Destinataire',
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_notifications',
        verbose_name='Auteur',
    )
    kind = models.CharField(max_length=24, choices=Kind.choices, default=Kind.SYSTEM)
    title = models.CharField(max_length=160)
    body = models.TextField(blank=True)
    url = models.CharField(max_length=300, blank=True)
    entity_type = models.CharField(max_length=60, blank=True)
    entity_id = models.CharField(max_length=80, blank=True)
    data = models.JSONField(default=dict, blank=True)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    dedupe_key = models.CharField(max_length=180, null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'piolo_notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at'], name='notif_recipient_created_idx'),
            models.Index(fields=['recipient', 'is_read', '-created_at'], name='notif_recipient_read_idx'),
            models.Index(fields=['kind', '-created_at'], name='notif_kind_created_idx'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['recipient', 'dedupe_key'],
                condition=Q(dedupe_key__isnull=False),
                name='notif_recipient_dedupe_uniq',
            ),
        ]

    def mark_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

    def archive(self):
        if not self.is_archived:
            self.is_archived = True
            self.archived_at = timezone.now()
            self.save(update_fields=['is_archived', 'archived_at'])

    @property
    def is_expired(self):
        return bool(self.expires_at and self.expires_at <= timezone.now())
