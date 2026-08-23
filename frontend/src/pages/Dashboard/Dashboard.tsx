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

  function handleCreateTask(
    newTask: Task,
  ) {
    setTasks((previousTasks) => [
      ...previousTasks,
      newTask,
    ]);
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
              setShowTaskModal(true)
            }
          >
            <Plus size={18} />
            Yeni Görev
          </button>
        </div>

        <section className="stats-grid">
          <StatCard
            title="Toplam Görev"
            value={13}
            description="Bu sprintte"
            color="black"
          />

          <StatCard
            title="Devam Ediyor"
            value={4}
            description="Aktif görev"
            color="red"
          />

          <StatCard
            title="İncelemede"
            value={2}
            description="Onay bekliyor"
            color="orange"
          />

          <StatCard
            title="Tamamlanan"
            value={7}
            description="%54 tamamlandı"
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
            />

            <KanbanColumn
              title="Devam Ediyor"
              status="progress"
              tasks={tasks}
              onTaskClick={setSelectedTask}
            />

            <KanbanColumn
              title="İncelemede"
              status="review"
              tasks={tasks}
              onTaskClick={setSelectedTask}
            />

            <KanbanColumn
              title="Tamamlandı"
              status="done"
              tasks={tasks}
              onTaskClick={setSelectedTask}
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
      />
    </>
  );
}