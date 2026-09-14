from django.db import models
from django.contrib.auth.models import AbstractUser


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

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"