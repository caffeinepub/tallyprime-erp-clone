const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');
const { cacheGet, cacheSet } = require('../database/redis');

router.get('/accounts', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    const cKey = `bank_accounts:${company_id}`;
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query('SELECT * FROM bank_accounts WHERE company_id=? ORDER BY account_name', [company_id]);
    await cacheSet(cKey, rows, 600);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/accounts', auth, async (req, res) => {
  try {
    const { company_id, account_name, account_number, ifsc_code, bank_name, branch_name, linked_ledger_id, opening_balance } = req.body;
    const r = await query('INSERT INTO bank_accounts (company_id,account_name,account_number,ifsc_code,bank_name,branch_name,linked_ledger_id,opening_balance) VALUES (?,?,?,?,?,?,?,?)',
      [company_id, account_name, account_number, ifsc_code, bank_name, branch_name, linked_ledger_id, opening_balance || 0]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/transactions', auth, async (req, res) => {
  try {
    const { company_id, bank_account_id } = req.query;
    res.json(await query('SELECT * FROM bank_transactions WHERE company_id=? AND bank_account_id=? ORDER BY date DESC', [company_id, bank_account_id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/transactions', auth, async (req, res) => {
  try {
    const { company_id, bank_account_id, date, description, amount, transaction_type, voucher_id } = req.body;
    const r = await query('INSERT INTO bank_transactions (company_id,bank_account_id,date,description,amount,transaction_type,voucher_id) VALUES (?,?,?,?,?,?,?)',
      [company_id, bank_account_id, date, description, amount, transaction_type, voucher_id || null]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/transactions/:id/reconcile', auth, async (req, res) => {
  try {
    const { voucher_id, remarks } = req.body;
    await query('UPDATE bank_transactions SET is_reconciled=1,reconciled_date=CURDATE(),voucher_id=? WHERE id=?', [voucher_id || null, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/unreconciled', auth, async (req, res) => {
  try {
    const { company_id, bank_account_id } = req.query;
    res.json(await query('SELECT * FROM bank_transactions WHERE company_id=? AND bank_account_id=? AND is_reconciled=0 ORDER BY date', [company_id, bank_account_id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/balance', auth, async (req, res) => {
  try {
    const { company_id, bank_account_id } = req.query;
    const rows = await query('SELECT SUM(CASE WHEN transaction_type="credit" THEN amount ELSE -amount END) as balance FROM bank_transactions WHERE company_id=? AND bank_account_id=?', [company_id, bank_account_id]);
    const accts = await query('SELECT opening_balance FROM bank_accounts WHERE id=?', [bank_account_id]);
    const opening = accts[0]?.opening_balance || 0;
    res.json({ balance: opening + (rows[0]?.balance || 0) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
