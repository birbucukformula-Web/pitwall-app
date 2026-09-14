from rest_framework import viewsets, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.decorators import action
from .models import Task, TaskActivity
from .serializers import TaskSerializer, TaskActivitySerializer

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
            task = serializer.save(organization=user.organization)
        else:
            task = serializer.save()
            
        TaskActivity.objects.create(
            task=task,
            user=self.request.user,
            activity_type=TaskActivity.ActivityType.OTHER,
            content="Görevi oluşturdu."
        )

    def perform_update(self, serializer):
        old_task = self.get_object()
        old_status = old_task.status
        
        task = serializer.save()
        
        # Eğer status değiştiyse log at
        if old_status != task.status:
            status_display = dict(Task.Status.choices).get(task.status, task.status)
            old_status_display = dict(Task.Status.choices).get(old_status, old_status)
            
            content = f"Görevin durumunu {old_status_display} -> {status_display} olarak değiştirdi."
            TaskActivity.objects.create(
                task=task,
                user=self.request.user,
                activity_type=TaskActivity.ActivityType.STATUS_CHANGE,
                content=content
            )

    @action(detail=True, methods=['get', 'post'])
    def activities(self, request, pk=None):
        task = self.get_object()
        
        if request.method == 'POST':
            content = request.data.get('content')
            if not content:
                return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            activity = TaskActivity.objects.create(
                task=task,
                user=request.user,
                activity_type=TaskActivity.ActivityType.COMMENT,
                content=content
            )
            serializer = TaskActivitySerializer(activity)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        # GET request
        activities = task.activities.all()
        serializer = TaskActivitySerializer(activities, many=True)
        return Response(serializer.data)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
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
        todo_tasks = queryset.filter(status=Task.Status.TODO).count()
        completed_tasks = queryset.filter(status=Task.Status.DONE).count()
        in_progress_tasks = queryset.filter(status=Task.Status.IN_PROGRESS).count()
        review_tasks = queryset.filter(status=Task.Status.REVIEW).count()
        
        today = timezone.now().date()
        overdue_tasks = queryset.filter(due_date__lt=today).exclude(status=Task.Status.DONE).count()

        return Response({
            'total': total_tasks,
            'todo': todo_tasks,
            'done': completed_tasks,
            'in_progress': in_progress_tasks,
            'review': review_tasks,
            'overdue': overdue_tasks,
        })