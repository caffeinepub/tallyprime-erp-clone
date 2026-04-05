const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');

router.get('/eway-bills', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM eway_bills WHERE company_id=? ORDER BY date DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/eway-bills', auth, async (req, res) => {
  try{
    const {company_id,voucher_id,bill_number,date,vehicle_number,from_place,to_place}=req.body;
    const r=await query('INSERT INTO eway_bills (company_id,voucher_id,bill_number,date,vehicle_number,from_place,to_place) VALUES (?,?,?,?,?,?,?)',[company_id,voucher_id||null,bill_number||`EWB${Date.now()}`,date,vehicle_number,from_place,to_place]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
router.put('/eway-bills/:id/cancel', auth, async (req, res) => {
  try{await query('UPDATE eway_bills SET status="cancelled" WHERE id=?',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
router.get('/einvoices', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM einvoices WHERE company_id=? ORDER BY generated_at DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/einvoices', auth, async (req, res) => {
  try{
    const {company_id,voucher_id}=req.body;
    const irn=`IRN${Date.now()}${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    const r=await query('INSERT INTO einvoices (company_id,voucher_id,irn) VALUES (?,?,?)',[company_id,voucher_id||null,irn]);
    res.status(201).json({id:r.insertId,irn});
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/filing-history', auth, async (req, res) => {
  try{const {company_id}=req.query;res.json(await query('SELECT * FROM gst_filing_history WHERE company_id=? ORDER BY filing_date DESC',[company_id]));}catch(e){res.status(500).json({error:e.message});}
});
router.post('/filing-history', auth, async (req, res) => {
  try{
    const {company_id,return_type,period,filing_date,status,arn}=req.body;
    const r=await query('INSERT INTO gst_filing_history (company_id,return_type,period,filing_date,status,arn) VALUES (?,?,?,?,?,?)',[company_id,return_type,period,filing_date,status||'filed',arn]);
    res.status(201).json({id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
