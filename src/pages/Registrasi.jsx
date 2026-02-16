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

  const barcodeRef = useRef(null);
  const printRef = useRef(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const data = await window.api.getTeams();
    setTeams(data);
  };

  /* ================= RENDER BARCODE (FIXED) ================= */
  useEffect(() => {
    if (selectedPlayer && barcodeRef.current) {
      JsBarcode(barcodeRef.current, selectedPlayer.barcode, {
        format: "CODE128",
        width: 3, // 🔥 lebih tebal
        height: 120, // 🔥 lebih tinggi
        displayValue: true,
        fontSize: 22,
        margin: 20, // 🔥 penting untuk scanner
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
    const content = printRef.current.innerHTML;
    const win = window.open("", "", "width=600,height=600");

    win.document.write(`
    @page {
  size: A4;
  margin: 0;
}

html, body {
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 0;
}

body {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10mm;
  box-sizing: border-box;
}

.container {
  width: 190mm;
  display: grid;
  grid-template-columns: repeat(2, 90mm);
  grid-auto-rows: 55mm;
  gap: 10mm;
  justify-content: center;
}

.card {
  position: relative;
  width: 90mm;
  height: 55mm;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  page-break-inside: avoid;
}

.content {
  position: relative;
  width: 100%;
  height: 100%;
}

.nama {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  font-size: 14px;
  color: black;
}

.tim {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: black;
}

svg {
  position: absolute;
  bottom: 5mm;
  left: 50%;
  transform: translateX(-50%);
}

    `);

    win.document.close();
    win.print();
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

    const pageWidth = 297;

    const img = new Image();
    img.src = layoutImage;

    img.onload = () => {
      const imgRatio = img.width / img.height;

      const cardHeight = 55; // 5.5 cm
      const cardWidth = cardHeight * imgRatio;

      const gap = 10;

      const totalWidth = cardWidth * 2 + gap;
      const startX = (pageWidth - totalWidth) / 2;

      let x = startX;
      let y = 25;
      let col = 0;

      team.pemain.forEach((p) => {
        // 🖼️ Layout
        doc.addImage(layoutImage, "JPEG", x, y, cardWidth, cardHeight);

        // 🎯 POSISI MANUAL (atur sendiri di sini)
        const namaY = y + 28; // ubah angka ini , naik kurangin angkanya
        const teamY = y + 36.5; // ubah angka ini
        const barcodeY = y + 42; // ubah angka ini

        doc.setFontSize(12);
        doc.text(p.nama, x + cardWidth / 2, namaY, { align: "center" });

        doc.setFontSize(10);
        doc.text(team.namaTim, x + cardWidth / 2, teamY, { align: "center" });

        // 📦 Barcode
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
          x + cardWidth * 0.15,
          barcodeY,
          cardWidth * 0.7,
          8,
        );

        col++;

        if (col === 2) {
          col = 0;
          x = startX;
          y += cardHeight + gap;
        } else {
          x += cardWidth + gap;
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
      setLayoutImage(reader.result);
    };
    reader.readAsDataURL(file);
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
        <input type="file" accept="image/*" onChange={handleLayoutUpload} />
      </div>

      {/* LIST */}
      <div style={gridPro}>
        {teams.map((team) => (
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
`;
document.head.appendChild(style);
