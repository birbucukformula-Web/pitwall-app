from rest_framework import serializers
from .models import Task, TaskActivity
from django.contrib.auth import get_user_model

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    assignees = serializers.PrimaryKeyRelatedField(
        source='assigned_to',
        queryset=User.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = Task
        fields = [
            'id', 'organization', 'unit', 'project', 'title', 'description', 
            'status', 'priority', 'assignees', 'order', 'start_date', 'due_date', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['organization']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # return {id, name, initials} for assignees as requested by PLAN.md and frontend types
        assignees_data = []
        for user in instance.assigned_to.all():
            if user.first_name:
                name = f"{user.first_name} {user.last_name}" if user.last_name else user.first_name
                initials = f"{user.first_name[0]}{user.last_name[0]}" if user.last_name else user.first_name[0]
            else:
                name = user.username
                initials = user.username[0].upper()
                
            assignees_data.append({
                'id': user.id,
                'name': name.strip(),
                'initials': initials.upper()
            })
        representation['assignees'] = assignees_data
        
        # Serialize unit and project as objects for frontend, instead of just IDs
        # To keep it simple, we inject them in to_representation, but accept IDs for writes.
        if instance.unit:
            representation['unit'] = {
                'id': instance.unit.id,
                'name': instance.unit.name,
                'code': instance.unit.code,
                'color': instance.unit.color
            }
        else:
            representation['unit'] = None
            
        if instance.project:
            representation['project'] = {
                'id': instance.project.id,
                'name': instance.project.name,
                'color': instance.project.color
            }
        else:
            representation['project'] = None
            
        return representation

class TaskActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskActivity
        fields = ['id', 'task', 'user', 'activity_type', 'content', 'created_at']
        read_only_fields = ['task', 'user', 'activity_type', 'created_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Add basic user info
        user = instance.user
        if user.first_name:
            name = f"{user.first_name} {user.last_name}" if user.last_name else user.first_name
            initials = f"{user.first_name[0]}{user.last_name[0]}" if user.last_name else user.first_name[0]
        else:
            name = user.username
            initials = user.username[0].upper()
            
        representation['user_info'] = {
            'id': user.id,
            'name': name.strip(),
            'initials': initials.upper()
        }
        return representation