const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/vendors', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT * FROM vendors WHERE company_id=? ORDER BY name', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/vendors', auth, async (req, res) => {
  try {
    const { company_id, name, email, phone, address, gstin } = req.body;
    const r = await query('INSERT INTO vendors (company_id,name,email,phone,address,gstin) VALUES (?,?,?,?,?,?)', [company_id, name, email, phone, address, gstin]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Purchase Orders
router.get('/purchase', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT po.*,v.name as vendor_name FROM purchase_orders po LEFT JOIN vendors v ON po.vendor_id=v.id WHERE po.company_id=? ORDER BY po.date DESC', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/purchase', auth, async (req, res) => {
  try {
    const { company_id, vendor_id, order_number, date, total_amount, notes } = req.body;
    const r = await query('INSERT INTO purchase_orders (company_id,vendor_id,order_number,date,total_amount,notes) VALUES (?,?,?,?,?,?)',
      [company_id, vendor_id, order_number, date, total_amount, notes]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/purchase/:id/status', auth, async (req, res) => {
  try { await query('UPDATE purchase_orders SET status=? WHERE id=?', [req.body.status, req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Sales Orders
router.get('/sales', auth, async (req, res) => {
  try { const { company_id } = req.query; res.json(await query('SELECT so.*,c.name as customer_name FROM sales_orders so LEFT JOIN customers c ON so.customer_id=c.id WHERE so.company_id=? ORDER BY so.date DESC', [company_id])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/sales', auth, async (req, res) => {
  try {
    const { company_id, customer_id, order_number, date, total_amount, notes } = req.body;
    const r = await query('INSERT INTO sales_orders (company_id,customer_id,order_number,date,total_amount,notes) VALUES (?,?,?,?,?,?)',
      [company_id, customer_id, order_number, date, total_amount, notes]);
    res.status(201).json({ id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/sales/:id/status', auth, async (req, res) => {
  try { await query('UPDATE sales_orders SET status=? WHERE id=?', [req.body.status, req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
