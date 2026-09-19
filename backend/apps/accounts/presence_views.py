from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from .models import User

ACTIVE_THRESHOLD_SECONDS = 75
THROTTLE_UPDATE_SECONDS = 25


class PresencePingView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Aktiflik bildirimi (Heartbeat)",
        description="Kullanıcının son görülme zamanını günceller ve aynı takımdaki aktif kullanıcıları döner.",
        responses={
            200: inline_serializer(
                name='PresenceResponse',
                fields={
                    'count': serializers.IntegerField(),
                    'users': inline_serializer(
                        name='ActiveUserItem',
                        many=True,
                        fields={
                            'id': serializers.IntegerField(),
                            'username': serializers.CharField(),
                            'first_name': serializers.CharField(),
                            'last_name': serializers.CharField(),
                        }
                    )
                }
            )
        }
    )
    def post(self, request):
        now = timezone.now()
        user = request.user

        # Son güncelleme üzerinden THROTTLE_UPDATE_SECONDS geçmişse veya hiç güncellenmemişse DB'ye yaz
        if not user.last_seen_at or (now - user.last_seen_at).total_seconds() >= THROTTLE_UPDATE_SECONDS:
            User.objects.filter(id=user.id).update(last_seen_at=now)
            user.last_seen_at = now

        threshold = now - timedelta(seconds=ACTIVE_THRESHOLD_SECONDS)

        # Organizasyon bazlı filtreleme (Karar #28)
        if hasattr(user, 'organization') and user.organization:
            active_queryset = User.objects.filter(
                organization=user.organization,
                last_seen_at__gte=threshold
            )
        else:
            active_queryset = User.objects.filter(
                id=user.id,
                last_seen_at__gte=threshold
            )

        active_count = active_queryset.count()
        active_users = list(
            active_queryset.values('id', 'username', 'first_name', 'last_name')[:15]
        )

        return Response({
            "count": active_count,
            "users": active_users
        })


class PresenceLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Ayrılma bildirimi (Leave / Logout)",
        description="Kullanıcı oturumu kapattığında last_seen_at alanını temizler.",
        responses={
            200: inline_serializer(
                name='PresenceLeaveResponse',
                fields={'status': serializers.CharField()}
            )
        }
    )
    def post(self, request):
        User.objects.filter(id=request.user.id).update(last_seen_at=None)
        return Response({"status": "left"})
