const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM tally_imports WHERE company_id=? ORDER BY imported_at DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/process', auth, async (req, res) => {
  try{
    const {company_id,file_name,import_type,records}=req.body;
    const r=await query('INSERT INTO tally_imports (company_id,file_name,import_type,status,records_imported) VALUES (?,?,?,"completed",?)',[company_id,file_name||'import.xml',import_type||'xml',records?.length||0]);
    res.status(201).json({id:r.insertId,records_imported:records?.length||0});
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
