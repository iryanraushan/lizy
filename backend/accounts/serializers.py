from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['name', 'email', 'password', 'confirm_password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'validators': []}
        }
    
    def validate_email(self, value):
        # Check if user exists and is verified
        existing_user = CustomUser.objects.filter(email=value).first()
        if existing_user and existing_user.is_verified:
            raise serializers.ValidationError("User with this email already exists.")
        return value

    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        if not password or not confirm_password:
            raise serializers.ValidationError("Password and confirm_password are required")
        
        if password != confirm_password:
            raise serializers.ValidationError("Passwords don't match")
        
        try:
            validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        email = validated_data['email']
        
        # Check if unverified user exists
        existing_user = CustomUser.objects.filter(email=email, is_verified=False).first()
        if existing_user:
            # Update existing unverified user
            for key, value in validated_data.items():
                if key == 'password':
                    existing_user.set_password(value)
                else:
                    setattr(existing_user, key, value)
            existing_user.save()
            return existing_user
        
        return CustomUser.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_verified:
            raise serializers.ValidationError("Account not verified")
        data['user'] = user
        return data

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits")
        if len(value) != 6:
            raise serializers.ValidationError("OTP must be exactly 6 digits")
        return value.strip()

class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['name', 'phone', 'bio']
        
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        return value.strip()

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['name', 'phone', 'bio']
        
    def validate_name(self, value):
        if value and not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        return value.strip() if value else value