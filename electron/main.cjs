const { app, BrowserWindow, ipcMain, session } = require("electron");
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

  /* USERS */
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
      id INTEGER PRIMARY KEY,
      nama TEXT
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

  /* DEFAULT ADMIN */
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

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
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

  displayWindow.on("closed", () => {
    displayWindow = null;
  });
}

/* =========================
   APP READY
========================= */
app.whenReady().then(() => {
  initDatabase();

  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "media") callback(true);
      else callback(false);
    },
  );

  createMainWindow();
});

/* =========================
   LOGIN
========================= */
ipcMain.handle("login", (event, { username, password }) => {
  return (
    db
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
   TEAMS + PLAYERS
========================= */
ipcMain.handle("get-teams", () => {
  const teams = db.prepare("SELECT * FROM teams").all();

  return teams.map((team) => {
    const pemain = db
      .prepare("SELECT * FROM players WHERE teamId = ?")
      .all(team.id);

    return { ...team, pemain };
  });
});

ipcMain.handle("add-team", (event, namaTim) => {
  try {
    db.prepare("INSERT INTO teams (namaTim) VALUES (?)").run(namaTim);
    return { success: true };
  } catch {
    return { success: false, message: "Nama tim sudah ada" };
  }
});

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
    const barcode = `RC-${String(playerId).padStart(5, "0")}`;

    db.prepare(
      `
      UPDATE players SET barcode = ? WHERE id = ?
    `,
    ).run(barcode, playerId);

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

/* =========================
   FIND PLAYER
========================= */
ipcMain.handle("find-player", (event, barcode) => {
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

/* =========================
   SAVE SLOT (PERSIST)
========================= */
ipcMain.handle("save-slot", (event, data) => {
  const { roundId, rowIndex, columnKey, playerId } = data;

  try {
    // pastikan round ada
    const existingRound = db
      .prepare("SELECT * FROM rounds WHERE id = ?")
      .get(roundId);

    if (!existingRound) {
      db.prepare("INSERT INTO rounds (id, nama) VALUES (?, ?)").run(
        roundId,
        `Round ${roundId}`,
      );
    }

    // insert / replace supaya tidak duplicate
    db.prepare(
      `
    INSERT OR REPLACE INTO round_slots
(roundId, rowIndex, columnKey, playerId)
VALUES (?, ?, ?, ?)

    `,
    ).run(roundId, rowIndex, columnKey, playerId);

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
});

/* =========================
   LOAD ROUND DATA
========================= */
ipcMain.handle("get-round-data", (event, roundId) => {
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

/* =========================
   DELETE PLAYER
========================= */
ipcMain.handle("delete-player", (event, id) => {
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
