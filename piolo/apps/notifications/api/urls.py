from django.urls import path

from .views import (
    NotificationArchiveAPIView,
    NotificationListAPIView,
    NotificationReadAllAPIView,
    NotificationReadAPIView,
    NotificationUnreadCountAPIView,
    WhatsAppWebhookAPIView,
)

app_name = 'api_notifications'

urlpatterns = [
    path('', NotificationListAPIView.as_view(), name='list'),
    path('unread-count/', NotificationUnreadCountAPIView.as_view(), name='unread_count'),
    path('read-all/', NotificationReadAllAPIView.as_view(), name='read_all'),
    path('<uuid:pk>/read/', NotificationReadAPIView.as_view(), name='read'),
    path('<uuid:pk>/archive/', NotificationArchiveAPIView.as_view(), name='archive'),
    path('whatsapp/webhook/', WhatsAppWebhookAPIView.as_view(), name='whatsapp_webhook'),
]

