from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsTaskAssigneeOrAdmin

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsTaskAssigneeOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'event', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['deadline', 'created_at', 'priority']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Task.objects.none()
        if user.is_staff:
            return Task.objects.all().select_related('assigned_to', 'event')
        return Task.objects.filter(assigned_to=user).select_related('assigned_to', 'event')

    @action(detail=True, methods=['patch'], permission_classes=[IsTaskAssigneeOrAdmin])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['pending', 'in_progress', 'completed']:
            return Response(
                {'error': 'Invalid status. Must be pending, in_progress, or completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        task.status = new_status
        task.save()
        return Response(TaskSerializer(task).data)
