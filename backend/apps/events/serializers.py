from rest_framework import serializers
from .models import Category, Event, Registration
from apps.users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    events_count = serializers.IntegerField(source='events.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'color', 'events_count', 'created_at']

class RegistrationSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateTimeField(source='event.date_time', read_only=True)
    event_location = serializers.CharField(source='event.location', read_only=True)
    event_status = serializers.CharField(source='event.status', read_only=True)
    event_category = serializers.CharField(source='event.category.name', read_only=True)

    class Meta:
        model = Registration
        fields = [
            'id', 'user', 'user_details', 'event', 'event_title',
            'event_date', 'event_location', 'event_status', 'event_category',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        user = self.context['request'].user
        event = attrs.get('event')
        
        # Check duplicate
        if self.instance is None and Registration.objects.filter(user=user, event=event).exists():
            raise serializers.ValidationError("You are already registered for this event.")
        
        # Check event status
        if event and event.status == 'cancelled':
            raise serializers.ValidationError("Cannot register for a cancelled event.")
            
        return attrs

class EventSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    registered_count = serializers.ReadOnlyField()
    is_registered = serializers.SerializerMethodField()
    user_registration_status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category', 'category_details',
            'date_time', 'location', 'capacity', 'banner', 'documents',
            'status', 'created_by', 'created_by_details', 'registered_count',
            'is_registered', 'user_registration_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'registered_count']

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.registrations.filter(user=request.user).exclude(status='cancelled').exists()

    def get_user_registration_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        reg = obj.registrations.filter(user=request.user).first()
        return reg.status if reg else None
