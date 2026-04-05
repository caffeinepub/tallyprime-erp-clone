const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM rules WHERE company_id=? ORDER BY priority DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/', auth, async (req, res) => {
  try{
    const {company_id,name,rule_type,conditions,actions,priority}=req.body;
    const r=await query('INSERT INTO rules (company_id,name,rule_type,conditions,actions,priority) VALUES (?,?,?,?,?,?)',[company_id,name,rule_type||'alert',JSON.stringify(conditions||{}),JSON.stringify(actions||{}),priority||0]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/:id', auth, async (req, res) => {
  try{
    const {name,rule_type,conditions,actions,priority,is_active}=req.body;
    await query('UPDATE rules SET name=?,rule_type=?,conditions=?,actions=?,priority=?,is_active=? WHERE id=?',[name,rule_type,JSON.stringify(conditions),JSON.stringify(actions),priority,is_active?1:0,req.params.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});
router.delete('/:id', auth, async (req, res) => {
  try{await query('DELETE FROM rules WHERE id=?',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
router.get('/logs', auth, async (req, res) => {
  try{res.json(await query('SELECT rl.*,r.name as rule_name FROM rule_logs rl LEFT JOIN rules r ON rl.rule_id=r.id ORDER BY rl.triggered_at DESC LIMIT 100'));}catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
