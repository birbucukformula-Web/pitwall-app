import { Calendar as CalendarIcon } from "lucide-react";
import type { Task } from "../../../types/task";


interface Props {
  project: any;
  tasks: Task[];
}

export default function ProjectCalendarTab({ project }: Props) {
  // Calendar component'ini çağıracağız ama sadece bu projenin task'larını göndermemiz lazım.
  // Mevcut Calendar sayfasında tasks api üzerinden çekiliyor. 
  // Şimdilik buraya özel bir render yapalım veya eğer Calendar props alabiliyorsa onu kullanalım.
  // Projeye özel takvim UI'ı:
  return (
    <div className="tab-pane active fade-in" style={{ padding: 0 }}>
      {/* Calendar component in this project might not accept tasks as props, it fetches its own.
          So we might need a custom layout here for now or update Calendar later. */}
      <div className="calendar-tab-wrapper" style={{ padding: '24px' }}>
         <div className="tab-header" style={{ marginBottom: '24px' }}>
          <h3>{project.name} Takvimi</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Bu birime ait görevlerin takvim görünümü (Gantt entegrasyonu yakında)</p>
        </div>
        <div className="empty-state">
           <CalendarIcon size={48} className="text-secondary mb-3" />
           <h4 style={{ color: 'white' }}>Takvim Görünümü</h4>
           <p>Departmanınıza özel takvim ve Gantt şeması burada yer alacaktır.</p>
        </div>
      </div>
    </div>
  );
}
