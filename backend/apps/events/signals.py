from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Event, Registration
from apps.notifications.models import Notification

User = get_user_model()

@receiver(post_save, sender=Event)
def handle_event_post_save(sender, instance, created, **kwargs):
    if created:
        # Notify admins
        admins = User.objects.filter(is_staff=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                type='EVENT_CREATED',
                message=f"New event created: '{instance.title}' scheduled for {instance.date_time.strftime('%b %d, %Y')}."
            )
    else:
        # If event status changed to cancelled or date changed, notify registered users
        if instance.status == 'cancelled':
            registrations = instance.registrations.exclude(status='cancelled')
            for reg in registrations:
                Notification.objects.create(
                    user=reg.user,
                    type='EVENT_CANCELLED',
                    message=f"Important: The event '{instance.title}' has been CANCELLED."
                )
                try:
                    send_mail(
                        subject=f"Event Cancelled: {instance.title}",
                        message=f"Dear {reg.user.first_name or reg.user.username},\n\nThe event '{instance.title}' that you registered for has unfortunately been cancelled.\n\nWe apologize for the inconvenience.",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[reg.user.email],
                        fail_silently=True
                    )
                except Exception:
                    pass
        else:
            # Event updated
            registrations = instance.registrations.exclude(status='cancelled')
            for reg in registrations:
                Notification.objects.create(
                    user=reg.user,
                    type='EVENT_UPDATED',
                    message=f"Update: The details for event '{instance.title}' have been modified."
                )

@receiver(post_save, sender=Registration)
def handle_registration_post_save(sender, instance, created, **kwargs):
    if created:
        # Notify user
        Notification.objects.create(
            user=instance.user,
            type='REGISTRATION_CONFIRMED',
            message=f"You are registered for '{instance.event.title}' on {instance.event.date_time.strftime('%b %d, %Y')}."
        )
        
        # Notify event creator/admins
        admins = User.objects.filter(is_staff=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                type='NEW_REGISTRATION',
                message=f"New registration: {instance.user.username} registered for '{instance.event.title}'."
            )
            
        # Send confirmation email
        try:
            send_mail(
                subject=f"Registration Confirmed: {instance.event.title}",
                message=(
                    f"Hello {instance.user.first_name or instance.user.username},\n\n"
                    f"Your registration for '{instance.event.title}' has been confirmed!\n\n"
                    f"Date: {instance.event.date_time.strftime('%B %d, %Y at %I:%M %p')}\n"
                    f"Location: {instance.event.location}\n\n"
                    f"Status: {instance.status.capitalize()}\n\n"
                    f"Thank you,\nEvent Management Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.user.email],
                fail_silently=True
            )
        except Exception:
            pass
