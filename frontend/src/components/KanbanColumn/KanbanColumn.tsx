import { Plus } from "lucide-react";

import {
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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

  onTaskClick: (
    task: Task,
  ) => void;

  onAddTask: () => void;
  onDeleteTask?: (task: Task) => void;
};

export default function KanbanColumn({
  title,
  status,
  tasks,
  onTaskClick,
  onAddTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: `column:${status}`,

    data: {
      type: "column",
      status,
    },
  });

  const filteredTasks =
    tasks
      .filter(
        (task) =>
          task.status === status,
      )
      .sort(
        (a, b) =>
          a.order - b.order,
      );

  const taskIds =
    filteredTasks.map(
      (task) => task.id,
    );

  return (
    <div
      className={`kanban-column ${
        isOver
          ? "drag-over"
          : ""
      }`}
    >
      <div className="column-header">
        <div>
          <span
            className={`column-indicator ${status}`}
          />

          <strong>
            {title}
          </strong>

          <span className="task-count">
            {filteredTasks.length}
          </span>
        </div>

        <button
          type="button"
          className="column-add-button"
          onClick={onAddTask}
          aria-label={`${title} kolonuna görev ekle`}
        >
          <Plus size={18} />
        </button>
      </div>

      <SortableContext
        items={taskIds}
        strategy={
          verticalListSortingStrategy
        }
      >
        <div
          ref={setNodeRef}
          className="task-list"
        >
          {filteredTasks.map(
            (task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() =>
                  onTaskClick(task)
                }
                onDelete={() => {
                  if (onDeleteTask) onDeleteTask(task);
                }}
              />
            ),
          )}

          <button
            type="button"
            className="add-card-button"
            onClick={onAddTask}
          >
            <Plus size={17} />
            Görev ekle
          </button>
        </div>
      </SortableContext>
    </div>
  );
}