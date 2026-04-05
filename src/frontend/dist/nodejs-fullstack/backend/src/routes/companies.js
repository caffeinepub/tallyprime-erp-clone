const express = require('express');
const router = express.Router();
const { query, invalidateCache } = require('../database/db');
const { auth, adminOnly } = require('../middleware/auth');
const { cacheGet, cacheSet } = require('../database/redis');

// GET /api/companies
router.get('/', auth, async (req, res) => {
  try {
    const cacheKey = `companies:${req.user.username}:${req.user.role}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);
    let rows;
    if (req.user.role === 'admin') {
      rows = await query('SELECT * FROM companies ORDER BY created_at DESC');
    } else {
      rows = await query('SELECT * FROM companies WHERE owner = ? ORDER BY created_at DESC', [req.user.username]);
    }
    await cacheSet(cacheKey, rows, 300);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/companies
router.post('/', auth, async (req, res) => {
  try {
    const { name, financial_year_start, financial_year_end, currency, gstin, address } = req.body;
    const result = await query(
      'INSERT INTO companies (name, owner, financial_year_start, financial_year_end, currency, gstin, address) VALUES (?,?,?,?,?,?,?)',
      [name, req.user.username, financial_year_start, financial_year_end, currency || 'INR', gstin, address]
    );
    await invalidateCache(`companies:*`);
    const rows = await query('SELECT * FROM companies WHERE id = ?', [result.insertId]);
    res.status(201).json(Array.isArray(rows) ? rows[0] : rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/companies/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, financial_year_start, financial_year_end, currency, gstin, address, logo_url, brand_color, tagline } = req.body;
    await query(
      'UPDATE companies SET name=?,financial_year_start=?,financial_year_end=?,currency=?,gstin=?,address=?,logo_url=?,brand_color=?,tagline=? WHERE id=?',
      [name, financial_year_start, financial_year_end, currency, gstin, address, logo_url, brand_color, tagline, req.params.id]
    );
    await invalidateCache(`companies:*`);
    const rows = await query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    res.json(Array.isArray(rows) ? rows[0] : rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/companies/:id (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await query('DELETE FROM companies WHERE id = ?', [req.params.id]);
    await invalidateCache(`companies:*`);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
