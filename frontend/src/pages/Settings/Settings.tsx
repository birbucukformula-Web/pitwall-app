import { useEffect, useState } from "react";

import {
  Bell,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";

import "./Settings.css";

type Theme = "light" | "dark";

export default function Settings() {
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
              <strong>Lidya Su</strong>
            </div>

            <div>
              <span>Departman</span>
              <strong>
                Web &amp; Yazılım
              </strong>
            </div>

            <div>
              <span>E-posta</span>
              <strong>
                lidya@1bucukadana.com
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}