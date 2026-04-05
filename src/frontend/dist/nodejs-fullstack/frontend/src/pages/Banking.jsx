import React from 'react';
import Sidebar from '../components/Sidebar';
export default function Banking() {
  return <div style={{display:'flex'}}><Sidebar /><div className="hk-main"><h1 style={{fontSize:18,fontWeight:700,color:'#1e1b4b'}}>Banking</h1><p style={{color:'#64748b',marginTop:8,fontSize:13}}>Bank accounts, transactions, reconciliation, cheques, UPI. All endpoints via /api/banking/* and /api/cheques/*</p></div></div>;
}
