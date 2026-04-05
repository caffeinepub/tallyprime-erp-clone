const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/custom-fields', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM custom_fields WHERE company_id=? ORDER BY entity_type,field_name',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/custom-fields', auth, async (req, res) => {
  try{
    const {company_id,entity_type,field_name,field_type,options,is_required}=req.body;
    const r=await query('INSERT INTO custom_fields (company_id,entity_type,field_name,field_type,options,is_required) VALUES (?,?,?,?,?,?)',[company_id,entity_type,field_name,field_type||'text',JSON.stringify(options||[]),is_required?1:0]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.delete('/custom-fields/:id', auth, async (req, res) => {
  try{await query('DELETE FROM custom_fields WHERE id=?',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
router.get('/workflows', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM workflows WHERE company_id=? ORDER BY name',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/workflows', auth, async (req, res) => {
  try{
    const {company_id,name,trigger_event,steps}=req.body;
    const r=await query('INSERT INTO workflows (company_id,name,trigger_event,steps) VALUES (?,?,?,?)',[company_id,name,trigger_event,JSON.stringify(steps||[])]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/workflows/:id', auth, async (req, res) => {
  try{
    const {name,trigger_event,steps,is_active}=req.body;
    await query('UPDATE workflows SET name=?,trigger_event=?,steps=?,is_active=? WHERE id=?',[name,trigger_event,JSON.stringify(steps),is_active?1:0,req.params.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
