import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

type Period = 30 | 60 | 90;

const generateData = (days: number) => {
  const points = Math.min(days, 12);
  const inflow: number[] = [];
  const outflow: number[] = [];
  const labels: string[] = [];
  const months = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];
  for (let i = 0; i < points; i++) {
    inflow.push(180000 + Math.sin(i * 0.8) * 40000 + i * 5000);
    outflow.push(130000 + Math.cos(i * 0.6) * 25000 + i * 2000);
    labels.push(months[i % 12]);
  }
  return { inflow, outflow, labels };
};

export default function CashFlowForecast() {
  const [period, setPeriod] = useState<Period>(30);
  const { inflow, outflow, labels } = generateData(
    period === 30 ? 6 : period === 60 ? 9 : 12,
  );

  const maxVal = Math.max(...inflow, ...outflow);
  const W = 560;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const n = inflow.length;
  const xStep = chartW / (n - 1);

  const toX = (i: number) => pad.left + i * xStep;
  const toY = (v: number) => pad.top + chartH - (v / maxVal) * chartH;

  const inflowPath = inflow
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`)
    .join(" ");
  const outflowPath = outflow
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`)
    .join(" ");

  const totalInflow = inflow.reduce((s, v) => s + v, 0);
  const totalOutflow = outflow.reduce((s, v) => s + v, 0);
  const netCash = totalInflow - totalOutflow;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: Math.round(maxVal * t),
    y: pad.top + chartH - t * chartH,
  }));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Cash Flow Forecast
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Projected inflow vs outflow trends
          </p>
        </div>
        <div className="flex gap-1">
          {([30, 60, 90] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "outline"}
              className={`h-7 text-xs px-3 ${period === p ? "bg-teal-600 hover:bg-teal-700" : ""}`}
              onClick={() => setPeriod(p)}
              data-ocid="cashflow.tab"
            >
              {p}D
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Expected Inflow</p>
            <p className="text-xl font-bold text-green-600">
              ₹{(totalInflow / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Expected Outflow</p>
            <p className="text-xl font-bold text-red-500">
              ₹{(totalOutflow / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Net Cash</p>
            <p
              className={`text-xl font-bold ${netCash >= 0 ? "text-green-600" : "text-red-500"}`}
            >
              ₹{(netCash / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 text-xs mb-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-teal-500 inline-block" /> Inflow
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-red-400 inline-block" /> Outflow
            </span>
          </div>
          <svg
            aria-labelledby="cf-title"
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ height: 220 }}
          >
            <title id="cf-title">Cash Flow Forecast</title>
            {/* Grid lines */}
            {yTicks.map((t) => (
              <g key={t.value}>
                <line
                  x1={pad.left}
                  y1={t.y}
                  x2={W - pad.right}
                  y2={t.y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeDasharray="4 4"
                />
                <text
                  x={pad.left - 6}
                  y={t.y + 4}
                  fontSize={9}
                  textAnchor="end"
                  fill="currentColor"
                  fillOpacity={0.5}
                >
                  {(t.value / 1000).toFixed(0)}K
                </text>
              </g>
            ))}
            {/* X axis labels */}
            {labels.map((l, i) => (
              <text
                key={l}
                x={toX(i)}
                y={H - 6}
                fontSize={9}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity={0.6}
              >
                {l}
              </text>
            ))}
            {/* Area fills */}
            <path
              d={`${inflowPath} L ${toX(n - 1)} ${pad.top + chartH} L ${toX(0)} ${pad.top + chartH} Z`}
              fill="#14b8a6"
              fillOpacity={0.12}
            />
            <path
              d={`${outflowPath} L ${toX(n - 1)} ${pad.top + chartH} L ${toX(0)} ${pad.top + chartH} Z`}
              fill="#f87171"
              fillOpacity={0.12}
            />
            {/* Lines */}
            <path
              d={inflowPath}
              fill="none"
              stroke="#14b8a6"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <path
              d={outflowPath}
              fill="none"
              stroke="#f87171"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            {/* Dots */}
            {inflow.map((v, i) => (
              <circle
                key={`in-${labels[i]}`}
                cx={toX(i)}
                cy={toY(v)}
                r={3}
                fill="#14b8a6"
              />
            ))}
            {outflow.map((v, i) => (
              <circle
                key={`out-${labels[i]}`}
                cx={toX(i)}
                cy={toY(v)}
                r={3}
                fill="#f87171"
              />
            ))}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}
