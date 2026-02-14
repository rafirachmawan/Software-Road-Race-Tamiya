const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  /* ================= LOGIN ================= */
  login: (data) => ipcRenderer.invoke("login", data),

  /* ================= REGISTRASI ================= */
  getTeams: () => ipcRenderer.invoke("get-teams"),

  addTeam: (namaTim) => ipcRenderer.invoke("add-team", namaTim),

  addPlayer: (data) => ipcRenderer.invoke("add-player", data),

  deletePlayer: (id) => ipcRenderer.invoke("delete-player", id),

  /* ================= DISPLAY CONTROL ================= */
  openDisplay: () => ipcRenderer.send("open-display"),
  closeDisplay: () => ipcRenderer.send("close-display"),
});
