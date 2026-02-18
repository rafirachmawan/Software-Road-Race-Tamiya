const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

let mainWindow;
let displayWindow;

let db = null; // 🔥 Event DB
let authDb = null; // 🔐 Master DB (Login)
let currentDbName = null;

/* =========================
   INIT MASTER DB (LOGIN)
========================= */
function initAuthDatabase() {
  const authPath = path.join(app.getPath("userData"), "master.db");
  authDb = new Database(authPath);

  authDb
    .prepare(
      `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `,
    )
    .run();

  const admin = authDb
    .prepare("SELECT * FROM users WHERE username = ?")
    .get("admin");

  if (!admin) {
    authDb
      .prepare(
        `
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `,
      )
      .run("admin", "123456", "admin");
  }
}

/* =========================
   INIT EVENT DATABASE
========================= */
function initDatabase(dbName) {
  currentDbName = dbName;

  const dbPath = path.join(app.getPath("userData"), dbName);
  db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  /* TEAMS */
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      namaTim TEXT UNIQUE
    )
  `,
  ).run();

  /* PLAYERS */
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

  /* ROUNDS */
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT UNIQUE,
      totalTrack INTEGER DEFAULT 2
    )
  `,
  ).run();

  /* ROUND SLOTS */
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS round_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roundId INTEGER,
      rowIndex INTEGER,
      columnKey TEXT,
      playerId INTEGER,
      UNIQUE(roundId, rowIndex, columnKey),
      FOREIGN KEY(roundId) REFERENCES rounds(id) ON DELETE CASCADE,
      FOREIGN KEY(playerId) REFERENCES players(id) ON DELETE CASCADE
    )
  `,
  ).run();
}

/* =========================
   DATABASE MANAGEMENT
========================= */

ipcMain.handle("get-databases", () => {
  const folder = app.getPath("userData");
  const files = fs.readdirSync(folder);
  return files.filter((file) => file.endsWith(".db") && file !== "master.db");
});

ipcMain.handle("create-database", (event, name) => {
  const cleanName = name.replace(/\s+/g, "_");
  const dbName = `${cleanName}.db`;

  if (db) db.close();

  initDatabase(dbName);
  return { success: true };
});

ipcMain.handle("switch-database", (event, dbName) => {
  if (db) db.close();

  initDatabase(dbName);
  return { success: true };
});

ipcMain.handle("get-current-database", () => {
  return currentDbName;
});

/* =========================
   WINDOW
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
}

/* =========================
   APP READY
========================= */

app.whenReady().then(() => {
  initAuthDatabase(); // 🔐 Login selalu siap

  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "media") callback(true);
      else callback(false);
    },
  );

  createMainWindow();
});

/* =========================
   LOGIN (PAKAI MASTER DB)
========================= */

ipcMain.handle("login", (event, { username, password }) => {
  return (
    authDb
      .prepare(
        `
        SELECT id, username, role
        FROM users
        WHERE username = ? AND password = ?
      `,
      )
      .get(username, password) || null
  );
});

/* =========================
   LOGIKA EVENT (AMAN)
========================= */

ipcMain.handle("get-teams", () => {
  if (!db) return [];

  const teams = db.prepare("SELECT * FROM teams").all();

  return teams.map((team) => {
    const pemain = db
      .prepare("SELECT * FROM players WHERE teamId = ?")
      .all(team.id);

    return { ...team, pemain };
  });
});

ipcMain.handle("add-team", (event, namaTim) => {
  if (!db) return { success: false };

  try {
    db.prepare("INSERT INTO teams (namaTim) VALUES (?)").run(namaTim);
    return { success: true };
  } catch {
    return { success: false, message: "Nama tim sudah ada" };
  }
});

ipcMain.handle("add-player", (event, { teamId, nama }) => {
  if (!db) return { success: false };

  try {
    const result = db
      .prepare("INSERT INTO players (teamId, nama) VALUES (?, ?)")
      .run(teamId, nama);

    const playerId = result.lastInsertRowid;
    const barcode = `RC-${String(playerId).padStart(5, "0")}`;

    db.prepare("UPDATE players SET barcode = ? WHERE id = ?").run(
      barcode,
      playerId,
    );

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

    return { success: true, player };
  } catch {
    return { success: false };
  }
});

ipcMain.handle("find-player", (event, barcode) => {
  if (!db) return null;

  return (
    db
      .prepare(
        `
        SELECT players.*, teams.namaTim
        FROM players
        JOIN teams ON players.teamId = teams.id
        WHERE players.barcode = ?
      `,
      )
      .get(barcode.trim()) || null
  );
});

ipcMain.handle("get-rounds", () => {
  if (!db) return [];
  return db.prepare("SELECT * FROM rounds ORDER BY id ASC").all();
});

ipcMain.handle("add-round", (event, { nama, totalTrack }) => {
  if (!db) return null;

  try {
    const result = db
      .prepare("INSERT INTO rounds (nama, totalTrack) VALUES (?, ?)")
      .run(nama, totalTrack);

    return {
      id: result.lastInsertRowid,
      nama,
      totalTrack,
    };
  } catch {
    return db.prepare("SELECT * FROM rounds WHERE nama = ?").get(nama);
  }
});

ipcMain.handle("update-round-track", (event, { id, totalTrack }) => {
  if (!db) return { success: false };

  db.prepare("UPDATE rounds SET totalTrack = ? WHERE id = ?").run(
    totalTrack,
    id,
  );

  return { success: true };
});

ipcMain.handle("delete-round", (event, id) => {
  if (!db) return { success: false };

  db.prepare("DELETE FROM rounds WHERE id = ?").run(id);
  return { success: true };
});

ipcMain.handle("save-slot", (event, data) => {
  if (!db) return { success: false };

  const { roundId, rowIndex, columnKey, playerId } = data;

  db.prepare(
    `
    INSERT OR REPLACE INTO round_slots
    (roundId, rowIndex, columnKey, playerId)
    VALUES (?, ?, ?, ?)
  `,
  ).run(roundId, rowIndex, columnKey, playerId);

  return { success: true };
});

ipcMain.handle("get-round-data", (event, roundId) => {
  if (!db) return [];

  return db
    .prepare(
      `
    SELECT 
      round_slots.rowIndex,
      round_slots.columnKey,
      players.id,
      players.nama,
      players.barcode,
      teams.namaTim
    FROM round_slots
    JOIN players ON round_slots.playerId = players.id
    JOIN teams ON players.teamId = teams.id
    WHERE round_slots.roundId = ?
    ORDER BY round_slots.rowIndex
  `,
    )
    .all(roundId);
});

ipcMain.handle("delete-player", (event, id) => {
  if (!db) return { success: false };

  db.prepare("DELETE FROM players WHERE id = ?").run(id);
  return { success: true };
});

/* =========================
   DISPLAY
========================= */

ipcMain.on("open-display", () => {
  if (displayWindow) return displayWindow.focus();
  createDisplayWindow();
});

ipcMain.on("close-display", () => {
  if (displayWindow) displayWindow.close();
});
