const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');
const { publishToQueue, QUEUES } = require('../database/rabbitmq');

router.get('/queue', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM whatsapp_queue WHERE company_id=? ORDER BY id DESC LIMIT 200',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/send', auth, async (req, res) => {
  try{
    const {company_id,phone,message,message_type,scheduled_at}=req.body;
    const r=await query('INSERT INTO whatsapp_queue (company_id,phone,message,message_type,scheduled_at) VALUES (?,?,?,?,?)',[company_id,phone,message,message_type||'custom',scheduled_at||null]);
    await publishToQueue(QUEUES.WHATSAPP,{id:r.insertId,phone,message,company_id});
    res.status(201).json({id:r.insertId,status:'queued'});
  }catch(e){res.status(500).json({error:e.message});}
});
router.post('/bulk-send', auth, async (req, res) => {
  try{
    const {company_id,phones,message,message_type}=req.body;
    const ids=[];
    for(const phone of phones){
      const r=await query('INSERT INTO whatsapp_queue (company_id,phone,message,message_type) VALUES (?,?,?,?)',[company_id,phone,message,message_type||'bulk']);
      await publishToQueue(QUEUES.WHATSAPP,{id:r.insertId,phone,message,company_id});
      ids.push(r.insertId);
    }
    res.json({queued:ids.length,ids});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/:id/retry', auth, async (req, res) => {
  try{
    const rows=await query('SELECT * FROM whatsapp_queue WHERE id=?',[req.params.id]);
    if(!rows[0]) return res.status(404).json({error:'Not found'});
    await query('UPDATE whatsapp_queue SET status="queued",error_message=NULL WHERE id=?',[req.params.id]);
    await publishToQueue(QUEUES.WHATSAPP,{id:rows[0].id,phone:rows[0].phone,message:rows[0].message,company_id:rows[0].company_id});
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
