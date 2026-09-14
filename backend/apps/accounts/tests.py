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

