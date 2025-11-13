from rest_framework import serializers
from .models import ChatRoom, Message
from accounts.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    display_content = serializers.ReadOnlyField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'display_content', 'is_deleted', 'created_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    seeker = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'seeker', 'provider', 'other_user', 'last_message', 'updated_at']
    
    def get_last_message(self, obj):
        last_msg = obj.last_message
        if last_msg:
            return {
                'content': last_msg.display_content,
                'created_at': last_msg.created_at,
                'sender_name': last_msg.sender.name,
                'is_deleted': last_msg.is_deleted
            }
        return None
    
    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user:
            if request.user == obj.seeker:
                return UserSerializer(obj.provider).data
            else:
                return UserSerializer(obj.seeker).data
        return None