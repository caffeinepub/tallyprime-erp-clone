import React from 'react';
import Sidebar from '../components/Sidebar';
export default function Payroll() {
  return <div style={{display:'flex'}}><Sidebar /><div className="hk-main"><h1 style={{fontSize:18,fontWeight:700,color:'#1e1b4b'}}>Payroll</h1><p style={{color:'#64748b',marginTop:8,fontSize:13}}>Employee master, salary structures, payroll vouchers, salary slips. All endpoints via /api/payroll/*</p></div></div>;
}
