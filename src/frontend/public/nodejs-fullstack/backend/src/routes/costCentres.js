const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

// Cost Centres
router.get('/', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT * FROM cost_centres WHERE company_id=? ORDER BY name', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { company_id, name, parent_centre_id, description } = req.body;
    const r = await query('INSERT INTO cost_centres (company_id,name,parent_centre_id,description) VALUES (?,?,?,?)', [company_id, name, parent_centre_id || null, description]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, parent_centre_id, description } = req.body;
    await query('UPDATE cost_centres SET name=?,parent_centre_id=?,description=? WHERE id=?', [name, parent_centre_id || null, description, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Cost Allocations
router.get('/allocations', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT ca.*,cc.name as centre_name,l.name as ledger_name FROM cost_allocations ca LEFT JOIN cost_centres cc ON ca.cost_centre_id=cc.id LEFT JOIN ledgers l ON ca.ledger_id=l.id WHERE ca.company_id=?', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/allocations', auth, async (req, res) => {
  try {
    const { company_id, cost_centre_id, voucher_id, ledger_id, amount, date, narration } = req.body;
    const r = await query('INSERT INTO cost_allocations (company_id,cost_centre_id,voucher_id,ledger_id,amount,date,narration) VALUES (?,?,?,?,?,?,?)',
      [company_id, cost_centre_id, voucher_id, ledger_id, amount, date, narration]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    res.json(await query('SELECT cc.id as centre_id, cc.name as centre_name, SUM(ca.amount) as total_allocated FROM cost_centres cc LEFT JOIN cost_allocations ca ON cc.id=ca.cost_centre_id AND ca.company_id=? WHERE cc.company_id=? GROUP BY cc.id ORDER BY total_allocated DESC', [company_id, company_id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
