import { ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';

const CHECKS = [
  { label: 'GSTIN Format Valid', status: 'pass' },
  { label: 'HSN Codes Assigned', status: 'pass' },
  { label: 'Tax Rate Mismatch', status: 'fail', detail: '3 vouchers with wrong GST rate' },
  { label: 'E-Invoice Required', status: 'warn', detail: 'Turnover > 5Cr — enable e-invoicing' },
  { label: 'GSTR-1 Reconciled', status: 'pass' },
  { label: 'Reverse Charge Applied', status: 'pass' },
];

export default function ComplianceEngineDashboard({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const passed = CHECKS.filter(c => c.status === 'pass').length;
  const score = Math.round((passed / CHECKS.length) * 100);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><ShieldCheck size={20} className="text-green-400" /><h2 className="text-lg font-semibold">Smart Compliance Engine</h2></div>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className={score >= 80 ? 'text-green-400' : 'text-yellow-400'} />
          <span className={`text-sm font-bold ${score >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>Score: {score}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3">
        <div className={`h-3 rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
      </div>
      <div className="space-y-2">
        {CHECKS.map((check, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
            check.status === 'pass' ? 'border-green-800/40 bg-green-900/10' :
            check.status === 'fail' ? 'border-red-800/40 bg-red-900/10' :
            'border-yellow-800/40 bg-yellow-900/10'
          }`}>
            <div>
              <p className="text-sm font-medium">{check.label}</p>
              {check.detail && <p className="text-xs text-gray-400 mt-0.5">{check.detail}</p>}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              check.status === 'pass' ? 'bg-green-900/40 text-green-400' :
              check.status === 'fail' ? 'bg-red-900/40 text-red-400' :
              'bg-yellow-900/40 text-yellow-400'
            }`}>{check.status.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
