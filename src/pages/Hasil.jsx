import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

  return (
    <div style={pageWrapper}>
      {/* HEADER */}
      <div style={headerWrapper}>
        <div>
          <h1 style={{ margin: 0 }}>🏁 ROUND MANAGEMENT</h1>
          <p style={subText}>Input nama lalu tekan Enter untuk isi otomatis</p>
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

      {/* CONTROL BAR */}
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

      {/* INPUT */}
      <div style={inputCard}>
        <input
          autoFocus
          placeholder="Ketik nama peserta..."
          value={inputNama}
          onChange={(e) => setInputNama(e.target.value)}
          onKeyDown={handleInput}
          style={inputStyle}
        />
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
    </div>
  );
}

/* ================= STYLES ================= */

const pageWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "30px",
};

const headerWrapper = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px",
};

const subText = {
  color: "#64748b",
  marginTop: "5px",
};

const exportGroup = {
  display: "flex",
  gap: "10px",
};

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

const controlLeft = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const labelStyle = {
  fontWeight: "600",
};

const selectStyle = {
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
};

const roundTabWrapper = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

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
  border: "1px solid #d1d5db",
};

const tableCard = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

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
