import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  LayoutDashboard,
  CheckSquare,
  Flag,
  FolderOpen,
  BookOpen,
  CalendarDays,
  Settings,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "../../api/tasks";
import { metadataApi } from "../../api/metadata";

import type { Task } from "../../types/task";

import ProjectDashboardTab from "./tabs/ProjectDashboardTab";
import ProjectTasksTab from "./tabs/ProjectTasksTab";
import ProjectMilestonesTab from "./tabs/ProjectMilestonesTab";
import ProjectFilesTab from "./tabs/ProjectFilesTab";
import ProjectWikiTab from "./tabs/ProjectWikiTab";
import ProjectCalendarTab from "./tabs/ProjectCalendarTab";
import ProjectSettingsTab from "./tabs/ProjectSettingsTab";

import "./ProjectDetail.css";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);

  const { data: apiUnits = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ["units"],
    queryFn: () => metadataApi.getUnits(),
  });

  const { data: fetchedTasks } = useQuery({
    queryKey: ["tasks", { unit: Number(projectId) }],
    queryFn: () => tasksApi.getTasks({ unit: Number(projectId) }),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  const rawProject = apiUnits.find((u: any) => u.id === Number(projectId));

  const projectTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.order - b.order);
  }, [tasks]);

  const projectMembers = useMemo(() => {
    const map = new Map<number, { id: number; name: string; initials: string }>();
    projectTasks.forEach((t) => {
      t.assignees?.forEach((a) => {
        if (!map.has(a.id)) {
          map.set(a.id, a);
        }
      });
    });
    return Array.from(map.values());
  }, [projectTasks]);

  const project = rawProject
    ? {
        id: rawProject.id,
        name: rawProject.name,
        description: (rawProject as any).description || "Açıklama belirtilmemiş.",
        members: projectMembers,
      }
    : null;


  if (isProjectsLoading) {
    return (
      <section className="project-detail-page">
        <div style={{ padding: "40px", color: "var(--text-secondary)" }}>
          Proje yükleniyor...
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="project-detail-page">
        <h2>
          Proje bulunamadı.
        </h2>
        <p style={{ marginTop: "12px" }}>
          <button
            type="button"
            className="project-back-button"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft size={16} /> Projelere Dön
          </button>
        </p>
      </section>
    );
  }

  return (
    <section className="project-detail-page">
      {/* Top Breadcrumb & Title */}
      <div className="project-detail-topbar">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft size={17} />
          Projelere dön
        </button>
        
        <div className="project-detail-header-compact">
          <div className="project-title-wrapper">
            <div className="project-avatar-placeholder">
              {project.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2>{project.name}</h2>
              <span className="project-label">BİRİM / DEPARTMAN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="project-tabs-navigation">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={16} /> Genel Bakış
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={16} /> Görevler
        </button>
        <button 
          className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          <Flag size={16} /> Hedefler
        </button>
        <button 
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <FolderOpen size={16} /> Dosyalar
        </button>
        <button 
          className={`tab-btn ${activeTab === 'wiki' ? 'active' : ''}`}
          onClick={() => setActiveTab('wiki')}
        >
          <BookOpen size={16} /> Wiki
        </button>
        <button 
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarDays size={16} /> Takvim
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} /> Ayarlar
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="project-tab-content-area">
        {activeTab === 'dashboard' && <ProjectDashboardTab project={project} tasks={tasks} />}
        {activeTab === 'tasks' && <ProjectTasksTab projectId={Number(projectId)} project={project} tasks={tasks} setTasks={setTasks} />}
        {activeTab === 'milestones' && <ProjectMilestonesTab />}
        {activeTab === 'files' && <ProjectFilesTab />}
        {activeTab === 'wiki' && <ProjectWikiTab />}
        {activeTab === 'calendar' && <ProjectCalendarTab project={project} tasks={tasks} />}
        {activeTab === 'settings' && <ProjectSettingsTab project={project} />}
      </div>
      
    </section>
  );
}