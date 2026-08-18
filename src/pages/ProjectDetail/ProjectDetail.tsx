import { useMemo, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import KanbanColumn from "../../components/KanbanColumn/KanbanColumn";
import TaskDrawer from "../../components/TaskDrawer/TaskDrawer";

import { mockTasks } from "../../data/mockTasks";

import type { Task } from "../../types/task";

import "./ProjectDetail.css";

const projectMap: Record<
    string,
    {
        name: string;
        description: string;
        members: string[];
    }
> = {
    "1": {
        name: "Pitwall App",
        description:
            "Takım içi görev, proje ve çalışma takibi için geliştirilen uygulama.",
        members: ["LS", "FK", "BC", "MK"],
    },

    "2": {
        name: "Formula Student Web Sitesi",
        description:
            "1.5 Adana Formula Student takımının resmi web sitesi.",
        members: ["LS", "BC", "EA"],
    },

    "3": {
        name: "Araç Telemetri Sistemi",
        description:
            "Araç verilerinin takip ve analiz edildiği telemetri sistemi.",
        members: ["FK", "TA", "MK"],
    },
};

export default function ProjectDetail() {
    const navigate = useNavigate();
    const { projectId } = useParams();

    const [selectedTask, setSelectedTask] =
        useState<Task | null>(null);

    const project =
        projectMap[projectId ?? ""];

    const projectTasks = useMemo(() => {
        if (!project) return [];

        return mockTasks.filter(
            (task) =>
                task.project === project.name,
        );
    }, [project]);

    if (!project) {
        return (
            <section className="project-detail-page">
                <h2>Proje bulunamadı.</h2>
            </section>
        );
    }

    const [showMembers, setShowMembers] = useState(false);

    const completedCount =
        projectTasks.filter(
            (task) => task.status === "done",
        ).length;

    const progress =
        projectTasks.length === 0
            ? 0
            : Math.round(
                (completedCount /
                    projectTasks.length) *
                100,
            );

    return (
        <>
            <section className="project-detail-page">
                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/projects")
                    }
                >
                    <ArrowLeft size={17} />
                    Projelere dön
                </button>

                <div className="project-detail-header">
                    <div>
                        <span className="project-label">
                            PROJE
                        </span>

                        <h2>{project.name}</h2>

                        <p>{project.description}</p>
                    </div>

                    <div className="project-detail-members-wrapper">
                        <button
                            className="project-detail-members"
                            onClick={() =>
                                setShowMembers((prev) => !prev)
                            }
                        >
                            <Users size={17} />

                            <div className="detail-avatars">
                                {project.members.map((member) => (
                                    <span key={member}>
                                        {member}
                                    </span>
                                ))}
                            </div>
                        </button>

                        {showMembers && (
                            <div className="members-popover">
                                <div className="members-popover-header">
                                    Proje Üyeleri
                                </div>

                                <div className="members-list">
                                    {project.members.map((member) => (
                                        <div
                                            className="member-item"
                                            key={member}
                                        >
                                            <span className="member-avatar">
                                                {member}
                                            </span>

                                            <div>
                                                <strong>
                                                    {member === "LS" && "Lidya Su"}
                                                    {member === "FK" && "Furkan"}
                                                    {member === "BC" && "Busenur"}
                                                    {member === "MK" && "Mert"}
                                                </strong>

                                                <span>
                                                    Proje üyesi
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <section className="project-summary">
                    <div>
                        <span>Toplam Görev</span>
                        <strong>
                            {projectTasks.length}
                        </strong>
                    </div>

                    <div>
                        <span>Devam Eden</span>
                        <strong>
                            {
                                projectTasks.filter(
                                    (task) =>
                                        task.status ===
                                        "progress",
                                ).length
                            }
                        </strong>
                    </div>

                    <div>
                        <span>İncelemede</span>
                        <strong>
                            {
                                projectTasks.filter(
                                    (task) =>
                                        task.status ===
                                        "review",
                                ).length
                            }
                        </strong>
                    </div>

                    <div>
                        <span>Tamamlanan</span>
                        <strong>
                            {completedCount}
                        </strong>
                    </div>
                </section>

                <div className="project-progress-box">
                    <div>
                        <span>Proje İlerlemesi</span>
                        <strong>%{progress}</strong>
                    </div>

                    <div className="project-detail-progress">
                        <div
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                <section className="project-task-board">
                    <div className="project-task-heading">
                        <div>
                            <h3>Proje Görevleri</h3>
                            <p>
                                Bu projeye ait görevlerin güncel durumu.
                            </p>
                        </div>
                    </div>

                    <div className="kanban">
                        <KanbanColumn
                            title="Yapılacak"
                            status="todo"
                            tasks={projectTasks}
                            onTaskClick={setSelectedTask}
                        />

                        <KanbanColumn
                            title="Devam Ediyor"
                            status="progress"
                            tasks={projectTasks}
                            onTaskClick={setSelectedTask}
                        />

                        <KanbanColumn
                            title="İncelemede"
                            status="review"
                            tasks={projectTasks}
                            onTaskClick={setSelectedTask}
                        />

                        <KanbanColumn
                            title="Tamamlandı"
                            status="done"
                            tasks={projectTasks}
                            onTaskClick={setSelectedTask}
                        />
                    </div>
                </section>
            </section>

            <TaskDrawer
                task={selectedTask}
                onClose={() =>
                    setSelectedTask(null)
                }
            />
        </>
    );
}