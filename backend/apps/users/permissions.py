from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to admin users (is_staff=True)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)

class IsOwnerOrAdmin(permissions.BasePermission):
    """Allows access to the owner of the object or admin users."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj == request.user or getattr(obj, 'user', None) == request.user or getattr(obj, 'assigned_to', None) == request.user
