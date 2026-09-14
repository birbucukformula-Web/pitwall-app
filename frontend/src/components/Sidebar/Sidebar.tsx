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

import formulaLogo from "../../assets/logo-yazisiz.jpg";

import "./Sidebar.css";

const AVATARS: Record<string, string> = {
  red: "/avatars/avatar_red.png",
  blue: "/avatars/avatar_blue.png",
  black: "/avatars/avatar_black.png",
  frog: "/avatars/avatar_frog.png",
  pink: "/avatars/avatar_pink.png",
  purple: "/avatars/avatar_purple.png",
  yellow: "/avatars/avatar_yellow.png",
  orange: "/avatars/avatar_orange.png",
  white: "/avatars/avatar_white.png",
};

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

  const roleName =
    user?.organization?.name || "Takım Üyesi";

  const fullName = user
    ? `${user.first_name} ${user.last_name}`
    : "Bilinmeyen Kullanıcı";

  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
    : "?";

  const selectedAvatarId =
    localStorage.getItem("pitwall_avatar") ?? "";

  const avatarSrc =
    AVATARS[selectedAvatarId] ?? null;

  function handleNavigation() {
    setShowProfileMenu(false);
    onClose();
  }

  function handleProfileNavigation(path: string) {
    setShowProfileMenu(false);
    onClose();
    navigate(path);
  }

  function handleLogout() {
    setShowProfileMenu(false);
    onClose();
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
          <NavLink
            to="/dashboard"
            className="outer-brand"
            aria-label="Ana Sayfa"
            onClick={handleNavigation}
          >
            <img src={formulaLogo} alt="Pitwall" />
          </NavLink>

          <nav className="outer-nav">
            <NavLink
              to="/dashboard"
              onClick={handleNavigation}
              className={({ isActive }) =>
                `outer-nav-item ${
                  isActive ? "active" : ""
                }`
              }
              title="Görev Panosu"
            >
              <LayoutDashboard size={22} />
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
              title="Takvim"
            >
              <CalendarDays size={22} />
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
              title="Projeler"
            >
              <FolderKanban size={22} />
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
              title="Duyurular"
            >
              <Megaphone size={22} />
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
              title="Profil"
            >
              <UserRound size={22} />
              <span>Profil</span>
            </NavLink>
          </nav>
        </div>

        <div className="outer-bottom">
          <div className="profile-wrapper">
            {showProfileMenu && (
              <div className="profile-menu profile-menu-outer">
                <div className="profile-menu-user">
                  <div className="profile-menu-avatar">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="avatar"
                      />
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
                    handleProfileNavigation(
                      "/profile",
                    )
                  }
                >
                  <UserRound size={16} />
                  Profilim
                </button>

                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() =>
                    handleProfileNavigation(
                      "/settings",
                    )
                  }
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
              className="outer-profile-btn"
              onClick={() =>
                setShowProfileMenu(
                  (prev) => !prev,
                )
              }
            >
              <div className="outer-avatar">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                  />
                ) : (
                  initials
                )}
              </div>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}