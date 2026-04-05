import { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ALERTS = [
  { id: 1, type: 'error', title: 'GSTR-1 Overdue', msg: 'Filing due for February 2026 is overdue by 5 days.', date: '2026-03-16' },
  { id: 2, type: 'warn', title: 'GSTR-3B Due Soon', msg: 'GSTR-3B for March 2026 is due in 3 days (20 Apr).', date: '2026-04-17' },
  { id: 3, type: 'info', title: 'Annual Return Reminder', msg: 'GSTR-9 deadline is 31 December 2026.', date: '2026-04-01' },
  { id: 4, type: 'success', title: 'GSTR-1 Filed', msg: 'January 2026 GSTR-1 was filed successfully.', date: '2026-02-11' },
];

export default function FilingAlertsDashboard({ company }: { company?: any }) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const visible = ALERTS.filter(a => !dismissed.has(a.id));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2"><Bell size={20} className="text-yellow-400" /><h2 className="text-lg font-semibold">GST Filing Alerts</h2></div>
      {visible.length === 0 && <p className="text-sm text-gray-500 py-8 text-center">No active alerts.</p>}
      <div className="space-y-3">
        {visible.map(a => (
          <div key={a.id} className={`flex gap-3 p-4 rounded-lg border ${
            a.type === 'error' ? 'border-red-800/50 bg-red-900/10' :
            a.type === 'warn' ? 'border-yellow-800/50 bg-yellow-900/10' :
            a.type === 'success' ? 'border-green-800/50 bg-green-900/10' :
            'border-blue-800/50 bg-blue-900/10'
          }`}>
            <div className="mt-0.5 flex-shrink-0">
              {a.type === 'error' ? <AlertTriangle size={18} className="text-red-400" /> :
               a.type === 'warn' ? <Clock size={18} className="text-yellow-400" /> :
               a.type === 'success' ? <CheckCircle size={18} className="text-green-400" /> :
               <Bell size={18} className="text-blue-400" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{a.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.msg}</p>
              <p className="text-xs text-gray-500 mt-1">{a.date}</p>
            </div>
            <button onClick={() => setDismissed(p => new Set([...p, a.id]))} className="text-gray-500 hover:text-gray-300 text-xs self-start">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
