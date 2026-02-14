import { useState, useEffect } from "react";

export default function Registrasi() {
  const [teams, setTeams] = useState([]);
  const [namaTim, setNamaTim] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [namaPemain, setNamaPemain] = useState("");

  /* ================= LOAD DATA AWAL ================= */
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const data = await window.api.getTeams();
    setTeams(data);
  };

  /* ================= TAMBAH TIM ================= */
  const tambahTim = async () => {
    if (!namaTim) return alert("Nama tim wajib diisi");

    const result = await window.api.addTeam(namaTim);

    if (!result.success) {
      return alert(result.message);
    }

    setNamaTim("");
    loadTeams();
  };

  /* ================= TAMBAH PEMAIN ================= */
  const tambahPemain = async () => {
    if (!selectedTeam || !namaPemain)
      return alert("Pilih tim dan isi nama pemain");

    await window.api.addPlayer({
      teamId: Number(selectedTeam),
      nama: namaPemain,
    });

    setNamaPemain("");
    loadTeams();
  };

  /* ================= HAPUS PEMAIN ================= */
  const hapusPemain = async (teamId, pemainId) => {
    await window.api.deletePlayer(pemainId);
    loadTeams();
  };

  return (
    <div style={pageWrapper}>
      {/* ================= HEADER ================= */}
      <div>
        <h1>🏁 Registrasi Tim & Pemain</h1>
        <p style={{ color: "#64748b" }}>
          Total Tim Terdaftar: <b>{teams.length}</b>
        </p>
      </div>

      {/* ================= TAMBAH TIM ================= */}
      <div style={cardStyle}>
        <h3>Tambah Tim Baru</h3>
        <div style={formRow}>
          <input
            placeholder="Nama Tim"
            value={namaTim}
            onChange={(e) => setNamaTim(e.target.value)}
            style={inputStyle}
          />
          <button onClick={tambahTim} style={primaryBtn}>
            + Tambah Tim
          </button>
        </div>
      </div>

      {/* ================= TAMBAH PEMAIN ================= */}
      <div style={cardStyle}>
        <h3>Tambah Pemain ke Tim</h3>
        <div style={formRow}>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={inputStyle}
          >
            <option value="">Pilih Tim</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.namaTim}
              </option>
            ))}
          </select>

          <input
            placeholder="Nama Pemain"
            value={namaPemain}
            onChange={(e) => setNamaPemain(e.target.value)}
            style={inputStyle}
          />

          <button onClick={tambahPemain} style={primaryBtn}>
            + Tambah Pemain
          </button>
        </div>
      </div>

      {/* ================= GRID TIM ================= */}
      <div style={gridPro}>
        {teams.length === 0 && (
          <p style={{ color: "#64748b" }}>Belum ada tim terdaftar</p>
        )}

        {teams.map((team) => (
          <div key={team.id} style={teamCardPro}>
            <div style={teamHeader}>
              <div>
                <h3 style={{ margin: 0 }}>{team.namaTim}</h3>
                <p style={teamSub}>{team.pemain.length} Pemain</p>
              </div>
            </div>

            <div style={{ marginTop: 15 }}>
              {team.pemain.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>Belum ada pemain</p>
              ) : (
                team.pemain.map((p, index) => (
                  <div key={p.id} style={playerItemPro}>
                    <div style={playerLeft}>
                      <div style={playerBadge}>{index + 1}</div>
                      <span>{p.nama}</span>
                    </div>

                    <button
                      onClick={() => hapusPemain(team.id, p.id)}
                      style={deleteBtnPro}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ================= STYLES ================= */

const pageWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "30px",
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "16px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
};

const formRow = {
  display: "flex",
  gap: "15px",
  marginTop: "15px",
  flexWrap: "wrap",
};

const inputStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  minWidth: "220px",
};

const primaryBtn = {
  padding: "12px 20px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
};

const gridPro = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "25px",
};

const teamCardPro = {
  background: "white",
  padding: "25px",
  borderRadius: "18px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
};

const teamHeader = {
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "12px",
};

const teamSub = {
  margin: "4px 0 0 0",
  fontSize: "13px",
  color: "#64748b",
};

const playerItemPro = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #f8fafc",
};

const playerLeft = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const playerBadge = {
  background: "#e2e8f0",
  fontSize: "12px",
  fontWeight: "600",
  padding: "5px 10px",
  borderRadius: "8px",
  minWidth: "28px",
  textAlign: "center",
};

const deleteBtnPro = {
  background: "#fee2e2",
  border: "none",
  color: "#ef4444",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
  fontWeight: "600",
};
