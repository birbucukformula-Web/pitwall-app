from django.urls import path
from .views import CustomTokenObtainPairView, UserMeView, MemberListView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('me/', UserMeView.as_view(), name='user_me'),
    path('members/', MemberListView.as_view(), name='members'),
]