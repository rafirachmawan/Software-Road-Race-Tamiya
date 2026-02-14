const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  /* ================= LOGIN ================= */
  login: (data) => ipcRenderer.invoke("login", data),

  /* ================= REGISTRASI ================= */

  // Ambil semua tim + pemain
  getTeams: () => ipcRenderer.invoke("get-teams"),

  // Tambah tim
  addTeam: (namaTim) => ipcRenderer.invoke("add-team", namaTim),

  // Tambah pemain
  addPlayer: (data) => ipcRenderer.invoke("add-player", data),

  // ✅ UPDATE PEMAIN (WAJIB ADA)
  updatePlayer: (data) => ipcRenderer.invoke("update-player", data),

  // Hapus pemain
  deletePlayer: (id) => ipcRenderer.invoke("delete-player", id),

  /* ================= DISPLAY CONTROL ================= */
  openDisplay: () => ipcRenderer.send("open-display"),
  closeDisplay: () => ipcRenderer.send("close-display"),
});
