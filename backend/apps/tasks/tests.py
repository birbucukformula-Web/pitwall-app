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

    def test_task_notification_link_generation(self):
        """Sinyaller birimli görevlerde /projects/<unit_id>?task=<task_id>, birimsizlerde /dashboard?task=<task_id> üretir."""
        from apps.accounts.models import Notification
        from apps.tasks.models import TaskActivity

        # 1. Birimli görev
        task_with_unit = Task.objects.create(
            organization=self.org,
            unit=self.unit,
            title="Telemetri Anteni",
            status="todo"
        )
        task_with_unit.assigned_to.add(self.user)
        notif_assigned = Notification.objects.filter(recipient=self.user, task=task_with_unit, type="task_assigned").first()
        self.assertIsNotNone(notif_assigned)
        self.assertEqual(notif_assigned.link, f"/projects/{self.unit.id}?task={task_with_unit.id}")

        # Durum değişikliği
        task_with_unit.status = "in_progress"
        task_with_unit.save()
        notif_status = Notification.objects.filter(recipient=self.user, task=task_with_unit, type="task_updated").first()
        self.assertIsNotNone(notif_status)
        self.assertEqual(notif_status.link, f"/projects/{self.unit.id}?task={task_with_unit.id}")

        # Yorum bildirimi
        other_user = User.objects.create_user(
            username="other_comm", email="comm@pitwall.app", password="pitwall123", organization=self.org
        )
        TaskActivity.objects.create(
            task=task_with_unit,
            user=other_user,
            activity_type=TaskActivity.ActivityType.COMMENT,
            content="Anten montajı yapıldı."
        )
        notif_comment = Notification.objects.filter(recipient=self.user, task=task_with_unit, type="comment").first()
        self.assertIsNotNone(notif_comment)
        self.assertEqual(notif_comment.link, f"/projects/{self.unit.id}?task={task_with_unit.id}")

        # 2. Birimsiz görev fallback: /dashboard?task=<task_id>
        task_no_unit = Task.objects.create(
            organization=self.org,
            unit=None,
            title="Genel Görev",
            status="todo"
        )
        task_no_unit.assigned_to.add(self.user)
        notif_no_unit = Notification.objects.filter(recipient=self.user, task=task_no_unit, type="task_assigned").first()
        self.assertIsNotNone(notif_no_unit)
        self.assertEqual(notif_no_unit.link, f"/dashboard?task={task_no_unit.id}")

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

    def test_task_activities_get_and_post_comment(self):
        """Kullanıcı göreve yorum ekleyebilir ve aktiviteleri listeleyebilir."""
        self.client.force_authenticate(user=self.member_gomulu)

        # 1. Yorum ekleme (POST /api/v1/tasks/<id>/activities/)
        res = self.client.post(f'/api/v1/tasks/{self.task_gomulu.id}/activities/', {
            'content': 'Sensör kalibrasyonu tamamlandı.'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['content'], 'Sensör kalibrasyonu tamamlandı.')
        self.assertIn('user_info', res.data)
        self.assertEqual(res.data['user_info']['id'], self.member_gomulu.id)

        # 2. Aktiviteleri listeleme (GET /api/v1/tasks/<id>/activities/)
        list_res = self.client.get(f'/api/v1/tasks/{self.task_gomulu.id}/activities/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        contents = [a['content'] for a in list_res.data]
        self.assertIn('Sensör kalibrasyonu tamamlandı.', contents)

    def test_multidepartment_cross_role_access_scenario(self):
        """
        1 Captain, 1 Elektrik Lead, 1 Mekanik Member arasındaki
        çoklu departman ağacı yetki izolasyonu testi.
        """
        # Elektrik Ağacı
        elektrik = Unit.objects.create(organization=self.org, name="Elektrik Departmanı")
        hv = Unit.objects.create(organization=self.org, name="High Voltage", parent=elektrik)

        # Mekanik Ağacı
        mekanik = Unit.objects.create(organization=self.org, name="Mekanik Departmanı")
        sasi = Unit.objects.create(organization=self.org, name="Şasi", parent=mekanik)

        # Roller
        captain = User.objects.create_user(
            username="grand_captain", email="cap@pitwall.app", password="pitwall123",
            organization=self.org, role="captain"
        )
        elektrik_lead = User.objects.create_user(
            username="el_lead", email="el@pitwall.app", password="pitwall123",
            organization=self.org, role="lead", unit=elektrik
        )
        mekanik_member = User.objects.create_user(
            username="mek_member", email="mek@pitwall.app", password="pitwall123",
            organization=self.org, role="member", unit=sasi
        )

        task_hv = Task.objects.create(organization=self.org, unit=hv, title="HV Inverter Montajı", status="todo")
        task_sasi = Task.objects.create(organization=self.org, unit=sasi, title="Şasi Kaynağı", status="todo")

        # 1. Captain her iki görevi de görür
        self.client.force_authenticate(user=captain)
        cap_res = self.client.get('/api/v1/tasks/')
        cap_titles = [t['title'] for t in cap_res.data]
        self.assertIn("HV Inverter Montajı", cap_titles)
        self.assertIn("Şasi Kaynağı", cap_titles)

        # 2. Elektrik Lead Elektrik alt birimlerini görür, Mekanik'i göremez
        self.client.force_authenticate(user=elektrik_lead)
        el_res = self.client.get('/api/v1/tasks/')
        el_titles = [t['title'] for t in el_res.data]
        self.assertIn("HV Inverter Montajı", el_titles)
        self.assertNotIn("Şasi Kaynağı", el_titles)

        # 3. Mekanik Member sadece Şasi'yi görür, Elektrik'i göremez
        self.client.force_authenticate(user=mekanik_member)
        mek_res = self.client.get('/api/v1/tasks/')
        mek_titles = [t['title'] for t in mek_res.data]
        self.assertIn("Şasi Kaynağı", mek_titles)
        self.assertNotIn("HV Inverter Montajı", mek_titles)

        # 4. Mekanik Member başlık değiştiremez (403), ama durum değiştirebilir (200)
        mek_patch_title = self.client.patch(f'/api/v1/tasks/{task_sasi.id}/', {'title': 'Yetkisiz Başlık'})
        self.assertEqual(mek_patch_title.status_code, status.HTTP_403_FORBIDDEN)

        mek_patch_status = self.client.patch(f'/api/v1/tasks/{task_sasi.id}/', {'status': 'done'})
        self.assertEqual(mek_patch_status.status_code, status.HTTP_200_OK)
        task_sasi.refresh_from_db()
        self.assertEqual(task_sasi.status, 'done')


