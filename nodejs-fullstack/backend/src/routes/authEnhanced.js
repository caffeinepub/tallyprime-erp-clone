// Enhanced Auth Routes - OTP, Social Login, Forgot Password - HisabKitab Pro v4.0
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/db');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const SECRET = process.env.JWT_SECRET || 'hisabkitab_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Generate 6-digit OTP
function generateOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }

// Generate JWT
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '7d' });
}

// Setup Passport strategies
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth-enhanced/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      // Check existing social auth
      const [existing] = await db.query('SELECT u.* FROM social_auth sa JOIN users u ON u.id=sa.user_id WHERE sa.provider="google" AND sa.provider_id=?', [profile.id]);
      if (existing.length) return done(null, existing[0]);
      // Check by email
      const [byEmail] = await db.query('SELECT * FROM users WHERE email=?', [email]);
      let user;
      if (byEmail.length) {
        user = byEmail[0];
      } else {
        const username = `google_${profile.id}`;
        const [result] = await db.query(
          'INSERT INTO users(username,password_hash,role,full_name,email,is_active,approval_status) VALUES(?,?,"admin",?,?,1,"payment_pending")',
          [username, await bcrypt.hash(Math.random().toString(36), 10), profile.displayName, email]
        );
        const [newUser] = await db.query('SELECT * FROM users WHERE id=?', [result.insertId]);
        user = newUser[0];
      }
      await db.query('INSERT INTO social_auth(user_id,provider,provider_id,access_token) VALUES(?,"google",?,?) ON DUPLICATE KEY UPDATE access_token=VALUES(access_token)',
        [user.id, profile.id, accessToken]);
      return done(null, user);
    } catch (e) { return done(e); }
  }));
}

if (process.env.GITHUB_CLIENT_ID) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth-enhanced/github/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
      const [existing] = await db.query('SELECT u.* FROM social_auth sa JOIN users u ON u.id=sa.user_id WHERE sa.provider="github" AND sa.provider_id=?', [String(profile.id)]);
      if (existing.length) return done(null, existing[0]);
      const [byEmail] = await db.query('SELECT * FROM users WHERE email=?', [email]);
      let user;
      if (byEmail.length) {
        user = byEmail[0];
      } else {
        const username = `github_${profile.username}`;
        const [result] = await db.query(
          'INSERT INTO users(username,password_hash,role,full_name,email,is_active,approval_status) VALUES(?,?,"admin",?,?,1,"payment_pending")',
          [username, await bcrypt.hash(Math.random().toString(36), 10), profile.displayName || profile.username, email]
        );
        const [newUser] = await db.query('SELECT * FROM users WHERE id=?', [result.insertId]);
        user = newUser[0];
      }
      await db.query('INSERT INTO social_auth(user_id,provider,provider_id,access_token) VALUES(?,"github",?,?) ON DUPLICATE KEY UPDATE access_token=VALUES(access_token)',
        [user.id, String(profile.id), accessToken]);
      return done(null, user);
    } catch (e) { return done(e); }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id=?', [id]);
    done(null, rows[0]);
  } catch (e) { done(e); }
});

// POST /api/auth-enhanced/register - Full registration flow
router.post('/register', async (req, res) => {
  try {
    const { username, password, full_name, email, phone, company_name, company_gstin, company_address } = req.body;
    const [exists] = await db.query('SELECT id FROM users WHERE username=?', [username]);
    if (exists.length) return res.status(400).json({ error: 'Username already taken' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users(username,password_hash,role,full_name,email,phone,is_active,approval_status) VALUES(?,?,"admin",?,?,?,0,"payment_pending")',
      [username, hash, full_name, email, phone]
    );
    const userId = result.insertId;
    // Create company if provided
    if (company_name) {
      await db.query('INSERT INTO companies(name,gstin,address,owner,is_active) VALUES(?,?,?,?,1)', [company_name, company_gstin || null, company_address || null, username]);
    }
    const token = jwt.sign({ id: userId, username, role: 'admin' }, SECRET, { expiresIn: '7d' });
    res.json({ id: userId, token, message: 'Registration successful. Please complete payment to activate.', redirect: '/payment' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth-enhanced/send-email-otp
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body; // purpose: 'login' | 'forgot_password'
    const [users] = await db.query('SELECT id,username FROM users WHERE email=? AND is_active=1', [email]);
    if (!users.length) return res.status(404).json({ error: 'No active account found with this email' });
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await db.query('DELETE FROM otp_codes WHERE identifier=? AND purpose=?', [email, purpose || 'login']);
    await db.query('INSERT INTO otp_codes(identifier,otp,purpose,expires_at) VALUES(?,?,?,?)', [email, otp, purpose || 'login', expiry]);
    // Send email
    if (process.env.EMAIL_USER) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@hisabkitab.com',
        to: email,
        subject: 'HisabKitab Pro - Your OTP',
        html: `<h2>HisabKitab Pro</h2><p>Your OTP for ${purpose || 'login'}: <strong style="font-size:24px">${otp}</strong></p><p>Valid for 10 minutes.</p>`,
      });
    }
    res.json({ message: 'OTP sent to email', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth-enhanced/send-phone-otp
router.post('/send-phone-otp', async (req, res) => {
  try {
    const { phone, purpose } = req.body;
    const [users] = await db.query('SELECT id,username FROM users WHERE phone=? AND is_active=1', [phone]);
    if (!users.length) return res.status(404).json({ error: 'No active account found with this phone' });
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await db.query('DELETE FROM otp_codes WHERE identifier=? AND purpose=?', [phone, purpose || 'login']);
    await db.query('INSERT INTO otp_codes(identifier,otp,purpose,expires_at) VALUES(?,?,?,?)', [phone, otp, purpose || 'login', expiry]);
    // Send SMS via Twilio
    if (process.env.TWILIO_ACCOUNT_SID) {
      const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilio.messages.create({ body: `HisabKitab Pro OTP: ${otp}. Valid 10 mins.`, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
    }
    res.json({ message: 'OTP sent to phone', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth-enhanced/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp, purpose } = req.body; // identifier: email or phone
    const [otpRows] = await db.query('SELECT * FROM otp_codes WHERE identifier=? AND otp=? AND purpose=? AND expires_at > NOW() AND is_used=0',
      [identifier, otp, purpose || 'login']);
    if (!otpRows.length) return res.status(400).json({ error: 'Invalid or expired OTP' });
    await db.query('UPDATE otp_codes SET is_used=1 WHERE id=?', [otpRows[0].id]);
    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE (email=? OR phone=?) AND is_active=1', [identifier, identifier]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const user = users[0];
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name }, message: 'OTP verified successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth-enhanced/forgot-password - Send reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body; // email or phone
    const [users] = await db.query('SELECT id,email,phone FROM users WHERE (email=? OR phone=?) AND is_active=1', [identifier, identifier]);
    if (!users.length) return res.status(404).json({ error: 'No account found' });
    const user = users[0];
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await db.query('DELETE FROM otp_codes WHERE identifier=? AND purpose="forgot_password"', [identifier]);
    await db.query('INSERT INTO otp_codes(identifier,otp,purpose,expires_at) VALUES(?,?,"forgot_password",?)', [identifier, otp, expiry]);
    if (user.email && process.env.EMAIL_USER) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@hisabkitab.com',
        to: user.email,
        subject: 'HisabKitab Pro - Password Reset OTP',
        html: `<h2>Password Reset</h2><p>Your OTP: <strong>${otp}</strong></p><p>Valid 15 minutes.</p>`,
      });
    }
    res.json({ message: 'Reset OTP sent', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth-enhanced/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, otp, new_password } = req.body;
    const [otpRows] = await db.query('SELECT * FROM otp_codes WHERE identifier=? AND otp=? AND purpose="forgot_password" AND expires_at > NOW() AND is_used=0',
      [identifier, otp]);
    if (!otpRows.length) return res.status(400).json({ error: 'Invalid or expired OTP' });
    await db.query('UPDATE otp_codes SET is_used=1 WHERE id=?', [otpRows[0].id]);
    const hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password_hash=? WHERE email=? OR phone=?', [hash, identifier, identifier]);
    res.json({ message: 'Password reset successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/auth-enhanced/google - Initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth-enhanced/google/callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }), (req, res) => {
  const token = generateToken(req.user);
  const needsPayment = req.user.approval_status === 'payment_pending';
  res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}&redirect=${needsPayment ? 'payment' : 'dashboard'}`);
});

// GET /api/auth-enhanced/github - Initiate GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GET /api/auth-enhanced/github/callback
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=github_failed` }), (req, res) => {
  const token = generateToken(req.user);
  const needsPayment = req.user.approval_status === 'payment_pending';
  res.redirect(`${FRONTEND_URL}/oauth-callback?token=${token}&redirect=${needsPayment ? 'payment' : 'dashboard'}`);
});

module.exports = router;
module.exports.passport = passport;
