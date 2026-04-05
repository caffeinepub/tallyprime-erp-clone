const express = require('express');
const router = express.Router();
const { query, invalidateCache } = require('../database/db');
const { auth } = require('../middleware/auth');
const { cacheGet, cacheSet } = require('../database/redis');
const { logAudit } = require('../middleware/audit');

// GET vouchers by company
router.get('/', auth, async (req, res) => {
  try {
    const { company_id, type, from_date, to_date } = req.query;
    if (!company_id) return res.status(400).json({ error: 'company_id required' });
    let sql = 'SELECT v.*, GROUP_CONCAT(JSON_OBJECT("ledger_id",ve.ledger_id,"entry_type",ve.entry_type,"amount",ve.amount)) as entries_raw FROM vouchers v LEFT JOIN voucher_entries ve ON v.id=ve.voucher_id WHERE v.company_id=?';
    const params = [company_id];
    if (type) { sql += ' AND v.voucher_type=?'; params.push(type); }
    if (from_date) { sql += ' AND v.date >= ?'; params.push(from_date); }
    if (to_date) { sql += ' AND v.date <= ?'; params.push(to_date); }
    sql += ' GROUP BY v.id ORDER BY v.date DESC, v.id DESC';
    const rows = await query(sql, params);
    const result = rows.map(r => ({ ...r, entries: r.entries_raw ? JSON.parse('['+r.entries_raw+']').filter(Boolean) : [] }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET day book
router.get('/day-book', auth, async (req, res) => {
  try {
    const { company_id, date } = req.query;
    const cKey = `daybook:${company_id}:${date}`;
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query(
      'SELECT v.*, GROUP_CONCAT(JSON_OBJECT("ledger_id",ve.ledger_id,"entry_type",ve.entry_type,"amount",ve.amount)) as entries_raw FROM vouchers v LEFT JOIN voucher_entries ve ON v.id=ve.voucher_id WHERE v.company_id=? AND v.date=? GROUP BY v.id ORDER BY v.id',
      [company_id, date]
    );
    const result = rows.map(r => ({ ...r, entries: r.entries_raw ? JSON.parse('['+r.entries_raw+']').filter(Boolean) : [] }));
    await cacheSet(cKey, result, 60);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create voucher
router.post('/', auth, async (req, res) => {
  try {
    const { company_id, voucher_type, voucher_number, date, narration, entries } = req.body;
    const r = await query(
      'INSERT INTO vouchers (company_id, voucher_type, voucher_number, date, narration) VALUES (?,?,?,?,?)',
      [company_id, voucher_type, voucher_number, date, narration]
    );
    const vid = r.insertId;
    if (entries && entries.length > 0) {
      for (const e of entries) {
        await query('INSERT INTO voucher_entries (voucher_id, ledger_id, entry_type, amount) VALUES (?,?,?,?)',
          [vid, e.ledger_id, e.entry_type, e.amount]);
      }
    }
    await invalidateCache(`daybook:${company_id}:*`);
    await invalidateCache(`trial_balance:${company_id}`);
    await logAudit(company_id, req.user.username, 'CREATE', 'voucher', vid, null, { voucher_type, date }, req.ip);
    res.status(201).json({ id: vid, company_id, voucher_type, voucher_number, date, narration, entries });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    await query('DELETE FROM voucher_entries WHERE voucher_id=?', [req.params.id]);
    await query('DELETE FROM vouchers WHERE id=?', [req.params.id]);
    if (company_id) { await invalidateCache(`daybook:${company_id}:*`); await invalidateCache(`trial_balance:${company_id}`); }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
