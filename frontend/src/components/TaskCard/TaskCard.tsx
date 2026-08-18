import {
    CalendarDays,
    MoreHorizontal,
} from "lucide-react";

import type { Task } from "../../types/task";

import "./TaskCard.css";

type TaskCardProps = {
    task: Task;
    onClick: () => void;
};

export default function TaskCard({
    task,
    onClick,
}: TaskCardProps) {
    function formatDate(date: string) {
        return new Intl.DateTimeFormat("tr-TR", {
            day: "numeric",
            month: "short",
        }).format(new Date(date));
    }
    return (
        <article className="task-card" onClick={onClick}>
            <div className="task-top">
                <span className="department">
                    {task.department}
                </span>

                <button>
                    <MoreHorizontal size={18} />
                </button>
            </div>

            <h4>{task.title}</h4>

            {task.priority && (
                <span
                    className={`priority priority-${task.priority}`}
                >
                    {task.priority === "high"
                        ? "Yüksek Öncelik"
                        : "Orta Öncelik"}
                </span>
            )}

            <div className="task-footer">
                <span className="task-date">
                    <CalendarDays size={15} />
                    {formatDate(task.dueDate)}
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