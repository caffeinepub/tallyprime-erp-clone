import { useState } from 'react';
import { Search, TrendingDown, TrendingUp, ChevronRight, BarChart2 } from 'lucide-react';

const SAMPLE_DATA = [
  { id: 1, name: 'Sales Revenue', amount: 580000, type: 'income', children: [
    { id: 11, name: 'Product Sales', amount: 420000, type: 'income', children: [] },
    { id: 12, name: 'Service Revenue', amount: 160000, type: 'income', children: [] },
  ]},
  { id: 2, name: 'Operating Expenses', amount: 340000, type: 'expense', children: [
    { id: 21, name: 'Salaries', amount: 180000, type: 'expense', children: [] },
    { id: 22, name: 'Rent', amount: 60000, type: 'expense', children: [] },
    { id: 23, name: 'Utilities', amount: 100000, type: 'expense', children: [] },
  ]},
];

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function DrillRow({ node, depth = 0 }: { node: any; depth?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className="hover:bg-gray-800/40 cursor-pointer" onClick={() => node.children?.length && setOpen(!open)}>
        <td className="py-2 px-3" style={{ paddingLeft: `${16 + depth * 24}px` }}>
          <span className="flex items-center gap-1">
            {node.children?.length > 0 && (
              <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
            )}
            {node.name}
          </span>
        </td>
        <td className={`py-2 px-3 text-right font-mono ${node.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
          {fmt(node.amount)}
        </td>
        <td className="py-2 px-3 text-right">
          {node.type === 'income' ? <TrendingUp size={14} className="inline text-green-400" /> : <TrendingDown size={14} className="inline text-red-400" />}
        </td>
      </tr>
      {open && node.children?.map((child: any) => <DrillRow key={child.id} node={child} depth={depth + 1} />)}
    </>
  );
}

export default function DrillDownExplorer({ company }: { company?: any }) {
  const [search, setSearch] = useState('');
  const filtered = SAMPLE_DATA.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 size={20} className="text-indigo-400" />
        <h2 className="text-lg font-semibold">Drill-Down Explorer</h2>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm"
          placeholder="Search accounts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left py-2 px-3 font-medium text-gray-400">Account</th>
              <th className="text-right py-2 px-3 font-medium text-gray-400">Amount</th>
              <th className="text-right py-2 px-3 font-medium text-gray-400">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map(node => <DrillRow key={node.id} node={node} />)}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Click any row with children to expand. Data from Node.js API.</p>
    </div>
  );
}
