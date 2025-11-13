from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import secrets
import string

class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, name, password, **extra_fields)

def generate_unique_id():
    """Generate a unique 16-digit alphanumeric ID"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(16))

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('provider', 'Provider'),
        ('seeker', 'Seeker'),
    ]
    
    id = models.CharField(max_length=16, primary_key=True, default=generate_unique_id, editable=False)
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='seeker')
    is_verified = models.BooleanField(default=False)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    def __str__(self):
        return self.email