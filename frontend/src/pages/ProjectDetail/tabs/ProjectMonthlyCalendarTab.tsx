import {
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

import type {
  Task,
  TaskStatus,
} from "../../../types/task";

import "./ProjectMonthlyCalendarTab.css";

interface Props {
  project: any;
  tasks: Task[];
}

const STATUS_LABELS: Record<
  TaskStatus,
  string
> = {
  todo: "Yapılacak",
  in_progress: "Devam Ediyor",
  review: "İncelemede",
  done: "Tamamlandı",
};

const WEEK_DAYS = [
  "Pzt",
  "Sal",
  "Çar",
  "Per",
  "Cum",
  "Cmt",
  "Paz",
];

function normalizeDate(
  date: Date,
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function isSameDay(
  first: Date,
  second: Date,
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function formatTaskDate(
  value: string | null | undefined,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "numeric",
      month: "short",
    },
  ).format(date);
}

export default function ProjectMonthlyCalendarTab({
  project,
  tasks,
}: Props) {
  const today =
    normalizeDate(new Date());

  /*
    Mock görevler Ekim 2026'da
    olduğu için ilk açılışta görevlerin
    bulunduğu ayı gösteriyoruz.

    Gerçek API'de de aynı mantık:
    ilk tarihli görevin ayı açılır.
  */
  const initialDate =
    useMemo(() => {
      const firstTask =
        tasks.find(
          (task) =>
            task.start_date ||
            task.due_date,
        );

      const value =
        firstTask?.start_date ||
        firstTask?.due_date;

      if (!value) {
        return today;
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return today;
      }

      return new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
      );
    }, [tasks]);

  const [
    currentMonth,
    setCurrentMonth,
  ] = useState(initialDate);

  const [
    selectedTaskId,
    setSelectedTaskId,
  ] = useState<
    number | null
  >(null);

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const monthLabel =
    new Intl.DateTimeFormat(
      "tr-TR",
      {
        month: "long",
        year: "numeric",
      },
    ).format(
      currentMonth,
    );

  /*
    Takvim Pazartesi ile başlıyor.

    JS:
    Pazar = 0
    Pazartesi = 1

    Biz:
    Pazartesi = 0
    ...
    Pazar = 6
  */
  const calendarDays =
    useMemo(() => {
      const firstDay =
        new Date(
          year,
          month,
          1,
        );

      const mondayIndex =
        (firstDay.getDay() +
          6) %
        7;

      const calendarStart =
        new Date(
          year,
          month,
          1 - mondayIndex,
        );

      return Array.from(
        {
          length: 42,
        },
        (_, index) => {
          const date =
            new Date(
              calendarStart,
            );

          date.setDate(
            calendarStart.getDate() +
              index,
          );

          return date;
        },
      );
    }, [year, month]);

  function previousMonth() {
    setCurrentMonth(
      new Date(
        year,
        month - 1,
        1,
      ),
    );

    setSelectedTaskId(null);
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(
        year,
        month + 1,
        1,
      ),
    );

    setSelectedTaskId(null);
  }

  function goToToday() {
    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

    setSelectedTaskId(null);
  }

  function toggleTask(
    taskId: number,
  ) {
    setSelectedTaskId(
      (current) =>
        current === taskId
          ? null
          : taskId,
    );
  }

  function getTasksForDay(
    date: Date,
  ) {
    return tasks.filter(
      (task) => {
        if (!task.due_date) {
          return false;
        }

        const end =
          normalizeDate(
            new Date(
              task.due_date,
            ),
          );

        const start =
          task.start_date
            ? normalizeDate(
                new Date(
                  task.start_date,
                ),
              )
            : end;

        return (
          date >= start &&
          date <= end
        );
      },
    );
  }

  const tasksThisMonth =
    tasks.filter(
      (task) => {
        if (!task.due_date) {
          return false;
        }

        const end =
          new Date(
            task.due_date,
          );

        const start =
          task.start_date
            ? new Date(
                task.start_date,
              )
            : end;

        const monthStart =
          new Date(
            year,
            month,
            1,
          );

        const monthEnd =
          new Date(
            year,
            month + 1,
            0,
            23,
            59,
            59,
          );

        return (
          end >= monthStart &&
          start <= monthEnd
        );
      },
    );

  return (
    <div
      className="monthly-calendar-tab tab-pane active fade-in"
      onClick={() =>
        setSelectedTaskId(null)
      }
    >
      <div className="monthly-calendar-header">
        <div>
          <h3>
            {project.name} Takvimi
          </h3>

          <p>
            Birimin görevlerini aylık
            takvim üzerinde görüntüle.
          </p>
        </div>

        <div className="monthly-calendar-summary">
          <CalendarDays
            size={15}
          />

          <span>
            {tasksThisMonth.length}{" "}
            görev
          </span>
        </div>
      </div>

      <div className="monthly-calendar-toolbar">
        <div className="monthly-calendar-navigation">
          <button
            type="button"
            className="calendar-nav-button"
            aria-label="Önceki ay"
            onClick={
              previousMonth
            }
          >
            <ChevronLeft
              size={17}
            />
          </button>

          <button
            type="button"
            className="calendar-today-button"
            onClick={
              goToToday
            }
          >
            Bugün
          </button>

          <button
            type="button"
            className="calendar-nav-button"
            aria-label="Sonraki ay"
            onClick={
              nextMonth
            }
          >
            <ChevronRight
              size={17}
            />
          </button>
        </div>

        <h4>
          {monthLabel}
        </h4>
      </div>

      <div className="monthly-calendar">
        <div className="monthly-calendar-weekdays">
          {WEEK_DAYS.map(
            (
              day,
              index,
            ) => (
              <div
                key={day}
                className={`calendar-weekday ${
                  index >= 5
                    ? "weekend"
                    : ""
                }`}
              >
                {day}
              </div>
            ),
          )}
        </div>

        <div className="monthly-calendar-grid">
          {calendarDays.map(
            (date) => {
              const dayTasks =
                getTasksForDay(
                  date,
                );

              const isOutside =
                date.getMonth() !==
                month;

              const isToday =
                isSameDay(
                  date,
                  today,
                );

              const dayOfWeek =
                date.getDay();

              const isWeekend =
                dayOfWeek === 0 ||
                dayOfWeek === 6;

              return (
                <div
                  key={
                    date.toISOString()
                  }
                  className={[
                    "calendar-day-cell",

                    isOutside
                      ? "outside-month"
                      : "",

                    isWeekend
                      ? "weekend"
                      : "",

                    isToday
                      ? "today"
                      : "",
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(" ")}
                >
                  <div className="calendar-day-header">
                    <span className="calendar-day-number">
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="calendar-day-tasks">
                    {dayTasks.map(
                      (task) => {
                        const isSelected =
                          selectedTaskId ===
                          task.id;

                        return (
                          <div
                            key={
                              task.id
                            }
                            className="calendar-task-wrapper"
                          >
                            <button
                              type="button"
                              className={`calendar-task ${task.status}`}
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                toggleTask(
                                  task.id,
                                );
                              }}
                            >
                              <span className="calendar-task-dot" />

                              <span className="calendar-task-title">
                                {
                                  task.title
                                }
                              </span>
                            </button>

                            {isSelected && (
                              <div
                                className="calendar-task-popover"
                                onClick={(
                                  event,
                                ) =>
                                  event.stopPropagation()
                                }
                              >
                                <strong>
                                  {
                                    task.title
                                  }
                                </strong>

                                <span className="calendar-popover-status">
                                  {
                                    STATUS_LABELS[
                                      task
                                        .status
                                    ]
                                  }
                                </span>

                                <div className="calendar-popover-date">
                                  {formatTaskDate(
                                    task.start_date ||
                                      task.due_date,
                                  )}

                                  {" – "}

                                  {formatTaskDate(
                                    task.due_date,
                                  )}
                                </div>

                                <div className="calendar-popover-priority">
                                  Öncelik:{" "}
                                  {task.priority ===
                                  "high"
                                    ? "Yüksek"
                                    : task.priority ===
                                        "medium"
                                      ? "Orta"
                                      : "Düşük"}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}