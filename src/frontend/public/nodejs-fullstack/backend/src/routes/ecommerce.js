const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');
const { publishToQueue, QUEUES } = require('../database/rabbitmq');

router.get('/orders', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM ecommerce_orders WHERE company_id=? ORDER BY order_date DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/orders', auth, async (req, res) => {
  try{
    const {company_id,platform,order_number,order_date,customer_name,amount,items}=req.body;
    const r=await query('INSERT INTO ecommerce_orders (company_id,platform,order_number,order_date,customer_name,amount,items) VALUES (?,?,?,?,?,?,?)',[company_id,platform,order_number,order_date,customer_name,amount,JSON.stringify(items||[])]);
    await publishToQueue(QUEUES.SYNC,{type:'ecommerce_order',orderId:r.insertId,company_id});
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/orders/:id/convert', auth, async (req, res) => {
  try{await query('UPDATE ecommerce_orders SET status="converted" WHERE id=?',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
