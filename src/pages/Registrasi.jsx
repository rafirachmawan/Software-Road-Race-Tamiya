import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

export default function Registrasi() {
  const [teams, setTeams] = useState([]);
  const [namaTim, setNamaTim] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [namaPemain, setNamaPemain] = useState("");

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [layoutImage, setLayoutImage] = useState(null);

  const [layoutFileName, setLayoutFileName] = useState(
    "Belum ada file dipilih",
  );

  const barcodeRef = useRef(null);
  const printRef = useRef(null);
  const fileInputRef = useRef(null); // ✅ TAMBAHAN BARU

  const [searchTeam, setSearchTeam] = useState("");

  const filteredTeams = teams.filter((team) =>
    team.namaTim.toLowerCase().includes(searchTeam.toLowerCase()),
  );

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadTeams();
  }, []);
  const loadTeams = async () => {
    const data = await window.api.getTeams();

    const sorted = data.sort((a, b) =>
      a.namaTim.localeCompare(b.namaTim, "id", { sensitivity: "base" }),
    );

    setTeams(sorted);
  };

  useEffect(() => {
    const savedLayout = localStorage.getItem("registerLayout");
    const savedName = localStorage.getItem("registerLayoutName");

    if (savedLayout) setLayoutImage(savedLayout);
    if (savedName) setLayoutFileName(savedName);
  }, []);

  /* ================= RENDER BARCODE (FIXED) ================= */
  useEffect(() => {
    if (selectedPlayer && barcodeRef.current) {
      JsBarcode(barcodeRef.current, selectedPlayer.barcode, {
        format: "CODE128",
        width: 2,
        height: 80,
        margin: 10,

        displayValue: false,
        fontSize: 22,

        background: "#ffffff",
      });
    }
  }, [selectedPlayer]);

  /* ================= TAMBAH TIM ================= */
  const tambahTim = async () => {
    if (!namaTim) return alert("Nama tim wajib diisi");

    const result = await window.api.addTeam(namaTim);
    if (!result.success) return alert(result.message);

    setNamaTim("");
    loadTeams();
  };

  /* ================= TAMBAH PEMAIN ================= */
  const tambahPemain = async () => {
    if (!selectedTeam || !namaPemain)
      return alert("Pilih tim dan isi nama pemain");

    const result = await window.api.addPlayer({
      teamId: Number(selectedTeam),
      nama: namaPemain,
    });

    if (result.success) {
      setSelectedPlayer(result.player);
      setEditNama(result.player.nama);
    }

    setNamaPemain("");
    loadTeams();
  };

  /* ================= OPEN MODAL ================= */
  const openPlayerModal = (player) => {
    setSelectedPlayer(player);
    setEditNama(player.nama);
  };

  /* ================= UPDATE NAMA ================= */
  const updateNama = async () => {
    if (!editNama) return alert("Nama tidak boleh kosong");

    const result = await window.api.updatePlayer({
      id: selectedPlayer.id,
      nama: editNama,
    });

    if (result.success) {
      setSelectedPlayer({ ...selectedPlayer, nama: editNama });
      loadTeams();
    }
  };

  /* ================= PRINT ================= */
  const handlePrint = () => {
    if (!layoutImage) {
      alert("Upload layout dulu!");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 297;
    const pageHeight = 210;

    const img = new Image();
    img.src = layoutImage;

    img.onload = () => {
      const imgRatio = img.width / img.height;

      // 🔥 Kita tetap pakai grid 5x2 seperti Print Team
      const marginSide = 5;
      const columns = 5;
      const gapX = 4;
      const gapY = 5;

      const usableWidth = pageWidth - marginSide * 2 - gapX * (columns - 1);

      const cardWidth = usableWidth / columns;
      const cardHeight = cardWidth / imgRatio;

      const x = marginSide;
      const y = 10;

      const player = selectedPlayer;

      // 🖼️ Background Layout
      doc.addImage(layoutImage, "JPEG", x, y, cardWidth, cardHeight);

      // ======================
      // TEAM
      // ======================
      const teamY = y + cardHeight * 0.5;

      doc.setFontSize(16);
      doc.text(
        teams.find((t) => t.id === player.teamId)?.namaTim || "",
        x + cardWidth / 2,
        teamY,
        { align: "center" },
      );

      // ======================
      // NAMA RACER
      // ======================
      const namaY = y + cardHeight * 0.66;

      doc.setFontSize(16);
      doc.text(player.nama, x + cardWidth / 2, namaY, {
        align: "center",
      });

      // ======================
      // BARCODE
      // ======================
      const barcodeY = y + cardHeight * 0.79;

      const canvas = document.createElement("canvas");

      JsBarcode(canvas, player.barcode, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
      });

      const barcodeImage = canvas.toDataURL("image/png");

      doc.addImage(
        barcodeImage,
        "PNG",
        x + cardWidth * 0.15,
        barcodeY - 4,
        cardWidth * 0.7,
        15,
      );

      doc.output("dataurlnewwindow");
    };
  };

  const handlePrintTeam = (team) => {
    if (!layoutImage) {
      alert("Upload layout dulu!");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 297; // A4 landscape width
    const pageHeight = 210;

    const img = new Image();
    img.src = layoutImage;

    img.onload = () => {
      const imgRatio = img.width / img.height;

      // ================================
      // 🔥 FULL 5 KOLOM x 2 BARIS
      // ================================

      const marginSide = 5; // margin kiri kanan kecil

      const columns = 5; // 5 kartu per baris
      const rows = 2;

      const gapX = 4; // 🔥 jarak samping antar card
      const gapY = 5; // jarak antar baris

      const usableWidth = pageWidth - marginSide * 2 - gapX * (columns - 1);

      const cardWidth = usableWidth / columns;
      const cardHeight = cardWidth / imgRatio;

      let x = marginSide;
      let y = 10;

      let col = 0;
      let row = 0;

      team.pemain.slice(0, 10).forEach((p) => {
        // 🖼️ Layout Background
        doc.addImage(layoutImage, "JPEG", x, y, cardWidth, cardHeight);

        // 🎯 POSISI TEXT (atur kalau mau geser)
        const teamY = y + cardHeight * 0.5;
        const namaY = y + cardHeight * 0.65;

        const barcodeY = y + cardHeight * 0.79;

        // ======================
        // LABEL & VALUE TEAM
        // ======================

        // ======================
        // LABEL & VALUE TEAM (GESER TURUN)
        // ======================

        const valueTeamY = y + cardHeight * 0.5;

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(team.namaTim, x + cardWidth / 2, valueTeamY, {
          align: "center",
        });

        // ======================
        // LABEL & VALUE RACER (GESER TURUN)
        // ======================

        const valueRacerY = y + cardHeight * 0.66;

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(p.nama, x + cardWidth / 2, valueRacerY, { align: "center" });

        // 📦 Generate Barcode
        const canvas = document.createElement("canvas");

        JsBarcode(canvas, p.barcode, {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: false,
        });

        const barcodeImage = canvas.toDataURL("image/png");

        doc.addImage(
          barcodeImage,
          "PNG",
          x + cardWidth * 0.15, // lebih ke kiri
          barcodeY - 4, // sedikit naik biar pas tengah
          cardWidth * 0.7, // hampir full lebar
          15, // lebih tinggi
        );

        // ======================
        // GRID SYSTEM 5 x 2
        // ======================

        col++;

        if (col === columns) {
          col = 0;
          row++;
          x = marginSide;
          y += cardHeight + gapY;
        } else {
          x += cardWidth + gapX;
        }
      });

      doc.output("dataurlnewwindow");
    };
  };

  /* ================= DOWNLOAD BARCODE ================= */
  const downloadBarcode = () => {
    const svg = barcodeRef.current;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    const svgBlob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");

      // 🔥 naikkan resolusi supaya hasil PNG tajam
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${selectedPlayer.nama}-${selectedPlayer.barcode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  /* ================= DELETE ================= */
  const hapusPemain = async (id) => {
    await window.api.deletePlayer(id);
    loadTeams();
  };

  const handleLayoutUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;

      setLayoutImage(base64);
      setLayoutFileName(file.name);

      // 🔥 SIMPAN
      localStorage.setItem("registerLayout", base64);
      localStorage.setItem("registerLayoutName", file.name);
    };

    reader.readAsDataURL(file);
  };

  // 🔥 TARUH DI SINI (MASIH DI DALAM Registrasi())
  const handleRemoveLayout = () => {
    setLayoutImage(null);
    setLayoutFileName("Belum ada file dipilih");

    localStorage.removeItem("registerLayout");
    localStorage.removeItem("registerLayoutName");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      <div style={cardStyle}>
        <h3>Upload Layout ID Card</h3>

        <div style={uploadWrapper}>
          <input
            type="file"
            accept="image/*"
            onChange={handleLayoutUpload}
            ref={fileInputRef}
            style={{ display: "none" }}
          />

          <button
            style={uploadButton}
            onClick={() => fileInputRef.current.click()}
          >
            📁 Pilih Layout
          </button>

          <span style={fileNameText}>{layoutFileName}</span>

          {layoutImage && (
            <button style={removeLayoutBtn} onClick={handleRemoveLayout}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* SEARCH TEAM */}
      <div style={searchCard}>
        <div style={searchHeader}>
          <h3 style={{ margin: 0 }}>🔍 Cari Tim</h3>
          <span style={resultCount}>{filteredTeams.length} Tim ditemukan</span>
        </div>

        <div style={searchWrapper}>
          <span style={searchIcon}>🔎</span>

          <input
            type="text"
            placeholder="Ketik nama tim..."
            value={searchTeam}
            onChange={(e) => setSearchTeam(e.target.value)}
            style={searchInput}
          />

          {searchTeam && (
            <button onClick={() => setSearchTeam("")} style={clearBtn}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div style={gridPro}>
        {filteredTeams.map((team) => (
          <div key={team.id} style={teamCardPro}>
            <h3>{team.namaTim}</h3>

            <button
              onClick={() => handlePrintTeam(team)}
              style={{ ...printBtn, marginBottom: "15px" }}
            >
              🖨 Print 1 Tim (A4)
            </button>

            {team.pemain.map((p, index) => (
              <div key={p.id} style={playerItemPro}>
                <div style={playerLeft}>
                  <div style={playerBadge}>{index + 1}</div>

                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => openPlayerModal(p)}
                  >
                    <strong>{p.nama}</strong>
                    <div style={barcodeText}>{p.barcode}</div>
                  </div>
                </div>

                <button
                  onClick={() => hapusPemain(p.id)}
                  style={deleteBtnPro}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#fee2e2";
                    e.target.style.color = "#ef4444";
                    e.target.style.border = "1px solid #fecaca";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#ffffff";
                    e.target.style.color = "#9ca3af";
                    e.target.style.border = "1px solid #f3f4f6";
                  }}
                >
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

              <svg
                ref={barcodeRef}
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  marginTop: "20px",
                }}
              ></svg>
            </div>

            <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
              <button style={printBtn} onClick={handlePrint}>
                🖨 Print
              </button>

              <button style={downloadBtn} onClick={downloadBarcode}>
                ⬇ Download
              </button>

              <button style={closeBtn} onClick={() => setSelectedPlayer(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      <div id="print-area" style={{ display: "none" }}></div>
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

const searchCard = {
  background: "linear-gradient(135deg, #f8fafc, #ffffff)",
  padding: "25px",
  borderRadius: "18px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  border: "1px solid #f1f5f9",
};

const searchHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
};

const resultCount = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#64748b",
  background: "#e2e8f0",
  padding: "5px 10px",
  borderRadius: "8px",
};

const searchWrapper = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const searchIcon = {
  position: "absolute",
  left: "14px",
  fontSize: "14px",
  color: "#94a3b8",
};

const searchInput = {
  width: "100%",
  padding: "14px 45px 14px 40px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  outline: "none",
  transition: "all 0.2s ease",
};

const clearBtn = {
  position: "absolute",
  right: "10px",
  background: "#f1f5f9",
  border: "none",
  borderRadius: "8px",
  width: "28px",
  height: "28px",
  cursor: "pointer",
  fontSize: "12px",
  color: "#64748b",
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
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  border: "1px solid #f3f4f6",
  background: "#ffffff",
  color: "#9ca3af",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
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
  padding: "30px",
  borderRadius: "16px",
  textAlign: "center",
  width: "500px", // 🔥 fix width
  maxWidth: "90%",
};

const printBtn = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const downloadBtn = {
  padding: "10px 20px",
  background: "#0ea5e9",
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
const uploadWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginTop: "15px",
};

const uploadButton = {
  padding: "12px 22px",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 6px 18px rgba(37,99,235,0.4)",
  transition: "all 0.2s ease",
};

const fileNameText = {
  fontSize: "14px",
  color: "#475569",
  fontWeight: "500",
};

const removeLayoutBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "8px",
  width: "30px",
  height: "30px",
  cursor: "pointer",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const style = document.createElement("style");
style.innerHTML = `
@media print {

  @page {
    size: A4;
    margin: 0;
  }

  body {
    margin: 0;
  }

  body * {
    visibility: hidden;
  }

  #print-area, #print-area * {
    visibility: visible;
  }

  #print-area {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 190mm;
    padding-top: 10mm;
  }

  .container {
    display: grid;
    grid-template-columns: repeat(2, 90mm);
    grid-template-rows: repeat(5, 55mm);
    gap: 10mm;
  }

  .card {
    width: 90mm;
    height: 55mm;
    position: relative;
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .nama {
    position: absolute;
    top: 48%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
    font-size: 14px;
  }

  .tim {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
  }

  svg {
    position: absolute;
    bottom: 5mm;
    left: 50%;
    transform: translateX(-50%);
  }
}
  const removeLayoutBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "8px",
  width: "30px",
  height: "30px",
  cursor: "pointer",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

`;
document.head.appendChild(style);
