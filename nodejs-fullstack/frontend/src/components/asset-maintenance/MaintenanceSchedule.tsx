import { useState } from 'react';
import { Plus, Wrench, Calendar, CheckCircle } from 'lucide-react';

const SAMPLE = [
  { id: 1, asset: 'Generator', schedule: 'Monthly', next_due: '2026-05-01', status: 'Upcoming' },
  { id: 2, asset: 'AC Unit - Office', schedule: 'Quarterly', next_due: '2026-06-15', status: 'Upcoming' },
  { id: 3, asset: 'Elevator', schedule: 'Annual', next_due: '2026-04-10', status: 'Overdue' },
];

export default function MaintenanceSchedule({ company }: { company?: any }) {
  const [items, setItems] = useState(SAMPLE);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset: '', schedule: 'Monthly', next_due: '' });

  const add = () => {
    if (!form.asset || !form.next_due) return;
    setItems(prev => [...prev, { id: Date.now(), ...form, status: 'Upcoming' }]);
    setForm({ asset: '', schedule: 'Monthly', next_due: '' });
    setShowForm(false);
  };

  const markDone = (id: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'Completed' } : i));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Wrench size={20} className="text-orange-400" /><h2 className="text-lg font-semibold">Maintenance Schedule</h2></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm">
          <Plus size={14} /> Add Schedule
        </button>
      </div>
      {showForm && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <input className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm" placeholder="Asset name" value={form.asset} onChange={e => setForm(p => ({...p, asset: e.target.value}))} />
          <select className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm" value={form.schedule} onChange={e => setForm(p => ({...p, schedule: e.target.value}))}>
            {['Weekly','Monthly','Quarterly','Annual'].map(s => <option key={s}>{s}</option>)}
          </select>
          <input type="date" className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm" value={form.next_due} onChange={e => setForm(p => ({...p, next_due: e.target.value}))} />
          <div className="flex gap-2">
            <button onClick={add} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-gray-800/60 rounded-lg px-4 py-3">
            <div>
              <p className="font-medium text-sm">{item.asset}</p>
              <p className="text-xs text-gray-400"><Calendar size={10} className="inline mr-1" />{item.schedule} — Next: {item.next_due}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${ item.status === 'Overdue' ? 'bg-red-900/40 text-red-400' : item.status === 'Completed' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>{item.status}</span>
              {item.status !== 'Completed' && (
                <button onClick={() => markDone(item.id)} className="p-1 hover:text-green-400"><CheckCircle size={16} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
