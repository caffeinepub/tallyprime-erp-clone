const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try { res.json(await query('SELECT * FROM hsn_codes ORDER BY code')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', auth, async (req, res) => {
  try {
    const { code, description, gst_rate } = req.body;
    const r = await query('INSERT INTO hsn_codes (code,description,gst_rate) VALUES (?,?,?)', [code, description, gst_rate]);
    res.status(201).json({ id: r.insertId, code, description, gst_rate });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try {
    const { code, description, gst_rate } = req.body;
    await query('UPDATE hsn_codes SET code=?,description=?,gst_rate=? WHERE id=?', [code, description, gst_rate, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { await query('DELETE FROM hsn_codes WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
