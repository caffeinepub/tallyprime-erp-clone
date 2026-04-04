const jwt=require('jsonwebtoken'),db=require('../database/db');
const authenticate=async(req,res,next)=>{const auth=req.headers.authorization;if(!auth||!auth.startsWith('Bearer '))return res.status(401).json({error:'No token'});try{const d=jwt.verify(auth.split(' ')[1],process.env.JWT_SECRET||'secret');const[r]=await db.query('SELECT * FROM users WHERE id=? AND is_active=1',[d.id]);if(!r.length)return res.status(401).json({error:'User not found'});req.user=r[0];next();}catch{res.status(401).json({error:'Invalid token'});}}
const requireAdmin=(req,res,next)=>{if(req.user?.role!=='admin')return res.status(403).json({error:'Admin required'});next();};
const requireAccountant=(req,res,next)=>{if(!['admin','accountant'].includes(req.user?.role))return res.status(403).json({error:'Accountant role required'});next();};
const auditLog=async(req,action,entity,entityId,details)=>{try{await db.query('INSERT INTO audit_log(username,action,entity,entity_id,details,ip_address)VALUES(?,?,?,?,?,?)',[req.user?.username||'system',action,entity,entityId||null,JSON.stringify(details||{}),req.ip]);}catch{}};
module.exports={authenticate,requireAdmin,requireAccountant,auditLog};
