// Messaging System - Super Admin to Admins - HisabKitab Pro v4.0
const router = require('express').Router();
const { db } = require('../database/db');
const { auth } = require('../middleware/auth');
const { superAdminAuth } = require('./superAdmin');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendEmail(to, subject, html) {
  if (!process.env.EMAIL_USER) return;
  try { await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@hisabkitab.com', to, subject, html }); } catch (e) { console.error('Email error:', e.message); }
}

// POST /api/messaging/send - Super Admin sends message to individual or all
router.post('/send', superAdminAuth, async (req, res) => {
  try {
    const { recipient_id, message, subject, channels, send_to_all } = req.body;
    let recipients = [];
    if (send_to_all) {
      const [admins] = await db.query('SELECT id, email, phone, full_name FROM users WHERE role="admin" AND is_active=1');
      recipients = admins;
    } else if (recipient_id) {
      const [users] = await db.query('SELECT id, email, phone, full_name FROM users WHERE id=?', [recipient_id]);
      recipients = users;
    }
    if (!recipients.length) return res.status(400).json({ error: 'No recipients found' });
    let sent = 0;
    for (const recipient of recipients) {
      // Save message to DB
      const [msgResult] = await db.query(
        'INSERT INTO messages(sender_type,sender_id,recipient_id,subject,message,channels_json) VALUES("super_admin",?,?,?,?,?)',
        [req.superAdmin.id, recipient.id, subject || 'Message from Admin', message, JSON.stringify(channels || ['email'])]
      );
      // Send via channels
      if ((channels || ['email']).includes('email') && recipient.email) {
        await sendEmail(recipient.email, subject || 'Message from HisabKitab Pro Admin',
          `<p>Dear ${recipient.full_name},</p><p>${message}</p><hr/><p><small>HisabKitab Pro Admin</small></p>`);
      }
      // WhatsApp via configured API
      if ((channels || []).includes('whatsapp') && recipient.phone && process.env.WHATSAPP_API_KEY) {
        // WhatsApp Business API call (placeholder - same as whatsapp.js pattern)
      }
      // Log notification
      await db.query('INSERT INTO notification_logs(user_id,type,channel,message,sent_by,status) VALUES(?,"message",?,?,?,"sent")',
        [recipient.id, (channels || ['email']).join(','), message, req.superAdmin.username]);
      sent++;
    }
    res.json({ message: 'Messages sent', recipients_count: sent });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/messaging/inbox - User's received messages
router.get('/inbox', auth, async (req, res) => {
  try {
    const [messages] = await db.query('SELECT * FROM messages WHERE recipient_id=? ORDER BY created_at DESC', [req.user.id]);
    res.json(messages);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/messaging/sent - Super Admin sent messages
router.get('/sent', superAdminAuth, async (req, res) => {
  try {
    const [messages] = await db.query(`
      SELECT m.*, u.username as recipient_username, u.full_name as recipient_name
      FROM messages m LEFT JOIN users u ON u.id=m.recipient_id
      WHERE m.sender_type='super_admin'
      ORDER BY m.created_at DESC LIMIT 200
    `);
    res.json(messages);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/messaging/:id/read - Mark message as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await db.query('UPDATE messages SET is_read=1, read_at=NOW() WHERE id=? AND recipient_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
