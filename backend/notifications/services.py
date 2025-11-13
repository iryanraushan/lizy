import json
import requests
from django.conf import settings
from .models import DeviceToken, Notification

class FCMService:
    def __init__(self):
        self.server_key = getattr(settings, 'FCM_SERVER_KEY', None)
        self.fcm_url = 'https://fcm.googleapis.com/fcm/send'

    def send_notification(self, user, title, body, data=None, notification_type='custom'):
        """Send push notification to user's devices"""
        if not self.server_key:
            print("FCM_SERVER_KEY not configured")
            return False

        # Get user's active device tokens
        device_tokens = DeviceToken.objects.filter(user=user, is_active=True)
        
        if not device_tokens.exists():
            print(f"No active device tokens for user {user.name}")
            return False

        # Create notification record
        notification = Notification.objects.create(
            recipient=user,
            title=title,
            body=body,
            notification_type=notification_type,
            data=data or {}
        )

        success_count = 0
        for device_token in device_tokens:
            if self._send_to_device(device_token.token, title, body, data):
                success_count += 1

        if success_count > 0:
            notification.is_sent = True
            notification.save()
            return True
        
        return False

    def _send_to_device(self, token, title, body, data=None):
        """Send notification to specific device token"""
        headers = {
            'Authorization': f'key={self.server_key}',
            'Content-Type': 'application/json',
        }

        payload = {
            'to': token,
            'notification': {
                'title': title,
                'body': body,
                'sound': 'default',
            },
            'data': data or {},
            'priority': 'high',
        }

        try:
            response = requests.post(self.fcm_url, headers=headers, json=payload)
            return response.status_code == 200
        except Exception as e:
            print(f"FCM Error: {e}")
            return False

    def send_message_notification(self, recipient, sender, message_content):
        """Send notification for new message"""
        title = f"New message from {sender.name}"
        body = message_content[:100] + "..." if len(message_content) > 100 else message_content
        
        data = {
            'type': 'message',
            'sender_id': str(sender.id),
            'sender_name': sender.name,
        }
        
        return self.send_notification(recipient, title, body, data, 'message')

    def send_favorite_notification(self, property_owner, user, property_title):
        """Send notification when property is favorited"""
        title = "Property Favorited!"
        body = f"{user.name} added your property '{property_title}' to favorites"
        
        data = {
            'type': 'favorite',
            'user_id': str(user.id),
            'user_name': user.name,
        }
        
        return self.send_notification(property_owner, title, body, data, 'favorite')

    def send_custom_notification(self, user, title, body, data=None):
        """Send custom notification"""
        return self.send_notification(user, title, body, data, 'custom')

# Initialize FCM service
fcm_service = FCMService()