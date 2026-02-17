const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
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

  // 🔥 Update total track per round
  updateRoundTrack: (data) => ipcRenderer.invoke("update-round-track", data),

  // 🔥 DELETE ROUND (INI YANG TADI KURANG)
  deleteRound: (id) => ipcRenderer.invoke("delete-round", id),

  // Simpan slot
  saveSlot: (data) => ipcRenderer.invoke("save-slot", data),

  // Load slot per round
  getRoundData: (roundId) => ipcRenderer.invoke("get-round-data", roundId),

  /* ================= DISPLAY ================= */
  openDisplay: () => ipcRenderer.send("open-display"),
  closeDisplay: () => ipcRenderer.send("close-display"),
});
