import { useState } from "react";

import {
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  UserRound,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { useAvatar } from "../../contexts/AvatarContext";
import { presenceApi } from "../../api/presence";
import ActiveUsersWidget from "../ActiveUsersWidget/ActiveUsersWidget";

import formulaLogo from "../../assets/logo-yazisiz0.png";

import "./Sidebar.css";


type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedAvatar } = useAvatar();

  const roleName =
    user?.organization?.name || "Takım Üyesi";

  const fullName = user
    ? `${user.first_name} ${user.last_name}`
    : "Bilinmeyen Kullanıcı";

  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
    : "?";

  const avatarSrc =
    selectedAvatar?.src ?? null;

  function handleNavigation() {
    setShowProfileMenu(false);
    onClose();
  }

  function handleProfileNavigation(path: string) {
    setShowProfileMenu(false);
    onClose();
    navigate(path);
  }

  async function handleLogout() {
    setShowProfileMenu(false);
    onClose();

    await presenceApi.leave();

    logout();
    navigate("/login");
  }

  return (
    <div
      className={`sidebar-container ${
        isOpen ? "sidebar-open" : ""
      }`}
    >
      <aside className="outer-sidebar">
        <div className="outer-top">
          <div
            className="outer-brand"
            aria-label="Pitwall"
          >
            <div className="outer-brand-glow" />

            <img
              src={formulaLogo}
              alt="Pitwall"
            />
          </div>

          <nav className="outer-nav">
            <NavLink
              to="/dashboard"
              onClick={handleNavigation}
              className={({ isActive }) =>
                `outer-nav-item ${
                  isActive ? "active" : ""
                }`
              }
              aria-label="Görev Panosu"
            >
              <div className="outer-nav-icon">
                <LayoutDashboard size={21} />
              </div>
              <span>Pano</span>
            </NavLink>

            <NavLink
              to="/calendar"
              onClick={handleNavigation}
              className={({ isActive }) =>
                `outer-nav-item ${
                  isActive ? "active" : ""
                }`
              }
              aria-label="Takvim"
            >
              <div className="outer-nav-icon">
                <CalendarDays size={21} />
              </div>
              <span>Takvim</span>
            </NavLink>

            <NavLink
              to="/projects"
              onClick={handleNavigation}
              className={({ isActive }) =>
                `outer-nav-item ${
                  isActive ? "active" : ""
                }`
              }
              aria-label="Projeler"
            >
              <div className="outer-nav-icon">
                <FolderKanban size={21} />
              </div>
              <span>Projeler</span>
            </NavLink>

            <NavLink
              to="/announcements"
              onClick={handleNavigation}
              className={({ isActive }) =>
                `outer-nav-item ${
                  isActive ? "active" : ""
                }`
              }
              aria-label="Duyurular"
            >
              <div className="outer-nav-icon">
                <Megaphone size={21} />
              </div>
              <span>Duyuru</span>
            </NavLink>

            <NavLink
              to="/profile"
              onClick={handleNavigation}
              className={({ isActive }) =>
                `outer-nav-item ${
                  isActive ? "active" : ""
                }`
              }
              aria-label="Profil"
            >
              <div className="outer-nav-icon">
                <UserRound size={21} />
              </div>
              <span>Profil</span>
            </NavLink>
          </nav>
        </div>

        <div className="outer-bottom">
          <div className="outer-presence">
            <ActiveUsersWidget />
          </div>

          <div className="profile-wrapper">
            {showProfileMenu && (
              <div className="profile-menu profile-menu-outer">
                <div className="profile-menu-user">
                  <div className="profile-menu-avatar">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="avatar" />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="profile-menu-user-info">
                    <strong>{fullName}</strong>
                    <span>{roleName}</span>
                  </div>
                </div>

                <div className="profile-menu-divider" />

                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() =>
                    handleProfileNavigation("/profile")
                  }
                >
                  <UserRound size={17} />
                  Profilim
                </button>

                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() =>
                    handleProfileNavigation("/settings")
                  }
                >
                  <Settings size={17} />
                  Ayarlar
                </button>

                <div className="profile-menu-divider" />

                <button
                  type="button"
                  className="profile-menu-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Çıkış Yap
                </button>
              </div>
            )}

            <button
              type="button"
              className="outer-profile-btn"
              onClick={() =>
                setShowProfileMenu(
                  (previous) => !previous,
                )
              }
              aria-label="Profil menüsü"
              aria-expanded={showProfileMenu}
            >
              <div className="outer-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" />
                ) : (
                  initials
                )}
              </div>

              <span className="outer-avatar-status" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
