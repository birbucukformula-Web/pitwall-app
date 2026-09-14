import { useMemo } from "react";

import {
  CalendarDays,
} from "lucide-react";

import type {
  Task,
  TaskStatus,
} from "../../../types/task";

import "./ProjectCalendarTab.css";

interface Props {
  project: any;
  tasks: Task[];
}

type TimelineTask = Task & {
  start: Date;
  end: Date;
};

const STATUS_LABELS: Record<
  TaskStatus,
  string
> = {
  todo: "Yapılacak",
  in_progress: "Devam Ediyor",
  review: "İncelemede",
  done: "Tamamlandı",
};

export default function ProjectCalendarTab({
  project,
  tasks,
}: Props) {
  const today = new Date();

  const timelineTasks = useMemo<TimelineTask[]>(() => {
    return tasks
      .filter((task) => task.due_date)
      .map((task) => {
        const end = new Date(task.due_date);

        const start = task.start_date
          ? new Date(task.start_date)
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
          !Number.isNaN(task.end.getTime()),
      )
      .sort(
        (a, b) =>
          a.start.getTime() -
          b.start.getTime(),
      );
  }, [tasks]);

  const referenceDate =
    timelineTasks[0]?.start ??
    today;

  const year =
    referenceDate.getFullYear();

  const month =
    referenceDate.getMonth();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0,
    ).getDate();

  const monthName =
    new Intl.DateTimeFormat(
      "tr-TR",
      {
        month: "long",
        year: "numeric",
      },
    ).format(
      new Date(
        year,
        month,
        1,
      ),
    );

  const days = Array.from(
    {
      length: daysInMonth,
    },
    (_, index) => index + 1,
  );

  const isCurrentMonth =
    today.getFullYear() === year &&
    today.getMonth() === month;

  const todayDay =
    isCurrentMonth
      ? today.getDate()
      : null;

  function formatDate(
    date: Date,
  ) {
    return new Intl.DateTimeFormat(
      "tr-TR",
      {
        day: "numeric",
        month: "short",
      },
    ).format(date);
  }

  function getTaskPosition(
    task: TimelineTask,
  ) {
    const monthStart =
      new Date(
        year,
        month,
        1,
      );

    const monthEnd =
      new Date(
        year,
        month,
        daysInMonth,
      );

    const visibleStart =
      task.start < monthStart
        ? monthStart
        : task.start;

    const visibleEnd =
      task.end > monthEnd
        ? monthEnd
        : task.end;

    const startDay =
      visibleStart.getDate();

    const endDay =
      visibleEnd.getDate();

    const left =
      ((startDay - 1) /
        daysInMonth) *
      100;

    const width =
      (Math.max(
        endDay -
        startDay +
        1,
        1,
      ) /
        daysInMonth) *
      100;

    return {
      left: `${left}%`,
      width: `${width}%`,
    };
  }

  function isTaskVisible(
    task: TimelineTask,
  ) {
    const monthStart =
      new Date(
        year,
        month,
        1,
      );

    const monthEnd =
      new Date(
        year,
        month,
        daysInMonth,
        23,
        59,
        59,
      );

    return (
      task.end >= monthStart &&
      task.start <= monthEnd
    );
  }

  const visibleTasks =
    timelineTasks.filter(
      isTaskVisible,
    );

  return (
    <div className="project-calendar-tab tab-pane active fade-in">
      <div className="project-calendar-header">
        <div>
          <h3>
            {project.name} Takvimi
          </h3>

          <p>
            Görevlerin başlangıç ve
            teslim tarihlerini zaman
            çizelgesinde görüntüle.
          </p>
        </div>
      </div>

      {visibleTasks.length === 0 ? (
        <div className="gantt-empty">
          <CalendarDays size={30} />

          <strong>
            Bu ay için planlanmış görev
            bulunmuyor.
          </strong>

          <span>
            Teslim tarihi olan görevler
            burada görüntülenecek.
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
                    gridTemplateColumns: `repeat(${daysInMonth}, minmax(28px, 1fr))`,
                  }}
                >
                  {days.map((day) => (
                    <div
                      key={day}
                      className={`gantt-day ${todayDay === day
                          ? "today"
                          : ""
                        }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              <div className="gantt-body">
                {todayDay && (
                  <div
                    className="gantt-today-line"
                    style={{
                      left: `calc(
                        var(--gantt-task-column)
                        +
                        (
                          (100% - var(--gantt-task-column))
                          *
                          ${(todayDay - 0.5) / daysInMonth}
                        )
                      )`,
                    }}
                  />
                )}

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
                            {formatDate(
                              task.start,
                            )}
                            {" – "}
                            {formatDate(
                              task.end,
                            )}
                          </span>
                        </div>
                      </div>

                      <div
                        className="gantt-track"
                        style={{
                          gridTemplateColumns: `repeat(${daysInMonth}, minmax(28px, 1fr))`,
                        }}
                      >
                        {days.map((day) => (
                          <div
                            className="gantt-grid-cell"
                            key={day}
                          />
                        ))}

                        <div
                          className={`gantt-bar ${task.status}`}
                          style={position}
                        >
                          <span className="gantt-bar-label">
                            {task.title}
                          </span>

                          <div className="gantt-tooltip">
                            <strong>{task.title}</strong>

                            <span>
                              {STATUS_LABELS[task.status]}
                            </span>

                            <div className="gantt-tooltip-date">
                              {formatDate(task.start)}
                              {" – "}
                              {formatDate(task.end)}
                            </div>

                            {task.priority && (
                              <div className="gantt-tooltip-priority">
                                Öncelik:{" "}
                                {task.priority === "high"
                                  ? "Yüksek"
                                  : task.priority === "medium"
                                    ? "Orta"
                                    : "Düşük"}
                              </div>
                            )}
                          </div>
                        </div>
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
                STATUS_LABELS,
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
  );
}