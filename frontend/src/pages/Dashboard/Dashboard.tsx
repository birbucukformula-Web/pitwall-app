import {
  useRef,
  useState,
} from "react";

import {
  Plus,
  SlidersHorizontal,
} from "lucide-react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import StatCard from "../../components/StatCard/StatCard";
import KanbanColumn from "../../components/KanbanColumn/KanbanColumn";
import TaskDrawer from "../../components/TaskDrawer/TaskDrawer";
import TaskModal from "../../components/TaskModal/TaskModal";
import DeleteTaskModal from "../../components/DeleteTaskModal/DeleteTaskModal";
import TaskCard from "../../components/TaskCard/TaskCard";

import { mockTasks } from "../../data/mockTasks";

import type {
  Task,
  TaskStatus,
} from "../../types/task";

import "./Dashboard.css";

const VALID_STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "review",
  "done",
];

const kanbanCollisionDetection:
  CollisionDetection = (args) => {
    const pointerCollisions =
      pointerWithin(args);

    if (
      pointerCollisions.length > 0
    ) {
      const taskCollisions =
        pointerCollisions.filter(
          (collision) =>
            !String(
              collision.id,
            ).startsWith(
              "column:",
            ),
        );

      if (
        taskCollisions.length > 0
      ) {
        return taskCollisions;
      }

      return pointerCollisions;
    }

    return closestCenter(args);
  };

export default function Dashboard() {
  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [activeTask, setActiveTask] =
    useState<Task | null>(null);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [deletingTask, setDeletingTask] =
    useState<Task | null>(null);

  const [tasks, setTasks] =
    useState<Task[]>(mockTasks);

  const dragSnapshot =
    useRef<Task[] | null>(null);

  const lastOverId =
    useRef<string | null>(null);
  const [
    showTaskModal,
    setShowTaskModal,
  ] = useState(false);

  const [
    taskModalStatus,
    setTaskModalStatus,
  ] = useState<TaskStatus>("todo");

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  const [
    projectFilter,
    setProjectFilter,
  ] = useState("all");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("all");

  const [
    assigneeFilter,
    setAssigneeFilter,
  ] = useState("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  /* =========================
     TASK CRUD
  ========================= */

  function handleCreateTask(
    newTask: Task,
  ) {
    const tasksInColumn =
      tasks.filter(
        (task) =>
          task.status ===
          newTask.status,
      );

    const taskWithOrder: Task = {
      ...newTask,
      order:
        tasksInColumn.length + 1,
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      taskWithOrder,
    ]);
  }

  function openTaskModal(
    status: TaskStatus = "todo",
  ) {
    setEditingTask(null);
    setTaskModalStatus(status);
    setShowTaskModal(true);
  }

  function openEditTaskModal(
    task: Task,
  ) {
    setEditingTask(task);
    setShowTaskModal(true);
  }

  function handleUpdateTask(
    updatedTask: Task,
  ) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === updatedTask.id
          ? updatedTask
          : task,
      ),
    );

    setSelectedTask(updatedTask);
    setEditingTask(null);
  }

  function handleDeleteTask(
    taskToDelete: Task,
  ) {
    setTasks((previousTasks) => {
      const remainingTasks =
        previousTasks.filter(
          (task) =>
            task.id !==
            taskToDelete.id,
        );

      return normalizeColumnOrders(
        remainingTasks,
        taskToDelete.status,
      );
    });

    setSelectedTask(null);
    setDeletingTask(null);
  }

  /* =========================
     ORDER HELPERS
  ========================= */

  function normalizeColumnOrders(
    taskList: Task[],
    status: TaskStatus,
  ) {
    const columnTasks =
      taskList
        .filter(
          (task) =>
            task.status === status,
        )
        .sort(
          (a, b) =>
            a.order - b.order,
        );

    const orderMap =
      new Map<number, number>();

    columnTasks.forEach(
      (task, index) => {
        orderMap.set(
          task.id,
          index + 1,
        );
      },
    );

    return taskList.map(
      (task) =>
        task.status === status
          ? {
            ...task,
            order:
              orderMap.get(
                task.id,
              ) ??
              task.order,
          }
          : task,
    );
  }

  function moveTaskToColumn(
    taskList: Task[],
    taskId: number,
    targetStatus: TaskStatus,
    targetIndex: number,
  ) {
    const movingTask =
      taskList.find(
        (task) =>
          task.id === taskId,
      );

    if (!movingTask) {
      return taskList;
    }

    const sourceStatus =
      movingTask.status;

    const withoutMovingTask =
      taskList.filter(
        (task) =>
          task.id !== taskId,
      );

    const targetTasks =
      withoutMovingTask
        .filter(
          (task) =>
            task.status ===
            targetStatus,
        )
        .sort(
          (a, b) =>
            a.order - b.order,
        );

    const safeIndex =
      Math.max(
        0,
        Math.min(
          targetIndex,
          targetTasks.length,
        ),
      );

    const movedTask: Task = {
      ...movingTask,
      status: targetStatus,
    };

    targetTasks.splice(
      safeIndex,
      0,
      movedTask,
    );

    const orderMap =
      new Map<number, number>();

    targetTasks.forEach(
      (task, index) => {
        orderMap.set(
          task.id,
          index + 1,
        );
      },
    );

    let result =
      withoutMovingTask.map(
        (task) => {
          if (
            task.status !==
            targetStatus
          ) {
            return task;
          }

          return {
            ...task,
            order:
              orderMap.get(
                task.id,
              ) ??
              task.order,
          };
        },
      );

    result.push({
      ...movedTask,
      order:
        orderMap.get(
          movedTask.id,
        ) ?? 1,
    });

    if (
      sourceStatus !==
      targetStatus
    ) {
      result =
        normalizeColumnOrders(
          result,
          sourceStatus,
        );
    }

    return normalizeColumnOrders(
      result,
      targetStatus,
    );
  }

  /* =========================
     DRAG & DROP
  ========================= */

  function handleDragStart(
    event: DragStartEvent,
  ) {
    dragSnapshot.current =
      tasks.map((task) => ({
        ...task,
      }));

    lastOverId.current = null;
    
    const taskId =
      Number(event.active.id);

    const task =
      tasks.find(
        (item) =>
          item.id === taskId,
      ) ?? null;

    setActiveTask(task);
  }

  function handleDragOver(
  event: DragOverEvent,
) {
  const {
    active,
    over,
  } = event;

  if (!over) {
    return;
  }

  const activeId =
    Number(active.id);

  const overId =
    String(over.id);

  /*
    Aynı hedef üzerinde mouse hareket
    ederken tekrar tekrar state yazma.
  */
  if (
    lastOverId.current ===
    overId
  ) {
    return;
  }

  lastOverId.current =
    overId;

  setTasks((previousTasks) => {
    const movingTask =
      previousTasks.find(
        (task) =>
          task.id === activeId,
      );

    if (!movingTask) {
      return previousTasks;
    }

    /*
      Boş kolon alanı
    */
    if (
      overId.startsWith(
        "column:",
      )
    ) {
      const targetStatus =
        overId.replace(
          "column:",
          "",
        ) as TaskStatus;

      if (
        !VALID_STATUSES.includes(
          targetStatus,
        )
      ) {
        return previousTasks;
      }

      /*
        Zaten aynı kolondaysa
        boş alana geçerken değiştirme.
      */
      if (
        movingTask.status ===
        targetStatus
      ) {
        return previousTasks;
      }

      const targetTasks =
        previousTasks
          .filter(
            (task) =>
              task.status ===
                targetStatus &&
              task.id !==
                activeId,
          )
          .sort(
            (a, b) =>
              a.order -
              b.order,
          );

      return moveTaskToColumn(
        previousTasks,
        activeId,
        targetStatus,
        targetTasks.length,
      );
    }

    /*
      Bir kartın üzerine geldik.
    */
    const overTask =
      previousTasks.find(
        (task) =>
          task.id ===
          Number(over.id),
      );

    if (
      !overTask ||
      overTask.id === activeId
    ) {
      return previousTasks;
    }

    const targetStatus =
      overTask.status;

    const targetTasks =
      previousTasks
        .filter(
          (task) =>
            task.status ===
              targetStatus &&
            task.id !==
              activeId,
        )
        .sort(
          (a, b) =>
            a.order -
            b.order,
        );

    const overIndex =
      targetTasks.findIndex(
        (task) =>
          task.id ===
          overTask.id,
      );

    if (
      overIndex === -1
    ) {
      return previousTasks;
    }

    /*
      Fare hedef kartın alt yarısındaysa
      altına, üst yarısındaysa üstüne.
    */
    const translated =
      active.rect.current
        .translated;

    const activeCenter =
      translated
        ? translated.top +
          translated.height / 2
        : 0;

    const overCenter =
      over.rect.top +
      over.rect.height / 2;

    const insertIndex =
      overIndex +
      (
        activeCenter >
        overCenter
          ? 1
          : 0
      );

    return moveTaskToColumn(
      previousTasks,
      activeId,
      targetStatus,
      insertIndex,
    );
  });
}

  function handleDragEnd(
  event: DragEndEvent,
) {
  const { over } =
    event;

  setActiveTask(null);

  lastOverId.current =
    null;

  if (!over) {
    if (
      dragSnapshot.current
    ) {
      setTasks(
        dragSnapshot.current,
      );
    }

    dragSnapshot.current =
      null;

    return;
  }

  /*
    DragOver sırasında status ve order
    zaten canlı şekilde güncellendi.

    Burada yalnızca kolonların order
    değerlerini temizliyoruz.
  */
  setTasks((previousTasks) => {
    let result =
      previousTasks;

    VALID_STATUSES.forEach(
      (status) => {
        result =
          normalizeColumnOrders(
            result,
            status,
          );
      },
    );

    return result;
  });

  dragSnapshot.current =
    null;
}

  function handleDragCancel() {
    setActiveTask(null);

    if (
      dragSnapshot.current
    ) {
      setTasks(
        dragSnapshot.current,
      );
    }

    dragSnapshot.current =
      null;
  }

  /* =========================
     FILTER DATA
  ========================= */

  const availableProjects =
    Array.from(
      new Map(
        tasks
          .filter(
            (task) =>
              task.project,
          )
          .map((task) => [
            task.project!.id,
            task.project!,
          ]),
      ).values(),
    );

  const availableAssignees =
    Array.from(
      new Map(
        tasks
          .flatMap(
            (task) =>
              task.assignees,
          )
          .map((member) => [
            member.id,
            member,
          ]),
      ).values(),
    );

  const filteredTasks =
    tasks.filter((task) => {
      const matchesProject =
        projectFilter === "all" ||
        task.project?.id.toString() ===
        projectFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority ===
        priorityFilter;

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
    });

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
            <h2>
              Takımın genel durumu
            </h2>

            <p>
              Formula Student çalışmalarındaki
              görevleri buradan takip
              edebilirsin.
            </p>
          </div>

          <button
            type="button"
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
                  task.status ===
                  "in_progress",
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
                  task.status ===
                  "review",
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
                  task.status ===
                  "done",
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
                Takım görevlerinin mevcut
                durumu
              </span>
            </div>

            <div className="filter-wrapper">
              <button
                type="button"
                className={`filter-button ${activeFilterCount > 0
                  ? "active"
                  : ""
                  }`}
                onClick={() =>
                  setShowFilters(
                    (previous) =>
                      !previous,
                  )
                }
              >
                <SlidersHorizontal
                  size={17}
                />

                Filtrele

                {activeFilterCount >
                  0 && (
                    <span className="filter-count">
                      {
                        activeFilterCount
                      }
                    </span>
                  )}
              </button>

              {showFilters && (
                <div className="filter-panel">
                  <div className="filter-panel-header">
                    <div>
                      <strong>
                        Görevleri filtrele
                      </strong>

                      <span>
                        Görmek istediğin
                        görevleri daralt.
                      </span>
                    </div>

                    {activeFilterCount >
                      0 && (
                        <button
                          type="button"
                          className="clear-filter-button"
                          onClick={
                            clearFilters
                          }
                        >
                          Temizle
                        </button>
                      )}
                  </div>

                  <div className="filter-fields">
                    <label>
                      Proje

                      <select
                        value={
                          projectFilter
                        }
                        onChange={(
                          event,
                        ) =>
                          setProjectFilter(
                            event.target
                              .value,
                          )
                        }
                      >
                        <option value="all">
                          Tüm projeler
                        </option>

                        {availableProjects.map(
                          (project) => (
                            <option
                              key={
                                project.id
                              }
                              value={
                                project.id
                              }
                            >
                              {
                                project.name
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </label>

                    <label>
                      Öncelik

                      <select
                        value={
                          priorityFilter
                        }
                        onChange={(
                          event,
                        ) =>
                          setPriorityFilter(
                            event.target
                              .value,
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
                        value={
                          assigneeFilter
                        }
                        onChange={(
                          event,
                        ) =>
                          setAssigneeFilter(
                            event.target
                              .value,
                          )
                        }
                      >
                        <option value="all">
                          Tüm ekip
                        </option>

                        {availableAssignees.map(
                          (member) => (
                            <option
                              key={
                                member.id
                              }
                              value={
                                member.id
                              }
                            >
                              {
                                member.name
                              }
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

          <DndContext
            sensors={sensors}
            collisionDetection={
              kanbanCollisionDetection
            }
            onDragStart={
              handleDragStart
            }
            onDragOver={
              handleDragOver
            }
            onDragEnd={
              handleDragEnd
            }
            onDragCancel={
              handleDragCancel
            }
          >
            <div className="kanban">
              <KanbanColumn
                title="Yapılacak"
                status="todo"
                tasks={filteredTasks}
                onTaskClick={
                  setSelectedTask
                }
                onAddTask={() =>
                  openTaskModal("todo")
                }
              />

              <KanbanColumn
                title="Devam Ediyor"
                status="in_progress"
                tasks={filteredTasks}
                onTaskClick={
                  setSelectedTask
                }
                onAddTask={() =>
                  openTaskModal(
                    "in_progress",
                  )
                }
              />

              <KanbanColumn
                title="İncelemede"
                status="review"
                tasks={filteredTasks}
                onTaskClick={
                  setSelectedTask
                }
                onAddTask={() =>
                  openTaskModal("review")
                }
              />

              <KanbanColumn
                title="Tamamlandı"
                status="done"
                tasks={filteredTasks}
                onTaskClick={
                  setSelectedTask
                }
                onAddTask={() =>
                  openTaskModal("done")
                }
              />
            </div>

            <DragOverlay
              dropAnimation={null}
            >
              {activeTask ? (
                <div className="drag-overlay-wrapper">
                  <TaskCard
                    task={activeTask}
                    isOverlay
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </section>
      </section>

      <TaskDrawer
        task={selectedTask}
        onClose={() =>
          setSelectedTask(null)
        }
        onEdit={(task) => {
          setSelectedTask(null);
          openEditTaskModal(task);
        }}
        onDelete={(task) => {
          setSelectedTask(null);
          setDeletingTask(task);
        }}
      />

      <DeleteTaskModal
        task={deletingTask}
        onClose={() =>
          setDeletingTask(null)
        }
        onConfirm={
          handleDeleteTask
        }
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onCreate={
          handleCreateTask
        }
        onUpdate={
          handleUpdateTask
        }
        defaultStatus={
          taskModalStatus
        }
        editingTask={
          editingTask
        }
      />
    </>
  );
}