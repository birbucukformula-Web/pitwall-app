import { useState } from "react";
import {
  Bell,
  CalendarDays,
  Megaphone,
  Plus,
  X,
} from "lucide-react";

import "./Announcements.css";

type Announcement = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  important?: boolean;
};

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Web ekibi toplantısı",
    content:
      "Pitwall App frontend geliştirme süreci ve görev dağılımı için toplantı yapılacaktır.",
    author: "Rumeysa",
    date: "18 Ağustos 2026",
    important: true,
  },
  {
    id: 2,
    title: "Formula Student sitesi revizyonu",
    content:
      "Takım web sitesinde yapılacak revizyonlar için ilgili ekip üyelerinin görevlerini kontrol etmesi gerekiyor.",
    author: "Ahmet",
    date: "17 Ağustos 2026",
  },
  {
    id: 3,
    title: "Sponsor görüşmesi",
    content:
      "Yeni sponsor görüşmesi öncesinde sunum ve ilgili dokümanların son kontrolleri yapılacaktır.",
    author: "Rumeysa",
    date: "16 Ağustos 2026",
  },
];

export default function Announcements() {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);

  const [showModal, setShowModal] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [important, setImportant] =
    useState(false);

  /*
    Şimdilik örnek rol.
    Backend geldiğinde kullanıcı bilgisi API'den gelecek.
  */
  const currentUserRole:
    | "member"
    | "captain" = "captain";

  const canCreateAnnouncement =
    currentUserRole === "captain";

  function handleCreateAnnouncement() {
    if (
      !title.trim() ||
      !content.trim()
    ) {
      return;
    }

    const newAnnouncement: Announcement = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      author: "Lidya Su",
      date: new Intl.DateTimeFormat(
        "tr-TR",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      ).format(new Date()),
      important,
    };

    setAnnouncements(
      (previousAnnouncements) => [
        newAnnouncement,
        ...previousAnnouncements,
      ],
    );

    setTitle("");
    setContent("");
    setImportant(false);
    setShowModal(false);
  }

  return (
    <>
      <section className="announcements-page">
        <div className="announcements-header">
          <div>
            <h2>Duyurular</h2>

            <p>
              Takımla ilgili güncel bilgilendirmeleri
              buradan takip edebilirsin.
            </p>
          </div>

          {canCreateAnnouncement && (
            <button
              className="new-announcement-button"
              onClick={() =>
                setShowModal(true)
              }
            >
              <Plus size={18} />
              Yeni Duyuru
            </button>
          )}
        </div>

        <div className="announcements-layout">
          <div className="announcements-list">
            {announcements.map(
              (announcement) => (
                <article
                  className={`announcement-card ${
                    announcement.important
                      ? "important"
                      : ""
                  }`}
                  key={announcement.id}
                >
                  <div className="announcement-icon">
                    <Megaphone size={20} />
                  </div>

                  <div className="announcement-content">
                    <div className="announcement-title-row">
                      <h3>
                        {announcement.title}
                      </h3>

                      {announcement.important && (
                        <span className="important-badge">
                          Önemli
                        </span>
                      )}
                    </div>

                    <p>
                      {announcement.content}
                    </p>

                    <div className="announcement-meta">
                      <span>
                        {announcement.author}
                      </span>

                      <span className="meta-separator">
                        •
                      </span>

                      <span>
                        <CalendarDays
                          size={13}
                        />
                        {announcement.date}
                      </span>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>

          <aside className="announcement-info-card">
            <div className="announcement-info-icon">
              <Bell size={20} />
            </div>

            <h3>Takım Duyuruları</h3>

            <p>
              Kaptanlar ve yetkili kullanıcılar
              tarafından paylaşılan duyurular tüm
              takım üyelerine gösterilir.
            </p>

            <div className="announcement-count">
              <strong>
                {announcements.length}
              </strong>

              <span>
                Toplam duyuru
              </span>
            </div>
          </aside>
        </div>
      </section>

      {showModal && (
        <div
          className="announcement-modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >
          <div
            className="announcement-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="announcement-modal-header">
              <div>
                <span>YENİ DUYURU</span>
                <h3>Duyuru oluştur</h3>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="announcement-form">
              <label>
                Başlık

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Duyuru başlığı"
                />
              </label>

              <label>
                Açıklama

                <textarea
                  value={content}
                  onChange={(event) =>
                    setContent(
                      event.target.value,
                    )
                  }
                  placeholder="Duyuru içeriğini yaz..."
                  rows={5}
                />
              </label>

              <label className="important-option">
                <input
                  type="checkbox"
                  checked={important}
                  onChange={(event) =>
                    setImportant(
                      event.target.checked,
                    )
                  }
                />

                <span>
                  Önemli duyuru olarak işaretle
                </span>
              </label>
            </div>

            <div className="announcement-modal-footer">
              <button
                className="cancel-button"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Vazgeç
              </button>

              <button
                className="publish-button"
                onClick={
                  handleCreateAnnouncement
                }
                disabled={
                  !title.trim() ||
                  !content.trim()
                }
              >
                Duyuruyu Yayınla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}