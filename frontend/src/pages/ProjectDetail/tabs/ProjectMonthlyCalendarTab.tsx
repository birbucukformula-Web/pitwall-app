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

type CalendarView =
  | "month"
  | "week";

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

function getMonday(
  date: Date,
) {
  const result =
    normalizeDate(date);

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      difference,
  );

  return result;
}

function formatTaskDate(
  value:
    | string
    | null
    | undefined,
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



  const displayTasks: Task[] =
    tasks;

  const initialDate =
    useMemo(() => {
      const firstTask =
        displayTasks.find(
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

      return normalizeDate(
        date,
      );
    }, [displayTasks]);

  const [
    currentDate,
    setCurrentDate,
  ] = useState(initialDate);

  const [
    calendarView,
    setCalendarView,
  ] =
    useState<CalendarView>(
      "month",
    );

  const [
    selectedTaskId,
    setSelectedTaskId,
  ] = useState<
    number | null
  >(null);

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const monthLabel =
    new Intl.DateTimeFormat(
      "tr-TR",
      {
        month: "long",
        year: "numeric",
      },
    ).format(
      currentDate,
    );

  /*
   * AY GÖRÜNÜMÜ
   * 6 hafta / 42 gün.
   */

  const monthDays =
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

  /*
   * HAFTA GÖRÜNÜMÜ
   * currentDate'in bulunduğu
   * Pazartesi-Pazar aralığı.
   */

  const weekDays =
    useMemo(() => {
      const monday =
        getMonday(
          currentDate,
        );

      return Array.from(
        {
          length: 7,
        },
        (_, index) => {
          const date =
            new Date(monday);

          date.setDate(
            monday.getDate() +
              index,
          );

          return date;
        },
      );
    }, [currentDate]);

  const visibleDays =
    calendarView === "month"
      ? monthDays
      : weekDays;

  /*
   * Hafta görünümündeki
   * başlık.
   */

  const weekLabel =
    useMemo(() => {
      const start =
        weekDays[0];

      const end =
        weekDays[6];

      const startMonth =
        new Intl.DateTimeFormat(
          "tr-TR",
          {
            month: "short",
          },
        ).format(start);

      const endMonth =
        new Intl.DateTimeFormat(
          "tr-TR",
          {
            month: "short",
          },
        ).format(end);

      if (
        start.getFullYear() !==
        end.getFullYear()
      ) {
        return `${start.getDate()} ${startMonth} ${start.getFullYear()} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
      }

      if (
        start.getMonth() !==
        end.getMonth()
      ) {
        return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
      }

      return `${start.getDate()}–${end.getDate()} ${endMonth} ${end.getFullYear()}`;
    }, [weekDays]);

  const toolbarLabel =
    calendarView === "month"
      ? monthLabel
      : weekLabel;

  function previousPeriod() {
    if (
      calendarView ===
      "month"
    ) {
      setCurrentDate(
        new Date(
          year,
          month - 1,
          1,
        ),
      );
    } else {
      const date =
        new Date(
          currentDate,
        );

      date.setDate(
        date.getDate() - 7,
      );

      setCurrentDate(date);
    }

    setSelectedTaskId(null);
  }

  function nextPeriod() {
    if (
      calendarView ===
      "month"
    ) {
      setCurrentDate(
        new Date(
          year,
          month + 1,
          1,
        ),
      );
    } else {
      const date =
        new Date(
          currentDate,
        );

      date.setDate(
        date.getDate() + 7,
      );

      setCurrentDate(date);
    }

    setSelectedTaskId(null);
  }

  function goToToday() {
    setCurrentDate(today);

    setSelectedTaskId(null);
  }

  function changeView(
    view: CalendarView,
  ) {
    setCalendarView(view);

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
    return displayTasks.filter(
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
    displayTasks.filter(
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
          end >=
            monthStart &&
          start <=
            monthEnd
        );
      },
    );

  const tasksThisWeek =
    displayTasks.filter(
      (task) => {
        if (!task.due_date) {
          return false;
        }

        const taskEnd =
          normalizeDate(
            new Date(
              task.due_date,
            ),
          );

        const taskStart =
          task.start_date
            ? normalizeDate(
                new Date(
                  task.start_date,
                ),
              )
            : taskEnd;

        const weekStart =
          normalizeDate(
            weekDays[0],
          );

        const weekEnd =
          normalizeDate(
            weekDays[6],
          );

        return (
          taskEnd >=
            weekStart &&
          taskStart <=
            weekEnd
        );
      },
    );

  const visibleTaskCount =
    calendarView === "month"
      ? tasksThisMonth.length
      : tasksThisWeek.length;

  return (
    <div
      className={`monthly-calendar-tab tab-pane active fade-in ${
        calendarView ===
        "week"
          ? "week-view"
          : "month-view"
      }`}
      onClick={() =>
        setSelectedTaskId(
          null,
        )
      }
    >
      <div className="monthly-calendar-header">
        <div>
          <h3>
            {project.name}{" "}
            Takvimi
          </h3>

          <p>
            Birimin görevlerini
            aylık ve haftalık
            takvim üzerinde
            görüntüle.
          </p>
        </div>

        <div className="monthly-calendar-summary">
          <CalendarDays
            size={15}
          />

          <span>
            {visibleTaskCount}{" "}
            görev
          </span>
        </div>
      </div>

      <div className="monthly-calendar-card">
        <div className="monthly-calendar-toolbar">
          <div className="monthly-calendar-navigation">
            <button
              type="button"
              className="calendar-today-button"
              onClick={
                goToToday
              }
            >
              Bugün
            </button>

            <div className="calendar-arrow-group">
              <button
                type="button"
                className="calendar-nav-button"
                aria-label={
                  calendarView ===
                  "month"
                    ? "Önceki ay"
                    : "Önceki hafta"
                }
                onClick={
                  previousPeriod
                }
              >
                <ChevronLeft
                  size={18}
                />
              </button>

              <button
                type="button"
                className="calendar-nav-button"
                aria-label={
                  calendarView ===
                  "month"
                    ? "Sonraki ay"
                    : "Sonraki hafta"
                }
                onClick={
                  nextPeriod
                }
              >
                <ChevronRight
                  size={18}
                />
              </button>
            </div>
          </div>

          <div className="monthly-calendar-toolbar-right">
            <h4>
              {toolbarLabel}
            </h4>

            <div
              className="calendar-view-switch"
              aria-label="Takvim görünümü"
            >
              <button
                type="button"
                className={
                  calendarView ===
                  "month"
                    ? "active"
                    : ""
                }
                aria-pressed={
                  calendarView ===
                  "month"
                }
                onClick={() =>
                  changeView(
                    "month",
                  )
                }
              >
                Ay
              </button>

              <button
                type="button"
                className={
                  calendarView ===
                  "week"
                    ? "active"
                    : ""
                }
                aria-pressed={
                  calendarView ===
                  "week"
                }
                onClick={() =>
                  changeView(
                    "week",
                  )
                }
              >
                Hafta
              </button>
            </div>
          </div>
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
            {visibleDays.map(
              (date) => {
                const dayTasks =
                  getTasksForDay(
                    date,
                  );

                const isOutside =
                  calendarView ===
                    "month" &&
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
                  dayOfWeek ===
                    0 ||
                  dayOfWeek ===
                    6;

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
                      .join(
                        " ",
                      )}
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

                                    {
                                      " – "
                                    }

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
    </div>
  );
}