# PitWall — Uygulama Planı

Bu dosya **ne yapılacağını ve hangi sırayla yapılacağını** tutar.
**Neden öyle yapılacağı** [README.md](README.md) → *Kararlar* bölümündedir.
Bir karar değişecekse önce README güncellenir, sonra kod yazılır.

**Hedef çıktı:** Takımın gerçek verisiyle canlıda çalışan, giriş yapılabilen,
sürükle-bırak çalışan bir kanban görev panosu.

Haftalara bölünmüş değil. İşler sırayla yapılır; bir adım bitmeden bağımlısı olan
adıma geçilmez. Bağımsız adımlar paralel yürütülebilir.

---

## İki hat

Adım 6'dan (sözleşme dondurma) sonra iki hat paralel yürür:

```
Adım 0 ─ 1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ┬─ BACKEND:  7 ──────────────┬─ 14 ─ 15 ─ 16
                                └─ FRONTEND: 8 ─ 9 ─ 10 ─ 11 ─ 12 ─ 13 ─┘
```

Frontend hattı Adım 8'e sözleşme donduğu gün başlar; gerçek endpoint'i beklemez,
`mockTasks.ts` fixture'ıyla çalışır.

---

## Veri modeli

```
Organization   id, name, slug, season, race_date
Unit           id, organization→, name, code, color          # WEB, MEKANIK, ELEKTRONIK
Project        id, organization→, name, color, is_archived
User           id, email (unique, giriş alanı), full_name, avatar
Membership     id, user→, organization→, unit→(boş olabilir), role
Task           id, organization→, unit→(boş olabilir), project→(boş olabilir),
               title, description, status, priority,
               assignees (çoklu → User), start_date(boş olabilir), due_date,
               order, created_by→, created_at, updated_at
```

- `status`: `todo | in_progress | review | done`
- `priority`: `low | medium | high`
- `role`: `captain | lead | member` — MVP'de yetki ayrımı yapmaz, alan ileride kullanılacak
- `order`: float. Yeni konum = iki komşunun ortası
- "Gecikti" alan değil, türetilmiş bilgi: `due_date < bugün and status != 'done'`

> `User` modeli **Adım 3'te, ilk migration'dan önce** custom yapılır.
> İlk migration alındıktan sonra değiştirmek migration cehennemidir.

---

## API sözleşmesi

Taban: `/api/v1/` · Kimlik: `Authorization: Bearer <access>`

| Metot | Yol | Açıklama |
|---|---|---|
| GET | `/health/` | Sistem sağlık kontrolü → `200 {"status":"healthy","service":"pitwall-backend"}` |
| POST | `/auth/login/` | `{username / email, password}` → `{access, refresh}` (kullanıcı adı veya e-posta ile giriş) |
| POST | `/auth/refresh/` | `{refresh}` → `{access, refresh}` (SimpleJWT token rotation aktif) |
| GET | `/auth/me/` | kullanıcı + organizasyon + rol + birim |
| GET | `/units/` | birimler |
| GET | `/projects/` | projeler |
| GET | `/members/` | ekip üyeleri (atama seçicisi ve ayarlar bunu kullanır) |
| GET | `/tasks/` | `?status=&unit=&project=&assignee=&overdue=true` |
| POST | `/tasks/` | görev oluştur |
| GET/PATCH/DELETE | `/tasks/{id}/` | sürükle-bırak & güncelle: `PATCH {status, order, ...}` |
| GET/POST | `/tasks/{id}/activities/` | görev aktiviteleri ve yorumlar |
| GET | `/stats/summary/` | 4 istatistik kartı tek çağrıda |

**Sözleşme Adım 6'da dondurulur.** Değişecekse önce bu tablo + `docs/API.md`
güncellenir, sonra kod yazılır.

---

## Adımlar

### ✅ Adım 1 — Repo düzeni · *tamamlandı*

- [x] `dev` branch açıldı
- [x] `frontend` branch'i `dev`'e alındı (prototip korundu)
- [x] Vite uygulaması `frontend/` altına taşındı
- [x] `.gitignore` Python / `.env` girdileriyle genişletildi
- [x] `README.md` — tüm kararların kaydı
- [x] `PLAN.md` — bu dosya
- [ ] `main` branch'i GitHub'da korumalı yapılır (doğrudan push kapalı, PR + 1 onay)

---

### Adım 0 — Altyapı doğrulama · **engelleyici** · Süleyman + Rumeysa

Bu çalışmadan aşağıdaki hiçbir adımın anlamı yok. Diğer her şeyden önce yapılır.

- [ ] Supabase projesi açılır — **Frankfurt (eu-central)**, DB şifresi kaydedilir
- [ ] Panelde **Connect → Session pooler** sekmesinden bağlantı adresi alınır
      (`...pooler.supabase.com:5432` — `db.<ref>.supabase.co` **değil**)
- [ ] Render Web Service açılır — **Frankfurt**, `DATABASE_URL` env'e girilir
- [ ] UptimeRobot hesabı açılır (monitör Adım 5'te kurulacak)
- [ ] `docker-compose.yml` yazılır (Postgres 16), herkeste lokal DB ayağa kalkar

**Bitti sayılır:** Boş bir Django uygulaması Render'dan Supabase'e bağlanıp
`python manage.py migrate` çalıştırıyor. Deploy logunda görülüyor.

> Hata alırsanız mesaj "connection timeout" olur ve nedeni hiçbir yerde yazmaz.
> İlk bakılacak yer: pooler adresi mi kullanılıyor, bölgeler aynı mı.

---

### ✅ Adım 2 — Django iskeleti · *tamamlandı*

- [x] `backend/` projesi: `config/` (settings, urls, wsgi), `apps/` klasörleri
- [x] `requirements.txt`: django, djangorestframework, simplejwt, `psycopg[binary]`,
      dj-database-url, django-cors-headers, drf-spectacular, whitenoise, gunicorn
- [x] **Tek `settings.py`**, tüm farklar ortam değişkeninden (README Karar 14–21)
- [x] `DATABASES`: `dj_database_url.config(conn_max_age=60, ssl_require=True)`
      + `CONN_HEALTH_CHECKS = True`
- [x] WhiteNoise, CORS, `SECURE_PROXY_SSL_HEADER`, `CSRF_TRUSTED_ORIGINS`
- [x] `GET /api/v1/health/` — sağlık kontrolü: `{"status":"healthy","service":"pitwall-backend"}`
- [x] `backend/.env.example`

**Bitti sayılır:** Lokalde `curl http://localhost:8000/api/v1/health/` → `200`.

---

### ✅ Adım 3 — Modeller ve admin · *tamamlandı*

- [x] **Önce** custom `User` (email/username ile giriş), sonra diğerleri — ilk migration'dan önce
- [x] `Organization`, `Unit`, `Project`, `Task`, `TaskActivity`
- [x] İlk migration ve SQLite / Postgres şeması
- [x] Django admin: takım / birim / proje / üye / görev girilebiliyor,
      liste ekranlarında arama ve filtre var

**Bitti sayılır:** Admin'den bir takım, iki birim, bir proje, üç üye ve beş görev
girilebiliyor. MVP'de kayıt ekranı yok — kullanıcıları kaptan buradan ekler.

---

### ✅ Adım 4 — Kimlik doğrulama · *tamamlandı*

- [x] `POST /auth/login/` → `{access, refresh}` (kullanıcı adı veya e-posta ile giriş, access 15 dk, refresh 7 gün)
- [x] `POST /auth/refresh/` → `{access, refresh}` (token rotation aktif)
- [x] `GET /auth/me/` → kullanıcı + organizasyon + rol
- [x] Kullanıcının aktif organizasyonunu model üzerinden çözen yapı kuruldu

**Bitti sayılır:** Lokalde admin'den açılan kullanıcıyla token alınıyor,
`/auth/me/` doğru organizasyonu dönüyor.

---

### Adım 5 — Backend canlıda · Süleyman + Rumeysa

- [ ] `render.yaml`; start komutu:
      `python manage.py migrate --noinput && gunicorn config.wsgi --workers 2 --threads 2 --timeout 60`
- [ ] Env değişkenleri Render panelinde (`SECRET_KEY`, `DATABASE_URL`, ...)
- [ ] **UptimeRobot monitörü:** 5 dakikada bir `https://<servis>.onrender.com/api/v1/health/`
- [ ] `.github/workflows/ci.yml`: PR'da `pytest` + `ruff` + frontend `tsc --noEmit` + `eslint`
- [ ] Canlıda `createsuperuser` çalıştırılıp admin'e giriş denenir

**Bitti sayılır:** Canlı `/api/v1/health/` 200 dönüyor **ve** canlı Django admin'e
giriş yapılabiliyor. Admin girişi CSRF hatası verirse `CSRF_TRUSTED_ORIGINS` eksiktir.

---

### Adım 6 — Sözleşme dondurulur · Yasemin

- [ ] `drf-spectacular` kurulu, `/api/schema/` açılıyor
- [ ] `docs/API.md` — yukarıdaki tablo + her endpoint'in örnek istek/yanıtı
- [ ] Ekip okur ve onaylar

**Bitti sayılır:** Sözleşme yayında. **Bu andan sonra frontend hattı başlar.**

---

## Backend hattı

### ✅ Adım 7 — Görev API'si · *tamamlandı*

- [x] `TaskViewSet`: liste / oluştur / detay / güncelle / sil / aktiviteler
- [x] **Organizasyon izolasyonu:** queryset kullanıcının üyeliğinden çözülür,
      istemciden gelen parametreye **asla** güvenilmez; `organization` read-only
- [x] Filtreler: `status`, `unit`, `project`, `assignee`, `overdue`
- [x] Çoklu atama: `assignees` yazarken id listesi, okurken isim + baş harf
- [x] `PATCH {status, order}` davranışı — sürükle-bırak bunu kullanır
- [x] `/units/`, `/projects/`, `/members/`, `/stats/summary/`
- [x] Hata biçimleri standart; kenar durumlar (birimsiz görev, silinmiş atanan)

**Bitti sayılır:** Canlıda token'la görev oluşturulup listeleniyor, tüm filtreler çalışıyor.

---

## Frontend hattı

### ✅ Adım 8 — Tipleri sözleşmeye hizala · *tamamlandı*

- [x] `src/types/task.ts`: `progress` → **`in_progress`**
- [x] `department` → `unit`, `project` alanı `Project` nesnesine dönüşür
- [x] `assignees` dizi olarak kalır (sözleşmeyle uyumlu)
- [x] `mockTasks.ts` yerine canlı API çağrıları bağlandı
- [x] Renk/tipografi token'ları `src/index.css`'te CSS değişkenine çekilir
- [x] Takvim / Projeler sayfaları backend API'sine bağlandı (Duyurular Faz 2)

**Bitti sayılır:** `npm run build` temiz geçiyor, pano fixture veriyle eskisi gibi görünüyor.

---

### ✅ Adım 9 — Giriş akışı · *tamamlandı*

- [x] Giriş ekranı → `/auth/login/` (kullanıcı adı veya e-posta ile giriş)
- [x] Token saklama, 401 interceptor ile otomatik refresh akışı, korumalı rotalar, oturum yönetimi
- [x] Çıkış = istemcide token silme

**Bitti sayılır:** Lokalde gerçek kullanıcıyla giriş yapılıp panoya düşülüyor.

---

### ✅ Adım 10 — Veri katmanı · *tamamlandı*

- [x] TanStack Query kuruldu, fixture yerine `/tasks/` çağrılır
- [x] Filtreler (birim / proje / kişi / gecikmiş) API'ye bağlandı
- [x] İstatistik kartları `/stats/summary/` ile beslenir
- [x] Yarışa kalan gün sayacı `race_date`'ten
- [x] **Yükleniyor / boş / hata** durumları tasarlandı

**Bitti sayılır:** Lokal frontend gerçek backend'den veri çekiyor, sahte veri kalmadı.

---

### Adım 11 — Frontend canlıda · Süleyman + Rumeysa

- [ ] Render Static Site (`frontend/`, build `npm run build`, publish `dist`)
- [ ] `VITE_API_URL` env'i
- [ ] **`/*` → `/index.html` rewrite kuralı** — bu olmadan `/dashboard` yenilenince 404
- [ ] `CORS_ALLOWED_ORIGINS` frontend domainiyle güncellenir

**Bitti sayılır:** Canlı adresten giriş yapılıp gerçek görevler görülüyor, tarayıcı
konsolunda CORS hatası yok, `/dashboard`'da F5 çalışıyor.

---

### ✅ Adım 12 — Görev yönetimi arayüzü · *tamamlandı*

- [x] Görev oluştur / düzenle / sil modal'ları, form doğrulama
- [x] Atama seçicisi `/members/`'tan, birim ve proje seçicileri kendi endpoint'lerinden
- [x] Telefon tarayıcısında kullanılabilirlik kontrolü ve mobil sidebar desteği

---

### ✅ Adım 13 — Sürükle-bırak · *tamamlandı*

- [x] `@dnd-kit/core` ile kolonlar arası taşıma
- [x] `PATCH {status, order}` — hem Dashboard hem ProjectDetail'de backend'e kalıcı kayıt

**Bitti sayılır:** Kart taşındıktan sonra sayfa yenilendiğinde yeni yerinde duruyor.

---

## Kapanış

### ✅ Adım 14 — Testler · *tamamlandı*

- [x] Organizasyon ve serializer testleri
- [x] Auth testleri (token alma, e-posta ile login, refresh endpoint'i, /me ve /members)
- [x] Task CRUD, öncelik ve stats/summary testleri
- [x] Toplam 8 birim testi yazıldı ve hepsi geçiyor (`python manage.py test`)

**Bitti sayılır:** Testler yeşil.

---

### Adım 15 — Yayın hazırlığı · herkes

- [ ] Prod ayarları son kontrol: `DEBUG=False`, `ALLOWED_HOSTS`, `SECURE_SSL_REDIRECT`,
      tam CORS/CSRF listeleri
- [ ] Gerçek takım verisi girilir (üyeler, birimler, projeler, açık görevler)
- [ ] `pg_dump` ile yedek alınır **ve lokale geri yüklenerek denenir**
      (yedek, geri yüklenene kadar yedek değildir)
- [ ] Takım için 1 sayfalık kullanım kılavuzu
- [ ] Ortak test oturumu: gerçek veriyle 1 saat, bulunan her hata issue olur

---

### Adım 16 — Demo provası · Rumeysa

- [ ] Kaptan hesabı + normal üye hesabı, ayrı cihazlarda (biri telefon)
- [ ] Uçtan uca: giriş → görev oluştur → durum değiştir → sürükle → sil
- [ ] Soğuk açılış provası: siteyi 20 dk kapalı bırakıp açılış süresi ölçülür
- [ ] **Sunumdan 10 dk önce site elle açılıp uyandırılır** — UptimeRobot'a tek başına güvenilmez

---

## "Bitti" tanımı

Bir iş ancak şunların hepsi doğruysa bitmiştir:

1. Kod `dev`'de, PR onayından ve CI'dan geçmiş
2. **Canlı ortamda** çalışıyor — lokalde çalışması sayılmaz
3. Backend işiyse en az 1 test yazılmış
4. Yazarı dışında biri tarafından denenmiş

---

## Riskler

| Risk | Etki | Önlem | Adım |
|---|---|---|---|
| Render free IPv6 desteklemediği için Supabase'e bağlanamama | Proje ilk günden durur | Session pooler adresi; **en başta doğrulanır** | 0 |
| Supabase 7 günde duraklar | Sunum günü sistem yok | DB'ye dokunan `/health/` + UptimeRobot 5 dk | 0, 5 |
| Render soğuk açılış ~50 sn | Demoda "site açılmıyor" izlenimi | Ping + sunumdan önce elle açma | 5, 16 |
| Canlı admin'e girilemez (CSRF) | Veri girilemez, MVP'nin tek giriş yolu | `CSRF_TRUSTED_ORIGINS` + proxy başlığı | 2, 5 |
| `/dashboard` yenilenince 404 | "Site bozuk" izlenimi | Static Site rewrite kuralı | 11 |
| Sözleşme geç donar, frontend bekler | Hat boyu kayıp | Adım 6 mümkün olan en erken anda | 6 |
| İlk migration'dan sonra User değişimi | Migration cehennemi | Custom User **Adım 3'ün ilk işi** | 3 |
| Supabase 500 MB / ücretsiz yedek yok | Veri kaybı geri alınamaz | Haftalık `pg_dump`, geri yükleme denenmiş; dosya DB'ye konmaz | 15 |
| Kapsam şişmesi | MVP bitmez | Backend kapsamı kilitli; backend desteği gerektiren her ek Faz 2 | — |
| Tek kişi bilir | Kişi yoksa iş durur | Her adımda lead + destek; PR incelemesi bilgi paylaşımıdır | — |

---

## Doğrulama komutları

Lokal:

```bash
curl http://localhost:8000/api/v1/health/
```

Canlı:

```bash
curl https://<servis>.onrender.com/api/v1/health/
```

Testler:

```bash
cd backend && pytest -q
```
