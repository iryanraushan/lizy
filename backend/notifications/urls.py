from django.urls import path
from . import views

urlpatterns = [
    path('register-token/', views.register_device_token, name='register_device_token'),
    path('unregister-token/', views.unregister_device_token, name='unregister_device_token'),
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    path('notifications/unread-count/', views.get_unread_count, name='get_unread_count'),
    path('send-notification/', views.send_custom_notification, name='send_custom_notification'),
]