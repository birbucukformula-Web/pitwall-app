import { useMemo, useState } from "react";
import { useNotifications, type NotificationType } from "../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    CalendarClock,
    Check,
    CheckCheck,
    Inbox as InboxIcon,
    MessageCircle,
    Square,
    UserPlus,
} from "lucide-react";

import "./Inbox.css";

type InboxItemType = NotificationType;

type Filter = "all" | "unread";



function NotificationIcon({
    type,
}: {
    type: InboxItemType;
}) {
    switch (type) {
        case "task_assigned":
            return <UserPlus size={16} strokeWidth={1.8} />;

        case "comment":
            return <MessageCircle size={16} strokeWidth={1.8} />;

        case "due_date":
            return <CalendarClock size={16} strokeWidth={1.8} />;

        default:
            return <Bell size={16} strokeWidth={1.8} />;
    }
}

export default function Inbox() {
    const navigate = useNavigate();

    const {
        notifications: items,
        unreadCount,
        markManyAsRead,
        markAllAsRead: markAllNotificationsAsRead,
    } = useNotifications();

    const [filter, setFilter] =
        useState<Filter>("all");

    const [selectedIds, setSelectedIds] =
        useState<number[]>([]);

    const visibleItems = useMemo(() => {
        if (filter === "unread") {
            return items.filter((item) => !item.isRead);
        }

        return items;
    }, [filter, items]);

    const allVisibleSelected =
        visibleItems.length > 0 &&
        visibleItems.every((item) =>
            selectedIds.includes(item.id),
        );

    function toggleSelection(id: number) {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter(
                    (selectedId) => selectedId !== id,
                )
                : [...current, id],
        );
    }

    function toggleSelectAll() {
        if (allVisibleSelected) {
            setSelectedIds((current) =>
                current.filter(
                    (id) =>
                        !visibleItems.some(
                            (item) => item.id === id,
                        ),
                ),
            );

            return;
        }

        setSelectedIds((current) => [
            ...new Set([
                ...current,
                ...visibleItems.map((item) => item.id),
            ]),
        ]);
    }

    function markSelectedAsRead() {
        markManyAsRead(selectedIds);
        setSelectedIds([]);
    }

    function markAllAsRead() {
        markAllNotificationsAsRead();
        setSelectedIds([]);
    }

    return (
    <div className="inbox-page">
        <div className="inbox-container">
            <header className="inbox-page-header">
                <p>
                    Görevler ve takım aktiviteleriyle ilgili
                    bildirimlerini buradan takip edebilirsin.
                </p>
            </header>

            <div className="inbox-shell">
                <aside className="inbox-filters">
                    <span className="inbox-filter-title">
                        Bildirimler
                    </span>

                    <button
                        type="button"
                        className={`inbox-filter-button ${filter === "all" ? "active" : ""
                            }`}
                        onClick={() => {
                            setFilter("all");
                            setSelectedIds([]);
                        }}
                    >
                        <InboxIcon size={17} />

                        <span>Tümü</span>

                        <span className="inbox-filter-count">
                            {items.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`inbox-filter-button ${filter === "unread" ? "active" : ""
                            }`}
                        onClick={() => {
                            setFilter("unread");
                            setSelectedIds([]);
                        }}
                    >
                        <Bell size={17} />

                        <span>Okunmamış</span>

                        {unreadCount > 0 && (
                            <span className="inbox-filter-count unread">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </aside>

                <section className="inbox-main">
                    <div className="inbox-toolbar">
                        <div className="inbox-toolbar-left">
                            <button
                                type="button"
                                className={`inbox-select-all ${allVisibleSelected
                                        ? "selected"
                                        : ""
                                    }`}
                                onClick={toggleSelectAll}
                                aria-label="Tümünü seç"
                            >
                                {allVisibleSelected ? (
                                    <Check size={14} />
                                ) : (
                                    <Square size={15} />
                                )}
                            </button>

                            {selectedIds.length > 0 ? (
                                <span className="inbox-selection-count">
                                    {selectedIds.length} seçildi
                                </span>
                            ) : (
                                <div className="inbox-toolbar-copy">
                                    <h2>
                                        {filter === "all"
                                            ? "Tüm bildirimler"
                                            : "Okunmamış"}
                                    </h2>

                                    <span>
                                        {filter === "all"
                                            ? `${items.length} bildirim`
                                            : `${unreadCount} okunmamış`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="inbox-toolbar-actions">
                            {selectedIds.length > 0 ? (
                                <button
                                    type="button"
                                    className="inbox-action-button"
                                    onClick={markSelectedAsRead}
                                >
                                    <CheckCheck size={15} />
                                    Okundu işaretle
                                </button>
                            ) : (
                                unreadCount > 0 && (
                                    <button
                                        type="button"
                                        className="inbox-action-button"
                                        onClick={markAllAsRead}
                                    >
                                        <CheckCheck size={15} />
                                        Tümünü okundu işaretle
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="inbox-list">
                        {visibleItems.length === 0 ? (
                            <div className="inbox-empty">
                                <span className="inbox-empty-icon">
                                    <CheckCheck size={20} />
                                </span>

                                <h3>Hepsi tamam</h3>

                                <p>
                                    Okunmamış bildirimin bulunmuyor.
                                </p>
                            </div>
                        ) : (
                            visibleItems.map((item) => {
                                const isSelected =
                                    selectedIds.includes(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        className={`inbox-row ${!item.isRead
                                                ? "unread"
                                                : "read"
                                            } ${isSelected
                                                ? "selected"
                                                : ""
                                            }`}
                                    >
                                        <button
                                            type="button"
                                            className={`inbox-checkbox ${isSelected
                                                    ? "selected"
                                                    : ""
                                                }`}
                                            onClick={() =>
                                                toggleSelection(item.id)
                                            }
                                            aria-label={`${item.title} seç`}
                                        >
                                            {isSelected ? (
                                                <Check size={13} />
                                            ) : (
                                                <Square size={15} />
                                            )}
                                        </button>

                                        <span
                                            className={`inbox-row-icon ${!item.isRead
                                                    ? "unread"
                                                    : ""
                                                }`}
                                        >
                                            <NotificationIcon
                                                type={item.type}
                                            />
                                        </span>

                                        <button
                                            type="button"
                                            className="inbox-row-open"
                                            onClick={() => navigate(item.link)}
                                            aria-label={`${item.title} bildirimini aç`}
                                        >
                                            <span className="inbox-row-title">
                                                {item.title}
                                            </span>

                                            <span className="inbox-row-separator">
                                                —
                                            </span>

                                            <span className="inbox-row-message">
                                                {item.message}
                                            </span>
                                        </button>
                                        <div className="inbox-row-meta">
                                            <span>{item.createdAt}</span>

                                            {!item.isRead && (
                                                <span className="inbox-unread-dot" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>
        </div>
    </div>
);
}
