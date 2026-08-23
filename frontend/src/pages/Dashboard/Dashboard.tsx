import { useState } from "react";

import {
  Plus,
  SlidersHorizontal,
} from "lucide-react";

import StatCard from "../../components/StatCard/StatCard";
import KanbanColumn from "../../components/KanbanColumn/KanbanColumn";
import TaskDrawer from "../../components/TaskDrawer/TaskDrawer";
import TaskModal from "../../components/TaskModal/TaskModal";

import { mockTasks } from "../../data/mockTasks";

import type { Task } from "../../types/task";

import "./Dashboard.css";

export default function Dashboard() {
  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [tasks, setTasks] =
    useState<Task[]>(mockTasks);

  const [showTaskModal, setShowTaskModal] =
    useState(false);

  const [
    taskModalStatus,
    setTaskModalStatus,
  ] = useState<Task["status"]>("todo");

  function handleCreateTask(
    newTask: Task,
  ) {
    setTasks((previousTasks) => [
      ...previousTasks,
      newTask,
    ]);
  }

  function openTaskModal(
    status: Task["status"] = "todo",
  ) {
    setTaskModalStatus(status);
    setShowTaskModal(true);
  }

  return (
    <>
      <section className="dashboard">
        <div className="welcome-row">
          <div>
            <h2>Takımın genel durumu</h2>

            <p>
              Formula Student çalışmalarındaki görevleri
              buradan takip edebilirsin.
            </p>
          </div>

          <button
            className="new-task-button"
            onClick={() =>
              openTaskModal("todo")
            }
          >
            <Plus size={18} />
            Yeni Görev
          </button>
        </div>

        <section className="stats-grid">
          <StatCard
            title="Toplam Görev"
            value={tasks.length}
            description="Bu sprintte"
            color="black"
          />

          <StatCard
            title="Devam Ediyor"
            value={
              tasks.filter(
                (task) =>
                  task.status === "progress",
              ).length
            }
            description="Aktif görev"
            color="red"
          />

          <StatCard
            title="İncelemede"
            value={
              tasks.filter(
                (task) =>
                  task.status === "review",
              ).length
            }
            description="Onay bekliyor"
            color="orange"
          />

          <StatCard
            title="Tamamlanan"
            value={
              tasks.filter(
                (task) =>
                  task.status === "done",
              ).length
            }
            description="Tamamlanan görev"
            color="green"
          />
        </section>

        <section className="board-section">
          <div className="board-toolbar">
            <div>
              <h3>Görevler</h3>

              <span>
                Takım görevlerinin mevcut durumu
              </span>
            </div>

            <button className="filter-button">
              <SlidersHorizontal size={17} />
              Filtrele
            </button>
          </div>

          <div className="kanban">
            <KanbanColumn
              title="Yapılacak"
              status="todo"
              tasks={tasks}
              onTaskClick={setSelectedTask}
              onAddTask={() =>
                openTaskModal("todo")
              }
            />

            <KanbanColumn
              title="Devam Ediyor"
              status="progress"
              tasks={tasks}
              onTaskClick={setSelectedTask}
              onAddTask={() =>
                openTaskModal("progress")
              }
            />

            <KanbanColumn
              title="İncelemede"
              status="review"
              tasks={tasks}
              onTaskClick={setSelectedTask}
              onAddTask={() =>
                openTaskModal("review")
              }
            />

            <KanbanColumn
              title="Tamamlandı"
              status="done"
              tasks={tasks}
              onTaskClick={setSelectedTask}
              onAddTask={() =>
                openTaskModal("done")
              }
            />
          </div>
        </section>
      </section>

      <TaskDrawer
        task={selectedTask}
        onClose={() =>
          setSelectedTask(null)
        }
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() =>
          setShowTaskModal(false)
        }
        onCreate={handleCreateTask}
        defaultStatus={taskModalStatus}
      />
    </>
  );
}