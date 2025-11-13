from django.db import models
from django.contrib.auth import get_user_model
import secrets
import string

User = get_user_model()

def generate_unique_id():
    """Generate a unique 16-digit alphanumeric ID"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(16))

class ProblemReport(models.Model):
    CATEGORY_CHOICES = [
        ('technical', 'Technical Issue'),
        ('account', 'Account Problem'),
        ('property', 'Property Listing'),
        ('other', 'Other'),
    ]
    
    id = models.CharField(max_length=16, primary_key=True, default=generate_unique_id, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subject} - {self.email}"