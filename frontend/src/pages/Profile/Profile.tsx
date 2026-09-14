import { useState } from "react";
import {
  Mail,
  ShieldCheck,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../api/auth";

import "./Profile.css";

const AVATARS = [
  { id: "red",    label: "#7 Kırmızı",     src: "/avatars/avatar_red.png" },
  { id: "blue",   label: "#3 Mavi",        src: "/avatars/avatar_blue.png" },
  { id: "black",  label: "#1 Siyah",       src: "/avatars/avatar_black.png" },
  { id: "frog",   label: "Kurbağa",        src: "/avatars/avatar_frog.png" },
  { id: "pink",   label: "Pembe Kalp",     src: "/avatars/avatar_pink.png" },
  { id: "purple", label: "Mor Şimşek",     src: "/avatars/avatar_purple.png" },
  { id: "yellow", label: "Sarı Damalı",    src: "/avatars/avatar_yellow.png" },
  { id: "orange", label: "Turuncu Yıldız", src: "/avatars/avatar_orange.png" },
  { id: "white",  label: "Beyaz",          src: "/avatars/avatar_white.png" },
];

const STORAGE_KEY = "pitwall_avatar";

export default function Profile() {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
  });

  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? ""
  );
  const [showPicker, setShowPicker] = useState(false);

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

  const avatarObj = AVATARS.find(a => a.id === selectedAvatar);

  function handleSelectAvatar(id: string) {
    setSelectedAvatar(id);
    localStorage.setItem(STORAGE_KEY, id);
    setShowPicker(false);
  }

  return (
    <section className="profile-page">
      <div className="profile-page-header">
        <div>
          <span className="profile-page-label">HESAP</span>
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
            {avatarObj ? (
              <img src={avatarObj.src} alt={avatarObj.label} className="profile-avatar-img" />
            ) : (
              user.initials
            )}
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
              <p>Takım içindeki temel hesap bilgilerin.</p>
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
                <strong>{user.department}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span>Takım Yetkisi</span>
                <strong>{user.teamRole}</strong>
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

          {/* AVATAR SEÇİCİ */}
          <div className="profile-theme-section">
            <div>
              <span className="profile-section-kicker">PROFİL GÖRÜNÜMÜ</span>
              <h3>Avatar teması</h3>
              <p>
                Formula pilotu temalı 9 avatardan birini seç — seçimin
                tarayıcında saklanır.
              </p>
            </div>

            <button
              type="button"
              className="profile-theme-button profile-theme-button--active"
              onClick={() => setShowPicker(v => !v)}
            >
              {avatarObj ? "Avatarı değiştir" : "Avatar seç"}
            </button>
          </div>

          {showPicker && (
            <div className="avatar-picker">
              <p className="avatar-picker-title">Pilotunu seç</p>
              <div className="avatar-picker-grid">
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    className={`avatar-picker-item ${selectedAvatar === av.id ? "selected" : ""}`}
                    onClick={() => handleSelectAvatar(av.id)}
                    title={av.label}
                  >
                    <img src={av.src} alt={av.label} />
                    {selectedAvatar === av.id && (
                      <span className="avatar-picker-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}