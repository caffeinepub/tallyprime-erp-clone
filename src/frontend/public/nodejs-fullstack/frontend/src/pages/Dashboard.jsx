import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analytics, notifications } from '../apiClient';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const cid = localStorage.getItem('hk_company_id') || 1;
  const { data: kpi = {} } = useQuery({ queryKey: ['kpi', cid], queryFn: () => analytics.kpi(cid) });
  const { data: alerts = [] } = useQuery({ queryKey: ['alerts', cid], queryFn: () => notifications.smartAlerts(cid) });

  const tiles = [
    { label: 'Ledgers', value: kpi.ledgers || 0, color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Entries', value: kpi.vouchers || 0, color: '#0891b2', bg: '#e0f2fe' },
    { label: 'Customers', value: kpi.customers || 0, color: '#059669', bg: '#d1fae5' },
    { label: 'Employees', value: kpi.employees || 0, color: '#d97706', bg: '#fef3c7' },
  ];

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <div className="hk-main">
        <h1 style={{fontSize:20,fontWeight:700,color:'#1e1b4b',marginBottom:4}}>Dashboard</h1>
        <p style={{fontSize:12,color:'#64748b',marginBottom:24}}>HisabKitab Pro — Node.js + MySQL + Redis + RabbitMQ</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {tiles.map(t => (
            <div key={t.label} className="hk-card" style={{background:t.bg,border:`1px solid ${t.color}22`}}>
              <div style={{fontSize:28,fontWeight:700,color:t.color}}>{t.value}</div>
              <div style={{fontSize:12,color:'#64748b',marginTop:4}}>{t.label}</div>
            </div>
          ))}
        </div>
        {alerts.length > 0 && (
          <div className="hk-card" style={{borderLeft:'4px solid #f59e0b'}}>
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:12,color:'#92400e'}}>Smart Alerts</h3>
            {alerts.map((a,i) => <div key={i} style={{fontSize:12,color:'#374151',padding:'6px 0',borderBottom:'1px solid #fef3c7'}}>{a.title}: {a.message}</div>)}
          </div>
        )}
        <div className="hk-card">
          <h3 style={{fontSize:13,fontWeight:600,marginBottom:12}}>Stack Info</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
            {[['Backend','Node.js + Express'],['Database (Online)','MySQL'],['Offline DB','SQLite (auto-fallback)'],['Caching','Redis'],['Message Queue','RabbitMQ'],['Frontend','React + Lazy Loading']].map(([k,v]) => (
              <div key={k} style={{padding:'8px 12px',background:'#f8fafc',borderRadius:6,fontSize:12}}>
                <span style={{color:'#64748b'}}>{k}: </span><span style={{fontWeight:500,color:'#1e1b4b'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
