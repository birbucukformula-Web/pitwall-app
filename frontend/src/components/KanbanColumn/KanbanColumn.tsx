import { Plus } from "lucide-react";

import type {
    Task,
    TaskStatus,
} from "../../types/task";

import TaskCard from "../TaskCard/TaskCard";

import "./KanbanColumn.css";

type KanbanColumnProps = {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
};

export default function KanbanColumn({
    title,
    status,
    tasks,
    onTaskClick,
}: KanbanColumnProps) {
    const filteredTasks = tasks.filter(
        (task) => task.status === status,
    );

    return (
        <div className="kanban-column">
            <div className="column-header">
                <div>
                    <span
                        className={`column-indicator ${status}`}
                    />

                    <strong>{title}</strong>

                    <span className="task-count">
                        {filteredTasks.length}
                    </span>
                </div>

                <Plus size={18} />
            </div>

            <div className="task-list">
                {filteredTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => onTaskClick(task)}
                    />
                ))}

                <button className="add-card-button">
                    <Plus size={17} />
                    Görev ekle
                </button>
            </div>
        </div>
    );
}