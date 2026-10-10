import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.organizations.models import Organization, Project, Unit
from apps.tasks.models import Task

User = get_user_model()

def seed():
    print("Test verileri oluşturuluyor (Faz 2 Yapısı)...")
    
    # 1. Organizasyon oluştur
    org, _ = Organization.objects.get_or_create(
        slug="1-5-adana",
        defaults={
            "name": "1.5 Adana Formula Student",
            "season": "2026",
            "race_date": "2026-09-22"
        }
    )
    print(f"Organizasyon: {org.name}")

    # Önceki verileri temizle (opsiyonel ama temiz başlangıç için iyi)
    Unit.objects.filter(organization=org).delete()
    Task.objects.filter(organization=org).delete()

    # 2. Faz 2 Birim Ağacı Oluştur
    # Kök Birim
    yazilim_unit = Unit.objects.create(name="Yazılım Departmanı", code="YZL", color="#3b82f6", organization=org, parent=None)
    
    # Alt Birimler (1. Seviye)
    oyun_unit = Unit.objects.create(name="Oyun", code="OYUN", color="#8b5cf6", organization=org, parent=yazilim_unit)
    web_unit = Unit.objects.create(name="Web", code="WEB", color="#06b6d4", organization=org, parent=yazilim_unit)
    gomulu_unit = Unit.objects.create(name="Gömülü", code="GML", color="#10b981", organization=org, parent=yazilim_unit)
    
    # Alt Birimler (2. Seviye - Gömülü altı)
    gomulu_tk_unit = Unit.objects.create(name="Gömülü_teknofest", code="GML-TK", color="#f59e0b", organization=org, parent=gomulu_unit)
    gomulu_fs_unit = Unit.objects.create(name="Gömülü_FSAE", code="GML-FS", color="#ef4444", organization=org, parent=gomulu_unit)
    
    print("Birim hiyerarşisi oluşturuldu (Yazılım -> Oyun, Web, Gömülü -> Teknofest, FSAE)")

    # 3. Test Kullanıcıları
    # Ekran görüntüsündeki mevcut gerçek kullanıcıların birimlerini ve rollerini güncelliyoruz.
    # Necdet (Yazılım Kaptanı)
    captain, _ = User.objects.get_or_create(email="necdetozdemir808@gmail.com", defaults={"username": "necdet_kaptan"})
    captain.first_name = "Necdet"
    captain.last_name = "Özdemir"
    captain.organization = org
    captain.role = 'captain'
    captain.unit = yazilim_unit
    captain.is_staff = True
    captain.is_superuser = True
    if not captain.check_password("pitwall123"): captain.set_password("pitwall123")
    captain.save()

    # Rumeysa (Web Birim Lideri)
    web_lead, _ = User.objects.get_or_create(email="33rumeysakucuk@gmail.com", defaults={"username": "rumeysa_lead"})
    web_lead.first_name = "Rumeysa"
    web_lead.last_name = "Küçük"
    web_lead.organization = org
    web_lead.role = 'lead'
    web_lead.unit = web_unit
    if not web_lead.check_password("pitwall123"): web_lead.set_password("pitwall123")
    web_lead.save()

    # Lidya (Web Birim Üyesi)
    web_member_lidya, _ = User.objects.get_or_create(email="lidyasu4@gmail.com", defaults={"username": "lidya_member"})
    web_member_lidya.first_name = "Lidya Su"
    web_member_lidya.last_name = "Girginer"
    web_member_lidya.organization = org
    web_member_lidya.role = 'member'
    web_member_lidya.unit = web_unit
    if not web_member_lidya.check_password("pitwall123"): web_member_lidya.set_password("pitwall123")
    web_member_lidya.save()

    # Yasemin (Web Birim Üyesi)
    web_member_yasemin, _ = User.objects.get_or_create(email="yyaseminkuru@gmail.com", defaults={"username": "yasemin_member"})
    web_member_yasemin.first_name = "Yasemin"
    web_member_yasemin.last_name = "Kuru"
    web_member_yasemin.organization = org
    web_member_yasemin.role = 'member'
    web_member_yasemin.unit = web_unit
    if not web_member_yasemin.check_password("pitwall123"): web_member_yasemin.set_password("pitwall123")
    web_member_yasemin.save()

    # Süleyman (Web Birim Üyesi)
    web_member_suleyman, _ = User.objects.get_or_create(email="suleymankara600@gmail.com", defaults={"username": "suleyman_member"})
    web_member_suleyman.first_name = "Süleyman"
    web_member_suleyman.last_name = "Kara"
    web_member_suleyman.organization = org
    web_member_suleyman.role = 'member'
    web_member_suleyman.unit = web_unit
    if not web_member_suleyman.check_password("pitwall123"): web_member_suleyman.set_password("pitwall123")
    web_member_suleyman.save()

    # Mert (Oyun Birim Lideri)
    oyun_lead_mert, _ = User.objects.get_or_create(email="mert.ozkara6363@gmail.com", defaults={"username": "mert_lead"})
    oyun_lead_mert.first_name = "Mert"
    oyun_lead_mert.last_name = "Özkara"
    oyun_lead_mert.organization = org
    oyun_lead_mert.role = 'lead'
    oyun_lead_mert.unit = oyun_unit
    if not oyun_lead_mert.check_password("pitwall123"): oyun_lead_mert.set_password("pitwall123")
    oyun_lead_mert.save()

    # Nisa (Oyun Birim Üyesi)
    oyun_member_nisa, _ = User.objects.get_or_create(email="nisaerdem3304@gmail.com", defaults={"username": "nisa_member"})
    oyun_member_nisa.first_name = "Nisa"
    oyun_member_nisa.last_name = "Erdem"
    oyun_member_nisa.organization = org
    oyun_member_nisa.role = 'member'
    oyun_member_nisa.unit = oyun_unit
    if not oyun_member_nisa.check_password("pitwall123"): oyun_member_nisa.set_password("pitwall123")
    oyun_member_nisa.save()

    # Züleyha (Gömülü Birim Lideri)
    gomulu_lead_zuleyha, _ = User.objects.get_or_create(email="gzuleyhanur@gmail.com", defaults={"username": "zuleyha_lead"})
    gomulu_lead_zuleyha.first_name = "Züleyha Nur"
    gomulu_lead_zuleyha.last_name = "Güneş"
    gomulu_lead_zuleyha.organization = org
    gomulu_lead_zuleyha.role = 'lead'
    gomulu_lead_zuleyha.unit = gomulu_unit
    if not gomulu_lead_zuleyha.check_password("pitwall123"): gomulu_lead_zuleyha.set_password("pitwall123")
    gomulu_lead_zuleyha.save()

    print("Gerçek takım üyeleri (Necdet, Rumeysa, Lidya, Yasemin, Süleyman, Mert, Nisa, Züleyha) birimlere atandı.")

    # 4. Projeler oluştur
    telemetri_proj, _ = Project.objects.get_or_create(name="Telemetri Sistemi", color="#10b981", organization=org)
    simulasyon_proj, _ = Project.objects.get_or_create(name="Simülasyon", color="#8b5cf6", organization=org)
    print("Projeler oluşturuldu.")

    # 5. Görevler oluştur
    task1 = Task.objects.create(
        organization=org,
        unit=web_unit,
        project=telemetri_proj,
        title="Dashboard UI Tasarımı",
        description="Pitwall ekranı için React bileşenlerinin tasarlanması.",
        status=Task.Status.IN_PROGRESS,
        priority=Task.Priority.HIGH
    )
    task1.assigned_to.add(web_lead, web_member_lidya)

    task2 = Task.objects.create(
        organization=org,
        unit=yazilim_unit,
        project=None,
        title="Yazılım Departmanı Haftalık Toplantısı",
        description="Tüm ekiplerin katılımıyla genel değerlendirme.",
        status=Task.Status.TODO,
        priority=Task.Priority.MEDIUM
    )
    task2.assigned_to.add(captain)

    Task.objects.create(
        organization=org,
        unit=gomulu_tk_unit,
        project=telemetri_proj,
        title="Sensör Veri Okuma Optimizasyonu",
        description="UART üzerinden gelen verilerin ayrıştırılması.",
        status=Task.Status.TODO,
        priority=Task.Priority.HIGH
    )

    print("Örnek görevler oluşturuldu.")

    print("Test verisi yükleme tamamlandı!")

if __name__ == "__main__":
    seed()
