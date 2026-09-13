from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.organizations.models import Organization, Project, Unit
from apps.tasks.models import Task


class TaskAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="1.5 Adana Racing", slug="1-5-adana")
        self.user = User.objects.create_user(
            username="testuser",
            email="test@pitwall.app",
            password="pitwall123",
            organization=self.org
        )
        self.client.force_authenticate(user=self.user)
        self.unit = Unit.objects.create(name="Yazılım Ekibi", code="YZL", organization=self.org)
        self.project = Project.objects.create(name="Telemetri Sistemi", organization=self.org)

    def test_create_and_list_task_with_priority(self):
        response = self.client.post('/api/v1/tasks/', {
            'title': 'Test Görevi',
            'description': 'Açıklama',
            'status': 'todo',
            'priority': 'high',
            'unit': self.unit.id,
            'project': self.project.id,
            'due_date': '2026-10-01'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['priority'], 'high')
        self.assertEqual(response.data['unit']['name'], 'Yazılım Ekibi')
        self.assertEqual(response.data['project']['name'], 'Telemetri Sistemi')

        list_response = self.client.get('/api/v1/tasks/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

    def test_project_create_without_organization_in_payload(self):
        # Verifies read_only_fields = ['organization'] fix
        response = self.client.post('/api/v1/projects/', {
            'name': 'Yeni Proje',
            'description': 'Açıklama',
            'color': '#ff0000'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Yeni Proje')

    def test_stats_summary(self):
        Task.objects.create(
            organization=self.org,
            title="Görev 1",
            status=Task.Status.TODO,
            priority=Task.Priority.HIGH
        )
        response = self.client.get('/api/v1/stats/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 1)
        self.assertEqual(response.data['todo'], 1)

