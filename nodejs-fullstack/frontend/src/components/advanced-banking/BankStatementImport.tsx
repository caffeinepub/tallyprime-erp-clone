import { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

export default function BankStatementImport({ company }: { company?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setDone(false); }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    // Simulate CSV parse
    const text = await file.text();
    const lines = text.trim().split('\n').slice(1);
    const parsed = lines.slice(0, 20).map((l, i) => {
      const [date, desc, debit, credit, balance] = l.split(',');
      return { id: i + 1, date: date?.trim(), desc: desc?.trim(), debit: debit?.trim(), credit: credit?.trim(), balance: balance?.trim() };
    });
    setTimeout(() => { setRows(parsed); setImporting(false); setDone(true); }, 800);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Upload size={20} className="text-blue-400" />
        <h2 className="text-lg font-semibold">Bank Statement Import</h2>
      </div>
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
        <FileText size={32} className="mx-auto mb-2 text-gray-500" />
        <p className="text-sm text-gray-400 mb-3">Upload bank statement CSV</p>
        <input type="file" accept=".csv" onChange={handleFile} className="hidden" id="bank-csv" />
        <label htmlFor="bank-csv" className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
          Choose File
        </label>
        {file && <p className="mt-2 text-xs text-green-400">{file.name} selected</p>}
      </div>
      {file && !done && (
        <button onClick={handleImport} disabled={importing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm disabled:opacity-50">
          {importing ? <Loader2 size={14} className="animate-spin" /> : null}
          {importing ? 'Importing...' : 'Import Statement'}
        </button>
      )}
      {done && (
        <>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle size={16} /> {rows.length} transactions imported
          </div>
          <div className="rounded-lg border border-gray-700 overflow-auto max-h-64">
            <table className="w-full text-xs">
              <thead className="bg-gray-800">
                <tr>{['Date','Description','Debit','Credit','Balance'].map(h => <th key={h} className="py-2 px-3 text-left text-gray-400 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-800/40">
                    <td className="py-1.5 px-3">{r.date}</td>
                    <td className="py-1.5 px-3">{r.desc}</td>
                    <td className="py-1.5 px-3 text-red-400">{r.debit}</td>
                    <td className="py-1.5 px-3 text-green-400">{r.credit}</td>
                    <td className="py-1.5 px-3">{r.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
