# PitWall

1.5 Adana Formula Student takımı için görev yönetim panosu.
Kanban tabanlı görev takibi, birim/proje bazlı filtreleme, yarış geri sayımı.

- **Backend:** Django 5 + DRF · Render (Frankfurt)
- **Frontend:** React + Vite + TypeScript · Render Static Site
- **Veritabanı:** Supabase Postgres (Frankfurt)

Yapılacak işlerin sırası için: [PLAN.md](PLAN.md)

---

## Repo yapısı

```
pitwall-app/
├── backend/              # Django projesi
│   ├── config/           # settings.py, urls.py, wsgi.py
│   ├── apps/             # accounts, organizations, tasks
│   ├── requirements.txt
│   └── .env.example
├── frontend/             # React + Vite (çalışan prototip)
│   ├── src/
│   │   ├── components/   # Sidebar, Header, KanbanColumn, TaskCard, TaskDrawer, StatCard
│   │   ├── pages/        # Dashboard, Calendar, Projects, Announcements
│   │   ├── data/         # mockTasks.ts — API bağlanana kadar fixture
│   │   └── types/        # task.ts — API sözleşmesinin TypeScript karşılığı
│   └── package.json
├── docs/                 # API sözleşmesi ve teknik notlar
├── .github/workflows/    # ci.yml (test + lint)
├── docker-compose.yml    # lokal Postgres 16
├── render.yaml           # Render servis tanımı
├── PLAN.md
└── README.md             # bu dosya — tüm kararlar burada
```

`backend/`, `docs/`, `docker-compose.yml` ve `render.yaml` PLAN.md'deki adımlarda eklenecek.

---

## Mimari

```
  Tarayıcı ──► Render Static Site (React SPA)
                     │  HTTPS + Authorization: Bearer <access token>
                     ▼
               Render Web Service (Django + gunicorn, free, uyur)
                     │  Supavisor session pooler · IPv4 · :5432
                     ▼
               Supabase Postgres (free, Frankfurt)

  UptimeRobot ──5 dk──► /api/v1/health/   (Render uyanık + Supabase aktif kalsın)
```

**Her iki servis de Frankfurt (eu-central) bölgesinde.** Farklı kıtaya düşerlerse her
sorgu okyanus aşar, panonun açılışı saniyelere çıkar. Bu bir tercih değil, zorunluluk.

---

## Kararlar

Bu bölüm projede alınmış tüm teknik kararların tek kaydıdır. Bir karar değişecekse
**önce burası güncellenir**, sonra kod yazılır.

### Altyapı

| # | Karar | Gerekçe |
|---|---|---|
| 1 | Supabase **yalnızca yönetilen Postgres** olarak kullanılır | Supabase Auth, RLS ve Storage kullanılmıyor. Tek kimlik sistemi, çalışan Django admin, öğrenilecek tek yeni konu |
| 2 | Kimlik doğrulama Django + `djangorestframework-simplejwt` | access 15 dk, refresh 7 gün. Otomatik sessiz token yenileme (401 interceptor) ve e-posta/kullanıcı adı ile giriş desteklenir |
| 3 | Bölge: **Frankfurt (eu-central)** — hem Supabase hem Render | Gecikme |
| 4 | Bağlantı: **Supavisor session pooler**, port **5432** | Render ücretsiz servisleri IPv6 giden bağlantı desteklemiyor; Supabase'in `db.<ref>.supabase.co` direct adresi yalnızca IPv6. Doğrudan bağlantı **çalışmaz** |
| 5 | Transaction pooler (`:6543`) kullanılmıyor | Prepared statement / server-side cursor sorunları çıkarır, `DISABLE_SERVER_SIDE_CURSORS` gibi ek ayar gerektirir. Eşzamanlılığımız düşük (2 worker), gerek yok. Bağlantı sayısı yetmezse buraya geçilir |
| 6 | DB sürücüsü: **`psycopg[binary]` (psycopg3)** | Django 5'in önerdiği sürücü. Planın ilk sürümündeki `psycopg2-binary` yerine |
| 7 | Uyanık tutma: **UptimeRobot**, 5 dakikada bir `/api/v1/health/` | Render 15 dk'da uyur (~50 sn soğuk açılış), Supabase 7 gün hareketsizlikte duraklar. Tek ping ikisini de çözer — health endpoint'i DB'ye gerçek sorgu atar |
| 8 | GitHub Actions cron ile ping **yapılmıyor** | 10 dk'lık cron = ayda ~4.320 çalışma; her çalışma en az 1 dakikaya yuvarlanır ve özel repolarda ücretsiz kota 2.000 dk/ay. Ay ortasında durur |
| 9 | Yalnızca backend uyanık tutulur | Render ücretsiz plan 750 instance-saat/ay verir; sürekli uyanık tek servis ≈ 730 saat |
| 10 | Sağlık endpoint'i tek yol: **`/api/v1/health/`** | Planın önceki sürümünde iki farklı yol geçiyordu; ping yanlış yola vurursa 404 alır ve kimse fark etmez |
| 11 | Migration'lar **start komutunda** çalışır | Render ücretsiz planda pre-deploy komutu yok: `python manage.py migrate --noinput && gunicorn config.wsgi --workers 2 --threads 2 --timeout 60`. **Bilinen bedeli:** başarısız bir migration servisi hiç ayağa kaldırmaz |
| 12 | Statik dosyalar **WhiteNoise** ile | Render ücretsiz planda kalıcı disk yok. Django admin'in CSS'i buna bağlı |
| 13 | Dosya yükleme MVP'de **yok** | Kalıcı disk olmadığı için yüklenen dosyalar her deploy'da silinir. Faz 2'de Cloudflare R2 |

### Django ayarları

| # | Karar | Gerekçe |
|---|---|---|
| 14 | **Tek `settings.py`**, farklar ortam değişkeninden | base/dev/prod ayrımı yerine. "Bu ayar hangi dosyada?" karmaşası olmuyor; lokalde çalışıp canlıda patlayan ayar farkları bu yapıda daha az |
| 15 | `dj-database-url` + `conn_max_age=60`, `ssl_require=True` | Her istekte yeni bağlantı açılmasın |
| 16 | **`CONN_HEALTH_CHECKS = True`** | `conn_max_age` ile kalıcı bağlantı tutulurken pooler boştaki bağlantıyı düşürebilir; bu ayar olmadan Django ölü bağlantıyı yeniden kullanıp hata verir |
| 17 | `SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")` | Render TLS'i proxy'de sonlandırır; bu olmadan Django isteği HTTP sanır ve yönlendirme döngüsüne girer |
| 18 | `CSRF_TRUSTED_ORIGINS` canlı domaini içerir | **Bu olmadan Django admin'e giriş yapılamaz.** MVP'de veri girişinin tek yolu admin olduğu için kritik |
| 19 | `CORS_ALLOWED_ORIGINS` tam domain listesi — **yıldız yok** | |
| 20 | Prod: `DEBUG=False`, `SECRET_KEY` env'den, `ALLOWED_HOSTS` açık liste, `SECURE_SSL_REDIRECT=True` | |
| 21 | gunicorn: **2 worker × 2 thread**, timeout 60 | 512 MB RAM sınırı |
| 22 | API dokümanı: `drf-spectacular` → `/api/schema/` | Frontend tipleri buradan üretilir |

### Veri modeli ve API

| # | Karar | Gerekçe |
|---|---|---|
| 23 | Bir göreve **birden çok kişi** atanabilir | Prototipteki TaskCard zaten birden çok avatar gösteriyor. Tek kişiye inmek çalışan arayüzü bozardı |
| 24 | **`Project` modeli var** (organizasyona bağlı, görevde boş bırakılabilir) | Prototipte proje etiketi ve Projeler sayfası mevcut. Serbest metin yerine gerçek tablo: yazım hatası ayrı proje sayılmaz, filtreleme güvenilir olur |
| 25 | `Task.start_date` eklenir (boş bırakılabilir) | Prototipteki `startDate` ve Takvim sayfası buna dayanıyor |
| 26 | Durum kodları: **`todo` / `in_progress` / `review` / `done`** | DB'de İngilizce, arayüzde Türkçe. Prototipteki `progress`, `in_progress` olarak güncellenecek |
| 27 | **Yetki:** organizasyon üyesi herkes her görevi oluşturur/düzenler/siler | En basit kural, MVP için yeterli. `Membership.role` (captain/lead/member) alanı durur, Faz 2'de kullanılır |
| 28 | Organizasyon filtresi **asla istemciden gelen parametreye dayanmaz** | Kullanıcının üyeliğinden çözülür, `organization` alanı serializer'da read-only. Testi yazılacak: başka takımın görev id'siyle erişim → 404 |
| 29 | Kimlik doğrulama **yalnızca `Authorization: Bearer`** — session cookie yok | Faz 2'de mobil aynı API'yi değiştirmeden kullanabilsin |
| 30 | **Kayıt ekranı yok** — kullanıcıları kaptan Django admin'den ekler | Şifreler elden iletilir; e-posta gönderimi kurulmuyor |
| 31 | `order` alanı **float**; yeni konum iki komşunun ortası | Sürükle-bırakta tek satır güncellenir |
| 32 | "Gecikti" bir durum değil, **türetilmiş bilgi**: `due_date < bugün and status != 'done'` | DB'ye yazılmaz |
| 33 | Çıkış (logout) **istemci tarafında** token silmekle olur | JWT blacklist kurulmuyor. "Çıkış yaptım" ≠ "token anında geçersiz" |
| 34 | API tabanı **`/api/v1/`** | Sürümlü; kırıcı değişiklik gerekirse `/v2/` |

### Frontend

| # | Karar | Gerekçe |
|---|---|---|
| 35 | **Tailwind kullanılmıyor** — düz CSS'te kalınır | Prototip bileşen başına `.css` dosyasıyla yazılmış ve çalışıyor. Tailwind'e geçmek MVP'ye hiçbir şey katmayan bir yeniden stillendirme olurdu |
| 36 | Renk/tipografi token'ları `src/index.css` içinde CSS değişkeni olarak | |
| 37 | **MSW kullanılmıyor** | Sözleşme dondurulduktan sonra mevcut `src/data/mockTasks.ts` fixture olarak yeter; TanStack Query önce buna, sonra gerçek endpoint'e bağlanır |
| 38 | Server state: TanStack Query · UI state: Zustand | |
| 39 | Sürükle-bırak: `@dnd-kit/core` | |
| 40 | **SPA yönlendirme:** Render Static Site'ta `/*` → `/index.html` rewrite kuralı | React Router client-side rota kullanıyor; bu kural olmadan `/dashboard` sayfası yenilendiğinde 404 gelir. **Bu frontend kodu değil, `render.yaml`'da tek satırlık deploy ayarıdır — sorumlusu deploy tarafı (Süleyman)** |
| 41 | Yükleniyor / boş / hata — üçünün de tasarımı olur | |

### Çalışma düzeni

| # | Karar | Gerekçe |
|---|---|---|
| 42 | Tek repo (monorepo): `backend/` + `frontend/` | |
| 43 | Branch: `main` (korumalı) ← `dev` (entegrasyon) ← `feat/…`, `fix/…` | `main`'e doğrudan push yok, her değişiklik PR + en az 1 onay |
| 44 | Lokal geliştirme **Docker Compose ile Postgres 16**'da, prod Supabase'te | Prod ile aynı motor; SQLite kullanılmaz |
| 45 | `.env` commit edilmez, `.env.example` edilir | Supabase DB şifresi ve `SECRET_KEY` yalnızca Render env panelinde |
| 46 | **Backend kapsamı kilitli**, frontend kapsamı açık | Frontend ekibi arayüz tarafında istediği sayfayı/özelliği ekleyebilir. Ancak **backend desteği gerektiren her ek Faz 2'dir** ve MVP bitmeden başlanmaz |
| 47 | Yedek: **haftalık `pg_dump`** | Supabase ücretsiz planda otomatik yedek garantisi yok. Yedek, geri yüklenene kadar yedek değildir — en az bir kez lokale geri yüklenerek denenir |

---

## Faz 2 (yarış sonrası — menüde "yakında")

Mobil uygulama (Expo) · dosya paylaşımı (Cloudflare R2) · zaman çizelgesi (Gantt) ·
bütçe/parça takibi · yorumlar · bildirimler · aktivite geçmişi · iş yükü görünümü ·
rol bazlı yetkilendirme.

> Faz 1 bitmeden Faz 2'den hiçbir şeye başlanmaz. Sunumda "6 menünün 2'si tam çalışıyor"
> demek, "6 menünün 6'sı yarım" demekten iyidir.

---

## Kurulum

### Frontend

```bash
cd frontend && npm install && npm run dev
```

### Backend

PLAN.md'deki 2. adımda eklenecek. Özet akış:

```bash
docker compose up -d
```

```bash
cd backend && pip install -r requirements.txt && python manage.py migrate && python manage.py runserver
```

- Doğrulama: `curl http://localhost:8000/api/v1/health/` → `200 {"status":"healthy","service":"pitwall-backend"}`
- Testler: `cd backend && python manage.py test`
- Örnek Veri Yükleme: `cd backend && python manage.py seed_data`

---

## Ortam değişkenleri

### backend/.env

| Değişken | Örnek / not |
|---|---|
| `SECRET_KEY` | Django gizli anahtarı. Prod'da yalnızca Render panelinde |
| `DEBUG` | Lokal `True`, prod `False` |
| `DATABASE_URL` | Lokal: `postgres://pitwall:pitwall@localhost:5432/pitwall` · Prod: Supabase **Session pooler** adresi (`...pooler.supabase.com:5432`) |
| `ALLOWED_HOSTS` | Virgülle ayrık. Prod: Render servis domaini |
| `CORS_ALLOWED_ORIGINS` | Frontend'in tam domaini. Yıldız yok |
| `CSRF_TRUSTED_ORIGINS` | Backend'in tam domaini (`https://` dahil). Admin girişi için zorunlu |

### frontend/.env

| Değişken | Not |
|---|---|
| `VITE_API_URL` | Lokal `http://localhost:8000/api/v1` · Prod: Render backend domaini |

> Supabase bağlantı adresini kopyalarken panelde **Connect → Session pooler** sekmesinde
> olduğunuzu doğrulayın. Yanlış sekmeden alınan adres "connection timeout" verir ve
> nedeni hiçbir yerde yazmaz.

---

## Yedekleme

```bash
pg_dump "$DATABASE_URL" -Fc -f pitwall-yedek.dump
```

Lokal `pg_dump` sürümü Supabase'in sunucu sürümünden **eski olmamalı**, yoksa dump reddedilir
(`pg_dump --version` ile kontrol edin).

---

## Ekip

| Kişi | Rol |
|---|---|
| Yasemin | Backend lead |
| Süleyman | Backend + Deploy |
| Lidya | Frontend lead |
| Rumeysa | Kaptan — frontend destek, QA, deploy |
| Tuncay | Mobil |