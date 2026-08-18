import {
  ArrowRight,
  FolderKanban,
  Users,
} from "lucide-react";

import "./Projects.css";

import { useNavigate } from "react-router-dom";

type Project = {
  id: number;
  name: string;
  description: string;
  totalTasks: number;
  completedTasks: number;
  members: string[];
};

const projects: Project[] = [
  {
    id: 1,
    name: "Pitwall App",
    description:
      "Takım içi görev, proje ve çalışma takibi için geliştirilen uygulama.",
    totalTasks: 12,
    completedTasks: 7,
    members: ["LS", "FK", "BC", "MK"],
  },
  {
    id: 2,
    name: "Formula Student Web Sitesi",
    description:
      "1.5 Adana Formula Student takımının resmi web sitesi.",
    totalTasks: 8,
    completedTasks: 6,
    members: ["LS", "BC", "EA"],
  },
  {
    id: 3,
    name: "Araç Telemetri Sistemi",
    description:
      "Araç verilerinin takip ve analiz edildiği telemetri sistemi.",
    totalTasks: 15,
    completedTasks: 5,
    members: ["FK", "TA", "MK"],
  },
];

export default function Projects() {
  const navigate = useNavigate();
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
        {projects.map((project) => {
          const progress = Math.round(
            (project.completedTasks /
              project.totalTasks) *
            100,
          );

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