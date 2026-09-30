import { Flag, Target } from "lucide-react";

export default function ProjectMilestonesTab() {
  return (
    <div className="tab-pane active fade-in">
      <div className="milestones-container">
        <div className="tab-header">
          <h3>Hedefler (Milestones)</h3>
          <button className="primary-button">
            <Flag size={15} style={{ marginRight: 6 }} />
            Yeni Hedef Ekle
          </button>
        </div>

        <div className="milestones-list empty-state mt-4">
          <Target size={48} className="text-secondary mb-3" />
          <h4 style={{ color: 'white' }}>Henüz bir hedef belirlenmedi</h4>
          <p>Yarışma tarihleri, büyük teslimatlar ve kilometre taşlarını buradan takip edebilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}
