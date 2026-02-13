import { useState } from "react";

export default function Registrasi({ peserta, setPeserta }) {
  const [nama, setNama] = useState("");
  const [namaTim, setNamaTim] = useState("");
  const [search, setSearch] = useState("");

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const tambahPeserta = () => {
    if (!nama || !namaTim) return alert("Nama dan Tim wajib diisi");

    const newPeserta = {
      id: Date.now(),
      nama,
      tim: namaTim,
    };

    setPeserta([...peserta, newPeserta]);
    setNama("");
    setNamaTim("");
  };

  const hapusPeserta = (id) => {
    setPeserta(peserta.filter((p) => p.id !== id));
  };

  const filtered = peserta.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const displayed = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div style={pageStyle}>
      {/* ================= HEADER ================= */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>📝 Registrasi Peserta</h1>
          <p style={subText}>
            Total Peserta Terdaftar: <b>{peserta.length}</b>
          </p>
        </div>
      </div>

      {/* ================= FORM ================= */}
      <div style={panelStyle}>
        <h3>Tambah Peserta Baru</h3>

        <div style={formStyle}>
          <input
            placeholder="Nama Peserta"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Nama Tim"
            value={namaTim}
            onChange={(e) => setNamaTim(e.target.value)}
            style={inputStyle}
          />

          <button onClick={tambahPeserta} style={primaryButton}>
            + Tambah
          </button>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div>
        <input
          placeholder="🔍 Cari peserta..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{ ...inputStyle, width: "300px" }}
        />
      </div>

      {/* ================= TABLE ================= */}
      <div style={panelStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>No</th>
              <th style={thStyle}>Nama Peserta</th>
              <th style={thStyle}>Nama Tim</th>
              <th style={thStyle}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan="4" style={emptyState}>
                  Tidak ada data
                </td>
              </tr>
            ) : (
              displayed.map((p, index) => (
                <tr
                  key={p.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                  }}
                >
                  <td style={tdStyle}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td style={tdStyle}>{p.nama}</td>
                  <td style={tdStyle}>{p.tim}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => hapusPeserta(p.id)}
                      style={deleteButton}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ================= PAGINATION ================= */}
        <div style={paginationStyle}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            style={pageButton}
          >
            Prev
          </button>

          <span>
            Page {currentPage} / {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            style={pageButton}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "25px",
};

const headerStyle = {
  marginBottom: "10px",
};

const subText = {
  marginTop: "5px",
  color: "#64748b",
};

const panelStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "14px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const formStyle = {
  display: "flex",
  gap: "15px",
  marginTop: "15px",
  flexWrap: "wrap",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  outline: "none",
};

const primaryButton = {
  padding: "10px 18px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const deleteButton = {
  padding: "6px 12px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  marginTop: "15px",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  backgroundColor: "#f1f5f9",
  fontWeight: "600",
};

const tdStyle = {
  padding: "12px",
};

const emptyState = {
  textAlign: "center",
  padding: "20px",
  color: "#64748b",
};

const paginationStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "20px",
};

const pageButton = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
};
