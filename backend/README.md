# PitWall Backend API

1.5 Adana Formula Student takımı için görev yönetim panosu Django REST Framework backend servisi.

---

## Mimari ve Uygulama Yapısı

Backend üç ana modülden (`apps`) oluşur:

### 1. `apps.accounts` (Kullanıcı & Kimlik Yönetimi)
- **Model:** `User` (AbstractUser tabanlı özel kullanıcı modeli). `role` (captain, lead, member) ve `organization` ilişkisini tutar.
- **Kimlik Doğrulama:** `djangorestframework-simplejwt` ile JWT tabanlı oturum.
  - `POST /api/v1/auth/login/`: Hem **kullanıcı adı** (`username`) hem de **e-posta** (`email`) ile girişi destekler.
  - `POST /api/v1/auth/refresh/`: 15 dakikalık access token dolduğunda 7 günlük refresh token ile yeni access token üretir (token rotation aktiftir).
  - `GET /api/v1/auth/me/`: Giriş yapan kullanıcının kendi profil ve organizasyon bilgilerini döner.
  - `GET /api/v1/members/`: Kullanıcının bağlı olduğu organizasyondaki tüm takım üyelerini listeler (görev atama ve profil listeleri için).

### 2. `apps.organizations` (Takım & Birimler)
- **Modeller:**
  - `Organization`: Takım genel bilgileri, slug ve `race_date` (yarış tarihi).
  - `Unit`: Alt birimler / departmanlar (ör. Web, Telemetri, Aerodinamik).
  - `Project`: Takıma bağlı projeler.
- **Endpoint'ler:**
  - `GET/POST /api/v1/units/`
  - `GET/POST /api/v1/projects/`
  - `GET /api/v1/organizations/`

### 3. `apps.tasks` (Görevler & Kanban Panosu)
- **Modeller:**
  - `Task`: Görev başlığı, açıklaması, durumu (`todo`, `in_progress`, `review`, `done`), önceliği (`low`, `medium`, `high`), birimi, projesi, atanan kullanıcılar (`assigned_to` çoklu ilişki), teslim tarihi (`due_date`) ve sıralama değeri (`order`).
  - `TaskActivity`: Görev durumu değişiklikleri ve yorum geçmişi.
- **Endpoint'ler:**
  - `GET /api/v1/tasks/`: Filtreleme parametreleri: `?status=`, `?unit=`, `?project=`, `?assignee=`, `?overdue=true`.
  - `POST /api/v1/tasks/`: Yeni görev oluşturma (kullanıcının organizasyonuna otomatik atanır).
  - `PATCH /api/v1/tasks/{id}/`: Görev güncelleme (kanban sürükle-bırak için `status` ve `order` güncellemeleri).
  - `DELETE /api/v1/tasks/{id}/`: Görevi silme.
  - `GET/POST /api/v1/tasks/{id}/activities/`: Görev aktivitelerini listeleme ve yorum ekleme.
  - `GET /api/v1/stats/summary/`: Pano istatistik kartları için özet sayaçlar (`total`, `todo`, `in_progress`, `review`, `done`, `overdue`).

---

## Güvenlik ve İzolasyon

- **Organizasyon İzolasyonu:** Kullanıcılar yalnızca kendi organizasyonlarına ait görevleri, birimleri ve üyeleri görebilir/değiştirebilir. `organization` alanı istemciden gelen parametreye göre değil, JWT oturumundaki `request.user.organization` üzerinden zorunlu kılınır.
- **Sessiz Token Yenileme:** Frontend istemcisi (`apiClient.ts`), access token süresi dolduğunda (HTTP 401) arka planda otomatik olarak `/auth/refresh/` çağrısı yaparak oturumu kesintisiz korur.

---

## Kurulum ve Çalıştırma

### Sanal Ortam & Paketler
```bash
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

### Veritabanı ve Migrasyonlar
```bash
python manage.py migrate
python manage.py seed_data   # Örnek takım ve görev verilerini yükler
```

### Sunucuyu Başlatma
```bash
python manage.py runserver
```

### Birim Testlerini Çalıştırma
```bash
python manage.py test
```
