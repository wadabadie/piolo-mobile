from rest_framework import serializers

from apps.accounts.api.serializers import UserSerializer
from ..models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Notification
        fields = [
            'id', 'kind', 'title', 'body', 'url', 'entity_type', 'entity_id',
            'data', 'priority', 'is_read', 'is_archived', 'is_expired',
            'read_at', 'created_at', 'expires_at', 'actor',
        ]
        read_only_fields = fields

