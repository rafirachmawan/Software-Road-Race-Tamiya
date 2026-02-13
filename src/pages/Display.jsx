import { useLocation } from "react-router-dom";

const { ipcRenderer } = window.require ? window.require("electron") : {};

export default function Display({ ronde = 1 }) {
  const location = useLocation();
  const isFullscreen = location.pathname === "/display-full";

  const lanes = {
    A: ["DIMAS", "FAJAR", "BAGAS"],
    B: ["ARIF", "BUDI", "REZA"],
    C: ["RIZKY", "ILHAM", "DANI"],
  };

  const winners = {
    A: null,
    B: null,
    C: null,
  };

  return (
    <div style={styles.wrapper}>
      {/* 🔥 CONTROL BAR TETAP ADA */}
      {!isFullscreen && ipcRenderer && (
        <div style={styles.controlBar}>
          <button
            style={styles.openBtn}
            onClick={() => ipcRenderer.send("open-display")}
          >
            🖥 Fullscreen
          </button>

          <button
            style={styles.closeBtn}
            onClick={() => ipcRenderer.send("close-display")}
          >
            ❌ Close
          </button>
        </div>
      )}

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>ROAD RACE CHAMPIONSHIP 2026</h1>
          <div style={styles.subtitle}>BABAK {ronde}</div>
        </div>

        {/* JALUR */}
        <div style={styles.laneGrid}>
          {Object.keys(lanes).map((laneKey) => (
            <div key={laneKey} style={styles.laneCard}>
              <div style={styles.laneHeader}>JALUR {laneKey}</div>

              <div style={styles.playerList}>
                {lanes[laneKey].map((name, index) => (
                  <div key={index} style={styles.playerItem}>
                    {name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* PEMENANG */}
        <div style={styles.winnerSection}>
          <div style={styles.winnerTitle}>PEMENANG</div>

          <div style={styles.winnerGrid}>
            {Object.keys(winners).map((laneKey) => (
              <div key={laneKey} style={styles.winnerCard}>
                <div style={styles.winnerLane}>JALUR {laneKey}</div>
                <div style={styles.winnerName}>{winners[laneKey] || "-"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    width: "100%",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    display: "flex",
    flexDirection: "column",
  },

  controlBar: {
    padding: "12px 40px",
    backgroundColor: "#111827",
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },

  openBtn: {
    padding: "6px 14px",
    backgroundColor: "#1e293b",
    color: "white",
    border: "1px solid #334155",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },

  closeBtn: {
    padding: "6px 14px",
    backgroundColor: "#7f1d1d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },

  container: {
    flex: 1,
    padding: "50px 100px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  title: {
    fontSize: "42px",
    fontWeight: "800",
    margin: 0,
  },

  subtitle: {
    fontSize: "24px",
    marginTop: "8px",
    color: "#94a3b8",
  },

  laneGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "40px",
  },

  laneCard: {
    background: "#1e293b",
    borderRadius: "16px",
    padding: "30px",
    border: "1px solid #334155",
  },

  laneHeader: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#38bdf8",
  },

  playerList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  playerItem: {
    fontSize: "22px",
    fontWeight: "600",
    padding: "10px 15px",
    background: "#0f172a",
    borderRadius: "8px",
    border: "1px solid #1e293b",
  },

  winnerSection: {
    marginTop: "40px",
    paddingTop: "30px",
    borderTop: "1px solid #334155",
  },

  winnerTitle: {
    textAlign: "center",
    fontSize: "26px",
    marginBottom: "30px",
    letterSpacing: "2px",
    color: "#e2e8f0",
  },

  winnerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "40px",
  },

  winnerCard: {
    background: "#111827",
    padding: "25px",
    borderRadius: "14px",
    textAlign: "center",
    border: "1px solid #1e293b",
  },

  winnerLane: {
    fontSize: "18px",
    marginBottom: "15px",
    color: "#94a3b8",
  },

  winnerName: {
    fontSize: "28px",
    fontWeight: "700",
  },
};
