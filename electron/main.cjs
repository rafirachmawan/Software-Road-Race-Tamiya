const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let displayWindow;

/* =========================
   CREATE MAIN WINDOW
========================= */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");
}

/* =========================
   CREATE DISPLAY WINDOW
========================= */
function createDisplayWindow() {
  displayWindow = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: "#0f172a",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 🔥 Penting: arahkan ke route TANPA Layout
  displayWindow.loadURL("http://localhost:5173/#/display-full");

  displayWindow.on("closed", () => {
    displayWindow = null;
  });
}

/* =========================
   APP READY
========================= */
app.whenReady().then(() => {
  createMainWindow();
});

/* =========================
   OPEN DISPLAY
========================= */
ipcMain.on("open-display", () => {
  if (displayWindow) {
    displayWindow.focus();
    return;
  }

  createDisplayWindow();
});

/* =========================
   CLOSE DISPLAY
========================= */
ipcMain.on("close-display", () => {
  if (displayWindow) {
    displayWindow.close();
  }
});
