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
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import formulaLogo from "../../assets/formula-logo.png";

import "./Sidebar.css";

const AVATARS: Record<string, string> = {
  red:    "/avatars/avatar_red.png",
  blue:   "/avatars/avatar_blue.png",
  black:  "/avatars/avatar_black.png",
  frog:   "/avatars/avatar_frog.png",
  pink:   "/avatars/avatar_pink.png",
  purple: "/avatars/avatar_purple.png",
  yellow: "/avatars/avatar_yellow.png",
  orange: "/avatars/avatar_orange.png",
  white:  "/avatars/avatar_white.png",
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const [
    showProfileMenu,
    setShowProfileMenu,
  ] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // roleName için: EĞER birim bilgisi geliyorsa onu yaz
  const roleName = user?.organization?.name || "Takım Üyesi";
  const fullName = user ? `${user.first_name} ${user.last_name}` : "Bilinmeyen Kullanıcı";
  const initials = user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : "?";

  // Seçili avatar localStorage'dan oku
  const selectedAvatarId = localStorage.getItem("pitwall_avatar") ?? "";
  const avatarSrc = AVATARS[selectedAvatarId] ?? null;

  // Yarışa kalan günü hesapla
  let daysLeft = 0;
  if (user?.organization?.race_date) {
    const today = new Date();
    const raceDate = new Date(user.organization.race_date);
    const timeDiff = raceDate.getTime() - today.getTime();
    daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  const daysText = daysLeft > 0 ? `${daysLeft} GÜN` : (daysLeft === 0 ? "BUGÜN!" : "BİTTİ");

  function handleNavigation() {
    setShowProfileMenu(false);
    onClose();
  }

  function handleProfileNavigation(
    path: string,
  ) {
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
    <aside
      className={`sidebar ${
        isOpen
          ? "sidebar-open"
          : ""
      }`}
    >
      <div className="sidebar-brand-row">
        <NavLink
          to="/dashboard"
          className="brand"
          aria-label="Görev Panosu'na dön"
          onClick={handleNavigation}
        >
          <img
            src={formulaLogo}
            alt="1.5 Adana Formula Student"
            className="brand-logo"
          />

          <div className="brand-text">
            <strong>
              1.5 ADANA
            </strong>

            <span>
              FORMULA STUDENT
            </span>
          </div>
        </NavLink>

        <button
          type="button"
          className="sidebar-close-button"
          onClick={onClose}
          aria-label="Menüyü kapat"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="navigation">
        <NavLink
          to="/dashboard"
          onClick={handleNavigation}
          className={({ isActive }) =>
            `nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <LayoutDashboard size={20} />

          <span>
            Görev Panosu
          </span>
        </NavLink>

        <NavLink
          to="/calendar"
          onClick={handleNavigation}
          className={({ isActive }) =>
            `nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <CalendarDays size={20} />

          <span>
            Takvim
          </span>
        </NavLink>

        <NavLink
          to="/projects"
          onClick={handleNavigation}
          className={({ isActive }) =>
            `nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <FolderKanban size={20} />

          <span>
            Projeler
          </span>
        </NavLink>

        <NavLink
          to="/announcements"
          onClick={handleNavigation}
          className={({ isActive }) =>
            `nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <Megaphone size={20} />

          <span>
            Duyurular
          </span>
        </NavLink>

        <NavLink
          to="/profile"
          onClick={handleNavigation}
          className={({ isActive }) =>
            `nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <UserRound size={20} />

          <span>
            Profil
          </span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="race-card">
          <span>
            FORMULA STUDENT
          </span>

          <strong>
            {daysText}
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
                  {avatarSrc
                    ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    : initials}
                </div>

                <div className="profile-menu-user-info">
                  <strong>
                    {fullName}
                  </strong>

                  <span>
                    {roleName}
                  </span>
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
            className="profile-button"
            onClick={() =>
              setShowProfileMenu(
                (previous) =>
                  !previous,
              )
            }
          >
            <div className="profile-avatar">
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                : initials}
            </div>

            <div className="profile-info">
              <strong>
                {fullName}
              </strong>

              <span>
                {roleName}
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