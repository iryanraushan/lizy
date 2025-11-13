from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from .models import DeviceToken, Notification
from .serializers import DeviceTokenSerializer, NotificationSerializer, CustomNotificationSerializer
from .services import fcm_service

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_device_token(request):
    """Register device token for push notifications"""
    serializer = DeviceTokenSerializer(data=request.data)
    if serializer.is_valid():
        # Remove existing token if exists
        DeviceToken.objects.filter(token=serializer.validated_data['token']).delete()
        
        # Create new token
        DeviceToken.objects.create(
            user=request.user,
            token=serializer.validated_data['token'],
            platform=serializer.validated_data['platform']
        )
        return Response({'message': 'Device token registered successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unregister_device_token(request):
    """Unregister device token"""
    token = request.data.get('token')
    if token:
        DeviceToken.objects.filter(user=request.user, token=token).delete()
        return Response({'message': 'Device token unregistered successfully'})
    return Response({'error': 'Token required'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get user notifications with pagination"""
    notifications = Notification.objects.filter(recipient=request.user)
    
    paginator = PageNumberPagination()
    paginator.page_size = 20
    result_page = paginator.paginate_queryset(notifications, request)
    
    serializer = NotificationSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark notification as read"""
    try:
        notification = Notification.objects.get(id=notification_id, recipient=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read"""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_custom_notification(request):
    """Send custom notification (admin/provider feature)"""
    serializer = CustomNotificationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            recipient = User.objects.get(id=serializer.validated_data['user_id'])
            success = fcm_service.send_custom_notification(
                user=recipient,
                title=serializer.validated_data['title'],
                body=serializer.validated_data['body'],
                data=serializer.validated_data.get('data', {})
            )
            
            if success:
                return Response({'message': 'Notification sent successfully'})
            else:
                return Response({'error': 'Failed to send notification'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    """Get unread notifications count"""
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'unread_count': count})