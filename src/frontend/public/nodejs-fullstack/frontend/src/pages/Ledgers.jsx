import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ledgers as ledgersApi } from '../apiClient';
import Sidebar from '../components/Sidebar';

export default function Ledgers() {
  const cid = localStorage.getItem('hk_company_id') || 1;
  const qc = useQueryClient();
  const { data: groups = [] } = useQuery({ queryKey: ['ledger-groups'], queryFn: () => ledgersApi.groups() });
  const { data: list = [] } = useQuery({ queryKey: ['ledgers', cid], queryFn: () => ledgersApi.list(cid) });
  const { data: tb = [] } = useQuery({ queryKey: ['trial-balance', cid], queryFn: () => ledgersApi.trialBalance(cid) });
  const [form, setForm] = useState({ name:'', group_id:'', opening_balance:0, balance_type:'Dr' });
  const createMut = useMutation({ mutationFn: (d) => ledgersApi.create({ ...d, company_id: cid }), onSuccess: () => { qc.invalidateQueries(['ledgers', cid]); qc.invalidateQueries(['trial-balance', cid]); setForm({name:'',group_id:'',opening_balance:0,balance_type:'Dr'}); } });

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <div className="hk-main">
        <h1 style={{fontSize:18,fontWeight:700,color:'#1e1b4b',marginBottom:20}}>Ledger Masters</h1>
        <div className="hk-card" style={{marginBottom:20}}>
          <h3 style={{fontSize:13,fontWeight:600,marginBottom:12}}>Create Ledger</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr auto',gap:12,alignItems:'end'}}>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Name</label><input className="hk-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Group</label>
              <select className="hk-input" value={form.group_id} onChange={e=>setForm(p=>({...p,group_id:e.target.value}))}>
                <option value="">Select Group</option>
                {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Opening Balance</label><input className="hk-input" type="number" value={form.opening_balance} onChange={e=>setForm(p=>({...p,opening_balance:e.target.value}))} /></div>
            <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Type</label>
              <select className="hk-input" value={form.balance_type} onChange={e=>setForm(p=>({...p,balance_type:e.target.value}))}><option value="Dr">Dr</option><option value="Cr">Cr</option></select>
            </div>
            <button className="hk-btn hk-btn-primary" onClick={()=>createMut.mutate(form)} disabled={!form.name||!form.group_id}>Create</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div className="hk-card">
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:12}}>Ledger List ({list.length})</h3>
            <table><thead><tr><th>Name</th><th>Group</th><th>Balance</th></tr></thead><tbody>
              {list.map(l=><tr key={l.id}><td>{l.name}</td><td style={{fontSize:11,color:'#64748b'}}>{l.group_name}</td><td style={{textAlign:'right'}}>₹{Number(l.opening_balance).toLocaleString('en-IN')} {l.balance_type}</td></tr>)}
            </tbody></table>
          </div>
          <div className="hk-card">
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:12}}>Trial Balance</h3>
            <table><thead><tr><th>Ledger</th><th>Debit</th><th>Credit</th></tr></thead><tbody>
              {tb.map((r,i)=><tr key={i}><td>{r.ledger_name}</td><td style={{textAlign:'right',color:'#059669'}}>₹{Number(r.debit_total||0).toLocaleString('en-IN')}</td><td style={{textAlign:'right',color:'#dc2626'}}>₹{Number(r.credit_total||0).toLocaleString('en-IN')}</td></tr>)}
            </tbody></table>
          </div>
        </div>
      </div>
    </div>
  );
}
