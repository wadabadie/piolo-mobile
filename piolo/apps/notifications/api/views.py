from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Notification
from .serializers import NotificationSerializer


def active_for(user):
    now = timezone.now()
    return Notification.objects.filter(
        recipient=user,
        is_archived=False,
    ).filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now))


class NotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = active_for(request.user)
        unread_only = str(request.query_params.get('unread', '')).lower() in {'1', 'true', 'yes'}
        if unread_only:
            queryset = queryset.filter(is_read=False)

        try:
            limit = min(max(int(request.query_params.get('limit', 30)), 1), 50)
        except (TypeError, ValueError):
            limit = 30

        notifications = queryset.select_related('actor')[:limit]
        unread_count = active_for(request.user).filter(is_read=False).count()
        return Response({
            'results': NotificationSerializer(notifications, many=True, context={'request': request}).data,
            'count': queryset.count(),
            'unread_count': unread_count,
        })


class NotificationUnreadCountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'unread_count': active_for(request.user).filter(is_read=False).count()})


class NotificationReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = active_for(request.user).filter(pk=pk).first()
        if not notification:
            return Response({'detail': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        notification.mark_read()
        return Response(NotificationSerializer(notification, context={'request': request}).data)


class NotificationReadAllAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = active_for(request.user).filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now(),
        )
        return Response({'updated': updated, 'unread_count': 0})


class NotificationArchiveAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = active_for(request.user).filter(pk=pk).first()
        if not notification:
            return Response({'detail': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        notification.archive()
        return Response({'success': True, 'id': str(notification.pk)})


class WhatsAppWebhookAPIView(APIView):
    """
    Endpoint Webhook pour Meta WhatsApp Cloud API.
    - GET  : Vérification du Webhook par Meta (hub.challenge, hub.verify_token).
    - POST : Réception des statuts de livraison et des messages entrants.
    """
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        from django.conf import settings
        from django.http import HttpResponse

        mode = request.query_params.get('hub.mode')
        token = request.query_params.get('hub.verify_token')
        challenge = request.query_params.get('hub.challenge')

        expected_token = getattr(settings, 'WHATSAPP_WEBHOOK_VERIFY_TOKEN', 'piolo_wa_webhook_verify_2026')

        if mode == 'subscribe' and token == expected_token:
            return HttpResponse(challenge, content_type='text/plain', status=200)

        return Response({'error': 'Jeton de vérification invalide.'}, status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        import logging
        logger = logging.getLogger('apps.notifications.whatsapp')
        data = request.data
        logger.info("[WhatsApp Webhook Event] %s", data)
        return Response({'status': 'EVENT_RECEIVED'}, status=status.HTTP_200_OK)

