import { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BrowserMultiFormatReader } from "@zxing/browser";

import JsBarcode from "jsbarcode";

/* ================= GENERATE COLUMN ================= */
const generateColumns = (endLetter = "I") => {
  const start = "A".charCodeAt(0);
  const end = endLetter.charCodeAt(0);
  const cols = [];
  for (let i = start; i <= end; i++) {
    cols.push(String.fromCharCode(i));
  }
  return cols;
};

const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);

export default function Hasil() {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showKuponModal, setShowKuponModal] = useState(false);
  const [kuponData, setKuponData] = useState(null);

  const [editTarget, setEditTarget] = useState(null);

  const roundAktif = rounds.find((r) => r.id === selectedRound);
  const totalTrack = roundAktif?.totalTrack || 2;

  const columns = useMemo(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const totalColumns = totalTrack * 3;
    return letters.slice(0, totalColumns);
  }, [totalTrack]);

  const createEmptyRound = (roundNumber) => ({
    id: roundNumber,
    nama: `Round ${roundNumber}`,
    grid: [],
  });

  // format: { rowIndex, columnKey }

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const codeReader = useRef(null);
  const barcodeRef = useRef(null);
  const printRef = useRef(null);

  const thermalRef = useRef(null);

  /* ================= LOAD ROUNDS SAAT MOUNT ================= */
  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    const data = await window.api.getRounds();

    if (!data || data.length === 0) {
      // 🔥 DEFAULT ROUND = ROUND 2
      const newRound = await window.api.addRound({
        nama: "Round 2",
        totalTrack: 2,
      });

      setRounds([{ ...newRound, grid: [] }]);
      setSelectedRound(newRound.id);
    } else {
      const formatted = data.map((r) => ({
        ...r,
        grid: [],
      }));

      setRounds(formatted);

      // 🔥 otomatis pilih Round 2 jika ada
      const round2 = formatted.find((r) => r.nama === "Round 2");

      setSelectedRound(round2 ? round2.id : formatted[0].id);
    }
  };

  /* ================= ISI SLOT ================= */
  const isiSlot = async (player) => {
    let rowIndex;
    let columnKey;

    // =====================
    // MODE EDIT
    // =====================
    if (editTarget) {
      rowIndex = editTarget.rowIndex;
      columnKey = editTarget.columnKey;
    } else {
      // =====================
      // MODE NORMAL (SCAN BARU)
      // =====================
      const colCount = columns.length;
      rowIndex = Math.floor(currentIndex / colCount);
      const colIndex = currentIndex % colCount;
      columnKey = columns[colIndex];
    }

    const updatedRounds = rounds.map((r) => {
      if (r.id === selectedRound) {
        const newGrid = [...r.grid];

        if (!newGrid[rowIndex]) {
          const newRow = { no: rowIndex + 1 };
          columns.forEach((col) => (newRow[col] = null));
          newGrid[rowIndex] = newRow;
        }

        // 🔥 INI YANG MENGGANTI SLOT
        newGrid[rowIndex][columnKey] = player;

        return { ...r, grid: newGrid };
      }
      return r;
    });

    setRounds(updatedRounds);

    await window.api.saveSlot({
      roundId: selectedRound,
      rowIndex,
      columnKey,
      playerId: player.id,
    });

    setKuponData({
      nama: player.nama,
      team: player.namaTim,
      round: selectedRound,
      track: rowIndex + 1,
      lane: columnKey,
    });

    setShowKuponModal(true);

    // 🔥 HANYA TAMBAH INDEX JIKA BUKAN EDIT
    if (!editTarget) {
      setCurrentIndex((prev) => prev + 1);
    }

    // Reset edit mode
    setEditTarget(null);
  };

  /* ================= HANDLE BARCODE RESULT ================= */
  const handleBarcodeResult = async (barcodeText) => {
    const player = await window.api.findPlayer(barcodeText);

    if (!player) {
      alert("❌ Barcode tidak ditemukan!");
      return;
    }

    isiSlot(player);

    stopCamera();
    setShowScanModal(false);
  };

  /* ================= START CAMERA ================= */
  const startCamera = async () => {
    try {
      codeReader.current = new BrowserMultiFormatReader();

      // Pakai navigator langsung (lebih stabil di Electron)
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      if (!videoDevices.length) {
        alert("Tidak ada kamera terdeteksi");
        return;
      }

      const selectedDeviceId = videoDevices[0].deviceId;

      await codeReader.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            handleBarcodeResult(result.getText());
          }
        },
      );
    } catch (err) {
      console.error("ERROR CAMERA:", err);
      alert("Camera tidak bisa diakses");
    }
  };

  /* ================= STOP CAMERA ================= */
  const stopCamera = () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.log("Stop camera error:", err);
    }
  };

  /* ================= HANDLE IMAGE UPLOAD ================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = URL.createObjectURL(file);

      const img = document.createElement("img");
      img.src = imageUrl;

      img.onload = async () => {
        try {
          const reader = new BrowserMultiFormatReader();
          const result = await reader.decodeFromImageElement(img);

          if (result) {
            await handleBarcodeResult(result.getText());
          } else {
            alert("❌ Barcode tidak ditemukan di gambar");
          }

          URL.revokeObjectURL(imageUrl);
        } catch (err) {
          console.error("Decode error:", err);
          alert("❌ Tidak bisa membaca barcode dari gambar");
        }
      };

      img.onerror = () => {
        alert("❌ Gambar gagal dimuat");
      };

      e.target.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Gagal memproses gambar");
    }
  };

  /* ================= TAMBAH ROUND ================= */
  const tambahRound = async () => {
    const numbers = rounds.map((r) => parseInt(r.nama.replace("Round ", "")));

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 2;

    const newNumber = maxNumber + 1;

    const newRound = await window.api.addRound({
      nama: `Round ${newNumber}`,
      totalTrack: totalTrack,
    });

    setRounds((prev) => [...prev, { ...newRound, grid: [] }]);
    setSelectedRound(newRound.id);
    setCurrentIndex(0);
  };

  /* ================= EXPORT ================= */
  const exportExcel = () => {
    const data = roundAktif.grid.map((row) => {
      const rowData = { NO: row.no };
      columns.forEach((col) => {
        rowData[col] = row[col] || "";
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, roundAktif.nama);

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${roundAktif.nama}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = ["NO", ...columns];
    const tableRows = roundAktif.grid.map((row) => [
      row.no,
      ...columns.map((col) => row[col] || ""),
    ]);

    doc.text(`Round Result - ${roundAktif.nama}`, 14, 15);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save(`${roundAktif.nama}.pdf`);
  };

  useEffect(() => {
    if (selectedRound !== null) {
      loadRoundData(selectedRound);
    }
  }, [selectedRound]);

  useEffect(() => {
    if (selectedPlayer && barcodeRef.current) {
      JsBarcode(barcodeRef.current, selectedPlayer.barcode, {
        format: "CODE128",
        width: 3,
        height: 120,
        displayValue: true,
        fontSize: 22,
        margin: 20,
        background: "#ffffff",
      });
    }
  }, [selectedPlayer]);

  const loadRoundData = async (roundId) => {
    const slots = await window.api.getRoundData(roundId);

    if (!slots || slots.length === 0) return;

    const newGrid = [];

    slots.forEach((slot) => {
      const { rowIndex, columnKey, id, nama, barcode, namaTim } = slot;

      if (!newGrid[rowIndex]) {
        const newRow = { no: rowIndex + 1 };
        columns.forEach((col) => (newRow[col] = null));

        newGrid[rowIndex] = newRow;
      }

      newGrid[rowIndex][columnKey] = {
        id,
        nama,
        barcode,
        namaTim,
      };
    });

    setRounds((prev) =>
      prev.map((r) => (r.id === roundId ? { ...r, grid: newGrid } : r)),
    );

    // hitung ulang currentIndex biar lanjut dari slot terakhir
    const totalFilled = slots.length;
    setCurrentIndex(totalFilled);
  };

  const hapusRound = async (roundId) => {
    if (!confirm("Yakin ingin menghapus round ini?")) return;

    await window.api.deleteRound(roundId);

    const updated = rounds.filter((r) => r.id !== roundId);

    setRounds(updated);

    if (updated.length > 0) {
      setSelectedRound(updated[0].id);
    } else {
      setSelectedRound(null);
    }
  };

  /* ================= TRACK COLOR GROUPING ================= */
  const getTrackHeaderStyle = (colIndex) => {
    const trackIndex = Math.floor(colIndex / 3);

    const styles = [
      {
        background: "#1d4ed8", // Blue
        color: "white",
      },
      {
        background: "#0f172a", // Navy
        color: "white",
      },
      {
        background: "#059669", // Emerald
        color: "white",
      },
      {
        background: "#b45309", // Amber dark
        color: "white",
      },
      {
        background: "#7c3aed", // Violet
        color: "white",
      },
      {
        background: "#dc2626", // Red
        color: "white",
      },
    ];

    return styles[trackIndex] || {};
  };

  const getTrackBodyStyle = (colIndex) => {
    const trackIndex = Math.floor(colIndex / 3);

    const styles = [
      { background: "rgba(29, 78, 216, 0.08)" }, // Blue soft
      { background: "rgba(15, 23, 42, 0.05)" }, // Navy soft
      { background: "rgba(5, 150, 105, 0.08)" }, // Emerald soft
      { background: "rgba(180, 83, 9, 0.08)" }, // Amber soft
      { background: "rgba(124, 58, 237, 0.08)" }, // Violet soft
      { background: "rgba(220, 38, 38, 0.08)" }, // Red soft
    ];

    return styles[trackIndex] || {};
  };

  return (
    <div style={pageWrapper}>
      <div style={headerWrapper}>
        <div>
          <h1 style={{ margin: 0 }}>🏁 ROUND MANAGEMENT</h1>
          <p style={subText}>Scan barcode untuk isi otomatis</p>
        </div>

        <div style={exportGroup}>
          <button style={exportBlue} onClick={exportPDF}>
            Export PDF
          </button>
          <button style={exportGreen} onClick={exportExcel}>
            Export Excel
          </button>
        </div>
      </div>

      <div style={controlCard}>
        <div style={controlLeft}>
          <label style={labelStyle}>Total Track</label>

          <div style={trackWrapper}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={async () => {
                  await window.api.updateRoundTrack({
                    id: selectedRound,
                    totalTrack: num,
                  });

                  setRounds((prev) =>
                    prev.map((r) =>
                      r.id === selectedRound ? { ...r, totalTrack: num } : r,
                    ),
                  );
                }}
                style={{
                  ...trackButton,
                  ...(totalTrack === num ? activeTrackButton : {}),
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div style={roundTabWrapper}>
          {rounds.map((r) => (
            <div
              key={r.id}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <button
                onClick={() => {
                  setSelectedRound(r.id);
                  setCurrentIndex(0);
                }}
                style={{
                  ...roundBtn,
                  background: selectedRound === r.id ? "#0f172a" : "#f1f5f9",
                  color: selectedRound === r.id ? "white" : "#0f172a",
                }}
              >
                {r.nama}
              </button>

              {/* 🔥 ROUND 2 TIDAK BOLEH DIHAPUS */}
              {r.nama !== "Round 2" && (
                <button
                  onClick={() => hapusRound(r.id)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button style={addRoundBtn} onClick={tambahRound}>
            + Tambah
          </button>
        </div>
      </div>

      {/* BUTTON SCAN */}
      <div style={inputCard}>
        <button
          style={{
            ...inputStyle,
            background: "#0f172a",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => {
            setShowScanModal(true);
            setTimeout(startCamera, 300);
          }}
        >
          📷 Scan Barcode
        </button>
      </div>

      {/* TABLE */}
      <div style={tableCard}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>NO</th>
              {columns.map((col, index) => (
                <th
                  key={col}
                  style={{
                    ...thStyle,
                    ...getTrackHeaderStyle(index),
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {roundAktif?.grid?.map((row) => (
              <tr key={row.no}>
                <td style={tdStyle}>{row.no}</td>
                {columns.map((col, index) => (
                  <td
                    key={col}
                    style={{
                      ...tdStyle,
                      ...getTrackBodyStyle(index),

                      cursor: row[col] ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (!row[col]) return;

                      const rowIndex = row.no - 1;

                      setEditTarget({
                        rowIndex,
                        columnKey: col,
                      });

                      setKuponData({
                        nama: row[col].nama,
                        team: row[col].namaTim,
                        round: selectedRound,
                        track: row.no,
                        lane: col,
                      });

                      setShowKuponModal(true);
                    }}
                  >
                    {row[col] ? row[col].namaTim : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showScanModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Scan Barcode</h3>

            <video
              ref={videoRef}
              style={{ width: "100%", borderRadius: "10px" }}
            />

            <div style={{ marginTop: 15 }}>
              <button
                style={exportGreen}
                onClick={() => fileInputRef.current.click()}
              >
                Upload Gambar Barcode
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>

            <div style={{ marginTop: 15 }}>
              <button
                style={addRoundBtn}
                onClick={() => {
                  stopCamera();
                  setShowScanModal(false);
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedPlayer && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div ref={printRef}>
              <h3>Detail Peserta</h3>

              <p>
                <strong>Nama:</strong> {selectedPlayer.nama}
              </p>
              <p>
                <strong>Tim:</strong> {selectedPlayer.namaTim}
              </p>

              <div style={thermalButtonWrapper}>
                <button
                  style={thermalPrintBtn}
                  onClick={() => {
                    const content = thermalRef.current.innerHTML;
                    const win = window.open("", "", "width=400,height=600");

                    win.document.write(`
        <html>
          <head>
            <style>
              body {
                margin:0;
                font-family: monospace;
                text-align:center;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);

                    win.document.close();
                    win.focus();
                    win.print();
                    win.close();
                  }}
                >
                  🖨 Print Thermal
                </button>

                <button
                  style={thermalCloseBtn}
                  onClick={() => setShowKuponModal(false)}
                >
                  ✕ Tutup
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
              {/* PRINT */}
              <button
                style={exportBlue}
                onClick={() => {
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
                }}
              >
                Print
              </button>

              {/* DOWNLOAD */}
              <button
                style={exportGreen}
                onClick={() => {
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
                }}
              >
                Download
              </button>

              {/* CLOSE */}
              <button
                style={addRoundBtn}
                onClick={() => setSelectedPlayer(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {showKuponModal && kuponData && (
        <div style={modalOverlay}>
          <div style={thermalModalBox}>
            <div ref={thermalRef} style={thermalWrapper}>
              <div style={thermalHeader}>
                <div style={thermalTitle}>KUPON BABAK {kuponData.round}</div>
              </div>

              <div style={thermalDivider} />

              <div style={thermalName}>{kuponData.nama}</div>
              <div style={thermalTeam}>{kuponData.team}</div>

              <div style={thermalDivider} />

              <div style={thermalTrack}>
                {kuponData.track} - {kuponData.lane}
              </div>

              <div style={thermalDivider} />

              <div style={thermalFooter}>Race System</div>
            </div>

            <div style={thermalButtonWrapper}>
              {/* PRINT */}
              <button
                style={thermalPrintBtn}
                onClick={() => {
                  const content = thermalRef.current.innerHTML;
                  const win = window.open("", "", "width=400,height=600");

                  win.document.write(`
        <html>
          <head>
            <style>
              body {
                margin:0;
                font-family: monospace;
                text-align:center;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);

                  win.document.close();
                  win.focus();
                  win.print();
                  win.close();
                }}
              >
                🖨 Print Thermal
              </button>

              {/* ✏ EDIT */}
              <button
                style={{
                  ...thermalPrintBtn,
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
                }}
                onClick={() => {
                  setShowKuponModal(false);
                  setShowScanModal(true);
                  setTimeout(startCamera, 300);
                }}
              >
                ✏ Edit Slot
              </button>

              {/* CLOSE */}
              <button
                style={thermalCloseBtn}
                onClick={() => {
                  setEditTarget(null);
                  setShowKuponModal(false);
                }}
              >
                ✕ Tutup
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
const headerWrapper = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px",
};
const subText = { color: "#64748b", marginTop: "5px" };
const exportGroup = { display: "flex", gap: "10px" };
const exportBlue = {
  padding: "10px 18px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
const exportGreen = {
  padding: "10px 18px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
const controlCard = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px",
};
const controlLeft = { display: "flex", alignItems: "center", gap: "10px" };
const labelStyle = { fontWeight: "600" };
const selectStyle = {
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
};
const roundTabWrapper = { display: "flex", gap: "10px", flexWrap: "wrap" };
const roundBtn = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};
const addRoundBtn = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "1px dashed #0f172a",
  background: "white",
  cursor: "pointer",
};
const inputCard = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
};
const inputStyle = {
  width: "100%",
  padding: "14px",
  fontSize: "16px",
  borderRadius: "10px",
};
const tableCard = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
  overflowX: "auto",
};
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = {
  padding: "12px",
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
};
const tdStyle = {
  padding: "10px",
  border: "1px solid #f1f5f9",
  textAlign: "center",
};
const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};
const modalBox = {
  background: "white",
  padding: "30px",
  borderRadius: "16px",
  width: "400px",
};
const kuponCard = {
  border: "2px solid black",
  padding: "20px",
  width: "250px",
  textAlign: "center",
};

const kuponSide = {
  border: "2px solid black",
  padding: "20px",
  width: "200px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const thermalModalBox = {
  background: "white",
  padding: "30px",
  borderRadius: "16px",
  width: "300px",
  textAlign: "center",
};

const thermalWrapper = {
  width: "240px", // cocok untuk 58mm
  margin: "0 auto",
  fontFamily: "monospace",
};

const thermalHeader = {
  fontSize: "18px",
  fontWeight: "bold",
};

const thermalTitle = {
  fontSize: "18px",
  letterSpacing: "1px",
};

const thermalDivider = {
  borderTop: "1px dashed black",
  margin: "10px 0",
};

const thermalName = {
  fontSize: "20px",
  fontWeight: "bold",
};

const thermalTeam = {
  fontSize: "14px",
  marginTop: "4px",
};

const thermalTrack = {
  fontSize: "28px",
  fontWeight: "bold",
  margin: "10px 0",
};

const thermalFooter = {
  fontSize: "12px",
  marginTop: "10px",
};

const thermalButtonWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "25px",
};

const thermalPrintBtn = {
  width: "100%",
  padding: "12px",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
};

const thermalCloseBtn = {
  width: "100%",
  padding: "10px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  fontWeight: "500",
  fontSize: "14px",
  cursor: "pointer",
};
const trackWrapper = {
  display: "flex",
  background: "#f1f5f9",
  borderRadius: "12px",
  padding: "4px",
  gap: "4px",
};

const trackButton = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "8px",
  background: "transparent",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  color: "#334155",
  transition: "all 0.2s ease",
};

const activeTrackButton = {
  background: "#0f172a",
  color: "white",
  boxShadow: "0 4px 12px rgba(15,23,42,0.25)",
};
