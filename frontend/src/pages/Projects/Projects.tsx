import { useState } from "react";

import {
  ArrowRight,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Code2,
  Cpu,
  Database,
  FolderOpen,
  Gauge,
  Globe2,
  Layers3,
  MonitorSmartphone,
  Users,
  Wrench,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./Projects.css";

/*
 * TEMPORARY UI PREVIEW
 * ---------------------------------------------------------
 * Backend department -> units ilişkisini döndürdüğünde
 * bu mock veri kaldırılacak ve API verisine bağlanacak.
 */

type UnitPreview = {
  id: number;
  name: string;
  description: string;
  projects: number;
  activeTasks: number;
  members: number;
  icon:
    | "web"
    | "mobile"
    | "data"
    | "backend"
    | "embedded"
    | "telemetry"
    | "mechanical";
};

type TeamPreview = {
  id: string;
  name: string;
  description: string;
  projects: number;
  activeTasks: number;
  members: number;
  icon: "software" | "electronics" | "mechanical";
  units: UnitPreview[];
};

const previewTeams: TeamPreview[] = [
  {
    id: "software",
    name: "Yazılım Takımı",
    description: "Web · Mobil · Backend · Veri Analitiği",
    projects: 5,
    activeTasks: 18,
    members: 12,
    icon: "software",
    units: [
      {
        id: 1,
        name: "Web Birimi",
        description: "Frontend · Backend · DevOps",
        projects: 3,
        activeTasks: 9,
        members: 5,
        icon: "web",
      },
      {
        id: 2,
        name: "Mobil Birimi",
        description: "Android · iOS",
        projects: 2,
        activeTasks: 5,
        members: 4,
        icon: "mobile",
      },
      {
        id: 3,
        name: "Veri Analitiği",
        description: "Veri İşleme · Telemetri · Raporlama",
        projects: 1,
        activeTasks: 3,
        members: 3,
        icon: "data",
      },
      {
        id: 4,
        name: "Backend Birimi",
        description: "API · Sunucu · Veri Tabanı",
        projects: 2,
        activeTasks: 4,
        members: 4,
        icon: "backend",
      },
    ],
  },
  {
    id: "electronics",
    name: "Elektronik Takımı",
    description: "Elektronik · Gömülü Sistemler · Telemetri",
    projects: 4,
    activeTasks: 11,
    members: 9,
    icon: "electronics",
    units: [
      {
        id: 5,
        name: "Gömülü Sistemler",
        description: "MCU · Sensörler · Haberleşme",
        projects: 2,
        activeTasks: 5,
        members: 4,
        icon: "embedded",
      },
      {
        id: 6,
        name: "Telemetri Birimi",
        description: "CAN · Veri Toplama · İzleme",
        projects: 2,
        activeTasks: 6,
        members: 5,
        icon: "telemetry",
      },
    ],
  },
  {
    id: "mechanical",
    name: "Mekanik Takımı",
    description: "Şasi · Süspansiyon · Üretim",
    projects: 3,
    activeTasks: 8,
    members: 7,
    icon: "mechanical",
    units: [
      {
        id: 7,
        name: "Şasi Birimi",
        description: "Şasi · Tasarım · Analiz",
        projects: 1,
        activeTasks: 3,
        members: 3,
        icon: "mechanical",
      },
      {
        id: 8,
        name: "Süspansiyon",
        description: "Geometri · Dinamik · Test",
        projects: 1,
        activeTasks: 3,
        members: 2,
        icon: "mechanical",
      },
      {
        id: 9,
        name: "Üretim Birimi",
        description: "İmalat · Montaj · Atölye",
        projects: 1,
        activeTasks: 2,
        members: 2,
        icon: "mechanical",
      },
    ],
  },
];

function TeamIcon({
  type,
}: {
  type: TeamPreview["icon"];
}) {
  switch (type) {
    case "electronics":
      return <Cpu size={22} />;

    case "mechanical":
      return <Wrench size={22} />;

    default:
      return <MonitorSmartphone size={22} />;
  }
}

function UnitIcon({
  type,
}: {
  type: UnitPreview["icon"];
}) {
  switch (type) {
    case "web":
      return <Globe2 size={19} />;

    case "mobile":
      return <MonitorSmartphone size={19} />;

    case "data":
      return <Database size={19} />;

    case "backend":
      return <Code2 size={19} />;

    case "embedded":
      return <Cpu size={19} />;

    case "telemetry":
      return <Gauge size={19} />;

    case "mechanical":
      return <Wrench size={19} />;

    default:
      return <Layers3 size={19} />;
  }
}

export default function Projects() {
  const navigate = useNavigate();

  const [expandedTeam, setExpandedTeam] =
    useState<string | null>("software");

  const toggleTeam = (teamId: string) => {
    setExpandedTeam((current) =>
      current === teamId ? null : teamId,
    );
  };

  const handleUnitClick = (unitId: number) => {
    /*
     * Şimdilik mock ID.
     *
     * Backend department -> units verisi geldiğinde
     * gerçek unit.id kullanılacak ve mevcut
     * /projects/:unitId yapısı devam edecek.
     */
    navigate(`/projects/${unitId}`);
  };

  return (
    <section className="projects-page">
      <div className="projects-inner">
        <div className="projects-section-header">
          <div>
            <h2>Takımlarım</h2>

            <p>
              Dahil olduğun takımların birimlerini,
              projelerini ve çalışma alanlarını buradan
              görüntüleyebilirsin.
            </p>
          </div>

          <span className="projects-team-count">
            {previewTeams.length} Takım
          </span>
        </div>

        <div className="teams-list">
          {previewTeams.map((team) => {
            const isExpanded =
              expandedTeam === team.id;

            return (
              <article
                className={`team-group ${
                  isExpanded ? "is-expanded" : ""
                }`}
                key={team.id}
              >
                <button
                  type="button"
                  className="team-row"
                  onClick={() => toggleTeam(team.id)}
                  aria-expanded={isExpanded}
                >
                  <div
                    className={`team-main-icon team-main-icon--${team.icon}`}
                  >
                    <TeamIcon type={team.icon} />
                  </div>

                  <div className="team-row-content">
                    <h3>{team.name}</h3>

                    <span>{team.description}</span>
                  </div>

                  <div className="team-row-stats">
                    <div className="team-stat">
                      <FolderOpen size={17} />

                      <div>
                        <strong>
                          {team.projects}
                        </strong>

                        <span>Proje</span>
                      </div>
                    </div>

                    <div className="team-stat">
                      <CheckSquare size={17} />

                      <div>
                        <strong>
                          {team.activeTasks}
                        </strong>

                        <span>Aktif Görev</span>
                      </div>
                    </div>

                    <div className="team-stat">
                      <Users size={17} />

                      <div>
                        <strong>
                          {team.members}
                        </strong>

                        <span>Üye</span>
                      </div>
                    </div>
                  </div>

                  <div className="team-expand-icon">
                    {isExpanded ? (
                      <ChevronUp size={19} />
                    ) : (
                      <ChevronDown size={19} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="team-units-section">
                    <div className="team-units-header">
                      <div className="team-units-title">
                        <h4>Birimler</h4>

                        <span>
                          {team.units.length} Birim
                        </span>
                      </div>
                    </div>

                    <div className="team-units-grid">
                      {team.units.map((unit) => (
                        <button
                          type="button"
                          className="unit-card"
                          key={unit.id}
                          onClick={() =>
                            handleUnitClick(unit.id)
                          }
                        >
                          <div className="unit-card-top">
                            <div
                              className={`unit-card-icon unit-card-icon--${unit.icon}`}
                            >
                              <UnitIcon
                                type={unit.icon}
                              />
                            </div>

                            <div className="unit-card-heading">
                              <h5>{unit.name}</h5>

                              <span>
                                {unit.description}
                              </span>
                            </div>

                            <div className="unit-card-arrow">
                              <ArrowRight size={18} />
                            </div>
                          </div>

                          <div className="unit-card-stats">
                            <div className="unit-stat">
                              <FolderOpen size={15} />

                              <strong>
                                {unit.projects}
                              </strong>

                              <span>Proje</span>
                            </div>

                            <div className="unit-stat">
                              <CheckSquare size={15} />

                              <strong>
                                {unit.activeTasks}
                              </strong>

                              <span>
                                Aktif Görev
                              </span>
                            </div>

                            <div className="unit-stat">
                              <Users size={15} />

                              <strong>
                                {unit.members}
                              </strong>

                              <span>Üye</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}