from rest_framework import serializers
from .models import Task
from apps.users.serializers import UserSerializer
from apps.events.serializers import EventSerializer

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    event_details = EventSerializer(source='event', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assigned_to', 'assigned_to_details',
            'event', 'event_details', 'deadline', 'status', 'priority',
            'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_is_overdue(self, obj):
        from django.utils import timezone
        return obj.status != 'completed' and obj.deadline < timezone.now()
