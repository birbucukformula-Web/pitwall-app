import {
  ArrowRight,
  FolderKanban,
  Users,
} from "lucide-react";

import "./Projects.css";

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { metadataApi } from "../../api/metadata";
import { tasksApi } from "../../api/tasks";

export default function Projects() {
  const navigate = useNavigate();

  const { data: apiProjects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => metadataApi.getProjects(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getTasks(),
  });

  const projects = apiProjects.map((p) => {
    const projectTasks = tasks.filter((t) => t.project?.id === p.id);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === "done").length;

    const memberInitials = Array.from(
      new Set(
        projectTasks.flatMap((t) => t.assignees?.map((a) => a.initials) || [])
      )
    ).slice(0, 4);

    return {
      id: p.id,
      name: p.name,
      description: p.description || "Açıklama belirtilmemiş.",
      totalTasks,
      completedTasks,
      members: memberInitials,
    };
  });

  return (
    <section className="projects-page">
      <div className="projects-header">
        <div>
          <h2>Projeler</h2>

          <p>
            Dahil olduğun projeleri ve ilerleme durumlarını
            buradan takip edebilirsin.
          </p>
        </div>
      </div>

      <div className="projects-grid">
        {projects.length === 0 && !isProjectsLoading && (
          <div style={{ gridColumn: "1 / -1", padding: "40px", color: "var(--text-secondary)", textAlign: "center" }}>
            Henüz kayıtlı bir proje bulunmuyor.
          </div>
        )}
        {projects.map((project) => {
          const progress = project.totalTasks > 0
            ? Math.round((project.completedTasks / project.totalTasks) * 100)
            : 0;

          return (
            <article
              className="project-card"
              key={project.id}
            >
              <div className="project-card-top">
                <div className="project-icon">
                  <FolderKanban size={21} />
                </div>

                <span className="project-status">
                  Aktif
                </span>
              </div>

              <div className="project-content">
                <h3>{project.name}</h3>

                <p>{project.description}</p>
              </div>

              <div className="project-progress-section">
                <div className="project-progress-header">
                  <span>İlerleme</span>

                  <strong>
                    %{progress}
                  </strong>
                </div>

                <div className="project-progress">
                  <div
                    className="project-progress-value"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="project-stats">
                <div>
                  <strong>
                    {project.totalTasks}
                  </strong>

                  <span>Toplam görev</span>
                </div>

                <div>
                  <strong>
                    {project.completedTasks}
                  </strong>

                  <span>Tamamlandı</span>
                </div>

                <div>
                  <strong>
                    {project.totalTasks -
                      project.completedTasks}
                  </strong>

                  <span>Kalan</span>
                </div>
              </div>

              <div className="project-footer">
                <div className="project-members">
                  <Users size={15} />

                  <div className="project-avatars">
                    {project.members.map(
                      (member) => (
                        <span key={member}>
                          {member}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <button
                  className="project-open-button"
                  onClick={() =>
                    navigate(`/projects/${project.id}`)
                  }
                >
                  Projeyi Aç
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}