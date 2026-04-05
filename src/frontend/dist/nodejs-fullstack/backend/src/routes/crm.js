const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/leads', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT * FROM crm_leads WHERE company_id=? ORDER BY created_at DESC', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/leads', auth, async (req, res) => {
  try {
    const { company_id, name, email, phone, source, status, follow_up_date, notes } = req.body;
    const r = await query('INSERT INTO crm_leads (company_id,name,email,phone,source,status,follow_up_date,notes) VALUES (?,?,?,?,?,?,?,?)',
      [company_id, name, email, phone, source || 'other', status || 'new', follow_up_date, notes]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/leads/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, source, status, follow_up_date, notes } = req.body;
    await query('UPDATE crm_leads SET name=?,email=?,phone=?,source=?,status=?,follow_up_date=?,notes=? WHERE id=?',
      [name, email, phone, source, status, follow_up_date, notes, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/leads/:id', auth, async (req, res) => {
  try { await query('DELETE FROM crm_leads WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/leads/:id/convert', auth, async (req, res) => {
  try {
    const lead = await query('SELECT * FROM crm_leads WHERE id=?', [req.params.id]);
    if (!lead[0]) return res.status(404).json({ error: 'Lead not found' });
    const l = lead[0];
    const r = await query('INSERT INTO customers (company_id,name,email,phone) VALUES (?,?,?,?)', [l.company_id, l.name, l.email, l.phone]);
    await query('UPDATE crm_leads SET status="won" WHERE id=?', [req.params.id]);
    res.json({ customer_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
