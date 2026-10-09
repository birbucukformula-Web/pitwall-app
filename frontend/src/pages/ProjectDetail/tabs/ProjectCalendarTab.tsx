
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import TaskDrawer from "../../../components/TaskDrawer/TaskDrawer";

import type { Task, TaskStatus } from "../../../types/task";

import "./ProjectCalendarTab.css";

interface Props {
  project: { name: string };
  tasks: Task[];
}

type TimelineTask = Task & {
  start: Date;
  end: Date;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Yapılacak",
  in_progress: "Devam Ediyor",
  review: "İncelemede",
  done: "Tamamlandı",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

const MOBILE_DAY_COUNT = 7;

function normalizeDate(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function parseDate(value: string): Date {
  const datePart = value.slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return normalizeDate(new Date(value));
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return normalizeDate(next);
}

function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status] ?? status;
}

function getPriorityLabel(
  priority: Task["priority"]
): string {
  return (
    PRIORITY_LABELS[String(priority)] ??
    "Belirtilmemiş"
  );
}



export default function ProjectCalendarTab({
  project,
  tasks,
}: Props) {
  const today = useMemo(
    () => normalizeDate(new Date()),
    []
  );

  const [selectedTaskId, setSelectedTaskId] =
    useState<number | null>(null);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ??
    null;

  const timelineTasks = useMemo<TimelineTask[]>(() => {
    return tasks
      .filter((task) => Boolean(task.due_date))
      .map((task) => {
        const end = parseDate(
          String(task.due_date)
        );

        const start = task.start_date
          ? parseDate(String(task.start_date))
          : new Date(end);

        return {
          ...task,
          start,
          end,
        };
      })
      .filter(
        (task) =>
          !Number.isNaN(task.start.getTime()) &&
          !Number.isNaN(task.end.getTime()) &&
          task.start <= task.end
      )
      .sort(
        (a, b) =>
          a.start.getTime() - b.start.getTime()
      );
  }, [tasks]);

  /*
   * DESKTOP GANTT
   */

  const referenceDate =
    timelineTasks[0]?.start ?? today;

  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const monthName = formatMonth(
    new Date(year, month, 1)
  );

  const days = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
  );

  const isCurrentMonth =
    today.getFullYear() === year &&
    today.getMonth() === month;

  const todayDay = isCurrentMonth
    ? today.getDate()
    : null;

  const monthStart = new Date(
    year,
    month,
    1
  );

  const monthEnd = new Date(
    year,
    month,
    daysInMonth
  );

  function getDayInfo(day: number) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    return {
      isWeekend:
        dayOfWeek === 0 || dayOfWeek === 6,
      isMonday: dayOfWeek === 1,
    };
  }

  function getTaskPosition(task: TimelineTask) {
    const visibleStart =
      task.start < monthStart
        ? monthStart
        : task.start;

    const visibleEnd =
      task.end > monthEnd
        ? monthEnd
        : task.end;

    const startDay = visibleStart.getDate();
    const endDay = visibleEnd.getDate();

    return {
      left: `${
        ((startDay - 1) / daysInMonth) * 100
      }%`,
      width: `${
        (Math.max(
          endDay - startDay + 1,
          1
        ) /
          daysInMonth) *
        100
      }%`,
    };
  }

  const visibleTasks = timelineTasks.filter(
    (task) =>
      task.end >= monthStart &&
      task.start <= monthEnd
  );

  /*
   * MOBILE GANTT
   */

  const [mobileStartDate, setMobileStartDate] =
    useState<Date>(() =>
      normalizeDate(
        timelineTasks[0]?.start ?? new Date()
      )
    );

  const mobileDays = useMemo(
    () =>
      Array.from(
        { length: MOBILE_DAY_COUNT },
        (_, index) =>
          addDays(mobileStartDate, index)
      ),
    [mobileStartDate]
  );

  const mobileEndDate =
    mobileDays[mobileDays.length - 1] ??
    mobileStartDate;

  const mobileVisibleTasks =
    timelineTasks.filter(
      (task) =>
        task.end >= mobileStartDate &&
        task.start <= mobileEndDate
    );

  const mobileMonthName =
    formatMonth(mobileStartDate);

  function previousMobileWindow() {
    setMobileStartDate((current) =>
      addDays(current, -MOBILE_DAY_COUNT)
    );
  }

  function nextMobileWindow() {
    setMobileStartDate((current) =>
      addDays(current, MOBILE_DAY_COUNT)
    );
  }

  function openTask(taskId: number) {
    setSelectedTaskId(taskId);
  }

  function closeTask() {
    setSelectedTaskId(null);
  }

  return (
    <div className="project-calendar-tab tab-pane active fade-in">
      <div className="project-calendar-header">
        <div>
          <h3>
            {project.name} Gantt Çizelgesi
          </h3>

          <p>
            Görevlerin başlangıç ve teslim
            tarihlerini zaman çizelgesinde
            görüntüle.
          </p>
        </div>
      </div>

      {/* DESKTOP GANTT */}

      <div className="gantt-desktop">
        {visibleTasks.length === 0 ? (
          <div className="gantt-empty">
            <CalendarDays size={30} />

            <strong>
              Bu ay için planlanmış görev
              bulunmuyor.
            </strong>

            <span>
              Başlangıç ve teslim tarihi
              bulunan görevler burada
              görüntülenecek.
            </span>
          </div>
        ) : (
          <div className="gantt-card">
            <div className="gantt-toolbar">
              <span className="gantt-month">
                {monthName}
              </span>

              <span className="gantt-task-count">
                {visibleTasks.length} görev
              </span>
            </div>

            <div className="gantt-scroll">
              <div className="gantt-table">
                <div className="gantt-head">
                  <div className="gantt-task-column gantt-task-column-head">
                    Görev
                  </div>

                  <div
                    className="gantt-days"
                    style={{
                      gridTemplateColumns:
                        `repeat(${daysInMonth}, minmax(28px, 1fr))`,
                    }}
                  >
                    {days.map((day) => {
                      const {
                        isWeekend,
                        isMonday,
                      } = getDayInfo(day);

                      return (
                        <div
                          key={day}
                          className={[
                            "gantt-day",
                            isWeekend
                              ? "weekend"
                              : "",
                            isMonday
                              ? "week-start"
                              : "",
                            todayDay === day
                              ? "today"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <span className="gantt-day-number">
                            {day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="gantt-body">
                  {visibleTasks.map((task) => {
                    const position =
                      getTaskPosition(task);

                    return (
                      <div
                        className="gantt-row"
                        key={task.id}
                      >
                        <div className="gantt-task-column">
                          <div
                            className={`gantt-status-dot ${task.status}`}
                          />

                          <div className="gantt-task-info">
                            <strong>
                              {task.title}
                            </strong>

                            <span>
                              {formatDate(task.start)}
                              {" – "}
                              {formatDate(task.end)}
                            </span>
                          </div>
                        </div>

                        <div
                          className="gantt-track"
                          style={{
                            gridTemplateColumns:
                              `repeat(${daysInMonth}, minmax(28px, 1fr))`,
                          }}
                        >
                          {days.map((day) => {
                            const {
                              isWeekend,
                              isMonday,
                            } = getDayInfo(day);

                            return (
                              <div
                                key={day}
                                className={[
                                  "gantt-grid-cell",
                                  isWeekend
                                    ? "weekend"
                                    : "",
                                  isMonday
                                    ? "week-start"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              />
                            );
                          })}

                          <button
                            type="button"
                            className={`gantt-bar ${task.status}`}
                            style={position}
                            onClick={() =>
                              openTask(task.id)
                            }
                            aria-label={`${task.title} görev detayını aç`}
                          >
                            <span className="gantt-bar-label">
                              {task.title}
                            </span>

                            <div className="gantt-tooltip">
                              <div className="gantt-tooltip-header">
                                <span
                                  className={`gantt-tooltip-dot ${task.status}`}
                                />

                                <strong>
                                  {task.title}
                                </strong>
                              </div>

                              <span className="gantt-tooltip-status">
                                {getStatusLabel(
                                  task.status
                                )}
                              </span>

                              <div className="gantt-tooltip-divider" />

                              <div className="gantt-tooltip-row">
                                <span>
                                  Tarih
                                </span>

                                <strong>
                                  {formatDate(task.start)}
                                  {" – "}
                                  {formatDate(task.end)}
                                </strong>
                              </div>

                              <div className="gantt-tooltip-row">
                                <span>
                                  Öncelik
                                </span>

                                <strong>
                                  {getPriorityLabel(
                                    task.priority
                                  )}
                                </strong>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="gantt-legend">
              {(
                Object.keys(
                  STATUS_LABELS
                ) as TaskStatus[]
              ).map((status) => (
                <div
                  className="gantt-legend-item"
                  key={status}
                >
                  <i
                    className={`gantt-legend-dot ${status}`}
                  />

                  <span>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE GANTT */}

      <div className="mobile-gantt">
        <div className="mobile-schedule">
          <div className="mobile-schedule-top">
            <div className="mobile-schedule-title-row">
              <div>
                <div className="mobile-schedule-title">
                  {mobileMonthName}
                </div>

                <div className="mobile-schedule-subtitle">
                  {mobileVisibleTasks.length} görev
                  bu haftada
                </div>
              </div>

              <div className="mobile-schedule-actions">
                <button
                  type="button"
                  onClick={previousMobileWindow}
                  aria-label="Önceki hafta"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={nextMobileWindow}
                  aria-label="Sonraki hafta"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="mobile-schedule-week">
              {mobileDays.map((date) => (
                <div
                  key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                  className={`mobile-schedule-day ${
                    isSameDay(date, today)
                      ? "today"
                      : ""
                  }`}
                >
                  <span className="mobile-schedule-day-name">
                    {new Intl.DateTimeFormat(
                      "tr-TR",
                      { weekday: "short" }
                    )
                      .format(date)
                      .replace(".", "")
                      .slice(0, 2)}
                  </span>

                  <strong className="mobile-schedule-day-number">
                    {date.getDate()}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="mobile-schedule-timeline">
            {mobileVisibleTasks.length === 0 ? (
              <div className="mobile-schedule-empty">
                <CalendarDays size={24} />

                <span>
                  Bu hafta için planlanmış
                  görev bulunmuyor.
                </span>
              </div>
            ) : (
              mobileVisibleTasks.map(
                (task, index) => (
                  <div
                    className="mobile-schedule-slot"
                    key={task.id}
                  >
                    <div className="mobile-schedule-index">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="mobile-schedule-slot-content">
                      <button
                        type="button"
                        className={`mobile-schedule-task ${
                          task.status
                        } position-${
                          ["a", "b", "c", "d"][
                            index % 4
                          ]
                        }`}
                        onClick={() =>
                          openTask(task.id)
                        }
                        aria-label={`${task.title} görev detayını aç`}
                      >
                        <div className="mobile-schedule-task-main">
                          <span
                            className={`gantt-status-dot ${task.status}`}
                          />

                          <div>
                            <strong>
                              {task.title}
                            </strong>

                            <span>
                              {getStatusLabel(
                                task.status
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="mobile-schedule-task-date">
                          {formatDate(task.start)}
                          {" – "}
                          {formatDate(task.end)}
                        </div>
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <div className="mobile-schedule-legend">
            {(
              Object.keys(
                STATUS_LABELS
              ) as TaskStatus[]
            ).map((status) => (
              <div
                className="mobile-schedule-legend-item"
                key={status}
              >
                <i
                  className={`mobile-schedule-legend-dot ${status}`}
                />

                <span>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ORİJİNAL SAĞDAN AÇILAN GÖREV PANELİ */}

      <TaskDrawer
        task={selectedTask}
        onClose={closeTask}
      />
    </div>
  );
}
