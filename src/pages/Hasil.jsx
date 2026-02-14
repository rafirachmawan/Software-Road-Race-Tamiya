import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

/* ================= GENERATE COLUMN DINAMIS ================= */
const generateColumns = (endLetter = "I") => {
  const start = "A".charCodeAt(0);
  const end = endLetter.charCodeAt(0);

  const cols = [];
  for (let i = start; i <= end; i++) {
    cols.push(String.fromCharCode(i));
  }
  return cols;
};

/* ================= GENERATE A-Z FOR DROPDOWN ================= */
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
  const [inputNama, setInputNama] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const roundAktif = rounds.find((r) => r.id === selectedRound);

  /* ================= INPUT ================= */
  const handleInput = (e) => {
    if (e.key === "Enter" && inputNama.trim()) {
      isiSlot(inputNama.trim());
    }
  };

  const isiSlot = (nama) => {
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
    setCurrentIndex((prev) => prev + 1);
    setInputNama("");
  };

  const tambahRound = () => {
    const newRoundNumber = rounds.length + 2;
    setRounds([...rounds, createEmptyRound(newRoundNumber)]);
    setSelectedRound(newRoundNumber);
    setCurrentIndex(0);
  };

  /* ================= EXPORT EXCEL ================= */
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

  /* ================= EXPORT PDF ================= */
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
    });

    doc.save(`${roundAktif.nama}.pdf`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      {/* HEADER + EXPORT BUTTON */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1>🏁 ROUND MANAGEMENT</h1>
          <p>Input Nama untuk isi slot otomatis (Tekan Enter)</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button style={exportBlue} onClick={exportPDF}>
            Export PDF
          </button>
          <button style={exportGreen} onClick={exportExcel}>
            Export Excel
          </button>
        </div>
      </div>

      {/* ===== CUSTOM COLUMN ===== */}
      <div>
        <label>Max Kolom (A - Z)</label>
        <select
          value={maxColumn}
          onChange={(e) => setMaxColumn(e.target.value)}
          style={{ marginLeft: "10px", padding: "6px" }}
        >
          {alphabet.map((letter) => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>
      </div>

      {/* ROUND TAB */}
      <div style={{ display: "flex", gap: "10px" }}>
        {rounds.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              setSelectedRound(r.id);
              setCurrentIndex(0);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: selectedRound === r.id ? "#0f172a" : "#e5e7eb",
              color: selectedRound === r.id ? "white" : "black",
            }}
          >
            {r.nama}
          </button>
        ))}

        <button
          onClick={tambahRound}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px dashed #0f172a",
            cursor: "pointer",
            background: "white",
          }}
        >
          + Tambah Round
        </button>
      </div>

      {/* INPUT */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
        }}
      >
        <input
          autoFocus
          placeholder="Ketik nama lalu tekan Enter..."
          value={inputNama}
          onChange={(e) => setInputNama(e.target.value)}
          onKeyDown={handleInput}
          style={{
            padding: "14px",
            width: "100%",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>

      {/* GRID */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
    </div>
  );
}

/* STYLES */
const thStyle = {
  padding: "10px",
  background: "#e5e7eb",
  border: "1px solid #d1d5db",
};

const tdStyle = {
  padding: "8px",
  border: "1px solid #e5e7eb",
  textAlign: "center",
};

const exportBlue = {
  padding: "8px 16px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const exportGreen = {
  padding: "8px 16px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
