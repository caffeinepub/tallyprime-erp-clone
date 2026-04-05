const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { publishToQueue, QUEUES } = require('../database/rabbitmq');

router.post('/suggest-ledger', auth, async (req, res) => {
  try{
    const {narration}=req.body;const s=narration?.toLowerCase();
    const suggestions=s?.includes('salary')?['Salary Payable','Employee Expenses']:s?.includes('rent')?['Rent Expense','Prepaid Rent']:['Sundry Expenses','Miscellaneous Expenses'];
    res.json({suggestions});
  }catch(e){res.status(500).json({error:e.message});}
});
router.post('/detect-anomaly', auth, async (req, res) => {
  try{await publishToQueue(QUEUES.REPORTS,{type:'anomaly_check',...req.body});res.json({status:'queued',message:'Queued for async processing'});}catch(e){res.status(500).json({error:e.message});}
});
router.post('/generate-narration', auth, async (req, res) => {
  try{
    const {voucher_type,amount,party}=req.body;
    res.json({narrations:[`Being ${voucher_type?.toLowerCase()} of \u20b9${Number(amount).toLocaleString('en-IN')} ${party?`to/from ${party}`:''}`,`${voucher_type} transaction \u20b9${Number(amount).toLocaleString('en-IN')}`,`As per books \u2014 ${voucher_type} \u20b9${Number(amount).toLocaleString('en-IN')}`]});
  }catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
