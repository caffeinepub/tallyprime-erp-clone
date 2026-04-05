const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT * FROM cheques WHERE company_id=? ORDER BY cheque_date DESC', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { company_id, bank_account_id, cheque_number, cheque_date, amount, payee_name, cheque_type, remarks } = req.body;
    const r = await query('INSERT INTO cheques (company_id,bank_account_id,cheque_number,cheque_date,amount,payee_name,cheque_type,remarks) VALUES (?,?,?,?,?,?,?,?)',
      [company_id, bank_account_id, cheque_number, cheque_date, amount, payee_name, cheque_type, remarks]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    await query('UPDATE cheques SET status=?,remarks=? WHERE id=?', [status, remarks, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
