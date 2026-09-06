from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskSummaryStatsView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('stats/summary/', TaskSummaryStatsView.as_view(), name='stats_summary'),
    path('', include(router.urls)),
]