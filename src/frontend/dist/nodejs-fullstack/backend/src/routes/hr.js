const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/attendance', auth, async (req, res) => {
  try {
    const { company_id, year, month } = req.query;
    const rows = await query('SELECT * FROM attendance WHERE company_id=? AND YEAR(att_date)=? AND MONTH(att_date)=?', [company_id, year, month]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/attendance', auth, async (req, res) => {
  try {
    const { company_id, employee_id, att_date, status } = req.body;
    await query('INSERT INTO attendance (company_id,employee_id,att_date,status) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE status=?',
      [company_id, employee_id, att_date, status, status]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/leave-types', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    res.json(await query('SELECT * FROM leave_types WHERE company_id=?', [company_id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/leave-types', auth, async (req, res) => {
  try {
    const { company_id, name, days_allowed } = req.body;
    const r = await query('INSERT INTO leave_types (company_id,name,days_allowed) VALUES (?,?,?)', [company_id, name, days_allowed]);
    res.status(201).json({ id: r.insertId, name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/leaves', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    res.json(await query('SELECT l.*,e.name as employee_name,lt.name as leave_type_name FROM leaves l LEFT JOIN employees e ON l.employee_id=e.id LEFT JOIN leave_types lt ON l.leave_type_id=lt.id WHERE l.company_id=? ORDER BY l.applied_at DESC', [company_id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/leaves', auth, async (req, res) => {
  try {
    const { company_id, employee_id, leave_type_id, from_date, to_date, days, reason } = req.body;
    const r = await query('INSERT INTO leaves (company_id,employee_id,leave_type_id,from_date,to_date,days,reason) VALUES (?,?,?,?,?,?,?)',
      [company_id, employee_id, leave_type_id, from_date, to_date, days, reason]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/leaves/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await query('UPDATE leaves SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
