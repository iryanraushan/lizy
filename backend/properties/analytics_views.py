from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Property, Favorite, PropertyView

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def provider_analytics(request):
    """Get comprehensive analytics for provider dashboard"""
    if request.user.role != 'provider':
        return Response(
            {"error": "Only providers can access analytics"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Date ranges
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Get provider's properties
    properties = Property.objects.filter(owner=request.user)

    if not properties.exists():
        analytics_data = {
            'total_properties': 0,
            'active_properties': 0,
            'total_views': 0,
            'total_favorites': 0,
            'unique_viewers': 0,
            'views_this_week': 0,
            'views_this_month': 0,
            'favorites_this_week': 0,
            'favorites_this_month': 0,
            'top_performing_properties': [],
            'recent_activity': [],
        }
        return Response(analytics_data)

    # ...existing code for analytics if properties exist...
    # Basic counts
    total_properties = properties.count()
    active_properties = properties.filter(isActive=True).count()

    # Views analytics
    all_views = PropertyView.objects.filter(property__owner=request.user)
    total_views = all_views.count()
    views_this_week = all_views.filter(createdAt__gte=week_ago).count()
    views_this_month = all_views.filter(createdAt__gte=month_ago).count()
    unique_viewers = all_views.filter(user__isnull=False).values('user').distinct().count()

    # Favorites analytics
    all_favorites = Favorite.objects.filter(property__owner=request.user)
    total_favorites = all_favorites.count()
    favorites_this_week = all_favorites.filter(createdAt__gte=week_ago).count()
    favorites_this_month = all_favorites.filter(createdAt__gte=month_ago).count()

    # Top performing properties (by views + favorites)
    top_properties = properties.annotate(
        view_count=Count('views'),
        favorite_count=Count('favorited_by'),
        views_this_week=Count('views', filter=Q(views__createdAt__gte=week_ago)),
        views_this_month=Count('views', filter=Q(views__createdAt__gte=month_ago)),
        favorites_this_week=Count('favorited_by', filter=Q(favorited_by__createdAt__gte=week_ago)),
        favorites_this_month=Count('favorited_by', filter=Q(favorited_by__createdAt__gte=month_ago)),
    ).order_by('-view_count', '-favorite_count')[:5]

    # Recent activity (last 10 views and favorites)
    recent_views = PropertyView.objects.filter(
        property__owner=request.user
    ).select_related('user', 'property').order_by('-createdAt')[:5]

    recent_favorites = Favorite.objects.filter(
        property__owner=request.user
    ).select_related('user', 'property').order_by('-createdAt')[:5]

    # Combine and sort recent activity
    recent_activity = []

    for view in recent_views:
        recent_activity.append({
            'type': 'view',
            'user_name': view.user.name if view.user else 'Anonymous',
            'property_title': view.property.title,
            'property_id': view.property.id,
            'created_at': view.createdAt,
            'message': f"{view.user.name if view.user else 'Someone'} viewed {view.property.title}"
        })

    for favorite in recent_favorites:
        recent_activity.append({
            'type': 'favorite',
            'user_name': favorite.user.name,
            'property_title': favorite.property.title,
            'property_id': favorite.property.id,
            'created_at': favorite.createdAt,
            'message': f"{favorite.user.name} favorited {favorite.property.title}"
        })

    # Sort by date
    recent_activity.sort(key=lambda x: x['created_at'], reverse=True)
    recent_activity = recent_activity[:10]

    # Prepare top properties data
    top_properties_data = []
    for prop in top_properties:
        top_properties_data.append({
            'id': prop.id,
            'title': prop.title,
            'type': prop.type,
            'category': prop.category,
            'availability': prop.availability,
            'createdAt': prop.createdAt,
            'total_views': prop.view_count,
            'total_favorites': prop.favorite_count,
            'unique_viewers': prop.views.filter(user__isnull=False).values('user').distinct().count(),
            'views_this_week': prop.views_this_week,
            'views_this_month': prop.views_this_month,
            'favorites_this_week': prop.favorites_this_week,
            'favorites_this_month': prop.favorites_this_month,
        })

    analytics_data = {
        'total_properties': total_properties,
        'active_properties': active_properties,
        'total_views': total_views,
        'total_favorites': total_favorites,
        'unique_viewers': unique_viewers,
        'views_this_week': views_this_week,
        'views_this_month': views_this_month,
        'favorites_this_week': favorites_this_week,
        'favorites_this_month': favorites_this_month,
        'top_performing_properties': top_properties_data,
        'recent_activity': recent_activity,
    }
    return Response(analytics_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def property_analytics_detail(request, property_id):
    """Get detailed analytics for a specific property"""
    try:
        property_obj = Property.objects.get(id=property_id, owner=request.user)
    except Property.DoesNotExist:
        return Response(
            {"error": "Property not found or access denied"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Date ranges
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Views analytics
    views = PropertyView.objects.filter(property=property_obj)
    total_views = views.count()
    views_this_week = views.filter(createdAt__gte=week_ago).count()
    views_this_month = views.filter(createdAt__gte=month_ago).count()
    unique_viewers = views.filter(user__isnull=False).values('user').distinct().count()
    
    # Favorites analytics
    favorites = Favorite.objects.filter(property=property_obj)
    total_favorites = favorites.count()
    favorites_this_week = favorites.filter(createdAt__gte=week_ago).count()
    favorites_this_month = favorites.filter(createdAt__gte=month_ago).count()
    
    # Recent viewers
    recent_views = views.select_related('user').order_by('-createdAt')[:10]
    recent_viewers = []
    for view in recent_views:
        recent_viewers.append({
            'user_name': view.user.name if view.user else 'Anonymous',
            'user_id': view.user.id if view.user else None,
            'viewed_at': view.createdAt,
            'ip_address': view.ip_address if not view.user else None
        })
    
    # Recent favorites
    recent_favorites_list = favorites.select_related('user').order_by('-createdAt')[:10]
    recent_favoriters = []
    for favorite in recent_favorites_list:
        recent_favoriters.append({
            'user_name': favorite.user.name,
            'user_id': favorite.user.id,
            'favorited_at': favorite.createdAt
        })
    
    analytics_data = {
        'property_id': property_obj.id,
        'property_title': property_obj.title,
        'total_views': total_views,
        'total_favorites': total_favorites,
        'unique_viewers': unique_viewers,
        'views_this_week': views_this_week,
        'views_this_month': views_this_month,
        'favorites_this_week': favorites_this_week,
        'favorites_this_month': favorites_this_month,
        'recent_viewers': recent_viewers,
        'recent_favoriters': recent_favoriters,
    }
    
    return Response(analytics_data)