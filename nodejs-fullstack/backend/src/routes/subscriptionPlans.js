// Subscription Plans Routes - HisabKitab Pro v4.0
const router = require('express').Router();
const db = require('../database/db');
const { authenticate: auth } = require('../middleware/auth');
const { superAdminAuth } = require('./superAdmin');

router.get('/', async (req, res) => {
  try {
    const [plans] = await db.query('SELECT * FROM subscription_plans WHERE is_active=1 ORDER BY price ASC');
    res.json(plans);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', superAdminAuth, async (req, res) => {
  try {
    const { name, plan_type, duration_months, price, features_json, max_users, max_companies } = req.body;
    const [result] = await db.query(
      'INSERT INTO subscription_plans(name,plan_type,duration_months,price,features_json,max_users,max_companies) VALUES(?,?,?,?,?,?,?)',
      [name, plan_type || 'premium', duration_months, price, JSON.stringify(features_json || []), max_users || 10, max_companies || 5]
    );
    res.json({ id: result.insertId, message: 'Plan created' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const { name, plan_type, duration_months, price, features_json, max_users, max_companies, is_active } = req.body;
    await db.query(
      'UPDATE subscription_plans SET name=?,plan_type=?,duration_months=?,price=?,features_json=?,max_users=?,max_companies=?,is_active=? WHERE id=?',
      [name, plan_type, duration_months, price, JSON.stringify(features_json || []), max_users, max_companies, is_active ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Plan updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/my-subscription', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, p.name as plan_name, p.plan_type, p.features_json, p.max_users, p.max_companies FROM admin_subscriptions s LEFT JOIN subscription_plans p ON p.id=s.plan_id WHERE s.user_id=? ORDER BY s.created_at DESC LIMIT 1',
      [req.user.id]
    );
    if (!rows.length) return res.json({ status: 'none', plan_type: 'free' });
    const sub = rows[0];
    const now = new Date();
    const expiry = new Date(sub.expiry_date);
    sub.is_expired = expiry < now;
    sub.days_remaining = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
    res.json(sub);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/assign', superAdminAuth, async (req, res) => {
  try {
    const { user_id, plan_id, start_date } = req.body;
    const [plans] = await db.query('SELECT * FROM subscription_plans WHERE id=?', [plan_id]);
    if (!plans.length) return res.status(404).json({ error: 'Plan not found' });
    const plan = plans[0];
    const start = start_date ? new Date(start_date) : new Date();
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + plan.duration_months);
    await db.query(
      'INSERT INTO admin_subscriptions(user_id,plan_id,plan_name,plan_type,start_date,expiry_date,status) VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE plan_id=VALUES(plan_id),plan_name=VALUES(plan_name),plan_type=VALUES(plan_type),start_date=VALUES(start_date),expiry_date=VALUES(expiry_date),status="active"',
      [user_id, plan_id, plan.name, plan.plan_type, start, expiry, 'active']
    );
    await db.query('UPDATE users SET is_active=1, approval_status="approved" WHERE id=?', [user_id]);
    res.json({ message: 'Plan assigned and admin activated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/check-access/:feature', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, p.plan_type, p.features_json FROM admin_subscriptions s LEFT JOIN subscription_plans p ON p.id=s.plan_id WHERE s.user_id=? ORDER BY s.created_at DESC LIMIT 1',
      [req.user.id]
    );
    if (!rows.length) return res.json({ allowed: false, reason: 'no_subscription', plan_type: 'free' });
    const sub = rows[0];
    const isExpired = new Date(sub.expiry_date) < new Date();
    if (isExpired) return res.json({ allowed: false, reason: 'expired', plan_type: sub.plan_type });
    const freeAllowed = ['company_create', 'company_edit', 'company_delete', 'profile', 'billing'];
    if (sub.plan_type === 'free' && !freeAllowed.includes(req.params.feature)) {
      return res.json({ allowed: false, reason: 'upgrade_required', plan_type: 'free' });
    }
    res.json({ allowed: true, plan_type: sub.plan_type, expiry_date: sub.expiry_date });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
