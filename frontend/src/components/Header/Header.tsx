import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  CheckCheck,
  Menu,
  Search,
  X,
} from "lucide-react";

import TaskDrawer from "../TaskDrawer/TaskDrawer";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

import { mockTasks } from "../../data/mockTasks";

import type { Task } from "../../types/task";

import "./Header.css";

type HeaderProps = {
  onMenuClick: () => void;
};

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;

  type:
  | "task"
  | "comment"
  | "status"
  | "announcement"
  | "deadline";

  taskId?: number;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Yeni görev atandı",
    description:
      "Telemetri dashboard frontend görevine dahil edildin.",
    time: "2 dk önce",
    unread: true,
    type: "task",
    taskId: 1,
  },
  {
    id: 2,
    title: "Yeni yorum",
    description:
      "Furkan, Araç veri API bağlantısı görevine yorum yaptı.",
    time: "18 dk önce",
    unread: true,
    type: "comment",
    taskId: 3,
  },
  {
    id: 3,
    title: "Görev durumu değişti",
    description:
      "Görev takip ekranı tasarımı İncelemede durumuna alındı.",
    time: "1 sa önce",
    unread: false,
    type: "status",
    taskId: 5,
  },
  {
    id: 4,
    title: "Yeni duyuru",
    description:
      "Web ekibi toplantısı duyurusu yayınlandı.",
    time: "2 sa önce",
    unread: false,
    type: "announcement",
  },
  {
    id: 5,
    title: "Teslim tarihi yaklaşıyor",
    description:
      "Telemetri dashboard arayüzü görevinin teslim tarihi yaklaşıyor.",
    time: "Bugün",
    unread: false,
    type: "deadline",
    taskId: 1,
  },
  {
    id: 6,
    title: "Göreve yeni üye eklendi",
    description:
      "Busenur, Pitwall dashboard frontend görevine eklendi.",
    time: "Dün",
    unread: false,
    type: "task",
    taskId: 1,
  },
  {
    id: 7,
    title: "Yeni yorum",
    description:
      "Lidya, Görev takip ekranı tasarımı görevine yorum yaptı.",
    time: "Dün",
    unread: false,
    type: "comment",
    taskId: 5,
  },
  {
    id: 8,
    title: "Görev tamamlandı",
    description:
      "Parça maliyet tablosu görevi tamamlandı.",
    time: "2 gün önce",
    unread: false,
    type: "status",
    taskId: 6,
  },
  {
    id: 9,
    title: "Yeni duyuru",
    description:
      "Takım toplantısı için yeni duyuru yayınlandı.",
    time: "3 gün önce",
    unread: false,
    type: "announcement",
  },
  {
    id: 10,
    title: "Teslim tarihi yaklaşıyor",
    description:
      "Elektrik sistemi dokümantasyonu görevinin teslim tarihine 2 gün kaldı.",
    time: "3 gün önce",
    unread: false,
    type: "deadline",
    taskId: 4,
  },
  {
    id: 11,
    title: "Görev durumu değişti",
    description:
      "Araç veri API bağlantısı görevi Devam Ediyor durumuna alındı.",
    time: "4 gün önce",
    unread: false,
    type: "status",
    taskId: 3,
  },
];

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const navigate = useNavigate();

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>(
    initialNotifications,
  );

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

  const searchResults =
    searchTerm.trim().length > 0
      ? mockTasks.filter((task) => {
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

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.unread,
    ).length;

  function handleNotificationClick(
    notification: Notification,
  ) {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id
          ? {
            ...item,
            unread: false,
          }
          : item,
      ),
    );

    setShowNotifications(false);

    if (
      notification.type ===
      "announcement"
    ) {
      navigate("/announcements");

      return;
    }

    if (notification.taskId) {
      const task = mockTasks.find(
        (item) =>
          item.id ===
          notification.taskId,
      );

      if (task) {
        setSelectedTask(task);
      }
    }
  }

  function markAllAsRead() {
    setNotifications((previous) =>
      previous.map(
        (notification) => ({
          ...notification,
          unread: false,
        }),
      ),
    );
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
              Görev Panosu
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
                  {notifications.map(
                    (notification) => (
                      <button
                        type="button"
                        className={`notification-item ${notification.unread
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
                                notification.time
                              }
                            </span>
                          </div>

                          <p>
                            {
                              notification.description
                            }
                          </p>
                        </div>
                      </button>
                    ),
                  )}
                </div>

                <div className="notification-footer">
                  <button
                    type="button"
                    onClick={
                      markAllAsRead
                    }
                  >
                    <CheckCheck
                      size={14}
                    />

                    Tümünü okundu işaretle
                  </button>
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
                                task.project?.name ?? "Proje yok"
                              }
                            </span>
                          </div>

                          <p>
                            {
                              task.unit?.name ?? "Birim yok"
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
                          {task.project?.name ?? "Proje yok"}
                        </span>
                      </div>

                      <p>
                        {
                          task.unit?.name ?? "Birim yok"
                        }
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