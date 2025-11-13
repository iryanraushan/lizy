from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from utils.email import send_email
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer, OTPVerifySerializer, UpdateUserSerializer
from utils.otp import generate_otp
from django.utils import timezone
from datetime import timedelta
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

def clear_otp_session(request, session_key):
    """Helper method to clear OTP from session"""
    if session_key in request.session:
        del request.session[session_key]

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        print(f'Serializer Errors: {serializer.errors}')
    if serializer.is_valid():
        user = serializer.save()
        otp = generate_otp()
        request.session[f'otp_{user.email}'] = {
            'code': otp,
            'created_at': timezone.now().isoformat(),
            'attempts': 0
        }
        email_sent = send_email(
            subject='Verify Your Account - Lizy',
            template_name='emails/otp_verification.html',
            context={'name': user.name, 'otp': otp},
            recipient_email=user.email,
            fail_silently=False
        )
        if not email_sent:
            clear_otp_session(request, f'otp_{user.email}')
            return Response({'error': 'Failed to send OTP email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({
            'message': 'Registration successful. Check your email for OTP.',
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def verify_otp(request):
    serializer = OTPVerifySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']
    session_data = request.session.get(f'otp_{email}')        
    if not session_data:
        return Response({'error': 'OTP expired or not found'}, status=status.HTTP_400_BAD_REQUEST)
    
    created_at = timezone.datetime.fromisoformat(session_data['created_at'])
    if timezone.now() - created_at > timedelta(minutes=10):
        clear_otp_session(request, f'otp_{email}')
        return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
    
    if session_data['attempts'] >= 5:
        clear_otp_session(request, f'otp_{email}')
        return Response({'error': 'Too many attempts. Generate new OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
    stored_otp = str(session_data['code']).strip()
    received_otp = str(otp).strip()
    
    if stored_otp == received_otp:
        try:
            with transaction.atomic():
                user = CustomUser.objects.select_for_update().get(email=email)
                user.is_verified = True
                user.save()
            
            send_email(
                subject='Welcome to Lizy - Registration Complete!',
                template_name='emails/registration_success.html',
                context={'name': user.name, 'role': user.role},
                recipient_email=user.email
            )
            
            clear_otp_session(request, f'otp_{email}')
            return Response({'message': 'Account verified successfully'})
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        session_data['attempts'] += 1
        request.session[f'otp_{email}'] = session_data
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def resend_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        validate_email(email)
    except ValidationError:
        return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.get(email=email, is_verified=False)
        otp = generate_otp()
        request.session[f'otp_{email}'] = {
            'code': otp,
            'created_at': timezone.now().isoformat(),
            'attempts': 0
        }
        email_sent = send_email(
            subject='Verify Your Account - Lizy',
            template_name='emails/otp_verification.html',
            context={'name': user.name, 'otp': otp},
            recipient_email=email,
            fail_silently=False
        )
        if not email_sent:
            return Response({'error': 'Failed to send OTP email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'message': 'New OTP sent successfully'})
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found or already verified'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'bio': user.bio,
                'role': user.role,
                'date_joined': user.date_joined.isoformat(),
                'is_verified': user.is_verified
            }
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    serializer = UpdateUserSerializer(user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    return Response({
        'message': 'Profile updated successfully',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'bio': user.bio,
            'role': user.role,
            'is_verified': user.is_verified
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    except TokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def validate_token(request):
    user = request.user
    if not user.is_verified:
        return Response({'error': 'Account not verified'}, status=status.HTTP_403_FORBIDDEN)
    
    return Response({
        'valid': True,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'bio': user.bio,
            'role': user.role,
            'date_joined': user.date_joined.isoformat(),
            'is_verified': user.is_verified
        }
    })

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        validate_email(email)
    except ValidationError:
        return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.get(email=email)
        
        if not user.is_verified:
            return Response({'error': 'Please register first. Account not verified.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate OTP for password reset
        otp = generate_otp()
        request.session[f'reset_otp_{email}'] = {
            'code': otp,
            'created_at': timezone.now().isoformat(),
            'attempts': 0
        }
        
        email_sent = send_email(
            subject='Password Reset - Lizy',
            template_name='emails/password_reset_otp.html',
            context={'name': user.name, 'otp': otp},
            recipient_email=email,
            fail_silently=False
        )
        
        if not email_sent:
            clear_otp_session(request, f'reset_otp_{email}')
            return Response({'error': 'Failed to send reset email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'message': 'Password reset OTP sent to your email'})
        
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def verify_reset_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    if not email or not otp:
        return Response({'error': 'Email and OTP required'}, status=status.HTTP_400_BAD_REQUEST)
    
    session_data = request.session.get(f'reset_otp_{email}')
    if not session_data:
        return Response({'error': 'OTP expired or not found'}, status=status.HTTP_400_BAD_REQUEST)
    
    created_at = timezone.datetime.fromisoformat(session_data['created_at'])
    if timezone.now() - created_at > timedelta(minutes=10):
        del request.session[f'reset_otp_{email}']
        return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
    
    if session_data['attempts'] >= 5:
        del request.session[f'reset_otp_{email}']
        return Response({'error': 'Too many attempts. Request new OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
    stored_otp = str(session_data['code']).strip()
    received_otp = str(otp).strip()
    
    if stored_otp == received_otp:
        # Mark as verified for password reset
        request.session[f'reset_verified_{email}'] = {
            'verified': True,
            'created_at': timezone.now().isoformat()
        }
        del request.session[f'reset_otp_{email}']
        return Response({'message': 'OTP verified successfully'})
    else:
        session_data['attempts'] += 1
        request.session[f'reset_otp_{email}'] = session_data
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    
    if not email or not new_password:
        return Response({'error': 'Email and new password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if OTP was verified
    reset_verified = request.session.get(f'reset_verified_{email}')
    if not reset_verified or not reset_verified.get('verified'):
        return Response({'error': 'OTP verification required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if verification is still valid (30 minutes)
    created_at = timezone.datetime.fromisoformat(reset_verified['created_at'])
    if timezone.now() - created_at > timedelta(minutes=30):
        del request.session[f'reset_verified_{email}']
        return Response({'error': 'Verification expired. Please start again'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        # Clear verification session
        del request.session[f'reset_verified_{email}']
        
        return Response({'message': 'Password reset successfully'})
        
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({'error': 'Current password and new password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    
    # Verify current password
    if not user.check_password(current_password):
        return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Set new password
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    password = request.data.get('password')
    
    if not password:
        return Response({'error': 'Password required to delete account'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    
    # Verify password
    if not user.check_password(password):
        return Response({'error': 'Incorrect password'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            # Delete user account
            user.delete()
        
        return Response({'message': 'Account deleted successfully'})
        
    except Exception as e:
        return Response({'error': 'Failed to delete account'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

