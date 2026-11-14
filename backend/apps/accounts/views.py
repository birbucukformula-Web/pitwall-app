from rest_framework import generics, permissions, exceptions, views, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Notification
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserRegistrationSerializer,
    MemberAdminUpdateSerializer,
    NotificationSerializer,
)
from .permissions import IsAuthenticatedOrgMember, IsCaptain

User = get_user_model()

# /auth/login/ endpoint'i
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# /auth/me/ endpoint'i (O an giriş yapmış kullanıcının kendi bilgilerini döner)
class UserMeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# /members/ endpoint'i (Kullanıcı ile aynı organizasyondaki kullanıcıları listeler)
class MemberListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrgMember]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'organization') or not user.organization:
            return User.objects.none()

        status_param = self.request.query_params.get('status')
        qs = User.objects.filter(organization=user.organization)

        # Captain ise onay bekleyenleri veya tümünü filtreleyebilir
        if status_param == 'pending' and user.role == 'captain':
            return qs.filter(is_active=False).order_by('-date_joined')
        elif status_param == 'all' and user.role == 'captain':
            return qs.order_by('first_name', 'username')

        # Varsayılan: sadece onaylı/aktif üyeler
        return qs.filter(is_active=True).order_by('first_name', 'username')

# /members/<id>/ endpoint'i (Captain rol, birim güncelleyebilir veya üyeyi pasife alabilir)
class MemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = MemberAdminUpdateSerializer
    permission_classes = [IsAuthenticatedOrgMember, IsCaptain]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            return User.objects.filter(organization=user.organization)
        return User.objects.none()

    def perform_destroy(self, instance):
        if instance.id == self.request.user.id:
            raise exceptions.ValidationError("Kaptan kendi hesabını pasife alamaz.")
        instance.is_active = False
        instance.save()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


# ==========================================
# BİLDİRİM (NOTIFICATION) VIEW'LARI
# ==========================================

class NotificationListView(generics.ListAPIView):
    """
    Giriş yapmış kullanıcının bildirimlerini listeler.
    ?status=unread parametresi ile sadece okunmamışlar filtrelenebilir.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Notification.objects.filter(recipient=user).select_related('actor', 'task')
        status_param = self.request.query_params.get('status')
        if status_param == 'unread':
            qs = qs.filter(is_read=False)
        return qs.order_by('-created_at')[:100]


class NotificationReadView(generics.UpdateAPIView):
    """
    Tekil bir bildirimi okundu (veya okunmadı) olarak günceller.
    PATCH /api/v1/notifications/<id>/read/
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        # Eğer istek gövdesinde is_read belirtilmişse onu kullan, yoksa True yap
        is_read = request.data.get('is_read', True)
        instance.is_read = bool(is_read)
        instance.save(update_fields=['is_read'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class NotificationMarkAllReadView(views.APIView):
    """
    Giriş yapmış kullanıcının tüm okunmamış bildirimlerini okundu yapar.
    POST /api/v1/notifications/mark-all-read/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        updated_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({
            "status": "success",
            "marked_count": updated_count
        }, status=status.HTTP_200_OK)


class NotificationUnreadCountView(views.APIView):
    """
    Giriş yapmış kullanıcının okunmamış bildirim sayısını döner.
    GET /api/v1/notifications/unread-count/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)

