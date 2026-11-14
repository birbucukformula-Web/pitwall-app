from rest_framework import generics, permissions, exceptions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserRegistrationSerializer,
    MemberAdminUpdateSerializer,
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
