import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import {
  Eye,
  EyeOff,
  FolderKanban,
  LockKeyhole,
  Mail,
  SquareCheckBig,
  Users,
} from "lucide-react";

import formulaLogo from "../../assets/formula-logo.png";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await login({ username: email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* LEFT SIDE */}

      <section className="login-showcase">
        <div className="login-background-shape login-shape-one" />
        <div className="login-background-shape login-shape-two" />
        <div className="login-dot-pattern" />

        {/* LOGO */}

        <div className="login-brand">
          <img
            src={formulaLogo}
            alt="1.5 Adana Formula Student"
          />

          <div>
            <strong>1.5 ADANA</strong>
            <span>FORMULA STUDENT</span>
          </div>
        </div>

        {/* CONTENT */}

        <div className="login-showcase-content">
          <span className="pitwall-label">
            PITWALL
          </span>

          <div className="pitwall-line" />

          <h1>
            Takımın işlerini
            <br />
            tek yerden{" "}
            <span>yönet.</span>
          </h1>

          <p>
            Görevlerini takip et, projelerine
            eriş ve takımınla koordineli çalış.
          </p>

          <div className="login-features">
            
            <div className="login-feature">
              <SquareCheckBig size={25} />

              <span>
                Görevlerini
                <br />
                takip et
              </span>
            </div>

            <div className="login-feature">
              <FolderKanban size={25} />

              <span>
                Projelerine
                <br />
                eriş
              </span>
            </div>

            <div className="login-feature">
              <Users size={25} />

              <span>
                Takımınla
                <br />
                koordineli çalış
              </span>
            </div>
          </div>
        </div>

        <div className="login-showcase-footer">
          © 2026 1.5 Adana Formula Student.
          Tüm hakları saklıdır.
        </div>
      </section>

      {/* RIGHT SIDE */}

      <section className="login-form-side">
        <div className="login-form-card">
          <div className="login-form-header">
            <h2>Hoş geldin!</h2>

            <p>
              Hesabınla giriş yaparak devam et.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {/* EMAIL */}

            <label className="login-field">
              <span>Kullanıcı Adı</span>

              <div className="login-input">
                <Mail size={19} />

                <input
                  type="text"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Kullanıcı adınızı girin (örn: testuser)"
                />
              </div>
            </label>

            {/* PASSWORD */}

            <label className="login-field">
              <span>Şifre</span>

              <div className="login-input">
                <LockKeyhole size={19} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Şifreni gir"
                />

                <button
                  type="button"
                  className="password-button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous,
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </label>

            {/* OPTIONS */}

            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked,
                    )
                  }
                />

                <span>Beni hatırla</span>
              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Şifremi unuttum?
              </button>
            </div>

            {error && (
              <div className="login-error" style={{ color: '#ff4d4f', fontSize: '14px', marginBottom: '16px', padding: '8px', backgroundColor: 'rgba(255,77,79,0.1)', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            {/* LOGIN */}

            <button
              type="submit"
              className="login-submit"
              disabled={
                !email.trim() ||
                !password.trim() ||
                isLoading
              }
            >
              {isLoading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
            </button>
          </form>

          <div className="login-contact">
            Hesabın yok mu?

            <button type="button">
              Takım yöneticinle iletişime geç.
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}