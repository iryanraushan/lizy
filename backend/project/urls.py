from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('thelizy/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/properties/', include('properties.urls')),
    path('api/support/', include('support.urls')),
    path('api/', include('message.urls')),
    path('api/', include('notifications.urls')),
]
