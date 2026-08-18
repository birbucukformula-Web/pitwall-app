from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'organization', 'project', 'status', 'order', 'due_date')
    list_filter = ('status', 'organization', 'project')
    search_fields = ('title', 'description')