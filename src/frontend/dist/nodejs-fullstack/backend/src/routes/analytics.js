const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');
const { cacheGet, cacheSet } = require('../database/redis');

router.get('/kpi', auth, async (req, res) => {
  try {
    const {company_id}=req.query;
    const c=await cacheGet(`kpi:${company_id}`);
    if(c) return res.json(c);
    const [a,b,cc,d]=await Promise.all([query('SELECT COUNT(*) as cnt FROM ledgers WHERE company_id=?',[company_id]),query('SELECT COUNT(*) as cnt FROM vouchers WHERE company_id=?',[company_id]),query('SELECT COUNT(*) as cnt FROM customers WHERE company_id=?',[company_id]),query('SELECT COUNT(*) as cnt FROM employees WHERE company_id=?',[company_id])]);
    const result={ledgers:a[0]?.cnt||0,vouchers:b[0]?.cnt||0,customers:cc[0]?.cnt||0,employees:d[0]?.cnt||0};
    await cacheSet(`kpi:${company_id}`,result,300);
    res.json(result);
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/cash-flow-forecast', auth, async (req, res) => {
  try{
    const t=new Date();
    res.json(Array.from({length:90},(_,i)=>{const d=new Date(t);d.setDate(d.getDate()+i);return{date:d.toISOString().split('T')[0],projected_in:Math.random()*50000+10000,projected_out:Math.random()*30000+5000};}));
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/expense-breakdown', auth, async (req, res) => {
  try{
    const {company_id,from_date,to_date}=req.query;
    res.json(await query("SELECT lg.name as category,ABS(SUM(ve.amount)) as amount FROM ledgers l JOIN ledger_groups lg ON l.group_id=lg.id JOIN voucher_entries ve ON ve.ledger_id=l.id JOIN vouchers v ON ve.voucher_id=v.id WHERE v.company_id=? AND lg.nature='Expense' AND v.date BETWEEN ? AND ? GROUP BY lg.id ORDER BY amount DESC LIMIT 10",[company_id,from_date||'2024-04-01',to_date||'2025-03-31']));
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/pl-trend', auth, async (req, res) => {
  try{
    const n=new Date();
    res.json(Array.from({length:12},(_,i)=>{const d=new Date(n.getFullYear(),n.getMonth()-11+i,1);return{month:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,income:Math.random()*200000+50000,expense:Math.random()*150000+30000};}));
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
