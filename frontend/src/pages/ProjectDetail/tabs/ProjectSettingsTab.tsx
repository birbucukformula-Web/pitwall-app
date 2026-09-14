import { Users, UserPlus, Settings } from "lucide-react";

interface Props {
  project: any;
}

export default function ProjectSettingsTab({ project }: Props) {
  return (
    <div className="tab-pane active fade-in">
      <div className="settings-container">
        
        <div className="settings-section">
          <div className="section-header">
            <h3>Birim / Proje Ayarları</h3>
            <p>Proje adını ve temel bilgilerini buradan güncelleyebilirsiniz.</p>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label>Birim Adı</label>
              <input type="text" defaultValue={project.name} className="dark-input" />
            </div>
            <div className="form-group">
              <label>Açıklama</label>
              <textarea defaultValue={project.description} className="dark-input"></textarea>
            </div>
            <button className="primary-button mt-2">Kaydet</button>
          </div>
        </div>

        <div className="settings-section mt-5">
          <div className="section-header">
            <h3>Yöneticiler (Admins)</h3>
            <p>Bu birimi yönetme yetkisine sahip kişiler.</p>
          </div>
          
          <div className="members-grid">
            {project.members.slice(0, 1).map((member: any) => (
              <div className="member-card admin-card" key={member.id}>
                <div className="member-avatar">{member.initials}</div>
                <div className="member-info">
                  <strong>{member.name}</strong>
                  <span>Departman Lideri</span>
                </div>
                <button className="icon-button"><Settings size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section mt-5">
          <div className="section-header flex-between">
            <div>
              <h3>Üyeler (Members)</h3>
              <p>Bu birimde görev alan tüm üyeler.</p>
            </div>
            <button className="secondary-button">
              <UserPlus size={15} style={{ marginRight: 6 }} />
              Üye Davet Et
            </button>
          </div>

          <div className="add-member-bar mt-3 mb-4">
            <input type="text" placeholder="Kullanıcı adı veya e-posta..." className="dark-input" />
            <button className="primary-button">Ekle +</button>
          </div>
          
          <div className="members-grid">
            {project.members.map((member: any) => (
              <div className="member-card" key={member.id}>
                <div className="member-avatar">{member.initials}</div>
                <div className="member-info">
                  <strong>{member.name}</strong>
                  <span>Üye</span>
                </div>
                <button className="icon-button"><Settings size={14}/></button>
              </div>
            ))}
            {project.members.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '20px' }}>
                <Users size={32} style={{ opacity: 0.5, marginBottom: '10px' }} />
                <p>Henüz üye bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
