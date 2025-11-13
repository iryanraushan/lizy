from django.urls import path
from . import views
from . import analytics_views

urlpatterns = [
    path('', views.PropertyListView.as_view(), name='property-list'),
    
    # Analytics URLs - must come before generic patterns
    path('analytics/', analytics_views.provider_analytics, name='provider-analytics'),
    
    # Static paths before dynamic ones
    path('create/', views.PropertyCreateView.as_view(), name='property-create'),
    path('search/', views.PropertySearchView.as_view(), name='property-search'),
    path('filters/', views.property_filters, name='property-filters'),
    path('favorites/', views.FavoriteListView.as_view(), name='favorite-list'),
    
    # Dynamic paths with property IDs
    path('<str:pk>/', views.PropertyDetailView.as_view(), name='property-detail'),
    path('<str:pk>/update/', views.PropertyUpdateView.as_view(), name='property-update'),
    path('<str:pk>/delete/', views.PropertyDeleteView.as_view(), name='property-delete'),
    path('<str:property_id>/favorite/', views.FavoriteCreateView.as_view(), name='favorite-create'),
    path('<str:property_id>/unfavorite/', views.FavoriteDeleteView.as_view(), name='favorite-delete'),
    path('<str:property_id>/toggle-favorite/', views.toggle_favorite, name='toggle-favorite'),
    path('<str:property_id>/favorite-status/', views.check_favorite_status, name='favorite-status'),
    path('<str:property_id>/favorite-count/', views.favorite_count, name='favorite-count'),
    path('<str:property_id>/analytics/', analytics_views.property_analytics_detail, name='property-analytics'),
]