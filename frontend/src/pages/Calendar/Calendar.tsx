import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

function createCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstDayIndex = (firstDay.getDay() + 6) % 7;

  const days: CalendarDay[] = [];

  const previousMonthLastDay = new Date(year, month, 0).getDate();

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, previousMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  let nextMonthDay = 1;

  while (days.length < 42) {
    days.push({
      date: new Date(year, month + 1, nextMonthDay),
      isCurrentMonth: false,
    });

    nextMonthDay++;
  }

  return days;
}

function getWeekDays(date: Date) {
  const currentDay = (date.getDay() + 6) % 7;

  const monday = new Date(date);
  monday.setDate(date.getDate() - currentDay);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);

    return day;
  });
}

function getMidnight(dateString: string) {
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  ).getTime();
}

function isDateBetween(
  date: Date,
  startStr: string | null | undefined,
  dueStr: string,
) {
  if (!dueStr) return false;

  const current = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();

  const end = getMidnight(dueStr);
  const start = startStr ? getMidnight(startStr) : end;

  return current >= start && current <= end;
}

function getTaskSpanInfo(
  date: Date,
  startStr: string | null | undefined,
  dueStr: string,
) {
  if (!dueStr) {
    return {
      classes: "",
      showContent: true,
    };
  }

  const current = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();

  const end = getMidnight(dueStr);
  const start = startStr ? getMidnight(startStr) : end;

  const dayOfWeek = date.getDay();

  let classes = "";

  if (current > start && dayOfWeek !== 1) {
    classes += " task-span-left";
  }

  if (current < end && dayOfWeek !== 0) {
    classes += " task-span-right";
  }

  const showContent = current === start || dayOfWeek === 1;

  return {
    classes,
    showContent,
  };
}

function isToday(date: Date) {
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function Calendar() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState<"month" | "week">("month");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["stats"],
      });

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
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["stats"],
      });

      setShowTaskModal(false);
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => tasksApi.deleteTask(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["stats"],
      });

      setSelectedTask(null);
    },
  });

  const calendarDays = useMemo(
    () =>
      createCalendarDays(
        currentDate.getFullYear(),
        currentDate.getMonth(),
      ),
    [currentDate],
  );

  const weekDays = useMemo(
    () => getWeekDays(currentDate),
    [currentDate],
  );

  function previousPeriod() {
    setCurrentDate((date) => {
      const newDate = new Date(date);

      if (view === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }

      return newDate;
    });
  }

  function nextPeriod() {
    setCurrentDate((date) => {
      const newDate = new Date(date);

      if (view === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }

      return newDate;
    });
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function handleCreateTask(newTask: Task) {
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      project: newTask.project?.id,
      unit: newTask.unit?.id,
      assignees: newTask.assignees?.map(
        (assignee) => assignee.id,
      ),
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
          (assignee) => assignee.id,
        ),
        start_date: updatedTask.start_date || null,
        due_date: updatedTask.due_date,
      },
    });
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

          {view === "month" ? (
            <>
              <div className="calendar-weekdays">
                {WEEK_DAYS.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarDays.map(({ date, isCurrentMonth }) => {
                  const dayTasks = tasks
                    .filter((task) =>
                      isDateBetween(
                        date,
                        task.start_date,
                        task.due_date,
                      ),
                    )
                    .sort((a, b) => a.id - b.id);

                  return (
                    <div
                      className={`calendar-day ${!isCurrentMonth ? "other-month" : ""
                        }`}
                      key={date.toISOString()}
                    >
                      <div className="day-number-row">
                        <span
                          className={
                            isToday(date)
                              ? "day-number today"
                              : "day-number"
                          }
                        >
                          {date.getDate()}
                        </span>
                      </div>

                      <div className="day-tasks">
                        {dayTasks.map((task) => {
                          const spanInfo = getTaskSpanInfo(
                            date,
                            task.start_date,
                            task.due_date,
                          );

                          return (
                            <button
                              type="button"
                              className={`calendar-task calendar-task-${task.status}${spanInfo.classes}`}
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              title={task.title}
                              aria-label={task.title}
                            >
                              {spanInfo.showContent ? (
                                <>
                                  <span className="calendar-task-dot" />

                                  <span className="calendar-task-title">
                                    {task.title}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className="calendar-task-title"
                                  style={{ opacity: 0 }}
                                >
                                  _
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="calendar-weekdays">
                {weekDays.map((date, index) => (
                  <div key={date.toISOString()}>
                    {WEEK_DAYS[index]} {date.getDate()}
                  </div>
                ))}
              </div>

              <div className="week-grid">
                {weekDays.map((date) => {
                  const dayTasks = tasks
                    .filter((task) =>
                      isDateBetween(
                        date,
                        task.start_date,
                        task.due_date,
                      ),
                    )
                    .sort((a, b) => a.id - b.id);

                  return (
                    <div
                      className="week-day"
                      key={date.toISOString()}
                    >
                      <div className="week-day-header">
                        <span
                          className={
                            isToday(date)
                              ? "week-day-number today"
                              : "week-day-number"
                          }
                        >
                          {date.getDate()}
                        </span>
                      </div>

                      <div className="day-tasks">
                        {dayTasks.map((task) => {
                          const spanInfo = getTaskSpanInfo(
                            date,
                            task.start_date,
                            task.due_date,
                          );

                          return (
                            <button
                              type="button"
                              className={`calendar-task calendar-task-${task.status}${spanInfo.classes}`}
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              title={task.title}
                              aria-label={task.title}
                            >
                              {spanInfo.showContent ? (
                                <>
                                  <span className="calendar-task-dot" />

                                  <span className="calendar-task-title">
                                    {task.title}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className="calendar-task-title"
                                  style={{ opacity: 0 }}
                                >
                                  _
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
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
    </>
  );
}