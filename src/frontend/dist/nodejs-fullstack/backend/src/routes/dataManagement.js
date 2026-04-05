const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/export', auth, async (req, res) => {
  try{
    const {company_id}=req.query;
    const [co,le,vo,cu,ve,em,st]=await Promise.all([query('SELECT * FROM companies WHERE id=?',[company_id]),query('SELECT * FROM ledgers WHERE company_id=?',[company_id]),query('SELECT * FROM vouchers WHERE company_id=?',[company_id]),query('SELECT * FROM customers WHERE company_id=?',[company_id]),query('SELECT * FROM vendors WHERE company_id=?',[company_id]),query('SELECT * FROM employees WHERE company_id=?',[company_id]),query('SELECT * FROM stock_items WHERE company_id=?',[company_id])]);
    res.json({company:co[0],ledgers:le,vouchers:vo,customers:cu,vendors:ve,employees:em,stock_items:st,exported_at:new Date().toISOString()});
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/summary', auth, async (req, res) => {
  try{
    const [a,b,c,d,e]=await Promise.all([query('SELECT COUNT(*) as cnt FROM companies'),query('SELECT COUNT(*) as cnt FROM ledgers'),query('SELECT COUNT(*) as cnt FROM vouchers'),query('SELECT COUNT(*) as cnt FROM employees'),query('SELECT COUNT(*) as cnt FROM stock_items')]);
    res.json({companies:a[0]?.cnt,ledgers:b[0]?.cnt,vouchers:c[0]?.cnt,employees:d[0]?.cnt,stock_items:e[0]?.cnt});
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
