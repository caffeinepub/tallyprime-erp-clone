const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT * FROM fixed_assets WHERE company_id=? ORDER BY name', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { company_id, name, category, purchase_date, cost, salvage_value, useful_life_years, depreciation_method } = req.body;
    const r = await query('INSERT INTO fixed_assets (company_id,name,category,purchase_date,cost,salvage_value,useful_life_years,depreciation_method) VALUES (?,?,?,?,?,?,?,?)',
      [company_id, name, category, purchase_date, cost, salvage_value || 0, useful_life_years, depreciation_method || 'SLM']);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, purchase_date, cost, salvage_value, useful_life_years, depreciation_method, accumulated_depreciation, is_disposed } = req.body;
    await query('UPDATE fixed_assets SET name=?,category=?,purchase_date=?,cost=?,salvage_value=?,useful_life_years=?,depreciation_method=?,accumulated_depreciation=?,is_disposed=? WHERE id=?',
      [name, category, purchase_date, cost, salvage_value, useful_life_years, depreciation_method, accumulated_depreciation || 0, is_disposed ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/:id/depreciation', auth, async (req, res) => {
  try {
    const { amount, date, narration } = req.body;
    const r = await query('INSERT INTO depreciation_entries (asset_id,amount,date,narration) VALUES (?,?,?,?)', [req.params.id, amount, date, narration]);
    await query('UPDATE fixed_assets SET accumulated_depreciation = accumulated_depreciation + ? WHERE id=?', [amount, req.params.id]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:id/depreciation', auth, async (req, res) => {
  try { res.json(await query('SELECT * FROM depreciation_entries WHERE asset_id=? ORDER BY date DESC', [req.params.id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
