import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";

import {
  Eye,
  EyeOff,
  FolderKanban,
  LockKeyhole,
  Mail,
  SquareCheckBig,
  Users,
  User as UserIcon,
} from "lucide-react";

import formulaLogo from "../../assets/formula-logo.png";
import "../Login/Login.css";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !firstName.trim() || !lastName.trim() || !password.trim()) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await authApi.register({
        email,
        first_name: firstName,
        last_name: lastName,
        password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* LEFT SIDE (Same as Login) */}
      <section className="login-showcase">
        <div className="login-background-shape login-shape-one" />
        <div className="login-background-shape login-shape-two" />
        <div className="login-dot-pattern" />

        <div className="login-brand">
          <img src={formulaLogo} alt="1.5 Adana Formula Student" />
          <div>
            <strong>1.5 ADANA</strong>
            <span>FORMULA STUDENT</span>
          </div>
        </div>

        <div className="login-showcase-content">
          <span className="pitwall-label">PITWALL</span>
          <div className="pitwall-line" />
          <h1>
            Takımın işlerini
            <br />
            tek yerden <span>yönet.</span>
          </h1>
          <p>
            Görevlerini takip et, projelerine eriş ve takımınla koordineli çalış.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <SquareCheckBig size={25} />
              <span>Görevlerini<br />takip et</span>
            </div>
            <div className="login-feature">
              <FolderKanban size={25} />
              <span>Projelerine<br />eriş</span>
            </div>
            <div className="login-feature">
              <Users size={25} />
              <span>Takımınla<br />koordineli çalış</span>
            </div>
          </div>
        </div>

        <div className="login-showcase-footer">
          © 2026 1.5 Adana Formula Student. Tüm hakları saklıdır.
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="login-form-side">
        <div className="login-form-card">
          <div className="login-form-header">
            <h2>Kayıt Ol</h2>
            <p>
              {success ? "Kayıt başarılı!" : "Ekibe katılmak için hesabını oluştur."}
            </p>
          </div>

          {success ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ color: "#28a745", fontWeight: "bold", marginBottom: "20px" }}>
                Hesabın başarıyla oluşturuldu. Ancak giriş yapabilmen için yöneticinin hesabını onaylaması ve yetkilerini ataması gerekmektedir.
              </p>
              <button
                type="button"
                className="login-submit"
                onClick={() => navigate("/login")}
              >
                GİRİŞ SAYFASINA DÖN
              </button>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              
              {/* FIRST NAME */}
              <label className="login-field">
                <span>Ad</span>
                <div className="login-input">
                  <UserIcon size={19} />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Adın"
                  />
                </div>
              </label>

              {/* LAST NAME */}
              <label className="login-field">
                <span>Soyad</span>
                <div className="login-input">
                  <UserIcon size={19} />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Soyadın"
                  />
                </div>
              </label>

              {/* EMAIL */}
              <label className="login-field">
                <span>E-posta (Kullanıcı Adı)</span>
                <div className="login-input">
                  <Mail size={19} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresin"
                  />
                </div>
              </label>

              {/* PASSWORD */}
              <label className="login-field">
                <span>Şifre</span>
                <div className="login-input">
                  <LockKeyhole size={19} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifren"
                  />
                  <button
                    type="button"
                    className="password-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="login-error" style={{ color: '#ff4d4f', fontSize: '14px', marginBottom: '16px', padding: '8px', backgroundColor: 'rgba(255,77,79,0.1)', borderRadius: '6px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={!email.trim() || !firstName.trim() || !lastName.trim() || !password.trim() || isLoading}
              >
                {isLoading ? "KAYIT OLUNUYOR..." : "KAYIT OL"}
              </button>
            </form>
          )}

          {!success && (
            <div className="login-contact">
              Zaten hesabın var mı?
              <button type="button" onClick={() => navigate("/login")}>
                Giriş yap.
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
