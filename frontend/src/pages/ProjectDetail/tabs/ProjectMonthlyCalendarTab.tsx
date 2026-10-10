
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import TaskDrawer from "../../../components/TaskDrawer/TaskDrawer";
import type { Task, TaskStatus } from "../../../types/task";

import "./ProjectMonthlyCalendarTab.css";

interface Props {
  project: {
    name: string;
  };
  tasks: Task[];
}

type CalendarView = "month" | "week";

const WEEK_DAYS = [
  "Pzt",
  "Sal",
  "Çar",
  "Per",
  "Cum",
  "Cmt",
  "Paz",
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Yapılacak",
  in_progress: "Devam Ediyor",
  review: "İncelemede",
  done: "Tamamlandı",
};

// Masaüstü ve mobil: en fazla 2 görev
const VISIBLE_TASK_LIMIT = 2;

function normalizeDate(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function parseDate(
  value: string | null | undefined
): Date | null {
  if (!value) return null;

  const datePart = value.split("T")[0];
  const match = datePart.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? null
    : normalizeDate(parsed);
}

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b);
}

function getMonday(date: Date): Date {
  const monday = normalizeDate(date);
  const dayIndex = (monday.getDay() + 6) % 7;

  monday.setDate(monday.getDate() - dayIndex);

  return monday;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function taskOccursOnDay(
  task: Task,
  date: Date
): boolean {
  const end = parseDate(task.due_date);
  if (!end) return false;

  const start = parseDate(task.start_date) ?? end;
  const current = normalizeDate(date);

  return current >= start && current <= end;
}

function taskOverlapsPeriod(
  task: Task,
  startDate: Date,
  endDate: Date
): boolean {
  const end = parseDate(task.due_date);
  if (!end) return false;

  const start = parseDate(task.start_date) ?? end;

  return end >= startDate && start <= endDate;
}

function formatSelectedDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(date);
}

export default function ProjectMonthlyCalendarTab({
  project,
  tasks,
}: Props) {
  const [currentDate, setCurrentDate] = useState(
    () => new Date()
  );

  const [calendarView, setCalendarView] =
    useState<CalendarView>("month");

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [selectedTaskId, setSelectedTaskId] =
    useState<number | null>(null);

  const today = useMemo(
    () => normalizeDate(new Date()),
    []
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;

    const start = new Date(
      year,
      month,
      1 - offset
    );

    return Array.from(
      { length: 42 },
      (_, index) => addDays(start, index)
    );
  }, [year, month]);

  const weekDays = useMemo(() => {
    const monday = getMonday(currentDate);

    return Array.from(
      { length: 7 },
      (_, index) => addDays(monday, index)
    );
  }, [currentDate]);

  const visibleDays =
    calendarView === "month"
      ? monthDays
      : weekDays;

  const toolbarLabel = useMemo(() => {
    if (calendarView === "month") {
      return new Intl.DateTimeFormat("tr-TR", {
        month: "long",
        year: "numeric",
      }).format(currentDate);
    }

    const formatter = new Intl.DateTimeFormat(
      "tr-TR",
      {
        day: "numeric",
        month: "short",
      }
    );

    return `${formatter.format(
      weekDays[0]
    )} – ${formatter.format(weekDays[6])}`;
  }, [calendarView, currentDate, weekDays]);

  const visibleTaskCount = useMemo(() => {
    const periodStart =
      calendarView === "month"
        ? new Date(year, month, 1)
        : weekDays[0];

    const periodEnd =
      calendarView === "month"
        ? new Date(year, month + 1, 0)
        : weekDays[6];

    return tasks.filter((task) =>
      taskOverlapsPeriod(
        task,
        periodStart,
        periodEnd
      )
    ).length;
  }, [
    tasks,
    calendarView,
    year,
    month,
    weekDays,
  ]);

  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];

    return tasks
      .filter((task) =>
        taskOccursOnDay(task, selectedDate)
      )
      .sort((a, b) => a.id - b.id);
  }, [tasks, selectedDate]);

  const selectedTask =
    tasks.find(
      (task) => task.id === selectedTaskId
    ) ?? null;

  function changePeriod(direction: -1 | 1) {
    setCurrentDate((previous) => {
      if (calendarView === "month") {
        return new Date(
          previous.getFullYear(),
          previous.getMonth() + direction,
          1
        );
      }

      return addDays(previous, direction * 7);
    });

    setSelectedDate(null);
    setSelectedTaskId(null);
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(null);
    setSelectedTaskId(null);
  }

  function changeView(view: CalendarView) {
    setCalendarView(view);
    setSelectedDate(null);
    setSelectedTaskId(null);
  }

  function selectDay(date: Date) {
    setSelectedDate(date);
  }

  function openTask(taskId: number) {
    setSelectedDate(null);
    setSelectedTaskId(taskId);
  }

  function closeTask() {
    setSelectedTaskId(null);
  }

  useEffect(() => {
    if (!selectedDate) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedDate(null);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [selectedDate]);

  return (
    <div
      className={`monthly-calendar-tab tab-pane active fade-in ${
        calendarView === "week"
          ? "week-view"
          : "month-view"
      }`}
    >
      <div className="monthly-calendar-header">
        <div>
          <h3>{project.name} Takvimi</h3>

          <p>
            Birimin görevlerini aylık ve haftalık
            takvim üzerinde görüntüle.
          </p>
        </div>

        <div className="monthly-calendar-summary">
          <CalendarDays size={15} />
          <span>{visibleTaskCount} görev</span>
        </div>
      </div>

      <div className="monthly-calendar-card">
        <div className="monthly-calendar-toolbar">
          <div className="monthly-calendar-navigation">
            <button
              type="button"
              className="calendar-today-button"
              onClick={goToToday}
            >
              Bugün
            </button>

            <div className="calendar-arrow-group">
              <button
                type="button"
                className="calendar-nav-button"
                onClick={() => changePeriod(-1)}
                aria-label="Önceki dönem"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                className="calendar-nav-button"
                onClick={() => changePeriod(1)}
                aria-label="Sonraki dönem"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="monthly-calendar-toolbar-right">
            <h4>{toolbarLabel}</h4>

            <div className="calendar-view-switch">
              <button
                type="button"
                className={
                  calendarView === "month"
                    ? "active"
                    : ""
                }
                onClick={() => changeView("month")}
              >
                Ay
              </button>

              <button
                type="button"
                className={
                  calendarView === "week"
                    ? "active"
                    : ""
                }
                onClick={() => changeView("week")}
              >
                Hafta
              </button>
            </div>
          </div>
        </div>

        <div className="monthly-calendar">
          <div className="monthly-calendar-weekdays">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="calendar-weekday"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="monthly-calendar-grid">
            {visibleDays.map((date) => {
              const dayTasks = tasks
                .filter((task) =>
                  taskOccursOnDay(task, date)
                )
                .sort((a, b) => a.id - b.id);

              // Hem web hem mobil: ilk 2 görev
              const displayedTasks = dayTasks.slice(
                0,
                VISIBLE_TASK_LIMIT
              );

              // Kalan görev sayısı
              const remainingCount = Math.max(
                0,
                dayTasks.length - VISIBLE_TASK_LIMIT
              );

              const isOutside =
                calendarView === "month" &&
                date.getMonth() !== month;

              const isToday = isSameDay(date, today);

              const isSelected =
                selectedDate !== null &&
                isSameDay(date, selectedDate);

              return (
                <div
                  key={dateKey(date)}
                  className={[
                    "calendar-day-cell",
                    isOutside ? "outside-month" : "",
                    isToday ? "today" : "",
                    isSelected ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => selectDay(date)}
                >
                  <div className="calendar-day-header">
                    <button
                      type="button"
                      className="calendar-day-number"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectDay(date);
                      }}
                      aria-label={`${formatSelectedDate(
                        date
                      )} gününü seç`}
                    >
                      {date.getDate()}
                    </button>
                  </div>

                  {/* MASAÜSTÜ GÖREVLER */}

                  <div className="calendar-day-tasks desktop-day-tasks">
                    {displayedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="calendar-task-wrapper"
                      >
                        <button
                          type="button"
                          className={`calendar-task ${task.status}`}
                          title={task.title}
                          onClick={(event) => {
                            event.stopPropagation();
                            openTask(task.id);
                          }}
                        >
                          <span className="calendar-task-dot" />

                          <span className="calendar-task-title">
                            {task.title}
                          </span>
                        </button>
                      </div>
                    ))}

                    {remainingCount > 0 && (
                      <button
                        type="button"
                        className="calendar-more-tasks"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectDay(date);
                        }}
                      >
                        +{remainingCount} görev
                      </button>
                    )}
                  </div>

                  {/* MOBİL GÖREVLER */}

                  <div className="mobile-day-tasks">
                    {displayedTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        className={`calendar-task ${task.status}`}
                        title={task.title}
                        onClick={(event) => {
                          event.stopPropagation();
                          openTask(task.id);
                        }}
                      >
                        <span className="calendar-task-dot" />

                        <span className="calendar-task-title">
                          {task.title}
                        </span>
                      </button>
                    ))}

                    {remainingCount > 0 && (
                      <button
                        type="button"
                        className="mobile-more-tasks"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectDay(date);
                        }}
                      >
                        +{remainingCount}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GÜNLÜK GÖREV PENCERESİ */}

      {selectedDate && (
        <div
          className="calendar-day-modal-overlay"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="calendar-day-modal"
            role="dialog"
            aria-modal="true"
            aria-label={formatSelectedDate(selectedDate)}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="calendar-selected-day-heading">
              <div>
                <span className="calendar-selected-day-label">
                  Seçilen gün
                </span>

                <h4>
                  {formatSelectedDate(selectedDate)}
                </h4>
              </div>

              <div className="calendar-selected-day-actions">
                <span className="calendar-selected-day-count">
                  {selectedDayTasks.length} görev
                </span>

                <button
                  type="button"
                  className="calendar-selected-day-close"
                  onClick={() => setSelectedDate(null)}
                  aria-label="Kapat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {selectedDayTasks.length === 0 ? (
              <p className="calendar-selected-day-empty">
                Bu gün için görev bulunmuyor.
              </p>
            ) : (
              <div className="calendar-selected-day-list">
                {selectedDayTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className={`calendar-selected-task ${task.status}`}
                    onClick={() => openTask(task.id)}
                  >
                    <div className="calendar-selected-task-info">
                      <strong>{task.title}</strong>
                      <span>{project.name}</span>
                    </div>

                    <span className="calendar-selected-task-status">
                      {STATUS_LABELS[task.status]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAĞDAN AÇILAN GÖREV PANELİ */}

      <TaskDrawer
        task={selectedTask}
        onClose={closeTask}
      />
    </div>
  );
}
