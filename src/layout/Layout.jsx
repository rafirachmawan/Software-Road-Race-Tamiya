import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={styles.container}>
      {/* ================= SIDEBAR ================= */}
      <div
        style={{
          ...styles.sidebar,
          width: collapsed ? "80px" : "250px",
        }}
      >
        <div style={styles.logoSection}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>🏁</span>
            {!collapsed && (
              <div>
                <h2 style={{ margin: 0 }}>Race System</h2>
                <small style={{ color: "#94a3b8" }}>Event Manager</small>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={styles.collapseBtn}
          >
            {collapsed ? "➡" : "⬅"}
          </button>
        </div>

        <div style={styles.menu}>
          <SidebarLink
            to="/"
            label="Dashboard"
            icon="📊"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/registrasi"
            label="Registrasi"
            icon="📝"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/race"
            label="Race Manager"
            icon="🏎️"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/hasil"
            label="Input Hasil"
            icon="🎯"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/laporan"
            label="Laporan"
            icon="📑"
            collapsed={collapsed}
          />
          <SidebarLink
            to="/display"
            label="Display Layar"
            icon="🖥️"
            collapsed={collapsed}
          />
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div style={styles.main}>
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ to, label, icon, collapsed }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...styles.link,
        backgroundColor: isActive ? "#1e293b" : "transparent",
        borderLeft: isActive ? "4px solid #16a34a" : "4px solid transparent",
        justifyContent: collapsed ? "center" : "flex-start",
      })}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {!collapsed && <span style={{ marginLeft: 12 }}>{label}</span>}
    </NavLink>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh", // 🔥 kunci utama
    fontFamily: "Inter, Arial",
  },

  sidebar: {
    background: "linear-gradient(180deg,#0f172a,#1e293b)",
    color: "white",
    padding: "20px 10px",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
    overflowY: "auto", // sidebar bisa scroll kalau panjang
  },

  logoSection: {
    marginBottom: "30px",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoIcon: {
    fontSize: "28px",
  },

  collapseBtn: {
    marginTop: "15px",
    padding: "5px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#1e293b",
    color: "white",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  link: {
    padding: "12px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "white",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f3f4f6",
  },

  content: {
    flex: 1,
    overflowY: "auto", // ✅ hanya ini yang scroll
    padding: "40px",
  },
};
