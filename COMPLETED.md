# Pitwall - Tamamlanan Geliştirmeler

Bu dosya, projede baştan sona tamamladığımız altyapı ve arayüz geliştirmelerini kayıt altında tutmak için oluşturulmuştur.

## 1. Yan Panel (Sidebar) Yenilemesi
Uygulamanın navigasyon menüsü baştan aşağı yenilendi ve iki kolonlu modern bir yapıya geçirildi.
- **Dış Panel (Outer Sidebar):** Pano, Takvim, Projeler gibi ana sayfalara hızlı erişim için sol tarafa ince bir ikon menüsü eklendi.
- **İç Panel (Inner Sidebar):** Takımların ve alt birimlerin listelendiği açılır/kapanır iç menü tasarlandı.
- **Accordion Yapısı:** Ana birimlerin (Örn: Yazılım) yanına eklenen ok (Chevron) ikonları ile alt birimlerin (Web, Oyun vb.) ağaç (tree) formatında gösterilip gizlenmesi sağlandı.
- **Görünürlük:** Takvim, Duyurular ve Profil sayfalarına geçildiğinde iç panel otomatik kapanarak çalışma alanını genişletiyor.

## 2. Pano (Dashboard) Filtreleme Entegrasyonu
Sol menüden herhangi bir alt birime tıklandığında panonun sadece o birimin görevlerini göstermesi sağlandı.
- **Frontend URL State:** Dashboard bileşeni `useSearchParams` hook'u ile güncellendi. Artık URL'deki `?unit=ID` parametresini dinliyor.
- **Veri Çekme:** Sol menüden takıma tıklanınca URL parametresi güncelleniyor, pano API'ye sadece o takımın görevlerini getirmesi için filtreli istek atıyor.

## 3. Backend Hata Düzeltmeleri ve API Uyumlaştırması
Frontend ve backend arasındaki sözleşme uyuşmazlıkları ve kritik API hataları giderildi:
- **`/members/` Endpoint Rotası Eklendi:** Frontend'in `metadataApi.getMembers()` çağrısının 404 alması engellendi; `config/urls.py` altına `path('api/v1/members/', MemberListView.as_view(), name='members')` eklenerek Görev Modalı atama seçicisi ve Ayarlar sayfasındaki üye listesi çalışır hale getirildi.
- **`UserSerializer`'a `username` Dahil Edildi:** `/auth/me/` ve `/members/` yanıtlarında eksik olan `username` alanı serializer'a eklendi, arayüzdeki olası JavaScript çökmeleri önlendi.
- **Örnek Veri (Seed Data) Öncelik Düzeltmesi:** `seed_data.py` içerisindeki büyük harfli `"HIGH"` ve `"MEDIUM"` değerleri model ve arayüz tipleriyle tam uyumlu olarak `Task.Priority.HIGH` ve `Task.Priority.MEDIUM` (`"high"`, `"medium"`) standartlarına çekildi.
- **Proje ve Birim Serializer İyileştirmesi:** `ProjectSerializer` ve `UnitSerializer` modellerinde `organization` alanı `read_only_fields` yapılarak frontend'den proje/birim oluşturulurken gereksiz zorunluluk (400 Bad Request) hatası alması engellendi.
- **Otomatik Test Kapsamı:** `apps.accounts` ve `apps.tasks` için JWT login, members endpoint'i, kullanıcı bilgileri, görev oluşturma, öncelik ve özet istatistik testleri yazılarak tüm akış doğrulandı (6 testin tamamı başarılı).

## 4. Takvim, Projeler ve Proje Detay Sayfalarının Backend API Entegrasyonu
Arayüzde daha önce sahte/sabit verilerle (mock data) çalışan sayfalar, tasarım ve stillerine sadık kalınarak backend API'sine bağlandı:
- **Takvim Sayfası (Calendar):**
  - `mockTasks` kullanımı kaldırıldı; `@tanstack/react-query` kullanılarak `tasksApi.getTasks()` üzerinden backend verisi bağlandı.
  - Görev oluşturma (`createTaskMutation`), güncelleme (`updateTaskMutation`) ve silme (`deleteTaskMutation`) mutasyonları entegre edildi.
  - Takvimden eklenen yeni görevler doğrudan `POST /api/v1/tasks/` ile veritabanına kaydedilir hale getirildi. Kayıt sonrası `tasks` ve `stats` query cache'i otomatik güncellenerek tüm sayfalarda (Pano, Takvim vb.) anında yansıması sağlandı.
- **Projeler Sayfası (Projects):**
  - Sabit kodlanmış proje listesi yerine `metadataApi.getProjects()` ve `tasksApi.getTasks()` bağlandı.
  - Projelerin toplam görev sayısı, tamamlanan görev sayısı ve ilerleme yüzdesi backend'deki gerçek görevlere göre dinamik olarak hesaplandı.
- **Proje Detay Sayfası (ProjectDetail):**
  - Statik `projectMap` sözlüğü kaldırılarak backend'deki dinamik projeler ve `tasksApi.getTasks({ project: projectId })` filtresi bağlandı.
  - Kanban panosundaki sürükle-bırak (Drag & Drop) hareketi tamamlandığında (`handleDragEnd`), görevin yeni durumu (`status`) ve sırası (`order`) backend'e `PATCH` edilerek kalıcı hale getirildi.
  - Görev ekleme, düzenleme ve silme modalları backend API mutasyonlarıyla senkronize edildi.
  - Proje üyeleri ve avatar baş harfleri göreve atanan gerçek kullanıcılardan dinamik olarak türetildi.
- **Üst Menü Arama (Header):**
  - Header arama çubuğu `tasksApi.getTasks()` üzerinden gerçek görev verisiyle beslendi. Kullanıcı başlık, proje veya birim aradığında gerçek veritabanı kayıtları listeleniyor.
- **Bileşen & Stil Bütünlüğü:**
  - Takım arkadaşlarının yazdığı hiçbir CSS dosyasına (`Calendar.css`, `Projects.css`, `ProjectDetail.css`, `Header.css`) veya görsel DOM hiyerarşisine dokunulmadan, yalnızca veri ve mutasyon katmanı bağlandı.

---

**Not:** Yukarıdaki tüm kod ve altyapı geliştirmeleri yerel ortamda başarıyla tamamlanmış ve çalışır hale getirilmiştir. Canlı ortamdaki (Render) test kullanıcılarının deneyebilmesi için kodların GitHub'a gönderilmesi (push) gerekmektedir.

