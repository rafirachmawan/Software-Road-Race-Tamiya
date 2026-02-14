const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  /* ================= AUTH ================= */
  login: (data) => ipcRenderer.invoke("login", data),

  /* ================= TEAMS ================= */
  getTeams: () => ipcRenderer.invoke("get-teams"),
  addTeam: (namaTim) => ipcRenderer.invoke("add-team", namaTim),

  /* ================= PLAYERS ================= */
  addPlayer: (data) => ipcRenderer.invoke("add-player", data),
  updatePlayer: (data) => ipcRenderer.invoke("update-player", data),
  deletePlayer: (id) => ipcRenderer.invoke("delete-player", id),

  /* ================= SCAN ================= */
  findPlayer: (barcode) => ipcRenderer.invoke("find-player", barcode),

  /* ================= ROUND / SLOT ================= */

  // Simpan 1 slot hasil scan
  saveSlot: (data) => ipcRenderer.invoke("save-slot", data),

  // Ambil data per round (untuk load saat refresh)
  getRoundData: (roundId) => ipcRenderer.invoke("get-round-data", roundId),

  // Ambil semua round (opsional future ready)
  getAllRounds: () => ipcRenderer.invoke("get-all-rounds"),

  // Reset / hapus data round tertentu
  resetRound: (roundId) => ipcRenderer.invoke("reset-round", roundId),

  /* ================= DISPLAY ================= */
  openDisplay: () => ipcRenderer.send("open-display"),
  closeDisplay: () => ipcRenderer.send("close-display"),
});
