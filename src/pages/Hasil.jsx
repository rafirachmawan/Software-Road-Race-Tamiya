import { useState } from "react";

export default function Hasil({ peserta = [] }) {
  const [babakList, setBabakList] = useState([
    {
      id: 1,
      nama: "Babak 1",
      jalur: {
        A: peserta.slice(0, 3),
        B: peserta.slice(3, 6),
        C: peserta.slice(6, 9),
      },
      pemenang: {},
    },
  ]);

  const [selectedBabak, setSelectedBabak] = useState(1);
  const [selectedJalur, setSelectedJalur] = useState("A");
  const [scanValue, setScanValue] = useState("");

  const babakAktif = babakList.find((b) => b.id === selectedBabak);
  const pesertaJalur = babakAktif.jalur[selectedJalur];

  const pesertaScan = pesertaJalur.find((p) => p.id.toString() === scanValue);

  const setWinner = () => {
    if (!pesertaScan) return;

    const updated = babakList.map((b) => {
      if (b.id === selectedBabak) {
        return {
          ...b,
          pemenang: {
            ...b.pemenang,
            [selectedJalur]: pesertaScan,
          },
        };
      }
      return b;
    });

    setBabakList(updated);
    setScanValue("");
  };

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={{ margin: 0 }}>🎯 Input Hasil Race</h1>
        <p style={subText}>Tentukan pemenang dengan scan barcode peserta</p>
      </div>

      {/* STEP 1 BABAK */}
      <div style={panelStyle}>
        <h3>1️⃣ Pilih Babak</h3>
        <div style={tabContainer}>
          {babakList.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBabak(b.id)}
              style={{
                ...tabButton,
                background: selectedBabak === b.id ? "#0f172a" : "#e5e7eb",
                color: selectedBabak === b.id ? "white" : "#0f172a",
              }}
            >
              {b.nama}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2 JALUR */}
      <div style={panelStyle}>
        <h3>2️⃣ Pilih Jalur</h3>
        <div style={tabContainer}>
          {Object.keys(babakAktif.jalur).map((jalurKey) => (
            <button
              key={jalurKey}
              onClick={() => setSelectedJalur(jalurKey)}
              style={{
                ...tabButton,
                background: selectedJalur === jalurKey ? "#2563eb" : "#e5e7eb",
                color: selectedJalur === jalurKey ? "white" : "#0f172a",
              }}
            >
              🚦 Jalur {jalurKey}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={mainGrid}>
        {/* PESERTA */}
        <div style={panelStyle}>
          <h3>Peserta Jalur {selectedJalur}</h3>

          <div style={pesertaGrid}>
            {pesertaJalur.map((p, index) => (
              <div key={p.id} style={pesertaCard}>
                <div style={posisiBadge}>#{index + 1}</div>
                <div>{p.nama}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SCAN AREA */}
        <div style={scanCard}>
          <h3>3️⃣ Scan Pemenang</h3>

          <input
            autoFocus
            placeholder="Scan barcode di sini..."
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            style={scanInput}
          />

          {pesertaScan && (
            <div style={scanSuccess}>
              🏆 Pemenang Terdeteksi:
              <strong> {pesertaScan.nama}</strong>
            </div>
          )}

          <button style={primaryButton} onClick={setWinner}>
            Konfirmasi Pemenang
          </button>
        </div>
      </div>

      {/* HASIL */}
      <div style={panelStyle}>
        <h3>📊 Rekap Hasil</h3>

        {Object.keys(babakAktif.jalur).map((jalurKey) => (
          <div key={jalurKey} style={winnerRow}>
            <strong>Jalur {jalurKey}:</strong>{" "}
            {babakAktif.pemenang[jalurKey]
              ? babakAktif.pemenang[jalurKey].nama
              : "-"}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "25px",
};

const subText = {
  color: "#64748b",
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "25px",
};

const panelStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "14px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const tabContainer = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const tabButton = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const pesertaGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "15px",
};

const pesertaCard = {
  background: "#f8fafc",
  padding: "12px 15px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  border: "1px solid #e2e8f0",
};

const posisiBadge = {
  background: "#2563eb",
  color: "white",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "12px",
};

const scanCard = {
  background: "white",
  padding: "25px",
  borderRadius: "14px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  border: "2px solid #2563eb",
};

const scanInput = {
  padding: "14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "16px",
};

const scanSuccess = {
  background: "#dcfce7",
  padding: "12px",
  borderRadius: "8px",
  fontSize: "16px",
};

const primaryButton = {
  padding: "12px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

const winnerRow = {
  padding: "10px 0",
  borderBottom: "1px solid #e5e7eb",
};
