from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    class Role(models.TextChoices):
        CAPTAIN = 'captain', 'Captain'
        LEAD = 'lead', 'Lead'
        MEMBER = 'member', 'Member'

    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER
    )
    unit = models.ForeignKey(
        'organizations.Unit',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='members'
    )
    last_seen_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        TASK_ASSIGNED = 'task_assigned', 'Task Assigned'
        TASK_UPDATED = 'task_updated', 'Task Updated'
        COMMENT = 'comment', 'Comment'
        DUE_DATE = 'due_date', 'Due Date'
        ANNOUNCEMENT = 'announcement', 'Announcement'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acted_notifications'
    )
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    type = models.CharField(
        max_length=50,
        choices=NotificationType.choices,
        default=NotificationType.ANNOUNCEMENT
    )
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    link = models.CharField(max_length=255, blank=True, default='')
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification to {self.recipient.username}: {self.title}"
