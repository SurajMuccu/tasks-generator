const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "specs.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS specs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal TEXT,
      users TEXT,
      constraints TEXT,
      template TEXT,
      output TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
