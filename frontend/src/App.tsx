import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Calendar from "./pages/Calendar/Calendar";
import Projects from "./pages/Projects/Projects";
import ProjectDetail from "./pages/ProjectDetail/ProjectDetail";
import Announcements from "./pages/Announcements/Announcements";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";

import "./App.css";

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Menüyü kapat"
        />
      )}

      <main className="main">
        <Header
          onMenuClick={openSidebar}
        />

        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/calendar"
            element={<Calendar />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/projects/:projectId"
            element={<ProjectDetail />}
          />

          <Route
            path="/announcements"
            element={<Announcements />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
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
  );
}

export default App;