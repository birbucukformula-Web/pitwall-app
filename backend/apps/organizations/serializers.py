from rest_framework import serializers
from .models import Organization, Project, Unit


class UnitSerializer(serializers.ModelSerializer):
    parent_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Unit
        fields = [
            'id', 'name', 'code', 'color',
            'parent', 'parent_name',
            'member_count', 'task_count',
            'organization',
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