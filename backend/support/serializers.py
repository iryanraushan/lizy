from rest_framework import serializers
from .models import ProblemReport

class ProblemReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemReport
        fields = ['category', 'subject', 'message']
        
    def validate_category(self, value):
        if not value:
            raise serializers.ValidationError("Category is required")
        return value
        
    def validate_subject(self, value):
        if not value:
            raise serializers.ValidationError("Subject is required")
        return value
        
    def validate_message(self, value):
        if not value:
            raise serializers.ValidationError("Message is required")
        return value