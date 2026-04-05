/**
 * Smart DB Accessor — uses MySQL when online, falls back to SQLite offline
 * Includes Redis caching layer for read-heavy queries
 */
const { getMySQLPool } = require('./mysql');
const { getSQLiteDB } = require('./sqlite');
const { cacheGet, cacheSet, cacheDel } = require('./redis');

function isMySQL() {
  return !!getMySQLPool();
}

async function query(sql, params = [], cacheKey = null, cacheTTL = 3600) {
  // Try Redis cache first for reads
  if (cacheKey && sql.trim().toUpperCase().startsWith('SELECT')) {
    const cached = await cacheGet(cacheKey);
    if (cached !== null) return cached;
  }

  let result;
  if (isMySQL()) {
    const pool = getMySQLPool();
    const [rows] = await pool.execute(sql, params);
    result = rows;
  } else {
    // Fallback to SQLite
    const db = getSQLiteDB();
    if (!db) throw new Error('No database available');
    const isWrite = /^(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(sql.trim());
    if (isWrite) {
      const stmt = db.prepare(sql);
      const res = stmt.run(...params);
      result = { insertId: res.lastInsertRowid, affectedRows: res.changes };
    } else {
      const stmt = db.prepare(sql);
      result = stmt.all(...params);
    }
  }

  // Store in Redis cache for reads
  if (cacheKey && sql.trim().toUpperCase().startsWith('SELECT')) {
    await cacheSet(cacheKey, result, cacheTTL);
  }

  return result;
}

async function invalidateCache(pattern) {
  await cacheDel(pattern);
}

module.exports = { query, invalidateCache, isMySQL };
