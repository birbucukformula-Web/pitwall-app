from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        org_id = self.request.query_params.get('organization')
        project_id = self.request.query_params.get('project')
        
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        return queryset