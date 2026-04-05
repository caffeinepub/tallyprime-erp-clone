import { useState } from 'react';
import { CheckSquare, Square, AlertTriangle, CheckCircle } from 'lucide-react';

const CHECKLIST = [
  { id: 1, category: 'GST', task: 'GSTR-1 filed for last month', due: '11th of next month' },
  { id: 2, category: 'GST', task: 'GSTR-3B filed for last month', due: '20th of next month' },
  { id: 3, category: 'TDS', task: 'TDS deposited for last quarter', due: '7th of next month' },
  { id: 4, category: 'TDS', task: 'TDS return (24Q/26Q) filed', due: '31st of next quarter' },
  { id: 5, category: 'Income Tax', task: 'Advance tax payment', due: 'Quarterly' },
  { id: 6, category: 'ROC', task: 'Annual return filed', due: 'Within 60 days of AGM' },
  { id: 7, category: 'Accounts', task: 'Bank reconciliation completed', due: 'Monthly' },
  { id: 8, category: 'Accounts', task: 'Trial balance reviewed', due: 'Monthly' },
];

export default function ComplianceChecklist({ company }: { company?: any }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (id: number) => setChecked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const score = Math.round((checked.size / CHECKLIST.length) * 100);
  const cats = [...new Set(CHECKLIST.map(i => i.category))];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><CheckSquare size={20} className="text-green-400" /><h2 className="text-lg font-semibold">Compliance Checklist</h2></div>
        <div className="flex items-center gap-2">
          {score === 100 ? <CheckCircle size={18} className="text-green-400" /> : <AlertTriangle size={18} className="text-yellow-400" />}
          <span className={`text-sm font-semibold ${score === 100 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{score}% Complete</span>
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${score}%` }} />
      </div>
      {cats.map(cat => (
        <div key={cat}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">{cat}</h3>
          <div className="space-y-1">
            {CHECKLIST.filter(i => i.category === cat).map(item => (
              <div key={item.id} onClick={() => toggle(item.id)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/60 cursor-pointer">
                {checked.has(item.id)
                  ? <CheckSquare size={16} className="text-green-400 flex-shrink-0" />
                  : <Square size={16} className="text-gray-500 flex-shrink-0" />}
                <div className="flex-1">
                  <p className={`text-sm ${checked.has(item.id) ? 'line-through text-gray-500' : ''}`}>{item.task}</p>
                  <p className="text-xs text-gray-500">Due: {item.due}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
