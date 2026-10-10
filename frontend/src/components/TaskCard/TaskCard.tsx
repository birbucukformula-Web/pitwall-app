import { useState } from "react";
import {
  CalendarDays,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Task } from "../../types/task";
import { useNotifications } from "../../contexts/NotificationContext";

import "./TaskCard.css";

type TaskCardProps = {
  task: Task;
  onClick?: () => void;
  onDelete?: () => void;
  isOverlay?: boolean;
};

export default function TaskCard({
  task,
  onClick,
  onDelete,
  isOverlay = false,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const {
    notifications,
    markManyAsRead,
  } = useNotifications();

  const unreadCommentNotificationIds = notifications
    .filter(
      (notification) =>
        notification.type === "comment" &&
        notification.taskId === task.id &&
        !notification.isRead,
    )
    .map((notification) => notification.id);

  const hasUnreadComment =
    unreadCommentNotificationIds.length > 0;

  function handleTaskClick() {
    if (unreadCommentNotificationIds.length > 0) {
      markManyAsRead(unreadCommentNotificationIds);
    }

    onClick?.();
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isOverlay,

    data: {
      type: "task",
      task,
    },

    transition: {
      duration: 190,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  });

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
    }).format(new Date(date));
  }

  const style: React.CSSProperties | undefined = isOverlay
    ? undefined
    : {
      transform: isDragging
        ? undefined
        : CSS.Transform.toString(transform),

      transition: isDragging
        ? undefined
        : transition ??
        "transform 190ms cubic-bezier(0.22, 1, 0.36, 1)",
    };

  return (
    <article
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "task-card-dragging" : ""
        } ${isOverlay ? "task-card-overlay" : ""
        }`}
      onClick={handleTaskClick}
      {...(!isOverlay ? attributes : {})}
      {...(!isOverlay ? listeners : {})}
    >
      <div className="task-top">
        <span className="department">
          {task.unit?.name ?? "Birim yok"}
        </span>

        <div className="task-top-actions">
          {hasUnreadComment && !isOverlay && (
            <span
              className="task-comment-indicator"
              title="Yeni yorum"
              aria-label="Okunmamış yorum var"
            >
              <MessageCircle size={15} />
              <span className="task-comment-dot" />
            </span>
          )}

          {onDelete && !isOverlay && (
            <div className="task-more-wrapper">
              <button
                type="button"
                className="task-more-button"
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                aria-label="Görev seçenekleri"
              >
                <MoreHorizontal size={18} />
              </button>

              {showMenu && (
                <div className="task-dropdown-menu">
                  <button
                    type="button"
                    className="task-dropdown-item delete-item"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowMenu(false);
                      onDelete();
                    }}
                  >
                    Sil
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <h4>{task.title}</h4>

      <span
        className={`priority priority-${task.priority}`}
      >
        {task.priority === "high"
          ? "Yüksek Öncelik"
          : task.priority === "medium"
            ? "Orta Öncelik"
            : "Düşük Öncelik"}
      </span>

      <div className="task-footer">
        <span className="task-date">
          <CalendarDays size={15} />
          {formatDate(task.due_date)}
        </span>

        <div className="avatars">
          {task.assignees.map((assignee) => (
            <span
              key={assignee.id}
              title={assignee.name}
            >
              {assignee.initials}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}