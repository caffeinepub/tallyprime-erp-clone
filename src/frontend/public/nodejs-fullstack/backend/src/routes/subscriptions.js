const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query("SELECT st.*,c.name as customer_name FROM subscription_templates st LEFT JOIN customers c ON st.customer_id=c.id WHERE st.company_id=? ORDER BY st.next_due_date",[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/', auth, async (req, res) => {
  try{
    const {company_id,name,customer_id,amount,frequency,start_date,next_due_date}=req.body;
    const r=await query('INSERT INTO subscription_templates (company_id,name,customer_id,amount,frequency,start_date,next_due_date) VALUES (?,?,?,?,?,?,?)',[company_id,name,customer_id,amount,frequency||'monthly',start_date,next_due_date]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/:id', auth, async (req, res) => {
  try{
    const {name,amount,frequency,next_due_date,status}=req.body;
    await query('UPDATE subscription_templates SET name=?,amount=?,frequency=?,next_due_date=?,status=? WHERE id=?',[name,amount,frequency,next_due_date,status,req.params.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/alerts', auth, async (req, res) => {
  try{
    const {company_id}=req.query;
    res.json(await query("SELECT st.*,c.name as customer_name,DATEDIFF(st.next_due_date,CURDATE()) as days_until_due FROM subscription_templates st LEFT JOIN customers c ON st.customer_id=c.id WHERE st.company_id=? AND st.status='active' AND DATEDIFF(st.next_due_date,CURDATE()) <= 30 ORDER BY st.next_due_date",[company_id]));
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
