from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Organization, Project, Unit
from .serializers import OrganizationSerializer, ProjectSerializer, UnitSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            return Organization.objects.filter(id=user.organization.id)
        return Organization.objects.none()


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            return Project.objects.filter(organization=user.organization, is_archived=False)
        return Project.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            serializer.save(organization=user.organization)
        else:
            serializer.save()


class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            return Unit.objects.filter(organization=user.organization)
        return Unit.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            serializer.save(organization=user.organization)
        else:
            serializer.save()