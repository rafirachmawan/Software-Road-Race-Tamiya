import { useState, useEffect } from "react";

export default function Laporan({ teams = [] }) {
  const [rounds, setRounds] = useState([]); // 🔥 TAMBAHAN
  const [selectedRound, setSelectedRound] = useState(null); // 🔥 GANTI default 2

  const [bestTeam, setBestTeam] = useState([]);
  const [bestPlayer, setBestPlayer] = useState([]);

  /* ================= LOAD ROUNDS DARI DB ================= */
  const loadRounds = async () => {
    const data = await window.api.getRounds();

    if (data && data.length > 0) {
      setRounds(data);
      setSelectedRound(data[0].id); // otomatis pilih round pertama
    } else {
      setRounds([]);
      setSelectedRound(null);
    }
  };

  /* ================= LOAD REPORT ================= */
  const loadRoundReport = async () => {
    const slots = await window.api.getRoundData(selectedRound);

    console.log("SLOTS:", slots);

    if (!slots || slots.length === 0) {
      setBestTeam([]);
      setBestPlayer([]);
      return;
    }

    const teamCounter = {};
    const playerCounter = {};

    slots.forEach((slot) => {
      if (slot.namaTim) {
        teamCounter[slot.namaTim] = (teamCounter[slot.namaTim] || 0) + 1;
      }

      if (slot.nama) {
        playerCounter[slot.nama] = (playerCounter[slot.nama] || 0) + 1;
      }
    });

    /* ================= SORT TEAM ================= */
    const sortedTeam = Object.entries(teamCounter)
      .map(([team, race]) => ({ team, race }))
      .sort((a, b) => {
        if (b.race !== a.race) return b.race - a.race;
        return a.team.localeCompare(b.team); // tie breaker
      })
      .slice(0, 3);

    /* ================= SORT PLAYER ================= */
    const sortedPlayer = Object.entries(playerCounter)
      .map(([nama, race]) => ({ nama, race }))
      .sort((a, b) => {
        if (b.race !== a.race) return b.race - a.race;
        return a.nama.localeCompare(b.nama); // tie breaker
      })
      .slice(0, 3);

    setBestTeam(sortedTeam);
    setBestPlayer(sortedPlayer);
  };

  useEffect(() => {
    loadRounds(); // 🔥 load rounds saat pertama buka halaman
  }, []);

  useEffect(() => {
    if (selectedRound) {
      loadRoundReport();
    }
  }, [selectedRound]);

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>🏆 Laporan Hasil Akhir</h1>
          <p style={subText}>
            Rekapitulasi hasil -{" "}
            {rounds.find((r) => r.id === selectedRound)?.nama || "-"}
          </p>
        </div>

        <div>
          <button style={exportPrimary}>Export PDF</button>
          <button style={exportSecondary}>Export Excel</button>
        </div>
      </div>

      <div style={roundCard}>
        <div style={roundInner}>
          <div>
            <p style={roundLabel}>Pilih Round</p>
            <select
              value={selectedRound || ""}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
              style={selectPro}
            >
              {rounds.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={bestWrapper}>
        {/* BEST TEAM */}
        <div style={proCard}>
          <div style={cardHeader}>
            <span style={emoji}>🏆</span>
            <h2 style={cardTitle}>BEST TEAM</h2>
          </div>

          <table style={proTable}>
            <thead>
              <tr>
                <th style={th}>NO</th>
                <th style={th}>TEAM</th>
                <th style={thRight}>RACE</th>
              </tr>
            </thead>
            <tbody>
              {bestTeam.map((item, index) => (
                <tr key={index}>
                  <td style={td}>{index + 1}</td>
                  <td style={td}>{item.team}</td>
                  <td style={tdRight}>{item.race}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BEST PLAYER */}
        <div style={proCard}>
          <div style={cardHeader}>
            <span style={emoji}>🥇</span>
            <h2 style={cardTitle}>BEST PLAYER</h2>
          </div>

          <table style={proTable}>
            <thead>
              <tr>
                <th style={th}>NO</th>
                <th style={th}>NAMA</th>
                <th style={thRight}>POIN</th>
              </tr>
            </thead>
            <tbody>
              {bestPlayer.map((item, index) => (
                <tr key={index}>
                  <td style={td}>{index + 1}</td>
                  <td style={td}>{item.nama}</td>
                  <td style={tdRight}>{item.race}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */
function SummaryCard({ title, value }) {
  return (
    <div style={summaryCard}>
      <p style={{ margin: 0, color: "#64748b" }}>{title}</p>
      <h2 style={{ marginTop: 10 }}>{value}</h2>
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
  color: "#64748b",
};

/* ROUND CARD */
const roundCard = {
  background: "white",
  padding: "25px 30px",
  borderRadius: "16px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
};

const roundInner = {
  display: "flex",
  alignItems: "center",
};

const roundLabel = {
  margin: 0,
  marginBottom: "8px",
  fontWeight: "600",
  fontSize: "14px",
  color: "#475569",
};

const selectPro = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  minWidth: "240px",
  fontSize: "14px",
  outline: "none",
  cursor: "pointer",
};

/* BEST SECTION */
const bestWrapper = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "30px",
};

const proCard = {
  background: "white",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  minHeight: "340px",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "20px",
};

const cardTitle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "700",
};

const emoji = {
  fontSize: "24px",
};

const proTable = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "12px 8px",
  fontSize: "13px",
  color: "#64748b",
  borderBottom: "2px solid #e2e8f0",
};

const thRight = {
  ...th,
  textAlign: "right",
};

const td = {
  padding: "12px 8px",
  borderBottom: "1px solid #f1f5f9",
};

const tdRight = {
  ...td,
  textAlign: "right",
  fontWeight: "600",
};

/* EXPORT BUTTON */
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
