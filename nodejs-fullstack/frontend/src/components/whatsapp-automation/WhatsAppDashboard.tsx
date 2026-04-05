import { MessageCircle, Send, BarChart2, Clock } from 'lucide-react';

const STATS = [
  { label: 'Messages Sent', value: 142, color: 'text-green-400', bg: 'bg-green-900/20' },
  { label: 'Pending', value: 8, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  { label: 'Failed', value: 2, color: 'text-red-400', bg: 'bg-red-900/20' },
  { label: 'Scheduled', value: 5, color: 'text-blue-400', bg: 'bg-blue-900/20' },
];

const RECENT = [
  { to: 'Ravi Traders', type: 'Invoice', status: 'delivered', time: '10 min ago' },
  { to: 'Sharma Ent.', type: 'Payment Reminder', status: 'delivered', time: '1h ago' },
  { to: 'Kumar & Co', type: 'Ledger Summary', status: 'sent', time: '3h ago' },
  { to: 'Patel Bros', type: 'Invoice', status: 'failed', time: '5h ago' },
];

export default function WhatsAppDashboard({ company }: { company?: any }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2"><MessageCircle size={20} className="text-green-400" /><h2 className="text-lg font-semibold">WhatsApp Automation Dashboard</h2></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map(s => (
          <div key={s.label} className={`rounded-lg p-4 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Messages</h3>
        <div className="rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-400">Recipient</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400">Type</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400">Status</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400"><Clock size={12} className="inline" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {RECENT.map((r, i) => (
                <tr key={i} className="hover:bg-gray-800/40">
                  <td className="py-2 px-3">{r.to}</td>
                  <td className="py-2 px-3">
                    <span className="flex items-center gap-1"><Send size={12} className="text-green-400" /> {r.type}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === 'delivered' ? 'bg-green-900/40 text-green-400' :
                      r.status === 'sent' ? 'bg-blue-900/40 text-blue-400' :
                      'bg-red-900/40 text-red-400'
                    }`}>{r.status}</span>
                  </td>
                  <td className="py-2 px-3 text-gray-500 text-xs">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-gray-800/40 rounded-lg p-3">
        <p className="text-xs text-gray-400">Configure your WhatsApp Business API key in <span className="text-indigo-400">Settings → Integrations → WhatsApp</span> to enable sending.</p>
      </div>
    </div>
  );
}
