import React from 'react';
import Sidebar from '../components/Sidebar';
export default function GST() {
  return <div style={{display:'flex'}}><Sidebar /><div className="hk-main"><h1 style={{fontSize:18,fontWeight:700,color:'#1e1b4b'}}>GST</h1><p style={{color:'#64748b',marginTop:8,fontSize:13}}>GST settings, vouchers, GSTR-1, GSTR-3B. All endpoints via /api/gst/*</p></div></div>;
}
