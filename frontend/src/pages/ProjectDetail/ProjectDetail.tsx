import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Users,
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

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

import "./ProjectDetail.css";

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

const projectMap: Record<
  string,
  {
    name: string;
    description: string;
    members: string[];
  }
> = {
  "1": {
    name: "Pitwall App",
    description:
      "Takım içi görev, proje ve çalışma takibi için geliştirilen uygulama.",
    members: [
      "LS",
      "FK",
      "BC",
      "MK",
    ],
  },

  "2": {
    name:
      "Formula Student Web Sitesi",
    description:
      "1.5 Adana Formula Student takımının resmi web sitesi.",
    members: [
      "LS",
      "BC",
      "EA",
    ],
  },

  "3": {
    name:
      "Araç Telemetri Sistemi",
    description:
      "Araç verilerinin takip ve analiz edildiği telemetri sistemi.",
    members: [
      "FK",
      "TA",
      "MK",
    ],
  },
};

export default function ProjectDetail() {
  const navigate = useNavigate();

  const { projectId } =
    useParams();

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

  const lastOverId =
    useRef<string | null>(null);

  const dragSnapshot =
    useRef<Task[] | null>(null);

  const [showMembers, setShowMembers] =
    useState(false);

  const [
    showTaskModal,
    setShowTaskModal,
  ] = useState(false);

  const [
    taskModalStatus,
    setTaskModalStatus,
  ] = useState<TaskStatus>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const project =
    projectMap[
    projectId ?? ""
    ];

  const projectTasks =
    useMemo(() => {
      if (!project) {
        return [];
      }

      return tasks
        .filter(
          (task) =>
            task.project?.name ===
            project.name,
        )
        .sort((a, b) => {
          if (
            a.status === b.status
          ) {
            return (
              a.order - b.order
            );
          }

          return 0;
        });
    }, [project, tasks]);

  if (!project) {
    return (
      <section className="project-detail-page">
        <h2>
          Proje bulunamadı.
        </h2>
      </section>
    );
  }

  /* =========================
     TASK CRUD
  ========================= */

  function openTaskModal(
    status: TaskStatus,
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

  function handleCreateTask(
    newTask: Task,
  ) {
    const tasksInColumn =
      tasks.filter(
        (task) =>
          task.project?.name ===
          project.name &&
          task.status ===
          taskModalStatus,
      );

    const taskForProject: Task = {
      ...newTask,

      project: {
        id: Number(projectId),
        name: project.name,
      },

      status:
        taskModalStatus,

      order:
        tasksInColumn.length +
        1,
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      taskForProject,
    ]);
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
            task.project?.name ===
            project.name &&
            task.status ===
            status,
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
      (task) => {
        if (
          task.project?.name !==
          project.name ||
          task.status !== status
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
            task.project?.name ===
            project.name &&
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
            task.project?.name !==
            project.name ||
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
      projectTasks.find(
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

    setTasks((previousTasks) => {
      const movingTask =
        previousTasks.find(
          (task) =>
            task.id === activeId,
        );

      if (
        !movingTask ||
        movingTask.project?.name !==
        project.name
      ) {
        return previousTasks;
      }

      let targetStatus:
        TaskStatus | null =
        null;

      if (
        overId.startsWith(
          "column:",
        )
      ) {
        targetStatus =
          overId.replace(
            "column:",
            "",
          ) as TaskStatus;
      } else {
        const overTask =
          previousTasks.find(
            (task) =>
              task.id ===
              Number(over.id),
          );

        if (
          overTask?.project?.name !==
          project.name
        ) {
          return previousTasks;
        }

        targetStatus =
          overTask.status;
      }

      if (
        !targetStatus ||
        !VALID_STATUSES.includes(
          targetStatus,
        )
      ) {
        return previousTasks;
      }

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
              task.project?.name ===
              project.name &&
              task.status ===
              targetStatus &&
              task.id !==
              activeId,
          )
          .sort(
            (a, b) =>
              a.order - b.order,
          );

      let targetIndex =
        targetTasks.length;

      if (
        !overId.startsWith(
          "column:",
        )
      ) {
        const overIndex =
          targetTasks.findIndex(
            (task) =>
              task.id ===
              Number(over.id),
          );

        if (
          overIndex !== -1
        ) {
          const translated =
            active.rect.current
              .translated;

          const isBelow =
            translated
              ? translated.top +
              translated.height /
              2 >
              over.rect.top +
              over.rect.height /
              2
              : false;

          targetIndex =
            overIndex +
            (isBelow ? 1 : 0);
        }
      }

      return moveTaskToColumn(
        previousTasks,
        activeId,
        targetStatus,
        targetIndex,
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
     PROJECT STATS
  ========================= */

  const completedCount =
    projectTasks.filter(
      (task) =>
        task.status === "done",
    ).length;

  const progress =
    projectTasks.length === 0
      ? 0
      : Math.round(
        (
          completedCount /
          projectTasks.length
        ) *
        100,
      );

  return (
    <>
      <section className="project-detail-page">
        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/projects")
          }
        >
          <ArrowLeft size={17} />
          Projelere dön
        </button>

        <div className="project-detail-header">
          <div>
            <span className="project-label">
              PROJE
            </span>

            <h2>
              {project.name}
            </h2>

            <p>
              {
                project.description
              }
            </p>
          </div>

          <div className="project-detail-members-wrapper">
            <button
              type="button"
              className="project-detail-members"
              onClick={() =>
                setShowMembers(
                  (previous) =>
                    !previous,
                )
              }
            >
              <Users size={17} />

              <div className="detail-avatars">
                {project.members.map(
                  (member) => (
                    <span
                      key={member}
                    >
                      {member}
                    </span>
                  ),
                )}
              </div>
            </button>

            {showMembers && (
              <div className="members-popover">
                <div className="members-popover-header">
                  Proje Üyeleri
                </div>

                <div className="members-list">
                  {project.members.map(
                    (member) => (
                      <div
                        className="member-item"
                        key={member}
                      >
                        <span className="member-avatar">
                          {member}
                        </span>

                        <div>
                          <strong>
                            {member === "LS" &&
                              "Lidya Su"}
                            {member === "FK" &&
                              "Furkan"}
                            {member === "BC" &&
                              "Busenur"}
                            {member === "MK" &&
                              "Mert"}
                            {member === "EA" &&
                              "E.A."}
                            {member === "TA" &&
                              "T.A."}
                          </strong>

                          <span>
                            Proje üyesi
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="project-summary">
          <div>
            <span>
              Toplam Görev
            </span>
            <strong>
              {projectTasks.length}
            </strong>
          </div>

          <div>
            <span>
              Devam Eden
            </span>
            <strong>
              {
                projectTasks.filter(
                  (task) =>
                    task.status ===
                    "in_progress",
                ).length
              }
            </strong>
          </div>

          <div>
            <span>
              İncelemede
            </span>
            <strong>
              {
                projectTasks.filter(
                  (task) =>
                    task.status ===
                    "review",
                ).length
              }
            </strong>
          </div>

          <div>
            <span>
              Tamamlanan
            </span>
            <strong>
              {completedCount}
            </strong>
          </div>
        </section>

        <div className="project-progress-box">
          <div>
            <span>
              Proje İlerlemesi
            </span>
            <strong>
              %{progress}
            </strong>
          </div>

          <div className="project-detail-progress">
            <div
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <section className="project-task-board">
          <div className="project-task-heading">
            <div>
              <h3>
                Proje Görevleri
              </h3>
              <p>
                Bu projeye ait görevlerin
                güncel durumu.
              </p>
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
                tasks={projectTasks}
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
                tasks={projectTasks}
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
                tasks={projectTasks}
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
                tasks={projectTasks}
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