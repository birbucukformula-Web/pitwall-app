import {
  CalendarDays,
  MoreHorizontal,
} from "lucide-react";

import {
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import type { Task } from "../../types/task";

import "./TaskCard.css";

type TaskCardProps = {
  task: Task;
  onClick?: () => void;
  isOverlay?: boolean;
};

export default function TaskCard({
  task,
  onClick,
  isOverlay = false,
}: TaskCardProps) {
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
      easing:
        "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  });

  function formatDate(
    date: string,
  ) {
    return new Intl.DateTimeFormat(
      "tr-TR",
      {
        day: "numeric",
        month: "short",
      },
    ).format(new Date(date));
  }

  const style:
    React.CSSProperties | undefined =
    isOverlay
      ? undefined
      : {
        transform: isDragging
          ? undefined
          : CSS.Transform.toString(
            transform,
          ),

        transition: isDragging
          ? undefined
          : transition ??
          "transform 190ms cubic-bezier(0.22, 1, 0.36, 1)",
      };

  return (
    <article
      ref={
        isOverlay
          ? undefined
          : setNodeRef
      }
      style={style}
      className={`task-card ${isDragging
          ? "task-card-dragging"
          : ""
        } ${isOverlay
          ? "task-card-overlay"
          : ""
        }`}
      onClick={onClick}
      {...(!isOverlay
        ? attributes
        : {})}
      {...(!isOverlay
        ? listeners
        : {})}
    >
      <div className="task-top">
        <span className="department">
          {task.unit?.name ??
            "Birim yok"}
        </span>

        <button
          type="button"
          className="task-more-button"
          onPointerDown={(event) =>
            event.stopPropagation()
          }
          onClick={(event) =>
            event.stopPropagation()
          }
          aria-label="Görev seçenekleri"
        >
          <MoreHorizontal
            size={18}
          />
        </button>
      </div>

      <h4>
        {task.title}
      </h4>

      <span
        className={`priority priority-${task.priority}`}
      >
        {task.priority === "high"
          ? "Yüksek Öncelik"
          : task.priority ===
            "medium"
            ? "Orta Öncelik"
            : "Düşük Öncelik"}
      </span>

      <div className="task-footer">
        <span className="task-date">
          <CalendarDays
            size={15}
          />

          {formatDate(
            task.due_date,
          )}
        </span>

        <div className="avatars">
          {task.assignees.map(
            (assignee) => (
              <span
                key={assignee.id}
                title={
                  assignee.name
                }
              >
                {
                  assignee.initials
                }
              </span>
            ),
          )}
        </div>
      </div>
    </article>
  );
}