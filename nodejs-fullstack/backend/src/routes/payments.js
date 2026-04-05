// Payment Routes - HisabKitab Pro v4.0
const router = require('express').Router();
const { db } = require('../database/db');
const { auth } = require('../middleware/auth');
const { superAdminAuth } = require('./superAdmin');
const { v4: uuidv4 } = require('uuid');

// POST /api/payments/initiate - Admin initiates payment
router.post('/initiate', auth, async (req, res) => {
  try {
    const { plan_id, amount, payment_method } = req.body;
    const txn_ref = uuidv4();
    const [result] = await db.query(
      'INSERT INTO payment_history(user_id,plan_id,amount,payment_method,txn_ref,status) VALUES(?,?,?,?,?,"initiated")',
      [req.user.id, plan_id, amount, payment_method || 'online', txn_ref]
    );
    res.json({ payment_id: result.insertId, txn_ref, message: 'Payment initiated', redirect_url: `/payment/confirm?ref=${txn_ref}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/payments/confirm - Confirm payment success
router.post('/confirm', auth, async (req, res) => {
  try {
    const { txn_ref, gateway_txn_id, plan_id } = req.body;
    const [payments] = await db.query('SELECT * FROM payment_history WHERE txn_ref=? AND user_id=?', [txn_ref, req.user.id]);
    if (!payments.length) return res.status(404).json({ error: 'Payment not found' });
    // Mark payment success
    await db.query('UPDATE payment_history SET status="success", gateway_txn_id=?, paid_at=NOW() WHERE txn_ref=?', [gateway_txn_id || 'MANUAL', txn_ref]);
    // Activate subscription
    const [plans] = await db.query('SELECT * FROM subscription_plans WHERE id=?', [plan_id || payments[0].plan_id]);
    if (plans.length) {
      const plan = plans[0];
      const start = new Date();
      const expiry = new Date(start);
      expiry.setMonth(expiry.getMonth() + plan.duration_months);
      await db.query(
        'INSERT INTO admin_subscriptions(user_id,plan_id,plan_name,plan_type,start_date,expiry_date,status) VALUES(?,?,?,?,?,?,"active") ON DUPLICATE KEY UPDATE plan_id=VALUES(plan_id),plan_name=VALUES(plan_name),plan_type=VALUES(plan_type),start_date=VALUES(start_date),expiry_date=VALUES(expiry_date),status="active"',
        [req.user.id, plan.id, plan.name, plan.plan_type, start, expiry]
      );
      await db.query('UPDATE users SET is_active=1, approval_status="approved" WHERE id=?', [req.user.id]);
    }
    res.json({ message: 'Payment confirmed, account activated', redirect: '/dashboard', welcome: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/payments/fail - Handle payment failure
router.post('/fail', auth, async (req, res) => {
  try {
    const { txn_ref, reason } = req.body;
    await db.query('UPDATE payment_history SET status="failed", failure_reason=? WHERE txn_ref=? AND user_id=?', [reason || 'Unknown', txn_ref, req.user.id]);
    res.json({ message: 'Payment failure recorded', retry_url: '/payment' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/payments/history - My payment history
router.get('/history', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, pl.name as plan_name, pl.duration_months FROM payment_history p LEFT JOIN subscription_plans pl ON pl.id=p.plan_id WHERE p.user_id=? ORDER BY p.created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/payments/receipt/:id - Download receipt data
router.get('/receipt/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, pl.name as plan_name, pl.duration_months, u.full_name, u.email FROM payment_history p LEFT JOIN subscription_plans pl ON pl.id=p.plan_id LEFT JOIN users u ON u.id=p.user_id WHERE p.id=? AND p.user_id=?',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Receipt not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/payments/all - All payments (Super Admin)
router.get('/all', superAdminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, pl.name as plan_name, u.username, u.full_name, u.email FROM payment_history p LEFT JOIN subscription_plans pl ON pl.id=p.plan_id LEFT JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/payments/renew - Renew subscription
router.post('/renew', auth, async (req, res) => {
  try {
    const { plan_id, amount, txn_ref } = req.body;
    // Record renewal payment
    const ref = txn_ref || uuidv4();
    await db.query(
      'INSERT INTO payment_history(user_id,plan_id,amount,payment_method,txn_ref,status,paid_at) VALUES(?,?,?,"renewal",?,"success",NOW())',
      [req.user.id, plan_id, amount, ref]
    );
    // Extend subscription
    const [plans] = await db.query('SELECT * FROM subscription_plans WHERE id=?', [plan_id]);
    if (plans.length) {
      const plan = plans[0];
      const [subs] = await db.query('SELECT * FROM admin_subscriptions WHERE user_id=? ORDER BY created_at DESC LIMIT 1', [req.user.id]);
      const base = subs.length && new Date(subs[0].expiry_date) > new Date() ? new Date(subs[0].expiry_date) : new Date();
      const expiry = new Date(base);
      expiry.setMonth(expiry.getMonth() + plan.duration_months);
      await db.query(
        'INSERT INTO admin_subscriptions(user_id,plan_id,plan_name,plan_type,start_date,expiry_date,status) VALUES(?,?,?,?,NOW(),?,"active") ON DUPLICATE KEY UPDATE plan_id=VALUES(plan_id),plan_name=VALUES(plan_name),plan_type=VALUES(plan_type),expiry_date=VALUES(expiry_date),status="active"',
        [req.user.id, plan.id, plan.name, plan.plan_type, expiry]
      );
    }
    await db.query('UPDATE users SET is_active=1 WHERE id=?', [req.user.id]);
    res.json({ message: 'Subscription renewed successfully', access_restored: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
