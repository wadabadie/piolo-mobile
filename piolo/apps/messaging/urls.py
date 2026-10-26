from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    path('', views.conversations_list, name='list'),
    path('start/<uuid:property_id>/', views.start_conversation, name='start_conversation'),
    path('chat/<int:conversation_id>/', views.chat_room, name='chat_room'),
    path('api/send/<int:conversation_id>/', views.api_send_message, name='api_send_message'),
    path('api/fetch/<int:conversation_id>/', views.api_fetch_messages, name='api_fetch_messages'),
    path('api/delete/<int:message_id>/', views.api_delete_message, name='api_delete_message'),
]
