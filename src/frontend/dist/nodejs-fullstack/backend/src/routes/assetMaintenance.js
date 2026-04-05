const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/schedules', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT ms.*,fa.name as asset_name FROM maintenance_schedules ms LEFT JOIN fixed_assets fa ON ms.asset_id=fa.id WHERE ms.company_id=? ORDER BY ms.scheduled_date', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/schedules', auth, async (req, res) => {
  try {
    const { company_id, asset_id, title, maintenance_type, scheduled_date, priority, assigned_to, notes } = req.body;
    const r = await query('INSERT INTO maintenance_schedules (company_id,asset_id,title,maintenance_type,scheduled_date,priority,assigned_to,notes) VALUES (?,?,?,?,?,?,?,?)',
      [company_id, asset_id, title, maintenance_type || 'preventive', scheduled_date, priority || 'medium', assigned_to, notes]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/schedules/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await query('UPDATE maintenance_schedules SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/logs', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT ml.*,fa.name as asset_name FROM maintenance_logs ml LEFT JOIN fixed_assets fa ON ml.asset_id=fa.id WHERE ml.company_id=? ORDER BY ml.performed_date DESC', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/logs', auth, async (req, res) => {
  try {
    const { company_id, asset_id, schedule_id, performed_date, performed_by, cost, description } = req.body;
    const r = await query('INSERT INTO maintenance_logs (company_id,asset_id,schedule_id,performed_date,performed_by,cost,description) VALUES (?,?,?,?,?,?,?)',
      [company_id, asset_id, schedule_id || null, performed_date, performed_by, cost || 0, description]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/amc', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT amc.*,fa.name as asset_name FROM amc_tracker amc LEFT JOIN fixed_assets fa ON amc.asset_id=fa.id WHERE amc.company_id=? ORDER BY amc.end_date', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/amc', auth, async (req, res) => {
  try {
    const { company_id, asset_id, vendor_name, contract_number, start_date, end_date, annual_cost } = req.body;
    const r = await query('INSERT INTO amc_tracker (company_id,asset_id,vendor_name,contract_number,start_date,end_date,annual_cost) VALUES (?,?,?,?,?,?,?)',
      [company_id, asset_id, vendor_name, contract_number, start_date, end_date, annual_cost || 0]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
