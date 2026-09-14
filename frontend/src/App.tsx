import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "./contexts/AuthContext";

import {
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

import "./App.css";

// Yükleme sırasında gecikmeyi engellemek için Login component'ini normal import tutabiliriz
// veya login ekranını da lazy loading ile alabiliriz.
import Login from "./pages/Login/Login";

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Calendar = lazy(() => import("./pages/Calendar/Calendar"));
const Projects = lazy(() => import("./pages/Projects/Projects"));

const ProjectDetail = lazy(() => import("./pages/ProjectDetail/ProjectDetail"));
const Announcements = lazy(() => import("./pages/Announcements/Announcements"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Settings = lazy(() => import("./pages/Settings/Settings"));

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="app">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Menüyü kapat"
        />
      )}

      <main className="main">
        <Header onMenuClick={openSidebar} />

        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen fullScreen={false} />}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/projects" element={<Projects />} />

              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;