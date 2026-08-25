from django.urls import path
from .views import CustomTokenObtainPairView, UserMeView

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/me/', UserMeView.as_view(), name='user_me'),
]