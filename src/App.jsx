import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Registrasi from "./pages/Registrasi";
import Hasil from "./pages/Hasil";
import Laporan from "./pages/Laporan";
import Display from "./pages/Display";
import Login from "./auth/Login";

import { useState, useEffect } from "react";

export default function App() {
  const [teams, setTeams] = useState([]);
  const [user, setUser] = useState(null);

  // 🔐 Cek session saat pertama buka
  useEffect(() => {
    const savedUser = localStorage.getItem("race_user");
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // 🔒 Kalau belum login → tampil Login
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Routes>
      {/* ================= FULLSCREEN DISPLAY ================= */}
      <Route path="/display-full" element={<DisplayFullWrapper />} />

      {/* ================= ROUTE DENGAN LAYOUT ================= */}
      <Route
        path="/"
        element={
          <Layout
            onLogout={() => {
              localStorage.removeItem("race_user");
              setUser(null);
            }}
          />
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard teams={teams} />} />

        {/* Registrasi */}
        <Route
          path="registrasi"
          element={<Registrasi teams={teams} setTeams={setTeams} />}
        />

        {/* Input Hasil */}
        <Route path="hasil" element={<Hasil teams={teams} />} />

        {/* Laporan */}
        <Route path="laporan" element={<Laporan teams={teams} />} />

        {/* Display Preview */}
        <Route path="display" element={<DisplayWrapper />} />
      </Route>
    </Routes>
  );
}

/* ================= WRAPPER PREVIEW ================= */
function DisplayWrapper() {
  const location = useLocation();
  const state = location.state || {};

  return (
    <Display
      lanes={state.lanes || []}
      ronde={state.ronde || 1}
      mode={state.mode || "jalur"}
      isFullscreen={false}
    />
  );
}

/* ================= WRAPPER FULLSCREEN ================= */
function DisplayFullWrapper() {
  const location = useLocation();
  const state = location.state || {};

  return (
    <Display
      lanes={state.lanes || []}
      ronde={state.ronde || 1}
      mode={state.mode || "jalur"}
      isFullscreen={true}
    />
  );
}
