const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{
    const {company_id}=req.query;
    const rows=await query('SELECT setting_key,setting_value FROM app_settings WHERE company_id=?',[company_id]);
    const result={};rows.forEach(r=>{result[r.setting_key]=r.setting_value;});res.json(result);
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/', auth, async (req, res) => {
  try{
    const {company_id,settings}=req.body;
    for(const [key,value] of Object.entries(settings||{})){
      await query('INSERT INTO app_settings (company_id,setting_key,setting_value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE setting_value=?',[company_id,key,value,value]);
    }
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});
router.post('/contact-queries', async (req, res) => {
  try{
    const {name,email,message}=req.body;
    await query('INSERT INTO app_settings (company_id,setting_key,setting_value) VALUES (0,?,?)',[`contact_query_${Date.now()}`,JSON.stringify({name,email,message,timestamp:new Date().toISOString()})]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
