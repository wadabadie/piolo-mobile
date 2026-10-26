from django.urls import path
from . import views

urlpatterns = [
    path('', views.ConversationListView.as_view(), name='api_conv_list'),
    path('start/<str:property_id>/', views.StartConversationView.as_view(), name='api_conv_start'),
    path('<int:conversation_id>/', views.ConversationDetailView.as_view(), name='api_conv_detail'),
    path('<int:conversation_id>/send/', views.SendMessageView.as_view(), name='api_conv_send'),
    path('<int:conversation_id>/poll/', views.PollMessagesView.as_view(), name='api_conv_poll'),
    path('msg/<int:message_id>/delete/', views.DeleteMessageView.as_view(), name='api_msg_delete'),
]
