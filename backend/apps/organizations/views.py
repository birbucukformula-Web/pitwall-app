from rest_framework import viewsets, exceptions
from rest_framework.permissions import IsAuthenticated
from .models import Organization, Project, Unit
from .serializers import OrganizationSerializer, ProjectSerializer, UnitSerializer
from apps.accounts.permissions import (
    IsAuthenticatedOrgMember,
    IsCaptain,
    IsLeadOrCaptain,
    get_visible_unit_ids,
)


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

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticatedOrgMember(), IsLeadOrCaptain()]
        return [IsAuthenticatedOrgMember()]

    def get_queryset(self):
        user = self.request.user
        include_archived = self.request.query_params.get('include_archived') == 'true'
        qs = Project.objects.filter(organization=user.organization)
        if not include_archived:
            qs = qs.filter(is_archived=False)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticatedOrgMember(), IsCaptain()]
        return [IsAuthenticatedOrgMember()]

    def get_queryset(self):
        user = self.request.user

        # Temel org izolasyonu
        queryset = Unit.objects.filter(organization=user.organization)

        # Görünürlük filtresi: Captain tümünü görür, diğerleri kendi dalını görür.
        visible_ids = get_visible_unit_ids(user)
        if visible_ids is not None:
            queryset = queryset.filter(id__in=visible_ids)

        return queryset.select_related('parent').order_by('parent__id', 'name')

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    def perform_destroy(self, instance):
        if instance.children.exists():
            raise exceptions.ValidationError(
                "Bu birime bağlı alt birimler bulunmaktadır. Önce alt birimleri başka bir üst birime taşıyın veya silin."
            )
        if instance.tasks.exists():
            raise exceptions.ValidationError(
                "Bu birime atanmış görevler bulunmaktadır. Önce görevleri başka bir birime aktarın veya silin."
            )
        instance.delete()
