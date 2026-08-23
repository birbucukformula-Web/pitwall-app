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

  const [showFilters, setShowFilters] =
    useState(false);

  const [projectFilter, setProjectFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [assigneeFilter, setAssigneeFilter] =
    useState("all");

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

  const availableProjects = Array.from(
    new Set(tasks.map((task) => task.project)),
  );

  const availableAssignees = Array.from(
    new Map(
      tasks
        .flatMap((task) => task.assignees)
        .map((member) => [
          member.id,
          member,
        ]),
    ).values(),
  );

  const filteredTasks = tasks.filter(
    (task) => {
      const matchesProject =
        projectFilter === "all" ||
        task.project === projectFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === "all" ||
        task.assignees.some(
          (member) =>
            member.id.toString() ===
            assigneeFilter,
        );

      return (
        matchesProject &&
        matchesPriority &&
        matchesAssignee
      );
    },
  );

  const activeFilterCount = [
    projectFilter !== "all",
    priorityFilter !== "all",
    assigneeFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setProjectFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
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

            <div className="filter-wrapper">
              <button
                className={`filter-button ${activeFilterCount > 0
                    ? "active"
                    : ""
                  }`}
                onClick={() =>
                  setShowFilters(
                    (previous) => !previous,
                  )
                }
              >
                <SlidersHorizontal size={17} />

                Filtrele

                {activeFilterCount > 0 && (
                  <span className="filter-count">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {showFilters && (
                <div className="filter-panel">
                  <div className="filter-panel-header">
                    <div>
                      <strong>Görevleri filtrele</strong>
                      <span>
                        Görmek istediğin görevleri daralt.
                      </span>
                    </div>

                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        className="clear-filter-button"
                        onClick={clearFilters}
                      >
                        Temizle
                      </button>
                    )}
                  </div>

                  <div className="filter-fields">
                    <label>
                      Proje

                      <select
                        value={projectFilter}
                        onChange={(event) =>
                          setProjectFilter(
                            event.target.value,
                          )
                        }
                      >
                        <option value="all">
                          Tüm projeler
                        </option>

                        {availableProjects.map(
                          (project) => (
                            <option
                              key={project}
                              value={project}
                            >
                              {project}
                            </option>
                          ),
                        )}
                      </select>
                    </label>

                    <label>
                      Öncelik

                      <select
                        value={priorityFilter}
                        onChange={(event) =>
                          setPriorityFilter(
                            event.target.value,
                          )
                        }
                      >
                        <option value="all">
                          Tüm öncelikler
                        </option>

                        <option value="low">
                          Düşük
                        </option>

                        <option value="medium">
                          Orta
                        </option>

                        <option value="high">
                          Yüksek
                        </option>
                      </select>
                    </label>

                    <label>
                      Atanan kişi

                      <select
                        value={assigneeFilter}
                        onChange={(event) =>
                          setAssigneeFilter(
                            event.target.value,
                          )
                        }
                      >
                        <option value="all">
                          Tüm ekip
                        </option>

                        {availableAssignees.map(
                          (member) => (
                            <option
                              key={member.id}
                              value={member.id}
                            >
                              {member.name}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>

                  <div className="filter-panel-footer">
                    <span>
                      {filteredTasks.length} görev
                      gösteriliyor
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setShowFilters(false)
                      }
                    >
                      Tamam
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="kanban">
            <KanbanColumn
              title="Yapılacak"
              status="todo"
              tasks={filteredTasks}
              onTaskClick={setSelectedTask}
              onAddTask={() =>
                openTaskModal("todo")
              }
            />

            <KanbanColumn
              title="Devam Ediyor"
              status="progress"
              tasks={filteredTasks}
              onTaskClick={setSelectedTask}
              onAddTask={() =>
                openTaskModal("progress")
              }
            />

            <KanbanColumn
              title="İncelemede"
              status="review"
              tasks={filteredTasks}
              onTaskClick={setSelectedTask}
              onAddTask={() =>
                openTaskModal("review")
              }
            />

            <KanbanColumn
              title="Tamamlandı"
              status="done"
              tasks={filteredTasks}
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