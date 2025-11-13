from django.contrib import admin
from .models import ProblemReport

@admin.register(ProblemReport)
class ProblemReportAdmin(admin.ModelAdmin):
    list_display = ['subject', 'user_name', 'email', 'category', 'created_at', 'is_resolved']
    list_filter = ['category', 'is_resolved', 'created_at']
    search_fields = ['subject', 'email', 'message', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'user', 'email']
    list_editable = ['is_resolved']
    
    def user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
        return "Anonymous"
    user_name.short_description = "User Name"