import type { Company } from "../backend.d";

interface VoucherEntry {
  ledger?: string;
  amount: number;
  type?: "Dr" | "Cr";
}

interface Voucher {
  id?: string;
  date?: string;
  voucherType?: string;
  type?: string;
  entries?: VoucherEntry[];
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    v,
  );

function getMonthKey(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function ForecastingDashboard({
  company,
}: { company: Company }) {
  const vouchers: Voucher[] = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(`hkp-vouchers-${company.id}`) ?? "[]",
      );
    } catch {
      return [];
    }
  })();

  // Group by month
  const monthlyData: Record<string, { revenue: number; expense: number }> = {};
  for (const v of vouchers) {
    const mk = getMonthKey(v.date);
    if (!mk) continue;
    if (!monthlyData[mk]) monthlyData[mk] = { revenue: 0, expense: 0 };
    const vType = (v.voucherType || v.type || "").toLowerCase();
    const isRevenue = vType.includes("sales") || vType.includes("receipt");
    const isExpense = vType.includes("purchase") || vType.includes("payment");
    const total = (v.entries ?? []).reduce((s, e) => s + Math.abs(e.amount), 0);
    if (isRevenue) monthlyData[mk].revenue += total;
    if (isExpense) monthlyData[mk].expense += total;
  }

  const months = Object.keys(monthlyData).sort();
  const hasData = months.length > 0;

  // Forecast: average last 3 months * 3 (for quarter)
  const last3 = months.slice(-3);
  const avgRevenue =
    last3.length > 0
      ? last3.reduce((s, m) => s + monthlyData[m].revenue, 0) / last3.length
      : 0;
  const avgExpense =
    last3.length > 0
      ? last3.reduce((s, m) => s + monthlyData[m].expense, 0) / last3.length
      : 0;
  const projRevenue = avgRevenue * 3;
  const projExpense = avgExpense * 3;
  const projProfit = projRevenue - projExpense;

  // Growth rate from last 2 months of revenue
  const growthRate =
    last3.length >= 2
      ? ((monthlyData[last3[last3.length - 1]].revenue -
          monthlyData[last3[0]].revenue) /
          (monthlyData[last3[0]].revenue || 1)) *
        100
      : 0;

  // Chart: normalize bar heights
  const maxVal = Math.max(
    ...months.map((m) =>
      Math.max(monthlyData[m].revenue, monthlyData[m].expense),
    ),
    1,
  );

  const monthLabel = (mk: string) => {
    const [yr, mo] = mk.split("-");
    const d = new Date(Number(yr), Number(mo) - 1, 1);
    return d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="tally-section-header mb-4">
        Forecasting Dashboard — {company.name}
      </div>

      {!hasData ? (
        <div
          data-ocid="forecasting.empty_state"
          className="bg-card border border-border p-10 text-center"
        >
          <div className="text-[13px] font-semibold text-muted-foreground mb-1">
            No Voucher Data Available
          </div>
          <div className="text-[11px] text-muted-foreground/70">
            Create Sales, Purchases, Payments or Receipt vouchers to generate
            forecasts.
          </div>
        </div>
      ) : (
        <>
          {/* Bar Chart */}
          <div className="bg-card border border-border p-4 mb-4">
            <div className="text-[11px] font-semibold text-teal uppercase tracking-wide mb-4">
              Monthly Revenue vs Expenses
            </div>
            <div
              className="flex items-end gap-3 overflow-x-auto pb-2"
              style={{ minHeight: 160 }}
            >
              {months.map((mk) => {
                const r = monthlyData[mk].revenue;
                const e = monthlyData[mk].expense;
                const rH = Math.round((r / maxVal) * 120);
                const eH = Math.round((e / maxVal) * 120);
                return (
                  <div
                    key={mk}
                    className="flex flex-col items-center gap-1 flex-shrink-0"
                  >
                    <div
                      className="flex items-end gap-0.5"
                      style={{ height: 128 }}
                    >
                      <div
                        className="w-6 bg-teal/70 transition-all rounded-t-sm"
                        style={{ height: rH }}
                        title={`Revenue: ${fmt(r)}`}
                      />
                      <div
                        className="w-6 bg-destructive/60 transition-all rounded-t-sm"
                        style={{ height: eH }}
                        title={`Expense: ${fmt(e)}`}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      {monthLabel(mk)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-teal/70 rounded-sm inline-block" />{" "}
                Revenue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-destructive/60 rounded-sm inline-block" />{" "}
                Expenses
              </span>
            </div>
          </div>

          {/* Next Quarter Forecast */}
          <div className="bg-card border border-border p-4">
            <div className="text-[11px] font-semibold text-teal uppercase tracking-wide mb-3">
              Next Quarter Forecast
              <span className="ml-2 text-[10px] text-muted-foreground font-normal">
                (Based on avg of last {last3.length} month
                {last3.length !== 1 ? "s" : ""})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  label: "Projected Revenue",
                  value: projRevenue,
                  color: "text-teal",
                },
                {
                  label: "Projected Expenses",
                  value: projExpense,
                  color: "text-destructive",
                },
                {
                  label: "Projected Net Profit",
                  value: projProfit,
                  color:
                    projProfit >= 0 ? "text-green-400" : "text-destructive",
                },
                {
                  label: "Growth Rate",
                  value: null,
                  raw: `${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`,
                  color:
                    growthRate >= 0 ? "text-green-400" : "text-destructive",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-secondary/30 border border-border/60 p-3"
                >
                  <div className="text-[10px] text-muted-foreground mb-1">
                    {card.label}
                  </div>
                  <div
                    className={`text-[14px] font-bold font-mono ${card.color}`}
                  >
                    {card.value !== null ? fmt(card.value) : card.raw}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
