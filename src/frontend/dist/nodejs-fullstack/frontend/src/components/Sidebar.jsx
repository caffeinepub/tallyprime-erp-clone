import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const nav = [
  { path:'/', label:'Dashboard', icon:'📊' },
  { path:'/ledgers', label:'Ledgers', icon:'📒' },
  { path:'/vouchers', label:'Entries', icon:'📝' },
  { path:'/gst', label:'GST', icon:'🇮🇳' },
  { path:'/stock', label:'Inventory', icon:'📦' },
  { path:'/payroll', label:'Payroll', icon:'💰' },
  { path:'/banking', label:'Banking', icon:'🏦' },
  { path:'/reports', label:'Reports', icon:'📈' },
  { path:'/analytics', label:'Analytics', icon:'🔍' },
  { path:'/settings', label:'Settings', icon:'⚙️' },
];

export default function Sidebar() {
  const loc = useLocation();
  return (
    <div className="hk-sidebar">
      <div style={{padding:'20px 16px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{fontWeight:700,fontSize:15,color:'#a5b4fc'}}>HisabKitab Pro</div>
        <div style={{fontSize:10,color:'#64748b',marginTop:2}}>Node.js + MySQL Edition</div>
      </div>
      {nav.map(n => (
        <Link key={n.path} to={n.path} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',fontSize:12,color:loc.pathname===n.path?'#a5b4fc':'#cbd5e1',background:loc.pathname===n.path?'rgba(99,102,241,0.2)':'transparent',borderLeft:loc.pathname===n.path?'3px solid #6366f1':'3px solid transparent',transition:'all 0.15s'}}>
          <span>{n.icon}</span><span>{n.label}</span>
        </Link>
      ))}
      <div style={{padding:'16px',fontSize:10,color:'#475569',borderTop:'1px solid rgba(255,255,255,0.05)',marginTop:'auto',position:'absolute',bottom:0,left:0,right:0}}>
        This project is independently developed and not affiliated with Tally Solutions.
      </div>
    </div>
  );
}
