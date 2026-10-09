
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import TaskDrawer from "../../components/TaskDrawer/TaskDrawer";
import TaskModal from "../../components/TaskModal/TaskModal";
import { tasksApi, type TaskPayload } from "../../api/tasks";
import type { Task } from "../../types/task";

import "./Calendar.css";

const WEEK_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

type CalendarView = "month" | "week";

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  todo: "Yapılacak",
  in_progress: "Devam Ediyor",
  review: "İncelemede",
  done: "Tamamlandı",
};

function getDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseTaskDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const [year, month, day] = value
    .split("T")[0]
    .split("-")
    .map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function createCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const firstDayIndex = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - firstDayIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function getWeekDays(date: Date): Date[] {
  const currentDay = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - currentDay);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

function isDateBetween(
  date: Date,
  startStr: string | null | undefined,
  dueStr: string | null | undefined
): boolean {
  const end = parseTaskDate(dueStr);
  if (!end) return false;

  const start = parseTaskDate(startStr) ?? end;

  const current = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return current >= start && current <= end;
}

function isToday(date: Date): boolean {
  return getDateKey(date) === getDateKey(new Date());
}

function formatSelectedDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getTasks(),
  });

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
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: TaskPayload;
    }) => tasksApi.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setShowTaskModal(false);
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setSelectedTask(null);
    },
  });

  const calendarDays = useMemo(
    () =>
      createCalendarDays(
        currentDate.getFullYear(),
        currentDate.getMonth()
      ),
    [currentDate]
  );

  const weekDays = useMemo(
    () => getWeekDays(currentDate),
    [currentDate]
  );


  const expandedDayTasks = useMemo(() => {
    if (!expandedDay) return [];

    return tasks
      .filter((task) =>
        isDateBetween(
          expandedDay,
          task.start_date,
          task.due_date
        )
      )
      .sort((a, b) => a.id - b.id);
  }, [expandedDay, tasks]);


  function previousPeriod() {
    setCurrentDate((date) => {
      if (view === "month") {
        return new Date(
          date.getFullYear(),
          date.getMonth() - 1,
          1
        );
      }

      const next = new Date(date);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }

  function nextPeriod() {
    setCurrentDate((date) => {
      if (view === "month") {
        return new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          1
        );
      }

      const next = new Date(date);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }

  function goToToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }

  function selectDay(date: Date) {
    setSelectedDate(date);
    setCurrentDate(date);
  }

  function openTask(task: Task) {
    setExpandedDay(null);
    setSelectedTask(task);
  }

  function handleCreateTask(newTask: Task) {
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      project: newTask.project?.id,
      unit: newTask.unit?.id,
      assignees: newTask.assignees?.map((assignee) => assignee.id),
      start_date: newTask.start_date || null,
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
        project: updatedTask.project?.id,
        unit: updatedTask.unit?.id,
        assignees: updatedTask.assignees?.map(
          (assignee) => assignee.id
        ),
        start_date: updatedTask.start_date || null,
        due_date: updatedTask.due_date,
      },
    });
  }

  function renderCalendarDay(
    date: Date,
    isCurrentMonth: boolean,
    isWeekView: boolean
  ) {
    const dayTasks = tasks
      .filter((task) =>
        isDateBetween(date, task.start_date, task.due_date)
      )
      .sort((a, b) => a.id - b.id);

    const selected =
      getDateKey(date) === getDateKey(selectedDate);

    const visibleTasks = dayTasks.slice(0, 2);
    const remainingCount = dayTasks.length - 2;

    return (
      <div
        key={getDateKey(date)}
        className={[
          isWeekView ? "week-day" : "calendar-day",
          !isCurrentMonth ? "other-month" : "",
          selected ? "selected-day" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          className={
            isWeekView
              ? "calendar-day-select week-day-header"
              : "calendar-day-select day-number-row"
          }
          onClick={() => selectDay(date)}
          aria-label={`${formatSelectedDate(date)}, ${dayTasks.length} görev`}
          aria-pressed={selected}
        >
          <span
            className={[
              isWeekView ? "week-day-number" : "day-number",
              isToday(date) ? "today" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {date.getDate()}
          </span>
        </button>

        <div className="day-tasks">
          {visibleTasks.map((task) => (
            <button
              type="button"
              key={task.id}
              className={`calendar-task calendar-task-${task.status}`}
              title={task.title}
              onClick={() => {
                setSelectedDate(date);
                openTask(task);
              }}
            >
              <span
                className="calendar-task-dot"
                aria-hidden="true"
              />

              <span className="calendar-task-title">
                {task.title}
              </span>
            </button>
          ))}

          {remainingCount > 0 && (
            <button
              type="button"
              className="calendar-more-tasks"
              onClick={() => {
                setSelectedDate(date);
                setExpandedDay(date);
              }}
              title={`${remainingCount} görev daha`}
            >
              +{remainingCount} görev
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="calendar-page">
        <div className="calendar-page-header">
          <p className="calendar-page-description">
            Görevlerini ve teslim tarihlerini takvim üzerinden takip et.
          </p>

          <button
            type="button"
            className="calendar-new-task"
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }}
          >
            <Plus size={18} />
            Yeni Görev
          </button>
        </div>

        <div className="calendar-container">
          <div className="calendar-toolbar">
            <div className="calendar-navigation">
              <button
                type="button"
                className="today-button"
                onClick={goToToday}
              >
                Bugün
              </button>

              <div className="month-buttons">
                <button
                  type="button"
                  onClick={previousPeriod}
                  aria-label="Önceki dönem"
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  type="button"
                  onClick={nextPeriod}
                  aria-label="Sonraki dönem"
                >
                  <ChevronRight size={19} />
                </button>
              </div>

              <h3>
                {MONTHS[currentDate.getMonth()]}{" "}
                {currentDate.getFullYear()}
              </h3>
            </div>

            <div className="calendar-view-switch">
              <button
                type="button"
                className={view === "month" ? "active" : ""}
                onClick={() => setView("month")}
              >
                Ay
              </button>

              <button
                type="button"
                className={view === "week" ? "active" : ""}
                onClick={() => setView("week")}
              >
                Hafta
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {view === "month"
              ? WEEK_DAYS.map((day) => (
                <div key={day}>{day}</div>
              ))
              : weekDays.map((date, index) => (
                <div key={getDateKey(date)}>
                  {WEEK_DAYS[index]} {date.getDate()}
                </div>
              ))}
          </div>

          {view === "month" ? (
            <div className="calendar-grid">
              {calendarDays.map(
                ({ date, isCurrentMonth }) =>
                  renderCalendarDay(
                    date,
                    isCurrentMonth,
                    false
                  )
              )}
            </div>
          ) : (
            <div className="week-grid">
              {weekDays.map((date) =>
                renderCalendarDay(date, true, true)
              )}
            </div>
          )}
        </div>
      </section>

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={(task) => {
          setSelectedTask(null);
          setEditingTask(task);
          setShowTaskModal(true);
        }}
        onDelete={(task) => {
          deleteTaskMutation.mutate(task.id);
        }}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        editingTask={editingTask}
        defaultStatus="todo"
      />


      {expandedDay && (
        <div
          className="calendar-day-list-overlay"
          onClick={() => setExpandedDay(null)}
        >
          <section
            className="calendar-day-list-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${formatSelectedDate(expandedDay)} görevleri`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="calendar-day-list-header">
              <div className="calendar-day-list-heading">
                <span className="calendar-day-list-eyebrow">
                  Seçilen gün
                </span>

                <h3>{formatSelectedDate(expandedDay)}</h3>
              </div>

              <div className="calendar-day-list-header-actions">
                <span className="calendar-day-list-count">
                  {expandedDayTasks.length} görev
                </span>

                <button
                  type="button"
                  className="calendar-day-list-close"
                  aria-label="Kapat"
                  onClick={() => setExpandedDay(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="calendar-day-list-items">
              {expandedDayTasks.map((task) => (
                <button
                  type="button"
                  key={task.id}
                  className={`calendar-day-list-item calendar-day-list-${task.status}`}
                  onClick={() => openTask(task)}
                >
                  <div className="calendar-day-list-task-info">
                    <span className="calendar-day-list-task-title">
                      {task.title}
                    </span>

                    <span className="calendar-day-list-task-project">
                      {task.project?.name || "Proje belirtilmemiş"}
                    </span>
                  </div>

                  <span className="calendar-day-list-task-status">
                    {STATUS_LABELS[task.status] ?? task.status}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

    </>
  );
}
