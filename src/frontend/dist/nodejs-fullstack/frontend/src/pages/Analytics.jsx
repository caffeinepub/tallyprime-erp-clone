import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analytics as aApi } from '../apiClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../components/Sidebar';

const COLORS = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed'];

export default function Analytics() {
  const cid = localStorage.getItem('hk_company_id') || 1;
  const { data: pl = [] } = useQuery({ queryKey: ['pl-trend', cid], queryFn: () => aApi.plTrend(cid) });
  const { data: exp = [] } = useQuery({ queryKey: ['exp-breakdown', cid], queryFn: () => aApi.expenseBreakdown({ company_id: cid, from_date: '2024-04-01', to_date: '2025-03-31' }) });
  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <div className="hk-main">
        <h1 style={{fontSize:18,fontWeight:700,color:'#1e1b4b',marginBottom:20}}>Analytics</h1>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div className="hk-card">
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:16}}>P&amp;L Trend (12 Months)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pl}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{fontSize:10}} /><YAxis tick={{fontSize:10}} /><Tooltip /><Bar dataKey="income" fill="#059669" /><Bar dataKey="expense" fill="#dc2626" /></BarChart>
            </ResponsiveContainer>
          </div>
          <div className="hk-card">
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:16}}>Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={exp} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({category})=>category}>{exp.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
