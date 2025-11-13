from django.contrib import admin
from .models import ChatRoom, Message

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['seeker', 'provider', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['seeker__name', 'provider__name']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'chat_room', 'content', 'created_at']
    list_filter = ['created_at']
    search_fields = ['sender__name', 'content']