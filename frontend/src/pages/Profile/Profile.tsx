import { useState } from "react";
import {
  Mail,
  ShieldCheck,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { authApi } from "../../api/auth";
import {
  AVATARS,
  useAvatar,
} from "../../contexts/AvatarContext";

import "./Profile.css";

export default function Profile() {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
  });

  const {
    selectedAvatarId,
    selectedAvatar,
    selectAvatar,
  } = useAvatar();

  const [showPicker, setShowPicker] =
    useState(false);

  if (isLoading || !currentUser) {
    return (
      <div
        style={{
          padding: "40px",
          color: "var(--text-secondary)",
        }}
      >
        Yükleniyor...
      </div>
    );
  }

  const user = {
    name:
      `${currentUser.first_name} ${currentUser.last_name}`.trim() ||
      currentUser.email,

    initials:
      `${currentUser.first_name?.[0] ?? ""}${
        currentUser.last_name?.[0] ?? ""
      }`.toUpperCase() ||
      currentUser.email[0].toUpperCase(),

    department:
      currentUser.organization?.name ??
      "Belirtilmemiş",

    teamRole:
      ((currentUser as any).unit_name ? `${(currentUser as any).unit_name} - ` : "") +
      (currentUser.role === "captain"
        ? "Kaptan"
        : currentUser.role === "lead"
          ? "Lider"
          : "Üye"),

    email: currentUser.email,
  };

  function handleSelectAvatar(id: string) {
    selectAvatar(id);
    setShowPicker(false);
  }

  return (
    <section className="profile-page">
      <div className="profile-page-header">
        <p className="profile-page-description">
          Hesap bilgilerini ve takım içindeki
          profilini buradan görüntüleyebilirsin.
        </p>
      </div>

      <div className="profile-layout">
        <aside className="profile-overview-card">
          <div className="profile-large-avatar">
            {selectedAvatar ? (
              <img
                src={selectedAvatar.src}
                alt={selectedAvatar.label}
                className="profile-avatar-img"
              />
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

          <div className="profile-theme-section">
            <div>
              <span className="profile-section-kicker">
                PROFİL GÖRÜNÜMÜ
              </span>

              <h3>Avatar teması</h3>

              <p>
                Formula pilotu temalı 9 avatardan
                birini seç — seçimin tarayıcında
                saklanır.
              </p>
            </div>

            <button
              type="button"
              className="profile-theme-button profile-theme-button--active"
              onClick={() =>
                setShowPicker(
                  (previous) => !previous,
                )
              }
            >
              {selectedAvatar
                ? "Avatarı değiştir"
                : "Avatar seç"}
            </button>
          </div>

          {showPicker && (
            <div className="avatar-picker">
              <p className="avatar-picker-title">
                Pilotunu seç
              </p>

              <div className="avatar-picker-grid">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`avatar-picker-item ${
                      selectedAvatarId === avatar.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectAvatar(
                        avatar.id,
                      )
                    }
                    title={avatar.label}
                  >
                    <img
                      src={avatar.src}
                      alt={avatar.label}
                    />

                    {selectedAvatarId ===
                      avatar.id && (
                      <span className="avatar-picker-check">
                        ✓
                      </span>
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