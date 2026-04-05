import { useState } from 'react';
import { Calculator, IndianRupee } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

const SLABS = [
  { from: 0, to: 250000, rate: 0, label: 'Up to ₹2.5L' },
  { from: 250000, to: 500000, rate: 5, label: '₹2.5L – ₹5L' },
  { from: 500000, to: 1000000, rate: 20, label: '₹5L – ₹10L' },
  { from: 1000000, to: Infinity, rate: 30, label: 'Above ₹10L' },
];

export default function IncomeTaxComputation({ company }: { company?: any }) {
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState('');

  const grossIncome = parseFloat(income) || 0;
  const totalDeductions = parseFloat(deductions) || 0;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  let tax = 0;
  for (const slab of SLABS) {
    if (taxableIncome > slab.from) {
      const taxable = Math.min(taxableIncome, slab.to === Infinity ? taxableIncome : slab.to) - slab.from;
      tax += (taxable * slab.rate) / 100;
    }
  }
  const cess = tax * 0.04;
  const totalTax = tax + cess;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2"><Calculator size={20} className="text-purple-400" /><h2 className="text-lg font-semibold">Income Tax Computation (Old Regime)</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Gross Annual Income (₹)</label>
          <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" placeholder="e.g. 800000" value={income} onChange={e => setIncome(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Total Deductions (80C, 80D, HRA, etc.)</label>
          <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" placeholder="e.g. 150000" value={deductions} onChange={e => setDeductions(e.target.value)} />
        </div>
      </div>
      {grossIncome > 0 && (
        <div className="bg-gray-800/60 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-sm text-gray-300">Tax Computation</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Gross Income</span><span>{fmt(grossIncome)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Less: Deductions</span><span className="text-green-400">({fmt(totalDeductions)})</span></div>
            <div className="flex justify-between font-medium border-t border-gray-700 pt-2"><span>Taxable Income</span><span>{fmt(taxableIncome)}</span></div>
          </div>
          <h3 className="font-medium text-sm text-gray-300 pt-2">Tax Slabs</h3>
          <div className="space-y-1">
            {SLABS.map(slab => {
              const taxable = Math.max(0, Math.min(taxableIncome, slab.to === Infinity ? taxableIncome : slab.to) - slab.from);
              const slabTax = (taxable * slab.rate) / 100;
              return taxable > 0 ? (
                <div key={slab.label} className="flex justify-between text-xs">
                  <span className="text-gray-400">{slab.label} @ {slab.rate}%</span>
                  <span>{fmt(slabTax)}</span>
                </div>
              ) : null;
            })}
          </div>
          <div className="border-t border-gray-700 pt-2 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Income Tax</span><span>{fmt(tax)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Health & Ed. Cess (4%)</span><span>{fmt(cess)}</span></div>
            <div className="flex justify-between font-bold text-base pt-1"><span className="flex items-center gap-1"><IndianRupee size={14} />Total Tax</span><span className="text-red-400">{fmt(totalTax)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
