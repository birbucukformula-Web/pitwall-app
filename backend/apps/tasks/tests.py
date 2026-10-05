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
        self.unit = Unit.objects.create(name="Yazılım Ekibi", code="YZL", organization=self.org)
        self.user = User.objects.create_user(
            username="testuser",
            email="test@pitwall.app",
            password="pitwall123",
            organization=self.org,
            role='captain',   # captain → yazma yetkisi var
            unit=self.unit,
        )
        self.client.force_authenticate(user=self.user)
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

class RoleBasedAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="1.5 Adana Racing", slug="1-5-adana")
        
        # 3 seviyeli ağaç
        self.yazilim = Unit.objects.create(organization=self.org, name="Yazılım", parent=None)
        self.gomulu = Unit.objects.create(organization=self.org, name="Gömülü", parent=self.yazilim)
        self.teknofest = Unit.objects.create(organization=self.org, name="Gömülü_teknofest", parent=self.gomulu)
        
        # Farklı bir ağaç dalı
        self.web = Unit.objects.create(organization=self.org, name="Web", parent=self.yazilim)

        # Kullanıcılar
        self.lead_gomulu = User.objects.create_user(
            username="lead_gomulu", email="lead@pitwall.app", password="pitwall123",
            organization=self.org, role="lead", unit=self.gomulu
        )
        self.member_gomulu = User.objects.create_user(
            username="member_gomulu", email="member@pitwall.app", password="pitwall123",
            organization=self.org, role="member", unit=self.gomulu
        )

        # Görevler
        self.task_yazilim = Task.objects.create(organization=self.org, unit=self.yazilim, title="Yazılım Görevi", status=Task.Status.TODO, priority=Task.Priority.MEDIUM)
        self.task_gomulu = Task.objects.create(organization=self.org, unit=self.gomulu, title="Gömülü Görevi", status=Task.Status.TODO, priority=Task.Priority.MEDIUM)
        self.task_teknofest = Task.objects.create(organization=self.org, unit=self.teknofest, title="Teknofest Görevi", status=Task.Status.TODO, priority=Task.Priority.MEDIUM)
        self.task_web = Task.objects.create(organization=self.org, unit=self.web, title="Web Görevi", status=Task.Status.TODO, priority=Task.Priority.MEDIUM)

    def test_lead_visibility(self):
        """Lead sadece kendi birimini, alt birimlerini ve üst birimlerini (ancestors + subtree) görebilir."""
        self.client.force_authenticate(user=self.lead_gomulu)
        response = self.client.get('/api/v1/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Gömülü Lead'in görebilecekleri: Gömülü (kendi), Gömülü_teknofest (alt), Yazılım (üst)
        # Web (kardeş) GÖREMEZ
        task_titles = [t['title'] for t in response.data]
        self.assertIn("Yazılım Görevi", task_titles)
        self.assertIn("Gömülü Görevi", task_titles)
        self.assertIn("Teknofest Görevi", task_titles)
        self.assertNotIn("Web Görevi", task_titles)
        
    def test_member_edit_restrictions(self):
        """Member görev başlığını değiştiremez (403), ancak status değiştirebilir."""
        self.client.force_authenticate(user=self.member_gomulu)
        
        # Başlık değiştirme denemesi
        response = self.client.patch(f'/api/v1/tasks/{self.task_gomulu.id}/', {
            'title': 'Başlık Değişti'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Sadece durum (status) değiştirme denemesi
        response2 = self.client.patch(f'/api/v1/tasks/{self.task_gomulu.id}/', {
            'status': 'in_progress'
        })
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.task_gomulu.refresh_from_db()
        self.assertEqual(self.task_gomulu.status, 'in_progress')
