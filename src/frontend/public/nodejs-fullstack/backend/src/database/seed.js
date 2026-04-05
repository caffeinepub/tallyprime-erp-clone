require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'hisabkitab_pro'
  });

  // Seed admin user
  const hash = await bcrypt.hash('admin123', 10);
  await conn.query(
    `INSERT IGNORE INTO users (username, password_hash, role, display_name, is_active) VALUES (?, ?, 'admin', 'Administrator', 1)`,
    ['admin', hash]
  );

  // Seed default ledger groups
  const groups = [
    [1,'Capital Account',null,'Liability',1],
    [2,'Reserves & Surplus',1,'Liability',1],
    [3,'Loans (Liability)',null,'Liability',1],
    [4,'Current Liabilities',null,'Liability',1],
    [5,'Fixed Assets',null,'Asset',1],
    [6,'Current Assets',null,'Asset',1],
    [7,'Bank Accounts',6,'Asset',1],
    [8,'Cash-in-Hand',6,'Asset',1],
    [9,'Sundry Debtors',6,'Asset',1],
    [10,'Sundry Creditors',4,'Liability',1],
    [11,'Sales Accounts',null,'Income',1],
    [12,'Purchase Accounts',null,'Expense',1],
    [13,'Direct Expenses',null,'Expense',1],
    [14,'Indirect Expenses',null,'Expense',1],
    [15,'Direct Incomes',null,'Income',1],
    [16,'Indirect Incomes',null,'Income',1],
    [17,'Duties & Taxes',4,'Liability',1],
    [18,'Investments',null,'Asset',1]
  ];
  for (const [id, name, parent, nature, pre] of groups) {
    await conn.query(
      `INSERT IGNORE INTO ledger_groups (id, name, parent_group, nature, is_predefined) VALUES (?, ?, ?, ?, ?)`,
      [id, name, parent, nature, pre]
    );
  }

  // Seed default currencies
  await conn.query(`INSERT IGNORE INTO currencies (code, symbol, name, exchange_rate, is_base) VALUES ('INR', '₹', 'Indian Rupee', 1, 1)`);

  await conn.end();
  console.log('✅ Seed complete. Login: admin / admin123');
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
