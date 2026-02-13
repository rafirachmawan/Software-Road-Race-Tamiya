import { useState } from "react";

export default function RaceManager({ peserta = [] }) {
  const [babakList, setBabakList] = useState([
    {
      id: 1,
      nama: "Babak 1",
      jalur: { A: [], B: [], C: [] },
    },
  ]);

  const [selectedBabak, setSelectedBabak] = useState(1);

  const babakAktif = babakList.find((b) => b.id === selectedBabak);

  const tambahBabak = () => {
    const newBabak = {
      id: babakList.length + 1,
      nama: `Babak ${babakList.length + 1}`,
      jalur: { A: [], B: [], C: [] },
    };
    setBabakList([...babakList, newBabak]);
  };

  const tambahJalur = () => {
    const updated = babakList.map((b) => {
      if (b.id === selectedBabak) {
        const nextChar = String.fromCharCode(65 + Object.keys(b.jalur).length);
        return {
          ...b,
          jalur: { ...b.jalur, [nextChar]: [] },
        };
      }
      return b;
    });
    setBabakList(updated);
  };

  // 🔥 MAX 3 TAMiYA PER JALUR
  const setPesertaJalur = (jalurKey, pesertaId) => {
    if (!pesertaId) return;

    const updated = babakList.map((b) => {
      if (b.id === selectedBabak) {
        const current = b.jalur[jalurKey];

        if (current.length >= 3) {
          alert("Maksimal 3 Tamiya per Jalur!");
          return b;
        }

        if (current.includes(pesertaId)) {
          alert("Peserta sudah ada di jalur ini!");
          return b;
        }

        return {
          ...b,
          jalur: {
            ...b.jalur,
            [jalurKey]: [...current, pesertaId],
          },
        };
      }
      return b;
    });

    setBabakList(updated);
  };

  const hapusPeserta = (jalurKey, pesertaId) => {
    const updated = babakList.map((b) => {
      if (b.id === selectedBabak) {
        return {
          ...b,
          jalur: {
            ...b.jalur,
            [jalurKey]: b.jalur[jalurKey].filter((id) => id !== pesertaId),
          },
        };
      }
      return b;
    });

    setBabakList(updated);
  };

  const totalJalur = Object.keys(babakAktif.jalur).length;

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>🏁 Race Control Center</h1>
          <p style={subText}>1 Jalur = 3 Tamiya Bertanding</p>
        </div>

        <div style={summaryBox}>
          <div>
            <strong>{peserta.length}</strong>
            <span style={summaryLabel}>Total Peserta</span>
          </div>
          <div>
            <strong>{babakList.length}</strong>
            <span style={summaryLabel}>Total Babak</span>
          </div>
          <div>
            <strong>{totalJalur}</strong>
            <span style={summaryLabel}>Jalur Aktif</span>
          </div>
        </div>
      </div>

      {/* BABAK TABS */}
      <div style={panelStyle}>
        <div style={tabHeader}>
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

          <button style={addTabButton} onClick={tambahBabak}>
            + Tambah Babak
          </button>
        </div>
      </div>

      {/* JALUR */}
      <div style={panelStyle}>
        <div style={jalurHeader}>
          <h3 style={{ margin: 0 }}>{babakAktif.nama}</h3>
          <button style={secondaryButton} onClick={tambahJalur}>
            + Tambah Jalur
          </button>
        </div>

        <div style={jalurGrid}>
          {Object.keys(babakAktif.jalur).map((jalurKey) => (
            <div key={jalurKey} style={jalurCard}>
              <div style={jalurTitle}>🚦 Jalur {jalurKey}</div>

              <select
                style={selectStyle}
                onChange={(e) => setPesertaJalur(jalurKey, e.target.value)}
              >
                <option value="">Pilih Peserta</option>
                {peserta.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>

              <div style={pesertaList}>
                {babakAktif.jalur[jalurKey].map((id, index) => {
                  const data = peserta.find(
                    (p) => p.id.toString() === id.toString(),
                  );
                  return (
                    <div key={index} style={pesertaBadge}>
                      {data?.nama}
                      <span
                        style={removeBtn}
                        onClick={() => hapusPeserta(jalurKey, id)}
                      >
                        ✕
                      </span>
                    </div>
                  );
                })}

                {/* SLOT KOSONG */}
                {[...Array(3 - babakAktif.jalur[jalurKey].length)].map(
                  (_, i) => (
                    <div key={i} style={emptySlot}>
                      Slot Kosong
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
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

const summaryBox = {
  display: "flex",
  gap: "30px",
  background: "white",
  padding: "15px 25px",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const summaryLabel = {
  display: "block",
  fontSize: "12px",
  color: "#64748b",
};

const panelStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "14px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const tabHeader = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const tabButton = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
};

const addTabButton = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "1px dashed #94a3b8",
  background: "transparent",
  cursor: "pointer",
};

const jalurHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const jalurGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "25px",
};

const jalurCard = {
  background: "#f8fafc",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
};

const jalurTitle = {
  fontWeight: "600",
  marginBottom: "15px",
};

const selectStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
};

const pesertaList = {
  marginTop: "15px",
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const pesertaBadge = {
  background: "#2563eb",
  color: "white",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  display: "flex",
  alignItems: "center",
};

const emptySlot = {
  background: "#e2e8f0",
  color: "#64748b",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "12px",
};

const removeBtn = {
  marginLeft: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const secondaryButton = {
  padding: "8px 14px",
  backgroundColor: "#0f172a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
