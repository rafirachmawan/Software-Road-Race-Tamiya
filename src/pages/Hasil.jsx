import { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BrowserMultiFormatReader } from "@zxing/browser";

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
  const [maxColumn, setMaxColumn] = useState("I");
  const columns = useMemo(() => generateColumns(maxColumn), [maxColumn]);

  const createEmptyRound = (roundNumber) => ({
    id: roundNumber,
    nama: `Round ${roundNumber}`,
    grid: [],
  });

  const [rounds, setRounds] = useState([createEmptyRound(2)]);
  const [selectedRound, setSelectedRound] = useState(2);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showScanModal, setShowScanModal] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const codeReader = useRef(null);

  const roundAktif = rounds.find((r) => r.id === selectedRound);

  /* ================= ISI SLOT ================= */
  const isiSlot = async (nama) => {
    const colCount = columns.length;
    const rowIndex = Math.floor(currentIndex / colCount);
    const colIndex = currentIndex % colCount;
    const columnKey = columns[colIndex];

    const updatedRounds = rounds.map((r) => {
      if (r.id === selectedRound) {
        const newGrid = [...r.grid];

        if (!newGrid[rowIndex]) {
          const newRow = { no: rowIndex + 1 };
          columns.forEach((col) => (newRow[col] = ""));
          newGrid[rowIndex] = newRow;
        }

        newGrid[rowIndex][columnKey] = nama;
        return { ...r, grid: newGrid };
      }
      return r;
    });

    setRounds(updatedRounds);

    // ✅ SAVE KE DATABASE
    await window.api.saveSlot({
      roundId: selectedRound,
      rowIndex,
      columnKey,
      playerName: nama,
    });

    setCurrentIndex((prev) => prev + 1);
  };

  /* ================= HANDLE BARCODE RESULT ================= */
  const handleBarcodeResult = async (barcodeText) => {
    const player = await window.api.findPlayer(barcodeText);

    if (!player) {
      alert("❌ Barcode tidak ditemukan!");
      return;
    }

    isiSlot(`${player.nama} (${player.namaTim})`);
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
  const tambahRound = () => {
    const newRoundNumber = rounds.length + 2;
    setRounds([...rounds, createEmptyRound(newRoundNumber)]);
    setSelectedRound(newRoundNumber);
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
    loadRoundData(selectedRound);
  }, [selectedRound]);

  const loadRoundData = async (roundId) => {
    const slots = await window.api.getRoundData(roundId);

    if (!slots || slots.length === 0) return;

    const newGrid = [];

    slots.forEach((slot) => {
      const { rowIndex, columnKey, playerName } = slot;

      if (!newGrid[rowIndex]) {
        const newRow = { no: rowIndex + 1 };
        columns.forEach((col) => (newRow[col] = ""));
        newGrid[rowIndex] = newRow;
      }

      newGrid[rowIndex][columnKey] = playerName;
    });

    setRounds((prev) =>
      prev.map((r) => (r.id === roundId ? { ...r, grid: newGrid } : r)),
    );

    // hitung ulang currentIndex biar lanjut dari slot terakhir
    const totalFilled = slots.length;
    setCurrentIndex(totalFilled);
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
          <label style={labelStyle}>Max Kolom</label>
          <select
            value={maxColumn}
            onChange={(e) => setMaxColumn(e.target.value)}
            style={selectStyle}
          >
            {alphabet.map((letter) => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
        </div>

        <div style={roundTabWrapper}>
          {rounds.map((r) => (
            <button
              key={r.id}
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
              {columns.map((col) => (
                <th key={col} style={thStyle}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roundAktif.grid.map((row) => (
              <tr key={row.no}>
                <td style={tdStyle}>{row.no}</td>
                {columns.map((col) => (
                  <td key={col} style={tdStyle}>
                    {row[col] || "-"}
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
