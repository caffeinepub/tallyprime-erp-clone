const express = require('express');
const router = express.Router();
const { getSQLiteDB } = require('../database/sqlite');
const { auth } = require('../middleware/auth');
const { query, isMySQL } = require('../database/db');

router.get('/offline-queue', auth, async (req, res) => {
  try{const db=getSQLiteDB();if(!db)return res.json([]);res.json(db.prepare('SELECT * FROM offline_queue WHERE synced=0 ORDER BY created_at').all());}catch(e){res.status(500).json({error:e.message});}
});
router.post('/sync-voucher', auth, async (req, res) => {
  try{
    const {company_id,voucher_type,voucher_number,date,narration,entries,offline_id}=req.body;
    const r=await query('INSERT INTO vouchers (company_id,voucher_type,voucher_number,date,narration) VALUES (?,?,?,?,?)',[company_id,voucher_type,voucher_number,date,narration]);
    const vid=r.insertId;
    if(entries?.length){for(const e of entries){await query('INSERT INTO voucher_entries (voucher_id,ledger_id,entry_type,amount) VALUES (?,?,?,?)',[vid,e.ledger_id,e.entry_type,e.amount]);}}
    const db=getSQLiteDB();
    if(db&&offline_id) db.prepare('UPDATE offline_queue SET synced=1,synced_at=CURRENT_TIMESTAMP WHERE id=?').run(offline_id);
    res.json({synced:true,mysql_id:vid});
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/status', async (req, res) => {
  res.json({online:isMySQL(),sqlite_active:!!getSQLiteDB()});
});
module.exports = router;
