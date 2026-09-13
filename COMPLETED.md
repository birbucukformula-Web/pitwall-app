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

---

**Not:** Yukarıdaki tüm kod ve altyapı geliştirmeleri yerel ortamda başarıyla tamamlanmış ve çalışır hale getirilmiştir. Canlı ortamdaki (Render) test kullanıcılarının deneyebilmesi için kodların GitHub'a gönderilmesi (push) gerekmektedir.
