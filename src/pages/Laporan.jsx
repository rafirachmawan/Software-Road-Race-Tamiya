export default function Laporan({ peserta = [] }) {
  const sorted = [...peserta].sort((a, b) => b.poin - a.poin);

  const totalPeserta = peserta.length;
  const totalPoin = peserta.reduce((acc, p) => acc + p.poin, 0);
  const rataRata = totalPeserta ? Math.round(totalPoin / totalPeserta) : 0;

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>🏆 Laporan Hasil Akhir</h1>
          <p style={subText}>Rekapitulasi hasil akhir seluruh peserta</p>
        </div>

        <div>
          <button style={exportPrimary}>Export PDF</button>
          <button style={exportSecondary}>Export Excel</button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={summaryContainer}>
        <SummaryCard title="Total Peserta" value={totalPeserta} />
        <SummaryCard title="Total Poin" value={totalPoin} />
        <SummaryCard title="Rata-rata Poin" value={rataRata} />
      </div>

      {/* TABLE */}
      <div style={tableWrapper}>
        {sorted.length === 0 ? (
          <div style={emptyState}>
            <h3>Belum Ada Data</h3>
            <p>Data hasil lomba akan muncul di sini.</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Peserta</th>
                <th>Tim</th>
                <th>Total Poin</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, index) => (
                <tr
                  key={p.id}
                  style={
                    index === 0
                      ? firstPlace
                      : index === 1
                        ? secondPlace
                        : index === 2
                          ? thirdPlace
                          : {}
                  }
                >
                  <td>{index + 1}</td>
                  <td>{p.nama}</td>
                  <td>{p.tim}</td>
                  <td style={{ fontWeight: "bold" }}>{p.poin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCard}>
      <p style={{ margin: 0, color: "#64748b" }}>{title}</p>
      <h2 style={{ margin: "10px 0 0 0" }}>{value}</h2>
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
  margin: "5px 0 0 0",
  color: "#64748b",
};

const exportPrimary = {
  padding: "10px 18px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginRight: "10px",
};

const exportSecondary = {
  padding: "10px 18px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const summaryContainer = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
};

const summaryCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  minWidth: "200px",
};

const tableWrapper = {
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const emptyState = {
  padding: "40px",
  textAlign: "center",
  color: "#64748b",
};

/* TABLE HEAD */
const thStyle = {
  textAlign: "left",
  padding: "15px",
  backgroundColor: "#f1f5f9",
  fontWeight: "600",
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #e5e7eb",
};

/* RANK HIGHLIGHT */
const firstPlace = {
  backgroundColor: "#fef9c3",
};

const secondPlace = {
  backgroundColor: "#e2e8f0",
};

const thirdPlace = {
  backgroundColor: "#ffedd5",
};
