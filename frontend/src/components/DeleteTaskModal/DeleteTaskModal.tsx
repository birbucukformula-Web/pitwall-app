import { Trash2, X } from "lucide-react";

import type { Task } from "../../types/task";


import "./DeleteTaskModal.css";

type DeleteTaskModalProps = {
  task: Task | null;
  onClose: () => void;
  onConfirm: (task: Task) => void;
};

export default function DeleteTaskModal({
  task,
  onClose,
  onConfirm,
}: DeleteTaskModalProps) {
  if (!task) {
    return null;
  }

  return (
    <div
      className="delete-task-overlay"
      onClick={onClose}
    >
      <div
        className="delete-task-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="delete-task-header">
          <div className="delete-task-icon">
            <Trash2 size={20} />
          </div>

          <button
            type="button"
            className="delete-task-close"
            onClick={onClose}
            aria-label="Pencereyi kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="delete-task-content">
          <h3>
            Görevi silmek istiyor musun?
          </h3>

          <p>
            <strong>
              {task.title}
            </strong>{" "}
            kalıcı olarak silinecek.
            Bu işlem geri alınamaz.
          </p>
        </div>

        <div className="delete-task-footer">
          <button
            type="button"
            className="delete-task-cancel"
            onClick={onClose}
          >
            Vazgeç
          </button>

          <button
            type="button"
            className="delete-task-confirm"
            onClick={() =>
              onConfirm(task)
            }
          >
            <Trash2 size={15} />
            Görevi Sil
          </button>
        </div>
      </div>
    </div>
  );
}