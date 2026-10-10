# PitWall — Faz 3 Planı (Taslak)

Bu dosya Faz 3 için biriken notları tutar.
Faz 2 tamamlanmadan Faz 3'e başlanmaz.

**Hedef:** Sistemi diğer departmanlara (Elektrik, Mekanik, Bando) açmak
ve her takımın kendi kaptanının bağımsız yönetim yapabilmesini sağlamak.

---

## Notlar

### Captain Yönetim Paneli (Uygulama İçi)

**Karar:** Admin paneli pasif hale gelecek. Captain rolündeki kullanıcılar
tüm organizasyon yönetimini doğrudan uygulama üzerinden yapabilecek.

**Gerekçe:** Sistem diğer takımlara/departmanlara açıldığında her takımın
kaptanının Django admin'e erişimi olamaz. Yönetim uygulama içinde olmalı.

**Kapsam:**
- [ ] Captain için `/settings/organization` sayfası: birim oluştur, düzenle, sil
- [ ] Captain için üye davet sistemi (e-posta ile davet linki)
- [ ] Captain için rol atama: üyenin rolünü (lead/member) uygulama içinden değiştir
- [ ] Captain için birim hiyerarşisi görsel editörü (sürükle-bırak ağaç)
- [ ] Admin paneli yalnızca superuser seviyesi işlemler için kalır
  (organizasyon oluşturma, sistem ayarları, vb.)

---

### Çok Departman / Çok Takım Desteği

**Karar:** Faz 2 sadece Yazılım Departmanı kapsamında.
Faz 3'te Elektrik, Mekanik, Bando departmanları da sisteme alınacak.

**Açık sorular:**
- Her departmanın kendi captain'ı mı olacak, yoksa tek org-wide captain mı devam edecek?
- Departmanlar arası görev atama/görünürlük nasıl çalışacak?
- Otonom birimi ne zaman açılacak? (Yazılım altında, parent=Yazılım)

---

### Üye Davet Sistemi

Şu an kullanıcılar yalnızca admin panelinden elle ekleniyor (Karar #30).
Faz 3'te captain uygulamadan e-posta ile davet gönderebilmeli.

- E-posta altyapısı kurulacak (SendGrid veya benzeri)
- Davet linki token bazlı, süreli olacak
- Davet kabul edilince kullanıcı otomatik oluşacak ve ilgili unit'e atanacak

---

### Gerçek Zamanlı Bildirim Sistemi

Şu an arayüzde statik (sahte) bildirim verileri kullanılıyor. Faz 3 kapsamında bu sistem gerçeğe dönüştürülecek.

- [ ] Backend'de `Notification` modeli kurulacak.
- [ ] Görev atamalarında, durum değişikliklerinde ve yorumlarda sinyal (Django signals) yakalanıp bildirim oluşturulacak.
- [ ] Kullanıcı için `/notifications/` GET ve PUT (okundu işaretleme) endpoint'leri yazılacak.
- [ ] (Opsiyonel) WebSocket entegrasyonu ile sayfa yenilenmeden bildirim düşmesi sağlanacak.
- [ ] Frontend'deki `NotificationContext.tsx` gerçek API ile bağlanacak.

---

## Bağlam

- Faz 1 kararları: `README.md → Kararlar`
- Faz 2 planı: `PLAN-FAZ2.md`
- Faz 3/4 orijinal notu: `README.md → Faz 2 Kararları → İleriki Fazlar`
