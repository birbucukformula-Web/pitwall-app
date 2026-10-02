from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Organization, Project, Unit
from .serializers import OrganizationSerializer, ProjectSerializer, UnitSerializer
from apps.accounts.permissions import IsAuthenticatedOrgMember, get_visible_unit_ids


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
    permission_classes = [IsAuthenticatedOrgMember]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(organization=user.organization, is_archived=False)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticatedOrgMember]

    def get_queryset(self):
        user = self.request.user

        # Faz 2: Organizasyon içindeki tüm birimleri ağaç yapısı için getir.
        # (Yazma yetkisi Project/Task seviyesinde izinlerle kontrol ediliyor)
        queryset = Unit.objects.filter(organization=user.organization)

        return queryset.select_related('parent').order_by('parent__id', 'name')

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)