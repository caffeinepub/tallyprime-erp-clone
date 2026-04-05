const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/sessions', auth, async (req, res) => {
  try { const {company_id}=req.query; res.json(await query('SELECT * FROM pos_sessions WHERE company_id=? ORDER BY opened_at DESC',[company_id])); } catch(e){res.status(500).json({error:e.message});}
});
router.post('/sessions', auth, async (req, res) => {
  try {
    const {company_id,opening_cash}=req.body;
    const r=await query('INSERT INTO pos_sessions (company_id,opened_by,opening_cash) VALUES (?,?,?)',[company_id,req.user.username,opening_cash||0]);
    res.status(201).json({id:r.insertId});
  } catch(e){res.status(500).json({error:e.message});}
});
router.put('/sessions/:id/close', auth, async (req, res) => {
  try{await query('UPDATE pos_sessions SET status="closed",closed_at=NOW(),closing_cash=? WHERE id=?',[req.body.closing_cash,req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
router.get('/sales', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM pos_sales WHERE company_id=? ORDER BY date DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/sales', auth, async (req, res) => {
  try {
    const {company_id,session_id,bill_number,items,subtotal,discount,tax,total,payment_mode,amount_tendered,change_amount}=req.body;
    const r=await query('INSERT INTO pos_sales (company_id,session_id,bill_number,items,subtotal,discount,tax,total,payment_mode,amount_tendered,change_amount) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[company_id,session_id,bill_number,JSON.stringify(items),subtotal,discount||0,tax||0,total,payment_mode||'cash',amount_tendered,change_amount||0]);
    res.status(201).json({id:r.insertId});
  } catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
