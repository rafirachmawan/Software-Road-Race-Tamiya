import { useState } from "react";

const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

export default function Hasil({ teams = [] }) {
  // flatten semua pemain dari teams
  const peserta = teams.flatMap((t) => t.pemain);

  const createEmptyRound = (roundNumber) => ({
    id: roundNumber,
    nama: `Round ${roundNumber}`,
    grid: Array.from({ length: 16 }, (_, i) => {
      const row = { no: i + 1 };
      columns.forEach((col) => (row[col] = null));
      return row;
    }),
  });

  const [rounds, setRounds] = useState([
    createEmptyRound(2), // 🔥 mulai dari round 2
  ]);

  const [selectedRound, setSelectedRound] = useState(2);
  const [scanValue, setScanValue] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const roundAktif = rounds.find((r) => r.id === selectedRound);

  /* ================= SCAN LOGIC ================= */
  const handleScan = (e) => {
    const value = e.target.value;
    setScanValue(value);

    const pesertaScan = peserta.find((p) => p.id.toString() === value);

    if (!pesertaScan) return;

    const totalSlot = roundAktif.grid.length * columns.length;
    if (currentIndex >= totalSlot) return;

    const rowIndex = Math.floor(currentIndex / columns.length);
    const colIndex = currentIndex % columns.length;
    const columnKey = columns[colIndex];

    const updatedRounds = rounds.map((r) => {
      if (r.id === selectedRound) {
        const newGrid = [...r.grid];
        newGrid[rowIndex] = {
          ...newGrid[rowIndex],
          [columnKey]: pesertaScan.nama,
        };
        return { ...r, grid: newGrid };
      }
      return r;
    });

    setRounds(updatedRounds);
    setCurrentIndex(currentIndex + 1);
    setScanValue("");
  };

  /* ================= TAMBAH ROUND ================= */
  const tambahRound = () => {
    const newRoundNumber = rounds.length + 2;
    setRounds([...rounds, createEmptyRound(newRoundNumber)]);
    setSelectedRound(newRoundNumber);
    setCurrentIndex(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      <div>
        <h1>🏁 ROUND MANAGEMENT</h1>
        <p>Scan Barcode Peserta untuk mengisi slot otomatis</p>
      </div>

      {/* ROUND TAB */}
      <div style={{ display: "flex", gap: "10px" }}>
        {rounds.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              setSelectedRound(r.id);
              setCurrentIndex(0);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: selectedRound === r.id ? "#0f172a" : "#e5e7eb",
              color: selectedRound === r.id ? "white" : "black",
            }}
          >
            {r.nama}
          </button>
        ))}

        <button
          onClick={tambahRound}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px dashed #0f172a",
            cursor: "pointer",
            background: "white",
          }}
        >
          + Tambah Round
        </button>
      </div>

      {/* SCAN INPUT */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
        }}
      >
        <input
          autoFocus
          placeholder="Scan barcode di sini..."
          value={scanValue}
          onChange={handleScan}
          style={{
            padding: "14px",
            width: "100%",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>

      {/* GRID TABLE */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>NO</th>
              {columns.map((col) => (
                <th key={col} style={thStyle}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roundAktif.grid.map((row) => (
              <tr key={row.no}>
                <td style={tdStyle}>{row.no}</td>
                {columns.map((col) => (
                  <td key={col} style={tdStyle}>
                    {row[col] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* STYLES */
const thStyle = {
  padding: "10px",
  background: "#e5e7eb",
  border: "1px solid #d1d5db",
};

const tdStyle = {
  padding: "8px",
  border: "1px solid #e5e7eb",
  textAlign: "center",
};
