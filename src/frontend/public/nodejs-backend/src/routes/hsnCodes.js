const router=require('express').Router(),db=require('../database/db'),{authenticate}=require('../middleware/auth');
router.get('/',authenticate,async(req,res)=>{const[r]=await db.query('SELECT * FROM hsn_codes ORDER BY id');res.json(r);});
router.post('/',authenticate,async(req,res)=>{const{code,description,gstRate}=req.body;try{const[r]=await db.query('INSERT INTO hsn_codes(code,description,gst_rate)VALUES(?,?,?)',[code,description,gstRate||0]);const[rows]=await db.query('SELECT * FROM hsn_codes WHERE id=?',[r.insertId]);res.json(rows[0]);}catch(e){res.status(400).json({error:e.message});}});
router.put('/:id',authenticate,async(req,res)=>{const{code,description,gstRate}=req.body;await db.query('UPDATE hsn_codes SET code=?,description=?,gst_rate=? WHERE id=?',[code,description,gstRate,req.params.id]);const[r]=await db.query('SELECT * FROM hsn_codes WHERE id=?',[req.params.id]);res.json(r[0]);});
router.delete('/:id',authenticate,async(req,res)=>{await db.query('DELETE FROM hsn_codes WHERE id=?',[req.params.id]);res.json({message:'Deleted'});});
module.exports=router;
