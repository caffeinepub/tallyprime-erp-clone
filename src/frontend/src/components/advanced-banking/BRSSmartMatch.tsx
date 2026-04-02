import { Badge } from "@/components/ui/badge";
import { CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";

type Confidence = "High" | "Medium" | "Low";

interface BRSEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "Credit" | "Debit";
  confidence: Confidence;
  matched: boolean;
  ledgerEntry?: string;
}

const INITIAL_DATA: BRSEntry[] = [
  {
    id: "1",
    date: "2024-03-01",
    description: "NEFT-HDFC/INV-2024-001",
    amount: 125000,
    type: "Credit",
    confidence: "High",
    matched: false,
    ledgerEntry: "Sales Receipt INV-001",
  },
  {
    id: "2",
    date: "2024-03-02",
    description: "UPI-9876543210-Purchase",
    amount: 45000,
    type: "Debit",
    confidence: "High",
    matched: false,
    ledgerEntry: "Purchase Payment Mar",
  },
  {
    id: "3",
    date: "2024-03-03",
    description: "IMPS-SBI/Salary Mar",
    amount: 380000,
    type: "Debit",
    confidence: "Medium",
    matched: false,
    ledgerEntry: "Payroll March 2024",
  },
  {
    id: "4",
    date: "2024-03-05",
    description: "CHQ-000123-Unknown",
    amount: 75000,
    type: "Debit",
    confidence: "Low",
    matched: false,
  },
  {
    id: "5",
    date: "2024-03-07",
    description: "RTGS-AXIS/ADV-2024",
    amount: 200000,
    type: "Credit",
    confidence: "High",
    matched: false,
    ledgerEntry: "Advance Receipt Client A",
  },
  {
    id: "6",
    date: "2024-03-10",
    description: "ECS-HDFC-LOAN",
    amount: 52000,
    type: "Debit",
    confidence: "High",
    matched: false,
    ledgerEntry: "Loan Repayment EMI",
  },
  {
    id: "7",
    date: "2024-03-12",
    description: "REF-INV-VENDOR-XYZ",
    amount: 98500,
    type: "Credit",
    confidence: "Medium",
    matched: false,
    ledgerEntry: "Vendor Credit Note",
  },
  {
    id: "8",
    date: "2024-03-15",
    description: "BNK-CHG-Q4-SERVICE",
    amount: 1250,
    type: "Debit",
    confidence: "Low",
    matched: false,
  },
];

const CONFIDENCE_CONFIG: Record<Confidence, { color: string; bg: string }> = {
  High: { color: "text-green-600", bg: "bg-green-500/15 border-green-500/30" },
  Medium: {
    color: "text-amber-600",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  Low: { color: "text-red-600", bg: "bg-red-500/15 border-red-500/30" },
};

export default function BRSSmartMatch() {
  const [entries, setEntries] = useState<BRSEntry[]>(INITIAL_DATA);
  const [filter, setFilter] = useState<"All" | Confidence>("All");

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const confirmEntry = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, matched: true } : e)),
    );
  };

  const bulkConfirmHigh = () => {
    setEntries((prev) =>
      prev.map((e) =>
        e.confidence === "High" && !e.matched ? { ...e, matched: true } : e,
      ),
    );
  };

  const resetAll = () => setEntries(INITIAL_DATA);

  const filtered =
    filter === "All" ? entries : entries.filter((e) => e.confidence === filter);
  const unmatched = entries.filter((e) => !e.matched);
  const highUnmatched = unmatched.filter((e) => e.confidence === "High");

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <RefreshCw size={16} className="text-teal" />
            BRS Smart Match
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Enhanced reconciliation with AI confidence scoring
          </p>
        </div>
        <div className="flex gap-2">
          {highUnmatched.length > 0 && (
            <button
              type="button"
              onClick={bulkConfirmHigh}
              className="text-[11px] px-3 py-1.5 bg-green-500/20 border border-green-500/40 text-green-600 hover:bg-green-500/30 transition-colors rounded-sm font-medium"
              data-ocid="brs.bulk_confirm.button"
            >
              ✓ Bulk Confirm High ({highUnmatched.length})
            </button>
          )}
          <button
            type="button"
            onClick={resetAll}
            className="text-[11px] px-3 py-1.5 bg-secondary border border-border text-muted-foreground hover:bg-secondary/80 transition-colors rounded-sm"
            data-ocid="brs.reset.button"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Total Txns",
            value: entries.length,
            color: "text-foreground",
          },
          {
            label: "Matched",
            value: entries.filter((e) => e.matched).length,
            color: "text-teal",
          },
          {
            label: "Unmatched",
            value: unmatched.length,
            color: "text-red-500",
          },
          {
            label: "High Confidence",
            value: entries.filter((e) => e.confidence === "High").length,
            color: "text-green-600",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-sm p-3 text-center"
          >
            <div className={`text-lg font-bold ${color}`}>{value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-3">
        {(["All", "High", "Medium", "Low"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`text-[11px] px-3 py-1.5 rounded-sm transition-colors ${
              filter === f
                ? "bg-teal/20 text-teal border border-teal/40"
                : "bg-secondary border border-border text-muted-foreground hover:bg-secondary/80"
            }`}
            data-ocid={`brs.filter.${f.toLowerCase()}.tab`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-secondary/50 border-b border-border">
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Date
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Description
              </th>
              <th className="text-right px-3 py-2 text-muted-foreground font-medium">
                Amount
              </th>
              <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                Confidence
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Ledger Match
              </th>
              <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                Status
              </th>
              <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, idx) => {
              const conf = CONFIDENCE_CONFIG[entry.confidence];
              return (
                <tr
                  key={entry.id}
                  className={`border-b border-border/50 transition-colors ${
                    entry.matched
                      ? "bg-green-500/5"
                      : entry.confidence === "Low"
                        ? "bg-red-500/5"
                        : "hover:bg-secondary/30"
                  }`}
                  data-ocid={`brs.row.item.${idx + 1}`}
                >
                  <td className="px-3 py-2 text-muted-foreground">
                    {entry.date}
                  </td>
                  <td className="px-3 py-2 text-foreground max-w-[200px] truncate">
                    {entry.description}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono font-medium ${
                      entry.type === "Credit" ? "text-teal" : "text-foreground"
                    }`}
                  >
                    {entry.type === "Debit" ? "-" : "+"}
                    {fmt(entry.amount)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge
                      className={`text-[10px] border ${conf.bg} ${conf.color}`}
                    >
                      {entry.confidence}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-[10px]">
                    {entry.ledgerEntry ?? (
                      <span className="text-red-500/70">— Unmatched —</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {entry.matched ? (
                      <CheckCircle
                        size={13}
                        className="text-green-500 mx-auto"
                      />
                    ) : (
                      <XCircle
                        size={13}
                        className="text-muted-foreground mx-auto"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {!entry.matched && (
                      <button
                        type="button"
                        onClick={() => confirmEntry(entry.id)}
                        className="text-[10px] px-2 py-0.5 bg-teal/20 text-teal border border-teal/30 hover:bg-teal/30 rounded-sm transition-colors"
                        data-ocid={`brs.confirm.button.${idx + 1}`}
                      >
                        Confirm
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
