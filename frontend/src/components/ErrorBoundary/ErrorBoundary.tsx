import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import "./ErrorBoundary.css";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <div className="error-icon-wrapper">
              <AlertTriangle size={48} className="error-icon" />
            </div>
            
            <h1 className="error-title">Bir Şeyler Ters Gitti</h1>
            <p className="error-description">
              Beklenmeyen bir hata oluştu. Sistem çökmek üzereyken koruma kalkanı devreye girdi. 
              Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
            </p>

            {this.state.error && (
              <div className="error-details">
                <code>{this.state.error.message}</code>
              </div>
            )}

            <div className="error-actions">
              <button className="btn-secondary" onClick={this.handleReload}>
                <RefreshCw size={18} />
                Sayfayı Yenile
              </button>
              <button className="btn-primary" onClick={this.handleGoHome}>
                <Home size={18} />
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
