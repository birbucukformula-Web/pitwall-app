from django.db import models
from django.conf import settings
from apps.organizations.models import Organization, Project, Unit

class Task(models.Model):
    class Status(models.TextChoices):
        TODO = 'todo', 'To Do'
        IN_PROGRESS = 'in_progress', 'In Progress'
        REVIEW = 'review', 'Review'
        DONE = 'done', 'Done'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    unit = models.ForeignKey(
        Unit,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    assigned_to = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='assigned_tasks'
    )
    order = models.FloatField(default=0.0)
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

class TaskActivity(models.Model):
    class ActivityType(models.TextChoices):
        COMMENT = 'comment', 'Comment'
        STATUS_CHANGE = 'status_change', 'Status Change'
        ASSIGNMENT = 'assignment', 'Assignment'
        OTHER = 'other', 'Other'

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ActivityType.choices, default=ActivityType.COMMENT)
    content = models.TextField() # Yorum metni veya otomatik oluşturulan log metni
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_activity_type_display()} on {self.task.title}"