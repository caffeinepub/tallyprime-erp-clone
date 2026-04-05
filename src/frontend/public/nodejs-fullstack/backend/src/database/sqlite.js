const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

function initSQLite() {
  const dbPath = process.env.SQLITE_PATH || './data/hisabkitab_offline.db';
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  // Create offline sync queue table
  db.exec(`
    CREATE TABLE IF NOT EXISTS offline_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced INTEGER DEFAULT 0,
      synced_at DATETIME
    );
    CREATE TABLE IF NOT EXISTS offline_companies (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS offline_vouchers (
      id INTEGER PRIMARY KEY,
      company_id INTEGER,
      data TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS offline_ledgers (
      id INTEGER PRIMARY KEY,
      company_id INTEGER,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS offline_meta (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

function getSQLiteDB() {
  return db;
}

module.exports = { initSQLite, getSQLiteDB };
