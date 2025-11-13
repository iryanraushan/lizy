from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
import secrets
import string

User = get_user_model()

def generate_unique_id():
    """Generate a unique 16-digit alphanumeric ID"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(16))

class Property(models.Model):
    PROPERTY_TYPES = [
        ('1BHK', '1 BHK Apartment'),
        ('2BHK', '2 BHK Apartment'),
        ('3BHK', '3 BHK Apartment'),
        ('4BHK', '4+ BHK Apartment'),
        ('Studio', 'Studio Apartment'),
        ('SingleRoom', 'Single Room'),
        ('DoubleRoom', 'Double Room'),
        ('TripleRoom', 'Triple Room'),
        ('PG_Single', 'PG - Single Room'),
        ('PG_Double', 'PG - Double Sharing'),
        ('PG_Triple', 'PG - Triple Sharing'),
        ('PG_Quad', 'PG - 4+ Sharing'),
        ('House', 'Independent House'),
        ('Villa', 'Villa'),
        ('Cottage', 'Cottage House'),
        ('Office', 'Office Space'),
        ('Shop', 'Commercial Shop'),
        ('Warehouse', 'Warehouse'),
        ('Land', 'Plot/Land'),
        ('Other', 'Other'),
    ]
    
    CATEGORIES = [
        ('apartment', 'Apartment'),
        ('room', 'Room'),
        ('pg', 'PG'),
        ('house', 'House'),
        ('villa', 'Villa'),
        ('cottage', 'Cottage'),
        ('commercial', 'Commercial'),
        ('land', 'Land'),
        ('other', 'Other'),
    ]
    
    ROOM_CONFIGS = [
        ('1bed', '1 Bedroom'),
        ('2bed', '2 Bedrooms'),
        ('3bed', '3 Bedrooms'),
        ('4bed', '4+ Bedrooms'),
        ('1BHK', '1 BHK'),
        ('2BHK', '2 BHK'),
        ('3BHK', '3 BHK'),
        ('4BHK', '4+ BHK'),
        ('single', 'Single Occupancy'),
        ('double', 'Double Sharing'),
        ('triple', 'Triple Sharing'),
        ('quad', '4+ Sharing'),
        ('studio', 'Studio'),
    ]
    
    LISTING_TYPES = [
        ('rent', 'For Rent'),
        ('sale', 'For Sale'),
    ]
    
    AVAILABILITY_STATUS = [
        ('Available', 'Available Now'),
        ('Occupied', 'Currently Occupied'),
        ('Maintenance', 'Under Maintenance'),
        ('Coming_Soon', 'Available Soon'),
    ]
    
    FURNISHING_STATUS = [
        ('Fully', 'Fully Furnished'),
        ('Semi', 'Semi Furnished'),
        ('Unfurnished', 'Unfurnished'),
    ]
    
    GENDER_PREFERENCES = [
        ('Male', 'Male Only'),
        ('Female', 'Female Only'),
        ('Unisex', 'Both Male & Female'),
        ('Any', 'No Preference'),
    ]
    
    # Basic Information
    id = models.CharField(max_length=16, primary_key=True, default=generate_unique_id, editable=False)
    type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    roomConfig = models.CharField(max_length=20, choices=ROOM_CONFIGS, blank=True)
    listingType = models.CharField(max_length=10, choices=LISTING_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Financial Details
    deposit = models.CharField(max_length=100, blank=True)
    minimumPrice = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    maximumPrice = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))], blank=True, null=True)
    
    # Property Details
    areaSize = models.CharField(max_length=50, blank=True)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_STATUS, default='Available')
    furnishingStatus = models.CharField(max_length=20, choices=FURNISHING_STATUS, default='Unfurnished')
    genderPreference = models.CharField(max_length=10, choices=GENDER_PREFERENCES, default='Any')
    
    # Location
    location = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    latitude = models.DecimalField(max_digits=20, decimal_places=15, blank=True, null=True)
    longitude = models.DecimalField(max_digits=20, decimal_places=15, blank=True, null=True)
    
    # Amenities and Images
    amenities = models.JSONField(default=list, blank=True)
    imageIds = models.JSONField(default=list, blank=True)
    
    # Availability Date
    availableFrom = models.DateField(blank=True, null=True)
    
    # Ownership and Status
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    isActive = models.BooleanField(default=True)
    
    # Timestamps
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Properties'
        ordering = ['-createdAt']
    
    def __str__(self):
        return f"{self.title} - {self.get_type_display()}"
    
    @property
    def total_views(self):
        return self.views.count()
    
    @property
    def total_favorites(self):
        return self.favorited_by.count()
    
    @property
    def unique_viewers(self):
        return self.views.filter(user__isnull=False).values('user').distinct().count()

class Favorite(models.Model):
    """Model for user favorites - like Instagram likes"""
    id = models.CharField(max_length=16, primary_key=True, default=generate_unique_id, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='favorited_by')
    createdAt = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'property')  
        ordering = ['-createdAt']
    
    def __str__(self):
        return f"{self.user.name} favorited {self.property.title}"

class PropertyView(models.Model):
    """Model for tracking property views for analytics"""
    id = models.CharField(max_length=16, primary_key=True, default=generate_unique_id, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='property_views', null=True, blank=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='views')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-createdAt']
    
    def __str__(self):
        user_info = self.user.name if self.user else f"Anonymous ({self.ip_address})"
        return f"{user_info} viewed {self.property.title}"
