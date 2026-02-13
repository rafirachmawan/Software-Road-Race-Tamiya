const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // LOGIN
  login: (data) => ipcRenderer.invoke("login", data),

  // DISPLAY CONTROL
  openDisplay: () => ipcRenderer.send("open-display"),
  closeDisplay: () => ipcRenderer.send("close-display"),
});
