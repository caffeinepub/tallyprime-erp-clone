// Billing Routes - HisabKitab Pro v4.0
const router = require('express').Router();
const { db } = require('../database/db');
const { auth } = require('../middleware/auth');

// GET /api/billing/profile - Full billing profile (admin + company + subscription + payments)
router.get('/profile', auth, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id,username,full_name,email,phone,profile_image,created_at FROM users WHERE id=?', [req.user.id]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const user = users[0];
    // Subscription
    const [subs] = await db.query(
      'SELECT s.*, p.name as plan_name, p.plan_type, p.features_json, p.duration_months FROM admin_subscriptions s LEFT JOIN subscription_plans p ON p.id=s.plan_id WHERE s.user_id=? ORDER BY s.created_at DESC LIMIT 1',
      [req.user.id]
    );
    const subscription = subs[0] || null;
    if (subscription) {
      subscription.is_expired = new Date(subscription.expiry_date) < new Date();
      subscription.days_remaining = Math.max(0, Math.ceil((new Date(subscription.expiry_date) - new Date()) / 86400000));
    }
    // Payment history
    const [payments] = await db.query(
      'SELECT p.*, pl.name as plan_name FROM payment_history p LEFT JOIN subscription_plans pl ON pl.id=p.plan_id WHERE p.user_id=? ORDER BY p.created_at DESC LIMIT 20',
      [req.user.id]
    );
    // Companies
    const [companies] = await db.query('SELECT id,name,gstin,address FROM companies WHERE owner=? AND is_active=1', [user.username]);
    res.json({ user, subscription, payments, companies });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/billing/invoice/:payment_id - Generate invoice
router.get('/invoice/:payment_id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, pl.name as plan_name, pl.duration_months, pl.plan_type, u.full_name, u.email, u.phone FROM payment_history p LEFT JOIN subscription_plans pl ON pl.id=p.plan_id LEFT JOIN users u ON u.id=p.user_id WHERE p.id=? AND p.user_id=?',
      [req.params.payment_id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    const inv = rows[0];
    res.json({
      invoice_number: `INV-${String(inv.id).padStart(6, '0')}`,
      date: inv.paid_at || inv.created_at,
      due_date: inv.paid_at || inv.created_at,
      billed_to: { name: inv.full_name, email: inv.email, phone: inv.phone },
      items: [{ description: `${inv.plan_name} Subscription (${inv.duration_months} months)`, amount: inv.amount }],
      subtotal: inv.amount,
      gst: (inv.amount * 0.18).toFixed(2),
      total: (inv.amount * 1.18).toFixed(2),
      status: inv.status,
      txn_ref: inv.txn_ref,
      payment_method: inv.payment_method,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/billing/status - Check subscription status (for middleware use)
router.get('/status', auth, async (req, res) => {
  try {
    const [subs] = await db.query(
      'SELECT s.*, p.plan_type FROM admin_subscriptions s LEFT JOIN subscription_plans p ON p.id=s.plan_id WHERE s.user_id=? ORDER BY s.created_at DESC LIMIT 1',
      [req.user.id]
    );
    if (!subs.length) return res.json({ status: 'no_subscription', plan_type: 'free', paused: false });
    const sub = subs[0];
    const isExpired = new Date(sub.expiry_date) < new Date();
    if (isExpired && sub.status !== 'expired') {
      await db.query('UPDATE admin_subscriptions SET status="expired" WHERE id=?', [sub.id]);
      // Pause companies
      await db.query('UPDATE companies SET is_active=0 WHERE owner=(SELECT username FROM users WHERE id=?)', [req.user.id]);
    }
    res.json({
      status: isExpired ? 'expired' : sub.status,
      plan_type: sub.plan_type,
      expiry_date: sub.expiry_date,
      is_expired: isExpired,
      days_remaining: Math.max(0, Math.ceil((new Date(sub.expiry_date) - new Date()) / 86400000)),
      paused: isExpired,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
