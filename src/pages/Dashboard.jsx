export default function Dashboard() {
  const totalPeserta = 81;
  const rondeAktif = 1;
  const pesertaPerSesi = 3;

  const totalSesi = Math.ceil(totalPeserta / pesertaPerSesi);
  const sesiSelesai = 12;
  const progress = Math.round((sesiSelesai / totalSesi) * 100);

  const pesertaLolosEstimasi = Math.ceil(totalPeserta / 3);

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>🏁 Road Race Championship 2026</h1>
          <p style={subText}>Sistem Eliminasi 3 Peserta → 1 Pemenang</p>
        </div>
        <div style={badgeStyle}>Ronde {rondeAktif}</div>
      </div>

      {/* STAT CARDS */}
      <div style={cardGrid}>
        <StatCard
          title="Total Peserta Aktif"
          value={totalPeserta}
          color="#2563eb"
        />
        <StatCard
          title="Total Sesi Ronde Ini"
          value={totalSesi}
          color="#10b981"
        />
        <StatCard title="Sesi Selesai" value={sesiSelesai} color="#f59e0b" />
        <StatCard
          title="Estimasi Lolos Ronde 2"
          value={pesertaLolosEstimasi}
          color="#ef4444"
        />
      </div>

      {/* PROGRESS PANEL */}
      <div style={panelStyle}>
        <h3>Progress Ronde {rondeAktif}</h3>
        <div style={progressBarBackground}>
          <div
            style={{
              ...progressBarFill,
              width: `${progress}%`,
            }}
          />
        </div>
        <p style={{ marginTop: 10 }}>
          {progress}% selesai ({sesiSelesai} / {totalSesi} sesi)
        </p>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function StatCard({ title, value, color }) {
  return (
    <div style={{ ...cardStyle, borderTop: `5px solid ${color}` }}>
      <h4 style={{ margin: 0, color: "#64748b" }}>{title}</h4>
      <h2
        style={{
          margin: "10px 0 0 0",
          fontSize: "28px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "30px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const subText = {
  marginTop: "5px",
  color: "#64748b",
};

const badgeStyle = {
  backgroundColor: "#0f172a",
  color: "white",
  padding: "10px 20px",
  borderRadius: "20px",
  fontWeight: "bold",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const panelStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const progressBarBackground = {
  height: "12px",
  backgroundColor: "#e5e7eb",
  borderRadius: "10px",
  overflow: "hidden",
  marginTop: "10px",
};

const progressBarFill = {
  height: "100%",
  backgroundColor: "#2563eb",
  transition: "0.3s",
};
