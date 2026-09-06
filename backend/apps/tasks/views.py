from rest_framework import viewsets, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Organizasyon izolasyonu: Sadece kullanıcının organizasyonundaki görevler
        if hasattr(user, 'organization') and user.organization:
            queryset = Task.objects.filter(organization=user.organization)
        else:
            return Task.objects.none()

        # Filtreler
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        unit_param = self.request.query_params.get('unit')
        if unit_param:
            queryset = queryset.filter(unit_id=unit_param)
            
        project_param = self.request.query_params.get('project')
        if project_param:
            queryset = queryset.filter(project_id=project_param)
            
        assignee_param = self.request.query_params.get('assignee')
        if assignee_param:
            queryset = queryset.filter(assigned_to__id=assignee_param)
            
        overdue_param = self.request.query_params.get('overdue')
        if overdue_param and overdue_param.lower() == 'true':
            queryset = queryset.filter(
                due_date__lt=timezone.now().date()
            ).exclude(status=Task.Status.DONE)
            
        return queryset.distinct()

    def perform_create(self, serializer):
        # Görevi kullanıcının organizasyonuna zorla ata
        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            serializer.save(organization=user.organization)
        else:
            # Fallback (aslında validation ile engellenmeli)
            serializer.save()

    def update(self, request, *args, **kwargs):
        # PATCH / PUT için özel drag and drop güncellemesi (status, order)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Sürükle bırak durumlarında ek işlemler buraya eklenebilir.
        
        if getattr(instance, '_prefetched_objects_cache', None):
            # Eğer queryset'te prefetch yapıldıysa cache'i temizle
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)


class TaskSummaryStatsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'organization') or not user.organization:
            return Response({"error": "No organization associated with user."}, status=status.HTTP_400_BAD_REQUEST)

        # Temel queryset (kullanıcının organizasyonuna ait görevler)
        queryset = Task.objects.filter(organization=user.organization)
        
        total_tasks = queryset.count()
        completed_tasks = queryset.filter(status=Task.Status.DONE).count()
        in_progress_tasks = queryset.filter(status=Task.Status.IN_PROGRESS).count()
        
        today = timezone.now().date()
        overdue_tasks = queryset.filter(due_date__lt=today).exclude(status=Task.Status.DONE).count()

        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'overdue_tasks': overdue_tasks,
        })