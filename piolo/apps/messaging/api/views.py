from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q

from apps.messaging.models import Conversation, Message
from apps.properties.models import Property
from .serializers import ConversationSerializer, MessageSerializer
from apps.notifications.models import Notification
from apps.notifications.services import create_notification
from apps.notifications.email_service import send_message_email

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            Q(tenant=request.user) | Q(landlord=request.user)
        ).order_by('-updated_at')
        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data)


class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, property_id):
        # Allow starting by uuid or id
        try:
            prop = Property.objects.get(id=property_id)
        except (Property.DoesNotExist, ValueError):
            prop = get_object_or_404(Property, slug=str(property_id))

        landlord = prop.owner
        tenant = request.user

        if landlord == tenant:
            # Check if there's already any conversation or return error/same user
            return Response({'error': 'Vous ne pouvez pas engager une conversation avec vous-même.'}, status=status.HTTP_400_BAD_REQUEST)

        conversation, created = Conversation.objects.get_or_create(
            tenant=tenant,
            landlord=landlord,
            property=prop
        )
        return Response({'conversation_id': conversation.id, 'created': created}, status=status.HTTP_200_OK)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if request.user != conversation.tenant and request.user != conversation.landlord:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Mark received messages as read
        Message.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)

        messages = conversation.messages.exclude(
            sender=request.user, is_deleted_for_sender=True
        ).order_by('created_at')
        conv_data = ConversationSerializer(conversation, context={'request': request}).data
        msgs_data = MessageSerializer(messages, many=True, context={'request': request}).data

        return Response({
            'conversation': conv_data,
            'messages': msgs_data
        })


from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if request.user != conversation.tenant and request.user != conversation.landlord:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get('content', '')
        if isinstance(content, str):
            content = content.strip()
        
        file = request.FILES.get('file')
        voice = request.FILES.get('voice')
        reply_to_id = request.data.get('reply_to_id')

        reply_to_msg = None
        if reply_to_id and str(reply_to_id).isdigit():
            try:
                reply_to_msg = Message.objects.get(id=int(reply_to_id), conversation=conversation)
            except Message.DoesNotExist:
                pass

        if content or file or voice:
            msg = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=content or '',
                file=file,
                voice=voice,
                reply_to=reply_to_msg
            )
            conversation.save() # touch updated_at
            recipient = conversation.landlord if request.user == conversation.tenant else conversation.tenant
            create_notification(
                recipient,
                Notification.Kind.MESSAGE,
                'Nouveau message',
                f'{request.user.get_full_name() or request.user.email} vous a envoyé un message.',
                actor=request.user,
                url=f'/messages/{conversation.id}',
                entity_type='conversation',
                entity_id=conversation.id,
                data={'message_id': msg.id, 'property_id': str(conversation.property_id) if conversation.property_id else None},
                priority=Notification.Priority.NORMAL,
                dedupe_key=f'message:{msg.id}',
            )
            send_message_email(msg, recipient)
            serializer = MessageSerializer(msg, context={'request': request})

            # Broadcast instantané WebSocket (<20ms)
            try:
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f'chat_{conversation.id}',
                        {
                            'type': 'chat_message',
                            'message': serializer.data
                        }
                    )
            except Exception:
                pass

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response({'error': 'Le message ne peut pas être vide.'}, status=status.HTTP_400_BAD_REQUEST)


class PollMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if request.user != conversation.tenant and request.user != conversation.landlord:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        last_id = request.GET.get('last_id', 0)
        try:
            last_id = int(last_id)
        except ValueError:
            last_id = 0

        new_messages = conversation.messages.filter(id__gt=last_id).exclude(
            sender=request.user, is_deleted_for_sender=True
        ).order_by('created_at')
        new_messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)

        serializer = MessageSerializer(new_messages, many=True, context={'request': request})
        return Response({'messages': serializer.data})


class DeleteMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        msg = get_object_or_404(Message, id=message_id)
        is_sender = (msg.sender == request.user or getattr(request.user, 'role', '') == 'ADMIN')
        is_participant = (request.user == msg.conversation.tenant or request.user == msg.conversation.landlord)
        if not is_participant:
            return Response({'error': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        delete_type = request.data.get('type', 'everyone') # 'everyone' or 'me'
        if delete_type == 'everyone':
            if not is_sender:
                return Response({'error': "Vous ne pouvez supprimer ce message pour tous que si vous en êtes l'expéditeur."}, status=status.HTTP_403_FORBIDDEN)
            msg.is_deleted_for_everyone = True
            msg.content = 'Ce message a été supprimé'
            if msg.file:
                try:
                    msg.file.delete(save=False)
                except Exception:
                    pass
                msg.file = None
            if msg.voice:
                try:
                    msg.voice.delete(save=False)
                except Exception:
                    pass
                msg.voice = None
            msg.save()
        else:
            msg.is_deleted_for_sender = True
            msg.save()

        # Broadcast instantané WebSocket de la suppression
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'chat_{msg.conversation_id}',
                    {
                        'type': 'message_deleted',
                        'message_id': msg.id,
                        'delete_type': delete_type
                    }
                )
        except Exception:
            pass

        return Response({'success': True, 'message_id': msg.id, 'is_deleted_for_everyone': msg.is_deleted_for_everyone})
    
    def delete(self, request, message_id):
        return self.post(request, message_id)
