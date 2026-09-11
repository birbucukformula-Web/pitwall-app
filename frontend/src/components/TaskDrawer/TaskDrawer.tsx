import { useEffect, useState } from "react";

import {
    CalendarDays,
    MessageCircle,
    Pencil,
    Send,
    Trash2,
    X,
} from "lucide-react";

import type { Task } from "../../types/task";

import "./TaskDrawer.css";

type TaskDrawerProps = {
    task: Task | null;
    onClose: () => void;
    onEdit?: (task: Task) => void;
    onDelete?: (task: Task) => void;
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../contexts/AuthContext";

export default function TaskDrawer({
    task,
    onClose,
    onEdit,
    onDelete,
}: TaskDrawerProps) {
    const { user } = useAuth();
    const currentUserInitials = user ? (user.first_name ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : user.email[0].toUpperCase()) : "?";

    const [newComment, setNewComment] = useState("");

    const { data: activities = [] } = useQuery({
        queryKey: ["activities", task?.id],
        queryFn: () => task ? tasksApi.getActivities(task.id) : [],
        enabled: !!task,
    });

    const queryClient = useQueryClient();
    const createActivityMutation = useMutation({
        mutationFn: (content: string) => tasksApi.createActivity(task!.id, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["activities", task?.id] });
            setNewComment("");
        }
    });

    useEffect(() => {
        setNewComment("");
    }, [task]);

    if (!task) return null;

    function handleAddComment() {
        const trimmedComment = newComment.trim();
        if (!trimmedComment) return;
        createActivityMutation.mutate(trimmedComment);
    }

    function handleKeyDown(
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            handleAddComment();
        }
    }

    function formatDate(date: string) {
        return new Intl.DateTimeFormat(
            "tr-TR",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            },
        ).format(new Date(date));
    }

    return (
        <>
            <div
                className="drawer-overlay"
                onClick={onClose}
            />

            <aside className="task-drawer">
                {/* HEADER */}

                <div className="drawer-header">
                    <div>
                        <span className="drawer-project">
                            {task.unit?.name ?? "Birim yok"} -{" "}
                        </span>

                        <h2>{task.title}</h2>
                    </div>

                    <div className="drawer-header-actions">
                        {onEdit && (
                            <button
                                type="button"
                                className="drawer-edit"
                                onClick={() => onEdit(task)}
                            >
                                <Pencil size={15} />
                                Düzenle
                            </button>
                        )}

                        {onDelete && (
                            <button
                                type="button"
                                className="drawer-delete"
                                onClick={() => onDelete(task)}
                            >
                                <Trash2 size={15} />
                                Sil
                            </button>
                        )}

                        <button
                            type="button"
                            className="drawer-close"
                            onClick={onClose}
                            aria-label="Görev detayını kapat"
                        >
                            <X size={21} />
                        </button>
                    </div>
                </div>

                <div className="drawer-content">
                    {/* TASK INFORMATION */}

                    <section className="drawer-section task-information">
                        <div className="info-row">
                            <span>Proje</span>

                            <strong>
                                {task.project?.name ?? "Proje yok"}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>Durum</span>

                            <strong className="status-badge">
                                {task.status === "todo" &&
                                    "Yapılacak"}

                                {task.status ===
                                    "in_progress" &&
                                    "Devam Ediyor"}

                                {task.status ===
                                    "review" &&
                                    "İncelemede"}

                                {task.status === "done" &&
                                    "Tamamlandı"}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>Öncelik</span>

                            <strong>
                                {task.priority === "high"
                                    ? "Yüksek"
                                    : task.priority ===
                                        "medium"
                                        ? "Orta"
                                        : "Normal"}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>Son Tarih</span>

                            <strong className="date-value">
                                <CalendarDays
                                    size={16}
                                />

                                {formatDate(
                                    task.due_date,
                                )}
                            </strong>
                        </div>
                    </section>

                    {/* ASSIGNEES */}

                    <section className="drawer-section">
                        <div className="section-title">
                            Atananlar
                        </div>

                        <div className="drawer-assignees">
                            {task.assignees.map(
                                (assignee) => (
                                    <div
                                        className="drawer-assignee-row"
                                        key={assignee.id}
                                    >
                                        <div className="drawer-assignee">
                                            {assignee.initials}
                                        </div>

                                        <strong>
                                            {assignee.name}
                                        </strong>
                                    </div>
                                ),
                            )}
                        </div>
                    </section>

                    {/* DESCRIPTION */}

                    <section className="drawer-section">
                        <div className="section-title">
                            Açıklama
                        </div>

                        <p className="task-description">
                            {task.description}
                        </p>
                    </section>

                    {/* COMMENTS */}

                    <section className="drawer-section comments-section">
                        <div className="comments-heading">
                            <div className="section-title">
                                Yorumlar
                            </div>

                            <span>
                                <MessageCircle
                                    size={15}
                                />

                                {activities.length}
                            </span>
                        </div>

                        <div className="comment-list">
                            {activities.map(
                                (activity: any) => (
                                    <article
                                        className="comment"
                                        key={activity.id}
                                    >
                                        <div className="comment-avatar">
                                            {activity.user_info?.initials}
                                        </div>

                                        <div className="comment-body">
                                            <div className="comment-meta">
                                                <strong>
                                                    {activity.user_info?.name}
                                                </strong>

                                                <span>
                                                    {new Date(activity.created_at).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <p style={{ fontStyle: activity.activity_type === 'status_change' ? 'italic' : 'normal', color: activity.activity_type === 'status_change' ? 'var(--text-muted)' : 'inherit' }}>
                                                {activity.content}
                                            </p>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>
                </div>

                {/* COMMENT COMPOSER */}

                <div className="comment-composer">
                    <div className="composer-avatar">
                        {currentUserInitials}
                    </div>

                    <div className="composer-input">
                        <textarea
                            value={newComment}
                            onChange={(event) =>
                                setNewComment(
                                    event.target.value,
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                            placeholder="Yorum yaz..."
                            rows={2}
                        />

                        <button
                            type="button"
                            onClick={
                                handleAddComment
                            }
                            disabled={
                                !newComment.trim()
                            }
                            aria-label="Yorumu gönder"
                        >
                            <Send size={17} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}