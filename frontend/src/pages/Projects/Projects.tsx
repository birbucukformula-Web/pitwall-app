import {
  ArrowRight,
  Users,
} from "lucide-react";

import "./Projects.css";

import { useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { metadataApi } from "../../api/metadata";
import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../contexts/AuthContext";

export default function Projects() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    data: units = [],
    isLoading: isUnitsLoading,
  } = useQuery({
    queryKey: ["units"],
    queryFn: () =>
      metadataApi.getUnits(),
  });

  const {
    data: tasks = [],
    isLoading: isTasksLoading,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () =>
      tasksApi.getTasks(),
  });

  const myUnitIds = useMemo(() => {
    if (!user) {
      return new Set<number>();
    }

    const ids = tasks
      .filter((task) =>
        task.assignees?.some(
          (assignee) =>
            assignee.id === user.id,
        ),
      )
      .map((task) => task.unit?.id)
      .filter(
        (id): id is number =>
          typeof id === "number",
      );

    return new Set(ids);
  }, [tasks, user]);

  const myUnits = useMemo(() => {
    return units.filter((unit) =>
      myUnitIds.has(unit.id),
    );
  }, [units, myUnitIds]);

  const isLoading =
    isUnitsLoading ||
    isTasksLoading;

  if (isLoading) {
    return (
      <section className="projects-page">
        <div className="projects-loading">
          Takımlar yükleniyor...
        </div>
      </section>
    );
  }

  return (
    <section className="projects-page">
      <div className="projects-inner">

        <div className="projects-header">
          <h2>
            Projeler & Takımlar
          </h2>

          <p>
            Dahil olduğun takımların
            projelerini ve çalışma
            alanlarını buradan
            görüntüleyebilirsin.
          </p>
        </div>

        <div className="projects-section-header">

          <div>
            <h3>
              Takımlarım
            </h3>

            <p>
              Dahil olduğun takım veya
              takımları görüntüle.
            </p>
          </div>

          {myUnits.length > 0 && (
            <span className="projects-team-count">
              {myUnits.length} Takım
            </span>
          )}

        </div>

        {myUnits.length === 0 ? (

          <div className="projects-empty">

            <div className="projects-empty-icon">
              <Users size={23} />
            </div>

            <strong>
              Henüz bir takıma bağlı
              görevin bulunmuyor.
            </strong>

            <span>
              Bir takıma görev
              atandığında burada
              görüntülenecek.
            </span>

          </div>

        ) : (

          <div className="teams-grid">

            {myUnits.map((unit) => {

              const unitTasks =
                tasks.filter(
                  (task) =>
                    task.unit?.id ===
                    unit.id,
                );

              const activeTaskCount =
                unitTasks.filter(
                  (task) =>
                    task.status !==
                    "done",
                ).length;

              const projectIds =
                new Set(
                  unitTasks
                    .map(
                      (task) =>
                        task.project?.id,
                    )
                    .filter(
                      (
                        id,
                      ): id is number =>
                        typeof id ===
                        "number",
                    ),
                );

              const projectCount =
                projectIds.size;

              return (
                <button
                  type="button"
                  className="team-card"
                  key={unit.id}
                  onClick={() =>
                    navigate(
                      `/projects/${unit.id}`,
                    )
                  }
                >

                  <div className="team-card-icon">
                    <Users size={22} />
                  </div>

                  <div className="team-card-content">

                    <div className="team-card-title-row">
                      <h3>
                        {unit.name}
                      </h3>
                    </div>

                    <div className="team-card-meta">

                      <span>
                        {projectCount} proje
                      </span>

                      <i />

                      <span>
                        {activeTaskCount} aktif görev
                      </span>

                    </div>

                  </div>

                  <div className="team-card-arrow">
                    <ArrowRight
                      size={18}
                    />
                  </div>

                </button>
              );
            })}

          </div>

        )}

      </div>
    </section>
  );
}