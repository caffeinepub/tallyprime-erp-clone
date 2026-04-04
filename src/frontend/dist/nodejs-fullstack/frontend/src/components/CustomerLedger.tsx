import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import type { Company } from "../backend.d";

interface Customer {
  id: string;
  name: string;
}
interface LedgerEntry {
  id: string;
  customerId: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  daysOld: number;
}

function getSampleEntries(customerId: string): LedgerEntry[] {
  const today = new Date();
  const d = (days: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - days);
    return dt.toISOString().split("T")[0];
  };
  return [
    {
      id: "1",
      customerId,
      date: d(0),
      description: "Opening Balance",
      debit: 50000,
      credit: 0,
      daysOld: 0,
    },
    {
      id: "2",
      customerId,
      date: d(15),
      description: "Invoice #1001",
      debit: 25000,
      credit: 0,
      daysOld: 15,
    },
    {
      id: "3",
      customerId,
      date: d(10),
      description: "Payment Received",
      debit: 0,
      credit: 30000,
      daysOld: 10,
    },
    {
      id: "4",
      customerId,
      date: d(45),
      description: "Invoice #998",
      debit: 18000,
      credit: 0,
      daysOld: 45,
    },
    {
      id: "5",
      customerId,
      date: d(95),
      description: "Invoice #950",
      debit: 12000,
      credit: 0,
      daysOld: 95,
    },
  ];
}

export default function CustomerLedger({ company }: { company: Company }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState("");
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    try {
      setCustomers(
        JSON.parse(localStorage.getItem(`hkp-customers-${company.id}`) || "[]"),
      );
    } catch {
      /**/
    }
  }, [company.id]);

  useEffect(() => {
    if (!selected) {
      setEntries([]);
      return;
    }
    const stored = localStorage.getItem(
      `hkp-customer-ledger-${company.id}-${selected}`,
    );
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
        return;
      } catch {
        /**/
      }
    }
    const sample = getSampleEntries(selected);
    localStorage.setItem(
      `hkp-customer-ledger-${company.id}-${selected}`,
      JSON.stringify(sample),
    );
    setEntries(sample);
  }, [selected, company.id]);

  let running = 0;
  const withBalance = entries.map((e) => {
    running += e.debit - e.credit;
    return { ...e, balance: running };
  });

  const aging = {
    current: entries
      .filter((e) => e.daysOld === 0 && e.debit > 0)
      .reduce((s, e) => s + e.debit, 0),
    d30: entries
      .filter((e) => e.daysOld > 0 && e.daysOld <= 30 && e.debit > 0)
      .reduce((s, e) => s + e.debit, 0),
    d60: entries
      .filter((e) => e.daysOld > 30 && e.daysOld <= 60 && e.debit > 0)
      .reduce((s, e) => s + e.debit, 0),
    d90: entries
      .filter((e) => e.daysOld > 60 && e.daysOld <= 90 && e.debit > 0)
      .reduce((s, e) => s + e.debit, 0),
    d90p: entries
      .filter((e) => e.daysOld > 90 && e.debit > 0)
      .reduce((s, e) => s + e.debit, 0),
  };

  const exportCSV = () => {
    const h = "Date,Description,Debit,Credit,Balance";
    const lines = withBalance.map(
      (e) => `${e.date},${e.description},${e.debit},${e.credit},${e.balance}`,
    );
    const blob = new Blob([[h, ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "customer-ledger.csv";
    a.click();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-foreground">
          Customer Ledger
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            data-ocid="customerledger.secondary_button"
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1.5 border border-border text-[12px] rounded hover:bg-muted"
          >
            <Printer size={13} /> Print
          </button>
          <button
            type="button"
            data-ocid="customerledger.primary_button"
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-1.5 bg-teal text-primary-foreground text-[12px] rounded hover:opacity-90"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[12px] text-muted-foreground">
          Select Customer:
        </span>
        <select
          data-ocid="customerledger.select"
          className="px-2 py-1 text-[12px] bg-background border border-border rounded"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">-- Select --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          {/* Aging */}
          <div className="bg-card border border-border rounded p-3">
            <h3 className="text-[12px] font-semibold mb-2">Aging Analysis</h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                ["Current", aging.current],
                ["1-30 days", aging.d30],
                ["31-60 days", aging.d60],
                ["61-90 days", aging.d90],
                ["90+ days", aging.d90p],
              ].map(([label, val]) => (
                <div key={label as string} className="text-center">
                  <div className="text-[11px] text-muted-foreground">
                    {label as string}
                  </div>
                  <div
                    className={`text-[14px] font-bold mt-1 ${(val as number) > 0 ? "text-orange-600" : "text-foreground"}`}
                  >
                    ₹{(val as number).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-card border border-border rounded overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  {[
                    "Date",
                    "Description",
                    "Debit (₹)",
                    "Credit (₹)",
                    "Balance (₹)",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-semibold text-muted-foreground px-3 py-2 border-b border-border"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withBalance.map((e, i) => (
                  <tr
                    key={e.id}
                    className="border-b border-border hover:bg-muted/30"
                    data-ocid={`customerledger.item.${i + 1}`}
                  >
                    <td className="px-3 py-2 text-[12px]">{e.date}</td>
                    <td className="px-3 py-2 text-[12px]">{e.description}</td>
                    <td className="px-3 py-2 text-[12px] text-right">
                      {e.debit > 0 ? `₹${e.debit.toLocaleString("en-IN")}` : ""}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-right">
                      {e.credit > 0
                        ? `₹${e.credit.toLocaleString("en-IN")}`
                        : ""}
                    </td>
                    <td
                      className={`px-3 py-2 text-[12px] text-right font-semibold ${e.balance >= 0 ? "text-foreground" : "text-green-600"}`}
                    >
                      ₹{Math.abs(e.balance).toLocaleString("en-IN")}{" "}
                      {e.balance < 0 ? "Cr" : "Dr"}
                    </td>
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
