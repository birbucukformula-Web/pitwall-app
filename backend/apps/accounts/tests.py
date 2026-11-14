from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.organizations.models import Organization


class AccountTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(name="1.5 Adana Racing", slug="1-5-adana")
        self.user = User.objects.create_user(
            username="testuser",
            email="test@pitwall.app",
            password="pitwall123",
            first_name="Test",
            last_name="User",
            organization=self.org
        )

    def test_login_returns_tokens(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'testuser',
            'password': 'pitwall123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_members_endpoint_success_and_includes_username(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/members/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        
        member = response.data[0]
        self.assertEqual(member['username'], 'testuser')
        self.assertEqual(member['email'], 'test@pitwall.app')
        self.assertEqual(member['first_name'], 'Test')
        self.assertEqual(member['last_name'], 'User')

    def test_user_me_endpoint_includes_username(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@pitwall.app')

    def test_login_with_email(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'test@pitwall.app',
            'password': 'pitwall123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_token_refresh(self):
        login_response = self.client.post('/api/v1/auth/login/', {
            'username': 'testuser',
            'password': 'pitwall123'
        })
        refresh_token = login_response.data['refresh']

        refresh_response = self.client.post('/api/v1/auth/refresh/', {
            'refresh': refresh_token
        })
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

    def test_presence_ping_updates_last_seen_and_returns_count(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/presence/ping/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(len(response.data['users']), 1)
        self.assertEqual(response.data['users'][0]['username'], 'testuser')

        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.last_seen_at)

    def test_presence_organization_isolation(self):
        from django.utils import timezone
        from datetime import timedelta

        # Aynı organizasyonda ikinci bir kullanıcı
        user2 = User.objects.create_user(
            username="teammate",
            email="teammate@pitwall.app",
            password="pitwall123",
            organization=self.org,
            last_seen_at=timezone.now()
        )

        # Farklı organizasyonda bir kullanıcı
        other_org = Organization.objects.create(name="Other Team", slug="other-team")
        user3 = User.objects.create_user(
            username="rival",
            email="rival@pitwall.app",
            password="pitwall123",
            organization=other_org,
            last_seen_at=timezone.now()
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/presence/ping/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Sadece self.user ve user2 görünmeli (2 kişi)
        self.assertEqual(response.data['count'], 2)
        usernames = [u['username'] for u in response.data['users']]
        self.assertIn('testuser', usernames)
        self.assertIn('teammate', usernames)
        self.assertNotIn('rival', usernames)

    def test_presence_offline_threshold(self):
        from django.utils import timezone
        from datetime import timedelta

        # Süresi dolmuş (inaktif) kullanıcı
        old_user = User.objects.create_user(
            username="inactive_user",
            email="inactive@pitwall.app",
            password="pitwall123",
            organization=self.org,
            last_seen_at=timezone.now() - timedelta(minutes=10)
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/presence/ping/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # inactive_user sayılmamalı
        usernames = [u['username'] for u in response.data['users']]
        self.assertNotIn('inactive_user', usernames)

    def test_presence_leave_clears_last_seen(self):
        from django.utils import timezone
        self.user.last_seen_at = timezone.now()
        self.user.save()

        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/presence/leave/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'left')

        self.user.refresh_from_db()
        self.assertIsNone(self.user.last_seen_at)

    def test_captain_can_update_member_role_and_unit(self):
        from apps.organizations.models import Unit
        unit = Unit.objects.create(name="Yeni Ekip", organization=self.org)
        captain = User.objects.create_user(
            username="captain_user",
            email="captain@pitwall.app",
            password="pitwall123",
            role="captain",
            organization=self.org
        )

        self.client.force_authenticate(user=captain)
        response = self.client.patch(f'/api/v1/members/{self.user.id}/', {
            'role': 'lead',
            'unit_id': unit.id
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, 'lead')
        self.assertEqual(self.user.unit_id, unit.id)

    def test_member_cannot_update_member_role(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(f'/api/v1/members/{self.user.id}/', {
            'role': 'captain'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_captain_can_filter_pending_and_approve_member(self):
        pending_user = User.objects.create_user(
            username="newbie",
            email="newbie@pitwall.app",
            password="pitwall123",
            organization=self.org,
            is_active=False
        )
        captain = User.objects.create_user(
            username="captain_boss",
            email="boss@pitwall.app",
            password="pitwall123",
            role="captain",
            organization=self.org
        )

        self.client.force_authenticate(user=captain)
        # Pending listeleme
        response = self.client.get('/api/v1/members/?status=pending')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [u['username'] for u in response.data]
        self.assertIn('newbie', usernames)
        self.assertNotIn('captain_boss', usernames)

        # Onaylama (is_active=True yapma)
        patch_res = self.client.patch(f'/api/v1/members/{pending_user.id}/', {
            'is_active': True,
            'role': 'member'
        })
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        pending_user.refresh_from_db()
        self.assertTrue(pending_user.is_active)

    def test_notification_endpoints_and_read_status(self):
        from apps.accounts.models import Notification

        n1 = Notification.objects.create(
            recipient=self.user,
            type="announcement",
            title="Duyuru 1",
            message="Test mesajı",
            is_read=False
        )
        n2 = Notification.objects.create(
            recipient=self.user,
            type="task_assigned",
            title="Görev 1",
            message="Görev atandı",
            is_read=False
        )

        self.client.force_authenticate(user=self.user)

        # 1. Unread count endpoint
        count_res = self.client.get('/api/v1/notifications/unread-count/')
        self.assertEqual(count_res.status_code, status.HTTP_200_OK)
        self.assertEqual(count_res.data['unread_count'], 2)

        # 2. List notifications
        list_res = self.client.get('/api/v1/notifications/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 2)

        # 3. Mark single notification as read
        patch_res = self.client.patch(f'/api/v1/notifications/{n1.id}/read/', {'is_read': True})
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        n1.refresh_from_db()
        self.assertTrue(n1.is_read)

        # Verify unread count is now 1
        count_res2 = self.client.get('/api/v1/notifications/unread-count/')
        self.assertEqual(count_res2.data['unread_count'], 1)

        # 4. Mark all as read
        mark_all_res = self.client.post('/api/v1/notifications/mark-all-read/')
        self.assertEqual(mark_all_res.status_code, status.HTTP_200_OK)
        self.assertEqual(mark_all_res.data['status'], 'success')

        n2.refresh_from_db()
        self.assertTrue(n2.is_read)

        count_res3 = self.client.get('/api/v1/notifications/unread-count/')
        self.assertEqual(count_res3.data['unread_count'], 0)

    def test_task_signals_trigger_notifications(self):
        from apps.tasks.models import Task, TaskActivity
        from apps.accounts.models import Notification

        # Görev oluştur
        task = Task.objects.create(
            organization=self.org,
            title="Batarya Kutusu Tasarımı",
            description="CAD çizimlerini tamamla",
            status="todo"
        )

        # 1. Göreve kullanıcı ata -> m2m_changed sinyali bildirim üretmeli
        task.assigned_to.add(self.user)
        notif = Notification.objects.filter(recipient=self.user, task=task, type="task_assigned").first()
        self.assertIsNotNone(notif)
        self.assertIn("Batarya Kutusu Tasarımı", notif.title)

        # 2. Durum güncelle -> post_save sinyali bildirim üretmeli
        task.status = "in_progress"
        task.save()
        status_notif = Notification.objects.filter(recipient=self.user, task=task, type="task_updated").first()
        self.assertIsNotNone(status_notif)
        self.assertIn("Durum Güncellendi", status_notif.title)

        # 3. İkinci bir kullanıcı yorum yapsın -> post_save TaskActivity sinyali ilk kullanıcıya bildirim üretmeli
        other_user = User.objects.create_user(
            username="mechanic_dev",
            email="mech@pitwall.app",
            password="pitwall123",
            first_name="Can",
            last_name="Yılmaz",
            organization=self.org
        )
        TaskActivity.objects.create(
            task=task,
            user=other_user,
            activity_type=TaskActivity.ActivityType.COMMENT,
            content="Statik analiz tamamlandı, üretime hazır."
        )

        comment_notif = Notification.objects.filter(recipient=self.user, task=task, type="comment").first()
        self.assertIsNotNone(comment_notif)
        self.assertIn("Can Yılmaz", comment_notif.title)




