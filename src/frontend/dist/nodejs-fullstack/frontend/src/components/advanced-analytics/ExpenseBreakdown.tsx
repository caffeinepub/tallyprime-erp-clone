import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

type Period = "This Month" | "Last Month" | "This Year";

const EXPENSE_DATA: Record<
  Period,
  { label: string; amount: number; color: string }[]
> = {
  "This Month": [
    { label: "Salaries", amount: 85000, color: "#14b8a6" },
    { label: "Rent", amount: 25000, color: "#6366f1" },
    { label: "Travel", amount: 25000, color: "#f59e0b" },
    { label: "Office", amount: 15800, color: "#10b981" },
    { label: "Utilities", amount: 10000, color: "#3b82f6" },
    { label: "Other", amount: 8000, color: "#8b5cf6" },
  ],
  "Last Month": [
    { label: "Salaries", amount: 82000, color: "#14b8a6" },
    { label: "Rent", amount: 25000, color: "#6366f1" },
    { label: "Travel", amount: 18000, color: "#f59e0b" },
    { label: "Office", amount: 12500, color: "#10b981" },
    { label: "Utilities", amount: 9200, color: "#3b82f6" },
    { label: "Other", amount: 5600, color: "#8b5cf6" },
  ],
  "This Year": [
    { label: "Salaries", amount: 984000, color: "#14b8a6" },
    { label: "Rent", amount: 300000, color: "#6366f1" },
    { label: "Travel", amount: 210000, color: "#f59e0b" },
    { label: "Office", amount: 155000, color: "#10b981" },
    { label: "Utilities", amount: 98000, color: "#3b82f6" },
    { label: "Other", amount: 72000, color: "#8b5cf6" },
  ],
};

export default function ExpenseBreakdown() {
  const [period, setPeriod] = useState<Period>("This Month");
  const data = EXPENSE_DATA[period];
  const total = data.reduce((s, d) => s + d.amount, 0);

  // Build donut segments
  const cx = 100;
  const cy = 100;
  const r = 75;
  const ir = 45;
  let cumAngle = -Math.PI / 2;

  const segments = data.map((d) => {
    const angle = (d.amount / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ir * Math.cos(startAngle);
    const iy1 = cy + ir * Math.sin(startAngle);
    const ix2 = cx + ir * Math.cos(endAngle);
    const iy2 = cy + ir * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    return { ...d, path, pct: ((d.amount / total) * 100).toFixed(1) };
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Expense Breakdown
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Expense distribution by category
          </p>
        </div>
        <div className="flex gap-1">
          {(["This Month", "Last Month", "This Year"] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "outline"}
              className={`h-7 text-xs px-2 ${period === p ? "bg-teal-600 hover:bg-teal-700" : ""}`}
              onClick={() => setPeriod(p)}
              data-ocid="expense.tab"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Total Expenses: ₹{total.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 items-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48 flex-shrink-0">
              <title>Expense Breakdown</title>
              {segments.map((s) => (
                <path
                  key={s.label}
                  d={s.path}
                  fill={s.color}
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              ))}
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
                fillOpacity={0.7}
              >
                Total
              </text>
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill="currentColor"
              >
                ₹{(total / 1000).toFixed(0)}K
              </text>
            </svg>
            <div className="flex-1 space-y-2">
              {data.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-xs text-foreground">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(d.amount / data[0].amount) * 100}%`,
                          backgroundColor: d.color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-20 text-right">
                      ₹{d.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground w-8">
                      {((d.amount / total) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
