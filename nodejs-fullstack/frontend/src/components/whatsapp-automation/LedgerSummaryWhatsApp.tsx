import { useState } from 'react';
import { Send, User, Search } from 'lucide-react';

const LEDGERS = [
  { id: 1, name: 'Ravi Traders', phone: '+919876543210', balance: 45000, type: 'Debtor' },
  { id: 2, name: 'Sharma Enterprises', phone: '+919823456789', balance: -12000, type: 'Creditor' },
  { id: 3, name: 'Kumar & Co', phone: '+919911223344', balance: 78000, type: 'Debtor' },
];

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(n));
}

export default function LedgerSummaryWhatsApp({ company }: { company?: any }) {
  const [search, setSearch] = useState('');
  const [sent, setSent] = useState<Set<number>>(new Set());
  const filtered = LEDGERS.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  const sendSummary = (id: number) => {
    setSent(prev => new Set([...prev, id]));
    setTimeout(() => setSent(prev => { const s = new Set(prev); s.delete(id); return s; }), 3000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2"><Send size={20} className="text-green-400" /><h2 className="text-lg font-semibold">Ledger Summary via WhatsApp</h2></div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" placeholder="Search ledger..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="space-y-2">
        {filtered.map(l => (
          <div key={l.id} className="flex items-center justify-between bg-gray-800/60 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center">
                <User size={16} className="text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-medium">{l.name}</p>
                <p className="text-xs text-gray-400">{l.phone} · {l.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-mono ${l.balance >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {fmt(l.balance)} {l.balance >= 0 ? 'Dr' : 'Cr'}
              </span>
              <button onClick={() => sendSummary(l.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  sent.has(l.id) ? 'bg-green-700/40 text-green-300' : 'bg-green-600 hover:bg-green-700 text-white'
                }`}>
                {sent.has(l.id) ? '✓ Sent' : <><Send size={12} /> Send</>}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Requires WhatsApp Business API key in settings.</p>
    </div>
  );
}
