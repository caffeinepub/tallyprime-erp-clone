import { FileText, Plus } from "lucide-react";
import { useState } from "react";

interface TDSEntry {
  id: string;
  party: string;
  section: string;
  rate: number;
  grossAmount: number;
  tdsAmount: number;
  date: string;
  challanBSR?: string;
  challanDate?: string;
}

const INITIAL: TDSEntry[] = [
  {
    id: "1",
    party: "Ravi Kumar Consulting",
    section: "194J",
    rate: 10,
    grossAmount: 150000,
    tdsAmount: 15000,
    date: "2024-03-01",
    challanBSR: "0001234",
    challanDate: "2024-03-07",
  },
  {
    id: "2",
    party: "TechServ Solutions",
    section: "194C",
    rate: 2,
    grossAmount: 500000,
    tdsAmount: 10000,
    date: "2024-03-05",
  },
  {
    id: "3",
    party: "Shree Constructions",
    section: "194C",
    rate: 2,
    grossAmount: 800000,
    tdsAmount: 16000,
    date: "2024-03-10",
    challanBSR: "0001234",
    challanDate: "2024-03-15",
  },
  {
    id: "4",
    party: "Anand Traders",
    section: "194Q",
    rate: 0.1,
    grossAmount: 2500000,
    tdsAmount: 2500,
    date: "2024-03-12",
  },
  {
    id: "5",
    party: "Sunrise Pvt Ltd",
    section: "194I",
    rate: 10,
    grossAmount: 240000,
    tdsAmount: 24000,
    date: "2024-03-18",
  },
];

const SECTIONS = ["194C", "194J", "194I", "194Q", "194H", "192B"];

export default function TDSManagement() {
  const [entries] = useState<TDSEntry[]>(INITIAL);
  const [activeTab, setActiveTab] = useState<"deductions" | "challan" | "26q">(
    "deductions",
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const totalTDS = entries.reduce((s, e) => s + e.tdsAmount, 0);
  const depositedTDS = entries
    .filter((e) => e.challanBSR)
    .reduce((s, e) => s + e.tdsAmount, 0);
  const pendingTDS = totalTDS - depositedTDS;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileText size={16} className="text-teal" />
          TDS Management
        </h2>
        <button
          type="button"
          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 rounded-sm"
          data-ocid="tds.add.button"
        >
          <Plus size={12} /> Add TDS Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            label: "Total TDS Deducted",
            value: totalTDS,
            color: "text-foreground",
          },
          { label: "TDS Deposited", value: depositedTDS, color: "text-teal" },
          {
            label: "TDS Pending Deposit",
            value: pendingTDS,
            color: pendingTDS > 0 ? "text-red-500" : "text-teal",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-sm p-3"
          >
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div className={`text-base font-bold mt-1 ${color}`}>
              {fmt(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(["deductions", "challan", "26q"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`text-[11px] px-3 py-1.5 rounded-sm transition-colors ${
              activeTab === t
                ? "bg-teal/20 text-teal border border-teal/40"
                : "bg-secondary border border-border text-muted-foreground hover:bg-secondary/80"
            }`}
            data-ocid={`tds.${t}.tab`}
          >
            {t === "deductions"
              ? "TDS Deductions"
              : t === "challan"
                ? "Challan Tracker"
                : "Form 26Q"}
          </button>
        ))}
      </div>

      {activeTab === "deductions" && (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                  Party Name
                </th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                  Section
                </th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">
                  Rate %
                </th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">
                  Gross Amount
                </th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">
                  TDS Amount
                </th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                  Date
                </th>
                <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                  Challan
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr
                  key={e.id}
                  className="border-b border-border/50 hover:bg-secondary/20"
                  data-ocid={`tds.row.item.${idx + 1}`}
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {e.party}
                  </td>
                  <td className="px-3 py-2">
                    <span className="bg-teal/15 text-teal text-[10px] px-1.5 py-0.5 rounded-sm">
                      {e.section}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">{e.rate}%</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {fmt(e.grossAmount)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-teal font-medium">
                    {fmt(e.tdsAmount)}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{e.date}</td>
                  <td className="px-3 py-2 text-center">
                    {e.challanBSR ? (
                      <span className="text-[10px] text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-sm">
                        Filed
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-sm">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "challan" && (
        <div className="space-y-3">
          {entries
            .filter((e) => e.challanBSR)
            .map((e, idx) => (
              <div
                key={e.id}
                className="bg-card border border-teal/20 rounded-sm p-3 flex items-center justify-between"
                data-ocid={`tds.challan.item.${idx + 1}`}
              >
                <div>
                  <div className="text-[11px] font-semibold text-foreground">
                    {e.party}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Section: {e.section} | Date: {e.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-teal">
                    {fmt(e.tdsAmount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    BSR: {e.challanBSR} | Filed: {e.challanDate}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === "26q" && (
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="text-[11px] font-semibold text-foreground mb-3">
            Form 26Q — TDS Return Summary (Q4 FY 2023-24)
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Total Deductions:</span>
                <span className="font-medium">{entries.length}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">
                  Total Gross Amount:
                </span>
                <span className="font-mono">
                  {fmt(entries.reduce((s, e) => s + e.grossAmount, 0))}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Total TDS:</span>
                <span className="font-mono text-teal font-medium">
                  {fmt(totalTDS)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {SECTIONS.map((sec) => {
                const total = entries
                  .filter((e) => e.section === sec)
                  .reduce((s, e) => s + e.tdsAmount, 0);
                if (!total) return null;
                return (
                  <div key={sec} className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Section {sec}:
                    </span>
                    <span className="font-mono">{fmt(total)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm text-[10px] text-amber-600">
            ⚠ Form 26Q must be filed by 31st May for Q4. Ensure all challans are
            deposited before filing.
          </div>
        </div>
      )}
    </div>
  );
}
