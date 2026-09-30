import { useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  ListFilter,
  Target,
} from "lucide-react";

import { useAuth } from "../../../contexts/AuthContext";

import "./ProjectMilestonesTab.css";

type MilestoneStatus =
  | "planned"
  | "in_progress"
  | "completed";

type MilestoneFilter =
  | "all"
  | MilestoneStatus;

type Milestone = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: MilestoneStatus;
  isSystem?: boolean;
};

export default function ProjectMilestonesTab() {
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] =
    useState<MilestoneFilter>("all");

  const milestones = useMemo<Milestone[]>(() => {
    const items: Milestone[] = [];

    /*
     * Şimdilik backend'den gelen tek gerçek
     * hedef verisi organizasyon yarış tarihi.
     *
     * Milestone API geldiğinde proje/birim
     * hedefleri de bu diziye eklenecek.
     */
    if (user?.organization?.race_date) {
      const raceDate = new Date(
        user.organization.race_date,
      );

      const today = new Date();

      raceDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      items.push({
        id: "formula-student-race",
        title: "Formula Student",
        description:
          "Takımın ana yarışma tarihi.",
        dueDate:
          user.organization.race_date,
        status:
          raceDate < today
            ? "completed"
            : "planned",
        isSystem: true,
      });
    }

    return items;
  }, [user]);

  const counts = useMemo(
    () => ({
      all: milestones.length,

      completed: milestones.filter(
        (milestone) =>
          milestone.status === "completed",
      ).length,

      in_progress: milestones.filter(
        (milestone) =>
          milestone.status === "in_progress",
      ).length,

      planned: milestones.filter(
        (milestone) =>
          milestone.status === "planned",
      ).length,
    }),
    [milestones],
  );

  const filteredMilestones = useMemo(() => {
    if (activeFilter === "all") {
      return milestones;
    }

    return milestones.filter(
      (milestone) =>
        milestone.status === activeFilter,
    );
  }, [activeFilter, milestones]);

  const sortedMilestones = useMemo(() => {
    return [...filteredMilestones].sort(
      (a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return (
          new Date(a.dueDate).getTime() -
          new Date(b.dueDate).getTime()
        );
      },
    );
  }, [filteredMilestones]);

  function formatDate(
    value: string | null,
  ) {
    if (!value) {
      return "Tarih belirtilmemiş";
    }

    return new Date(
      value,
    ).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function getDaysText(
    value: string | null,
  ) {
    if (!value) {
      return null;
    }

    const target = new Date(value);
    const today = new Date();

    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const difference = Math.ceil(
      (target.getTime() -
        today.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (difference > 0) {
      return `${difference} gün kaldı`;
    }

    if (difference === 0) {
      return "Bugün";
    }

    return "Tamamlandı";
  }

  function getStatusLabel(
    status: MilestoneStatus,
  ) {
    if (status === "completed") {
      return "Tamamlandı";
    }

    if (status === "in_progress") {
      return "Devam ediyor";
    }

    return "Planlandı";
  }

  return (
    <div className="tab-pane active fade-in">
      <div className="milestones-page">

        {/* SUMMARY */}

        <section className="milestones-summary">
          <div className="milestone-summary-item">
            <div className="summary-icon total">
              <Target size={17} />
            </div>

            <div>
              <span>Toplam Hedef</span>
              <strong>{counts.all}</strong>
            </div>
          </div>

          <div className="milestone-summary-divider" />

          <div className="milestone-summary-item">
            <div className="summary-icon completed">
              <Check size={17} />
            </div>

            <div>
              <span>Tamamlanan</span>
              <strong>
                {counts.completed}
              </strong>
            </div>
          </div>

          <div className="milestone-summary-divider" />

          <div className="milestone-summary-item">
            <div className="summary-icon progress">
              <Clock3 size={17} />
            </div>

            <div>
              <span>Devam Eden</span>
              <strong>
                {counts.in_progress}
              </strong>
            </div>
          </div>

          <div className="milestone-summary-divider" />

          <div className="milestone-summary-item">
            <div className="summary-icon planned">
              <Circle size={17} />
            </div>

            <div>
              <span>Planlanan</span>
              <strong>
                {counts.planned}
              </strong>
            </div>
          </div>
        </section>

        {/* CONTENT */}

        <div className="milestones-layout">
          {/* FILTERS */}

          <aside className="milestones-sidebar">
            <div className="milestones-filter-list">
              <button
                type="button"
                className={
                  activeFilter === "all"
                    ? "milestone-filter active"
                    : "milestone-filter"
                }
                onClick={() =>
                  setActiveFilter("all")
                }
              >
                <span>
                  <ListFilter size={16} />
                  Tümü
                </span>

                <strong>{counts.all}</strong>
              </button>

              <button
                type="button"
                className={
                  activeFilter ===
                  "completed"
                    ? "milestone-filter active"
                    : "milestone-filter"
                }
                onClick={() =>
                  setActiveFilter(
                    "completed",
                  )
                }
              >
                <span>
                  <CheckCircle2 size={16} />
                  Tamamlanan
                </span>

                <strong>
                  {counts.completed}
                </strong>
              </button>

              <button
                type="button"
                className={
                  activeFilter ===
                  "in_progress"
                    ? "milestone-filter active"
                    : "milestone-filter"
                }
                onClick={() =>
                  setActiveFilter(
                    "in_progress",
                  )
                }
              >
                <span>
                  <Clock3 size={16} />
                  Devam Eden
                </span>

                <strong>
                  {counts.in_progress}
                </strong>
              </button>

              <button
                type="button"
                className={
                  activeFilter ===
                  "planned"
                    ? "milestone-filter active"
                    : "milestone-filter"
                }
                onClick={() =>
                  setActiveFilter(
                    "planned",
                  )
                }
              >
                <span>
                  <Circle size={16} />
                  Planlanan
                </span>

                <strong>
                  {counts.planned}
                </strong>
              </button>
            </div>

            <div className="milestones-sort">
              <span>Tarih Sıralaması</span>

              <button
                type="button"
                className="milestone-sort-option active"
              >
                <span className="sort-radio" />
                En Yakın Tarih
              </button>

              <button
                type="button"
                className="milestone-sort-option"
                disabled
              >
                <span className="sort-radio" />
                En Uzak Tarih
              </button>

              <button
                type="button"
                className="milestone-sort-option"
                disabled
              >
                <span className="sort-radio" />
                A-Z (Ada Göre)
              </button>
            </div>
          </aside>

          {/* TIMELINE */}

          <main className="milestones-content">
            <div className="milestone-section-title">
              <Clock3 size={17} />

              <span>
                {activeFilter === "all"
                  ? "HEDEFLER"
                  : activeFilter ===
                      "completed"
                    ? "TAMAMLANAN HEDEFLER"
                    : activeFilter ===
                        "in_progress"
                      ? "DEVAM EDEN HEDEFLER"
                      : "PLANLANAN HEDEFLER"}
              </span>
            </div>

            {sortedMilestones.length >
            0 ? (
              <div className="milestone-timeline">
                {sortedMilestones.map(
                  (milestone) => {
                    const daysText =
                      getDaysText(
                        milestone.dueDate,
                      );

                    return (
                      <div
                        className="milestone-timeline-row"
                        key={milestone.id}
                      >
                        <div className="milestone-timeline-marker">
                          <span
                            className={`timeline-dot ${milestone.status}`}
                          >
                            {milestone.status ===
                              "completed" && (
                              <Check
                                size={11}
                              />
                            )}
                          </span>
                        </div>

                        <article
                          className={`milestone-feature-card ${milestone.status}`}
                        >
                          <div className="milestone-card-main">
                            <div className="milestone-card-icon">
                              <Flag
                                size={20}
                              />
                            </div>

                            <div className="milestone-card-info">
                              <div className="milestone-card-title">
                                <h4>
                                  {
                                    milestone.title
                                  }
                                </h4>

                                {milestone.isSystem && (
                                  <span>
                                    Takım hedefi
                                  </span>
                                )}
                              </div>

                              <p>
                                {
                                  milestone.description
                                }
                              </p>

                              <div className="milestone-card-meta">
                                <span>
                                  <CalendarDays
                                    size={
                                      14
                                    }
                                  />

                                  {formatDate(
                                    milestone.dueDate,
                                  )}
                                </span>

                                <span
                                  className={`milestone-card-status ${milestone.status}`}
                                >
                                  {milestone.status ===
                                    "completed" && (
                                    <Check
                                      size={
                                        11
                                      }
                                    />
                                  )}

                                  {getStatusLabel(
                                    milestone.status,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="milestone-card-date-panel">
                            <span>Hedef tarihi</span>

                            <strong>
                              {formatDate(
                                milestone.dueDate,
                              )}
                            </strong>

                            {daysText && (
                              <small>
                                {daysText}
                              </small>
                            )}
                          </div>
                        </article>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="milestones-filter-empty">
                <Target size={23} />

                <strong>
                  Bu kategoride hedef yok
                </strong>

                <span>
                  Hedefler eklendiğinde burada
                  görüntülenecek.
                </span>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}