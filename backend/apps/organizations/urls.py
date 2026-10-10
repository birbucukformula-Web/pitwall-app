from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet, ProjectViewSet, UnitViewSet

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'units', UnitViewSet, basename='unit')

urlpatterns = [
    path('', include(router.urls)),
]