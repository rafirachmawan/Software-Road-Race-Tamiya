const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  /* ================= DATABASE ================= */

  // Ambil semua file database (.db)
  getDatabases: () => ipcRenderer.invoke("get-databases"),

  // Buat database baru
  createDatabase: (name) => ipcRenderer.invoke("create-database", name),

  // Ganti database aktif
  switchDatabase: (dbName) => ipcRenderer.invoke("switch-database", dbName),

  // 🔥 Ambil database yang sedang aktif
  getCurrentDatabase: () => ipcRenderer.invoke("get-current-database"),

  /* ================= AUTH ================= */

  login: (data) => ipcRenderer.invoke("login", data),

  /* ================= TEAMS ================= */

  getTeams: () => ipcRenderer.invoke("get-teams"),

  addTeam: (namaTim) => ipcRenderer.invoke("add-team", namaTim),

  /* ================= PLAYERS ================= */

  addPlayer: (data) => ipcRenderer.invoke("add-player", data),

  deletePlayer: (id) => ipcRenderer.invoke("delete-player", id),

  /* ================= SCAN ================= */

  findPlayer: (barcode) => ipcRenderer.invoke("find-player", barcode),

  /* ================= ROUND MANAGEMENT ================= */

  // Ambil semua round
  getRounds: () => ipcRenderer.invoke("get-rounds"),

  // Tambah round
  addRound: (data) => ipcRenderer.invoke("add-round", data),

  // Update total track
  updateRoundTrack: (data) => ipcRenderer.invoke("update-round-track", data),

  // Hapus round
  deleteRound: (id) => ipcRenderer.invoke("delete-round", id),

  // Simpan slot
  saveSlot: (data) => ipcRenderer.invoke("save-slot", data),

  // Load slot per round
  getRoundData: (roundId) => ipcRenderer.invoke("get-round-data", roundId),

  /* ================= DISPLAY ================= */

  openDisplay: () => ipcRenderer.send("open-display"),

  closeDisplay: () => ipcRenderer.send("close-display"),
});
