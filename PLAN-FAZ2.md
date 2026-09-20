# PitWall — Faz 2 Planı

Bu dosya, projedeki güncel dosya ve klasör yapısı (Django apps) gözetilerek hazırlanmış, **ne yapılacağını ve hangi sırayla yapılacağını** tutan operasyonel bir plandır. 
Faz 2'nin **neden**i README'nin *Kararlar* bölümüne eklenecek aşağıdaki metindir — kod yazılmadan önce oraya işlenmelidir.

**Hedef çıktı:** Yazılım Departmanı için çok seviyeli birim hiyerarşisi ve buna bağlı rol tabanlı yetkilendirme; MVP'deki tek-seviye `role` alanının gerçek erişim kontrolüne dönüşmesi.

---

## README'ye eklenecek — Faz 2 Kararlar

> Bu blok olduğu gibi `README.md → Kararlar` bölümünün sonuna eklenir.

**Kapsam:** Faz 2 sadece Yazılım Departmanı'nı (Oyun, Web, Gömülü, Gömülü_teknofest, Gömülü_FSAE) kapsar. Diğer 3 departman (Elektrik, Mekanik, Bando) ve başka takımların kendi kurulumunu yapabilmesi bu fazın dışındadır (sırasıyla Faz 3 ve Faz 4).

**Birim hiyerarşisi:** `Unit` modeline `parent` (self-FK, `null=True`) eklenir. Derinlik sınırsızdır (Gömülü'nün altında iki alt birim daha var). Yetki hesaplaması özyinelemeli yapılır: bir kişinin erişimi bağlı olduğu `Unit` + o `Unit`'in tüm alt ağacını kapsar.

**Rol matrisi:**

| Rol | Görünürlük | Görev oluştur/ata/sil | Durum değiştir | Yorum |
|---|---|---|---|---|
| `captain` | Tüm organizasyon, koşulsuz | ✓ | ✓ | ✓ |
| `lead` | Kendi Unit'i + alt ağacı | ✓ (kendi ağacında) | ✓ (kendi ağacında) | ✓ |
| `member` | Kendi Unit'i + alt ağacı | ✗ | ✗ | ✓ |

`lead` rolü hiyerarşinin her seviyesinde aynı şekilde çalışır — departman kaptanı da alt birim kaptanı da teknik olarak `lead`'dir, tek fark bağlı oldukları `Unit`'in ağaç büyüklüğü.

---

## Veri Modeli Değişiklikleri

```
apps/organizations/models.py -> Unit
  id, organization, name, code, color, parent (self, boş olabilir)

apps/accounts/models.py -> User
  id, username, organization, role, unit (yeni eklenecek, boş olabilir)
```

- `Unit.parent` boşsa Unit en üst seviyededir (ör. "Yazılım Departmanı")
- Bir Unit'in erişilebilir görev kümesi = kendisi + tüm `parent` zincirinde kendisine bağlı alt birimler (aşağı doğru, özyinelemeli)
- Döngü koruması: `parent` atanırken kendisinin bir alt ağacı seçilemez.
- `User` modelinde şu an `unit` alanı yok, bu da kişilerin hangi birimde (ve ağacında) olduğunu bilmemizi engelliyor. `User` modeline `unit` eklenecek.

---

## API Sözleşmesi Eklentisi

`docs/API.md`'deki mevcut tabloya **rol sütunu** eklenir: her endpoint için hangi rolün erişebildiği yazılır (ör. `POST /tasks/` → `captain`, `lead`). Sözleşme, Faz 1'de olduğu gibi dondurulmadan önce ekip tarafından okunur.

---

## Adımlar

### F2-Adım 1 — Kararı dondur

- [ ] Yukarıdaki blok `README.md → Kararlar`'a eklenir.
- [ ] Ekip okur ve onaylar (özellikle kapsam sınırı: sadece Yazılım Departmanı).

**Bitti sayılır:** README'de Faz 2 kararı yayında, itiraz yok.

---

### F2-Adım 2 — Modeller ve Migration'lar (`Unit.parent` ve `User.unit`)

- [ ] `apps/organizations/models.py` içinde `Unit` modeline `parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="children")` eklenir.
- [ ] `apps/accounts/models.py` içinde `User` modeline `unit = models.ForeignKey('organizations.Unit', null=True, blank=True, on_delete=models.SET_NULL, related_name='members')` eklenir.
- [ ] Migration'lar alınır (`python manage.py makemigrations` ve `migrate`). Mevcut Unit'lere (departman seviyesi) `parent=None` kalır.
- [ ] Yazılım Departmanı altındaki gerçek alt birim ağacı admin panelinden girilir (Gömülü → Gömülü_teknofest, Gömülü_FSAE dahil) ve mevcut kullanıcılara ilgili `unit`'ler atanır.
- [ ] `apps/organizations/models.py` içinde `Unit` modeline `get_descendant_ids(self)` metodu yazılır. (Özyinelemeli olarak kendisi dahil alt birimlerin id'lerini dönecek).
- [ ] Basit birim testi: 3 seviyeli sahte ağaçta doğru id kümesi dönüyor mu (`apps/organizations/tests.py` içinde).

**Bitti sayılır:** Admin'den kurulan gerçek ağaçta `get_descendant_ids` doğru sonucu veriyor ve `User` artık bir birime bağlı.

---

### F2-Adım 3 — Yetki Katmanı (Backend Permissions)

- [ ] `apps/accounts/permissions.py` oluşturulup özel BasePermission sınıfları yazılır.
- [ ] `get_authorized_unit_ids(membership)` adında tek bir ortak yardımcı fonksiyon yazılır:
  - `captain` → Kısıt yok (tüm organizasyon).
  - `lead` → `subtree ∪ ancestors` (kendi alt ağacı ve bağlı olduğu üst birimler).
  - `member` → Boş liste (yazma izni yok, sadece yorum endpoint'i ayrı kontrol edilecek).
- [ ] Görünürlük (Read) işlemleri: Ayrı bir `get_visible_unit_ids` fonksiyonuna gerek yok. `lead` için görünürlük ve yetki aynı. `member` ise bu birimlerdeki görevleri sadece görebilir (görebiliyor ama yazamıyor).
- [ ] `TaskViewSet.get_queryset()` bu görünürlük kurallarına göre filtrelenir.
- [ ] Yazma izinleri: `TaskViewSet`'te `create` / `update` / `destroy` işlemleri sadece `captain` ve yetkili `lead` için açık hale getirilir. `member` sadece durum değiştirme (`PATCH {status, order}`) ve yorum yapabilir.
- [ ] Üye yönetimi (`MemberListView` vb.): Üye ekleme endpoint'i (`POST`) `role == 'captain'` dışındaki herkese 403 döner. Üye listesi okuma (GET) ise herkese açık (read-only) kalır.

**Bitti sayılır:** Farklı roller ve birimlerle API istekleri yapılıp her birinin gördüğü/yapabildiği şey rol matrisiyle birebir örtüşüyor.

---

### F2-Adım 4 — Sözleşme ve Dokümantasyon Güncellemesi

- [ ] `docs/API.md`'ye rol sütunu eklenir.
- [ ] `apps/accounts/serializers.py` içindeki `/auth/me/` (ör. `UserSerializer`) yanıtına, erişilebilir Unit id listesi (`accessible_unit_ids`) eklenir (frontend'in buton/görünürlük mantığı bunu kullanacak).

**Bitti sayılır:** Güncel sözleşme yayında, ekip onaylıyor.

---

### F2-Adım 5 — Backend Testleri

- [ ] Hiyerarşi testleri (`apps/tasks/tests.py` vb.): 3 seviyeli ağaçta `lead` görünürlüğü doğru filtreliyor mu?
- [ ] Rol testleri: `member` görev başlığı değiştirmeyi denediğinde 403 veya `ReadOnly` engeli alıyor mu?
- [ ] Sınır durumu: `parent` döngüsü (`unit.parent = unit.children.first()`) engelleniyor mu? (Bunu `Unit.clean()` metodunda doğrulamak iyi bir pratik olabilir).

**Bitti sayılır:** Yeni testler yeşil, mevcut testler (Faz 1'den kalanlar) hâlâ geçiyor.

---

### F2-Adım 6 — Frontend: Rol Tabanlı Arayüz

- [ ] `apiClient` veya context üzerinden alınan yetkilere göre Pano (Dashboard) filtre seçenekleri daraltılır.
- [ ] `member` yetkisindeki kullanıcılar için görev oluştur, düzenle (başlık/açıklama) ve sil butonları gizlenir. Sadece durum sürükleme ve yorum alanı açık kalır.
- [ ] Ayarlar / Üye listesi ekranı: Herkese açık (read-only) olarak listelenir, ancak üye ekle/düzenle/sil (edit/add/remove) butonları **sadece `captain` rolüne sahip kullanıcılarda** görünür.

**Bitti sayılır:** Üç farklı rolle giriş yapılıp arayüzde sadece izinli aksiyonlar görünüyor; backend engellemesi olsa bile arayüz temiz ve anlaşılır şekilde sınırlı.

---

### F2-Adım 7 — Canlı Doğrulama

- [ ] Gerçek Yazılım Departmanı ağacı ve üyeleri canlıya girilir.
- [ ] Bir `captain`, bir `lead` (alt birim), bir `member` hesabıyla uçtan uca denenir.
- [ ] Bulunan her hata issue olarak açılır.

**Bitti sayılır:** Üç rol de canlıda beklenen görünürlük ve yetkilerle çalışıyor.

---

## Riskler (Faz 2'ye özgü)

| Risk | Etki | Önlem | Adım |
|---|---|---|---|
| Alt ağaç sorgusu her istekte yeniden hesaplanır, performans düşebilir | Büyük ağaçlarda yavaşlama | Kapsam küçük (5 birim), şimdilik önbelleksiz özyineleme yeterli; büyürse cache eklenir | 2 |
| `parent` döngüsü yanlışlıkla oluşturulur | Sonsuz özyineleme / 500 hatası | Model `clean()` veya serializer'da döngü kontrolü (validation) eklenecek | 2 |
| Frontend gizler ama backend unutulursa yetki deliği | Yetkisiz görev değişikliği | Yetki her zaman backend'de (views ve permissions) zorunlu kılındı | 3, 6 |
| `User` modelinde `unit` eksikliği (Faz 1'den) | Hiyerarşik yetki hesaplanamaması | Planın Adım 2'sine eklendi; migration ile çözülecek. | 2 |

---

## İleriki Fazlar İçin Notlar (Faz 3/4)

- Elektrik, Mekanik ve Bando gibi diğer departmanlar sisteme dahil edildiğinde, "Departman Kaptanı" kavramı çoğullaşacaktır. Sistemin her departmanın kendi kaptanı tarafından mı yönetileceği yoksa tek bir organizasyon çapında (org-wide) kaptanın mı her şeyi yönetmeye devam edeceği konusu Faz 3/4 kapsamında netleştirilecek ve yetki mimarisi buna göre genişletilecektir.
