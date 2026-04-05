import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vouchers as vApi, ledgers as lApi } from '../apiClient';
import Sidebar from '../components/Sidebar';

const TYPES = ['Payment','Receipt','Contra','Journal','Sales','Purchase'];

export default function Vouchers() {
  const cid = localStorage.getItem('hk_company_id') || 1;
  const qc = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const { data: list = [] } = useQuery({ queryKey: ['vouchers', cid], queryFn: () => vApi.list({ company_id: cid }) });
  const { data: ledgerList = [] } = useQuery({ queryKey: ['ledgers', cid], queryFn: () => lApi.list(cid) });
  const [form, setForm] = useState({ voucher_type: 'Payment', date: today, narration: '', entries: [{ledger_id:'',entry_type:'Dr',amount:''},{ledger_id:'',entry_type:'Cr',amount:''}] });
  const createMut = useMutation({ mutationFn: (d) => vApi.create({ ...d, company_id: cid, voucher_number: Date.now() }), onSuccess: () => qc.invalidateQueries(['vouchers', cid]) });

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <div className="hk-main">
        <h1 style={{fontSize:18,fontWeight:700,color:'#1e1b4b',marginBottom:20}}>Entries (Vouchers)</h1>
        <div className="hk-card" style={{marginBottom:20}}>
          <h3 style={{fontSize:13,fontWeight:600,marginBottom:12}}>New Entry</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 2fr',gap:12,marginBottom:12}}>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Type</label>
              <select className="hk-input" value={form.voucher_type} onChange={e=>setForm(p=>({...p,voucher_type:e.target.value}))}>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
            </div>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Date</label><input className="hk-input" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Narration</label><input className="hk-input" value={form.narration} onChange={e=>setForm(p=>({...p,narration:e.target.value}))} /></div>
          </div>
          {form.entries.map((en,i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:12,marginBottom:8}}>
              <select className="hk-input" value={en.ledger_id} onChange={e=>{const es=[...form.entries];es[i].ledger_id=e.target.value;setForm(p=>({...p,entries:es}));}}>
                <option value="">Select Ledger</option>
                {ledgerList.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select className="hk-input" style={{width:70}} value={en.entry_type} onChange={e=>{const es=[...form.entries];es[i].entry_type=e.target.value;setForm(p=>({...p,entries:es}));}}><option>Dr</option><option>Cr</option></select>
              <input className="hk-input" type="number" placeholder="Amount" value={en.amount} onChange={e=>{const es=[...form.entries];es[i].amount=e.target.value;setForm(p=>({...p,entries:es}));}} />
            </div>
          ))}
          <button className="hk-btn hk-btn-primary" onClick={()=>createMut.mutate(form)}>Save Entry</button>
        </div>
        <div className="hk-card">
          <h3 style={{fontSize:13,fontWeight:600,marginBottom:12}}>Recent Entries ({list.length})</h3>
          <table><thead><tr><th>Date</th><th>Type</th><th>Narration</th></tr></thead><tbody>
            {list.slice(0,50).map(v=><tr key={v.id}><td>{v.date}</td><td><span style={{background:'#eef2ff',color:'#4f46e5',padding:'2px 8px',borderRadius:4,fontSize:11}}>{v.voucher_type}</span></td><td style={{fontSize:11,color:'#64748b'}}>{v.narration||'—'}</td></tr>)}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}
