import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from apps.messaging.models import Conversation, Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conv_id = self.scope['url_route']['kwargs']['conv_id']
        self.room_group_name = f'chat_{self.conv_id}'
        self.user = self.scope.get('user')

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        is_allowed = await self.check_user_membership(self.conv_id, self.user)
        if not is_allowed:
            await self.close(code=4003)
            return

        # Join conversation room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('type')

            if action == 'typing':
                is_typing = bool(data.get('is_typing', True))
                user_name = self.user.get_full_name() or self.user.email
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_typing',
                        'user_id': self.user.id,
                        'user_name': user_name,
                        'is_typing': is_typing
                    }
                )

            elif action == 'mark_read':
                await self.mark_messages_as_read(self.conv_id, self.user)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'messages_read',
                        'reader_id': self.user.id
                    }
                )
        except Exception:
            pass

    # Group message handlers
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def user_typing(self, event):
        # Don't send back to the user who is typing
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_typing',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing']
            }))

    async def messages_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'messages_read',
            'reader_id': event['reader_id']
        }))

    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id'],
            'delete_type': event.get('delete_type', 'everyone')
        }))

    @database_sync_to_async
    def check_user_membership(self, conv_id, user):
        try:
            conv = Conversation.objects.get(id=conv_id)
            return user == conv.tenant or user == conv.landlord or getattr(user, 'role', '') == 'ADMIN'
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def mark_messages_as_read(self, conv_id, user):
        try:
            conv = Conversation.objects.get(id=conv_id)
            Message.objects.filter(conversation=conv, is_read=False).exclude(sender=user).update(is_read=True)
        except Exception:
            pass
