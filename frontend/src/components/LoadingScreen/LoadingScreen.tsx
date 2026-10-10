import "./LoadingScreen.css";

interface LoadingScreenProps {
  fullScreen?: boolean;
}

export default function LoadingScreen({ fullScreen = true }: LoadingScreenProps) {
  return (
    <div className={`loading-screen-container ${fullScreen ? "fullscreen" : ""}`}>
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-center"></div>
        </div>
        <div className="loading-text">
          <span className="loading-title">PITWALL</span>
          <span className="loading-subtitle">Yükleniyor...</span>
        </div>
      </div>
    </div>
  );
}
