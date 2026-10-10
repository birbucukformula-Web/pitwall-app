# PitWall API Sözleşmesi

Taban URL: `/api/v1/`
Kimlik Doğrulama: `Authorization: Bearer <access>`

Bu belge, uygulamanın temel API uç noktalarını (endpoints) ve **Faz 2** kapsamında belirlenen rol tabanlı yetki matrisini listeler.

| Metot | Yol | Rol (Faz 2) | Açıklama |
|---|---|---|---|
| GET | `/health/` | Herkes | Sistem sağlık kontrolü → `200 {"status":"healthy","service":"pitwall-backend"}` |
| POST | `/auth/login/` | Herkes | `{username / email, password}` → `{access, refresh}` (kullanıcı adı veya e-posta ile giriş) |
| POST | `/auth/refresh/` | Herkes | `{refresh}` → `{access, refresh}` (SimpleJWT token rotation) |
| GET | `/auth/me/` | Tümü | Kullanıcı, organizasyon, rol, birim ve `accessible_unit_ids` bilgilerini döner |
| GET | `/units/` | Tümü | Birimler listesi |
| GET | `/projects/` | Tümü | Projeler listesi |
| GET | `/members/` | Tümü | Ekip üyeleri (atama seçicisi ve ayarlar bu endpoint'i okur) |
| POST | `/members/` | `captain` | Yeni üye ekleme (diğerlerine 403 döner) |
| GET | `/tasks/` | Tümü | Görev listesi: `?status=&unit=&project=&assignee=&overdue=true` |
| POST | `/tasks/` | `captain`, `lead` | Yeni görev oluşturma |
| PATCH | `/tasks/{id}/` | Tümü | Görev güncelleme & sürükle-bırak (Not: `member` sadece `status` ve `order` değiştirebilir) |
| DELETE| `/tasks/{id}/` | `captain`, `lead` | Görev silme |
| GET/POST | `/tasks/{id}/activities/` | Tümü | Görev aktiviteleri ve yorum işlemleri |
| GET | `/stats/summary/` | Tümü | Pano üstündeki 4 istatistik kartını tek çağrıda döner |

*Not: Detaylı JSON/OpenAPI şemasını incelemek veya istek simülasyonu yapmak için canlı ortamdaki `/api/docs/` (Swagger) sayfasını kullanabilirsiniz.*
