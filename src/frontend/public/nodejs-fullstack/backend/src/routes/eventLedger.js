const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{const {company_id,limit}=req.query;res.json(await query(`SELECT * FROM event_ledger WHERE company_id=? ORDER BY timestamp DESC LIMIT ${parseInt(limit)||100}`,[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/', auth, async (req, res) => {
  try{
    const {company_id,event_type,entity_type,entity_id,payload,previous_state}=req.body;
    const r=await query('INSERT INTO event_ledger (company_id,event_type,entity_type,entity_id,payload,previous_state,user) VALUES (?,?,?,?,?,?,?)',[company_id,event_type,entity_type,entity_id||null,JSON.stringify(payload||{}),JSON.stringify(previous_state||null),req.user.username]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.post('/:id/undo', auth, async (req, res) => {
  try{await query('UPDATE event_ledger SET is_undone=1 WHERE id=?',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
router.get('/time-travel', auth, async (req, res) => {
  try{
    const {company_id,as_of_date}=req.query;
    res.json(await query('SELECT * FROM event_ledger WHERE company_id=? AND timestamp<=? AND is_undone=0 ORDER BY timestamp ASC',[company_id,as_of_date||new Date().toISOString()]));
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
