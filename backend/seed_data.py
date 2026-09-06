import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.organizations.models import Organization, Project, Unit
from apps.tasks.models import Task

User = get_user_model()

def seed():
    print("Test verileri oluşturuluyor...")
    
    # 1. Organizasyon oluştur
    org, _ = Organization.objects.get_or_create(
        name="1.5 Adana Racing",
        slug="1-5-adana",
        season="2026",
        race_date="2026-08-15"
    )
    print(f"Organizasyon: {org.name}")

    # 2. Test Kullanıcısı oluştur
    user, created = User.objects.get_or_create(
        username="testuser",
        email="test@pitwall.app",
        organization=org
    )
    if created:
        user.set_password("pitwall123")
        user.first_name = "Test"
        user.last_name = "Kullanıcısı"
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print("Kullanıcı oluşturuldu: testuser / pitwall123")
    else:
        print("Kullanıcı zaten mevcut: testuser")

    # 3. Birimler oluştur
    yazilim_unit, _ = Unit.objects.get_or_create(name="Yazılım Ekibi", code="YZL", color="#3b82f6", organization=org)
    mekanik_unit, _ = Unit.objects.get_or_create(name="Mekanik Ekibi", code="MKN", color="#ef4444", organization=org)
    print("Birimler oluşturuldu.")

    # 4. Projeler oluştur
    telemetri_proj, _ = Project.objects.get_or_create(name="Telemetri Sistemi", color="#10b981", organization=org)
    sasi_proj, _ = Project.objects.get_or_create(name="Şasi Tasarımı", color="#f59e0b", organization=org)
    print("Projeler oluşturuldu.")

    # 5. Görevler oluştur
    if not Task.objects.filter(title="Dashboard UI Tasarımı").exists():
        task1 = Task.objects.create(
            organization=org,
            unit=yazilim_unit,
            project=telemetri_proj,
            title="Dashboard UI Tasarımı",
            description="Pitwall ekranı için yeni göstergelerin tasarlanması.",
            status=Task.Status.IN_PROGRESS,
            priority="HIGH"
        )
        task1.assigned_to.add(user)
        
        task2 = Task.objects.create(
            organization=org,
            unit=mekanik_unit,
            project=sasi_proj,
            title="Karbon Fiber Analizi",
            description="Şasi ağırlık dayanımı testleri.",
            status=Task.Status.TODO,
            priority="MEDIUM"
        )
        task2.assigned_to.add(user)
        print("Örnek görevler oluşturuldu.")
    
    print("Test verisi yükleme tamamlandı!")

if __name__ == "__main__":
    seed()
