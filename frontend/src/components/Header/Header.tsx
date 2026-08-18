import {
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";

import "./Header.css";

export default function Header() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">PITWALL</p>
        <h1>Görev Panosu</h1>
      </div>

      <div className="topbar-actions">
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Görevlerde ara..." />
        </div>

        <button className="icon-button">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <button className="team-button">
          Tüm Ekip
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}