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


