# PitWall — Faz 3 Uygulama Planı

Bu dosya, projedeki güncel mimari ve Faz 2 kazanımları gözetilerek hazırlanmış, **ne yapılacağını ve hangi sırayla yapılacağını** tutan operasyonel Faz 3 planıdır.

**Hedef çıktı:** 
1. Sistemi Yazılım Departmanı dışındaki tüm departmanlara (Elektrik, Mekanik, Bando, Otonom) açmak.
2. Django Admin bağımlılığını tamamen ortadan kaldırarak **Captain için uygulama içi yönetim paneli** kurmak (Birimler, Projeler, Üye Rol/Birim Atama ve Kayıt Onayları).
3. **Kalıcı Bildirim (Notification) ve Gelen Kutusu (Inbox)** sistemini veritabanı ve sinyallerle gerçek zamanlı/kalıcı hale getirmek.
4. **Görev İçi Yorumlar ve Aktivite Geçmişi (TaskActivity)** akışını arayüze bağlamak.
5. UptimeRobot ping'lerini veritabanı sorgusuna bağlayarak Supabase'in uykuya geçmesini (inactivity pause) kalıcı olarak engellemek.

---

## 🏛️ Mimari Kararlar ve Veri Modeli

### 1. Çoklu Departman ve Hiyerarşi
- **Departmanlar:** `Unit` tablosunda `parent=None` olan kayıtlar ana departman seviyesidir (`Yazılım`, `Mekanik`, `Elektrik`, `Bando`).
- **Rol Yetkileri:**
  - `captain`: Organizasyonun genel kaptanıdır; tüm departmanlar, projeler, üyeler ve ayarlar üzerinde tam yetkiye sahiptir.
  - `lead`: Kendi departmanı (örn. Mekanik Sorumlusu) veya alt birimi (örn. Web Lideri) ve o ağacın altındaki tüm birimler/görevler üzerinde yönetim yetkisine sahiptir.
  - `member`: Kendi bağlı olduğu birim ve alt ağacındaki görevleri görüntüler, yorum yazar ve kendi görev durumlarını günceller.
- **Departmanlar Arası Görevler:** Görevler birim bazlı atanır. Farklı departmanların ortak projelerinde görevler ilgili departman/alt birim etiketleriyle panolarda filtrelenir.

### 2. Veri Modeli Değişiklikleri

```text
apps/accounts/models.py -> Notification (Yeni Model)
  - id: BigAutoField
  - recipient: FK(User, related_name='notifications', on_delete=CASCADE)
  - actor: FK(User, null=True, blank=True, on_delete=SET_NULL)
  - task: FK('tasks.Task', null=True, blank=True, on_delete=CASCADE)
  - type: CharField (choices: 'task_assigned', 'status_change', 'comment', 'deadline', 'announcement')
  - title: CharField(max_length=255)
  - message: TextField()
  - link: CharField(max_length=255, blank=True)
  - is_read: BooleanField(default=False)
  - created_at: DateTimeField(auto_now_add=True)

apps/tasks/models.py -> TaskActivity (Model Aktifleştirme & Genişletme)
  - id: BigAutoField
  - task: FK(Task, related_name='activities', on_delete=CASCADE)
  - user: FK(User, related_name='task_activities', on_delete=CASCADE)
  - activity_type: CharField (choices: 'comment', 'status_change', 'assignment', 'other')
  - content: TextField()
  - created_at: DateTimeField(auto_now_add=True)
```

---

## 🚀 Sıralı Uygulama Adımları

### 🔹 F3-Adım 0 — Altyapı ve Veritabanı Health-Check İyileştirmesi
- [x] `backend/config/urls.py` altındaki `health_check` görünümüne hafif bir veritabanı sorgusu (`SELECT 1`) eklenir.
- [x] UptimeRobot ping attığında hem web servisi hem de Supabase veritabanı sorgu alarak uyanık kalır; duraklatma (pause) riski ortadan kaldırılır.

**Bitti sayılır:** `/api/v1/health/` çağrıldığında veritabanı bağlantısı doğrulanarak `{"status":"healthy","database":"connected"}` dönüyor.

---

### 🔹 F3-Adım 1 — Çoklu Departman Ağacının Kurulması
- [x] Veritabanında ana departmanlar (`Yazılım`, `Mekanik`, `Elektrik`, `Bando`, `ORYANTASYON`) ve alt takımları (`High Voltage`, `Powertrain`, `Sponsorluk`, vb.) hiyerarşik olarak oluşturuldu (toplam 30 birim).
- [x] `Unit.get_descendant_ids()` fonksiyonunun çoklu kök departman ağacında bağımsız olarak doğru alt küme ürettiği doğrulandı.
- [x] `seed_data.py` yeni departman ve alt birim ağacıyla güncellendi.

**Bitti sayılır:** Yeni departmanlar ve alt takımlar panoda ve sol menüde hiyerarşik olarak seçilip filtrelenebiliyor.

---

### 🔹 F3-Adım 2 — Captain Yönetim Paneli: Backend API
- [x] **Birim Yönetimi (`Unit` CRUD):**
  - `POST /api/v1/units/`: Yeni birim/departman oluşturma (Sadece `captain`).
  - `PATCH /api/v1/units/<id>/`: Birim adı, rengi veya üst birimini (`parent`) güncelleme (döngüsel parent koruması ile).
  - `DELETE /api/v1/units/<id>/`: Birim silme (varsa alt birimleri veya görevleri koruma kontrolü ile).
- [x] **Proje Yönetimi (`Project` CRUD):**
  - `POST /api/v1/projects/`: Yeni proje oluşturma (Sadece `captain` ve yetkili `lead`).
  - `PATCH /api/v1/projects/<id>/`: Proje adı, renk veya arşivleme durumu (`is_archived`) güncelleme.
  - `DELETE /api/v1/projects/<id>/`: Proje silme/arşivleme.
- [x] **Üye Yönetimi ve Kayıt Onayı:**
  - `GET /api/v1/members/?status=pending`: Kayıt olmuş ancak onay bekleyen (`is_active=False`) kullanıcıları listeleme.
  - `PATCH /api/v1/members/<id>/`: Üyenin rolünü (`role`), birimini (`unit`) değiştirebilme ve `is_active=True` yaparak onaylama (Sadece `captain`).
  - `DELETE /api/v1/members/<id>/`: Üyeyi takımdan çıkarma / pasife alma.

**Bitti sayılır:** Django admin'e girmeden tüm birimler, projeler ve üyeler REST API üzerinden güvenli ve rol kontrollü yönetilebiliyor.

---

### 🔹 F3-Adım 3 — Captain Yönetim Paneli: Frontend Arayüzü
- [ ] `Settings.tsx` sayfasına veya `/settings` altına sadece `role === 'captain'` kullanıcıların görebileceği yönetim sekmeleri eklenir:
  - **Birimler Sekmesi:** Departman ve alt birim ekleme modalı, renk seçici, üst birim (parent) seçici, hiyerarşi listesi ve silme aksiyonu.
  - **Projeler Sekmesi:** Proje oluşturma, renk belirleme, arşivleme ve düzenleme kontrolleri.
  - **Üyeler Sekmesi:** Mevcut üyelerin rolünü (`lead`, `member`, `captain`) ve birimini tek tıkla değiştirebilen inline dropdown'lar.
  - **Onay Bekleyenler Sekmesi:** Yeni kayıt olan kişileri listeleme, birim/rol seçip tek tıkla "Onayla ve Takıma Ekle" butonu.

**Bitti sayılır:** Kaptan rolündeki bir kullanıcı tarayıcı arayüzünden yeni departman açabiliyor, yeni kayıt olan bir öğrenciyi onaylayıp ilgili takıma atayabiliyor.

---

### 🔹 F3-Adım 4 — Kalıcı Bildirim Sistemi: Backend
- [ ] `apps/accounts/models.py` içerisine `Notification` modeli eklenir ve migration alınır.
- [ ] Django Sinyalleri (`apps/tasks/signals.py`):
  - Göreve yeni bir kullanıcı atandığında (`m2m_changed` veya `post_save`) atanan kişiye `task_assigned` bildirimi.
  - Görev durumu değiştiğinde (`post_save`) görevin ilgililerine `status_change` bildirimi.
  - Göreve yeni yorum eklendiğinde `comment` bildirimi.
- [ ] Bildirim API Uç Noktaları:
  - `GET /api/v1/notifications/`: Kullanıcının bildirimlerini listeleme (filtre: `unread=true`).
  - `PATCH /api/v1/notifications/<id>/read/`: Tekil bildirimi okundu işaretleme.
  - `POST /api/v1/notifications/mark-all-read/`: Tüm bildirimleri tek seferde okundu işaretleme.
  - `GET /api/v1/notifications/unread-count/`: Okunmamış bildirim sayısı (hafif endpoint).

**Bitti sayılır:** Görev hareketleri veritabanında bildirim kayıtları üretiyor ve kullanıcının bildirim endpoint'leri çalışıyor.

---

### 🔹 F3-Adım 5 — Gelen Kutusu ve Üst Menü Bildirim Entegrasyonu: Frontend
- [ ] `NotificationContext.tsx` sahte/statik veriden arındırılarak `@tanstack/react-query` ile backend bildirim API'sine bağlanır.
- [ ] Üst menü (Header) bildirim çanı: Gerçek okunmamış bildirim rozet sayısı (badge) ve tıklandığında açılan hızlı bildirim listesi.
- [ ] `Inbox.tsx` sayfası: Gerçek bildirimleri listeleme, "Tümü / Okunmamış" filtreleme, tekli ve toplu okundu işaretleme, bildirime tıklandığında ilgili göreve gitme (`link`).

**Bitti sayılır:** Bir kullanıcıya görev atandığında, üst menüdeki çanda anında bildirim beliriyor ve Gelen Kutusu sayfasından okunup yönetilebiliyor.

---

### 🔹 F3-Adım 6 — Görev Detayı: Yorumlar ve Aktivite Geçmişi
- [ ] `TaskActivity` modeli için API endpoint'leri tanımlanır:
  - `GET /api/v1/tasks/<task_id>/activities/`: Göreve ait aktivite ve yorum akışı.
  - `POST /api/v1/tasks/<task_id>/activities/`: Göreve yorum ekleme (`activity_type='comment'`).
- [ ] `TaskModal.tsx` içindeki "Aktivite ve Yorumlar" alanı backend'e bağlanır:
  - Ekip üyeleri görev altına yorum yazabilir ve geçmiş yorumları görebilir.
  - Durum değişiklikleri ve atamalar otomatik aktivite kaydı olarak zaman damgasıyla listelenir.

**Bitti sayılır:** Görev detay modalında ekip içi yorumlaşma ve görev geçmişi eksiksiz çalışıyor.

---

### 🔹 F3-Adım 7 — Otomatik Testler ve Canlı Doğrulama
- [ ] Yeni modeller ve servisler için test yazımı:
  - Birim ve proje CRUD yetki testleri (`captain` dışındakilere 403 kontrolü).
  - Üye rol/birim güncelleme ve kayıt onaylama testleri.
  - Bildirim üretimi ve okundu işaretleme testleri.
  - Görev aktivite ve yorum oluşturma testleri.
- [ ] Canlı ortamda (Render + Supabase) çoklu departman senaryosuyla uçtan uca kabul testi:
  - 1 Captain (Tüm takımları yöneten),
  - 1 Elektrik Lead (Elektrik ve alt birimlerini yöneten),
  - 1 Mekanik Member (Sadece kendi birimini gören) rolleriyle doğrulama.

**Bitti sayılır:** Tüm test suiteleri yeşil; canlıda üç farklı roldeki kullanıcı sistemi başarıyla kullanabiliyor.

---

## ⚠️ Riskler ve Önlemler

| Risk | Etki | Önlem | Adım |
|---|---|---|---|
| Supabase Free Tier hareketsizlikten tekrar uykuya geçebilir | Backend 500 hatası, erişim kesintisi | `health_check` endpoint'ine hafif DB sorgusu eklenerek UptimeRobot ile sürekli uyanık tutulur | 0 |
| Birim silindiğinde bağlı görevlerin kaybolması riski | Veri kaybı | Birim silinmeden önce bağlı görev veya üye kontrolü yapılır; silme engellenir veya arşivleme zorunlu tutulur | 2 |
| Çok sayıda bildirim tablosunun şişmesi | Veritabanı yükü | Okunmuş eski bildirimler için zaman aşımı veya sayfalama (pagination) kullanılır | 4 |
| Döngüsel birim hiyerarşisi (`parent` zincirinde loop) | Sonsuz döngü / 500 | `UnitSerializer` ve model `clean()` metodunda döngü doğrulama algoritması işletilir | 2 |


---

## 📌 İleriki Faz Notu: Faz 4 — Ergonomi, Hız & İçerik (Notion & Cubicl Deneyimi)

Faz 3 başarıyla tamamlandıktan sonra devreye alınacak modüller:
1. **Alt Görevler & Kontrol Listesi (Checklist with Assignees):** Görev içine atanabilir maddeler, ilerleme çubuğu (`3/5 tamamlandı`).
2. **Hızlı Görev Ekleme (Inline Quick-Add):** Kolon altında modal açmadan tek tuşla/satırla görev oluşturma.
3. **Pano Hızlı Filtreleri (My Tasks & Priority):** Tek tıkla "Bana Atananlar", "Gecikenler", "Bu Hafta Bitenler" görünümü.
4. **Dahili Takım Wiki'si (Notion Lite):** CAD standartları, kural kitabı, kablaj şemaları için blok/markdown zengin metin düzenleyici.
5. **Dosya & Ek Yönetimi (Attachments):** Görevlere teknik çizim (CAD/PDF), kırık parça fotoğrafları ve belge ekleme.
6. **Kompakt Tablo / Liste Görünümü (List View):** Pano dışında Excel/Notion benzeri satır bazlı hızlı liste görünümü.
