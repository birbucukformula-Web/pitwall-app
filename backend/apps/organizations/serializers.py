from rest_framework import serializers
from .models import Organization, Project, Unit


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class OrganizationSerializer(serializers.ModelSerializer):
    projects = ProjectSerializer(many=True, read_only=True)
    units = UnitSerializer(many=True, read_only=True)

    class Meta:
        model = Organization
        fields = ('id', 'name', 'slug', 'season', 'race_date', 'created_at', 'projects', 'units')