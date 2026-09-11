import {
  Mail,
  ShieldCheck,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../api/auth";

import "./Profile.css";

export default function Profile() {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
  });

  if (isLoading || !currentUser) {
    return <div style={{ padding: "40px", color: "var(--text-secondary)" }}>Yükleniyor...</div>;
  }

  const user = {
    name: `${currentUser.first_name} ${currentUser.last_name}`.trim() || currentUser.email,
    initials: `${currentUser.first_name?.[0] ?? ""}${currentUser.last_name?.[0] ?? ""}`.toUpperCase() || currentUser.email[0].toUpperCase(),
    department: currentUser.organization?.name ?? "Belirtilmemiş",
    teamRole: currentUser.role === "captain" ? "Kaptan" : currentUser.role === "lead" ? "Lider" : "Üye",
    email: currentUser.email,
  };

  return (
    <section className="profile-page">
      <div className="profile-page-header">
        <div>
          <span className="profile-page-label">
            HESAP
          </span>

          <h2>Profilim</h2>

          <p>
            Hesap bilgilerini ve takım içindeki
            profilini buradan görüntüleyebilirsin.
          </p>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="profile-overview-card">
          <div className="profile-large-avatar">
            {user.initials}
          </div>

          <h3>{user.name}</h3>

          <span className="profile-department">
            {user.department}
          </span>

          <span className="profile-member-role">
            {user.teamRole}
          </span>

          <div className="profile-team-badge">
            1.5 Adana Formula Student
          </div>
        </aside>

        <div className="profile-details-card">
          <div className="profile-section-heading">
            <div>
              <h3>Kullanıcı bilgileri</h3>

              <p>
                Takım içindeki temel hesap
                bilgilerin.
              </p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <UserRound size={20} />
              </div>

              <div>
                <span>Ad Soyad</span>
                <strong>{user.name}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <BriefcaseBusiness size={20} />
              </div>

              <div>
                <span>Departman</span>
                <strong>
                  {user.department}
                </strong>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <ShieldCheck size={20} />
              </div>

              <div>
                <span>Takım Yetkisi</span>
                <strong>
                  {user.teamRole}
                </strong>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Mail size={20} />
              </div>

              <div>
                <span>E-posta</span>
                <strong>{user.email}</strong>
              </div>
            </div>
          </div>

          <div className="profile-theme-section">
            <div>
              <span className="profile-section-kicker">
                PROFİL GÖRÜNÜMÜ
              </span>

              <h3>Avatar teması</h3>

              <p>
                Profil görünümünü kişiselleştirmek
                için daha sonra Formula 1 pilot
                temalarından birini seçebileceksin.
              </p>
            </div>

            <button
              type="button"
              className="profile-theme-button"
              disabled
            >
              Yakında
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}