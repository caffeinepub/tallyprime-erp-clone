import { Card, CardContent } from "@/components/ui/card";

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const REVENUE = [380000, 420000, 495000, 365000, 440000, 485000];
const EXPENSES = [270000, 295000, 310000, 285000, 305000, 290000];
const PROFIT = REVENUE.map((r, i) => r - EXPENSES[i]);

export default function PLTrend() {
  const maxVal = Math.max(...REVENUE);
  const W = 560;
  const H = 220;
  const pad = { top: 20, right: 20, bottom: 40, left: 70 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barGroupW = chartW / MONTHS.length;
  const barW = (barGroupW - 16) / 2;

  const toH = (v: number) => (v / maxVal) * chartH;
  const toY = (v: number) => pad.top + chartH - toH(v);

  const bestIdx = PROFIT.indexOf(Math.max(...PROFIT));
  const avgProfit = Math.round(
    PROFIT.reduce((s, v) => s + v, 0) / PROFIT.length,
  );

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">P&L Trend</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          6-month Revenue vs Expense comparison
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Best Month</p>
            <p className="text-sm font-bold text-green-600">
              {MONTHS[bestIdx]}
            </p>
            <p className="text-xs text-muted-foreground">
              ₹{PROFIT[bestIdx].toLocaleString()} profit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Avg Monthly Profit</p>
            <p className="text-xl font-bold text-green-600">
              ₹{(avgProfit / 1000).toFixed(0)}K
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Revenue (6M)</p>
            <p className="text-xl font-bold text-foreground">
              ₹{(REVENUE.reduce((s, v) => s + v, 0) / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 text-xs mb-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-teal-500 inline-block" />{" "}
              Revenue
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />{" "}
              Expenses
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />{" "}
              Profit
            </span>
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ height: 240 }}
          >
            <title id="plt-title">P&amp;L Trend Chart</title>
            {/* Grid */}
            {yTicks.map((t) => {
              const y = pad.top + chartH - t * chartH;
              return (
                <g key={t}>
                  <line
                    x1={pad.left}
                    y1={y}
                    x2={W - pad.right}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={pad.left - 6}
                    y={y + 4}
                    fontSize={9}
                    textAnchor="end"
                    fill="currentColor"
                    fillOpacity={0.5}
                  >
                    {((maxVal * t) / 1000).toFixed(0)}K
                  </text>
                </g>
              );
            })}
            {/* Bars */}
            {MONTHS.map((m, i) => {
              const gx = pad.left + i * barGroupW + 8;
              const revH = toH(REVENUE[i]);
              const expH = toH(EXPENSES[i]);
              return (
                <g key={m}>
                  <rect
                    x={gx}
                    y={toY(REVENUE[i])}
                    width={barW}
                    height={revH}
                    fill="#14b8a6"
                    rx={2}
                    fillOpacity={0.85}
                  />
                  <rect
                    x={gx + barW + 2}
                    y={toY(EXPENSES[i])}
                    width={barW}
                    height={expH}
                    fill="#f87171"
                    rx={2}
                    fillOpacity={0.85}
                  />
                  {/* Profit line marker */}
                  <line
                    x1={gx - 2}
                    y1={toY(PROFIT[i])}
                    x2={gx + barW * 2 + 6}
                    y2={toY(PROFIT[i])}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                  <circle
                    cx={gx + barW}
                    cy={toY(PROFIT[i])}
                    r={3}
                    fill="#22c55e"
                  />
                  <text
                    x={gx + barW}
                    y={H - pad.bottom + 14}
                    fontSize={9}
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={0.6}
                  >
                    {m}
                  </text>
                  {/* Profit label */}
                  <text
                    x={gx + barW}
                    y={toY(PROFIT[i]) - 6}
                    fontSize={8}
                    textAnchor="middle"
                    fill="#22c55e"
                    fontWeight={600}
                  >
                    {(PROFIT[i] / 1000).toFixed(0)}K
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}
