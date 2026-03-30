import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  DollarSign,
  GripVertical,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Company } from "../backend.d";
import type { AppUser } from "../types/rbac";

interface Props {
  currentUser: AppUser | null;
  activeCompany: Company | null;
}

// ── Demo Data ─────────────────────────────────────────────────────────────────

const _MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const profitTrend = [
  { month: "Oct", profit: 120000 },
  { month: "Nov", profit: 145000 },
  { month: "Dec", profit: 132000 },
  { month: "Jan", profit: 168000 },
  { month: "Feb", profit: 155000 },
  { month: "Mar", profit: 189000 },
];

const topCustomers = [
  { name: "Sharma Traders", revenue: 485000 },
  { name: "Gupta Enterprises", revenue: 362000 },
  { name: "RK Industries", revenue: 298000 },
  { name: "Patel & Sons", revenue: 241000 },
  { name: "Mehta Exports", revenue: 187000 },
];

const topVendors = [
  { name: "National Supplies", purchase: 342000 },
  { name: "Premier Goods Co.", purchase: 289000 },
  { name: "Alpha Distributors", purchase: 231000 },
  { name: "Delta Raw Materials", purchase: 178000 },
  { name: "Sunrise Wholesale", purchase: 143000 },
];

// ── Widget Definitions ────────────────────────────────────────────────────────

const DEFAULT_WIDGET_ORDER = [
  "revenueGauge",
  "gstMeter",
  "cashFlow",
  "profitTrend",
  "alertBadges",
  "overdueCounter",
  "topCustomers",
  "topVendors",
];

function getLayoutKey(username: string) {
  return `widgetLayout_${username}`;
}

function loadLayout(username: string): string[] {
  try {
    const raw = localStorage.getItem(getLayoutKey(username));
    if (!raw) return DEFAULT_WIDGET_ORDER;
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length === DEFAULT_WIDGET_ORDER.length
    ) {
      return parsed;
    }
  } catch {}
  return DEFAULT_WIDGET_ORDER;
}

function saveLayout(username: string, order: string[]) {
  localStorage.setItem(getLayoutKey(username), JSON.stringify(order));
}

// ── Gauge SVG Component ───────────────────────────────────────────────────────

interface GaugeProps {
  value: number; // 0-100
  max?: number;
  label: string;
  color: string;
  unit?: string;
}

function SvgGauge({ value, max = 100, label, color, unit = "%" }: GaugeProps) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const angle = pct * 180;
  const r = 54;
  const cx = 70;
  const cy = 70;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startX = cx - r;
  const _startY = cy;
  const endAngle = 180 - angle;
  const endX = cx + r * Math.cos(toRad(endAngle));
  const endY = cy - r * Math.sin(toRad(endAngle));
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg
        width="140"
        height="80"
        viewBox="0 0 140 80"
        role="img"
        aria-label="Gauge chart"
      >
        {/* Background arc */}
        <path
          d={`M ${startX} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-border"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <path
            d={`M ${startX} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
        )}
        {/* Needle */}
        <circle cx={endX} cy={endY} r="5" fill={color} />
        {/* Value text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="currentColor"
          className="fill-foreground"
        >
          {unit === "₹"
            ? `₹${(value / 1000).toFixed(0)}K`
            : `${Math.round(value)}${unit}`}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="8"
          fill="currentColor"
          className="fill-muted-foreground"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

// ── Individual Widgets ────────────────────────────────────────────────────────

function RevenueGaugeWidget() {
  const currentRevenue = 2340000;
  const targetRevenue = 3000000;
  const pct = (currentRevenue / targetRevenue) * 100;
  return (
    <div className="flex flex-col items-center gap-1">
      <SvgGauge
        value={pct}
        max={100}
        label={`of ₹${(targetRevenue / 100000).toFixed(0)}L target`}
        color="#0d9488"
        unit="%"
      />
      <div className="text-center">
        <div className="text-[15px] font-bold text-foreground">
          ₹{(currentRevenue / 100000).toFixed(2)}L
        </div>
        <div className="text-[10px] text-muted-foreground">
          This Month Revenue
        </div>
      </div>
    </div>
  );
}

function GSTMeterWidget() {
  const score = (() => {
    try {
      const raw = localStorage.getItem("compliance-score");
      if (raw) return Number(JSON.parse(raw));
    } catch {}
    return 78;
  })();
  const color = score >= 80 ? "#0d9488" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <SvgGauge
        value={score}
        max={100}
        label="Compliance Score"
        color={color}
        unit="%"
      />
      <div className="text-center">
        <div
          className={`text-[13px] font-semibold ${score >= 80 ? "text-teal" : score >= 60 ? "text-yellow-500" : "text-red-500"}`}
        >
          {score >= 80
            ? "Healthy"
            : score >= 60
              ? "Moderate"
              : "Needs Attention"}
        </div>
        <div className="text-[10px] text-muted-foreground">GST Health</div>
      </div>
    </div>
  );
}

function CashFlowWidget() {
  const inflow = 3200000;
  const outflow = 2100000;
  const net = inflow - outflow;
  const pct = Math.min((net / inflow) * 100, 100);
  const color = net > 0 ? "#0d9488" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <SvgGauge
        value={Math.abs(pct)}
        max={100}
        label={net >= 0 ? "Positive Flow" : "Negative Flow"}
        color={color}
        unit="%"
      />
      <div className="text-center">
        <div
          className={`text-[15px] font-bold ${net >= 0 ? "text-teal" : "text-red-500"}`}
        >
          {net >= 0 ? "+" : "-"}₹{(Math.abs(net) / 100000).toFixed(2)}L
        </div>
        <div className="text-[10px] text-muted-foreground">Net Cash Flow</div>
      </div>
      <div className="flex gap-3 text-[10px]">
        <span className="text-teal">▲ ₹{(inflow / 100000).toFixed(1)}L in</span>
        <span className="text-red-400">
          ▼ ₹{(outflow / 100000).toFixed(1)}L out
        </span>
      </div>
    </div>
  );
}

function ProfitTrendWidget() {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <TrendingUp size={12} className="text-teal" />
        <span className="text-[10px] text-muted-foreground">
          6-Month Profit Trend
        </span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={profitTrend}>
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#0d9488"
            strokeWidth={2}
            dot={false}
          />
          <XAxis dataKey="month" tick={{ fontSize: 9 }} />
          <Tooltip
            formatter={(v: number) => [`₹${(v / 1000).toFixed(0)}K`, "Profit"]}
            contentStyle={{
              fontSize: 10,
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[10px] mt-1">
        <span className="text-muted-foreground">Oct</span>
        <span className="text-teal font-semibold">↑ 57.5% growth</span>
        <span className="text-muted-foreground">Mar</span>
      </div>
    </div>
  );
}

function AlertBadgesWidget() {
  const alerts = [
    { label: "Overdue Invoices", count: 7, color: "bg-red-500" },
    { label: "Low Stock", count: 3, color: "bg-yellow-500" },
    { label: "GST Filing", count: 2, color: "bg-orange-500" },
    { label: "Pending Approvals", count: 5, color: "bg-blue-500" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {alerts.map((a) => (
        <div
          key={a.label}
          className="flex flex-col items-center justify-center bg-secondary/50 rounded-sm p-2 gap-1"
        >
          <div
            className={`${a.color} text-white text-[16px] font-bold w-8 h-8 rounded-full flex items-center justify-center`}
          >
            {a.count}
          </div>
          <div className="text-[9px] text-muted-foreground text-center leading-tight">
            {a.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function OverdueCounterWidget() {
  const count = 7;
  const totalAmount = 485000;
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-2">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-red-500/30 flex flex-col items-center justify-center bg-red-500/10">
          <span className="text-[28px] font-bold text-red-500">{count}</span>
          <span className="text-[9px] text-red-400">invoices</span>
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <AlertTriangle size={10} className="text-white" />
        </div>
      </div>
      <div className="text-center">
        <div className="text-[15px] font-bold text-red-500">
          ₹{(totalAmount / 1000).toFixed(0)}K
        </div>
        <div className="text-[10px] text-muted-foreground">
          Total Overdue Amount
        </div>
      </div>
      <div className="text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded-sm">
        Oldest: 47 days overdue
      </div>
    </div>
  );
}

function TopCustomersWidget() {
  const max = topCustomers[0].revenue;
  return (
    <div className="space-y-2">
      {topCustomers.map((c, i) => (
        <div key={c.name} className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-4">{i + 1}</span>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-foreground font-medium truncate max-w-[110px]">
                {c.name}
              </span>
              <span className="text-teal">
                ₹{(c.revenue / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full"
                style={{ width: `${(c.revenue / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopVendorsWidget() {
  const max = topVendors[0].purchase;
  return (
    <div className="space-y-2">
      {topVendors.map((v, i) => (
        <div key={v.name} className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-4">{i + 1}</span>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-foreground font-medium truncate max-w-[110px]">
                {v.name}
              </span>
              <span className="text-orange-400">
                ₹{(v.purchase / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full"
                style={{ width: `${(v.purchase / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Widget Registry ───────────────────────────────────────────────────────────

const WIDGETS: Record<
  string,
  {
    title: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    ocid: string;
  }
> = {
  revenueGauge: {
    title: "Revenue Gauge",
    icon: <DollarSign size={14} className="text-teal" />,
    component: <RevenueGaugeWidget />,
    ocid: "adv.revenue_gauge.card",
  },
  gstMeter: {
    title: "GST Health Meter",
    icon: <Zap size={14} className="text-yellow-500" />,
    component: <GSTMeterWidget />,
    ocid: "adv.gst_meter.card",
  },
  cashFlow: {
    title: "Cash Flow Speedometer",
    icon: <ArrowUpRight size={14} className="text-blue-400" />,
    component: <CashFlowWidget />,
    ocid: "adv.cash_flow.card",
  },
  profitTrend: {
    title: "Profit Trend",
    icon: <TrendingUp size={14} className="text-teal" />,
    component: <ProfitTrendWidget />,
    ocid: "adv.profit_trend.card",
  },
  alertBadges: {
    title: "Alert Summary",
    icon: <BarChart2 size={14} className="text-orange-400" />,
    component: <AlertBadgesWidget />,
    ocid: "adv.alert_badges.card",
  },
  overdueCounter: {
    title: "Overdue Invoices",
    icon: <AlertTriangle size={14} className="text-red-500" />,
    component: <OverdueCounterWidget />,
    ocid: "adv.overdue_counter.card",
  },
  topCustomers: {
    title: "Top 5 Customers",
    icon: <Users size={14} className="text-teal" />,
    component: <TopCustomersWidget />,
    ocid: "adv.top_customers.card",
  },
  topVendors: {
    title: "Top 5 Vendors",
    icon: <Users size={14} className="text-orange-400" />,
    component: <TopVendorsWidget />,
    ocid: "adv.top_vendors.card",
  },
};

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdvancedAnalyticsDashboard({
  currentUser,
  activeCompany,
}: Props) {
  const username = currentUser?.username ?? "admin";
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() =>
    loadLayout(username),
  );
  const [editMode, setEditMode] = useState(false);
  const [dragSrc, setDragSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Save layout on change
  useEffect(() => {
    saveLayout(username, widgetOrder);
  }, [widgetOrder, username]);

  const handleDragStart = (id: string) => {
    if (!editMode) return;
    setDragSrc(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!editMode) return;
    e.preventDefault();
    setDragOver(id);
  };

  const handleDrop = (targetId: string) => {
    if (!editMode || !dragSrc || dragSrc === targetId) {
      setDragSrc(null);
      setDragOver(null);
      return;
    }
    setWidgetOrder((prev) => {
      const order = [...prev];
      const srcIdx = order.indexOf(dragSrc);
      const tgtIdx = order.indexOf(targetId);
      if (srcIdx < 0 || tgtIdx < 0) return prev;
      order.splice(srcIdx, 1);
      order.splice(tgtIdx, 0, dragSrc);
      return order;
    });
    setDragSrc(null);
    setDragOver(null);
  };

  const resetLayout = () => {
    setWidgetOrder(DEFAULT_WIDGET_ORDER);
    saveLayout(username, DEFAULT_WIDGET_ORDER);
  };

  return (
    <div className="p-4 space-y-4 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-foreground">
            Premium Dashboard
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {activeCompany?.name ?? "Select a company"} · Real-time business
            insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="adv.edit_layout.toggle"
            onClick={() => setEditMode((v) => !v)}
            className={`text-[11px] px-3 py-1.5 rounded-sm border transition-colors ${
              editMode
                ? "bg-teal text-primary-foreground border-teal"
                : "text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
            }`}
          >
            {editMode ? "✓ Done Editing" : "Edit Layout"}
          </button>
          {editMode && (
            <button
              type="button"
              data-ocid="adv.reset_layout.button"
              onClick={resetLayout}
              className="text-[11px] px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {editMode && (
        <div className="text-[11px] text-teal/80 bg-teal/10 border border-teal/20 rounded-sm px-3 py-2">
          ⠿ Drag widgets by their handle to reorder. Layout is saved per user.
        </div>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgetOrder.map((id) => {
          const w = WIDGETS[id];
          if (!w) return null;
          const isDragging = dragSrc === id;
          const isOver = dragOver === id;
          return (
            <Card
              key={id}
              data-ocid={w.ocid}
              draggable={editMode}
              onDragStart={() => handleDragStart(id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={() => handleDrop(id)}
              onDragEnd={() => {
                setDragSrc(null);
                setDragOver(null);
              }}
              className={`transition-all duration-200 ${
                isDragging ? "opacity-40 scale-95" : ""
              } ${isOver && dragSrc !== id ? "ring-2 ring-teal/60" : ""} ${
                editMode ? "cursor-grab active:cursor-grabbing" : ""
              }`}
            >
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
                  {editMode && (
                    <GripVertical
                      size={13}
                      className="text-muted-foreground/60 shrink-0"
                      data-ocid="adv.drag_handle"
                    />
                  )}
                  {w.icon}
                  {w.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">{w.component}</CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-[10px] text-muted-foreground text-center py-2">
        Data is simulated for demo purposes. Connect real vouchers for live
        metrics.
      </div>
    </div>
  );
}
