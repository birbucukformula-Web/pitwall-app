from rest_framework import viewsets, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.decorators import action
from .models import Task, TaskActivity
from .serializers import TaskSerializer, TaskActivitySerializer
from apps.accounts.permissions import (
    IsAuthenticatedOrgMember,
    get_visible_unit_ids,
    get_write_unit_ids,
    user_can_write_task,
)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticatedOrgMember]

    def get_queryset(self):
        user = self.request.user

        # Organizasyon izolasyonu
        queryset = Task.objects.filter(organization=user.organization)

        # Birim görünürlük filtresi (Faz 2)
        visible_ids = get_visible_unit_ids(user)
        if visible_ids is not None:
            # captain değil → sadece kendi yolundaki birimler
            # unit=None olan görevler görünmez (captain'a özel genel görevler)
            queryset = queryset.filter(unit_id__in=visible_ids)

        # URL query filtreleri
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

    def check_write_permission(self, task=None):
        """Yazma yetkisi yoksa 403 döner."""
        user = self.request.user
        if task is not None:
            # Mevcut görev üzerinde işlem (update/destroy)
            if not user_can_write_task(user, task):
                self.permission_denied(
                    self.request,
                    message="Bu görevi düzenleme veya silme yetkiniz yok."
                )
        else:
            # Yeni görev oluşturma
            write_ids = get_write_unit_ids(user)
            if write_ids is not None and len(write_ids) == 0:
                self.permission_denied(
                    self.request,
                    message="Görev oluşturma yetkiniz yok."
                )

    def perform_create(self, serializer):
        self.check_write_permission()  # member ise 403
        user = self.request.user
        task = serializer.save(organization=user.organization)
        TaskActivity.objects.create(
            task=task,
            user=user,
            activity_type=TaskActivity.ActivityType.OTHER,
            content="Görevi oluşturdu."
        )

    def perform_update(self, serializer):
        old_task = self.get_object()
        old_status = old_task.status

        # Member sadece status ve order alanlarını patch edebilir
        user = self.request.user
        if user.role == 'member':
            allowed_fields = {'status', 'order'}
            requested_fields = set(serializer.validated_data.keys())
            if not requested_fields.issubset(allowed_fields):
                self.permission_denied(
                    self.request,
                    message="Üyeler yalnızca görev durumunu değiştirebilir."
                )
        else:
            self.check_write_permission(task=old_task)

        task = serializer.save()

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

    def perform_destroy(self, instance):
        self.check_write_permission(task=instance)
        instance.delete()

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