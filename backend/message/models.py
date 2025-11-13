from django.db import models
from django.contrib.auth import get_user_model
import secrets
import string

User = get_user_model()

def generate_unique_id():
    """Generate a unique 16-digit alphanumeric ID"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(16))

class ChatRoom(models.Model):
    id = models.CharField(max_length=16, primary_key=True, default=generate_unique_id, editable=False)
    seeker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seeker_chats')
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='provider_chats')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('seeker', 'provider')
        ordering = ['-updated_at']
    
    @property
    def last_message(self):
        return self.messages.last()
    
    def __str__(self):
        return f"{self.seeker.name} - {self.provider.name}"

class Message(models.Model):
    id = models.CharField(max_length=16, primary_key=True, default=generate_unique_id, editable=False)
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    @property
    def display_content(self):
        return "This message has been deleted" if self.is_deleted else self.content
    
    def __str__(self):
        return f"{self.sender.name}: {self.content[:50]}"