from rest_framework import serializers
from .models import DeviceToken, Notification

class DeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceToken
        fields = ['token', 'platform']

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'notification_type', 'data', 'is_read', 'created_at', 'sender_name']

class CustomNotificationSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    title = serializers.CharField(max_length=200)
    body = serializers.CharField()
    data = serializers.JSONField(required=False)