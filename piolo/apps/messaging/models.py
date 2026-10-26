from django.db import models
from django.conf import settings
from apps.properties.models import Property

class Conversation(models.Model):
    tenant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tenant_conversations')
    landlord = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='landlord_conversations')
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'piolo_conversations'
        ordering = ['-updated_at']
        unique_together = ('tenant', 'landlord', 'property')

    def __str__(self):
        return f"Conv: {self.tenant} & {self.landlord}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True, null=True) # Allow blank for voice/file only messages
    file = models.FileField(upload_to='chat_files/', null=True, blank=True)
    voice = models.FileField(upload_to='chat_voice/', null=True, blank=True)
    reply_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies')
    is_deleted_for_everyone = models.BooleanField(default=False)
    is_deleted_for_sender = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'piolo_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Msg from {self.sender} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
