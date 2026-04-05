const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try{
    const {company_id,limit,action,entity_type}=req.query;
    let sql='SELECT * FROM audit_log WHERE 1=1';const params=[];
    if(company_id){sql+=' AND company_id=?';params.push(company_id);}
    if(action){sql+=' AND action=?';params.push(action);}
    if(entity_type){sql+=' AND entity_type=?';params.push(entity_type);}
    sql+=` ORDER BY timestamp DESC LIMIT ${parseInt(limit)||500}`;
    res.json(await query(sql,params));
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
