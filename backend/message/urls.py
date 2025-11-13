from django.urls import path
from .views import ChatRoomListView, ChatRoomCreateView, MessageListView, MessageCreateView, MessageDeleteView

urlpatterns = [
    path('chats/', ChatRoomListView.as_view(), name='chat-list'),
    path('chats/create/', ChatRoomCreateView.as_view(), name='chat-create'),
    path('chats/<int:room_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('chats/<int:room_id>/messages/create/', MessageCreateView.as_view(), name='message-create'),
    path('chats/<int:room_id>/messages/<int:message_id>/delete/', MessageDeleteView.as_view(), name='message-delete'),
]