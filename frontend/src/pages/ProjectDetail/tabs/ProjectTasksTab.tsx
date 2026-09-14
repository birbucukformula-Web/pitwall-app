import { useState, useRef } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, type TaskPayload } from "../../../api/tasks";
import type { Task, TaskStatus } from "../../../types/task";

import KanbanColumn from "../../../components/KanbanColumn/KanbanColumn";
import TaskDrawer from "../../../components/TaskDrawer/TaskDrawer";
import TaskModal from "../../../components/TaskModal/TaskModal";
import DeleteTaskModal from "../../../components/DeleteTaskModal/DeleteTaskModal";
import TaskCard from "../../../components/TaskCard/TaskCard";

const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done"];

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    const taskCollisions = pointerCollisions.filter(
      (collision) => !String(collision.id).startsWith("column:")
    );
    if (taskCollisions.length > 0) {
      return taskCollisions;
    }
    return pointerCollisions;
  }
  return closestCenter(args);
};

interface Props {
  projectId: number;
  project: any;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function ProjectTasksTab({ projectId, project, tasks, setTasks }: Props) {
  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalStatus, setTaskModalStatus] = useState<TaskStatus>("todo");

  const lastOverId = useRef<string | null>(null);
  const dragSnapshot = useRef<Task[] | null>(null);

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
    })
  );

  function normalizeColumnOrders(taskList: Task[], status: TaskStatus) {
    const columnTasks = taskList
      .filter(
        (task) =>
          (task.project?.id === project.id || task.project?.name === project.name) &&
          task.status === status
      )
      .sort((a, b) => a.order - b.order);

    const orderMap = new Map<number, number>();
    columnTasks.forEach((task, index) => {
      orderMap.set(task.id, index + 1);
    });

    return taskList.map((task) => {
      if (
        (task.project?.id !== project.id && task.project?.name !== project.name) ||
        task.status !== status
      ) {
        return task;
      }
      return { ...task, order: orderMap.get(task.id) ?? task.order };
    });
  }

  function moveTaskToColumn(taskList: Task[], taskId: number, targetStatus: TaskStatus, targetIndex: number) {
    const movingTask = taskList.find((task) => task.id === taskId);
    if (!movingTask) return taskList;

    const sourceStatus = movingTask.status;
    const withoutMovingTask = taskList.filter((task) => task.id !== taskId);
    const targetTasks = withoutMovingTask
      .filter(
        (task) =>
          (task.project?.id === project.id || task.project?.name === project.name) &&
          task.status === targetStatus
      )
      .sort((a, b) => a.order - b.order);

    const safeIndex = Math.max(0, Math.min(targetIndex, targetTasks.length));
    const movedTask: Task = { ...movingTask, status: targetStatus };
    targetTasks.splice(safeIndex, 0, movedTask);

    const orderMap = new Map<number, number>();
    targetTasks.forEach((task, index) => {
      orderMap.set(task.id, index + 1);
    });

    let result = withoutMovingTask.map((task) => {
      if (
        (task.project?.id !== project.id && task.project?.name !== project.name) ||
        task.status !== targetStatus
      ) {
        return task;
      }
      return { ...task, order: orderMap.get(task.id) ?? task.order };
    });

    result.push({ ...movedTask, order: orderMap.get(movedTask.id) ?? 1 });

    if (sourceStatus !== targetStatus) {
      result = normalizeColumnOrders(result, sourceStatus);
    }
    return normalizeColumnOrders(result, targetStatus);
  }

  function handleDragStart(event: DragStartEvent) {
    dragSnapshot.current = tasks.map((task) => ({ ...task }));
    lastOverId.current = null;
    const taskId = Number(event.active.id);
    const task = tasks.find((item) => item.id === taskId) ?? null;
    setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = String(over.id);

    setTasks((previousTasks) => {
      const movingTask = previousTasks.find((task) => task.id === activeId);
      if (
        !movingTask ||
        (movingTask.project?.id !== project.id && movingTask.project?.name !== project.name)
      ) {
        return previousTasks;
      }

      let targetStatus: TaskStatus | null = null;
      if (overId.startsWith("column:")) {
        targetStatus = overId.replace("column:", "") as TaskStatus;
      } else {
        const overTask = previousTasks.find((task) => task.id === Number(over.id));
        if (!overTask) {
          return previousTasks;
        }
        if (overTask.unit?.id !== project.id && overTask.unit?.name !== project.name) {
          return previousTasks;
        }
        targetStatus = overTask.status;
      }

      if (!targetStatus || !VALID_STATUSES.includes(targetStatus)) {
        return previousTasks;
      }
      if (movingTask.status === targetStatus) {
        return previousTasks;
      }

      const targetTasks = previousTasks
        .filter(
          (task) =>
            (task.project?.id === project.id || task.project?.name === project.name) &&
            task.status === targetStatus &&
            task.id !== activeId
        )
        .sort((a, b) => a.order - b.order);

      let targetIndex = targetTasks.length;

      if (!overId.startsWith("column:")) {
        const overIndex = targetTasks.findIndex((task) => task.id === Number(over.id));
        if (overIndex !== -1) {
          const translated = active.rect.current.translated;
          const isBelow = translated
            ? translated.top + translated.height / 2 > over.rect.top + over.rect.height / 2
            : false;
          targetIndex = overIndex + (isBelow ? 1 : 0);
        }
      }

      return moveTaskToColumn(previousTasks, activeId, targetStatus, targetIndex);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event;
    setActiveTask(null);
    lastOverId.current = null;

    if (!over) {
      if (dragSnapshot.current) {
        setTasks(dragSnapshot.current);
      }
      dragSnapshot.current = null;
      return;
    }

    const activeId = Number(active.id);
    setTasks((previousTasks) => {
      let result = previousTasks;
      VALID_STATUSES.forEach((status) => {
        result = normalizeColumnOrders(result, status);
      });

      const movedTask = result.find((task: Task) => task.id === activeId);
      const originalTask = dragSnapshot.current?.find((task: Task) => task.id === activeId);

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

    dragSnapshot.current = null;
  }

  function handleDragCancel() {
    setActiveTask(null);
    if (dragSnapshot.current) {
      setTasks(dragSnapshot.current);
    }
    dragSnapshot.current = null;
  }

  function openTaskModal(status: TaskStatus) {
    setEditingTask(null);
    setTaskModalStatus(status);
    setShowTaskModal(true);
  }

  function openEditTaskModal(task: Task) {
    setEditingTask(task);
    setShowTaskModal(true);
  }

  function handleCreateTask(newTask: Task) {
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      status: taskModalStatus,
      priority: newTask.priority,
      unit: Number(projectId),
      assignees: newTask.assignees?.map((a: any) => a.id),
      due_date: newTask.due_date,
    });
  }

  function handleUpdateTask(updatedTask: Task) {
    updateTaskMutation.mutate({
      id: updatedTask.id,
      updates: {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        unit: Number(projectId),
        assignees: updatedTask.assignees?.map((a: any) => a.id),
        due_date: updatedTask.due_date,
      },
    });
    setSelectedTask(updatedTask);
    setEditingTask(null);
    setShowTaskModal(false);
  }

  function handleDeleteTask(taskToDelete: Task) {
    deleteTaskMutation.mutate(taskToDelete.id);
  }

  const projectTasks = tasks.sort((a, b) => a.order - b.order);

  return (
    <div className="tab-pane active fade-in">
      <DndContext
        sensors={sensors}
        collisionDetection={kanbanCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="kanban">
          <KanbanColumn
            title="Yapılacak"
            status="todo"
            tasks={projectTasks}
            onTaskClick={setSelectedTask}
            onAddTask={() => openTaskModal("todo")}
          />
          <KanbanColumn
            title="Devam Ediyor"
            status="in_progress"
            tasks={projectTasks}
            onTaskClick={setSelectedTask}
            onAddTask={() => openTaskModal("in_progress")}
          />
          <KanbanColumn
            title="İncelemede"
            status="review"
            tasks={projectTasks}
            onTaskClick={setSelectedTask}
            onAddTask={() => openTaskModal("review")}
          />
          <KanbanColumn
            title="Tamamlandı"
            status="done"
            tasks={projectTasks}
            onTaskClick={setSelectedTask}
            onAddTask={() => openTaskModal("done")}
          />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="drag-overlay-wrapper">
              <TaskCard task={activeTask} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
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
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        defaultStatus={taskModalStatus}
        editingTask={editingTask}
      />
    </div>
  );
}
