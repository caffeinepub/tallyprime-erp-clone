const express = require('express');
const router = express.Router();
const { query, invalidateCache } = require('../database/db');
const { auth } = require('../middleware/auth');
const { cacheGet, cacheSet } = require('../database/redis');

// Ledger Groups
router.get('/groups', auth, async (req, res) => {
  try {
    const cKey = 'ledger_groups:all';
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query('SELECT * FROM ledger_groups ORDER BY name');
    await cacheSet(cKey, rows, 3600);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/groups', auth, async (req, res) => {
  try {
    const { name, parent_group, nature } = req.body;
    const r = await query('INSERT INTO ledger_groups (name, parent_group, nature) VALUES (?,?,?)', [name, parent_group || null, nature]);
    await invalidateCache('ledger_groups:*');
    res.status(201).json({ id: r.insertId, name, parent_group, nature });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Ledgers
router.get('/', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    if (!company_id) return res.status(400).json({ error: 'company_id required' });
    const cKey = `ledgers:${company_id}`;
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query('SELECT l.*, g.name as group_name FROM ledgers l LEFT JOIN ledger_groups g ON l.group_id=g.id WHERE l.company_id=? ORDER BY l.name', [company_id]);
    await cacheSet(cKey, rows, 600);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { company_id, name, group_id, opening_balance, balance_type, gstin, pan, bank_account, ifsc_code } = req.body;
    const r = await query(
      'INSERT INTO ledgers (company_id, name, group_id, opening_balance, balance_type, gstin, pan, bank_account, ifsc_code) VALUES (?,?,?,?,?,?,?,?,?)',
      [company_id, name, group_id, opening_balance || 0, balance_type || 'Dr', gstin, pan, bank_account, ifsc_code]
    );
    await invalidateCache(`ledgers:${company_id}`);
    res.status(201).json({ id: r.insertId, company_id, name, group_id, opening_balance: opening_balance || 0, balance_type: balance_type || 'Dr' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, group_id, opening_balance, balance_type, gstin, pan, bank_account, ifsc_code, company_id } = req.body;
    await query('UPDATE ledgers SET name=?,group_id=?,opening_balance=?,balance_type=?,gstin=?,pan=?,bank_account=?,ifsc_code=? WHERE id=?',
      [name, group_id, opening_balance || 0, balance_type || 'Dr', gstin, pan, bank_account, ifsc_code, req.params.id]);
    if (company_id) await invalidateCache(`ledgers:${company_id}`);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    await query('DELETE FROM ledgers WHERE id=?', [req.params.id]);
    if (company_id) await invalidateCache(`ledgers:${company_id}`);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Trial Balance
router.get('/trial-balance', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    const cKey = `trial_balance:${company_id}`;
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query(`
      SELECT l.name as ledger_name,
        SUM(CASE WHEN ve.entry_type='Dr' THEN ve.amount ELSE 0 END) as debit_total,
        SUM(CASE WHEN ve.entry_type='Cr' THEN ve.amount ELSE 0 END) as credit_total
      FROM ledgers l
      LEFT JOIN voucher_entries ve ON ve.ledger_id = l.id
      LEFT JOIN vouchers v ON ve.voucher_id = v.id AND v.company_id = ?
      WHERE l.company_id = ?
      GROUP BY l.id, l.name
      ORDER BY l.name
    `, [company_id, company_id]);
    await cacheSet(cKey, rows, 300);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
