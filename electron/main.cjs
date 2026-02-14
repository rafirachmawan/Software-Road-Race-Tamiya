const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

let mainWindow;
let displayWindow;
let db;

/* =========================
   INIT DATABASE
========================= */
function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "race.db");
  db = new Database(dbPath);

  db.pragma("foreign_keys = ON");

  /* ================= USERS ================= */
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

  /* ================= TEAMS ================= */
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      namaTim TEXT UNIQUE
    )
  `,
  ).run();

  /* ================= PLAYERS ================= */
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teamId INTEGER,
      nama TEXT,
      barcode TEXT UNIQUE,
      FOREIGN KEY(teamId) REFERENCES teams(id) ON DELETE CASCADE
    )
  `,
  ).run();

  /* ================= DEFAULT ADMIN ================= */
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
   LOGIN
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
   GET TEAMS + PLAYERS
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
   ADD PLAYER + GENERATE BARCODE
========================= */
ipcMain.handle("add-player", (event, { teamId, nama }) => {
  try {
    const result = db
      .prepare(
        `
        INSERT INTO players (teamId, nama)
        VALUES (?, ?)
    `,
      )
      .run(teamId, nama);

    const playerId = result.lastInsertRowid;

    // 🔥 barcode hanya sebagai ID unik
    const barcode = `RC-${String(playerId).padStart(5, "0")}`;

    db.prepare(
      `
        UPDATE players
        SET barcode = ?
        WHERE id = ?
    `,
    ).run(barcode, playerId);

    // Ambil data lengkap
    const player = db
      .prepare(
        `
        SELECT players.*, teams.namaTim
        FROM players
        JOIN teams ON players.teamId = teams.id
        WHERE players.id = ?
    `,
      )
      .get(playerId);

    return {
      success: true,
      player,
    };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
});

/* =========================
   UPDATE PLAYER NAME
========================= */
ipcMain.handle("update-player", (event, { id, nama }) => {
  try {
    db.prepare(
      `
        UPDATE players
        SET nama = ?
        WHERE id = ?
    `,
    ).run(nama, id);

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
});

/* =========================
   FIND PLAYER BY BARCODE (SCAN)
========================= */
ipcMain.handle("find-player", (event, barcode) => {
  try {
    const player = db
      .prepare(
        `
        SELECT players.*, teams.namaTim
        FROM players
        JOIN teams ON players.teamId = teams.id
        WHERE players.barcode = ?
    `,
      )
      .get(barcode.trim()); // 🔥 trim supaya aman dari spasi scanner

    return player || null;
  } catch (err) {
    console.error(err);
    return null;
  }
});

/* =========================
   DELETE PLAYER
========================= */
ipcMain.handle("delete-player", (event, pemainId) => {
  db.prepare("DELETE FROM players WHERE id = ?").run(pemainId);
  return { success: true };
});

/* =========================
   DISPLAY CONTROL
========================= */
ipcMain.on("open-display", () => {
  if (displayWindow) {
    displayWindow.focus();
    return;
  }
  createDisplayWindow();
});

ipcMain.on("close-display", () => {
  if (displayWindow) {
    displayWindow.close();
  }
});
