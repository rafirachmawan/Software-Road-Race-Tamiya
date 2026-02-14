import { useState } from "react";

export default function Registrasi({ teams, setTeams }) {
  const [namaTim, setNamaTim] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [namaPemain, setNamaPemain] = useState("");

  /* ================= TAMBAH TIM ================= */
  const tambahTim = () => {
    if (!namaTim) return alert("Nama tim wajib diisi");

    const timSudahAda = teams.find(
      (t) => t.namaTim.toLowerCase() === namaTim.toLowerCase(),
    );

    if (timSudahAda) return alert("Nama tim sudah terdaftar!");

    const newTeam = {
      id: Date.now(),
      namaTim,
      pemain: [],
    };

    setTeams([...teams, newTeam]);
    setNamaTim("");
  };

  /* ================= TAMBAH PEMAIN ================= */
  const tambahPemain = () => {
    if (!selectedTeam || !namaPemain)
      return alert("Pilih tim dan isi nama pemain");

    const updated = teams.map((t) => {
      if (t.id === Number(selectedTeam)) {
        return {
          ...t,
          pemain: [...t.pemain, { id: Date.now(), nama: namaPemain }],
        };
      }
      return t;
    });

    setTeams(updated);
    setNamaPemain("");
  };

  /* ================= HAPUS PEMAIN ================= */
  const hapusPemain = (teamId, pemainId) => {
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          pemain: t.pemain.filter((p) => p.id !== pemainId),
        };
      }
      return t;
    });

    setTeams(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      {/* ================= HEADER ================= */}
      <div>
        <h1>🏁 Registrasi Tim & Pemain</h1>
        <p>
          Total Tim Terdaftar: <b>{teams.length}</b>
        </p>
      </div>

      {/* ================= FORM TAMBAH TIM ================= */}
      <div style={cardStyle}>
        <h3>Tambah Tim Baru</h3>
        <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
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

      {/* ================= FORM TAMBAH PEMAIN ================= */}
      <div style={cardStyle}>
        <h3>Tambah Pemain ke Tim</h3>
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "10px",
            flexWrap: "wrap",
          }}
        >
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
      <div style={gridStyle}>
        {teams.length === 0 && (
          <p style={{ color: "#64748b" }}>Belum ada tim terdaftar</p>
        )}

        {teams.map((team) => (
          <div key={team.id} style={teamCard}>
            <h3 style={{ marginBottom: "10px" }}>{team.namaTim}</h3>

            {team.pemain.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>Belum ada pemain</p>
            ) : (
              team.pemain.map((p) => (
                <div key={p.id} style={playerItem}>
                  <span>{p.nama}</span>
                  <button
                    onClick={() => hapusPemain(team.id, p.id)}
                    style={deleteBtn}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  minWidth: "200px",
};

const primaryBtn = {
  padding: "10px 18px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: "20px",
};

const teamCard = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
};

const playerItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid #f1f5f9",
};

const deleteBtn = {
  background: "#ef4444",
  border: "none",
  color: "white",
  borderRadius: "6px",
  padding: "4px 8px",
  cursor: "pointer",
};
