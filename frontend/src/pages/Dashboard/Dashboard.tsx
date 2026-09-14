import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Flag,
} from "lucide-react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../contexts/AuthContext";

import type {
  Task,
  TaskStatus,
} from "../../types/task";

import TaskDrawer from "../../components/TaskDrawer/TaskDrawer";

import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  /*
   * Bu oturum sırasında tamamlanan görevlerin
   * önceki durumunu saklıyoruz.
   *
   * Böylece:
   * todo -> done -> todo
   * in_progress -> done -> in_progress
   * review -> done -> review
   */
  const [
    previousStatuses,
    setPreviousStatuses,
  ] = useState<
    Record<number, TaskStatus>
  >({});

  const activeSectionRef =
    useRef<HTMLDivElement | null>(null);

  const overdueSectionRef =
    useRef<HTMLDivElement | null>(null);

  const completedSectionRef =
    useRef<HTMLDivElement | null>(null);

  const {
    data: allTasks = [],
    isLoading,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getTasks(),
  });

  const toggleStatusMutation =
    useMutation({
      mutationFn: ({
        task,
        nextStatus,
      }: {
        task: Task;
        nextStatus: TaskStatus;
      }) =>
        tasksApi.updateTask(task.id, {
          status: nextStatus,
        }),

      onSuccess: (
        updatedTask,
        variables,
      ) => {
        /*
         * React Query cache'ini anında güncelliyoruz.
         * Böylece görev beklemeden diğer listeye geçiyor.
         */
        queryClient.setQueryData<Task[]>(
          ["tasks"],
          (currentTasks = []) =>
            currentTasks.map((task) =>
              task.id === updatedTask.id
                ? updatedTask
                : task,
            ),
        );

        /*
         * Drawer açıksa onun gösterdiği görevi de
         * güncel tutuyoruz.
         */
        setSelectedTask((current) =>
          current?.id === updatedTask.id
            ? updatedTask
            : current,
        );

        if (
          variables.nextStatus === "done"
        ) {
          setPreviousStatuses(
            (current) => ({
              ...current,
              [variables.task.id]:
                variables.task.status,
            }),
          );
        } else {
          setPreviousStatuses(
            (current) => {
              const next = {
                ...current,
              };

              delete next[
                variables.task.id
              ];

              return next;
            },
          );
        }
      },

      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });
      },
    });

  const myTasks = useMemo(() => {
    if (!user) {
      return [];
    }

    return allTasks.filter((task) =>
      task.assignees?.some(
        (assignee: any) =>
          assignee.id === user.id,
      ),
    );
  }, [allTasks, user]);

  const activeTasks = useMemo(
    () =>
      myTasks.filter(
        (task) =>
          task.status !== "done",
      ),
    [myTasks],
  );

  const completedTasks = useMemo(
    () =>
      myTasks.filter(
        (task) =>
          task.status === "done",
      ),
    [myTasks],
  );

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  const overdueTasks = useMemo(() => {
    return activeTasks.filter(
      (task) => {
        if (!task.due_date) {
          return false;
        }

        const dueDate =
          new Date(task.due_date);

        dueDate.setHours(
          0,
          0,
          0,
          0,
        );

        return dueDate < today;
      },
    );
  }, [activeTasks, today]);

  const raceDate = useMemo(() => {
    if (
      !user?.organization?.race_date
    ) {
      return null;
    }

    const date =
      new Date(
        user.organization.race_date,
      );

    date.setHours(0, 0, 0, 0);

    return date;
  }, [user]);

  const daysLeft =
    raceDate !== null
      ? Math.ceil(
          (raceDate.getTime() -
            today.getTime()) /
            (1000 *
              60 *
              60 *
              24),
        )
      : null;

  const raceText =
    daysLeft === null
      ? "—"
      : daysLeft > 0
        ? `${daysLeft} GÜN`
        : daysLeft === 0
          ? "BUGÜN!"
          : "TAMAMLANDI";

  const raceDateText =
    raceDate !== null
      ? raceDate.toLocaleDateString(
          "tr-TR",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        )
      : "Tarih belirtilmemiş";

  const completionRate =
    myTasks.length > 0
      ? Math.round(
          (completedTasks.length /
            myTasks.length) *
            100,
        )
      : 0;

  function scrollTo(
    ref: React.RefObject<
      HTMLDivElement | null
    >,
  ) {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function formatDate(
    value?: string | null,
  ) {
    if (!value) {
      return "";
    }

    return new Date(
      value,
    ).toLocaleDateString(
      "tr-TR",
      {
        day: "numeric",
        month: "short",
      },
    );
  }

  function priorityText(
    priority: Task["priority"],
  ) {
    if (priority === "high") {
      return "Yüksek";
    }

    if (priority === "medium") {
      return "Orta";
    }

    return "Düşük";
  }

  function handleToggleComplete(
    task: Task,
  ) {
    if (
      toggleStatusMutation.isPending
    ) {
      return;
    }

    /*
     * Aktif görev -> tamamlandı
     */
    if (task.status !== "done") {
      toggleStatusMutation.mutate({
        task,
        nextStatus: "done",
      });

      return;
    }

    /*
     * Tamamlanmış görev -> eski durum
     *
     * Eski durum bilinmiyorsa tahmin yapmıyoruz.
     */
    const previousStatus =
      previousStatuses[task.id];

    if (!previousStatus) {
      return;
    }

    toggleStatusMutation.mutate({
      task,
      nextStatus: previousStatus,
    });
  }

  function canUndoCompletion(
    task: Task,
  ) {
    return Boolean(
      previousStatuses[task.id],
    );
  }

  if (isLoading) {
    return (
      <div className="pd-loading">
        Yükleniyor...
      </div>
    );
  }

  return (
    <>
      <section className="personal-dashboard">

        {/* HERO */}

        <section className="pd-hero">

          <div className="pd-welcome">
            <h2>
              Hoş Geldin,{" "}
              {user?.first_name}
            </h2>

            <p>
              Bugün seni bekleyen
              görevleri ve ilerlemeni
              buradan takip
              edebilirsin.
            </p>
          </div>

          <div className="pd-race">

            <div className="pd-race-left">

              <div className="pd-race-icon">
                <Flag size={21} />
              </div>

              <div>
                <span className="pd-race-label">
                  FORMULA STUDENT
                </span>

                <strong className="pd-race-days">
                  {raceText}
                </strong>

                <span className="pd-race-caption">
                  Yarışa kalan süre
                </span>
              </div>

            </div>

            <div className="pd-race-right">

              <div className="pd-race-date">
                <span>
                  Hedef tarih
                </span>

                <strong>
                  {raceDateText}
                </strong>
              </div>

              <div className="pd-race-completion">
                <strong>
                  %{completionRate}
                </strong>

                <span>
                  Tamamlanan görevler
                </span>
              </div>

            </div>

            <div className="pd-progress">
              <div
                className="pd-progress-value"
                style={{
                  width: `${completionRate}%`,
                }}
              />
            </div>

          </div>

        </section>

        {/* STATS */}

        <div className="pd-stats-grid">

          <button
            type="button"
            className="pd-stat-card"
            onClick={() =>
              scrollTo(
                activeSectionRef,
              )
            }
          >
            <div className="pd-stat-icon active">
              <CircleDashed
                size={20}
              />
            </div>

            <div className="pd-stat-info">
              <span>
                Aktif Görevler
              </span>

              <strong>
                {activeTasks.length}
              </strong>
            </div>

            <ChevronRight
              size={17}
            />
          </button>

          <button
            type="button"
            className="pd-stat-card"
            onClick={() =>
              scrollTo(
                overdueSectionRef,
              )
            }
          >
            <div className="pd-stat-icon overdue">
              <AlertCircle
                size={20}
              />
            </div>

            <div className="pd-stat-info">
              <span>
                Geciken
              </span>

              <strong>
                {overdueTasks.length}
              </strong>
            </div>

            <ChevronRight
              size={17}
            />
          </button>

          <button
            type="button"
            className="pd-stat-card"
            onClick={() =>
              scrollTo(
                completedSectionRef,
              )
            }
          >
            <div className="pd-stat-icon completed">
              <CheckCircle2
                size={20}
              />
            </div>

            <div className="pd-stat-info">
              <span>
                Tamamlanan
              </span>

              <strong>
                {completedTasks.length}
              </strong>
            </div>

            <ChevronRight
              size={17}
            />
          </button>

        </div>

        {/* MAIN */}

        <div className="pd-main-grid">

          <div
            className="pd-panel"
            ref={activeSectionRef}
          >

            <div className="pd-panel-header">

              <div>
                <h3>
                  Bana Atanan Görevler
                </h3>
              </div>

              <span className="pd-count">
                {activeTasks.length} Aktif
              </span>

            </div>

            <div className="pd-task-list">

              {activeTasks.length === 0 ? (

                <div className="pd-empty">
                  Şu an için sana
                  atanmış aktif bir görev
                  bulunmuyor.
                </div>

              ) : (

                activeTasks.map(
                  (task) => {
                    const isOverdue =
                      task.due_date &&
                      new Date(
                        task.due_date,
                      ) < today;

                    return (
                      <button
                        type="button"
                        key={task.id}
                        className={`pd-task-row ${
                          isOverdue
                            ? "overdue"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedTask(
                            task,
                          )
                        }
                      >

                        <span
                          role="button"
                          tabIndex={0}
                          className="pd-complete-toggle"
                          title="Tamamlandı olarak işaretle"
                          aria-label={`${task.title} görevini tamamlandı olarak işaretle`}
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            handleToggleComplete(
                              task,
                            );
                          }}
                          onKeyDown={(
                            event,
                          ) => {
                            if (
                              event.key ===
                                "Enter" ||
                              event.key ===
                                " "
                            ) {
                              event.preventDefault();
                              event.stopPropagation();

                              handleToggleComplete(
                                task,
                              );
                            }
                          }}
                        >
                          <CircleDashed
                            size={17}
                          />
                        </span>

                        <div className="pd-task-main">

                          <strong>
                            {task.title}
                          </strong>

                          <div className="pd-task-meta">

                            {task.project && (
                              <span>
                                {
                                  task
                                    .project
                                    .name
                                }
                              </span>
                            )}

                            {task.due_date && (
                              <span className="pd-task-date">
                                <Calendar
                                  size={12}
                                />

                                {formatDate(
                                  task.due_date,
                                )}
                              </span>
                            )}

                          </div>

                        </div>

                        <div className="pd-task-priority">

                          <i
                            className={`priority-dot ${task.priority}`}
                          />

                          {priorityText(
                            task.priority,
                          )}

                        </div>

                        <ChevronRight
                          size={15}
                          className="pd-row-arrow"
                        />

                      </button>
                    );
                  },
                )

              )}

            </div>

          </div>

          <div className="pd-side-stack">

            <div
              ref={overdueSectionRef}
            />

            {overdueTasks.length >
              0 && (

              <div className="pd-panel">

                <div className="pd-panel-header">
                  <h3 className="pd-danger">
                    Dikkat Gerektirenler
                  </h3>
                </div>

                <div className="pd-overdue-list">

                  {overdueTasks.map(
                    (task) => (

                      <button
                        type="button"
                        key={task.id}
                        className="pd-overdue-row"
                        onClick={() =>
                          setSelectedTask(
                            task,
                          )
                        }
                      >
                        <AlertCircle
                          size={15}
                        />

                        <div>
                          <strong>
                            {task.title}
                          </strong>

                          <span>
                            Son Tarih:{" "}
                            {task.due_date
                              ? new Date(
                                  task.due_date,
                                ).toLocaleDateString(
                                  "tr-TR",
                                )
                              : "-"}
                          </span>
                        </div>
                      </button>

                    ),
                  )}

                </div>

              </div>

            )}

            <div
              className="pd-panel"
              ref={completedSectionRef}
            >

              <div className="pd-panel-header">
                <h3>
                  Son Tamamlananlar
                </h3>
              </div>

              {completedTasks.length ===
              0 ? (

                <div className="pd-completed-empty">

                  <CheckCircle2
                    size={26}
                  />

                  <span>
                    Henüz tamamlanan
                    görev yok.
                  </span>

                </div>

              ) : (

                completedTasks
                  .slice(0, 5)
                  .map((task) => {

                    const canUndo =
                      canUndoCompletion(
                        task,
                      );

                    return (
                      <button
                        type="button"
                        key={task.id}
                        className="pd-task-row completed-row"
                        onClick={() =>
                          setSelectedTask(
                            task,
                          )
                        }
                      >

                        <span
                          role={
                            canUndo
                              ? "button"
                              : undefined
                          }
                          tabIndex={
                            canUndo
                              ? 0
                              : -1
                          }
                          className={`pd-complete-toggle completed ${
                            canUndo
                              ? "undoable"
                              : ""
                          }`}
                          title={
                            canUndo
                              ? "Tamamlanmayı geri al"
                              : "Tamamlandı"
                          }
                          onClick={(
                            event,
                          ) => {
                            if (
                              !canUndo
                            ) {
                              return;
                            }

                            event.stopPropagation();

                            handleToggleComplete(
                              task,
                            );
                          }}
                          onKeyDown={(
                            event,
                          ) => {
                            if (
                              !canUndo
                            ) {
                              return;
                            }

                            if (
                              event.key ===
                                "Enter" ||
                              event.key ===
                                " "
                            ) {
                              event.preventDefault();
                              event.stopPropagation();

                              handleToggleComplete(
                                task,
                              );
                            }
                          }}
                        >
                          <CheckCircle2
                            size={17}
                          />
                        </span>

                        <div className="pd-task-main">
                          <strong>
                            {task.title}
                          </strong>
                        </div>

                        <ChevronRight
                          size={15}
                        />

                      </button>
                    );
                  })

              )}

            </div>

          </div>

        </div>

      </section>

      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          onClose={() =>
            setSelectedTask(null)
          }
          onEdit={() => {}}
          onDelete={() => {}}
          onToggleComplete={
            handleToggleComplete
          }
          canUndoCompletion={
            selectedTask.status ===
              "done" &&
            canUndoCompletion(
              selectedTask,
            )
          }
          isStatusUpdating={
            toggleStatusMutation.isPending
          }
        />
      )}
    </>
  );
}