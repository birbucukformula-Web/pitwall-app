import { useState } from "react";

import {
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MoreHorizontal,
  Settings,
  UserRound,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import formulaLogo from "../../assets/formula-logo.png";

import "./Sidebar.css";

export default function Sidebar() {
  const [
    showProfileMenu,
    setShowProfileMenu,
  ] = useState(false);

  const navigate = useNavigate();

  function handleLogout() {
    setShowProfileMenu(false);
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <NavLink
        to="/dashboard"
        className="brand"
        aria-label="Görev Panosu'na dön"
      >
        <img
          src={formulaLogo}
          alt="1.5 Adana Formula Student"
          className="brand-logo"
        />

        <div className="brand-text">
          <strong>1.5 ADANA</strong>
          <span>FORMULA STUDENT</span>
        </div>
      </NavLink>

      <nav className="navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>Görev Panosu</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <CalendarDays size={20} />
          <span>Takvim</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <FolderKanban size={20} />
          <span>Projeler</span>
        </NavLink>

        <NavLink
          to="/announcements"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <Megaphone size={20} />
          <span>Duyurular</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="race-card">
          <span>
            FORMULA STUDENT
          </span>

          <strong>
            46 GÜN
          </strong>

          <p>
            Yarışa kalan süre
          </p>

          <div className="race-progress">
            <div className="race-progress-value" />
          </div>
        </div>

        <div className="profile-wrapper">
          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-menu-user">
                <div className="profile-menu-avatar">
                  LS
                </div>

                <div className="profile-menu-user-info">
                  <strong>
                    Lidya Su
                  </strong>

                  <span>
                    Frontend Developer
                  </span>
                </div>
              </div>

              <div className="profile-menu-divider" />

              <button
                type="button"
                className="profile-menu-item"
              >
                <UserRound size={16} />
                Profilim
              </button>

              <button
                type="button"
                className="profile-menu-item"
              >
                <Settings size={16} />
                Ayarlar
              </button>

              <div className="profile-menu-divider" />

              <button
                type="button"
                className="profile-menu-item logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Çıkış Yap
              </button>
            </div>
          )}

          <button
            type="button"
            className="profile-button"
            onClick={() =>
              setShowProfileMenu(
                (previous) => !previous,
              )
            }
          >
            <div className="profile-avatar">
              LS
            </div>

            <div className="profile-info">
              <strong>
                Lidya Su
              </strong>

              <span>
                Frontend Developer
              </span>
            </div>

            <MoreHorizontal
              className="profile-more"
              size={18}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}