from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = (
        ('NEW_USER', 'New User Registered'),
        ('EVENT_CREATED', 'New Event Created'),
        ('NEW_REGISTRATION', 'New Registration'),
        ('REGISTRATION_CONFIRMED', 'Registration Confirmed'),
        ('TASK_ASSIGNED', 'Task Assigned'),
        ('TASK_DEADLINE', 'Task Deadline Approaching'),
        ('TASK_COMPLETED', 'Task Completed'),
        ('TASK_OVERDUE', 'Task Overdue'),
        ('EVENT_UPDATED', 'Event Updated'),
        ('EVENT_CANCELLED', 'Event Cancelled'),
        ('SYSTEM', 'System Notification'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='SYSTEM')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.user.username}: {self.message[:40]}"
