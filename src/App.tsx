import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";

import Dashboard from "./pages/Dashboard/Dashboard";
import Calendar from "./pages/Calendar/Calendar";
import Projects from "./pages/Projects/Projects";
import Announcements from "./pages/Announcements/Announcements";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <Routes>
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
            path="/announcements"
            element={<Announcements />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;