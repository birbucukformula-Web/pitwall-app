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

import "./App.css";

function AppLayout() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

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
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/*"
        element={<AppLayout />}
      />

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;