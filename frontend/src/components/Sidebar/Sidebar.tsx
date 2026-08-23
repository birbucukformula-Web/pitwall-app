import {
  CalendarDays,
  LayoutDashboard,
  Megaphone,
  MoreHorizontal,
  FolderKanban,
} from "lucide-react";

import formulaLogo from "../../assets/formula-logo.png";

import { NavLink } from "react-router-dom";

import "./Sidebar.css";

export default function Sidebar() {
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
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={20} />
          <span>Görev Panosu</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <CalendarDays size={20} />
          <span>Takvim</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <FolderKanban size={20} />
          <span>Projeler</span>
        </NavLink>

        <NavLink
          to="/announcements"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <Megaphone size={20} />
          <span>Duyurular</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="race-card">
          <span>FORMULA STUDENT</span>
          <strong>46 GÜN</strong>
          <p>Yarışa kalan süre</p>

          <div className="race-progress">
            <div className="race-progress-value" />
          </div>
        </div>

        <div className="profile">
          <div className="profile-avatar">
            LS
          </div>

          <div className="profile-info">
            <strong>Lidya Su</strong>
            <span>Frontend Developer</span>
          </div>

          <MoreHorizontal size={18} />
        </div>
      </div>
    </aside>
  );
}