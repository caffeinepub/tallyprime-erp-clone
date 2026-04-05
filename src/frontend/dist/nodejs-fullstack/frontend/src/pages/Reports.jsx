import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reports as rApi } from '../apiClient';
import Sidebar from '../components/Sidebar';

export default function Reports() {
  const cid = localStorage.getItem('hk_company_id') || 1;
  const fd = '2024-04-01', td = '2025-03-31';
  const { data: bs = [] } = useQuery({ queryKey: ['balance-sheet', cid], queryFn: () => rApi.balanceSheet(cid) });
  const { data: pl = [] } = useQuery({ queryKey: ['pl', cid], queryFn: () => rApi.profitLoss({ company_id:cid, from_date:fd, to_date:td }) });
  const assets = bs.filter(r => r.nature === 'Asset');
  const liabilities = bs.filter(r => r.nature === 'Liability');
  const income = pl.filter(r => r.nature === 'Income');
  const expenses = pl.filter(r => r.nature === 'Expense');
  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <div className="hk-main">
        <h1 style={{fontSize:18,fontWeight:700,color:'#1e1b4b',marginBottom:20}}>Financial Reports</h1>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div className="hk-card">
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:12,color:'#1e1b4b'}}>Balance Sheet</h3>
            <div style={{fontWeight:600,fontSize:12,color:'#059669',marginBottom:8}}>Assets</div>
            {assets.map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'4px 0',borderBottom:'1px solid #f1f5f9'}}><span>{r.ledger_name}</span><span>₹{Number(r.opening_balance||0).toLocaleString('en-IN')}</span></div>)}
            <div style={{fontWeight:600,fontSize:12,color:'#dc2626',marginBottom:8,marginTop:12}}>Liabilities</div>
            {liabilities.map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'4px 0',borderBottom:'1px solid #f1f5f9'}}><span>{r.ledger_name}</span><span>₹{Number(r.opening_balance||0).toLocaleString('en-IN')}</span></div>)}
          </div>
          <div className="hk-card">
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:12,color:'#1e1b4b'}}>P&amp;L Statement</h3>
            <div style={{fontWeight:600,fontSize:12,color:'#059669',marginBottom:8}}>Income</div>
            {income.map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'4px 0',borderBottom:'1px solid #f1f5f9'}}><span>{r.ledger_name}</span><span style={{color:'#059669'}}>₹{Number(r.amount||0).toLocaleString('en-IN')}</span></div>)}
            <div style={{fontWeight:600,fontSize:12,color:'#dc2626',marginBottom:8,marginTop:12}}>Expenses</div>
            {expenses.map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'4px 0',borderBottom:'1px solid #f1f5f9'}}><span>{r.ledger_name}</span><span style={{color:'#dc2626'}}>₹{Number(r.amount||0).toLocaleString('en-IN')}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
