const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM maker_checker WHERE company_id=? ORDER BY submitted_at DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/', auth, async (req, res) => {
  try{
    const {company_id,entity_type,entity_id,action_type,payload}=req.body;
    const r=await query('INSERT INTO maker_checker (company_id,entity_type,entity_id,action_type,payload,maker) VALUES (?,?,?,?,?,?)',[company_id,entity_type,entity_id||null,action_type,JSON.stringify(payload||{}),req.user.username]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/:id/approve', auth, async (req, res) => {
  try{await query('UPDATE maker_checker SET status="approved",checker=?,remarks=?,reviewed_at=NOW() WHERE id=?',[req.user.username,req.body.remarks,req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
router.put('/:id/reject', auth, async (req, res) => {
  try{await query('UPDATE maker_checker SET status="rejected",checker=?,remarks=?,reviewed_at=NOW() WHERE id=?',[req.user.username,req.body.remarks,req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
