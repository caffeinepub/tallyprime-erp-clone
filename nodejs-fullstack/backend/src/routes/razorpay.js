// Razorpay Payment Gateway - HisabKitab Pro v4.0
const router = require('express').Router();
const { db } = require('../database/db');
const { authenticate: auth } = require('../middleware/auth');
const { superAdminAuth } = require('./superAdmin');
const { v4: uuidv4 } = require('uuid');

let Razorpay;
try { Razorpay = require('razorpay'); } catch(e) { console.warn('[Razorpay] Package not installed. Run: npm install razorpay'); }

const crypto = require('crypto');

function getRazorpayInstance() {
  if (!Razorpay) throw new Error('razorpay package not installed. Run: npm install razorpay');
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

// GET /api/razorpay/config - Get public key for frontend
router.get('/config', (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) return res.status(503).json({ error: 'Razorpay not configured. Add RAZORPAY_KEY_ID to .env' });
  res.json({ key_id: process.env.RAZORPAY_KEY_ID, currency: 'INR', company_name: 'HisabKitab Pro' });
});

// POST /api/razorpay/create-order - Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { plan_id, amount_inr } = req.body;
    if (!plan_id || !amount_inr) return res.status(400).json({ error: 'plan_id and amount_inr required' });

    // Validate plan
    const [plans] = await db.query('SELECT * FROM subscription_plans WHERE id=? AND is_active=1', [plan_id]);
    if (!plans.length) return res.status(404).json({ error: 'Plan not found' });
    const plan = plans[0];

    const rzp = getRazorpayInstance();
    const amountPaise = Math.round(parseFloat(amount_inr) * 100); // Convert to paise
    const receipt = `hkp_${req.user.id}_${Date.now()}`;

    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: { user_id: req.user.id.toString(), plan_id: plan_id.toString(), plan_name: plan.name }
    });

    // Save initiated payment record
    const txn_ref = receipt;
    await db.query(
      'INSERT INTO payment_history(user_id,plan_id,amount,payment_method,txn_ref,gateway_txn_id,status) VALUES(?,?,?,"razorpay",?,?,"initiated") ON DUPLICATE KEY UPDATE gateway_txn_id=VALUES(gateway_txn_id)',
      [req.user.id, plan_id, amount_inr, txn_ref, order.id]
    );

    res.json({
      razorpay_order_id: order.id,
      amount: amountPaise,
      currency: 'INR',
      receipt,
      plan: { id: plan.id, name: plan.name, duration_months: plan.duration_months },
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/razorpay/verify-payment - Verify signature and activate subscription
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'razorpay_order_id, razorpay_payment_id, razorpay_signature required' });
    }

    // Verify HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSig = crypto.createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed: signature mismatch' });
    }

    // Mark payment success
    await db.query(
      'UPDATE payment_history SET status="success", gateway_txn_id=?, paid_at=NOW() WHERE gateway_txn_id=? AND user_id=?',
      [razorpay_payment_id, razorpay_order_id, req.user.id]
    );

    // Activate subscription
    const [plans] = await db.query('SELECT * FROM subscription_plans WHERE id=?', [plan_id]);
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

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      payment_id: razorpay_payment_id,
      redirect: '/dashboard',
      welcome: true
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/razorpay/webhook - Razorpay server-to-server webhook
router.post('/webhook', express_raw_body, async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const sig = req.headers['x-razorpay-signature'];
      const body = req.rawBody || JSON.stringify(req.body);
      const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
      if (sig !== expected) return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      await db.query(
        'UPDATE payment_history SET status="success", paid_at=NOW() WHERE gateway_txn_id=?',
        [payment.order_id]
      );
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      await db.query(
        'UPDATE payment_history SET status="failed", failure_reason=? WHERE gateway_txn_id=?',
        [payment.error_description || 'Payment failed', payment.order_id]
      );
    } else if (event.event === 'refund.processed') {
      const refund = event.payload.refund.entity;
      await db.query(
        'UPDATE payment_history SET status="refunded" WHERE gateway_txn_id=?',
        [refund.payment_id]
      );
    }
    res.json({ status: 'ok' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Middleware to capture raw body for webhook signature verification
function express_raw_body(req, res, next) {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    try { req.body = JSON.parse(data); req.rawBody = data; } catch(e) { req.body = {}; }
    next();
  });
}

// POST /api/razorpay/refund - Initiate refund (Super Admin)
router.post('/refund', superAdminAuth, async (req, res) => {
  try {
    const { payment_id, amount_inr, reason } = req.body;
    if (!payment_id) return res.status(400).json({ error: 'payment_id required' });

    const rzp = getRazorpayInstance();
    const refundData = { speed: 'normal', notes: { reason: reason || 'Admin refund' } };
    if (amount_inr) refundData.amount = Math.round(parseFloat(amount_inr) * 100);

    const refund = await rzp.payments.refund(payment_id, refundData);
    await db.query('UPDATE payment_history SET status="refunded" WHERE gateway_txn_id=?', [payment_id]);

    res.json({ success: true, refund_id: refund.id, status: refund.status, message: 'Refund initiated successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/razorpay/payment/:payment_id - Fetch payment details
router.get('/payment/:payment_id', auth, async (req, res) => {
  try {
    const rzp = getRazorpayInstance();
    const payment = await rzp.payments.fetch(req.params.payment_id);
    res.json(payment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
