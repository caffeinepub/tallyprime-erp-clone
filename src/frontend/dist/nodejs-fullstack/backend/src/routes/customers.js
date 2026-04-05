const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/customers', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT * FROM customers WHERE company_id=? ORDER BY name', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/customers', auth, async (req, res) => {
  try {
    const { company_id, name, email, phone, address, gstin, credit_limit, ledger_id } = req.body;
    const r = await query('INSERT INTO customers (company_id,name,email,phone,address,gstin,credit_limit,ledger_id) VALUES (?,?,?,?,?,?,?,?)',
      [company_id, name, email, phone, address, gstin, credit_limit || 0, ledger_id || null]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/customers/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, address, gstin, credit_limit } = req.body;
    await query('UPDATE customers SET name=?,email=?,phone=?,address=?,gstin=?,credit_limit=? WHERE id=?', [name, email, phone, address, gstin, credit_limit, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/customers/:id', auth, async (req, res) => {
  try { await query('DELETE FROM customers WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/vendors', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT * FROM vendors WHERE company_id=? ORDER BY name', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/vendors', auth, async (req, res) => {
  try {
    const { company_id, name, email, phone, address, gstin, ledger_id } = req.body;
    const r = await query('INSERT INTO vendors (company_id,name,email,phone,address,gstin,ledger_id) VALUES (?,?,?,?,?,?,?)',
      [company_id, name, email, phone, address, gstin, ledger_id || null]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/vendors/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, address, gstin } = req.body;
    await query('UPDATE vendors SET name=?,email=?,phone=?,address=?,gstin=? WHERE id=?', [name, email, phone, address, gstin, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/vendors/:id', auth, async (req, res) => {
  try { await query('DELETE FROM vendors WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
