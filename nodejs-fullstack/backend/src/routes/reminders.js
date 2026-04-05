// Reminders & Notification System - HisabKitab Pro v4.0
const router = require('express').Router();
const db = require('../database/db');
const { authenticate: auth } = require('../middleware/auth');
const { superAdminAuth } = require('./superAdmin');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendEmail(to, subject, html) {
  if (!process.env.EMAIL_USER) return;
  try { await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@hisabkitab.com', to, subject, html }); } catch {}
}

async function sendSMS(phone, message) {
  if (!process.env.TWILIO_ACCOUNT_SID) return;
  try {
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await twilio.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
  } catch {}
}

cron.schedule('0 9 * * *', async () => {
  try {
    const [expiring] = await db.query(`SELECT s.*, u.email, u.phone, u.full_name, u.username FROM admin_subscriptions s JOIN users u ON u.id=s.user_id WHERE s.status='active' AND DATEDIFF(s.expiry_date, NOW()) BETWEEN 1 AND 3`);
    for (const sub of expiring) {
      const days = Math.ceil((new Date(sub.expiry_date) - new Date()) / 86400000);
      const msg = `HisabKitab Pro: Your ${sub.plan_name} subscription expires in ${days} day(s). Renew now to avoid interruption.`;
      if (sub.email) await sendEmail(sub.email, 'Subscription Expiring Soon - HisabKitab Pro', `<p>Dear ${sub.full_name},</p><p>${msg}</p>`);
      if (sub.phone) await sendSMS(sub.phone, msg);
      await db.query('INSERT INTO notification_logs(user_id,type,channel,message,status) VALUES(?,"expiry_reminder","email",?,"sent")', [sub.user_id, msg]);
    }
    await db.query('UPDATE admin_subscriptions SET status="expired" WHERE status="active" AND expiry_date < NOW()');
  } catch (e) { console.error('Cron expiry check error:', e.message); }
});

router.post('/send-manual', superAdminAuth, async (req, res) => {
  try {
    const { user_id, message, channels } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE id=?', [user_id]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const user = users[0];
    const sent = [];
    if (channels.includes('email') && user.email) { await sendEmail(user.email, 'Message from HisabKitab Pro Admin', `<p>${message}</p>`); sent.push('email'); }
    if (channels.includes('sms') && user.phone) { await sendSMS(user.phone, message); sent.push('sms'); }
    await db.query('INSERT INTO notification_logs(user_id,type,channel,message,sent_by,status) VALUES(?,"manual",?,?,?,"sent")', [user_id, sent.join(','), message, req.superAdmin.username]);
    res.json({ message: 'Reminder sent', channels_used: sent });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/broadcast', superAdminAuth, async (req, res) => {
  try {
    const { message, channels, subject } = req.body;
    const [admins] = await db.query('SELECT id, email, phone, full_name FROM users WHERE role="admin" AND is_active=1');
    let emailCount = 0, smsCount = 0;
    for (const admin of admins) {
      if (channels.includes('email') && admin.email) { await sendEmail(admin.email, subject || 'HisabKitab Pro Announcement', `<p>Dear ${admin.full_name},</p><p>${message}</p>`); emailCount++; }
      if (channels.includes('sms') && admin.phone) { await sendSMS(admin.phone, message); smsCount++; }
      await db.query('INSERT INTO notification_logs(user_id,type,channel,message,sent_by,status) VALUES(?,"broadcast",?,?,?,"sent")', [admin.id, channels.join(','), message, req.superAdmin.username]);
    }
    res.json({ message: 'Broadcast sent', emails_sent: emailCount, sms_sent: smsCount, total_admins: admins.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/logs', superAdminAuth, async (req, res) => {
  try {
    const [logs] = await db.query('SELECT n.*, u.username, u.full_name FROM notification_logs n LEFT JOIN users u ON u.id=n.user_id ORDER BY n.created_at DESC LIMIT 500');
    res.json(logs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/my-notifications', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM notification_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
