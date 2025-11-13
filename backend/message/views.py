from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from accounts.models import CustomUser
from notifications.services import fcm_service

class ChatRoomListView(generics.ListAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            Q(seeker=user) | Q(provider=user)
        )
    
    def get_serializer_context(self):
        return {'request': self.request}

class ChatRoomCreateView(generics.CreateAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        other_user_id = request.data.get('other_user_id')
        
        try:
            other_user = CustomUser.objects.get(id=other_user_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Ensure one is seeker and other is provider
        if request.user.role == other_user.role:
            return Response(
                {'error': 'Chat only allowed between seeker and provider'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Determine seeker and provider
        if request.user.role == 'seeker':
            seeker, provider = request.user, other_user
        else:
            seeker, provider = other_user, request.user
        
        # Get or create chat room
        chat_room, created = ChatRoom.objects.get_or_create(
            seeker=seeker,
            provider=provider
        )
        
        serializer = self.get_serializer(chat_room, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        room_id = self.kwargs['room_id']
        try:
            chat_room = ChatRoom.objects.filter(
                Q(seeker=self.request.user) | Q(provider=self.request.user)
            ).get(id=room_id)
            return chat_room.messages.all()
        except ChatRoom.DoesNotExist:
            return Message.objects.none()

class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        room_id = self.kwargs['room_id']
        
        try:
            chat_room = ChatRoom.objects.filter(
                Q(seeker=request.user) | Q(provider=request.user)
            ).get(id=room_id)
        except ChatRoom.DoesNotExist:
            return Response({'error': 'Chat room not found'}, status=status.HTTP_404_NOT_FOUND)
        
        message = Message.objects.create(
            chat_room=chat_room,
            sender=request.user,
            content=request.data.get('content', '')
        )
        
        # Update chat room timestamp
        chat_room.save()
        
        # Send push notification to recipient
        recipient = chat_room.provider if request.user == chat_room.seeker else chat_room.seeker
        fcm_service.send_message_notification(recipient, request.user, message.content)
        
        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MessageDeleteView(generics.UpdateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        room_id = self.kwargs['room_id']
        message_id = self.kwargs['message_id']
        
        try:
            chat_room = ChatRoom.objects.filter(
                Q(seeker=request.user) | Q(provider=request.user)
            ).get(id=room_id)
            message = Message.objects.get(
                id=message_id,
                chat_room=chat_room,
                sender=request.user
            )
        except (ChatRoom.DoesNotExist, Message.DoesNotExist):
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
        
        message.is_deleted = True
        message.save()
        
        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_200_OK)