import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../contexts/AuthContext";
import { CircleDashed, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import type { Task } from "../../types/task";
import "./Dashboard.css";
import TaskDrawer from "../../components/TaskDrawer/TaskDrawer";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getTasks(),
  });

  const myTasks = useMemo(() => {
    if (!user) return [];
    return allTasks.filter((task) =>
      task.assignees?.some((a: any) => a.id === user.id)
    );
  }, [allTasks, user]);

  const activeTasks = myTasks.filter((t) => t.status !== "done");
  const completedTasks = myTasks.filter((t) => t.status === "done");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = activeTasks.filter((t) => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    return dueDate < today;
  });

  if (isLoading) {
    return <div style={{ padding: "40px", color: "var(--text-muted)" }}>Yükleniyor...</div>;
  }

  return (
    <>
      <section className="personal-dashboard">
        <header className="pd-header">
          <div>
            <h2>Hoş Geldin, {user?.first_name}</h2>
            <p>Bugün seni bekleyen görevleri ve ilerlemeni buradan takip edebilirsin.</p>
          </div>
        </header>

        <div className="pd-stats-grid">
          <div className="pd-stat-card">
            <div className="pd-stat-icon" style={{ color: "var(--accent)", backgroundColor: "var(--accent-soft)" }}>
              <CircleDashed size={20} />
            </div>
            <div className="pd-stat-info">
              <span>Aktif Görevler</span>
              <strong>{activeTasks.length}</strong>
            </div>
          </div>
          <div className="pd-stat-card">
            <div className="pd-stat-icon" style={{ color: "#ff4d4f", backgroundColor: "rgba(255, 77, 79, 0.1)" }}>
              <AlertCircle size={20} />
            </div>
            <div className="pd-stat-info">
              <span>Geciken</span>
              <strong>{overdueTasks.length}</strong>
            </div>
          </div>
          <div className="pd-stat-card">
            <div className="pd-stat-icon" style={{ color: "#52c41a", backgroundColor: "rgba(82, 196, 26, 0.1)" }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="pd-stat-info">
              <span>Tamamlanan</span>
              <strong>{completedTasks.length}</strong>
            </div>
          </div>
        </div>

        <div className="pd-content-grid">
          <div className="pd-main-column">
            <div className="pd-panel">
              <div className="pd-panel-header">
                <h3>Bana Atanan Görevler</h3>
                <span className="pd-badge">{activeTasks.length} Aktif</span>
              </div>
              <div className="pd-task-list">
                {activeTasks.length === 0 ? (
                  <div className="pd-empty-state">
                    Şu an için sana atanmış aktif bir görev bulunmuyor.
                  </div>
                ) : (
                  activeTasks.map((task) => {
                    const isOverdue = task.due_date && new Date(task.due_date) < today;
                    return (
                      <div 
                        key={task.id} 
                        className={`pd-list-item ${isOverdue ? 'overdue' : ''}`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="pd-list-item-status">
                          <CircleDashed size={16} />
                        </div>
                        <div className="pd-list-item-content">
                          <h4>{task.title}</h4>
                          <div className="pd-list-item-meta">
                            {task.project && (
                              <span className="pd-meta-tag project">{task.project.name}</span>
                            )}
                            {task.due_date && (
                              <span className="pd-meta-date">
                                <Calendar size={12} />
                                {new Date(task.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="pd-list-item-priority">
                          <span className={`priority-dot ${task.priority}`} />
                          {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="pd-side-column">
            {overdueTasks.length > 0 && (
              <div className="pd-panel overdue-panel">
                <div className="pd-panel-header">
                  <h3 style={{ color: "#ff4d4f" }}>Dikkat Gerektirenler</h3>
                </div>
                <div className="pd-overdue-list">
                  {overdueTasks.map(task => (
                    <div key={task.id} className="pd-overdue-card" onClick={() => setSelectedTask(task)}>
                      <div className="pd-overdue-card-header">
                        <AlertCircle size={14} />
                        <span>Gecikti</span>
                      </div>
                      <h4>{task.title}</h4>
                      {task.due_date && <span>Son Tarih: {new Date(task.due_date).toLocaleDateString('tr-TR')}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pd-panel">
              <div className="pd-panel-header">
                <h3>Son Tamamlananlar</h3>
              </div>
              <div className="pd-task-list compact">
                {completedTasks.slice(0, 5).length === 0 ? (
                  <div className="pd-empty-state">Henüz tamamlanan görev yok.</div>
                ) : (
                  completedTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="pd-list-item done" onClick={() => setSelectedTask(task)}>
                      <div className="pd-list-item-status">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="pd-list-item-content">
                        <h4>{task.title}</h4>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}
    </>
  );
}