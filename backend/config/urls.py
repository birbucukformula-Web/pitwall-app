from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import serializers


@extend_schema(
    responses={
        200: inline_serializer(
            name='HealthCheckResponse',
            fields={
                'status': serializers.CharField(),
                'service': serializers.CharField(),
            }
        )
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Sistem sağlık kontrolü endpoint'i (Karar #14)
    """
    return Response({"status": "healthy", "service": "pitwall-backend"})


urlpatterns = [
    # Admin Paneli
    path('admin/', admin.site.urls),

    # Health Check
    path('api/v1/health/', health_check, name='health-check'),

    # API Endpoint'leri
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.organizations.urls')),
    path('api/v1/', include('apps.tasks.urls')),

    # Swagger / OpenAPI Dokümantasyonu
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]