const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT p.*,c.name as customer_name FROM projects p LEFT JOIN customers c ON p.customer_id=c.id WHERE p.company_id=? ORDER BY p.name',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/', auth, async (req, res) => {
  try{
    const {company_id,name,customer_id,start_date,end_date,budgeted_cost}=req.body;
    const r=await query('INSERT INTO projects (company_id,name,customer_id,start_date,end_date,budgeted_cost) VALUES (?,?,?,?,?,?)',[company_id,name,customer_id||null,start_date,end_date,budgeted_cost||0]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/:id', auth, async (req, res) => {
  try{
    const {name,customer_id,start_date,end_date,budgeted_cost,status}=req.body;
    await query('UPDATE projects SET name=?,customer_id=?,start_date=?,end_date=?,budgeted_cost=?,status=? WHERE id=?',[name,customer_id||null,start_date,end_date,budgeted_cost,status,req.params.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/:id/costs', auth, async (req, res) => {
  try{res.json(await query('SELECT pc.*,l.name as ledger_name FROM project_costs pc LEFT JOIN ledgers l ON pc.ledger_id=l.id WHERE pc.project_id=?',[req.params.id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/:id/costs', auth, async (req, res) => {
  try{
    const {company_id,ledger_id,amount,date,narration,cost_type}=req.body;
    const r=await query('INSERT INTO project_costs (project_id,company_id,ledger_id,amount,date,narration,cost_type) VALUES (?,?,?,?,?,?,?)',[req.params.id,company_id,ledger_id,amount,date,narration,cost_type||'expense']);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
