import {
  Users,
  UserPlus,
  Settings,
} from "lucide-react";

import { useAuth } from "../../../contexts/AuthContext";
import { getPermissions } from "../../../utils/permissions";

interface Props {
  project: any;
}

export default function ProjectSettingsTab({
  project,
}: Props) {
  const { user } = useAuth();
  const permissions = getPermissions(user);

  const canManageMembers =
    permissions.canManageMembers;

  const admins = project.members.filter(
    (m: any) =>
      m.teamRole === "lead" ||
      m.teamRole === "captain"
  );

  const members = project.members.filter(
    (m: any) =>
      m.teamRole !== "lead" &&
      m.teamRole !== "captain"
  );

  return (
    <div className="tab-pane active fade-in">
      <div className="settings-container">
        {/* BİRİM / PROJE AYARLARI */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Birim / Proje Ayarları</h3>

            <p>
              {canManageMembers
                ? "Proje adını ve temel bilgilerini buradan güncelleyebilirsiniz."
                : "Proje adı ve temel bilgileri."}
            </p>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>Birim Adı</label>

              <input
                type="text"
                defaultValue={project.name}
                className="dark-input"
                disabled={!canManageMembers}
              />
            </div>

            <div className="form-group">
              <label>Açıklama</label>

              <textarea
                defaultValue={project.description}
                className="dark-input"
                disabled={!canManageMembers}
              />
            </div>

            {canManageMembers && (
              <button className="primary-button mt-2">
                Kaydet
              </button>
            )}
          </div>
        </div>

        {/* YÖNETİCİLER */}
        <div className="settings-section mt-5">
          <div className="section-header">
            <h3>Yöneticiler (Admins)</h3>

            <p>
              Bu birimi yönetme yetkisine sahip
              kişiler.
            </p>
          </div>

          <div className="members-grid">
            {admins.map((member: any) => (
              <div
                className="member-card admin-card"
                key={member.id}
              >
                <div className="member-avatar">
                  {member.initials}
                </div>

                <div className="member-info">
                  <strong>
                    {member.name}
                  </strong>

                  <span>
                    {member.teamRole === "captain"
                      ? "Kaptan"
                      : "Departman Lideri"}
                  </span>
                </div>

                {canManageMembers && (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`${member.name} yöneticisini düzenle`}
                  >
                    <Settings size={14} />
                  </button>
                )}
              </div>
            ))}

            {admins.length === 0 && (
              <div
                className="empty-state"
                style={{
                  gridColumn: "1 / -1",
                  padding: "20px",
                }}
              >
                <Users
                  size={32}
                  style={{
                    opacity: 0.5,
                    marginBottom: "10px",
                  }}
                />

                <p>
                  Henüz yönetici bulunmuyor.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ÜYELER */}
        <div className="settings-section mt-5">
          <div className="section-header flex-between">
            <div>
              <h3>Üyeler (Members)</h3>

              <p>
                Bu birimde görev alan tüm üyeler.
              </p>
            </div>

            {canManageMembers && (
              <button
                type="button"
                className="secondary-button"
              >
                <UserPlus
                  size={15}
                  style={{
                    marginRight: 6,
                  }}
                />

                Üye Davet Et
              </button>
            )}
          </div>

          {canManageMembers && (
            <div className="add-member-bar mt-3 mb-4">
              <input
                type="text"
                placeholder="Kullanıcı adı veya e-posta..."
                className="dark-input"
              />

              <button
                type="button"
                className="primary-button"
              >
                Ekle +
              </button>
            </div>
          )}

          <div className="members-grid">
            {members.map((member: any) => (
              <div
                className="member-card"
                key={member.id}
              >
                <div className="member-avatar">
                  {member.initials}
                </div>

                <div className="member-info">
                  <strong>
                    {member.name}
                  </strong>

                  <span>Üye</span>
                </div>

                {canManageMembers && (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`${member.name} üyesini düzenle`}
                  >
                    <Settings size={14} />
                  </button>
                )}
              </div>
            ))}

            {members.length === 0 && (
              <div
                className="empty-state"
                style={{
                  gridColumn: "1 / -1",
                  padding: "20px",
                }}
              >
                <Users
                  size={32}
                  style={{
                    opacity: 0.5,
                    marginBottom: "10px",
                  }}
                />

                <p>
                  Henüz üye bulunmuyor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}