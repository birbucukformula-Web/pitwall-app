import { useState } from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  CheckCheck,
  Menu,
  Search,
  X,
} from "lucide-react";

import TaskDrawer from "../TaskDrawer/TaskDrawer";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "../../api/tasks";

import type { Task } from "../../types/task";
import { useNotifications, type NotificationItem } from "../../contexts/NotificationContext";

import "./Header.css";

type HeaderProps = {
  onMenuClick: () => void;
};



export default function Header({
  onMenuClick,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const {
    unreadNotifications: activeNotifications,
    unreadCount,
    markAllAsRead,
  } = useNotifications();

  const [
    selectedTask,
    setSelectedTask,
  ] = useState<Task | null>(null);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    showMobileSearch,
    setShowMobileSearch,
  ] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getTasks(),
  });

  /*
   * Sayfa başlığı route'a göre otomatik değişir.
   */
  const pageTitle = (() => {
    const path = location.pathname;

    if (path === "/dashboard") {
      return "Görev Panosu";
    }

    if (path === "/calendar") {
      return "Takvim";
    }

    if (path === "/projects") {
      return "Projeler";
    }

    if (
      path.startsWith("/projects/")
    ) {
      return "Projeler";
    }

    if (
      path === "/announcements"
    ) {
      return "Duyurular";
    }

    if (path === "/inbox") {
      return "Inbox";
    }

    if (path === "/profile") {
      return "Profil";
    }

    if (path === "/settings") {
      return "Ayarlar";
    }

    return "Pitwall";
  })();

  const searchResults =
    searchTerm.trim().length > 0
      ? tasks.filter((task) => {
        const search =
          searchTerm.toLowerCase();

        return (
          task.title
            .toLowerCase()
            .includes(search) ||
          task.project?.name
            .toLowerCase()
            .includes(search) ||
          task.unit?.name
            .toLowerCase()
            .includes(search)
        );
      })
      : [];

  function handleNotificationClick(
    notification: NotificationItem,
  ) {
    setShowNotifications(false);

    if (
      notification.type ===
      "announcement"
    ) {
      navigate("/announcements");
      return;
    }

    if (notification.taskId) {
      const task = tasks.find(
        (item) =>
          item.id ===
          notification.taskId,
      );

      if (task) {
        setSelectedTask(task);
      }
    }
  }

  function handleSearchResultClick(
    task: Task,
  ) {
    setSelectedTask(task);
    setSearchTerm("");
    setShowMobileSearch(false);
  }

  function closeMobileSearch() {
    setSearchTerm("");
    setShowMobileSearch(false);
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={onMenuClick}
            aria-label="Menüyü aç"
          >
            <Menu size={21} />
          </button>

          <div>
            <p className="eyebrow">
              PITWALL
            </p>

            <h1>
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="topbar-actions">
          {/* NOTIFICATIONS */}

          <div className="notification-wrapper">
            <button
              type="button"
              className="header-notification-button"
              onClick={() =>
                setShowNotifications(
                  (previous) =>
                    !previous,
                )
              }
              aria-label="Bildirimler"
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <div>
                    <h3>
                      Bildirimler
                    </h3>

                    <span>
                      {unreadCount > 0
                        ? `${unreadCount} okunmamış bildirim`
                        : "Tüm bildirimler okundu"}
                    </span>
                  </div>

                  <div className="notification-header-actions">
                    <button
                      type="button"
                      onClick={() =>
                        setShowNotifications(
                          false,
                        )
                      }
                      aria-label="Bildirimleri kapat"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="notification-list">
                  {activeNotifications.length > 0 ? (
                    activeNotifications.map(
                      (notification) => (
                        <button
                          type="button"
                          className={`notification-item ${!notification.isRead
                            ? "unread"
                            : ""
                            }`}
                          key={
                            notification.id
                          }
                          onClick={() =>
                            handleNotificationClick(
                              notification,
                            )
                          }
                        >
                          <span className="notification-indicator" />

                          <div className="notification-content">
                            <div className="notification-title-row">
                              <strong>
                                {
                                  notification.title
                                }
                              </strong>

                              <span>
                                {
                                  notification.createdAt
                                }
                              </span>
                            </div>

                            <p>
                              {
                                notification.message
                              }
                            </p>
                          </div>
                        </button>
                      ),
                    )
                  ) : (
                    <div className="notification-empty">
                      <div className="notification-empty-icon">
                        <Bell size={17} />
                      </div>

                      <strong>Yeni bildirimin yok</strong>
                    </div>
                  )}
                </div>

                <div className={`notification-footer ${unreadCount === 0 ? "empty" : ""}`}>
                  <button
                    type="button"
                    className="notification-inbox-link"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/inbox");
                    }}
                  >
                    Tüm bildirimleri gör
                  </button>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notification-read-all"
                      onClick={markAllAsRead}
                    >
                      <CheckCheck size={14} />
                      Tümünü okundu işaretle
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SEARCH */}

          <div className="search-wrapper">
            <div className="search-box desktop-search-box">
              <Search size={18} />

              <input
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
                placeholder="Görevlerde ara..."
              />

              {searchTerm && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Aramayı temizle"
                >
                  ×
                </button>
              )}
            </div>

            <button
              type="button"
              className="mobile-search-button"
              onClick={() =>
                setShowMobileSearch(
                  true,
                )
              }
              aria-label="Görevlerde ara"
            >
              <Search size={19} />
            </button>

            {searchTerm.trim() &&
              !showMobileSearch && (
                <div className="search-results desktop-search-results">
                  {searchResults.length >
                    0 ? (
                    searchResults.map(
                      (task) => (
                        <button
                          type="button"
                          className="search-result-item"
                          key={task.id}
                          onClick={() =>
                            handleSearchResultClick(
                              task,
                            )
                          }
                        >
                          <div className="search-result-top">
                            <strong>
                              {
                                task.title
                              }
                            </strong>

                            <span>
                              {
                                task.project?.name ??
                                "Proje yok"
                              }
                            </span>
                          </div>

                          <p>
                            {
                              task.unit?.name ??
                              "Birim yok"
                            }
                          </p>
                        </button>
                      ),
                    )
                  ) : (
                    <div className="search-empty">
                      Görev bulunamadı.
                    </div>
                  )}
                </div>
              )}
          </div>

          <ThemeToggle />
        </div>
      </header>

      {showMobileSearch && (
        <div className="mobile-search-panel">
          <div className="mobile-search-header">
            <div className="mobile-search-input">
              <Search size={19} />

              <input
                autoFocus
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
                placeholder="Görevlerde ara..."
              />
            </div>

            <button
              type="button"
              className="mobile-search-close"
              onClick={
                closeMobileSearch
              }
              aria-label="Aramayı kapat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mobile-search-results">
            {searchTerm.trim() ? (
              searchResults.length > 0 ? (
                searchResults.map(
                  (task) => (
                    <button
                      type="button"
                      className="search-result-item"
                      key={task.id}
                      onClick={() =>
                        handleSearchResultClick(
                          task,
                        )
                      }
                    >
                      <div className="search-result-top">
                        <strong>
                          {task.title}
                        </strong>

                        <span>
                          {task.project?.name ??
                            "Proje yok"}
                        </span>
                      </div>

                      <p>
                        {task.unit?.name ??
                          "Birim yok"}
                      </p>
                    </button>
                  ),
                )
              ) : (
                <div className="search-empty">
                  Görev bulunamadı.
                </div>
              )
            ) : (
              <div className="search-empty">
                Görev adı, proje veya
                departman ara.
              </div>
            )}
          </div>
        </div>
      )}

      <TaskDrawer
        task={selectedTask}
        onClose={() =>
          setSelectedTask(null)
        }
      />
    </>
  );
}