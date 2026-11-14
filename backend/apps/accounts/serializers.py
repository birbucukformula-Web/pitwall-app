from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Notification
from apps.organizations.models import Organization, Unit

class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    task_id = serializers.IntegerField(source='task.id', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    isRead = serializers.BooleanField(source='is_read', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    taskId = serializers.IntegerField(source='task.id', read_only=True)

    class Meta:
        model = Notification
        fields = (
            'id', 'type', 'title', 'message', 'link',
            'is_read', 'created_at', 'task_id', 'task_title',
            'actor_name', 'isRead', 'createdAt', 'taskId'
        )
        read_only_fields = ('id', 'created_at', 'type', 'title', 'message', 'link', 'task_id', 'task_title')

    def get_actor_name(self, obj):
        if obj.actor:
            name = obj.actor.get_full_name()
            return name if name else obj.actor.username
        return None


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('id', 'name', 'slug', 'season', 'race_date')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        username_input = attrs.get(self.username_field)
        if username_input:
            user = User.objects.filter(email__iexact=username_input).first()
            if user:
                attrs[self.username_field] = user.username
        return super().validate(attrs)

class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    unit_id = serializers.IntegerField(source='unit.id', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    accessible_unit_ids = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'date_joined', 'organization',
            'unit_id', 'unit_name', 'accessible_unit_ids'
        )

    def get_accessible_unit_ids(self, obj):
        from apps.accounts.permissions import get_visible_unit_ids
        return get_visible_unit_ids(obj)

class MemberAdminUpdateSerializer(serializers.ModelSerializer):
    unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(),
        source='unit',
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = ('id', 'role', 'unit_id', 'is_active', 'first_name', 'last_name')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def create(self, validated_data):
        username = validated_data['email']
        user = User.objects.create(
            username=username,
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_active=False  # Must be approved by captain
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
