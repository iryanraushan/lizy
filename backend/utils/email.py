from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_email(subject, template_name, context, recipient_email, fail_silently=True):
    try:
        html_message = render_to_string(template_name, context)
        send_mail(
            subject=subject,
            message='',
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=fail_silently
        )
        return True
    except Exception as e:
        if not fail_silently:
            logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
        return False