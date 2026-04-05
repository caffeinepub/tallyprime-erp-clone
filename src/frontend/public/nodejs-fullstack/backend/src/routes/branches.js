const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM branches WHERE company_id=? ORDER BY name',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/', auth, async (req, res) => {
  try{
    const {company_id,name,address,gstin,manager}=req.body;
    const r=await query('INSERT INTO branches (company_id,name,address,gstin,manager) VALUES (?,?,?,?,?)',[company_id,name,address,gstin,manager]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/transfers', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT bt.*,b1.name as from_branch,b2.name as to_branch FROM branch_transfers bt LEFT JOIN branches b1 ON bt.from_branch_id=b1.id LEFT JOIN branches b2 ON bt.to_branch_id=b2.id WHERE bt.company_id=? ORDER BY bt.date DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/transfers', auth, async (req, res) => {
  try{
    const {company_id,from_branch_id,to_branch_id,transfer_type,date,amount,description}=req.body;
    const r=await query('INSERT INTO branch_transfers (company_id,from_branch_id,to_branch_id,transfer_type,date,amount,description) VALUES (?,?,?,?,?,?,?)',[company_id,from_branch_id,to_branch_id,transfer_type||'stock',date,amount,description]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
