import {
  useEffect,
  useState,
} from "react";

import { X } from "lucide-react";

import type {
  Assignee,
  Task,
} from "../../types/task";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { metadataApi } from "../../api/metadata";
import { tasksApi } from "../../api/tasks";

import "./TaskModal.css";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
  onUpdate?: (task: Task) => void;
  defaultStatus?: Task["status"];
  editingTask?: Task | null;
};

export default function TaskModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  defaultStatus = "todo",
  editingTask = null,
}: TaskModalProps) {

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => metadataApi.getProjects(),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: () => metadataApi.getUnits(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => metadataApi.getMembers(),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities", editingTask?.id],
    queryFn: () => editingTask ? tasksApi.getActivities(editingTask.id) : [],
    enabled: !!editingTask,
  });

  const queryClient = useQueryClient();
  const createActivityMutation = useMutation({
    mutationFn: (content: string) => tasksApi.createActivity(editingTask!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", editingTask?.id] });
      setNewActivity("");
    }
  });

  // Convert Members to Assignees for the UI
  const teamMembers: Assignee[] = members.map(m => ({
    id: m.id,
    name: m.first_name ? `${m.first_name} ${m.last_name}` : m.email,
    initials: m.first_name ? `${m.first_name[0]}${m.last_name[0]}`.toUpperCase() : m.email[0].toUpperCase(),
  }));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newActivity, setNewActivity] = useState("");
  
  // We use string here, but will handle empty state.
  const [projectId, setProjectId] = useState("");
  const [unitId, setUnitId] = useState("");

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

  function resetForm() {
    setTitle("");
    setDescription("");

    setProjectId(
      projects.length > 0 ? projects[0].id.toString() : "",
    );

    setUnitId(
      units.length > 0 ? units[0].id.toString() : "",
    );

    setPriority("medium");
    setDueDate("");
    setAssignees([]);
    setShowAssigneePicker(false);
    setAssigneeSearch("");
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (editingTask) {
      setTitle(
        editingTask.title,
      );

      setDescription(
        editingTask.description,
      );

      setProjectId(
        editingTask.project
          ? editingTask.project.id.toString()
          : "",
      );

      setUnitId(
        editingTask.unit
          ? editingTask.unit.id.toString()
          : "",
      );

      setPriority(
        editingTask.priority,
      );

      setDueDate(
        editingTask.due_date,
      );

      setAssignees(
        editingTask.assignees,
      );

      setShowAssigneePicker(false);
      setAssigneeSearch("");

      return;
    }

    resetForm();
  }, [isOpen, editingTask]);

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

    const selectedProject =
      projects.find(
        (p: any) =>
          p.id.toString() ===
          projectId,
      ) ?? null;

    const selectedUnit =
      units.find(
        (u: any) =>
          u.id.toString() ===
          unitId,
      ) ?? null;

    if (
      editingTask &&
      onUpdate
    ) {
      const updatedTask: Task = {
        ...editingTask,

        title:
          title.trim(),

        description:
          description.trim(),

        project:
          selectedProject,

        unit:
          selectedUnit,

        priority,

        due_date:
          dueDate,

        assignees,
      };

      onUpdate(
        updatedTask,
      );

      resetForm();
      onClose();

      return;
    }

    const newTask: Task = {
      id: Date.now(),

      title:
        title.trim(),

      description:
        description.trim(),

      project:
        selectedProject,

      unit:
        selectedUnit,

      status:
        defaultStatus,

      priority,

      start_date:
        null,

      due_date:
        dueDate,

      order:
        Date.now(),

      assignees,
    };

    onCreate(
      newTask,
    );

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
              {editingTask
                ? "GÖREV DÜZENLE"
                : "YENİ GÖREV"}
            </span>

            <h2>
              {editingTask
                ? "Görevi düzenle"
                : "Görev oluştur"}
            </h2>
          </div>

          <button
            type="button"
            onClick={
              handleClose
            }
            aria-label="Kapat"
          >
            <X size={19} />
          </button>
        </div>

        <form
          className="task-modal-form"
          onSubmit={
            handleSubmit
          }
        >
          <label>
            Görev başlığı

            <input
              value={
                title
              }
              onChange={(
                event,
              ) =>
                setTitle(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Örn. Login ekranını tamamla"
              autoFocus
            />
          </label>

          <label>
            Açıklama

            <textarea
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event
                    .target
                    .value,
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
                value={
                  projectId
                }
                onChange={(
                  event,
                ) =>
                  setProjectId(
                    event
                      .target
                      .value,
                  )
                }
              >
                {projects.map(
                  (
                    project: any,
                  ) => (
                    <option
                      key={
                        project.id
                      }
                      value={
                        project.id
                      }
                    >
                      {
                        project.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Birim

              <select
                value={
                  unitId
                }
                onChange={(
                  event,
                ) =>
                  setUnitId(
                    event
                      .target
                      .value,
                  )
                }
              >
                {units.map(
                  (
                    unit: any,
                  ) => (
                    <option
                      key={
                        unit.id
                      }
                      value={
                        unit.id
                      }
                    >
                      {
                        unit.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <div className="task-modal-grid">
            <label>
              Öncelik

              <select
                value={
                  priority
                }
                onChange={(
                  event,
                ) =>
                  setPriority(
                    event
                      .target
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
                value={
                  dueDate
                }
                onChange={(
                  event,
                ) =>
                  setDueDate(
                    event
                      .target
                      .value,
                  )
                }
                onKeyDown={(
                  event,
                ) => {
                  if (event.key.toLowerCase() === 'b') {
                    event.preventDefault();
                    setDueDate(new Date().toISOString().split('T')[0]);
                  }
                }}
              />
            </label>
          </div>

          <div className="task-assignee-section">
            <span>
              Atanan kişiler
            </span>

            <div className="selected-assignees-row">
              {assignees.map(
                (
                  member,
                ) => (
                  <div
                    key={
                      member.id
                    }
                    className="selected-assignee"
                  >
                    <span>
                      {
                        member.initials
                      }
                    </span>

                    <strong>
                      {
                        member.name
                      }
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
                  setShowAssigneePicker(
                    true,
                  )
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
                    value={
                      assigneeSearch
                    }
                    onChange={(
                      event,
                    ) =>
                      setAssigneeSearch(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Ekip üyesi ara..."
                  />
                </div>

                <div className="assignee-member-list">
                  {filteredTeamMembers.map(
                    (
                      member,
                    ) => {
                      const isSelected =
                        assignees.some(
                          (
                            assignee,
                          ) =>
                            assignee.id ===
                            member.id,
                        );

                      return (
                        <button
                          key={
                            member.id
                          }
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
                    {
                      assignees.length
                    }{" "}
                    kişi seçildi
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

          {editingTask && (
            <div className="task-activities-section" style={{ marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-color)", marginBottom: "12px" }}>Aktiviteler ve Yorumlar</h4>
              <div className="task-activities-list" style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {activities.map((act: any) => (
                  <div key={act.id} style={{ fontSize: "13px", display: "flex", gap: "8px" }}>
                    <div className="assignee-avatar" style={{ width: "24px", height: "24px", fontSize: "10px", flexShrink: 0 }}>
                      {act.user_info?.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: "var(--text-color)" }}>
                        {act.user_info?.name} <span style={{ color: "var(--text-secondary)", fontWeight: 400, fontSize: "11px", marginLeft: "4px" }}>{new Date(act.created_at).toLocaleString('tr-TR')}</span>
                      </div>
                      <div style={{ color: act.activity_type === 'status_change' ? "var(--text-secondary)" : "var(--text-color)", fontStyle: act.activity_type === 'status_change' ? "italic" : "normal", marginTop: "2px" }}>
                        {act.content}
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Henüz bir hareket bulunmuyor.</div>}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ flex: 1 }}
                  placeholder="Yorum yaz..." 
                  value={newActivity} 
                  onChange={(e) => setNewActivity(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newActivity.trim()) {
                      e.preventDefault();
                      createActivityMutation.mutate(newActivity);
                    }
                  }}
                />
                <button 
                  type="button" 
                  style={{ padding: "0 12px", background: "var(--primary-color)", color: "white", borderRadius: "6px", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer" }}
                  disabled={!newActivity.trim()}
                  onClick={() => {
                    if (newActivity.trim()) createActivityMutation.mutate(newActivity);
                  }}
                >
                  Gönder
                </button>
              </div>
            </div>
          )}

          <div className="task-modal-footer">
            <button
              type="button"
              className="task-modal-cancel"
              onClick={
                handleClose
              }
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
              {editingTask
                ? "Değişiklikleri Kaydet"
                : "Görev Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}