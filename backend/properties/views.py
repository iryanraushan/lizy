import traceback
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Property, Favorite
from .serializers import PropertyListSerializer, PropertyDetailSerializer, PropertyCreateUpdateSerializer, PropertyStatusUpdateSerializer, FavoriteSerializer, FavoriteCreateSerializer
from .filters import PropertyFilter
from notifications.services import fcm_service

class PropertyListView(generics.ListAPIView):
    """List properties with search and filtering"""
    serializer_class = PropertyListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'description', 'location', 'city']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Property.objects.filter(isActive=True)
        
        if user.role == 'provider':
            queryset = queryset.filter(owner=user)        
        return queryset

class PropertyDetailView(generics.RetrieveAPIView):
    """Get detailed property information"""
    queryset = Property.objects.filter(isActive=True)
    serializer_class = PropertyDetailSerializer
    permission_classes = [IsAuthenticated]

class PropertyCreateView(generics.CreateAPIView):
    """Create new property - only for providers"""
    serializer_class = PropertyCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        if self.request.user.role != 'provider':
            raise PermissionError("Only providers can create properties")
        serializer.save(owner=self.request.user)
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'provider':
            return Response(
                {"error": "Only providers can create properties"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": str(e), "details": getattr(e, 'detail', None)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class PropertyUpdateView(generics.UpdateAPIView):
    """Update property - only owner can update"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user, isActive=True)
    
    def get_serializer_class(self):
        if 'availability' in self.request.data and len(self.request.data) == 1:
            return PropertyStatusUpdateSerializer
        return PropertyCreateUpdateSerializer
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            # Return full property data for status updates
            if isinstance(serializer, PropertyStatusUpdateSerializer):
                full_serializer = PropertyDetailSerializer(instance)
                return Response(full_serializer.data)
            
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class PropertyDeleteView(generics.DestroyAPIView):
    """Delete property - only owner can delete"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user)
    
    def perform_destroy(self, instance):
        # Soft delete by setting isActive to False
        instance.isActive = False
        instance.save()

class PropertySearchView(generics.ListAPIView):
    """Advanced search with multiple filters"""
    serializer_class = PropertyListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'description', 'location', 'city']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Property.objects.filter(isActive=True)
        
        # Role-based filtering
        if user.role == 'provider':
            queryset = queryset.filter(owner=user)
        
        # Additional manual filters
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(location__icontains=search_query)
            )
        
        return queryset

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def property_filters(request):
    """Get available filter options"""
    return Response({
        'types': [{'value': choice[0], 'label': choice[1]} for choice in Property.PROPERTY_TYPES],
        'categories': [{'value': choice[0], 'label': choice[1]} for choice in Property.CATEGORIES],
        'roomConfigs': [{'value': choice[0], 'label': choice[1]} for choice in Property.ROOM_CONFIGS],
        'listingTypes': [{'value': choice[0], 'label': choice[1]} for choice in Property.LISTING_TYPES],
        'availability': [{'value': choice[0], 'label': choice[1]} for choice in Property.AVAILABILITY_STATUS],
        'furnishingStatus': [{'value': choice[0], 'label': choice[1]} for choice in Property.FURNISHING_STATUS],
        'genderPreferences': [{'value': choice[0], 'label': choice[1]} for choice in Property.GENDER_PREFERENCES],
    })

# Favorite Views
class FavoriteListView(generics.ListAPIView):
    """List user's favorite properties"""
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'seeker':
            return Favorite.objects.none()
        return Favorite.objects.filter(user=self.request.user, property__isActive=True)

class FavoriteCreateView(generics.CreateAPIView):
    """Add property to favorites"""
    serializer_class = FavoriteCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'seeker':
            return Response(
                {"error": "Only seekers can favorite properties"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        property_id = kwargs.get('property_id')
        try:
            property_obj = Property.objects.get(id=property_id, isActive=True)
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already favorited
        if Favorite.objects.filter(user=request.user, property=property_obj).exists():
            return Response(
                {"error": "Property already in favorites"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        favorite = Favorite.objects.create(user=request.user, property=property_obj)
        
        # Send notification to property owner
        fcm_service.send_favorite_notification(
            property_owner=property_obj.owner,
            user=request.user,
            property_title=property_obj.title
        )
        
        serializer = FavoriteSerializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FavoriteDeleteView(generics.DestroyAPIView):
    """Remove property from favorites"""
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        property_id = self.kwargs.get('property_id')
        try:
            return Favorite.objects.get(
                user=self.request.user, 
                property_id=property_id
            )
        except Favorite.DoesNotExist:
            return None
    
    def delete(self, request, *args, **kwargs):
        if request.user.role != 'seeker':
            return Response(
                {"error": "Only seekers can manage favorites"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        favorite = self.get_object()
        if not favorite:
            return Response(
                {"error": "Favorite not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        favorite.delete()
        return Response(
            {"message": "Property removed from favorites"}, 
            status=status.HTTP_200_OK
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, property_id):
    """Toggle favorite status - like Instagram like button"""
    if request.user.role != 'seeker':
        return Response(
            {"error": "Only seekers can favorite properties"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        property_obj = Property.objects.get(id=property_id, isActive=True)
    except Property.DoesNotExist:
        return Response(
            {"error": "Property not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    favorite, created = Favorite.objects.get_or_create(
        user=request.user, 
        property=property_obj
    )
    
    if not created:
        # Already favorited, so remove it
        favorite.delete()
        return Response({
            "favorited": False,
            "message": "Property removed from favorites"
        })
    else:
        # Newly favorited - send notification
        fcm_service.send_favorite_notification(
            property_owner=property_obj.owner,
            user=request.user,
            property_title=property_obj.title
        )
        
        return Response({
            "favorited": True,
            "message": "Property added to favorites",
            "favorite_id": favorite.id
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_favorite_status(request, property_id):
    """Check if property is favorited by current user"""
    if request.user.role != 'seeker':
        return Response({"favorited": False})
    
    is_favorited = Favorite.objects.filter(
        user=request.user, 
        property_id=property_id
    ).exists()
    
    return Response({"favorited": is_favorited})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def favorite_count(request, property_id):
    """Get total favorite count for a property"""
    try:
        property_obj = Property.objects.get(id=property_id, isActive=True)
        count = property_obj.favorited_by.count()
        return Response({"count": count})
    except Property.DoesNotExist:
        return Response(
            {"error": "Property not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
