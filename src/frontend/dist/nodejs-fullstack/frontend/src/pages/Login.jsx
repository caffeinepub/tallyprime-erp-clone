import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await login(form.username, form.password); nav('/'); }
    catch { setErr('Invalid credentials. Default: admin / admin123'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)'}}>
      <div style={{background:'white',borderRadius:12,padding:40,width:360,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#1e1b4b',marginBottom:4}}>HisabKitab Pro</h1>
        <p style={{fontSize:12,color:'#64748b',marginBottom:28}}>Complete ERP — Node.js Edition</p>
        <form onSubmit={submit}>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:500,marginBottom:6,color:'#374151'}}>Username</label>
            <input className="hk-input" value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} required />
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:12,fontWeight:500,marginBottom:6,color:'#374151'}}>Password</label>
            <input className="hk-input" type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required />
          </div>
          {err && <p style={{color:'#ef4444',fontSize:12,marginBottom:16}}>{err}</p>}
          <button className="hk-btn hk-btn-primary" style={{width:'100%',padding:10}} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{fontSize:11,color:'#94a3b8',marginTop:20,textAlign:'center'}}>Default: admin / admin123</p>
      </div>
    </div>
  );
}
