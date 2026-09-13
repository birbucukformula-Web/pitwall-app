import {
  useEffect,
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, type TaskPayload } from "../../api/tasks";
import { metadataApi } from "../../api/metadata";

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

export default function ProjectDetail() {
  const navigate = useNavigate();

  const { projectId } = useParams<{ projectId: string }>();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const lastOverId = useRef<string | null>(null);
  const dragSnapshot = useRef<Task[] | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalStatus, setTaskModalStatus] = useState<TaskStatus>("todo");

  const queryClient = useQueryClient();

  const { data: apiProjects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => metadataApi.getProjects(),
  });

  const { data: fetchedTasks } = useQuery({
    queryKey: ["tasks", { project: Number(projectId) }],
    queryFn: () => tasksApi.getTasks({ project: Number(projectId) }),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  const rawProject = apiProjects.find((p) => p.id === Number(projectId));

  const projectTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.order - b.order);
  }, [tasks]);

  const projectMembers = useMemo(() => {
    const map = new Map<number, { id: number; name: string; initials: string }>();
    projectTasks.forEach((t) => {
      t.assignees?.forEach((a) => {
        if (!map.has(a.id)) {
          map.set(a.id, a);
        }
      });
    });
    return Array.from(map.values());
  }, [projectTasks]);

  const project = rawProject
    ? {
        id: rawProject.id,
        name: rawProject.name,
        description: rawProject.description || "Açıklama belirtilmemiş.",
        members: projectMembers,
      }
    : null;

  const createTaskMutation = useMutation({
    mutationFn: (newTask: TaskPayload) => tasksApi.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setShowTaskModal(false);
      setEditingTask(null);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: TaskPayload }) =>
      tasksApi.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setSelectedTask(null);
      setDeletingTask(null);
    },
  });

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
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      status: taskModalStatus,
      priority: newTask.priority,
      project: Number(projectId),
      unit: newTask.unit?.id,
      assignees: newTask.assignees?.map((a) => a.id),
      due_date: newTask.due_date,
    });
  }

  function handleUpdateTask(
    updatedTask: Task,
  ) {
    updateTaskMutation.mutate({
      id: updatedTask.id,
      updates: {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        project: updatedTask.project?.id || Number(projectId),
        unit: updatedTask.unit?.id,
        assignees: updatedTask.assignees?.map((a) => a.id),
        due_date: updatedTask.due_date,
      },
    });
    setSelectedTask(updatedTask);
    setEditingTask(null);
    setShowTaskModal(false);
  }

  function handleDeleteTask(
    taskToDelete: Task,
  ) {
    deleteTaskMutation.mutate(taskToDelete.id);
  }

  if (isProjectsLoading) {
    return (
      <section className="project-detail-page">
        <div style={{ padding: "40px", color: "var(--text-secondary)" }}>
          Proje yükleniyor...
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="project-detail-page">
        <h2>
          Proje bulunamadı.
        </h2>
        <p style={{ marginTop: "12px" }}>
          <button
            type="button"
            className="project-back-button"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft size={16} /> Projelere Dön
          </button>
        </p>
      </section>
    );
  }

  /* =========================
     ORDER HELPERS
  ========================= */

  function normalizeColumnOrders(
    taskList: Task[],
    status: TaskStatus,
  ) {
    if (!project) {
      return taskList;
    }
    const currentProject = project;

    const columnTasks =
      taskList
        .filter(
          (task) =>
            (task.project?.id === currentProject.id || task.project?.name === currentProject.name) &&
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
          (task.project?.id !== currentProject.id && task.project?.name !== currentProject.name) ||
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
    if (!project) {
      return taskList;
    }
    const currentProject = project;

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
            (task.project?.id === currentProject.id || task.project?.name === currentProject.name) &&
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
            (task.project?.id !== currentProject.id && task.project?.name !== currentProject.name) ||
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
    if (!project) {
      return;
    }
    const currentProject = project;

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
        (movingTask.project?.id !== currentProject.id &&
          movingTask.project?.name !== currentProject.name)
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
          overTask?.project?.id !== currentProject.id &&
          overTask?.project?.name !== currentProject.name
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
              (task.project?.id === currentProject.id ||
                task.project?.name === currentProject.name) &&
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
    if (!project) {
      return;
    }

    const { over, active } =
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

    const activeId = Number(active.id);

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

      const movedTask = result.find((task) => task.id === activeId);
      const originalTask = dragSnapshot.current?.find((task) => task.id === activeId);

      if (
        movedTask &&
        (!originalTask ||
          originalTask.status !== movedTask.status ||
          originalTask.order !== movedTask.order)
      ) {
        updateTaskMutation.mutate({
          id: movedTask.id,
          updates: {
            status: movedTask.status,
            order: movedTask.order,
            project: movedTask.project?.id || Number(projectId),
          },
        });
      }

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
                      key={member.id}
                      title={member.name}
                    >
                      {member.initials}
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
                  {project.members.length > 0 ? (
                    project.members.map(
                      (member) => (
                        <div
                          className="member-item"
                          key={member.id}
                        >
                          <span className="member-avatar">
                            {member.initials}
                          </span>

                          <div>
                            <strong>
                              {member.name}
                            </strong>

                            <span>
                              Proje üyesi
                            </span>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <div style={{ padding: "12px", color: "var(--text-secondary)", fontSize: "13px" }}>
                      Bu projeye atanmış üye bulunmuyor.
                    </div>
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