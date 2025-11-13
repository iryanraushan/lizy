from django.db import models
from django.contrib.auth import get_user_model
import secrets
import string

User = get_user_model()

def generate_unique_id():
    """Generate a unique 16-digit alphanumeric ID"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(16))

class DeviceToken(models.Model):
    id = models.CharField(max_length=16, primary_key=True, default=generate_unique_id, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='device_tokens')
    token = models.TextField(unique=True)
    platform = models.CharField(max_length=10, choices=[('ios', 'iOS'), ('android', 'Android')])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.name} - {self.platform}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('message', 'New Message'),
        ('favorite', 'Property Favorited'),
        ('property_update', 'Property Update'),
        ('custom', 'Custom Notification'),
    ]

    id = models.CharField(max_length=16, primary_key=True, default=generate_unique_id, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    title = models.CharField(max_length=200)
    body = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.name}"