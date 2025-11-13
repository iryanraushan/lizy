from django.contrib import admin
from .models import Property, Favorite, PropertyView

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'category', 'listingType', 'availability', 'owner', 'isActive', 'createdAt']
    list_filter = ['type', 'category', 'listingType', 'availability', 'isActive', 'createdAt']
    search_fields = ['title', 'location', 'city', 'owner__name', 'owner__email']
    readonly_fields = ['createdAt', 'updatedAt']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'type', 'category', 'roomConfig', 'listingType')
        }),
        ('Financial Details', {
            'fields': ('minimumPrice', 'maximumPrice', 'deposit')
        }),
        ('Property Details', {
            'fields': ('areaSize', 'availability', 'furnishingStatus', 'genderPreference', 'availableFrom')
        }),
        ('Location', {
            'fields': ('location', 'city', 'state', 'country', 'latitude', 'longitude')
        }),
        ('Additional Info', {
            'fields': ('amenities', 'imageIds')
        }),
        ('Ownership & Status', {
            'fields': ('owner', 'isActive')
        }),
        ('Timestamps', {
            'fields': ('createdAt', 'updatedAt'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'property', 'createdAt']
    list_filter = ['createdAt', 'property__category', 'property__listingType']
    search_fields = ['user__name', 'user__email', 'property__title', 'property__location']
    readonly_fields = ['createdAt']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'property')

@admin.register(PropertyView)
class PropertyViewAdmin(admin.ModelAdmin):
    list_display = ['property', 'user', 'ip_address', 'createdAt']
    list_filter = ['createdAt', 'property__category', 'property__listingType']
    search_fields = ['user__name', 'user__email', 'property__title', 'ip_address']
    readonly_fields = ['createdAt', 'user_agent']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'property')
