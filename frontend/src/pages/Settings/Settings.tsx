import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/auth";
import {
  Bell,
  Moon,
  Sun,
  UserRound,
  Users,
  Shield,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Archive,
  FolderKanban,
  Building2,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { metadataApi } from "../../api/metadata";
import type { Member } from "../../api/metadata";
import "./Settings.css";

type Theme = "light" | "dark";
type AdminTab = "members" | "pending" | "units" | "projects";

const PRESET_COLORS = [
  "#3b82f6", // Mavi
  "#ef4444", // Kırmızı
  "#f59e0b", // Amber
  "#10b981", // Yeşil
  "#8b5cf6", // Mor
  "#06b6d4", // Cyan
  "#ec4899", // Pembe
  "#64748b", // Gri
];

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
  });

  const isCaptain = currentUser?.role === "captain";

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => metadataApi.getMembers(),
  });

  const { data: pendingMembers = [] } = useQuery({
    queryKey: ["pendingMembers"],
    queryFn: () => metadataApi.getMembers("pending"),
    enabled: isCaptain,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: () => metadataApi.getUnits(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "all"],
    queryFn: () => metadataApi.getProjects(true),
  });

  // Tema
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("pitwall-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  // Bildirim Tercihleri
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [announcementNotifications, setAnnouncementNotifications] = useState(true);
  const [deadlineNotifications, setDeadlineNotifications] = useState(true);

  // Kaptan Yönetim Sekmesi
  const [adminTab, setAdminTab] = useState<AdminTab>("members");

  // Modallar ve Form State'leri
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [unitColor, setUnitColor] = useState(PRESET_COLORS[0]);
  const [unitParent, setUnitParent] = useState<string>("");

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState(PRESET_COLORS[0]);

  // Hata ve Bilgi Mesajları
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Onay bekleyenler için geçici seçim state'i (user_id -> {unit_id, role})
  const [pendingSelections, setPendingSelections] = useState<Record<number, { unit_id: number | null; role: string }>>({});

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pitwall-theme", theme);
  }, [theme]);

  // Otomatik mesaj gizleme
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // MUTASYONLAR
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => metadataApi.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["pendingMembers"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setSuccessMessage("Üye bilgileri başarıyla güncellendi.");
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Üye güncellenirken bir hata oluştu.");
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: number) => metadataApi.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["pendingMembers"] });
      setSuccessMessage("Üye başarıyla pasife alındı.");
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "İşlem başarısız oldu.");
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: (data: any) => metadataApi.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setIsUnitModalOpen(false);
      setUnitName("");
      setUnitCode("");
      setUnitParent("");
      setSuccessMessage("Yeni birim başarıyla oluşturuldu.");
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Birim oluşturulurken hata oluştu.");
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (id: number) => metadataApi.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setSuccessMessage("Birim başarıyla silindi.");
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Birim silinemedi.");
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => metadataApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsProjectModalOpen(false);
      setProjectName("");
      setProjectDescription("");
      setSuccessMessage("Proje başarıyla oluşturuldu.");
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Proje oluşturulamadı.");
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => metadataApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSuccessMessage("Proje durumu güncellendi.");
    },
  });

  // Handler: Birim Ekleme
  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;
    createUnitMutation.mutate({
      name: unitName.trim(),
      code: unitCode.trim(),
      color: unitColor,
      parent: unitParent ? parseInt(unitParent) : null,
    });
  };

  // Handler: Proje Ekleme
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    createProjectMutation.mutate({
      name: projectName.trim(),
      description: projectDescription.trim(),
      color: projectColor,
    });
  };

  // Handler: Onaylama
  const handleApproveMember = (member: Member) => {
    const selection = pendingSelections[member.id] || {
      unit_id: units[0]?.id || null,
      role: "member",
    };
    updateMemberMutation.mutate({
      id: member.id,
      data: {
        is_active: true,
        unit_id: selection.unit_id,
        role: selection.role,
      },
    });
  };

  return (
    <section className="settings-page">
      <div className="settings-header">
        <span className="settings-label">HESAP & ORGANİZASYON</span>
        <h2>Ayarlar ve Yönetim</h2>
        <p>Uygulama görünümünü, bildirim tercihlerini ve organizasyon ayarlarını buradan yönetebilirsin.</p>
      </div>

      {/* Başarı / Hata Bildirim Toast */}
      {successMessage && (
        <div className="settings-alert settings-alert-success">
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="settings-alert settings-alert-error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="settings-layout">
        {/* Görünüm Kartı */}
        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">
              <Sun size={20} />
            </div>
            <div>
              <h3>Görünüm</h3>
              <p>Pitwall temasını kişisel tercihine göre ayarla.</p>
            </div>
          </div>
          <div className="theme-options">
            <button
              type="button"
              className={`theme-option ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              <div className="theme-option-icon">
                <Sun size={22} />
              </div>
              <div>
                <strong>Açık Tema</strong>
                <span>Daha aydınlık arayüz</span>
              </div>
            </button>
            <button
              type="button"
              className={`theme-option ${theme === "dark" ? "active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <div className="theme-option-icon">
                <Moon size={22} />
              </div>
              <div>
                <strong>Koyu Tema</strong>
                <span>Düşük ışık için koyu görünüm</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bildirim Tercihleri Kartı */}
        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">
              <Bell size={20} />
            </div>
            <div>
              <h3>Bildirimler</h3>
              <p>Hangi durumlarda bildirim almak istediğini belirle.</p>
            </div>
          </div>
          <div className="settings-rows">
            <label className="settings-row">
              <div>
                <strong>Görev güncellemeleri</strong>
                <span>Yeni bir görev atandığında veya durum değiştiğinde.</span>
              </div>
              <input
                type="checkbox"
                checked={taskNotifications}
                onChange={(e) => setTaskNotifications(e.target.checked)}
              />
            </label>
            <label className="settings-row">
              <div>
                <strong>Duyuru bildirimleri</strong>
                <span>Takım tarafından yeni bir duyuru yayınlandığında.</span>
              </div>
              <input
                type="checkbox"
                checked={announcementNotifications}
                onChange={(e) => setAnnouncementNotifications(e.target.checked)}
              />
            </label>
            <label className="settings-row">
              <div>
                <strong>Teslim tarihi uyarıları</strong>
                <span>Görev teslim tarihi yaklaştığında.</span>
              </div>
              <input
                type="checkbox"
                checked={deadlineNotifications}
                onChange={(e) => setDeadlineNotifications(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Hesap Bilgileri Kartı */}
        <div className="settings-card account-settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">
              <UserRound size={20} />
            </div>
            <div>
              <h3>Hesap</h3>
              <p>Hesabına ait temel profil bilgileri.</p>
            </div>
          </div>
          <div className="settings-account-info">
            <div>
              <span>Ad Soyad</span>
              <strong>
                {currentUser
                  ? `${currentUser.first_name} ${currentUser.last_name}`.trim() || currentUser.email
                  : "—"}
              </strong>
            </div>
            <div>
              <span>Departman / Takım</span>
              <strong>{currentUser?.organization?.name ?? "Belirtilmemiş"}</strong>
            </div>
            <div>
              <span>E-posta</span>
              <strong>{currentUser?.email ?? "—"}</strong>
            </div>
            <div>
              <span>Sistem Rolü</span>
              <strong>
                <span className={`role-badge role-${currentUser?.role || "member"}`}>
                  {currentUser?.role === "captain"
                    ? "Kaptan"
                    : currentUser?.role === "lead"
                    ? "Birim Lideri"
                    : "Üye"}
                </span>
              </strong>
            </div>
          </div>
        </div>

        {/* KAPTAN YÖNETİM PANELİ (Veya Normal Üyeler İçin Takım Listesi) */}
        <div className="settings-card full-width-card">
          <div className="settings-card-heading flex-between">
            <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
              <div className="settings-heading-icon captain-icon-bg">
                {isCaptain ? <Shield size={20} color="#f59e0b" /> : <Users size={20} />}
              </div>
              <div>
                <h3>{isCaptain ? "Organizasyon ve Kaptan Yönetim Paneli" : `${currentUser?.organization?.name || "Takım"} Üyeleri`}</h3>
                <p>
                  {isCaptain
                    ? "Birimler, projeler, üye rolleri ve yeni kayıt onaylarını doğrudan buradan yönetebilirsiniz."
                    : "Organizasyonundaki yöneticiler, takım arkadaşları ve alt birimler."}
                </p>
              </div>
            </div>

            {/* Kaptan Sekmeleri */}
            {isCaptain && (
              <div className="admin-tabs">
                <button
                  type="button"
                  className={`admin-tab-btn ${adminTab === "members" ? "active" : ""}`}
                  onClick={() => setAdminTab("members")}
                >
                  <Users size={15} />
                  Üyeler ({members.length})
                </button>
                <button
                  type="button"
                  className={`admin-tab-btn ${adminTab === "pending" ? "active" : ""}`}
                  onClick={() => setAdminTab("pending")}
                >
                  <UserCheck size={15} />
                  Onay Bekleyenler
                  {pendingMembers.length > 0 && <span className="tab-counter-badge">{pendingMembers.length}</span>}
                </button>
                <button
                  type="button"
                  className={`admin-tab-btn ${adminTab === "units" ? "active" : ""}`}
                  onClick={() => setAdminTab("units")}
                >
                  <Building2 size={15} />
                  Birimler ({units.length})
                </button>
                <button
                  type="button"
                  className={`admin-tab-btn ${adminTab === "projects" ? "active" : ""}`}
                  onClick={() => setAdminTab("projects")}
                >
                  <FolderKanban size={15} />
                  Projeler ({projects.length})
                </button>
              </div>
            )}
          </div>

          <div className="admin-panel-content">
            {/* 1. ÜYELER VE YETKİLER SEKMESİ */}
            {(!isCaptain || adminTab === "members") && (
              <div className="members-admin-section">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Üye</th>
                        <th>E-posta</th>
                        <th>Birim / Takım</th>
                        <th>Rol / Yetki</th>
                        {isCaptain && <th>İşlem</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <div className="table-user-cell">
                              <div className="member-avatar-small">
                                {m.first_name ? `${m.first_name[0]}${m.last_name[0]}`.toUpperCase() : m.email[0].toUpperCase()}
                              </div>
                              <strong>
                                {m.first_name ? `${m.first_name} ${m.last_name}` : m.username}
                                {m.id === currentUser?.id && <span className="you-pill">Sen</span>}
                              </strong>
                            </div>
                          </td>
                          <td className="text-secondary">{m.email}</td>
                          <td>
                            {isCaptain && m.id !== currentUser?.id ? (
                              <select
                                className="table-select"
                                value={m.unit_id || ""}
                                onChange={(e) =>
                                  updateMemberMutation.mutate({
                                    id: m.id,
                                    data: { unit_id: e.target.value ? parseInt(e.target.value) : null },
                                  })
                                }
                              >
                                <option value="">Birim Yok</option>
                                {units.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="unit-tag">{m.unit_name || "—"}</span>
                            )}
                          </td>
                          <td>
                            {isCaptain && m.id !== currentUser?.id ? (
                              <select
                                className="table-select"
                                value={m.role}
                                onChange={(e) =>
                                  updateMemberMutation.mutate({
                                    id: m.id,
                                    data: { role: e.target.value },
                                  })
                                }
                              >
                                <option value="member">Üye</option>
                                <option value="lead">Birim Lideri</option>
                                <option value="captain">Kaptan</option>
                              </select>
                            ) : (
                              <span className={`role-badge role-${m.role}`}>
                                {m.role === "captain" ? "Kaptan" : m.role === "lead" ? "Lider" : "Üye"}
                              </span>
                            )}
                          </td>
                          {isCaptain && (
                            <td>
                              {m.id !== currentUser?.id ? (
                                <button
                                  type="button"
                                  className="action-btn-danger"
                                  title="Pasife Al"
                                  onClick={() => {
                                    if (window.confirm(`${m.first_name || m.username} adlı üyeyi pasife almak istiyor musunuz?`)) {
                                      deleteMemberMutation.mutate(m.id);
                                    }
                                  }}
                                >
                                  <UserX size={15} />
                                </button>
                              ) : (
                                <span className="text-muted" style={{ fontSize: "11px" }}>Korumalı</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. ONAY BEKLEYENLER SEKMESİ */}
            {isCaptain && adminTab === "pending" && (
              <div className="pending-admin-section">
                {pendingMembers.length === 0 ? (
                  <div className="empty-state-box">
                    <UserCheck size={36} color="var(--text-muted)" />
                    <h4>Onay bekleyen başvuru yok</h4>
                    <p>Yeni bir öğrenci sisteme kayıt olduğunda burada listelenecektir.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Başvuran</th>
                          <th>E-posta</th>
                          <th>Atanacak Birim</th>
                          <th>Atanacak Rol</th>
                          <th>Onay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingMembers.map((m) => {
                          const currentSel = pendingSelections[m.id] || {
                            unit_id: units[0]?.id || null,
                            role: "member",
                          };
                          return (
                            <tr key={m.id}>
                              <td>
                                <div className="table-user-cell">
                                  <div className="member-avatar-small pending-avatar">
                                    {m.first_name ? `${m.first_name[0]}${m.last_name[0]}`.toUpperCase() : m.email[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <strong>{m.first_name ? `${m.first_name} ${m.last_name}` : m.username}</strong>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                      Kayıt: {m.date_joined ? new Date(m.date_joined).toLocaleDateString("tr-TR") : "Yeni"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-secondary">{m.email}</td>
                              <td>
                                <select
                                  className="table-select"
                                  value={currentSel.unit_id || ""}
                                  onChange={(e) =>
                                    setPendingSelections((prev) => ({
                                      ...prev,
                                      [m.id]: {
                                        ...currentSel,
                                        unit_id: e.target.value ? parseInt(e.target.value) : null,
                                      },
                                    }))
                                  }
                                >
                                  {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <select
                                  className="table-select"
                                  value={currentSel.role}
                                  onChange={(e) =>
                                    setPendingSelections((prev) => ({
                                      ...prev,
                                      [m.id]: {
                                        ...currentSel,
                                        role: e.target.value,
                                      },
                                    }))
                                  }
                                >
                                  <option value="member">Üye</option>
                                  <option value="lead">Birim Lideri</option>
                                </select>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    type="button"
                                    className="action-btn-success"
                                    title="Onayla ve Takıma Ekle"
                                    onClick={() => handleApproveMember(m)}
                                  >
                                    <Check size={16} /> Onayla
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn-danger"
                                    title="Reddet"
                                    onClick={() => {
                                      if (window.confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) {
                                        deleteMemberMutation.mutate(m.id);
                                      }
                                    }}
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. BİRİMLER VE HİYERARŞİ SEKMESİ */}
            {isCaptain && adminTab === "units" && (
              <div className="units-admin-section">
                <div className="section-top-actions">
                  <p>Organizasyondaki ana departmanları ve alt takımları yönetin.</p>
                  <button
                    type="button"
                    className="primary-btn-action"
                    onClick={() => setIsUnitModalOpen(true)}
                  >
                    <Plus size={16} /> Yeni Birim Ekle
                  </button>
                </div>

                <div className="units-grid">
                  {units.map((u) => (
                    <div key={u.id} className="unit-card-item">
                      <div className="unit-card-color-strip" style={{ backgroundColor: u.color || "var(--accent)" }} />
                      <div className="unit-card-content">
                        <div className="unit-card-header">
                          <div>
                            <h4>{u.name}</h4>
                            <span className="unit-code-badge">{u.code || "KODSUZ"}</span>
                          </div>
                          <button
                            type="button"
                            className="unit-delete-btn"
                            title="Birimi Sil"
                            onClick={() => {
                              if (window.confirm(`"${u.name}" birimini silmek istediğinize emin misiniz?`)) {
                                deleteUnitMutation.mutate(u.id);
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="unit-card-meta">
                          <span>Üst Birim: <strong>{u.parent_name || "KÖK DEPARTMAN"}</strong></span>
                          <span>{u.member_count || 0} Üye · {u.task_count || 0} Aktif Görev</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PROJELER SEKMESİ */}
            {isCaptain && adminTab === "projects" && (
              <div className="projects-admin-section">
                <div className="section-top-actions">
                  <p>Takımın üzerinde çalıştığı projeleri ve durumlarını yönetin.</p>
                  <button
                    type="button"
                    className="primary-btn-action"
                    onClick={() => setIsProjectModalOpen(true)}
                  >
                    <Plus size={16} /> Yeni Proje Ekle
                  </button>
                </div>

                <div className="projects-admin-grid">
                  {projects.map((p: any) => (
                    <div key={p.id} className={`project-admin-card ${p.is_archived ? "is-archived" : ""}`}>
                      <div className="project-admin-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="color-dot" style={{ backgroundColor: p.color || "#3b82f6" }} />
                          <h4>{p.name}</h4>
                        </div>
                        {p.is_archived && <span className="archived-pill">Arşivlendi</span>}
                      </div>
                      <p className="project-desc">{p.description || "Açıklama girilmemiş."}</p>
                      <div className="project-card-footer">
                        <button
                          type="button"
                          className="toggle-archive-btn"
                          onClick={() =>
                            updateProjectMutation.mutate({
                              id: p.id,
                              data: { is_archived: !p.is_archived },
                            })
                          }
                        >
                          <Archive size={14} />
                          {p.is_archived ? "Arşivden Çıkar" : "Arşivle"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YENİ BİRİM EKLEME MODALI */}
      {isUnitModalOpen && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <div className="settings-modal-header">
              <h3>Yeni Birim Ekle</h3>
              <button type="button" className="close-btn" onClick={() => setIsUnitModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUnit} className="settings-modal-form">
              <div className="form-group">
                <label>Birim / Takım Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: Telemetri, Aerodinamik"
                  required
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Kısa Kod</label>
                <input
                  type="text"
                  placeholder="Örn: TLM"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Üst Birim (Hiyerarşi)</label>
                <select value={unitParent} onChange={(e) => setUnitParent(e.target.value)}>
                  <option value="">KÖK BİRİM (Ana Departman)</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Renk</label>
                <div className="color-palette">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-preset-btn ${unitColor === c ? "selected" : ""}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setUnitColor(c)}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsUnitModalOpen(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-submit" disabled={createUnitMutation.isPending}>
                  {createUnitMutation.isPending ? "Ekleniyor..." : "Birimi Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ PROJE EKLEME MODALI */}
      {isProjectModalOpen && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <div className="settings-modal-header">
              <h3>Yeni Proje Ekle</h3>
              <button type="button" className="close-btn" onClick={() => setIsProjectModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="settings-modal-form">
              <div className="form-group">
                <label>Proje Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: 2026 Rollout, SES Şasi Raporu"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  placeholder="Proje hakkında kısa bilgi..."
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Renk</label>
                <div className="color-palette">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-preset-btn ${projectColor === c ? "selected" : ""}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setProjectColor(c)}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsProjectModalOpen(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-submit" disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? "Ekleniyor..." : "Projeyi Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
