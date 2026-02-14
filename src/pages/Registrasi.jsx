import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function Registrasi() {
  const [teams, setTeams] = useState([]);
  const [namaTim, setNamaTim] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [namaPemain, setNamaPemain] = useState("");

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editNama, setEditNama] = useState("");

  const barcodeRef = useRef(null);
  const printRef = useRef(null);

  /* LOAD DATA */
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const data = await window.api.getTeams();
    setTeams(data);
  };

  /* TAMBAH TIM */
  const tambahTim = async () => {
    if (!namaTim) return alert("Nama tim wajib diisi");

    const result = await window.api.addTeam(namaTim);
    if (!result.success) return alert(result.message);

    setNamaTim("");
    loadTeams();
  };

  /* TAMBAH PEMAIN */
  const tambahPemain = async () => {
    if (!selectedTeam || !namaPemain)
      return alert("Pilih tim dan isi nama pemain");

    const result = await window.api.addPlayer({
      teamId: Number(selectedTeam),
      nama: namaPemain,
    });

    if (result.success) {
      openPlayerModal(result.player);
    }

    setNamaPemain("");
    loadTeams();
  };

  /* OPEN MODAL */
  const openPlayerModal = (player) => {
    setSelectedPlayer(player);
    setEditNama(player.nama);

    setTimeout(() => {
      if (barcodeRef.current) {
        JsBarcode(barcodeRef.current, player.barcode, {
          format: "CODE128",
          width: 2,
          height: 80,
          displayValue: true,
        });
      }
    }, 100);
  };

  /* UPDATE NAMA */
  const updateNama = async () => {
    const result = await window.api.updatePlayer({
      id: selectedPlayer.id,
      nama: editNama,
    });

    if (result.success) {
      loadTeams();
      setSelectedPlayer({ ...selectedPlayer, nama: editNama });
    }
  };

  /* PRINT */
  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "", "width=600,height=600");

    win.document.write(`
      <html>
        <body style="text-align:center;font-family:Arial;padding:30px">
          ${content}
        </body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  /* DELETE */
  const hapusPemain = async (id) => {
    await window.api.deletePlayer(id);
    loadTeams();
  };

  return (
    <div style={pageWrapper}>
      <h1>🏁 Registrasi Tim & Pemain</h1>

      {/* TAMBAH TIM */}
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

      {/* TAMBAH PEMAIN */}
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

      {/* LIST */}
      <div style={gridPro}>
        {teams.map((team) => (
          <div key={team.id} style={teamCardPro}>
            <h3>{team.namaTim}</h3>

            {team.pemain.map((p, index) => (
              <div key={p.id} style={playerItemPro}>
                <div style={playerLeft}>
                  <div style={playerBadge}>{index + 1}</div>

                  {/* CLICKABLE NAME */}
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => openPlayerModal(p)}
                  >
                    <strong>{p.nama}</strong>
                    <div style={barcodeText}>{p.barcode}</div>
                  </div>
                </div>

                <button onClick={() => hapusPemain(p.id)} style={deleteBtnPro}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedPlayer && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div ref={printRef}>
              <h2>🎟️ Kartu Peserta</h2>

              {/* EDIT NAMA */}
              <input
                value={editNama}
                onChange={(e) => setEditNama(e.target.value)}
                style={{
                  ...inputStyle,
                  marginBottom: "15px",
                  width: "100%",
                }}
              />

              <button onClick={updateNama} style={primaryBtn}>
                Update Nama
              </button>

              <p style={{ marginTop: 20 }}>Barcode: {selectedPlayer.barcode}</p>

              <svg ref={barcodeRef}></svg>
            </div>

            <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
              <button style={printBtn} onClick={handlePrint}>
                🖨 Print
              </button>

              <button style={closeBtn} onClick={() => setSelectedPlayer(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const pageWrapper = { display: "flex", flexDirection: "column", gap: "30px" };

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
};

const barcodeText = { fontSize: "12px", color: "#64748b" };

const deleteBtnPro = {
  background: "#fee2e2",
  border: "none",
  color: "#ef4444",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
  fontWeight: "600",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox = {
  background: "white",
  padding: "40px",
  borderRadius: "16px",
  textAlign: "center",
  minWidth: "400px",
};

const printBtn = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const closeBtn = {
  padding: "10px 20px",
  background: "#64748b",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
