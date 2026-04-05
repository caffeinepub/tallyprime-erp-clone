const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { res.json(await query('SELECT * FROM currencies ORDER BY is_base DESC, code')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { code, symbol, name, exchange_rate, is_base } = req.body;
    const r = await query('INSERT INTO currencies (code,symbol,name,exchange_rate,is_base) VALUES (?,?,?,?,?)', [code, symbol, name, exchange_rate || 1, is_base ? 1 : 0]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { code, symbol, name, exchange_rate, is_base } = req.body;
    await query('UPDATE currencies SET code=?,symbol=?,name=?,exchange_rate=?,is_base=? WHERE id=?', [code, symbol, name, exchange_rate, is_base ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:id/rates', auth, async (req, res) => {
  try { res.json(await query('SELECT * FROM exchange_rates WHERE currency_id=? ORDER BY date DESC', [req.params.id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/:id/rates', auth, async (req, res) => {
  try {
    const { date, rate, narration } = req.body;
    const r = await query('INSERT INTO exchange_rates (currency_id,date,rate,narration) VALUES (?,?,?,?)', [req.params.id, date, rate, narration]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
