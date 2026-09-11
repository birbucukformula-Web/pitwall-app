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

---

**Not:** Yukarıdaki tüm kod ve altyapı geliştirmeleri yerel ortamda başarıyla tamamlanmış ve çalışır hale getirilmiştir. Canlı ortamdaki (Render) test kullanıcılarının deneyebilmesi için kodların GitHub'a gönderilmesi (push) gerekmektedir.
