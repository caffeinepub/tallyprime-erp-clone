import React from 'react';
import Sidebar from '../components/Sidebar';
export default function Settings() {
  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <div className="hk-main">
        <h1 style={{fontSize:18,fontWeight:700,color:'#1e1b4b',marginBottom:20}}>Settings</h1>
        <div className="hk-card">
          <h3 style={{fontSize:13,fontWeight:600,marginBottom:12}}>Available API Modules</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {['auth','companies','ledgers','vouchers','gst','stock','payroll','hr','banking','cheques','fixed-assets','asset-maintenance','cost-centres','currencies','reports','budgets','customers','vendors','orders','crm','pos','branches','service','subscriptions','compliance','projects','analytics','notifications','rule-engine','event-ledger','maker-checker','collaboration','ecommerce','whatsapp','customization','tally-import','ai-tools','settings','data-management','audit-log','sync'].map(m=>(
              <div key={m} style={{padding:'6px 10px',background:'#f8fafc',borderRadius:4,fontSize:11,color:'#374151',border:'1px solid #e2e8f0'}}>/api/{m}</div>
            ))}
          </div>
        </div>
        <div className="hk-card">
          <h3 style={{fontSize:13,fontWeight:600,marginBottom:12}}>Stack</h3>
          <table><tbody>
            {[['Backend','Node.js + Express'],['Primary DB','MySQL (online)'],['Offline DB','SQLite (auto-fallback when MySQL offline)'],['Cache','Redis (TTL-based, degrades gracefully if offline)'],['Queue','RabbitMQ (WHATSAPP, REPORTS, SYNC queues)'],['Frontend','React + Vite + Lazy Loading + React Query'],['Auth','JWT Bearer tokens, 24h expiry'],['Login','admin / admin123']].map(([k,v])=>(
              <tr key={k}><td style={{fontWeight:500,padding:'6px 0',width:180,fontSize:12}}>{k}</td><td style={{fontSize:12,color:'#64748b'}}>{v}</td></tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}
