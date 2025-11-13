from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import ProblemReport
from .serializers import ProblemReportSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_problem(request):
    serializer = ProblemReportSerializer(data=request.data)
    
    if serializer.is_valid():
        # Save to database with user and email from authenticated user
        problem_report = serializer.save(
            user=request.user,
            email=request.user.email
        )
        
        # Send email notification
        try:
            category_display = dict(ProblemReport.CATEGORY_CHOICES).get(
                problem_report.category, problem_report.category
            )
            
            subject = f"New Problem Report: {problem_report.subject}"
            
            # Render HTML email template
            html_message = render_to_string('emails/problem_report.html', {
                'report_id': problem_report.id,
                'user_email': problem_report.email,
                'category': category_display,
                'subject': problem_report.subject,
                'message': problem_report.message,
                'submitted_at': problem_report.created_at.strftime('%Y-%m-%d %H:%M:%S UTC'),
            })
            
            # Plain text fallback
            plain_message = f"""
A new problem has been reported:

Category: {category_display}
User Email: {problem_report.email}
Subject: {problem_report.subject}

Message:
{problem_report.message}

Report ID: {problem_report.id}
Submitted at: {problem_report.created_at}
"""
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['ryanraushan513@gmail.com'],
                html_message=html_message,
                fail_silently=False,
            )
            
        except Exception as e:
            # Log the error but don't fail the request
            print(f"Failed to send email notification: {e}")
        
        return Response({
            'success': True,
            'message': 'Problem report submitted successfully. We will get back to you soon.',
            'report_id': problem_report.id
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)