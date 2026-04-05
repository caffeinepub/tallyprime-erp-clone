const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../database/db');
const { cacheGet, cacheSet } = require('../database/redis');
const router = express.Router();
const { auth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const users = await query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
    const user = Array.isArray(users) ? users[0] : null;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'hisabkitab-secret',
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, display_name: user.display_name } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const cacheKey = `user:profile:${req.user.username}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);
    const users = await query('SELECT id, username, role, display_name, email, phone, theme_preference FROM users WHERE id = ?', [req.user.id]);
    const user = Array.isArray(users) ? users[0] : null;
    if (!user) return res.status(404).json({ error: 'User not found' });
    await cacheSet(cacheKey, user, 300);
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { display_name, email, phone, theme_preference } = req.body;
    await query('UPDATE users SET display_name=?, email=?, phone=?, theme_preference=? WHERE id=?',
      [display_name, email, phone, theme_preference, req.user.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/auth/change-password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const users = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = Array.isArray(users) ? users[0] : null;
    if (!user) return res.status(404).json({ error: 'User not found' });
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password incorrect' });
    const hash = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
