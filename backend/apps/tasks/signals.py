from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Task
from apps.notifications.models import Notification

User = get_user_model()

@receiver(post_save, sender=Task)
def handle_task_post_save(sender, instance, created, **kwargs):
    if created:
        # Notify assigned user
        Notification.objects.create(
            user=instance.assigned_to,
            type='TASK_ASSIGNED',
            message=f"You have been assigned a new task: '{instance.title}' (Due: {instance.deadline.strftime('%b %d, %Y')})."
        )
        
        # Email notification to assigned user
        try:
            send_mail(
                subject=f"New Task Assigned: {instance.title}",
                message=(
                    f"Hello {instance.assigned_to.first_name or instance.assigned_to.username},\n\n"
                    f"A new task has been assigned to you:\n"
                    f"Task: {instance.title}\n"
                    f"Priority: {instance.priority.upper()}\n"
                    f"Deadline: {instance.deadline.strftime('%B %d, %Y at %I:%M %p')}\n\n"
                    f"Description: {instance.description or 'No details provided'}\n\n"
                    f"Please log in to your account to review and update progress."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.assigned_to.email],
                fail_silently=True
            )
        except Exception:
            pass
    else:
        # Check if status is completed
        if instance.status == 'completed':
            admins = User.objects.filter(is_staff=True)
            for admin in admins:
                Notification.objects.create(
                    user=admin,
                    type='TASK_COMPLETED',
                    message=f"Task completed: '{instance.title}' finished by {instance.assigned_to.username}."
                )
