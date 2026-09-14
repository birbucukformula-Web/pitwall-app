from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm
from .models import User


class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('email',)

    def save(self, commit=True):
        user = super().save(commit=False)
        # username alanı zorunlu olduğu için email'den otomatik türet
        if not user.username:
            user.username = user.email.split('@')[0]
        if commit:
            user.save()
        return user


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm

    list_display = ('email', 'first_name', 'last_name', 'role', 'organization', 'is_staff')
    list_filter = ('role', 'organization', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Kişisel Bilgiler', {'fields': ('first_name', 'last_name')}),
        ('PitWall Özel Alanlar', {'fields': ('role', 'organization')}),
        ('İzinler & Durum', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Önemli Tarihler', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'organization', 'is_staff', 'is_active'),
        }),
    )