import { Download } from "lucide-react";
import type { Company } from "../backend.d";

interface Budget {
  id: string;
  name: string;
  ledgerName: string;
  ledgerGroup: string;
  amount: number;
  period: string;
  financialYear: string;
}

interface VoucherEntry {
  ledger: string;
  amount: number;
  type: "Dr" | "Cr";
}

interface Voucher {
  id?: string;
  entries?: VoucherEntry[];
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    v,
  );

export default function BudgetVsActual({ company }: { company: Company }) {
  const budgets: Budget[] = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(`hkp-budgets-${company.id}`) ?? "[]",
      );
    } catch {
      return [];
    }
  })();

  const vouchers: Voucher[] = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(`hkp-vouchers-${company.id}`) ?? "[]",
      );
    } catch {
      return [];
    }
  })();

  // Build actual map: ledgerName -> sum of Dr amounts
  const actualMap: Record<string, number> = {};
  for (const v of vouchers) {
    for (const e of v.entries ?? []) {
      if (!actualMap[e.ledger]) actualMap[e.ledger] = 0;
      actualMap[e.ledger] += e.type === "Dr" ? e.amount : -e.amount;
    }
  }

  const rows = budgets.map((b) => {
    const actual = Math.abs(actualMap[b.ledgerName] ?? 0);
    const variance = b.amount - actual;
    const variancePct = b.amount > 0 ? (variance / b.amount) * 100 : 0;
    return { ...b, actual, variance, variancePct };
  });

  const totBudget = rows.reduce((s, r) => s + r.amount, 0);
  const totActual = rows.reduce((s, r) => s + r.actual, 0);
  const totVariance = totBudget - totActual;
  const totVariancePct = totBudget > 0 ? (totVariance / totBudget) * 100 : 0;

  const exportCSV = () => {
    const headers = [
      "Ledger",
      "Ledger Group",
      "Period",
      "Budget",
      "Actual",
      "Variance",
      "Variance %",
    ];
    const csvRows = rows.map((r) =>
      [
        r.ledgerName,
        r.ledgerGroup,
        r.period,
        r.amount,
        r.actual,
        r.variance,
        r.variancePct.toFixed(2),
      ].join(","),
    );
    csvRows.push(
      [
        "TOTAL",
        "",
        "",
        totBudget,
        totActual,
        totVariance,
        totVariancePct.toFixed(2),
      ].join(","),
    );
    const blob = new Blob([[headers.join(","), ...csvRows].join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `budget-vs-actual-${company.name}.csv`;
    a.click();
  };

  const varianceColor = (v: number) =>
    v < 0
      ? "text-destructive"
      : v > 0
        ? "text-green-400"
        : "text-muted-foreground";

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="tally-section-header">
          Budget vs Actual — {company.name}
        </div>
        <button
          type="button"
          data-ocid="budget_vs_actual.export.button"
          onClick={exportCSV}
          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 transition-colors"
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {budgets.length === 0 ? (
        <div
          data-ocid="budget_vs_actual.empty_state"
          className="bg-card border border-border p-8 text-center text-muted-foreground text-[12px]"
        >
          No budgets found. Create budgets in Budget Master first.
        </div>
      ) : (
        <div className="bg-card border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-secondary/70 border-b border-border">
                  {[
                    "Ledger",
                    "Group",
                    "Period",
                    "Budget Amount",
                    "Actual Amount",
                    "Variance",
                    "Variance %",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-semibold text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.id}
                    data-ocid={`budget_vs_actual.item.${i + 1}`}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-medium text-foreground">
                      {r.ledgerName}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 bg-teal/10 text-teal text-[10px]">
                        {r.ledgerGroup}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {r.period}
                    </td>
                    <td className="px-3 py-2 font-mono text-foreground">
                      {fmt(r.amount)}
                    </td>
                    <td className="px-3 py-2 font-mono text-foreground">
                      {fmt(r.actual)}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono font-semibold ${varianceColor(r.variance)}`}
                    >
                      {fmt(r.variance)}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono font-semibold ${varianceColor(r.variance)}`}
                    >
                      {r.variancePct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-secondary/50 border-t-2 border-teal/40 font-bold">
                  <td className="px-3 py-2 text-teal" colSpan={3}>
                    TOTAL
                  </td>
                  <td className="px-3 py-2 font-mono text-foreground">
                    {fmt(totBudget)}
                  </td>
                  <td className="px-3 py-2 font-mono text-foreground">
                    {fmt(totActual)}
                  </td>
                  <td
                    className={`px-3 py-2 font-mono ${varianceColor(totVariance)}`}
                  >
                    {fmt(totVariance)}
                  </td>
                  <td
                    className={`px-3 py-2 font-mono ${varianceColor(totVariance)}`}
                  >
                    {totVariancePct.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" /> Under Budget
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-destructive" /> Over Budget
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground" /> On
          Budget
        </span>
      </div>
    </div>
  );
}
