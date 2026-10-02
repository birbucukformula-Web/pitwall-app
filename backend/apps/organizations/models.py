from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Organization(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, null=True, blank=True)
    season = models.CharField(max_length=50, null=True, blank=True)
    race_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Unit(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='units'
    )
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='children'
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=20, blank=True)

    def get_descendant_ids(self):
        """Özyinelemeli olarak kendisi dahil tüm alt birimlerin id'lerini döner."""
        ids = [self.pk]
        for child in self.children.all():
            ids.extend(child.get_descendant_ids())
        return ids

    def get_ancestor_ids(self):
        """Kendisi dahil tüm üst birimlerin id'lerini döner (köke kadar)."""
        ids = [self.pk]
        if self.parent_id is not None:
            ids.extend(self.parent.get_ancestor_ids())
        return ids

    def get_visible_unit_ids(self):
        """
        Bu birime bağlı bir kullanıcının görebileceği tüm birim id'lerini döner.
        Kural: kendi yolu = ancestors (köke kadar) + kendi subtree'si.
        Kardeş birimler dahil edilmez.
        """
        ancestor_ids = self.get_ancestor_ids()   # kendisi dahil, köke kadar
        descendant_ids = self.get_descendant_ids()  # kendisi dahil, alta kadar
        return list(set(ancestor_ids + descendant_ids))

    def clean(self):
        """parent olarak kendi alt ağacından bir birim seçilmesini engeller."""
        if self.parent_id is not None:
            if self.pk and self.parent_id in self.get_descendant_ids():
                raise ValidationError(
                    "Bir birim kendi alt birimi ile ebeveyn ilişkisi kuramaz (döngü koruması)."
                )

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

class Project(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=20, blank=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.organization.name} - {self.name}"