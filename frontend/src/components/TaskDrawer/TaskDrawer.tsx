import { useEffect, useState } from "react";

import {
    CalendarDays,
    MessageCircle,
    Send,
    X,
} from "lucide-react";

import type { Task } from "../../types/task";

import "./TaskDrawer.css";

type TaskDrawerProps = {
    task: Task | null;
    onClose: () => void;
};

type Comment = {
    id: number;
    user: string;
    initials: string;
    message: string;
    time: string;
};

const initialComments: Comment[] = [
    {
        id: 1,
        user: "Lidya Su",
        initials: "LS",
        message: "Sidebar tasarımını tamamladım.",
        time: "18 Ağustos, 14:32",
    },
    {
        id: 2,
        user: "Furkan",
        initials: "FK",
        message: "API bağlantısı için endpoint yapısını hazırlıyorum.",
        time: "18 Ağustos, 15:10",
    },
];

export default function TaskDrawer({
    task,
    onClose,
}: TaskDrawerProps) {
    const [comments, setComments] =
        useState<Comment[]>(initialComments);

    const [newComment, setNewComment] =
        useState("");

    useEffect(() => {
        setNewComment("");
    }, [task]);

    if (!task) return null;

    function handleAddComment() {
        const trimmedComment =
            newComment.trim();

        if (!trimmedComment) return;

        const comment: Comment = {
            id: Date.now(),
            user: "Lidya Su",
            initials: "LS",
            message: trimmedComment,
            time: new Intl.DateTimeFormat(
                "tr-TR",
                {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                },
            ).format(new Date()),
        };

        setComments((previousComments) => [
            ...previousComments,
            comment,
        ]);

        setNewComment("");
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
        return new Intl.DateTimeFormat("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date(date));
    }

    return (
        <>
            <div
                className="drawer-overlay"
                onClick={onClose}
            />

            <aside className="task-drawer">
                <div className="drawer-header">
                    <div>
                        <span className="drawer-project">
                            {task.department}
                        </span>

                        <h2>{task.title}</h2>
                    </div>

                    <button
                        className="drawer-close"
                        onClick={onClose}
                        aria-label="Görev detayını kapat"
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="drawer-content">
                    <section className="drawer-section task-information">
                        <div className="info-row">
                            <div className="info-row">
                                <span>Proje</span>
                                <strong>{task.project}</strong>
                            </div>
                            <span>Durum</span>

                            <strong className="status-badge">
                                {task.status === "todo" &&
                                    "Yapılacak"}

                                {task.status === "progress" &&
                                    "Devam Ediyor"}

                                {task.status === "review" &&
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
                                    : task.priority === "medium"
                                        ? "Orta"
                                        : "Normal"}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>Son Tarih</span>

                            <strong className="date-value">
                                <CalendarDays size={16} />
                                {formatDate(task.dueDate)}
                            </strong>
                        </div>
                    </section>

                    <section className="drawer-section">
                        <div className="section-title">
                            Atananlar
                        </div>

                        {task.assignees.map((assignee) => (
                            <div
                                className="drawer-assignee"
                                key={assignee.id}
                                title={assignee.name}
                            >
                                {assignee.initials}
                            </div>
                        ))}
                    </section>

                    <section className="drawer-section">
                        <div className="section-title">
                            Açıklama
                        </div>

                        <p className="task-description">
                            {task.description}
                        </p>
                    </section>

                    <section className="drawer-section comments-section">
                        <div className="comments-heading">
                            <div className="section-title">
                                Yorumlar
                            </div>

                            <span>
                                <MessageCircle size={15} />
                                {comments.length}
                            </span>
                        </div>

                        <div className="comment-list">
                            {comments.map(
                                (comment) => (
                                    <article
                                        className="comment"
                                        key={comment.id}
                                    >
                                        <div className="comment-avatar">
                                            {comment.initials}
                                        </div>

                                        <div className="comment-body">
                                            <div className="comment-meta">
                                                <strong>
                                                    {comment.user}
                                                </strong>

                                                <span>
                                                    {comment.time}
                                                </span>
                                            </div>

                                            <p>
                                                {comment.message}
                                            </p>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>
                </div>

                <div className="comment-composer">
                    <div className="composer-avatar">
                        LS
                    </div>

                    <div className="composer-input">
                        <textarea
                            value={newComment}
                            onChange={(event) =>
                                setNewComment(
                                    event.target.value,
                                )
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Yorum yaz..."
                            rows={2}
                        />

                        <button
                            onClick={handleAddComment}
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