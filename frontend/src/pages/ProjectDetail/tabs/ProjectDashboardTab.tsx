import { useEffect, useState } from "react";

import {
  CheckCircle2,
  CircleDashed,
  Clock,
  Activity,
  Box,
  Wallet,
  TrendingDown,
  PiggyBank,
} from "lucide-react";

import type { Task } from "../../../types/task";
import { tasksApi } from "../../../api/tasks";

import "./ProjectDashboardTab.css";

interface Props {
  project: any;
  tasks: Task[];
}

interface TaskActivity {
  id: number;
  task: number;
  user: number;
  activity_type: string;
  content: string;
  created_at: string;
  user_info?: {
    id: number;
    name: string;
    initials: string;
  };
}

/*
 * TEMPORARY UI PREVIEW
 * Backend bütçe API'si hazır olduğunda bu veri kaldırılacak.
 */
const budgetPreview = {
  total: 120000,
  spent: 81600,
  categories: [
    {
      id: 1,
      name: "Donanım",
      amount: 42500,
    },
    {
      id: 2,
      name: "Yazılım / Servisler",
      amount: 18200,
    },
    {
      id: 3,
      name: "Üretim",
      amount: 12900,
    },
    {
      id: 4,
      name: "Diğer",
      amount: 8000,
    },
  ],
};

export default function ProjectDashboardTab({ tasks }: Props) {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;

  const reviewTasks = tasks.filter(
    (task) => task.status === "review"
  ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  const remainingBudget =
    budgetPreview.total - budgetPreview.spent;

  const budgetUsage =
    budgetPreview.total === 0
      ? 0
      : Math.round(
          (budgetPreview.spent / budgetPreview.total) * 100
        );

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      if (tasks.length === 0) {
        setActivities([]);
        setActivitiesLoading(false);
        return;
      }

      setActivitiesLoading(true);

      try {
        const results = await Promise.all(
          tasks.map(async (task) => {
            try {
              return await tasksApi.getActivities(task.id);
            } catch (error) {
              console.error(
                `Görev ${task.id} aktiviteleri alınamadı:`,
                error
              );

              return [];
            }
          })
        );

        if (cancelled) return;

        const allActivities: TaskActivity[] = results
          .flat()
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        setActivities(allActivities);
      } finally {
        if (!cancelled) {
          setActivitiesLoading(false);
        }
      }
    }

    loadActivities();

    return () => {
      cancelled = true;
    };
  }, [tasks]);

  function formatActivityDate(date: string) {
    const activityDate = new Date(date);

    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(activityDate);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="tab-pane active fade-in project-dashboard-tab">
      <div className="dashboard-overview-cards">
        <div className="overview-card">
          <div
            className="overview-icon"
            style={{ color: "var(--text-secondary)" }}
          >
            <Box size={24} />
          </div>

          <div className="overview-content">
            <span>Toplam Görev</span>
            <strong>{totalTasks}</strong>
            <small>Bu projede</small>
          </div>
        </div>

        <div className="overview-card">
          <div
            className="overview-icon"
            style={{ color: "#e21d2c" }}
          >
            <Activity size={24} />
          </div>

          <div className="overview-content">
            <span>Devam Ediyor</span>
            <strong>{inProgressTasks}</strong>
            <small>Aktif görev</small>
          </div>
        </div>

        <div className="overview-card">
          <div
            className="overview-icon"
            style={{ color: "#eab308" }}
          >
            <Clock size={24} />
          </div>

          <div className="overview-content">
            <span>İncelemede</span>
            <strong>{reviewTasks}</strong>
            <small>Onay bekliyor</small>
          </div>
        </div>

        <div className="overview-card">
          <div
            className="overview-icon"
            style={{ color: "#10b981" }}
          >
            <CheckCircle2 size={24} />
          </div>

          <div className="overview-content">
            <span>Tamamlanan</span>
            <strong>{completedTasks}</strong>
            <small>Tamamlanan görev</small>
          </div>
        </div>
      </div>

      <div className="dashboard-progress-section">
        <div className="progress-header">
          <h3>Proje İlerlemesi</h3>

          <span className="progress-percentage">
            %{progress}
          </span>
        </div>

        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="dashboard-widget activity-widget">
          <div className="activity-widget-header">
            <div>
              <h4>Son Aktiviteler</h4>
              <span>Projede gerçekleşen son hareketler</span>
            </div>

            <div className="activity-header-icon">
              <Activity size={19} />
            </div>
          </div>

          <div className="activity-widget-content">
            {activitiesLoading ? (
              <div className="empty-state">
                <CircleDashed size={28} />
                <p>Aktiviteler yükleniyor...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="empty-state">
                <Activity size={28} />
                <p>Henüz bir aktivite bulunmuyor.</p>
              </div>
            ) : (
              <div className="project-activity-list">
                {activities.map((activity) => {
                  const task = tasks.find(
                    (item) => item.id === activity.task
                  );

                  return (
                    <div
                      className="project-activity-item"
                      key={activity.id}
                    >
                      <div className="project-activity-avatar">
                        {activity.user_info?.initials ?? "?"}
                      </div>

                      <div className="project-activity-content">
                        <div className="project-activity-heading">
                          <strong>
                            {activity.user_info?.name ?? "Kullanıcı"}
                          </strong>

                          {task?.title && (
                            <>
                              <span className="project-activity-separator">
                                ·
                              </span>

                              <span className="project-activity-task-name">
                                {task.title}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="project-activity-description">
                          {activity.content}
                        </div>

                        <span className="project-activity-date">
                          {formatActivityDate(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-widget budget-widget">
          <div className="budget-widget-header">
            <div>
              <h4>Bütçe / Kaynak Durumu</h4>
              <span>Proje bütçesinin genel görünümü</span>
            </div>

            <div className="budget-header-icon">
              <Wallet size={19} />
            </div>
          </div>

          <div className="budget-content">
            <div className="budget-total-row">
              <div>
                <span className="budget-label">
                  Toplam Bütçe
                </span>

                <strong className="budget-total">
                  {formatCurrency(budgetPreview.total)}
                </strong>
              </div>

              <span className="budget-percentage">
                %{budgetUsage} kullanıldı
              </span>
            </div>

            <div className="budget-progress">
              <div
                className="budget-progress-fill"
                style={{
                  width: `${budgetUsage}%`,
                }}
              />
            </div>

            <div className="budget-summary-grid">
              <div className="budget-summary-item">
                <div className="budget-summary-icon spent">
                  <TrendingDown size={17} />
                </div>

                <div>
                  <span>Kullanılan</span>
                  <strong>
                    {formatCurrency(budgetPreview.spent)}
                  </strong>
                </div>
              </div>

              <div className="budget-summary-item">
                <div className="budget-summary-icon remaining">
                  <PiggyBank size={17} />
                </div>

                <div>
                  <span>Kalan</span>
                  <strong>
                    {formatCurrency(remainingBudget)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="budget-divider" />

            <div className="budget-categories">
              <div className="budget-categories-header">
                <span>Kaynak Dağılımı</span>
              </div>

              {budgetPreview.categories.map((category) => {
                const categoryPercentage =
                  budgetPreview.spent === 0
                    ? 0
                    : Math.round(
                        (category.amount / budgetPreview.spent) *
                          100
                      );

                return (
                  <div
                    className="budget-category"
                    key={category.id}
                  >
                    <div className="budget-category-main">
                      <span>{category.name}</span>

                      <strong>
                        {formatCurrency(category.amount)}
                      </strong>
                    </div>

                    <div className="budget-category-track">
                      <div
                        className="budget-category-fill"
                        style={{
                          width: `${categoryPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}