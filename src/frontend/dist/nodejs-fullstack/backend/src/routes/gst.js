const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');
const { cacheGet, cacheSet } = require('../database/redis');

router.get('/settings', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    const rows = await query('SELECT * FROM gst_settings WHERE company_id=?', [company_id]);
    res.json(Array.isArray(rows) ? rows[0] || null : null);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/settings', auth, async (req, res) => {
  try {
    const { company_id, registration_type, state_code, state_name } = req.body;
    await query('INSERT INTO gst_settings (company_id,registration_type,state_code,state_name) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE registration_type=?,state_code=?,state_name=?',
      [company_id, registration_type, state_code, state_name, registration_type, state_code, state_name]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/vouchers', auth, async (req, res) => {
  try {
    const { company_id } = req.query;
    const cKey = `gst_vouchers:${company_id}`;
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query('SELECT * FROM gst_vouchers WHERE company_id=? ORDER BY date DESC', [company_id]);
    await cacheSet(cKey, rows, 300);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/vouchers', auth, async (req, res) => {
  try {
    const { company_id, voucher_type, voucher_number, date, narration, entries, party_name, party_gstin, place_of_supply, is_inter_state } = req.body;
    const r = await query(
      'INSERT INTO gst_vouchers (company_id,voucher_type,voucher_number,date,narration,party_name,party_gstin,place_of_supply,is_inter_state) VALUES (?,?,?,?,?,?,?,?,?)',
      [company_id, voucher_type, voucher_number, date, narration, party_name, party_gstin, place_of_supply, is_inter_state ? 1 : 0]
    );
    const vid = r.insertId;
    if (entries?.length) {
      for (const e of entries) {
        await query('INSERT INTO gst_voucher_entries (gst_voucher_id,ledger_id,entry_type,amount,hsn_code,taxable_amount,cgst_rate,cgst_amount,sgst_rate,sgst_amount,igst_rate,igst_amount,cess_amount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [vid, e.ledger_id, e.entry_type, e.amount, e.hsn_code, e.taxable_amount, e.cgst_rate, e.cgst_amount, e.sgst_rate, e.sgst_amount, e.igst_rate, e.igst_amount, e.cess_amount]);
      }
    }
    res.status(201).json({ id: vid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/gstr1', auth, async (req, res) => {
  try {
    const { company_id, from_date, to_date } = req.query;
    const cKey = `gstr1:${company_id}:${from_date}:${to_date}`;
    const c = await cacheGet(cKey);
    if (c) return res.json(c);
    const rows = await query(
      `SELECT gv.voucher_number as invoice_number, gv.date as invoice_date, gv.party_name, gv.party_gstin, gv.place_of_supply,
        SUM(ge.taxable_amount) as taxable_value, SUM(ge.cgst_amount) as cgst, SUM(ge.sgst_amount) as sgst, SUM(ge.igst_amount) as igst, SUM(ge.cess_amount) as cess, SUM(ge.amount) as invoice_value, ge.hsn_code
      FROM gst_vouchers gv JOIN gst_voucher_entries ge ON gv.id=ge.gst_voucher_id
      WHERE gv.company_id=? AND gv.voucher_type='Sales' AND gv.date BETWEEN ? AND ?
      GROUP BY gv.id`, [company_id, from_date, to_date]);
    await cacheSet(cKey, rows, 300);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/gstr3b', auth, async (req, res) => {
  try {
    const { company_id, from_date, to_date } = req.query;
    const rows = await query(
      `SELECT SUM(ge.taxable_amount) as outward_taxable_supplies, SUM(ge.cgst_amount) as outward_cgst, SUM(ge.sgst_amount) as outward_sgst, SUM(ge.igst_amount) as outward_igst
      FROM gst_vouchers gv JOIN gst_voucher_entries ge ON gv.id=ge.gst_voucher_id
      WHERE gv.company_id=? AND gv.date BETWEEN ? AND ?`, [company_id, from_date, to_date]);
    res.json(rows[0] || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
