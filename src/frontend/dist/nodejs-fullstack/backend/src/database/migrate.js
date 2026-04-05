require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE || 'hisabkitab_pro'}\``);
  await conn.query(`USE \`${process.env.MYSQL_DATABASE || 'hisabkitab_pro'}\``);

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin','accountant','auditor','viewer') DEFAULT 'viewer',
      company_id INT DEFAULT NULL,
      display_name VARCHAR(200),
      email VARCHAR(200),
      phone VARCHAR(50),
      theme_preference VARCHAR(50) DEFAULT 'default',
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      owner VARCHAR(100) NOT NULL,
      financial_year_start VARCHAR(10),
      financial_year_end VARCHAR(10),
      currency VARCHAR(10) DEFAULT 'INR',
      gstin VARCHAR(20),
      address TEXT,
      logo_url VARCHAR(500),
      brand_color VARCHAR(20),
      tagline VARCHAR(500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ledger_groups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      parent_group INT DEFAULT NULL,
      nature VARCHAR(50),
      is_predefined TINYINT(1) DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS ledgers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      group_id INT,
      opening_balance DECIMAL(15,2) DEFAULT 0,
      balance_type ENUM('Dr','Cr') DEFAULT 'Dr',
      gstin VARCHAR(20),
      pan VARCHAR(20),
      bank_account VARCHAR(50),
      ifsc_code VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vouchers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      voucher_type VARCHAR(50) NOT NULL,
      voucher_number BIGINT,
      date DATE,
      narration TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS voucher_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      voucher_id INT NOT NULL,
      ledger_id INT NOT NULL,
      entry_type ENUM('Dr','Cr') NOT NULL,
      amount DECIMAL(15,2) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS gst_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT UNIQUE NOT NULL,
      registration_type VARCHAR(50),
      state_code VARCHAR(10),
      state_name VARCHAR(100)
    )`,
    `CREATE TABLE IF NOT EXISTS gst_vouchers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      voucher_type VARCHAR(50),
      voucher_number BIGINT,
      date DATE,
      narration TEXT,
      party_name VARCHAR(255),
      party_gstin VARCHAR(20),
      place_of_supply VARCHAR(100),
      is_inter_state TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS gst_voucher_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gst_voucher_id INT NOT NULL,
      ledger_id INT,
      entry_type VARCHAR(10),
      amount DECIMAL(15,2),
      hsn_code VARCHAR(20),
      taxable_amount DECIMAL(15,2),
      cgst_rate DECIMAL(5,2),cgst_amount DECIMAL(15,2),
      sgst_rate DECIMAL(5,2),sgst_amount DECIMAL(15,2),
      igst_rate DECIMAL(5,2),igst_amount DECIMAL(15,2),
      cess_amount DECIMAL(15,2)
    )`,
    `CREATE TABLE IF NOT EXISTS hsn_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL,
      description TEXT,
      gst_rate DECIMAL(5,2)
    )`,
    `CREATE TABLE IF NOT EXISTS stock_groups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      parent_group_id INT DEFAULT NULL,
      unit VARCHAR(20)
    )`,
    `CREATE TABLE IF NOT EXISTS stock_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      stock_group_id INT,
      unit VARCHAR(20),
      opening_qty DECIMAL(15,3) DEFAULT 0,
      opening_rate DECIMAL(15,2) DEFAULT 0,
      gst_rate DECIMAL(5,2) DEFAULT 0,
      hsn_code VARCHAR(20),
      reorder_level DECIMAL(15,3) DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS stock_vouchers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      voucher_type VARCHAR(50),
      voucher_number BIGINT,
      date DATE,
      narration TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS stock_voucher_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      stock_voucher_id INT NOT NULL,
      stock_item_id INT,
      qty DECIMAL(15,3),
      rate DECIMAL(15,2),
      amount DECIMAL(15,2),
      warehouse_from VARCHAR(100),
      warehouse_to VARCHAR(100)
    )`,
    `CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_code VARCHAR(50),
      name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      designation VARCHAR(100),
      date_of_joining DATE,
      pan VARCHAR(20),
      aadhaar VARCHAR(20),
      bank_account VARCHAR(50),
      bank_name VARCHAR(100),
      ifsc_code VARCHAR(20),
      pf_applicable TINYINT(1) DEFAULT 0,
      esi_applicable TINYINT(1) DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS salary_structures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      basic DECIMAL(15,2) DEFAULT 0,
      hra DECIMAL(15,2) DEFAULT 0,
      da DECIMAL(15,2) DEFAULT 0,
      conveyance DECIMAL(15,2) DEFAULT 0,
      special_allowance DECIMAL(15,2) DEFAULT 0,
      other_allowances DECIMAL(15,2) DEFAULT 0,
      pf DECIMAL(15,2) DEFAULT 0,
      esi DECIMAL(15,2) DEFAULT 0,
      tds DECIMAL(15,2) DEFAULT 0,
      professional_tax DECIMAL(15,2) DEFAULT 0,
      other_deductions DECIMAL(15,2) DEFAULT 0,
      UNIQUE KEY uniq_emp (company_id, employee_id)
    )`,
    `CREATE TABLE IF NOT EXISTS payroll_vouchers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      month INT NOT NULL,
      year INT NOT NULL,
      processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      entries JSON
    )`,
    `CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      att_date DATE NOT NULL,
      status ENUM('P','A','H','L') DEFAULT 'P',
      UNIQUE KEY uniq_att (company_id, employee_id, att_date)
    )`,
    `CREATE TABLE IF NOT EXISTS leave_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      days_allowed INT DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS leaves (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      leave_type_id INT,
      from_date DATE,
      to_date DATE,
      days INT,
      reason TEXT,
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS bank_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      account_name VARCHAR(255),
      account_number VARCHAR(50),
      ifsc_code VARCHAR(20),
      bank_name VARCHAR(100),
      branch_name VARCHAR(100),
      linked_ledger_id INT,
      opening_balance DECIMAL(15,2) DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS bank_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      bank_account_id INT NOT NULL,
      date DATE,
      description TEXT,
      amount DECIMAL(15,2),
      transaction_type ENUM('credit','debit') DEFAULT 'credit',
      voucher_id INT DEFAULT NULL,
      is_reconciled TINYINT(1) DEFAULT 0,
      reconciled_date DATE DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS cheques (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      bank_account_id INT,
      cheque_number VARCHAR(50),
      cheque_date DATE,
      amount DECIMAL(15,2),
      payee_name VARCHAR(255),
      cheque_type ENUM('issued','received') DEFAULT 'issued',
      status ENUM('pending','cleared','bounced','cancelled') DEFAULT 'pending',
      voucher_id INT DEFAULT NULL,
      remarks TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS fixed_assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      purchase_date DATE,
      cost DECIMAL(15,2),
      salvage_value DECIMAL(15,2) DEFAULT 0,
      useful_life_years INT,
      depreciation_method ENUM('SLM','WDV') DEFAULT 'SLM',
      accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
      is_disposed TINYINT(1) DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS depreciation_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_id INT NOT NULL,
      amount DECIMAL(15,2),
      date DATE,
      narration TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS maintenance_schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      asset_id INT,
      title VARCHAR(255),
      maintenance_type ENUM('preventive','corrective') DEFAULT 'preventive',
      scheduled_date DATE,
      status ENUM('pending','completed','overdue') DEFAULT 'pending',
      priority ENUM('low','medium','high') DEFAULT 'medium',
      assigned_to VARCHAR(100),
      notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS maintenance_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      asset_id INT,
      schedule_id INT DEFAULT NULL,
      performed_date DATE,
      performed_by VARCHAR(100),
      cost DECIMAL(15,2) DEFAULT 0,
      description TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS amc_tracker (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      asset_id INT,
      vendor_name VARCHAR(255),
      contract_number VARCHAR(100),
      start_date DATE,
      end_date DATE,
      annual_cost DECIMAL(15,2) DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS cost_centres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      parent_centre_id INT DEFAULT NULL,
      description TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS cost_allocations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      cost_centre_id INT,
      voucher_id INT,
      ledger_id INT,
      amount DECIMAL(15,2),
      date DATE,
      narration TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS currencies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(10) UNIQUE NOT NULL,
      symbol VARCHAR(10),
      name VARCHAR(100),
      exchange_rate DECIMAL(15,6) DEFAULT 1,
      is_base TINYINT(1) DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS exchange_rates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      currency_id INT NOT NULL,
      date DATE,
      rate DECIMAL(15,6),
      narration TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS budgets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255),
      ledger_id INT,
      period_from DATE,
      period_to DATE,
      budgeted_amount DECIMAL(15,2),
      actual_amount DECIMAL(15,2) DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(200),
      phone VARCHAR(50),
      address TEXT,
      gstin VARCHAR(20),
      credit_limit DECIMAL(15,2) DEFAULT 0,
      ledger_id INT DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS vendors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(200),
      phone VARCHAR(50),
      address TEXT,
      gstin VARCHAR(20),
      ledger_id INT DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      vendor_id INT,
      order_number VARCHAR(50),
      date DATE,
      total_amount DECIMAL(15,2),
      status ENUM('draft','confirmed','received','cancelled') DEFAULT 'draft',
      notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS sales_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      customer_id INT,
      order_number VARCHAR(50),
      date DATE,
      total_amount DECIMAL(15,2),
      status ENUM('draft','confirmed','dispatched','invoiced','cancelled') DEFAULT 'draft',
      notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS crm_leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(200),
      phone VARCHAR(50),
      source ENUM('website','referral','cold_call','social','other') DEFAULT 'other',
      status ENUM('new','contacted','qualified','proposal','won','lost') DEFAULT 'new',
      follow_up_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS pos_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      opened_by VARCHAR(100),
      opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME DEFAULT NULL,
      opening_cash DECIMAL(15,2) DEFAULT 0,
      closing_cash DECIMAL(15,2) DEFAULT 0,
      status ENUM('open','closed') DEFAULT 'open'
    )`,
    `CREATE TABLE IF NOT EXISTS pos_sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      session_id INT,
      bill_number VARCHAR(50),
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      items JSON,
      subtotal DECIMAL(15,2),
      discount DECIMAL(15,2) DEFAULT 0,
      tax DECIMAL(15,2) DEFAULT 0,
      total DECIMAL(15,2),
      payment_mode ENUM('cash','card','upi') DEFAULT 'cash',
      amount_tendered DECIMAL(15,2),
      change_amount DECIMAL(15,2) DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      address TEXT,
      gstin VARCHAR(20),
      manager VARCHAR(100),
      is_active TINYINT(1) DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS branch_transfers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      from_branch_id INT,
      to_branch_id INT,
      transfer_type ENUM('stock','funds') DEFAULT 'stock',
      date DATE,
      amount DECIMAL(15,2),
      description TEXT,
      status ENUM('pending','completed') DEFAULT 'pending'
    )`,
    `CREATE TABLE IF NOT EXISTS service_masters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      rate DECIMAL(15,2) DEFAULT 0,
      gst_rate DECIMAL(5,2) DEFAULT 0,
      hsn_code VARCHAR(20)
    )`,
    `CREATE TABLE IF NOT EXISTS service_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      service_id INT,
      customer_id INT,
      order_number VARCHAR(50),
      date DATE,
      priority ENUM('low','medium','high') DEFAULT 'medium',
      status ENUM('pending','in_progress','completed','cancelled') DEFAULT 'pending',
      estimated_amount DECIMAL(15,2),
      actual_amount DECIMAL(15,2),
      notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS service_tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      order_id INT,
      title VARCHAR(255),
      description TEXT,
      status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
      assigned_to VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS subscription_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      customer_id INT,
      amount DECIMAL(15,2),
      frequency ENUM('monthly','quarterly','half_yearly','annual') DEFAULT 'monthly',
      start_date DATE,
      next_due_date DATE,
      status ENUM('active','paused','cancelled') DEFAULT 'active'
    )`,
    `CREATE TABLE IF NOT EXISTS eway_bills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      voucher_id INT,
      bill_number VARCHAR(50),
      date DATE,
      vehicle_number VARCHAR(20),
      from_place VARCHAR(100),
      to_place VARCHAR(100),
      status ENUM('active','cancelled') DEFAULT 'active'
    )`,
    `CREATE TABLE IF NOT EXISTS einvoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      voucher_id INT,
      irn VARCHAR(100),
      qr_code TEXT,
      status ENUM('active','cancelled') DEFAULT 'active',
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS gst_filing_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      return_type VARCHAR(20),
      period VARCHAR(20),
      filing_date DATE,
      status ENUM('filed','pending','overdue') DEFAULT 'pending',
      arn VARCHAR(50)
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      customer_id INT,
      start_date DATE,
      end_date DATE,
      budgeted_cost DECIMAL(15,2) DEFAULT 0,
      status ENUM('active','completed','on_hold') DEFAULT 'active'
    )`,
    `CREATE TABLE IF NOT EXISTS project_costs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      company_id INT NOT NULL,
      ledger_id INT,
      amount DECIMAL(15,2),
      date DATE,
      narration TEXT,
      cost_type ENUM('revenue','expense') DEFAULT 'expense'
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      type ENUM('info','warning','error','success') DEFAULT 'info',
      is_read TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255),
      rule_type ENUM('gst','approval','recurring','alert') DEFAULT 'alert',
      conditions JSON,
      actions JSON,
      priority INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS rule_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rule_id INT,
      triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      result TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS event_ledger (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      event_type VARCHAR(50),
      entity_type VARCHAR(50),
      entity_id INT,
      payload JSON,
      previous_state JSON,
      user VARCHAR(100),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_undone TINYINT(1) DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS maker_checker (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      entity_type VARCHAR(50),
      entity_id INT,
      action_type VARCHAR(50),
      payload JSON,
      maker VARCHAR(100),
      checker VARCHAR(100) DEFAULT NULL,
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      remarks TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS voucher_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      voucher_id INT NOT NULL,
      username VARCHAR(100),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      voucher_id INT DEFAULT NULL,
      title VARCHAR(255),
      assigned_to VARCHAR(100),
      due_date DATE,
      status ENUM('pending','in_progress','done') DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ecommerce_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      platform VARCHAR(50),
      order_number VARCHAR(100),
      order_date DATE,
      customer_name VARCHAR(255),
      amount DECIMAL(15,2),
      status ENUM('imported','converted','cancelled') DEFAULT 'imported',
      items JSON,
      voucher_id INT DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS whatsapp_queue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      phone VARCHAR(20),
      message TEXT,
      message_type VARCHAR(50),
      status ENUM('queued','sent','failed') DEFAULT 'queued',
      scheduled_at DATETIME DEFAULT NULL,
      sent_at DATETIME DEFAULT NULL,
      error_message TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS custom_fields (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      entity_type VARCHAR(50),
      field_name VARCHAR(100),
      field_type ENUM('text','number','date','boolean','select') DEFAULT 'text',
      options JSON,
      is_required TINYINT(1) DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS workflows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255),
      trigger_event VARCHAR(100),
      steps JSON,
      is_active TINYINT(1) DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS tally_imports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      file_name VARCHAR(255),
      import_type ENUM('xml','csv') DEFAULT 'xml',
      status ENUM('pending','processing','completed','failed') DEFAULT 'pending',
      records_imported INT DEFAULT 0,
      errors TEXT,
      imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS audit_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT,
      username VARCHAR(100),
      action VARCHAR(100),
      entity_type VARCHAR(50),
      entity_id INT,
      old_value JSON,
      new_value JSON,
      ip_address VARCHAR(50),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS app_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      setting_key VARCHAR(100) NOT NULL,
      setting_value TEXT,
      UNIQUE KEY uniq_setting (company_id, setting_key)
    )`
  ];

  for (const sql of tables) {
    await conn.query(sql);
  }

  await conn.end();
  console.log('✅ MySQL migration complete — all tables created.');
}

migrate().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
