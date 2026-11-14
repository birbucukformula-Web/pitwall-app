import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.organizations.models import Organization, Unit

def setup_tree():
    print("Departman ağacı kuruluyor...")
    org = Organization.objects.filter(slug="1-5-adana").first()
    if not org:
        org = Organization.objects.first()
    
    if not org:
        print("HATA: Organizasyon bulunamadı!")
        return

    print(f"Hedef Organizasyon: {org.name} (id={org.id})")

    # Renk Paleti
    C_ELEKTRIK = "#f59e0b"   # Amber
    C_MEKANIK = "#ef4444"    # Kırmızı
    C_YAZILIM = "#3b82f6"    # Mavi
    C_BANDO = "#8b5cf6"      # Mor
    C_ORYANTASYON = "#10b981"# Zümrüt Yeşili

    # Helper get_or_create
    def get_or_create_unit(name, code, color, parent=None):
        unit, created = Unit.objects.get_or_create(
            organization=org,
            name=name,
            defaults={"code": code, "color": color, "parent": parent}
        )
        if not created and unit.parent != parent:
            unit.parent = parent
            unit.save()
        status = "Oluşturuldu" if created else "Mevcut"
        print(f"  [{status}] {name} (parent: {parent.name if parent else 'KÖK'})")
        return unit

    # 1. ELEKTRİK DEPARTMANI
    print("\n--- 1. Elektrik Departmanı ---")
    elektrik = get_or_create_unit("Elektrik Departmanı", "ELK", C_ELEKTRIK, parent=None)
    hv = get_or_create_unit("High Voltage", "HV", C_ELEKTRIK, parent=elektrik)
    get_or_create_unit("Accumulator", "ACC", C_ELEKTRIK, parent=hv)
    get_or_create_unit("Accumulator Management System", "AMS", C_ELEKTRIK, parent=hv)
    get_or_create_unit("Low Voltage", "LV", C_ELEKTRIK, parent=elektrik)

    # 2. MEKANİK DEPARTMANI
    print("\n--- 2. Mekanik Departmanı ---")
    mekanik = get_or_create_unit("Mekanik Departmanı", "MEK", C_MEKANIK, parent=None)
    powertrain = get_or_create_unit("Powertrain", "PT", C_MEKANIK, parent=mekanik)
    get_or_create_unit("Drivetrain", "DT", C_MEKANIK, parent=powertrain)
    get_or_create_unit("Kompozit ve Üretim", "KOMP", C_MEKANIK, parent=mekanik)
    get_or_create_unit("Aerodinami", "AERO", C_MEKANIK, parent=mekanik)
    get_or_create_unit("Şasi", "SASI", C_MEKANIK, parent=mekanik)
    get_or_create_unit("Araç Dinamiği", "VDIN", C_MEKANIK, parent=mekanik)

    # 3. YAZILIM DEPARTMANI
    print("\n--- 3. Yazılım Departmanı ---")
    yazilim = get_or_create_unit("Yazılım Departmanı", "YZL", C_YAZILIM, parent=None)
    get_or_create_unit("Oyun", "OYUN", C_YAZILIM, parent=yazilim)
    get_or_create_unit("Web", "WEB", C_YAZILIM, parent=yazilim)
    gomulu = get_or_create_unit("Gömülü", "GML", C_YAZILIM, parent=yazilim)
    get_or_create_unit("Teknofest", "TK", C_YAZILIM, parent=gomulu)

    # 4. BANDO DEPARTMANI (Business and Operations)
    print("\n--- 4. Bando Departmanı ---")
    bando = get_or_create_unit("Bando Departmanı (Business and Operations Departmanı)", "BANDO", C_BANDO, parent=None)
    sponsorluk = get_or_create_unit("Sponsorluk Birimi", "SPN", C_BANDO, parent=bando)
    get_or_create_unit("Partner Relationship Management", "PRM", C_BANDO, parent=sponsorluk)
    get_or_create_unit("Medya ve Tasarım", "MED", C_BANDO, parent=bando)
    get_or_create_unit("Statik Event", "STATIK", C_BANDO, parent=bando)
    get_or_create_unit("Finans", "FIN", C_BANDO, parent=bando)

    # 5. ORYANTASYON
    print("\n--- 5. Oryantasyon ---")
    oryantasyon = get_or_create_unit("ORYANTASYON", "ORY", C_ORYANTASYON, parent=None)
    get_or_create_unit("BANDO ORYANTASYON", "ORY-BANDO", C_ORYANTASYON, parent=oryantasyon)
    get_or_create_unit("YAZILIM ORYANTASYON", "ORY-YZL", C_ORYANTASYON, parent=oryantasyon)
    get_or_create_unit("MEKANİK ORYANTASYON", "ORY-MEK", C_ORYANTASYON, parent=oryantasyon)
    get_or_create_unit("ELEKTRİK ORYANTASYON", "ORY-ELK", C_ORYANTASYON, parent=oryantasyon)

    print("\n✅ Tüm departman ağacı başarıyla kuruldu!")
    print(f"Toplam Birim Sayısı: {Unit.objects.filter(organization=org).count()}")

if __name__ == "__main__":
    setup_tree()

