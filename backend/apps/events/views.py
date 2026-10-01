from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Category, Event, Registration
from .serializers import CategorySerializer, EventSerializer, RegistrationSerializer
from .permissions import IsAdminOrReadOnly, IsRegistrationOwnerOrAdmin
from apps.tasks.models import Task
from apps.notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().select_related('category', 'created_by')
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['date_time', 'created_at', 'title']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        event = self.get_object()
        user = request.user

        if event.status == 'cancelled':
            return Response({'error': 'This event has been cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check existing registration
        reg = Registration.objects.filter(user=user, event=event).first()
        if reg:
            if reg.status == 'cancelled':
                reg.status = 'approved'
                reg.save()
                return Response(RegistrationSerializer(reg, context={'request': request}).data)
            return Response({'error': 'You are already registered for this event.'}, status=status.HTTP_400_BAD_REQUEST)

        # Capacity check
        if event.capacity and event.registered_count >= event.capacity:
            return Response({'error': 'Event capacity is full.'}, status=status.HTTP_400_BAD_REQUEST)

        new_reg = Registration.objects.create(
            user=user,
            event=event,
            status='approved',
            notes=request.data.get('notes', '')
        )
        return Response(RegistrationSerializer(new_reg, context={'request': request}).data, status=status.HTTP_201_CREATED)

class RegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationSerializer
    permission_classes = [IsRegistrationOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'event', 'user']
    search_fields = ['event__title', 'user__username', 'user__email']
    ordering_fields = ['created_at', 'event__date_time']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Registration.objects.none()
        if user.is_staff:
            return Registration.objects.all().select_related('user', 'event')
        return Registration.objects.filter(user=user).select_related('user', 'event')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsRegistrationOwnerOrAdmin])
    def cancel(self, request, pk=None):
        registration = self.get_object()
        registration.status = 'cancelled'
        registration.save()
        return Response({'message': 'Registration cancelled successfully.', 'registration': RegistrationSerializer(registration).data})

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()

        if user.is_staff:
            # Admin Dashboard Stats
            total_users = User.objects.count()
            total_events = Event.objects.count()
            total_tasks = Task.objects.count()
            total_registrations = Registration.objects.exclude(status='cancelled').count()
            
            recent_activities = Notification.objects.all().order_by('-created_at')[:8]
            
            return Response({
                'is_admin': True,
                'stats': {
                    'total_users': total_users,
                    'total_events': total_events,
                    'total_tasks': total_tasks,
                    'total_registrations': total_registrations,
                },
                'recent_activities': [
                    {
                        'id': n.id,
                        'type': n.type,
                        'message': n.message,
                        'created_at': n.created_at,
                        'is_read': n.is_read
                    } for n in recent_activities
                ]
            })
        else:
            # User Dashboard Stats
            user_registrations = Registration.objects.filter(user=user)
            total_registered = user_registrations.exclude(status='cancelled').count()
            upcoming_events_count = user_registrations.filter(
                status='approved',
                event__date_time__gte=now,
                event__status='upcoming'
            ).count()
            
            user_tasks = Task.objects.filter(assigned_to=user)
            pending_tasks = user_tasks.filter(status='pending').count()
            in_progress_tasks = user_tasks.filter(status='in_progress').count()
            completed_tasks = user_tasks.filter(status='completed').count()
            
            recent_notifications = Notification.objects.filter(user=user).order_by('-created_at')[:6]

            return Response({
                'is_admin': False,
                'stats': {
                    'total_registered_events': total_registered,
                    'upcoming_events': upcoming_events_count,
                    'pending_tasks': pending_tasks + in_progress_tasks,
                    'completed_tasks': completed_tasks,
                },
                'recent_notifications': [
                    {
                        'id': n.id,
                        'type': n.type,
                        'message': n.message,
                        'created_at': n.created_at,
                        'is_read': n.is_read
                    } for n in recent_notifications
                ]
            })
