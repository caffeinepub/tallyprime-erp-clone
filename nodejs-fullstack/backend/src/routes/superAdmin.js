// Super Admin Routes - HisabKitab Pro v4.0
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/db');

const SA_SECRET = process.env.SUPER_ADMIN_JWT_SECRET || 'sa_secret_change_me';

// Super Admin Auth Middleware
function superAdminAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Super Admin token required' });
  try {
    const decoded = jwt.verify(token, SA_SECRET);
    if (decoded.role !== 'super_admin') return res.status(403).json({ error: 'Super Admin access only' });
    req.superAdmin = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid super admin token' }); }
}

// POST /api/super-admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM super_admins WHERE username=? AND is_active=1', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const sa = rows[0];
    const valid = await bcrypt.compare(password, sa.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: sa.id, username: sa.username, role: 'super_admin' }, SA_SECRET, { expiresIn: '24h' });
    await db.query('UPDATE super_admins SET last_login=NOW() WHERE id=?', [sa.id]);
    res.json({ token, superAdmin: { id: sa.id, username: sa.username, email: sa.email, full_name: sa.full_name } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/super-admin/dashboard
router.get('/dashboard', superAdminAuth, async (req, res) => {
  try {
    const [[{ totalAdmins }]] = await db.query('SELECT COUNT(*) as totalAdmins FROM users WHERE role="admin"');
    const [[{ pendingAdmins }]] = await db.query('SELECT COUNT(*) as pendingAdmins FROM users WHERE role="admin" AND approval_status="pending"');
    const [[{ totalCompanies }]] = await db.query('SELECT COUNT(*) as totalCompanies FROM companies');
    const [[{ activeSubscriptions }]] = await db.query('SELECT COUNT(*) as activeSubscriptions FROM admin_subscriptions WHERE status="active" AND expiry_date > NOW()');
    const [[{ expiredSubscriptions }]] = await db.query('SELECT COUNT(*) as expiredSubscriptions FROM admin_subscriptions WHERE status="expired" OR expiry_date <= NOW()');
    res.json({ totalAdmins, pendingAdmins, totalCompanies, activeSubscriptions, expiredSubscriptions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/super-admin/admins - View all admins with status
router.get('/admins', superAdminAuth, async (req, res) => {
  try {
    const [admins] = await db.query(`
      SELECT u.id, u.username, u.full_name, u.email, u.phone, u.is_active, u.approval_status, u.created_at,
             s.plan_name, s.status as sub_status, s.expiry_date,
             (SELECT COUNT(*) FROM companies c WHERE c.owner=u.username) as company_count
      FROM users u
      LEFT JOIN admin_subscriptions s ON s.user_id = u.id
      WHERE u.role = 'admin'
      ORDER BY u.created_at DESC
    `);
    res.json(admins);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/super-admin/companies - View all companies globally
router.get('/companies', superAdminAuth, async (req, res) => {
  try {
    const [companies] = await db.query(`
      SELECT c.*, u.full_name as owner_name, u.email as owner_email,
             s.plan_name, s.status as sub_status, s.expiry_date
      FROM companies c
      LEFT JOIN users u ON u.username = c.owner
      LEFT JOIN admin_subscriptions s ON s.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.json(companies);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/super-admin/admins/:id/approve
router.post('/admins/:id/approve', superAdminAuth, async (req, res) => {
  try {
    await db.query('UPDATE users SET approval_status="approved", is_active=1 WHERE id=? AND role="admin"', [req.params.id]);
    await db.query('INSERT INTO audit_log(username,action,entity,entity_id,details) VALUES(?,?,?,?,?)',
      [req.superAdmin.username, 'APPROVE_ADMIN', 'users', req.params.id, 'Admin approved by Super Admin']);
    res.json({ message: 'Admin approved successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/super-admin/admins/:id/reject
router.post('/admins/:id/reject', superAdminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    await db.query('UPDATE users SET approval_status="rejected", is_active=0 WHERE id=? AND role="admin"', [req.params.id]);
    await db.query('INSERT INTO audit_log(username,action,entity,entity_id,details) VALUES(?,?,?,?,?)',
      [req.superAdmin.username, 'REJECT_ADMIN', 'users', req.params.id, `Rejected: ${reason || 'No reason given'}`]);
    res.json({ message: 'Admin rejected' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/super-admin/admins/:id/suspend
router.post('/admins/:id/suspend', superAdminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    await db.query('UPDATE users SET is_active=0, approval_status="suspended" WHERE id=? AND role="admin"', [req.params.id]);
    await db.query('INSERT INTO audit_log(username,action,entity,entity_id,details) VALUES(?,?,?,?,?)',
      [req.superAdmin.username, 'SUSPEND_ADMIN', 'users', req.params.id, `Suspended: ${reason || 'No reason given'}`]);
    res.json({ message: 'Admin suspended' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/super-admin/admins/:id/unsuspend
router.post('/admins/:id/unsuspend', superAdminAuth, async (req, res) => {
  try {
    await db.query('UPDATE users SET is_active=1, approval_status="approved" WHERE id=? AND role="admin"', [req.params.id]);
    await db.query('INSERT INTO audit_log(username,action,entity,entity_id,details) VALUES(?,?,?,?,?)',
      [req.superAdmin.username, 'UNSUSPEND_ADMIN', 'users', req.params.id, 'Admin unsuspended by Super Admin']);
    res.json({ message: 'Admin unsuspended' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/super-admin/activity - All admin activity
router.get('/activity', superAdminAuth, async (req, res) => {
  try {
    const [logs] = await db.query('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 500');
    res.json(logs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/super-admin/pending-payments - Admins who registered but not paid
router.get('/pending-payments', superAdminAuth, async (req, res) => {
  try {
    const [pending] = await db.query(`
      SELECT u.id, u.username, u.full_name, u.email, u.phone, u.created_at, u.approval_status
      FROM users u
      WHERE u.role='admin' AND (u.approval_status='pending' OR u.approval_status='payment_pending')
      ORDER BY u.created_at DESC
    `);
    res.json(pending);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/super-admin/feature-toggle - Enable/disable premium features globally
router.post('/feature-toggle', superAdminAuth, async (req, res) => {
  try {
    const { feature_key, is_enabled } = req.body;
    await db.query('INSERT INTO premium_feature_flags(feature_key, is_enabled, updated_by) VALUES(?,?,?) ON DUPLICATE KEY UPDATE is_enabled=?, updated_by=?, updated_at=NOW()',
      [feature_key, is_enabled ? 1 : 0, req.superAdmin.username, is_enabled ? 1 : 0, req.superAdmin.username]);
    res.json({ message: 'Feature flag updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/super-admin/feature-flags
router.get('/feature-flags', superAdminAuth, async (req, res) => {
  try {
    const [flags] = await db.query('SELECT * FROM premium_feature_flags');
    res.json(flags);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/super-admin/cloudinary-config - Set Cloudinary credentials
router.post('/cloudinary-config', superAdminAuth, async (req, res) => {
  try {
    const { cloud_name, api_key, api_secret } = req.body;
    await db.query('INSERT INTO system_settings(setting_key, setting_value) VALUES(?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',
      ['cloudinary_config', JSON.stringify({ cloud_name, api_key, api_secret })]);
    res.json({ message: 'Cloudinary config saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
module.exports.superAdminAuth = superAdminAuth;
