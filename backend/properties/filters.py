import django_filters
from .models import Property

class PropertyFilter(django_filters.FilterSet):
    type = django_filters.ChoiceFilter(choices=Property.PROPERTY_TYPES)
    category = django_filters.ChoiceFilter(choices=Property.CATEGORIES)
    listingType = django_filters.ChoiceFilter(choices=Property.LISTING_TYPES)
    availability = django_filters.ChoiceFilter(choices=Property.AVAILABILITY_STATUS)
    roomConfig = django_filters.ChoiceFilter(choices=Property.ROOM_CONFIGS)
    city = django_filters.CharFilter(lookup_expr='icontains')
    location = django_filters.CharFilter(lookup_expr='icontains')
    min_price = django_filters.NumberFilter(field_name='minimumPrice', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='minimumPrice', lookup_expr='lte')
    furnishingStatus = django_filters.ChoiceFilter(choices=Property.FURNISHING_STATUS)
    genderPreference = django_filters.ChoiceFilter(choices=Property.GENDER_PREFERENCES)
    
    class Meta:
        model = Property
        fields = [
            'type', 'category', 'listingType', 'availability', 
            'roomConfig', 'city', 'location', 'furnishingStatus', 
            'genderPreference'
        ]