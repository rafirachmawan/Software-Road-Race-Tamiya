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

  // TEAMS TABLE
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      namaTim TEXT UNIQUE
    )
  `,
  ).run();

  // PLAYERS TABLE
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teamId INTEGER,
      nama TEXT,
      FOREIGN KEY(teamId) REFERENCES teams(id) ON DELETE CASCADE
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
   GET TEAMS
========================= */
ipcMain.handle("get-teams", () => {
  const teams = db.prepare("SELECT * FROM teams").all();

  return teams.map((team) => {
    const pemain = db
      .prepare("SELECT * FROM players WHERE teamId = ?")
      .all(team.id);

    return {
      ...team,
      pemain,
    };
  });
});

/* =========================
   ADD TEAM
========================= */
ipcMain.handle("add-team", (event, namaTim) => {
  try {
    db.prepare("INSERT INTO teams (namaTim) VALUES (?)").run(namaTim);
    return { success: true };
  } catch (err) {
    return { success: false, message: "Nama tim sudah ada" };
  }
});

/* =========================
   ADD PLAYER
========================= */
ipcMain.handle("add-player", (event, { teamId, nama }) => {
  db.prepare("INSERT INTO players (teamId, nama) VALUES (?, ?)").run(
    teamId,
    nama,
  );

  return { success: true };
});

/* =========================
   DELETE PLAYER
========================= */
ipcMain.handle("delete-player", (event, pemainId) => {
  db.prepare("DELETE FROM players WHERE id = ?").run(pemainId);
  return { success: true };
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
