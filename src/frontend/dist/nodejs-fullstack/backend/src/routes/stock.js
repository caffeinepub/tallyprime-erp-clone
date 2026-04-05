const express = require('express');
const router = express.Router();
const { query, invalidateCache } = require('../database/db');
const { auth } = require('../middleware/auth');
const { cacheGet, cacheSet } = require('../database/redis');

router.get('/groups', auth, async (req, res) => {
  try { res.json(await query('SELECT * FROM stock_groups ORDER BY name')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/groups', auth, async (req, res) => {
  try {
    const { name, parent_group_id, unit } = req.body;
    const r = await query('INSERT INTO stock_groups (name,parent_group_id,unit) VALUES (?,?,?)', [name, parent_group_id || null, unit]);
    res.status(201).json({ id: r.insertId, name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/items', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    const cKey = `stock_items:${company_id}`;
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query('SELECT si.*, sg.name as group_name FROM stock_items si LEFT JOIN stock_groups sg ON si.stock_group_id=sg.id WHERE si.company_id=? ORDER BY si.name', [company_id]);
    await cacheSet(cKey, rows, 600);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/items', auth, async (req, res) => {
  try {
    const { company_id, name, stock_group_id, unit, opening_qty, opening_rate, gst_rate, hsn_code } = req.body;
    const r = await query('INSERT INTO stock_items (company_id,name,stock_group_id,unit,opening_qty,opening_rate,gst_rate,hsn_code) VALUES (?,?,?,?,?,?,?,?)',
      [company_id, name, stock_group_id, unit, opening_qty || 0, opening_rate || 0, gst_rate || 0, hsn_code]);
    await invalidateCache(`stock_items:${company_id}`);
    res.status(201).json({ id: r.insertId, company_id, name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/items/:id', auth, async (req, res) => {
  try {
    const { name, stock_group_id, unit, opening_qty, opening_rate, gst_rate, hsn_code, company_id } = req.body;
    await query('UPDATE stock_items SET name=?,stock_group_id=?,unit=?,opening_qty=?,opening_rate=?,gst_rate=?,hsn_code=? WHERE id=?',
      [name, stock_group_id, unit, opening_qty, opening_rate, gst_rate, hsn_code, req.params.id]);
    if (company_id) await invalidateCache(`stock_items:${company_id}`);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    const cKey = `stock_summary:${company_id}`;
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query(`
      SELECT si.id, si.name as item_name, si.unit, si.opening_qty, si.opening_rate, si.opening_qty*si.opening_rate as opening_value,
        COALESCE(SUM(CASE WHEN sv.voucher_type IN ('Purchase','StockIn') THEN sve.qty ELSE 0 END),0) as in_qty,
        COALESCE(SUM(CASE WHEN sv.voucher_type IN ('Sales','StockOut') THEN sve.qty ELSE 0 END),0) as out_qty
      FROM stock_items si
      LEFT JOIN stock_voucher_entries sve ON si.id=sve.stock_item_id
      LEFT JOIN stock_vouchers sv ON sve.stock_voucher_id=sv.id AND sv.company_id=?
      WHERE si.company_id=? GROUP BY si.id ORDER BY si.name
    `, [company_id, company_id]);
    const result = rows.map(r => ({
      ...r,
      closing_qty: (r.opening_qty||0) + (r.in_qty||0) - (r.out_qty||0),
      closing_value: ((r.opening_qty||0) + (r.in_qty||0) - (r.out_qty||0)) * (r.opening_rate||0)
    }));
    await cacheSet(cKey, result, 300);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/vouchers', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    res.json(await query('SELECT * FROM stock_vouchers WHERE company_id=? ORDER BY date DESC', [company_id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/vouchers', auth, async (req, res) => {
  try {
    const { company_id, voucher_type, voucher_number, date, narration, entries } = req.body;
    const r = await query('INSERT INTO stock_vouchers (company_id,voucher_type,voucher_number,date,narration) VALUES (?,?,?,?,?)',
      [company_id, voucher_type, voucher_number, date, narration]);
    const vid = r.insertId;
    if (entries?.length) {
      for (const e of entries) {
        await query('INSERT INTO stock_voucher_entries (stock_voucher_id,stock_item_id,qty,rate,amount,warehouse_from,warehouse_to) VALUES (?,?,?,?,?,?,?)',
          [vid, e.stock_item_id, e.qty, e.rate, e.amount, e.warehouse_from, e.warehouse_to]);
      }
    }
    await invalidateCache(`stock_summary:${company_id}`);
    res.status(201).json({ id: vid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
