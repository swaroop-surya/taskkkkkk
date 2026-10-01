from rest_framework import status, viewsets, filters, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ProfileSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import IsAdminUserRole
from apps.notifications.models import Notification

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create welcome notification
            Notification.objects.create(
                user=user,
                type='SYSTEM',
                message=f"Welcome to Event & Task Management, {user.first_name or user.username}! Your account has been registered successfully."
            )
            
            # Send welcome email (Console in dev)
            try:
                send_mail(
                    subject="Welcome to Event & Task Management System",
                    message=f"Hello {user.first_name or user.username},\n\nYour account has been created successfully.\nUsername: {user.username}\nRole: User\n\nThank you for joining!",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True
                )
            except Exception as e:
                pass
                
            return Response({
                'message': 'Account created successfully. You can now login.',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'old_password': ['Wrong current password.']}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password updated successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'email': ['Email is required.']}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email__iexact=email)
            # Send password reset token email
            send_mail(
                subject="Password Reset Request",
                message=f"Hello {user.username},\n\nYou requested a password reset. Use reset token 'RESET-{user.id}-DEMO' or follow the link to reset your password.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True
            )
        except User.DoesNotExist:
            pass # Keep ambiguous for security
            
        return Response({'message': 'If your email is registered, password reset instructions have been sent.'})

class UserViewSet(viewsets.ModelViewSet):
    """
    Admin Users Management: User List, Add, Edit, Delete, View Details, Search/Filter.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_staff', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username', 'email']

    def perform_create(self, serializer):
        user = serializer.save()
        raw_password = self.request.data.get('password', 'password123')
        user.set_password(raw_password)
        user.save()
