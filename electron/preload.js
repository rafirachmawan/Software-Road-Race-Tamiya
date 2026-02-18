const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  /* ================= DATABASE ================= */

  getDatabases: () => ipcRenderer.invoke("get-databases"),
  createDatabase: (name) => ipcRenderer.invoke("create-database", name),
  switchDatabase: (dbName) => ipcRenderer.invoke("switch-database", dbName),
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

  getRounds: () => ipcRenderer.invoke("get-rounds"),
  addRound: (data) => ipcRenderer.invoke("add-round", data),
  updateRoundTrack: (data) => ipcRenderer.invoke("update-round-track", data),
  deleteRound: (id) => ipcRenderer.invoke("delete-round", id),

  saveSlot: (data) => ipcRenderer.invoke("save-slot", data),

  // ✅ TAMBAHAN BARU
  deleteSlot: (data) => ipcRenderer.invoke("delete-slot", data),

  getRoundData: (roundId) => ipcRenderer.invoke("get-round-data", roundId),

  /* ================= DISPLAY ================= */

  openDisplay: () => ipcRenderer.send("open-display"),
  closeDisplay: () => ipcRenderer.send("close-display"),
});
