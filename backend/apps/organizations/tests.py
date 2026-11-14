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


class UnitAPIPermissionTest(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
        from django.contrib.auth import get_user_model
        User = get_user_model()

        self.client = APIClient()
        self.org = Organization.objects.create(name="Formula Org", slug="formula-org")
        self.captain = User.objects.create_user(
            username="captain",
            email="cap@pitwall.app",
            password="pitwall123",
            role="captain",
            organization=self.org
        )
        self.member = User.objects.create_user(
            username="member",
            email="mem@pitwall.app",
            password="pitwall123",
            role="member",
            organization=self.org
        )
        self.parent_unit = Unit.objects.create(name="Parent Unit", organization=self.org)
        self.child_unit = Unit.objects.create(name="Child Unit", organization=self.org, parent=self.parent_unit)

    def test_captain_can_create_unit(self):
        self.client.force_authenticate(user=self.captain)
        res = self.client.post('/api/v1/units/', {
            'name': 'Yeni Departman',
            'code': 'YD',
            'color': '#ff0000'
        })
        self.assertEqual(res.status_code, 201)
        self.assertTrue(Unit.objects.filter(name='Yeni Departman').exists())

    def test_member_cannot_create_unit(self):
        self.client.force_authenticate(user=self.member)
        res = self.client.post('/api/v1/units/', {
            'name': 'Yetkisiz Departman'
        })
        self.assertEqual(res.status_code, 403)

    def test_unit_cannot_be_deleted_if_has_children(self):
        self.client.force_authenticate(user=self.captain)
        res = self.client.delete(f'/api/v1/units/{self.parent_unit.id}/')
        self.assertEqual(res.status_code, 400)
        self.assertTrue(Unit.objects.filter(id=self.parent_unit.id).exists())

    def test_unit_serializer_cycle_validation(self):
        self.client.force_authenticate(user=self.captain)
        # parent_unit'in üst birimini child_unit yapmayı dene (döngü)
        res = self.client.patch(f'/api/v1/units/{self.parent_unit.id}/', {
            'parent': self.child_unit.id
        })
        self.assertEqual(res.status_code, 400)

