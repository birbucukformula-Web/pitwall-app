from rest_framework import serializers
from .models import Organization, Project, Unit
from django.contrib.auth import get_user_model

User = get_user_model()

class UnitMemberSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()
    teamRole = serializers.CharField(source='role')

    class Meta:
        model = User
        fields = ['id', 'name', 'initials', 'teamRole', 'email']

    def get_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username or obj.email

    def get_initials(self, obj):
        fn = obj.first_name[0].upper() if obj.first_name else ''
        ln = obj.last_name[0].upper() if obj.last_name else ''
        if fn or ln: return f"{fn}{ln}"
        return obj.email[0].upper() if obj.email else 'U'

class UnitSerializer(serializers.ModelSerializer):
    parent_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    unit_members = UnitMemberSerializer(source='members', many=True, read_only=True)

    class Meta:
        model = Unit
        fields = [
            'id', 'name', 'code', 'color',
            'parent', 'parent_name',
            'member_count', 'task_count',
            'organization', 'unit_members'
        ]
        read_only_fields = ['organization']

    def get_parent_name(self, obj):
        return obj.parent.name if obj.parent else None

    def get_member_count(self, obj):
        return obj.members.count()

    def get_task_count(self, obj):
        return obj.tasks.filter(status__in=['todo', 'in_progress', 'review']).count()

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['organization']

class OrganizationSerializer(serializers.ModelSerializer):
    projects = ProjectSerializer(many=True, read_only=True)
    units = UnitSerializer(many=True, read_only=True)

    class Meta:
        model = Organization
        fields = ('id', 'name', 'slug', 'season', 'race_date', 'created_at', 'projects', 'units')