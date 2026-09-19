import { useState, useRef, useEffect } from "react";
import { useActiveUsers } from "../../hooks/useActiveUsers";
import "./ActiveUsersWidget.css";

export default function ActiveUsersWidget() {
  const { data: presence, isLoading } = useActiveUsers();
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const count = presence?.count ?? (isLoading ? "..." : 1);
  const users = presence?.users ?? [];

  // Close flyout when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="active-users-widget" ref={widgetRef}>
      <button
        type="button"
        className="active-users-badge"
        onClick={() => setIsOpen(!isOpen)}
        title={`${count} üye çevrimiçi (listeyi görmek için tıkla)`}
        aria-label={`${count} kişi çevrimiçi`}
      >
        <span className="pulse-container">
          <span className="pulse-ping" />
          <span className="pulse-core" />
        </span>
        <span className="active-users-count">{count}</span>
      </button>

      {isOpen && (
        <div className="active-users-popover">
          <div className="active-users-popover-header">
            <strong>Çevrimiçi Üyeler</strong>
            <span className="popover-count">{count} kişi</span>
          </div>

          <div className="active-users-items">
            {users.length > 0 ? (
              users.map((u) => {
                const displayName = u.first_name && u.last_name
                  ? `${u.first_name} ${u.last_name}`
                  : u.username;
                return (
                  <div key={u.id} className="active-user-item" title={displayName}>
                    <span className="user-online-dot" />
                    <span className="user-name">{displayName}</span>
                  </div>
                );
              })
            ) : (
              <div className="active-users-empty">Aktif üye bulunamadı</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
