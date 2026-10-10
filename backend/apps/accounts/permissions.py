"""
Faz 2 — Yetki Katmanı
=====================
Görünürlük kuralı (captain / lead / member):
  captain → tüm organizasyon
  lead    → kendi yolu: ancestors + kendi birimi + subtree
  member  → aynı yol ama sadece yorum; görev oluşturamaz/düzenleyemez/silemez

Yardımcı fonksiyonlar `Unit.get_visible_unit_ids()` ve
`Unit.get_descendant_ids()` metodlarına dayanır.
"""

from rest_framework.permissions import BasePermission


def get_visible_unit_ids(user):
    """
    Kullanıcının görebileceği Unit id listesini döner.
    captain  → None  (filtre yok, tüm org görünür)
    lead/member → unit.get_visible_unit_ids() (ancestors + subtree)
    """
    if user.role == 'captain':
        return None  # None = filtre uygulama

    if user.unit is None:
        return []

    return user.unit.get_visible_unit_ids()


def get_write_unit_ids(user):
    """
    Kullanıcının görev oluşturabileceği / düzenleyebileceği / silebileceği
    Unit id listesini döner.
    captain  → None  (filtre yok)
    lead     → unit.get_visible_unit_ids() (ancestors + subtree — aynı görünürlük)
    member   → []    (yazma izni yok)
    """
    if user.role == 'captain':
        return None

    if user.role == 'member':
        return []

    # lead
    if user.unit is None:
        return []

    return user.unit.get_visible_unit_ids()


def user_can_write_task(user, task):
    """
    Verilen görevi bu kullanıcının yazıp yazamayacağını döner.
    Görevin unit'i yoksa (unit=None) sadece captain yazabilir.
    """
    write_ids = get_write_unit_ids(user)

    if write_ids is None:
        return True  # captain

    if not write_ids:
        return False  # member

    if task.unit_id is None:
        return False  # unit'siz göreve lead de yazamaz

    return task.unit_id in write_ids


# ── DRF Permission Sınıfları ──────────────────────────────────────────────────

class IsAuthenticatedOrgMember(BasePermission):
    """
    Giriş yapmış ve bir organizasyona bağlı kullanıcıları kabul eder.
    Temel guard — tüm view'larda kullanılabilir.
    """
    message = "Bu işlem için bir organizasyona bağlı olmanız gerekiyor."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'organization')
            and request.user.organization is not None
        )


class IsCaptain(BasePermission):
    """Yalnızca captain rolündeki kullanıcılara izin verir."""
    message = "Bu işlem için captain yetkisi gerekiyor."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'captain'
        )


class IsLeadOrCaptain(BasePermission):
    """lead veya captain rolündeki kullanıcılara izin verir."""
    message = "Bu işlem için en az lead yetkisi gerekiyor."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) in ('captain', 'lead')
        )
