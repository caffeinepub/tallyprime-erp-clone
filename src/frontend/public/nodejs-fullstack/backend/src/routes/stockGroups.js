const router=require('express').Router(),db=require('../database/db'),{authenticate}=require('../middleware/auth');
router.get('/',authenticate,async(req,res)=>{const[r]=await db.query('SELECT * FROM stock_groups ORDER BY id');res.json(r);});
router.post('/',authenticate,async(req,res)=>{const{name,parentGroupId,unit}=req.body;const[r]=await db.query('INSERT INTO stock_groups(name,parent_group_id,unit)VALUES(?,?,?)',[name,parentGroupId||null,unit]);const[rows]=await db.query('SELECT * FROM stock_groups WHERE id=?',[r.insertId]);res.json(rows[0]);});
router.put('/:id',authenticate,async(req,res)=>{const{name,parentGroupId,unit}=req.body;await db.query('UPDATE stock_groups SET name=?,parent_group_id=?,unit=? WHERE id=?',[name,parentGroupId||null,unit,req.params.id]);const[r]=await db.query('SELECT * FROM stock_groups WHERE id=?',[req.params.id]);res.json(r[0]);});
router.delete('/:id',authenticate,async(req,res)=>{await db.query('DELETE FROM stock_groups WHERE id=?',[req.params.id]);res.json({message:'Deleted'});});
module.exports=router;
