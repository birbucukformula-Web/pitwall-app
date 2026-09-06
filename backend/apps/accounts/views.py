from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer, UserSerializer

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

# /members/ endpoint'i (Kullanıcı ile aynı organizasyondaki tüm kullanıcıları listeler)
class MemberListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            return User.objects.filter(organization=user.organization)
        return User.objects.none()