from django.contrib import admin
from django.urls import path, include
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import serializers
from apps.accounts.views import MemberListView, MemberDetailView
from apps.accounts.presence_views import PresencePingView, PresenceLeaveView


@extend_schema(
    responses={
        200: inline_serializer(
            name='HealthCheckResponse',
            fields={
                'status': serializers.CharField(),
                'service': serializers.CharField(),
                'database': serializers.CharField(),
            }
        )
    }
)
@api_view(['GET', 'HEAD'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Sistem sağlık kontrolü endpoint'i (Karar #14).
    Veritabanına hafif bir SELECT 1 sorgusu atarak UptimeRobot ping'lerinin
    Supabase'i de uyanık tutmasını sağlar.
    """
    db_status = "connected"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_status = f"error: {str(e)}"
        return Response(
            {"status": "unhealthy", "service": "pitwall-backend", "database": db_status},
            status=503
        )

    return Response({
        "status": "healthy",
        "service": "pitwall-backend",
        "database": db_status
    })


urlpatterns = [
    # Admin Paneli
    path('admin/', admin.site.urls),

    # Health Check
    path('api/v1/health/', health_check, name='health-check'),

    # API Endpoint'leri
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/members/', MemberListView.as_view(), name='members'),
    path('api/v1/members/<int:pk>/', MemberDetailView.as_view(), name='member_detail'),
    path('api/v1/presence/ping/', PresencePingView.as_view(), name='presence-ping'),
    path('api/v1/presence/leave/', PresenceLeaveView.as_view(), name='presence-leave'),
    path('api/v1/', include('apps.organizations.urls')),
    path('api/v1/', include('apps.tasks.urls')),

    # Swagger / OpenAPI Dokümantasyonu
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
