const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/comments', auth, async (req, res) => {
  try{const {company_id,voucher_id}=req.query;res.json(await query('SELECT * FROM voucher_comments WHERE company_id=? AND voucher_id=? ORDER BY created_at',[company_id,voucher_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/comments', auth, async (req, res) => {
  try{
    const {company_id,voucher_id,comment}=req.body;
    const r=await query('INSERT INTO voucher_comments (company_id,voucher_id,username,comment) VALUES (?,?,?,?)',[company_id,voucher_id,req.user.username,comment]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/tasks', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM tasks WHERE company_id=? ORDER BY due_date',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/tasks', auth, async (req, res) => {
  try{
    const {company_id,voucher_id,title,assigned_to,due_date}=req.body;
    const r=await query('INSERT INTO tasks (company_id,voucher_id,title,assigned_to,due_date) VALUES (?,?,?,?,?)',[company_id,voucher_id||null,title,assigned_to,due_date]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/tasks/:id/status', auth, async (req, res) => {
  try{await query('UPDATE tasks SET status=? WHERE id=?',[req.body.status,req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
