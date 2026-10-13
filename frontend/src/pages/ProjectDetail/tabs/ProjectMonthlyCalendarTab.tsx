
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

/*
  HAFTALIK GÖREV ŞERİTLERİ

  Bir görev birden fazla gün sürüyorsa,
  ilgili haftadaki günleri tek şerit halinde gösterir.

  Görev başka bir haftada devam ediyorsa,
  yeni haftada da başlığı görünür.

  Aynı günlerde çakışan görevler iki farklı
  satıra yerleştirilir.
*/

type WeekBar<T> = {
  task: T;
  start: number;
  end: number;
  lane: number;
};

function getWeekBars<
  T extends {
    id: number;
    start_date?: string | null;
    due_date?: string | null;
  }
>(
  dates: Date[],
  tasks: T[],
  occurs: (task: T, date: Date) => boolean,
  parse: (date: string | null | undefined) => Date | null
): WeekBar<T>[] {
  const bars: WeekBar<T>[] = [];

  if (dates.length === 0) return bars;

  const weekStart = dates[0];
  const weekEnd = dates[dates.length - 1];

  const candidates = tasks
    .map((task) => {
      const end = parse(task.due_date);

      if (!end) return null;

      const start = parse(task.start_date) ?? end;

      if (start > weekEnd || end < weekStart) {
        return null;
      }

      const first = dates.findIndex((date) =>
        occurs(task, date)
      );

      if (first === -1) return null;

      let last = first;

      for (
        let index = first + 1;
        index < dates.length;
        index++
      ) {
        if (!occurs(task, dates[index])) break;

        last = index;
      }

      return {
        task,
        start: first,
        end: last,
      };
    })
    .filter(
      (
        item
      ): item is {
        task: T;
        start: number;
        end: number;
      } => item !== null
    )
    .sort(
      (a, b) =>
        a.start - b.start ||
        b.end - a.end ||
        a.task.id - b.task.id
    );

  const occupied: boolean[][] = [
    Array(7).fill(false),
    Array(7).fill(false),
  ];

  for (const candidate of candidates) {
    let assignedLane = -1;

    for (let lane = 0; lane < VISIBLE_TASK_LIMIT; lane++) {
      let available = true;

      for (
        let day = candidate.start;
        day <= candidate.end;
        day++
      ) {
        if (occupied[lane][day]) {
          available = false;
          break;
        }
      }

      if (available) {
        assignedLane = lane;
        break;
      }
    }

    if (assignedLane === -1) continue;

    for (
      let day = candidate.start;
      day <= candidate.end;
      day++
    ) {
      occupied[assignedLane][day] = true;
    }

    bars.push({
      task: candidate.task,
      start: candidate.start,
      end: candidate.end,
      lane: assignedLane,
    });
  }

  return bars;
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

  /*
    AYLIK TAKVİM GÜNLERİ
    6 hafta × 7 gün = 42 hücre
  */
  const monthDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);

    const offset =
      (firstDay.getDay() + 6) % 7;

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

  /*
    HAFTALIK TAKVİM GÜNLERİ
  */
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

  /*
    TAKVİM BAŞLIĞI
  */
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

  /*
    GÖRÜNÜR DÖNEMDEKİ GÖREV SAYISI
  */
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

  /*
    SEÇİLEN GÜNÜN GÖREVLERİ
  */
  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];

    return tasks
      .filter((task) =>
        taskOccursOnDay(task, selectedDate)
      )
      .sort((a, b) => a.id - b.id);
  }, [tasks, selectedDate]);

  /*
    SAĞ PANELDE AÇILACAK GÖREV
  */
  const selectedTask =
    tasks.find(
      (task) => task.id === selectedTaskId
    ) ?? null;

  /*
    ÖNCEKİ / SONRAKİ DÖNEM
  */
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

  /*
    BUGÜNE DÖN
  */
  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(null);
    setSelectedTaskId(null);
  }

  /*
    AY / HAFTA GÖRÜNÜMÜ
  */
  function changeView(view: CalendarView) {
    setCalendarView(view);
    setSelectedDate(null);
    setSelectedTaskId(null);
  }

  /*
    GÜN SEÇİMİ
  */
  function selectDay(date: Date) {
    setSelectedDate(date);
  }

  /*
    GÖREV DETAYINI AÇ
  */
  function openTask(taskId: number) {
    setSelectedDate(null);
    setSelectedTaskId(taskId);
  }

  function closeTask() {
    setSelectedTaskId(null);
  }

  /*
    ESC İLE GÜNLÜK PENCEREYİ KAPAT
  */
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
      {/* TAKVİM BAŞLIĞI */}

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

      {/* TAKVİM KARTI */}

      <div className="monthly-calendar-card">
        {/* ÜST ARAÇ ÇUBUĞU */}

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

        {/* TAKVİM */}

        <div className="monthly-calendar">
          {/* HAFTANIN GÜNLERİ */}

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

          {/* GÜN HÜCRELERİ VE GÖREV ŞERİTLERİ */}

          <div className="monthly-calendar-grid">
            {Array.from(
              {
                length: visibleDays.length / 7,
              },
              (_, week) => {
                const days = visibleDays.slice(
                  week * 7,
                  week * 7 + 7
                );

                const weekBars = getWeekBars(
                  days,
                  tasks,
                  taskOccursOnDay,
                  parseDate
                );

                return (
                  <div
                    className="calendar-span-week"
                    key={dateKey(days[0])}
                  >
                    {/* GÜN HÜCRELERİ */}

                    {days.map((date) => {
                      const dayTasks = tasks.filter(
                        (task) =>
                          taskOccursOnDay(task, date)
                      );

                      const remainingCount =
                        Math.max(
                          0,
                          dayTasks.length -
                            VISIBLE_TASK_LIMIT
                        );

                      const isOutside =
                        calendarView === "month" &&
                        date.getMonth() !== month;

                      const isToday = isSameDay(
                        date,
                        today
                      );

                      const isSelected =
                        selectedDate !== null &&
                        isSameDay(
                          date,
                          selectedDate
                        );

                      return (
                        <div
                          key={dateKey(date)}
                          className={[
                            "calendar-day-cell",
                            isOutside
                              ? "outside-month"
                              : "",
                            isToday ? "today" : "",
                            isSelected
                              ? "selected"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() =>
                            selectDay(date)
                          }
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

                          <div className="calendar-span-day-content">
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
                        </div>
                      );
                    })}

                    {/* HAFTAYA YAYILAN GÖREV ŞERİTLERİ */}

                    <div className="calendar-span-layer">
                      {weekBars.map(
                        ({
                          task,
                          start,
                          end,
                          lane,
                        }) => (
                          <button
                            key={`${task.id}-${start}-${lane}`}
                            type="button"
                            className={`calendar-task ${task.status} calendar-span-bar`}
                            style={{
                              gridColumn: `${
                                start + 1
                              } / ${end + 2}`,
                              gridRow: lane + 1,
                            }}
                            title={task.title}
                            onClick={(event) => {
                              event.stopPropagation();
                              openTask(task.id);
                            }}
                          >
                            {/*
                              Başlık her haftada gösterilir.

                              Önceki kodda showTitle
                              koşulu nedeniyle devam
                              eden görevlerin şeritleri
                              boş görünüyordu.
                            */}

                            <span className="calendar-task-dot" />

                            <span className="calendar-task-title">
                              {task.title}
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              }
            )}
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
            aria-label={formatSelectedDate(
              selectedDate
            )}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="calendar-selected-day-heading">
              <div>
                <span className="calendar-selected-day-label">
                  Seçilen gün
                </span>

                <h4>
                  {formatSelectedDate(
                    selectedDate
                  )}
                </h4>
              </div>

              <div className="calendar-selected-day-actions">
                <span className="calendar-selected-day-count">
                  {selectedDayTasks.length} görev
                </span>

                <button
                  type="button"
                  className="calendar-selected-day-close"
                  onClick={() =>
                    setSelectedDate(null)
                  }
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
                    onClick={() =>
                      openTask(task.id)
                    }
                  >
                    <div className="calendar-selected-task-info">
                      <strong>
                        {task.title}
                      </strong>

                      <span>
                        {project.name}
                      </span>
                    </div>

                    <span className="calendar-selected-task-status">
                      {STATUS_LABELS[
                        task.status
                      ]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAĞDAN AÇILAN GÖREV DETAY PANELİ */}

      <TaskDrawer
        task={selectedTask}
        onClose={closeTask}
      />
    </div>
  );
}
