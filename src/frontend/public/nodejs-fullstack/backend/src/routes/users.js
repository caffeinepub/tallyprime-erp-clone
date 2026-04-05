const express = require('express');
const router = express.Router();
const { query, invalidateCache } = require('../database/db');
const { auth, adminOnly } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/', auth, adminOnly, async (req, res) => {
  try { res.json(await query('SELECT id,username,role,company_id,display_name,email,is_active,created_at FROM users')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { username, password, role, company_id } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const r = await query('INSERT INTO users (username, password_hash, role, company_id) VALUES (?,?,?,?)', [username, hash, role || 'viewer', company_id || null]);
    res.status(201).json({ id: r.insertId, username, role });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { username, role, company_id, is_active } = req.body;
    await query('UPDATE users SET username=?,role=?,company_id=?,is_active=? WHERE id=?', [username, role, company_id || null, is_active ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/reset-password', auth, adminOnly, async (req, res) => {
  try {
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await query('UPDATE users SET password_hash=? WHERE id=?', [hash, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
