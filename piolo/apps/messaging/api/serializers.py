from rest_framework import serializers
from apps.messaging.models import Conversation, Message
from apps.accounts.api.serializers import UserSerializer
from apps.properties.models import Property

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    voice_url = serializers.SerializerMethodField()
    reply_to_id = serializers.ReadOnlyField(source='reply_to.id')
    reply_to_content = serializers.ReadOnlyField(source='reply_to.content')
    time_formatted = serializers.SerializerMethodField()

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            try:
                url = obj.file.url
                return request.build_absolute_uri(url) if request else url
            except Exception:
                pass
        return None

    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None

    def get_voice_url(self, obj):
        request = self.context.get('request')
        if obj.voice:
            try:
                url = obj.voice.url
                return request.build_absolute_uri(url) if request else url
            except Exception:
                pass
        return None

    def get_time_formatted(self, obj):
        if obj.created_at:
            return obj.created_at.strftime('%H:%M')
        return ""

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'content', 'file_url', 'file_name', 'voice_url',
            'reply_to_id', 'reply_to_content', 'is_read', 'created_at', 'time_formatted',
            'is_deleted_for_everyone', 'is_deleted_for_sender'
        ]

class SimplePropertySerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    def get_cover_image(self, obj):
        request = self.context.get('request')
        if obj.main_image:
            try:
                url = obj.main_image.url
                return request.build_absolute_uri(url) if request else url
            except Exception:
                pass
        first_img = obj.images.first()
        if first_img and first_img.image:
            try:
                url = first_img.image.url
                return request.build_absolute_uri(url) if request else url
            except Exception:
                pass
        return None

    class Meta:
        model = Property
        fields = ['id', 'title', 'slug', 'property_type', 'city', 'price', 'cover_image']

class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    property = SimplePropertySerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    def get_other_user(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        other = obj.landlord if (user and user.id == obj.tenant_id) else obj.tenant
        return UserSerializer(other, context=self.context).data if other else None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        if not user:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=user).count()

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if not last:
            return None
        if last.content:
            return last.content[:60]
        if last.file:
            return "📎 Fichier joint"
        if last.voice:
            return "🎤 Message vocal"
        return "Message"

    class Meta:
        model = Conversation
        fields = ['id', 'property', 'other_user', 'unread_count', 'last_message', 'updated_at']
