const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/masters', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM service_masters WHERE company_id=? ORDER BY name',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/masters', auth, async (req, res) => {
  try{
    const {company_id,name,category,rate,gst_rate,hsn_code}=req.body;
    const r=await query('INSERT INTO service_masters (company_id,name,category,rate,gst_rate,hsn_code) VALUES (?,?,?,?,?,?)',[company_id,name,category,rate||0,gst_rate||0,hsn_code]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/orders', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT so.*,sm.name as service_name,c.name as customer_name FROM service_orders so LEFT JOIN service_masters sm ON so.service_id=sm.id LEFT JOIN customers c ON so.customer_id=c.id WHERE so.company_id=? ORDER BY so.date DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/orders', auth, async (req, res) => {
  try{
    const {company_id,service_id,customer_id,order_number,date,priority,estimated_amount,notes}=req.body;
    const r=await query('INSERT INTO service_orders (company_id,service_id,customer_id,order_number,date,priority,estimated_amount,notes) VALUES (?,?,?,?,?,?,?,?)',[company_id,service_id,customer_id,order_number,date,priority||'medium',estimated_amount,notes]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/orders/:id/status', auth, async (req, res) => {
  try{await query('UPDATE service_orders SET status=? WHERE id=?',[req.body.status,req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
router.get('/tickets', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM service_tickets WHERE company_id=? ORDER BY created_at DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/tickets', auth, async (req, res) => {
  try{
    const {company_id,order_id,title,description,assigned_to}=req.body;
    const r=await query('INSERT INTO service_tickets (company_id,order_id,title,description,assigned_to) VALUES (?,?,?,?,?)',[company_id,order_id,title,description,assigned_to]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/tickets/:id/status', auth, async (req, res) => {
  try{await query('UPDATE service_tickets SET status=? WHERE id=?',[req.body.status,req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
