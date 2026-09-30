import { LayoutDashboard, CheckCircle2, CircleDashed, Clock, Activity, Box } from "lucide-react";
import type { Task } from "../../../types/task";

interface Props {
  project: any;
  tasks: Task[];
}

export default function ProjectDashboardTab({ tasks }: Props) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const reviewTasks = tasks.filter((t) => t.status === "review").length;
  
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="tab-pane active fade-in">
      <div className="dashboard-overview-cards">
        <div className="overview-card">
          <div className="overview-icon" style={{ color: "var(--text-secondary)" }}>
            <Box size={24} />
          </div>
          <div className="overview-content">
            <span>Toplam Görev</span>
            <strong>{totalTasks}</strong>
            <small>Bu projede</small>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon" style={{ color: "#e21d2c" }}>
            <Activity size={24} />
          </div>
          <div className="overview-content">
            <span>Devam Ediyor</span>
            <strong>{inProgressTasks}</strong>
            <small>Aktif görev</small>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon" style={{ color: "#eab308" }}>
            <Clock size={24} />
          </div>
          <div className="overview-content">
            <span>İncelemede</span>
            <strong>{reviewTasks}</strong>
            <small>Onay bekliyor</small>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon" style={{ color: "#10b981" }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="overview-content">
            <span>Tamamlanan</span>
            <strong>{completedTasks}</strong>
            <small>Tamamlanan görev</small>
          </div>
        </div>
      </div>

      <div className="dashboard-progress-section mt-4">
        <div className="progress-header">
          <h3>Proje İlerlemesi</h3>
          <span className="progress-percentage">%{progress}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="dashboard-widgets mt-4">
        <div className="dashboard-widget placeholder-widget">
          <h4>Son Aktiviteler</h4>
          <div className="empty-state">
            <CircleDashed size={32} />
            <p>Aktivite geçmişi yakında eklenecek.</p>
          </div>
        </div>
        <div className="dashboard-widget placeholder-widget">
          <h4>Bütçe / Kaynak Durumu</h4>
          <div className="empty-state">
            <LayoutDashboard size={32} />
            <p>Bütçe modülü yakında eklenecek.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
