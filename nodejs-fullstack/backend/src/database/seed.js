require('dotenv').config();
const bcrypt=require('bcryptjs'),db=require('./db');
async function seed(){
  const hash=await bcrypt.hash(process.env.ADMIN_PASSWORD||'admin123',10);
  await db.query("INSERT IGNORE INTO users(username,password_hash,role,full_name,is_active)VALUES('admin',?,'admin','Administrator',1)",[hash]);
  const groups=[['Assets','DR'],['Liabilities','CR'],['Income','CR'],['Expenses','DR'],['Capital','CR'],['Sales','CR'],['Purchase','DR'],['Bank','DR'],['Cash','DR'],['Debtors','DR'],['Creditors','CR'],['Tax','CR'],['Fixed Assets','DR']];
  for(const[n,nat]of groups)await db.query('INSERT IGNORE INTO ledger_groups(name,nature,is_predefined)VALUES(?,?,1)',[n,nat]);
  await db.query("INSERT IGNORE INTO currencies(code,symbol,name,exchange_rate,is_base)VALUES('INR','₹','Indian Rupee',1.0,1)");
  const features=[['premium_dashboard','Premium Dashboard'],['advanced_analytics','Advanced Analytics'],['ai_tools','AI Tools'],['whatsapp_automation','WhatsApp Automation'],['event_ledger','Event Ledger'],['tally_import','Tally Import'],['ecommerce_integration','E-Commerce Integration'],['advanced_banking','Advanced Banking'],['multi_company','Multi-Company Reports'],['budgeting','Budgeting & Forecasting']];
  for(const[k,n]of features)await db.query('INSERT IGNORE INTO premium_features(feature_key,feature_name,is_enabled)VALUES(?,?,1)',[k,n]);
  console.log('[SEED] Done. Login: admin / admin123');process.exit(0);
}
seed().catch(e=>{console.error('[SEED] Failed:',e.message);process.exit(1);});
