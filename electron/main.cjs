const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

let mainWindow;
let displayWindow;
let db;

/* =========================
   CREATE DATABASE
========================= */
function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "race.db");
  db = new Database(dbPath);

  // USERS TABLE
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `,
  ).run();

  // DEFAULT ADMIN
  const admin = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get("admin");

  if (!admin) {
    db.prepare(
      `
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `,
    ).run("admin", "123456", "admin");
  }
}

/* =========================
   CREATE MAIN WINDOW
========================= */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
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
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  displayWindow.loadURL("http://localhost:5173/#/display-full");

  displayWindow.on("closed", () => {
    displayWindow = null;
  });
}

/* =========================
   APP READY
========================= */
app.whenReady().then(() => {
  initDatabase();
  createMainWindow();
});

/* =========================
   LOGIN IPC
========================= */
ipcMain.handle("login", (event, { username, password }) => {
  const user = db
    .prepare(
      `
    SELECT id, username, role
    FROM users
    WHERE username = ? AND password = ?
  `,
    )
    .get(username, password);

  return user || null;
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
