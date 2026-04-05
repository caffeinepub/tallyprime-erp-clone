require('dotenv').config();
const bcrypt=require('bcryptjs'),db=require('./db');
async function seed(){
  // Existing admin user
  const hash=await bcrypt.hash(process.env.ADMIN_PASSWORD||'admin123',10);
  await db.query("INSERT IGNORE INTO users(username,password_hash,role,full_name,is_active,approval_status)VALUES('admin',?,'admin','Administrator',1,'approved')",[hash]);
  
  // Ledger groups
  const groups=[['Assets','DR'],['Liabilities','CR'],['Income','CR'],['Expenses','DR'],['Capital','CR'],['Sales','CR'],['Purchase','DR'],['Bank','DR'],['Cash','DR'],['Debtors','DR'],['Creditors','CR'],['Tax','CR'],['Fixed Assets','DR']];
  for(const[n,nat]of groups) await db.query('INSERT IGNORE INTO ledger_groups(name,nature,is_predefined)VALUES(?,?,1)',[n,nat]);
  
  // Currencies
  await db.query("INSERT IGNORE INTO currencies(code,symbol,name,exchange_rate,is_base)VALUES('INR','\u20b9','Indian Rupee',1.0,1)");
  
  // Premium features
  const features=[['premium_dashboard','Premium Dashboard'],['advanced_analytics','Advanced Analytics'],['ai_tools','AI Tools'],['whatsapp_automation','WhatsApp Automation'],['event_ledger','Event Ledger'],['tally_import','Tally Import'],['ecommerce_integration','E-Commerce Integration'],['advanced_banking','Advanced Banking'],['multi_company','Multi-Company Reports'],['budgeting','Budgeting & Forecasting']];
  for(const[k,n]of features) await db.query('INSERT IGNORE INTO premium_features(feature_key,feature_name,is_enabled)VALUES(?,?,1)',[k,n]);

  // --- NEW v4.0 Seeds ---

  // Super Admin (login: superadmin / superadmin123)
  const saHash = await bcrypt.hash('superadmin123', 10);
  await db.query("INSERT IGNORE INTO super_admins(username,password_hash,full_name,email,is_active)VALUES('superadmin',?,'Super Administrator','superadmin@hisabkitab.com',1)",[saHash]);

  // Default Subscription Plans
  const plans = [
    ['Free Plan', 'free', 1, 0, '["Create Company","Edit Company","Delete Company","Profile","Billing"]', 3, 1],
    ['Premium 3 Months', 'premium', 3, 999, '["All Features","GST Reports","Inventory","Payroll","Banking","Analytics","AI Tools","WhatsApp","CRM","POS"]', 10, 5],
    ['Premium 6 Months', 'premium', 6, 1799, '["All Features","GST Reports","Inventory","Payroll","Banking","Analytics","AI Tools","WhatsApp","CRM","POS"]', 10, 5],
    ['Premium 12 Months', 'premium', 12, 2999, '["All Features","GST Reports","Inventory","Payroll","Banking","Analytics","AI Tools","WhatsApp","CRM","POS","Priority Support"]', 25, 10],
    ['Premium 3 Years', 'premium', 36, 7499, '["All Features","GST Reports","Inventory","Payroll","Banking","Analytics","AI Tools","WhatsApp","CRM","POS","Priority Support","Dedicated Manager"]', 50, 20],
  ];
  for(const [name,type,months,price,features_json,maxUsers,maxCompanies] of plans) {
    await db.query('INSERT IGNORE INTO subscription_plans(name,plan_type,duration_months,price,features_json,max_users,max_companies) VALUES(?,?,?,?,?,?,?)',
      [name, type, months, price, features_json, maxUsers, maxCompanies]);
  }

  // Assign free subscription to default admin
  const [planRows] = await db.query("SELECT id FROM subscription_plans WHERE plan_type='free' LIMIT 1");
  const [adminRows] = await db.query("SELECT id FROM users WHERE username='admin' LIMIT 1");
  if (planRows.length && adminRows.length) {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 100); // Free plan never expires for default admin
    await db.query(
      'INSERT IGNORE INTO admin_subscriptions(user_id,plan_id,plan_name,plan_type,start_date,expiry_date,status) VALUES(?,?,"Free Plan","free",NOW(),?,"active")',
      [adminRows[0].id, planRows[0].id, expiry]
    );
  }

  // Premium feature flags
  const flags = ['super_admin_panel','subscription_management','cloudinary_media','otp_login','social_login','dynamic_sidebar','shortcut_manager','dashboard_customization','guidance_system','messaging_system'];
  for (const flag of flags) {
    await db.query('INSERT IGNORE INTO premium_feature_flags(feature_key,is_enabled) VALUES(?,1)', [flag]);
  }

  // Sample guidance content
  await db.query("INSERT IGNORE INTO guidance_content(id,title,content_type,body,is_published,created_by) VALUES(1,'Getting Started with HisabKitab Pro','blog','<h2>Welcome to HisabKitab Pro!</h2><p>This guide will help you set up your first company, add ledgers, and record your first entry.</p>',1,'superadmin')");
  await db.query("INSERT IGNORE INTO guidance_content(id,title,content_type,video_url,thumbnail_url,is_published,created_by) VALUES(2,'How to Set Up GST','video','https://www.youtube.com/watch?v=example1',null,1,'superadmin')");

  console.log('[SEED] Done. Credentials:');
  console.log('  Admin Login:       admin / admin123');
  console.log('  Super Admin Login: superadmin / superadmin123');
  console.log('  API: POST /api/super-admin/login   { username, password }');
  process.exit(0);
}
seed().catch(e=>{console.error('[SEED] Failed:',e.message);process.exit(1);});
