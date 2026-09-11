import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../api/auth";

import {
  Bell,
  Moon,
  Sun,
  UserRound,
  Users,
} from "lucide-react";

import { metadataApi } from "../../api/metadata";

import "./Settings.css";

type Theme = "light" | "dark";

export default function Settings() {
  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => metadataApi.getMembers(),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: () => metadataApi.getUnits(),
  });

  const [theme, setTheme] =
    useState<Theme>(() => {
      const savedTheme =
        localStorage.getItem(
          "pitwall-theme",
        );

      return savedTheme === "dark"
        ? "dark"
        : "light";
    });

  const [
    taskNotifications,
    setTaskNotifications,
  ] = useState(true);

  const [
    announcementNotifications,
    setAnnouncementNotifications,
  ] = useState(true);

  const [
    deadlineNotifications,
    setDeadlineNotifications,
  ] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme,
    );

    localStorage.setItem(
      "pitwall-theme",
      theme,
    );
  }, [theme]);

  return (
    <section className="settings-page">
      <div className="settings-header">
        <span className="settings-label">
          HESAP
        </span>

        <h2>Ayarlar</h2>

        <p>
          Uygulama görünümünü ve bildirim
          tercihlerini buradan yönetebilirsin.
        </p>
      </div>

      <div className="settings-layout">
        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">
              <Sun size={20} />
            </div>

            <div>
              <h3>Görünüm</h3>

              <p>
                Pitwall temasını kişisel
                tercihine göre ayarla.
              </p>
            </div>
          </div>

          <div className="theme-options">
            <button
              type="button"
              className={`theme-option ${
                theme === "light"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setTheme("light")
              }
            >
              <div className="theme-option-icon">
                <Sun size={22} />
              </div>

              <div>
                <strong>Açık Tema</strong>
                <span>
                  Daha aydınlık arayüz
                </span>
              </div>
            </button>

            <button
              type="button"
              className={`theme-option ${
                theme === "dark"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setTheme("dark")
              }
            >
              <div className="theme-option-icon">
                <Moon size={22} />
              </div>

              <div>
                <strong>Koyu Tema</strong>
                <span>
                  Düşük ışık için koyu görünüm
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">
              <Bell size={20} />
            </div>

            <div>
              <h3>Bildirimler</h3>

              <p>
                Hangi gelişmeler için bildirim
                almak istediğini seç.
              </p>
            </div>
          </div>

          <div className="settings-list">
            <label className="settings-row">
              <div>
                <strong>
                  Görev bildirimleri
                </strong>

                <span>
                  Yeni görev atandığında veya
                  görevinde değişiklik olduğunda.
                </span>
              </div>

              <input
                type="checkbox"
                checked={taskNotifications}
                onChange={(event) =>
                  setTaskNotifications(
                    event.target.checked,
                  )
                }
              />
            </label>

            <label className="settings-row">
              <div>
                <strong>
                  Duyuru bildirimleri
                </strong>

                <span>
                  Takım tarafından yeni bir
                  duyuru yayınlandığında.
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  announcementNotifications
                }
                onChange={(event) =>
                  setAnnouncementNotifications(
                    event.target.checked,
                  )
                }
              />
            </label>

            <label className="settings-row">
              <div>
                <strong>
                  Teslim tarihi uyarıları
                </strong>

                <span>
                  Görev teslim tarihi
                  yaklaştığında.
                </span>
              </div>

              <input
                type="checkbox"
                checked={
                  deadlineNotifications
                }
                onChange={(event) =>
                  setDeadlineNotifications(
                    event.target.checked,
                  )
                }
              />
            </label>
          </div>
        </div>

        <div className="settings-card account-settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">
              <UserRound size={20} />
            </div>

            <div>
              <h3>Hesap</h3>

              <p>
                Hesabına ait temel bilgiler.
              </p>
            </div>
          </div>

          <div className="settings-account-info">
            <div>
              <span>Ad Soyad</span>
              <strong>
                {currentUser
                  ? `${currentUser.first_name} ${currentUser.last_name}`.trim() || currentUser.email
                  : "—"}
              </strong>
            </div>

            <div>
              <span>Departman</span>
              <strong>
                {currentUser?.organization?.name ?? "Belirtilmemiş"}
              </strong>
            </div>

            <div>
              <span>E-posta</span>
              <strong>
                {currentUser?.email ?? "—"}
              </strong>
            </div>
          </div>
        </div>

        <div className="settings-card team-settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">
              <Users size={20} />
            </div>

            <div>
              <h3>{currentUser?.organization?.name || "Takım"} Üyeleri</h3>
              <p>Organizasyonundaki yöneticiler, üyeler ve alt birimler.</p>
            </div>
          </div>

          <div className="team-section">
            <div className="team-section-title">
              Yöneticiler ({members.filter(m => m.role === 'captain' || m.role === 'lead').length})
            </div>
            <div className="team-members-grid">
              {members.filter(m => m.role === 'captain' || m.role === 'lead').map(m => (
                <div key={m.id} className="team-member-card">
                  <div className="team-member-avatar">
                    {m.first_name ? `${m.first_name[0]}${m.last_name[0]}`.toUpperCase() : m.email[0].toUpperCase()}
                  </div>
                  <div className="team-member-info">
                    <span className="team-member-name">{m.first_name ? `${m.first_name} ${m.last_name}` : m.email}</span>
                    <span className="team-member-role">{m.role === 'captain' ? 'Kaptan' : 'Yönetici'}</span>
                  </div>
                </div>
              ))}
              {members.filter(m => m.role === 'captain' || m.role === 'lead').length === 0 && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Yönetici bulunmuyor.</div>
              )}
            </div>
          </div>

          <div className="team-section">
            <div className="team-section-title">
              Üyeler ({members.filter(m => m.role === 'member').length})
            </div>
            <div className="team-members-grid">
              {members.filter(m => m.role === 'member').map(m => (
                <div key={m.id} className="team-member-card">
                  <div className="team-member-avatar">
                    {m.first_name ? `${m.first_name[0]}${m.last_name[0]}`.toUpperCase() : m.email[0].toUpperCase()}
                  </div>
                  <div className="team-member-info">
                    <span className="team-member-name">{m.first_name ? `${m.first_name} ${m.last_name}` : m.email}</span>
                    <span className="team-member-role">Üye</span>
                  </div>
                </div>
              ))}
              {members.filter(m => m.role === 'member').length === 0 && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Üye bulunmuyor.</div>
              )}
            </div>
          </div>

          <div className="team-section">
            <div className="team-section-title">
              Takımlar ve Projeler ({units.length})
            </div>
            <div className="team-projects-list">
              {units.map(unit => (
                <div key={unit.id} className="team-project-row">
                  <div className="team-project-name">
                    <span className="team-project-badge">Birim</span>
                    {unit.name}
                  </div>
                </div>
              ))}
              {units.length === 0 && (
                <div className="team-project-row" style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  Henüz bir alt birim bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}