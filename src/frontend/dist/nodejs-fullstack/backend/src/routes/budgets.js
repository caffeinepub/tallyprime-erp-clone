const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT b.*,l.name as ledger_name FROM budgets b LEFT JOIN ledgers l ON b.ledger_id=l.id WHERE b.company_id=? ORDER BY b.name', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { company_id, name, ledger_id, period_from, period_to, budgeted_amount } = req.body;
    const r = await query('INSERT INTO budgets (company_id,name,ledger_id,period_from,period_to,budgeted_amount) VALUES (?,?,?,?,?,?)',
      [company_id, name, ledger_id, period_from, period_to, budgeted_amount]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, ledger_id, period_from, period_to, budgeted_amount, actual_amount } = req.body;
    await query('UPDATE budgets SET name=?,ledger_id=?,period_from=?,period_to=?,budgeted_amount=?,actual_amount=? WHERE id=?',
      [name, ledger_id, period_from, period_to, budgeted_amount, actual_amount || 0, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { await query('DELETE FROM budgets WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
