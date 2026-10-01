from rest_framework import permissions

class IsTaskAssigneeOrAdmin(permissions.BasePermission):
    """
    Admin has full access. Assigned user can view their tasks and update status.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if request.method in ['GET', 'PATCH'] and obj.assigned_to == request.user:
            return True
        return False
