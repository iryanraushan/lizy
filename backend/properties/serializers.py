from rest_framework import serializers
from .models import Property, Favorite, PropertyView
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

class PropertyListSerializer(serializers.ModelSerializer):
    """Serializer for property list view - minimal data for cards"""
    amenities_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'type', 'category', 'listingType', 
            'areaSize', 'availableFrom', 'minimumPrice', 'maximumPrice',
            'location', 'city', 'availability', 'amenities_count'
        ]
    
    def get_amenities_count(self, obj):
        return len(obj.amenities) if obj.amenities else 0

class PropertyDetailSerializer(serializers.ModelSerializer):
    """Serializer for property detail view - complete data"""
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    owner_phone = serializers.CharField(source='owner.phone', read_only=True)
    
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['owner', 'createdAt', 'updatedAt']

class PropertyStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for status-only updates"""
    class Meta:
        model = Property
        fields = ['availability']

class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating properties"""
    furnished = serializers.CharField(write_only=True, required=False)
    price = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Property
        exclude = ['owner', 'createdAt', 'updatedAt']
    
    def validate_minimumPrice(self, value):
        if value < 0:
            raise serializers.ValidationError("Minimum price cannot be negative")
        return value
    
    def validate_maximumPrice(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Maximum price cannot be negative")
        return value
    
    def validate(self, data):
        if 'furnished' in data:
            data['furnishingStatus'] = data.pop('furnished')
        
        if 'price' in data:
            data.pop('price')
        
        if data.get('maximumPrice') and data.get('minimumPrice'):
            if data['maximumPrice'] < data['minimumPrice']:
                raise serializers.ValidationError("Maximum price cannot be less than minimum price")
        return data

class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for favorites with property details"""
    property = PropertyListSerializer(read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'user_name', 'property', 'createdAt']
        read_only_fields = ['user', 'createdAt']

class FavoriteCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating favorites"""
    
    class Meta:
        model = Favorite
        fields = ['property']
    
    def validate_property(self, value):
        if not value.isActive:
            raise serializers.ValidationError("Cannot favorite inactive property")
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        if user.role != 'seeker':
            raise serializers.ValidationError("Only seekers can favorite properties")
        
        validated_data['user'] = user
        return super().create(validated_data)

class PropertyAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for property analytics data"""
    total_views = serializers.IntegerField(read_only=True)
    total_favorites = serializers.IntegerField(read_only=True)
    unique_viewers = serializers.IntegerField(read_only=True)
    views_this_week = serializers.IntegerField(read_only=True)
    views_this_month = serializers.IntegerField(read_only=True)
    favorites_this_week = serializers.IntegerField(read_only=True)
    favorites_this_month = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'type', 'category', 'availability', 'createdAt',
            'total_views', 'total_favorites', 'unique_viewers',
            'views_this_week', 'views_this_month', 
            'favorites_this_week', 'favorites_this_month'
        ]

class ProviderAnalyticsSerializer(serializers.Serializer):
    """Serializer for provider dashboard analytics"""
    total_properties = serializers.IntegerField()
    active_properties = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_favorites = serializers.IntegerField()
    unique_viewers = serializers.IntegerField()
    views_this_week = serializers.IntegerField()
    views_this_month = serializers.IntegerField()
    favorites_this_week = serializers.IntegerField()
    favorites_this_month = serializers.IntegerField()
    top_performing_properties = PropertyAnalyticsSerializer(many=True)
    recent_activity = serializers.ListField()
    
class PropertyViewSerializer(serializers.ModelSerializer):
    """Serializer for property views"""
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = PropertyView
        fields = ['id', 'user', 'user_name', 'property', 'ip_address', 'createdAt']
        read_only_fields = ['user', 'ip_address', 'createdAt']