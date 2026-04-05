import { MessageSquare, CheckSquare, LayoutDashboard } from 'lucide-react';

export default function CollaborationDashboard({ company }: { company?: any }) {
  const stats = [
    { label: 'Open Tasks', value: 4, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
    { label: 'Completed Tasks', value: 12, color: 'text-green-400', bg: 'bg-green-900/20' },
    { label: 'Entry Comments', value: 7, color: 'text-blue-400', bg: 'bg-blue-900/20' },
  ];
  const recent = [
    { type: 'comment', text: 'Reviewed Q4 sales entry #1042', user: 'Accountant', time: '2h ago' },
    { type: 'task', text: 'Reconcile bank statement for March', user: 'Admin', time: '1d ago' },
    { type: 'comment', text: 'GST voucher #205 approved', user: 'Auditor', time: '2d ago' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2"><LayoutDashboard size={20} className="text-indigo-400" /><h2 className="text-lg font-semibold">Collaboration Dashboard</h2></div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-lg p-4 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recent.map((r, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-gray-800/50 rounded-lg">
              {r.type === 'comment' ? <MessageSquare size={16} className="text-blue-400 mt-0.5 flex-shrink-0" /> : <CheckSquare size={16} className="text-green-400 mt-0.5 flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-sm">{r.text}</p>
                <p className="text-xs text-gray-500">{r.user} · {r.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
