import { Skeleton } from "@/components/ui/skeleton";
import {
  IndianRupee,
  Percent,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Company } from "../backend.d";
import {
  useGetAllGSTVouchers,
  useGetAllLedgerGroups,
  useGetAllLedgers,
  useGetTrialBalance,
} from "../hooks/useQueries";

interface Props {
  company: Company;
}

function formatINR(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹ ${formatted}`;
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-secondary/30 border border-border rounded-sm p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon size={12} className={color} />
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-32" />
      ) : (
        <span className={`text-lg font-bold font-mono ${color}`}>{value}</span>
      )}
    </div>
  );
}

export default function AnalyticsDashboard({ company }: Props) {
  const { data: trialBalance = [], isLoading: tbLoading } = useGetTrialBalance(
    company.id,
  );
  const { data: ledgers = [], isLoading: ledgersLoading } = useGetAllLedgers();
  const { data: ledgerGroups = [], isLoading: groupsLoading } =
    useGetAllLedgerGroups();
  const { data: gstVouchers = [], isLoading: gstLoading } =
    useGetAllGSTVouchers(company.id);

  const isLoading = tbLoading || ledgersLoading || groupsLoading;

  // Build group nature map
  const groupNatureMap = new Map<string, string>();
  for (const g of ledgerGroups) {
    groupNatureMap.set(g.id.toString(), g.nature);
  }

  // Trial balance by ledger name
  const tbMap = new Map<string, { debitTotal: number; creditTotal: number }>();
  for (const entry of trialBalance) {
    tbMap.set(entry.ledgerName, {
      debitTotal: entry.debitTotal,
      creditTotal: entry.creditTotal,
    });
  }

  // Compute income and expense ledgers
  const incomeEntries: { name: string; balance: number }[] = [];
  const expenseEntries: { name: string; balance: number }[] = [];

  for (const ledger of ledgers) {
    const groupId = ledger.groupId.toString();
    const nature = groupNatureMap.get(groupId);
    const tb = tbMap.get(ledger.name);
    if (!tb) continue;

    if (nature === "Income") {
      const balance = tb.creditTotal - tb.debitTotal;
      if (balance > 0) incomeEntries.push({ name: ledger.name, balance });
    } else if (nature === "Expenses") {
      const balance = tb.debitTotal - tb.creditTotal;
      if (balance > 0) expenseEntries.push({ name: ledger.name, balance });
    }
  }

  const totalRevenue = incomeEntries.reduce((s, e) => s + e.balance, 0);
  const totalExpenses = expenseEntries.reduce((s, e) => s + e.balance, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const top5Income = [...incomeEntries]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);
  const top5Expense = [...expenseEntries]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  // GST Summary
  let gstVoucherCount = gstVouchers.length;
  let totalTaxable = 0;
  let totalTax = 0;
  for (const v of gstVouchers) {
    for (const e of v.entries) {
      totalTaxable += e.amount;
      totalTax +=
        (e.cgstAmount ?? 0) + (e.sgstAmount ?? 0) + (e.igstAmount ?? 0);
    }
  }

  const profitColor = netProfit >= 0 ? "text-green-400" : "text-red-400";
  const marginColor = profitMargin >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="h-full flex flex-col bg-background overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
        <div>
          <span className="text-sm font-semibold text-teal tracking-wide uppercase">
            Business Insights
          </span>
          <span className="text-xs text-muted-foreground ml-3">
            {company.name}
          </span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="analytics.refresh.button"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard
            label="Total Revenue"
            value={formatINR(totalRevenue)}
            icon={TrendingUp}
            color="text-teal"
            loading={isLoading}
          />
          <SummaryCard
            label="Total Expenses"
            value={formatINR(totalExpenses)}
            icon={TrendingDown}
            color="text-red-400"
            loading={isLoading}
          />
          <SummaryCard
            label="Net Profit"
            value={formatINR(netProfit)}
            icon={IndianRupee}
            color={profitColor}
            loading={isLoading}
          />
          <SummaryCard
            label="Profit Margin"
            value={`${profitMargin.toFixed(2)}%`}
            icon={Percent}
            color={marginColor}
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Income Ledgers */}
          <div className="bg-secondary/20 border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold text-teal uppercase tracking-wide mb-3">
              Top 5 Income Ledgers
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : top5Income.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No income data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={top5Income.map((e) => ({
                    name:
                      e.name.length > 16 ? `${e.name.slice(0, 16)}…` : e.name,
                    amount: e.balance,
                  }))}
                  layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatINR(v), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--teal))" radius={2} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Expense Ledgers */}
          <div className="bg-secondary/20 border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">
              Top 5 Expense Ledgers
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : top5Expense.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No expense data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={top5Expense.map((e) => ({
                    name:
                      e.name.length > 16 ? `${e.name.slice(0, 16)}…` : e.name,
                    amount: e.balance,
                  }))}
                  layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatINR(v), "Expenses"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="amount" fill="#f87171" radius={2} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GST Summary */}
        <div className="bg-secondary/20 border border-border rounded-sm p-3">
          <h3 className="text-xs font-semibold text-teal uppercase tracking-wide mb-3">
            GST Summary
          </h3>
          {gstLoading ? (
            <div className="flex gap-4">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-10 w-40" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  GST Vouchers
                </span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {gstVoucherCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Total Taxable
                </span>
                <span className="text-lg font-bold font-mono text-teal">
                  {formatINR(totalTaxable)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Total Tax (GST)
                </span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  {formatINR(totalTax)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
