from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.organizations.models import Organization, Unit


class UnitHierarchyTest(TestCase):
    """
    F2-Adım 2: get_descendant_ids() ve döngü koruma testi.
    Ağaç:
        Yazılım (kök)
        ├── Web
        └── Gömülü
            ├── Gömülü_teknofest
            └── Gömülü_FSAE
    """

    def setUp(self):
        self.org = Organization.objects.create(name="Test Takımı", slug="test")

        self.yazilim = Unit.objects.create(
            organization=self.org, name="Yazılım", parent=None
        )
        self.web = Unit.objects.create(
            organization=self.org, name="Web", parent=self.yazilim
        )
        self.gomulu = Unit.objects.create(
            organization=self.org, name="Gömülü", parent=self.yazilim
        )
        self.teknofest = Unit.objects.create(
            organization=self.org, name="Gömülü_teknofest", parent=self.gomulu
        )
        self.fsae = Unit.objects.create(
            organization=self.org, name="Gömülü_FSAE", parent=self.gomulu
        )

    # --- get_descendant_ids ---

    def test_kok_tum_agaci_doner(self):
        """Kök birim tüm alt ağacı (kendisi dahil) döndürmeli."""
        ids = self.yazilim.get_descendant_ids()
        beklenen = {
            self.yazilim.pk,
            self.web.pk,
            self.gomulu.pk,
            self.teknofest.pk,
            self.fsae.pk,
        }
        self.assertEqual(set(ids), beklenen)

    def test_ara_birim_kendi_alt_agacini_doner(self):
        """Ara birim (Gömülü) sadece kendi alt ağacını döndürmeli."""
        ids = self.gomulu.get_descendant_ids()
        beklenen = {self.gomulu.pk, self.teknofest.pk, self.fsae.pk}
        self.assertEqual(set(ids), beklenen)

    def test_yaprak_sadece_kendini_doner(self):
        """Çocuğu olmayan birim yalnızca kendini döndürmeli."""
        ids = self.fsae.get_descendant_ids()
        self.assertEqual(ids, [self.fsae.pk])

    def test_kok_ust_birim_dahil_edilmez(self):
        """Web birimi; Yazılım'ı (üst) kapsamamalı."""
        ids = self.web.get_descendant_ids()
        self.assertNotIn(self.yazilim.pk, ids)

    # --- Döngü koruması (clean) ---

    def test_dongu_korumasi_kendi_alt_birimi(self):
        """Bir birim kendi alt birimini parent yapamaz."""
        self.yazilim.parent = self.web  # Web, Yazılım'ın çocuğu
        with self.assertRaises(ValidationError):
            self.yazilim.clean()

    def test_dongu_korumasi_ikinci_derece(self):
        """İkinci derece döngü de engellenmeli."""
        self.yazilim.parent = self.teknofest
        with self.assertRaises(ValidationError):
            self.yazilim.clean()

    def test_gecerli_parent_degisimi_hata_vermez(self):
        """Geçerli bir parent atama ValidationError fırlatmamalı."""
        yeni_birim = Unit.objects.create(
            organization=self.org, name="Bağımsız", parent=None
        )
        yeni_birim.parent = self.yazilim
        yeni_birim.clean()  # hata fırlatmamalı
