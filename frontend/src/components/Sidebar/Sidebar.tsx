import { useState, useEffect } from "react";

import {
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MoreHorizontal,
  Settings,
  UserRound,
  Users,
  X,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import {
  NavLink,
  useNavigate,
  useLocation
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { metadataApi } from "../../api/metadata";

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

  const [isInnerOpen, setIsInnerOpen] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!isInnerOpen) {
      document.body.classList.add('inner-sidebar-closed');
    } else {
      document.body.classList.remove('inner-sidebar-closed');
    }
    return () => document.body.classList.remove('inner-sidebar-closed');
  }, [isInnerOpen]);

  // Auto close/open based on route
  useEffect(() => {
    const closedRoutes = ['/calendar', '/profile', '/announcements'];
    if (closedRoutes.includes(location.pathname)) {
      setIsInnerOpen(false);
    } else {
      setIsInnerOpen(true);
    }
  }, [location.pathname]);

  function handleOuterNavClick(e: React.MouseEvent, path: string) {
    if (location.pathname === path) {
      e.preventDefault();
      setIsInnerOpen(prev => !prev);
    } else {
      setShowProfileMenu(false);
      // Navigation will be handled by NavLink naturally, but we can close mobile sidebar
      // onClose(); // if we want to close mobile sidebar on navigation
    }
  }

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: () => metadataApi.getUnits(),
  });

  const roleName = user?.organization?.name || "Takım Üyesi";
  const fullName = user ? `${user.first_name} ${user.last_name}` : "Bilinmeyen Kullanıcı";
  const initials = user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : "?";

  const selectedAvatarId = localStorage.getItem("pitwall_avatar") ?? "";
  const avatarSrc = AVATARS[selectedAvatarId] ?? null;

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
    <div className={`sidebar-container ${isOpen ? "sidebar-open" : ""}`}>
      {/* OUTER SIDEBAR */}
      <aside className="outer-sidebar">
        <div className="outer-top">
          <NavLink
            to="/dashboard"
            className="outer-brand"
            aria-label="Ana Sayfa"
            onClick={handleNavigation}
          >
            <img src={formulaLogo} alt="Logo" />
          </NavLink>

          <nav className="outer-nav">
            <NavLink
              to="/dashboard"
              onClick={(e) => { handleOuterNavClick(e, '/dashboard'); handleNavigation(); }}
              className={({ isActive }) => `outer-nav-item ${isActive ? "active" : ""}`}
              title="Görev Panosu"
            >
              <LayoutDashboard size={22} />
              <span>Pano</span>
            </NavLink>

            <NavLink
              to="/calendar"
              onClick={(e) => { handleOuterNavClick(e, '/calendar'); handleNavigation(); }}
              className={({ isActive }) => `outer-nav-item ${isActive ? "active" : ""}`}
              title="Takvim"
            >
              <CalendarDays size={22} />
              <span>Takvim</span>
            </NavLink>

            <NavLink
              to="/projects"
              onClick={(e) => { handleOuterNavClick(e, '/projects'); handleNavigation(); }}
              className={({ isActive }) => `outer-nav-item ${isActive ? "active" : ""}`}
              title="Projeler"
            >
              <FolderKanban size={22} />
              <span>Projeler</span>
            </NavLink>

            <NavLink
              to="/announcements"
              onClick={(e) => { handleOuterNavClick(e, '/announcements'); handleNavigation(); }}
              className={({ isActive }) => `outer-nav-item ${isActive ? "active" : ""}`}
              title="Duyurular"
            >
              <Megaphone size={22} />
              <span>Duyuru</span>
            </NavLink>

            <NavLink
              to="/profile"
              onClick={(e) => { handleOuterNavClick(e, '/profile'); handleNavigation(); }}
              className={({ isActive }) => `outer-nav-item ${isActive ? "active" : ""}`}
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
                    {avatarSrc
                      ? <img src={avatarSrc} alt="avatar" />
                      : initials}
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
                  onClick={() => handleProfileNavigation("/profile")}
                >
                  <UserRound size={16} /> Profilim
                </button>
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => handleProfileNavigation("/settings")}
                >
                  <Settings size={16} /> Ayarlar
                </button>

                <div className="profile-menu-divider" />

                <button
                  type="button"
                  className="profile-menu-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Çıkış Yap
                </button>
              </div>
            )}

            <button
              type="button"
              className="outer-profile-btn"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            >
              <div className="outer-avatar">
                {avatarSrc ? <img src={avatarSrc} alt="avatar" /> : initials}
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* INNER SIDEBAR */}
      <aside className={`inner-sidebar ${!isInnerOpen ? 'closed' : ''}`}>
        <div className="inner-header">
          <div className="inner-search">
            <Search size={16} />
            <input type="text" placeholder="Proje ara..." />
          </div>
          <button
            type="button"
            className="sidebar-close-button"
            onClick={onClose}
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="inner-content">
          <div className="inner-section">
            <div className="inner-section-header">
              <span>Projeler & Takımlar</span>
              <button className="inner-settings-btn" title="Yönet">
                <Settings size={14} />
              </button>
            </div>
            
            <nav className="inner-nav">
              {units.map((unit: any) => (
                <NavLink
                  key={unit.id}
                  to={`/dashboard?unit=${unit.id}`}
                  onClick={handleNavigation}
                  className={({ isActive }) => `inner-nav-item ${isActive ? "active" : ""}`}
                >
                  <Users size={16} className="project-icon" />
                  <span>{unit.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="inner-footer">
          <div className="race-card">
            <span>FORMULA STUDENT</span>
            <strong>{daysText}</strong>
            <p>Yarışa kalan süre</p>
            <div className="race-progress">
              <div className="race-progress-value" />
            </div>
          </div>
          
          <button className="new-project-btn" onClick={() => navigate('/projects')}>
            Yeni Proje Ekle <Plus size={16} />
          </button>
        </div>
      </aside>

      <button 
        className={`sidebar-toggle-btn ${!isInnerOpen ? 'closed' : ''}`}
        onClick={() => setIsInnerOpen(!isInnerOpen)}
        title={isInnerOpen ? "Paneli Daralt" : "Paneli Genişlet"}
      >
        {isInnerOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
}