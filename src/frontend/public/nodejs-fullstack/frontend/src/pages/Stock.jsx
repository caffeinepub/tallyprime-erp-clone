import React from 'react';
import Sidebar from '../components/Sidebar';
export default function Stock() {
  return <div style={{display:'flex'}}><Sidebar /><div className="hk-main"><h1 style={{fontSize:18,fontWeight:700,color:'#1e1b4b'}}>Inventory</h1><p style={{color:'#64748b',marginTop:8,fontSize:13}}>Stock groups, items, vouchers, and summary reports. All endpoints available via /api/stock/*</p></div></div>;
}
