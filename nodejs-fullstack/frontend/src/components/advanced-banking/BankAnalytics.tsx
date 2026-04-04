import { BarChart2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";

const ACCOUNTS = [
  {
    name: "HDFC Current A/c",
    number: "XXXX1234",
    balance: 842500,
    color: "teal",
  },
  {
    name: "SBI Savings A/c",
    number: "XXXX5678",
    balance: 325000,
    color: "blue",
  },
  { name: "ICICI OD A/c", number: "XXXX9012", balance: -150000, color: "red" },
];

const MONTHLY_DATA = [
  { month: "Oct", income: 1850000, expense: 1420000 },
  { month: "Nov", income: 2100000, expense: 1680000 },
  { month: "Dec", income: 2450000, expense: 1920000 },
  { month: "Jan", income: 1980000, expense: 1540000 },
  { month: "Feb", income: 2220000, expense: 1760000 },
  { month: "Mar", income: 2680000, expense: 2100000 },
];

const DAILY_AVG = [
  42000, 48000, 55000, 38000, 51000, 62000, 58000, 44000, 67000, 71000, 63000,
  59000,
];

export default function BankAnalytics() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "income-expense" | "daily"
  >("overview");

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const maxIncome = Math.max(...MONTHLY_DATA.map((d) => d.income));
  const maxBar = maxIncome * 1.1;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <BarChart2 size={16} className="text-teal" />
          Bank Analytics
        </h2>
        <div className="flex gap-1">
          {(["overview", "income-expense", "daily"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`text-[11px] px-3 py-1.5 rounded-sm transition-colors ${
                activeTab === t
                  ? "bg-teal/20 text-teal border border-teal/40"
                  : "bg-secondary border border-border text-muted-foreground hover:bg-secondary/80"
              }`}
              data-ocid={`bank_analytics.${t}.tab`}
            >
              {t === "overview"
                ? "Overview"
                : t === "income-expense"
                  ? "Income vs Expense"
                  : "Daily Avg"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {ACCOUNTS.map((acc) => (
              <div
                key={acc.number}
                className={`bg-card border rounded-sm p-4 ${
                  acc.balance < 0 ? "border-red-500/30" : "border-teal/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet
                      size={13}
                      className={acc.balance < 0 ? "text-red-500" : "text-teal"}
                    />
                    <span className="text-[11px] font-semibold text-foreground">
                      {acc.name}
                    </span>
                  </div>
                  {acc.balance >= 0 ? (
                    <TrendingUp size={12} className="text-green-500" />
                  ) : (
                    <TrendingDown size={12} className="text-red-500" />
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mb-1">
                  {acc.number}
                </div>
                <div
                  className={`text-base font-bold ${
                    acc.balance < 0 ? "text-red-500" : "text-foreground"
                  }`}
                >
                  {fmt(acc.balance)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Current Balance
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="text-[11px] font-semibold text-foreground mb-3">
              Total Bank Position
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[10px] text-muted-foreground">
                  Total Assets
                </div>
                <div className="text-sm font-bold text-teal mt-1">
                  {fmt(1167500)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">
                  Overdraft Used
                </div>
                <div className="text-sm font-bold text-red-500 mt-1">
                  {fmt(150000)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">
                  Net Position
                </div>
                <div className="text-sm font-bold text-foreground mt-1">
                  {fmt(1017500)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "income-expense" && (
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="text-[11px] font-semibold text-foreground mb-4">
            Income vs Expense — Last 6 Months
          </div>
          <div className="flex items-end gap-3 h-40">
            {MONTHLY_DATA.map((d) => (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="w-full flex items-end gap-0.5 h-32">
                  <div
                    className="flex-1 bg-teal/60 rounded-t-sm transition-all"
                    style={{ height: `${(d.income / maxBar) * 100}%` }}
                    title={`Income: ${fmt(d.income)}`}
                  />
                  <div
                    className="flex-1 bg-red-500/50 rounded-t-sm transition-all"
                    style={{ height: `${(d.expense / maxBar) * 100}%` }}
                    title={`Expense: ${fmt(d.expense)}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {d.month}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-teal/60 rounded-sm inline-block" />
              Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500/50 rounded-sm inline-block" />
              Expense
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {MONTHLY_DATA.slice(-3).map((d) => (
              <div key={d.month} className="bg-secondary/30 rounded-sm p-3">
                <div className="text-[11px] font-medium text-foreground">
                  {d.month}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Net:{" "}
                  <span
                    className={`font-semibold ${d.income - d.expense >= 0 ? "text-teal" : "text-red-500"}`}
                  >
                    {fmt(d.income - d.expense)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "daily" && (
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="text-[11px] font-semibold text-foreground mb-4">
            Average Daily Balance — Last 12 Days
          </div>
          <div className="flex items-end gap-2 h-36">
            {DAILY_AVG.map((val, i) => {
              const maxVal = Math.max(...DAILY_AVG);
              return (
                <div
                  key={`day_${i + 1}`}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-teal/50 hover:bg-teal/70 rounded-t-sm transition-colors cursor-default"
                    style={{ height: `${(val / maxVal) * 120}px` }}
                    title={fmt(val)}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">
            Day of month — Hover bars to see balance
          </div>
          <div className="mt-3 p-3 bg-secondary/30 rounded-sm flex gap-6 text-[11px]">
            <div>
              <span className="text-muted-foreground">Min: </span>
              <span className="font-semibold text-foreground">
                {fmt(Math.min(...DAILY_AVG))}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Max: </span>
              <span className="font-semibold text-foreground">
                {fmt(Math.max(...DAILY_AVG))}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg: </span>
              <span className="font-semibold text-teal">
                {fmt(
                  Math.round(
                    DAILY_AVG.reduce((a, b) => a + b, 0) / DAILY_AVG.length,
                  ),
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
