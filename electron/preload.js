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

  /* ================= DISPLAY ================= */
  openDisplay: () => ipcRenderer.send("open-display"),
  closeDisplay: () => ipcRenderer.send("close-display"),
});
