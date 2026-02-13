import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Registrasi from "./pages/Registrasi";
import RaceManager from "./pages/RaceManager";
import Hasil from "./pages/Hasil";
import Laporan from "./pages/Laporan";
import Display from "./pages/Display";
import Login from "./auth/Login";

import { useState, useEffect } from "react";

export default function App() {
  const [peserta, setPeserta] = useState([]);
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

  // ✅ Kalau sudah login → tampil semua routes
  return (
    <Routes>
      {/* =========================
          FULLSCREEN DISPLAY
          TANPA SIDEBAR
      ========================= */}
      <Route path="/display-full" element={<DisplayFullWrapper />} />

      {/* =========================
          ROUTE DENGAN LAYOUT
      ========================= */}
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
        <Route index element={<Dashboard peserta={peserta} />} />

        <Route
          path="registrasi"
          element={<Registrasi peserta={peserta} setPeserta={setPeserta} />}
        />

        <Route path="race" element={<RaceManager peserta={peserta} />} />

        <Route path="hasil" element={<Hasil />} />

        <Route path="laporan" element={<Laporan peserta={peserta} />} />

        <Route path="display" element={<DisplayWrapper />} />
      </Route>
    </Routes>
  );
}

/* =========================
   WRAPPER PREVIEW
========================= */
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

/* =========================
   WRAPPER FULLSCREEN
========================= */
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
