import { useState, useEffect } from "react";

export default function Dashboard() {
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [newDbName, setNewDbName] = useState("");

  const rondeAktif = 1;
  const systemStatus = selectedDb ? "READY" : "WAITING DATABASE";

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    if (!window.api?.getDatabases) return;

    const dbList = await window.api.getDatabases();
    setDatabases(dbList);

    // Ambil database aktif dari backend
    if (window.api?.getCurrentDatabase) {
      const activeDb = await window.api.getCurrentDatabase();

      if (activeDb) {
        setSelectedDb(activeDb);
        return;
      }
    }

    // Kalau tidak ada, kosong
    setSelectedDb(null);
  };

  const handleCreateDatabase = async () => {
    if (!newDbName.trim()) return alert("Nama event tidak boleh kosong");

    await window.api.createDatabase(newDbName);
    setNewDbName("");

    await loadDatabases();
  };

  const handleSwitchDatabase = async (dbName) => {
    const handleSwitchDatabase = async (dbName) => {
      if (dbName === "__NONE__") {
        await window.api.clearCurrentDatabase();
        setSelectedDb(null);
        return;
      }

      await window.api.switchDatabase(dbName);
      setSelectedDb(dbName);
    };

    await window.api.switchDatabase(dbName);
    setSelectedDb(dbName);
  };

  return (
    <div style={pageStyle}>
      {/* HERO PANEL */}
      <div style={heroPanel}>
        <div>
          <h1 style={{ margin: 0 }}>🏁 Race Management System</h1>
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            Event Control Center • Multi Event Database
          </p>
        </div>

        <div style={liveBadge}>
          {selectedDb ? selectedDb.replace(".db", "") : "Pilih Database Dulu"}
        </div>
      </div>

      {/* DATABASE PANEL */}
      <div style={dbPanel}>
        <h3 style={{ marginTop: 0 }}>Event Database</h3>

        <div style={dbRow}>
          <select
            value={selectedDb ?? "__NONE__"}
            onChange={(e) => handleSwitchDatabase(e.target.value)}
            style={selectStyle}
          >
            <option value="__NONE__">Pilih Database</option>

            {databases.map((db) => (
              <option key={db} value={db}>
                {db.replace(".db", "")}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nama Event Baru"
            value={newDbName}
            onChange={(e) => setNewDbName(e.target.value)}
            style={inputStyle}
          />

          <button style={createBtn} onClick={handleCreateDatabase}>
            + Buat Event
          </button>
        </div>
      </div>

      {/* QUICK ACTION PANEL */}
      <div style={cardGrid}>
        <ActionCard
          title="Kelola Round"
          description="Atur track, sesi & input hasil"
          color="#1d4ed8"
          disabled={!selectedDb}
        />
        <ActionCard
          title="Kelola Round"
          description="Atur track, sesi & input hasil"
          color="#1d4ed8"
          disabled={!selectedDb}
        />
        <ActionCard
          title="Kelola Round"
          description="Atur track, sesi & input hasil"
          color="#1d4ed8"
          disabled={!selectedDb}
        />
        <ActionCard
          title="Kelola Round"
          description="Atur track, sesi & input hasil"
          color="#1d4ed8"
          disabled={!selectedDb}
        />
      </div>

      {/* STATUS PANEL */}
      <div style={statusPanel}>
        <h3 style={{ marginTop: 0 }}>Event Status</h3>

        <div style={statusRow}>
          <StatusItem label="Database Aktif" value={selectedDb || "-"} />
          <StatusItem label="Round Aktif" value={`Round ${rondeAktif}`} />
          <StatusItem label="Mode" value="Eliminasi 3 → 1" />
          <StatusItem
            label="Status Sistem"
            value={systemStatus}
            highlight={selectedDb}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function ActionCard({ title, description, color, disabled }) {
  return (
    <div
      style={{
        ...actionCardStyle,
        background: color,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p style={{ marginTop: 8, opacity: 0.85, fontSize: "14px" }}>
        {description}
      </p>
    </div>
  );
}

function StatusItem({ label, value, highlight }) {
  return (
    <div style={statusItem}>
      <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{label}</p>
      <p
        style={{
          margin: "5px 0 0 0",
          fontWeight: "bold",
          fontSize: "16px",
          color: highlight ? "#16a34a" : "#0f172a",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "30px",
};

const heroPanel = {
  background: "linear-gradient(135deg,#0f172a,#1e293b)",
  color: "white",
  padding: "30px",
  borderRadius: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "20px",
};

const liveBadge = {
  background: "#2563eb",
  padding: "10px 20px",
  borderRadius: "20px",
  fontWeight: "bold",
};

const dbPanel = {
  background: "white",
  padding: "25px",
  borderRadius: "14px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const dbRow = {
  display: "flex",
  gap: "15px",
  flexWrap: "wrap",
  marginTop: "15px",
};

const selectStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  minWidth: "200px",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  minWidth: "200px",
};

const createBtn = {
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 20px",
  cursor: "pointer",
  fontWeight: "600",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

const actionCardStyle = {
  padding: "25px",
  borderRadius: "14px",
  color: "white",
  cursor: "pointer",
  transition: "0.3s",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
};

const statusPanel = {
  background: "white",
  padding: "25px",
  borderRadius: "14px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const statusRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "20px",
  marginTop: "15px",
};

const statusItem = {
  background: "#f8fafc",
  padding: "15px",
  borderRadius: "10px",
};
