const mysql = require('mysql2/promise');

let pool = null;

async function initMySQL() {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'hisabkitab_pro',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
  await pool.query('SELECT 1');
  return pool;
}

function getMySQLPool() {
  return pool;
}

module.exports = { initMySQL, getMySQLPool };
