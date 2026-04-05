const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM notifications WHERE company_id=? ORDER BY created_at DESC LIMIT 100',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/', auth, async (req, res) => {
  try{
    const {company_id,title,message,type}=req.body;
    const r=await query('INSERT INTO notifications (company_id,title,message,type) VALUES (?,?,?,?)',[company_id,title,message,type||'info']);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/:id/read', auth, async (req, res) => {
  try{await query('UPDATE notifications SET is_read=1 WHERE id=?',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
router.get('/smart-alerts', auth, async (req, res) => {
  try{
    const {company_id}=req.query;const alerts=[];
    const ls=await query('SELECT name FROM stock_items WHERE company_id=? AND opening_qty<=reorder_level AND reorder_level>0 LIMIT 5',[company_id]);
    if(ls.length) alerts.push({type:'warning',title:'Low Stock',message:`${ls.length} items below reorder level`});
    res.json(alerts);
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
