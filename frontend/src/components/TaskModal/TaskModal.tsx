import { useState } from "react";
import { X } from "lucide-react";

import type {
  Assignee,
  Task,
} from "../../types/task";

import "./TaskModal.css";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
  defaultStatus?: Task["status"];
};

const teamMembers: Assignee[] = [
  {
    id: 1,
    name: "Lidya Su",
    initials: "LS",
  },
  {
    id: 2,
    name: "Furkan",
    initials: "FK",
  },
  {
    id: 3,
    name: "Busenur",
    initials: "BC",
  },
  {
    id: 4,
    name: "Mert",
    initials: "MK",
  },
];

export default function TaskModal({
  isOpen,
  onClose,
  onCreate,
  defaultStatus = "todo",
}: TaskModalProps) {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [project, setProject] =
    useState("Pitwall App");

  const [department, setDepartment] =
    useState("Web & Yazılım");

  const [priority, setPriority] =
    useState<Task["priority"]>("medium");

  const [dueDate, setDueDate] =
    useState("");

  const [assignees, setAssignees] =
    useState<Assignee[]>([]);

  const [
    showAssigneePicker,
    setShowAssigneePicker,
  ] = useState(false);

  const [
    assigneeSearch,
    setAssigneeSearch,
  ] = useState("");

  const filteredTeamMembers =
    teamMembers.filter((member) => {
      const search =
        assigneeSearch
          .trim()
          .toLocaleLowerCase("tr-TR");

      return (
        member.name
          .toLocaleLowerCase("tr-TR")
          .includes(search) ||
        member.initials
          .toLocaleLowerCase("tr-TR")
          .includes(search)
      );
    });

  if (!isOpen) {
    return null;
  }

  function toggleAssignee(
    member: Assignee,
  ) {
    setAssignees((previous) => {
      const isSelected =
        previous.some(
          (assignee) =>
            assignee.id === member.id,
        );

      if (isSelected) {
        return previous.filter(
          (assignee) =>
            assignee.id !== member.id,
        );
      }

      return [
        ...previous,
        member,
      ];
    });
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setProject("Pitwall App");
    setDepartment("Web & Yazılım");
    setPriority("medium");
    setDueDate("");
    setAssignees([]);
    setShowAssigneePicker(false);
    setAssigneeSearch("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !title.trim() ||
      !dueDate
    ) {
      return;
    }

    const newTask: Task = {
      id: Date.now(),

      title: title.trim(),

      description:
        description.trim(),

      project,
      department,

      status: defaultStatus,

      priority,

      dueDate,

      assignees,
    };

    onCreate(newTask);

    resetForm();
    onClose();
  }

  return (
    <div
      className="task-modal-overlay"
      onClick={handleClose}
    >
      <div
        className="task-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="task-modal-header">
          <div>
            <span>
              YENİ GÖREV
            </span>

            <h2>
              Görev oluştur
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Kapat"
          >
            <X size={19} />
          </button>
        </div>

        <form
          className="task-modal-form"
          onSubmit={handleSubmit}
        >
          <label>
            Görev başlığı

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Örn. Login ekranını tamamla"
              autoFocus
            />
          </label>

          <label>
            Açıklama

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Görev detaylarını yaz..."
              rows={4}
            />
          </label>

          <div className="task-modal-grid">
            <label>
              Proje

              <select
                value={project}
                onChange={(event) =>
                  setProject(
                    event.target.value,
                  )
                }
              >
                <option value="Pitwall App">
                  Pitwall App
                </option>

                <option value="Formula Student Web Sitesi">
                  Formula Student Web Sitesi
                </option>

                <option value="Araç Telemetri Sistemi">
                  Araç Telemetri Sistemi
                </option>
              </select>
            </label>

            <label>
              Departman

              <select
                value={department}
                onChange={(event) =>
                  setDepartment(
                    event.target.value,
                  )
                }
              >
                <option value="Web & Yazılım">
                  Web & Yazılım
                </option>

                <option value="Elektronik">
                  Elektronik
                </option>

                <option value="Mekanik">
                  Mekanik
                </option>

                <option value="Sponsorluk">
                  Sponsorluk
                </option>
              </select>
            </label>
          </div>

          <div className="task-modal-grid">
            <label>
              Öncelik

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target
                      .value as Task["priority"],
                  )
                }
              >
                <option value="low">
                  Düşük Öncelik
                </option>

                <option value="medium">
                  Orta Öncelik
                </option>

                <option value="high">
                  Yüksek Öncelik
                </option>
              </select>
            </label>

            <label>
              Teslim tarihi

              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value,
                  )
                }
              />
            </label>
          </div>

          <div className="task-assignee-section">
            <span>
              Atanan kişiler
            </span>

            <div className="selected-assignees-row">
              {assignees.map(
                (member) => (
                  <div
                    key={member.id}
                    className="selected-assignee"
                  >
                    <span>
                      {member.initials}
                    </span>

                    <strong>
                      {member.name}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        toggleAssignee(
                          member,
                        )
                      }
                      aria-label={`${member.name} kişisini kaldır`}
                    >
                      ×
                    </button>
                  </div>
                ),
              )}

              <button
                type="button"
                className="assignee-add-button"
                onClick={() =>
                  setShowAssigneePicker(true)
                }
                aria-label="Kişi ekle"
              >
                +
              </button>
            </div>

            {showAssigneePicker && (
              <div className="assignee-panel">
                <div className="assignee-panel-header">
                  <div>
                    <strong>
                      Kişi seç
                    </strong>

                    <span>
                      Göreve atanacak ekip
                      üyelerini seç.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="assignee-panel-close"
                    onClick={() =>
                      setShowAssigneePicker(
                        false,
                      )
                    }
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="assignee-search">
                  <input
                    type="text"
                    value={assigneeSearch}
                    onChange={(event) =>
                      setAssigneeSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Ekip üyesi ara..."
                  />
                </div>

                <div className="assignee-member-list">
                  {filteredTeamMembers.map(
                    (member) => {
                      const isSelected =
                        assignees.some(
                          (assignee) =>
                            assignee.id ===
                            member.id,
                        );

                      return (
                        <button
                          key={member.id}
                          type="button"
                          className={`assignee-member-row ${
                            isSelected
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            toggleAssignee(
                              member,
                            )
                          }
                        >
                          <span className="assignee-member-avatar">
                            {
                              member.initials
                            }
                          </span>

                          <div className="assignee-member-info">
                            <strong>
                              {
                                member.name
                              }
                            </strong>

                            <span>
                              Ekip üyesi
                            </span>
                          </div>

                          <span
                            className={`assignee-member-check ${
                              isSelected
                                ? "checked"
                                : ""
                            }`}
                          >
                            {isSelected
                              ? "✓"
                              : ""}
                          </span>
                        </button>
                      );
                    },
                  )}

                  {filteredTeamMembers.length ===
                    0 && (
                    <div className="assignee-empty">
                      Ekip üyesi bulunamadı.
                    </div>
                  )}
                </div>

                <div className="assignee-panel-footer">
                  <span>
                    {assignees.length} kişi
                    seçildi
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAssigneePicker(
                        false,
                      )
                    }
                  >
                    Tamam
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="task-modal-footer">
            <button
              type="button"
              className="task-modal-cancel"
              onClick={handleClose}
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className="task-modal-submit"
              disabled={
                !title.trim() ||
                !dueDate
              }
            >
              Görev Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}