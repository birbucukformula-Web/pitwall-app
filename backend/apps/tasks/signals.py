from django.db.models.signals import post_save, pre_save, m2m_changed
from django.dispatch import receiver
from .models import Task, TaskActivity
from apps.accounts.models import Notification, User


@receiver(m2m_changed, sender=Task.assigned_to.through)
def task_assigned_notification(sender, instance, action, pk_set, **kwargs):
    """
    Göreve yeni üye(ler) atandığında bildirim oluşturur.
    """
    if action == "post_add" and pk_set:
        for user_id in pk_set:
            user = User.objects.filter(id=user_id).first()
            if user:
                Notification.objects.create(
                    recipient=user,
                    task=instance,
                    type=Notification.NotificationType.TASK_ASSIGNED,
                    title=f"Yeni Görev: {instance.title}",
                    message=f"'{instance.title}' görevi size atandı.",
                    link=f"/projects?task={instance.id}",
                )


@receiver(pre_save, sender=Task)
def task_pre_save_track_status(sender, instance, **kwargs):
    """
    Durum değişikliğini yakalamak için eski durumu bellekte tutar.
    """
    if instance.pk:
        old_status = Task.objects.filter(pk=instance.pk).values_list('status', flat=True).first()
        instance._old_status = old_status
    else:
        instance._old_status = None


@receiver(post_save, sender=Task)
def task_status_changed_notification(sender, instance, created, **kwargs):
    """
    Görev durumu değiştiğinde atanan tüm üyelere bildirim oluşturur.
    """
    if not created and hasattr(instance, '_old_status') and instance._old_status:
        if instance._old_status != instance.status:
            status_display = instance.get_status_display()
            assignees = instance.assigned_to.all()
            for user in assignees:
                Notification.objects.create(
                    recipient=user,
                    task=instance,
                    type=Notification.NotificationType.TASK_UPDATED,
                    title=f"Durum Güncellendi: {instance.title}",
                    message=f"Görev durumu '{status_display}' olarak güncellendi.",
                    link=f"/projects?task={instance.id}",
                )


@receiver(post_save, sender=TaskActivity)
def task_comment_notification(sender, instance, created, **kwargs):
    """
    Göreve yeni yorum eklendiğinde görevdeki diğer atanmış kişilere bildirim gönderir.
    """
    if created and instance.activity_type == TaskActivity.ActivityType.COMMENT:
        task = instance.task
        author = instance.user
        author_name = author.get_full_name() or author.username

        # Yorumu yazan kişi dışındaki tüm görev sorumlularına bildirim oluştur
        recipients = task.assigned_to.exclude(id=author.id)
        for recipient in recipients:
            Notification.objects.create(
                recipient=recipient,
                actor=author,
                task=task,
                type=Notification.NotificationType.COMMENT,
                title=f"{author_name} yeni bir yorum ekledi",
                message=instance.content[:150] if instance.content else "",
                link=f"/projects?task={task.id}",
            )
