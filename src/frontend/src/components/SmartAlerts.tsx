import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Info,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CONFIG_KEY = "hisabkitab_alert_config";
const HISTORY_KEY = "hisabkitab_alert_history";

interface AlertConfig {
  lowStockThreshold: number;
  overduePaymentDays: number;
  cashFlowRiskAmount: number;
}

interface AlertItem {
  id: string;
  category: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  acknowledged?: boolean;
  resolvedAt?: string;
}

function loadConfig(): AlertConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw) as AlertConfig;
  } catch {
    /* ignore */
  }
  return {
    lowStockThreshold: 10,
    overduePaymentDays: 30,
    cashFlowRiskAmount: 500000,
  };
}

function loadHistory(): AlertItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as AlertItem[];
  } catch {
    /* ignore */
  }
  return [];
}

const STOCK_ALERTS: AlertItem[] = [
  {
    id: "s1",
    category: "stock",
    severity: "critical",
    title: "Low Stock: Printer Paper A4",
    description: "Current qty: 3 reams | Threshold: 10 reams",
    timestamp: new Date().toISOString(),
  },
  {
    id: "s2",
    category: "stock",
    severity: "warning",
    title: "Low Stock: Toner Cartridge HP",
    description: "Current qty: 7 units | Threshold: 10 units",
    timestamp: new Date().toISOString(),
  },
  {
    id: "s3",
    category: "stock",
    severity: "warning",
    title: "Low Stock: Packaging Boxes (Large)",
    description: "Current qty: 8 boxes | Threshold: 20 boxes",
    timestamp: new Date().toISOString(),
  },
];

const PAYMENT_ALERTS: AlertItem[] = [
  {
    id: "p1",
    category: "payment",
    severity: "critical",
    title: "Overdue Receivable: Sharma Traders",
    description: "₹1,45,000 overdue by 92 days | Invoice: INV-2024-0312",
    timestamp: new Date().toISOString(),
  },
  {
    id: "p2",
    category: "payment",
    severity: "critical",
    title: "Overdue Payable: Global Supplies Ltd",
    description: "₹78,500 overdue by 65 days | Bill: BILL-2024-0456",
    timestamp: new Date().toISOString(),
  },
  {
    id: "p3",
    category: "payment",
    severity: "warning",
    title: "Overdue Receivable: Mehta & Sons",
    description: "₹32,000 overdue by 38 days | Invoice: INV-2024-0445",
    timestamp: new Date().toISOString(),
  },
  {
    id: "p4",
    category: "payment",
    severity: "info",
    title: "Upcoming Payment Due: Rent — Office",
    description: "₹55,000 due in 5 days | On: 5th of every month",
    timestamp: new Date().toISOString(),
  },
];

const CASHFLOW_ALERTS: AlertItem[] = [
  {
    id: "c1",
    category: "cashflow",
    severity: "critical",
    title: "Cash Flow Risk: High Outstanding",
    description:
      "Total outstanding receivables ₹7,83,000 exceeds threshold of ₹5,00,000",
    timestamp: new Date().toISOString(),
  },
  {
    id: "c2",
    category: "cashflow",
    severity: "warning",
    title: "Bank Balance Low: HDFC Current A/C",
    description: "Balance ₹42,500 — may not cover next 7 days expenses",
    timestamp: new Date().toISOString(),
  },
];

function getTaxDeadlines(): AlertItem[] {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  const gstr1Date = new Date(year, month, 11);
  const gstr3bDate = new Date(year, month, 20);
  if (gstr1Date < today) {
    gstr1Date.setMonth(month + 1);
  }
  if (gstr3bDate < today) {
    gstr3bDate.setMonth(month + 1);
  }

  const daysToGSTR1 = Math.ceil(
    (gstr1Date.getTime() - today.getTime()) / (1000 * 86400),
  );
  const daysToGSTR3B = Math.ceil(
    (gstr3bDate.getTime() - today.getTime()) / (1000 * 86400),
  );

  return [
    {
      id: "t1",
      category: "tax",
      severity:
        daysToGSTR1 < 3 ? "critical" : daysToGSTR1 < 7 ? "warning" : "info",
      title: `GSTR-1 Filing Due — ${daysToGSTR1} day${daysToGSTR1 !== 1 ? "s" : ""} remaining`,
      description: `Due date: ${gstr1Date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} | Monthly return for outward supplies`,
      timestamp: new Date().toISOString(),
    },
    {
      id: "t2",
      category: "tax",
      severity:
        daysToGSTR3B < 3 ? "critical" : daysToGSTR3B < 7 ? "warning" : "info",
      title: `GSTR-3B Filing Due — ${daysToGSTR3B} day${daysToGSTR3B !== 1 ? "s" : ""} remaining`,
      description: `Due date: ${gstr3bDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} | Summary return with tax payment`,
      timestamp: new Date().toISOString(),
    },
    {
      id: "t3",
      category: "tax",
      severity: "info",
      title: "TDS Deposit Due — 7th of Next Month",
      description:
        "Q3 TDS deducted must be deposited by 7th. Estimated: ₹18,500",
      timestamp: new Date().toISOString(),
    },
  ];
}

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical")
    return <XCircle size={14} className="text-red-500 flex-shrink-0" />;
  if (severity === "warning")
    return (
      <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0" />
    );
  return <Info size={14} className="text-blue-400 flex-shrink-0" />;
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "critical")
    return (
      <Badge className="text-[9px] px-1 py-0 bg-red-500/20 text-red-400 border-red-500/40">
        Critical
      </Badge>
    );
  if (severity === "warning")
    return (
      <Badge className="text-[9px] px-1 py-0 bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
        Warning
      </Badge>
    );
  return (
    <Badge className="text-[9px] px-1 py-0 bg-blue-500/20 text-blue-400 border-blue-500/40">
      Info
    </Badge>
  );
}

function AlertCard({
  alert,
  onAcknowledge,
}: { alert: AlertItem; onAcknowledge: (id: string) => void }) {
  return (
    <div
      data-ocid={`smart_alerts.item.${alert.id}`}
      className={`flex items-start gap-3 p-3 border rounded text-xs ${
        alert.severity === "critical"
          ? "border-red-500/30 bg-red-500/5"
          : alert.severity === "warning"
            ? "border-yellow-500/30 bg-yellow-500/5"
            : "border-blue-400/30 bg-blue-400/5"
      }`}
    >
      <SeverityIcon severity={alert.severity} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">{alert.title}</span>
          <SeverityBadge severity={alert.severity} />
        </div>
        <p className="text-muted-foreground mt-0.5 text-[11px]">
          {alert.description}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="text-[10px] h-6 px-2 flex-shrink-0"
        onClick={() => onAcknowledge(alert.id)}
        data-ocid={`smart_alerts.${alert.id}.confirm_button`}
      >
        <CheckCircle size={10} className="mr-1" />
        Ack
      </Button>
    </div>
  );
}

export default function SmartAlerts() {
  const [config, setConfig] = useState<AlertConfig>(loadConfig);
  const [history, setHistory] = useState<AlertItem[]>(loadHistory);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleAcknowledge = (id: string) => {
    const allAlerts = [
      ...STOCK_ALERTS,
      ...PAYMENT_ALERTS,
      ...CASHFLOW_ALERTS,
      ...getTaxDeadlines(),
    ];
    const alert = allAlerts.find((a) => a.id === id);
    if (!alert) return;
    const resolved: AlertItem = {
      ...alert,
      acknowledged: true,
      resolvedAt: new Date().toISOString(),
    };
    const newHistory = [resolved, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    setDismissed((prev) => new Set([...prev, id]));
    toast.success(`Alert acknowledged: ${alert.title}`);
  };

  const handleSaveConfig = () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    toast.success("Alert configuration saved!");
  };

  const activeStock = STOCK_ALERTS.filter((a) => !dismissed.has(a.id));
  const activePayment = PAYMENT_ALERTS.filter((a) => !dismissed.has(a.id));
  const activeCashflow = CASHFLOW_ALERTS.filter((a) => !dismissed.has(a.id));
  const activeTax = getTaxDeadlines().filter((a) => !dismissed.has(a.id));
  const allActive = [
    ...activeStock,
    ...activePayment,
    ...activeCashflow,
    ...activeTax,
  ];

  const criticalCount = allActive.filter(
    (a) => a.severity === "critical",
  ).length;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Bell size={16} className="text-teal" />
            Smart Alerts Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time business alerts and notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <Badge
              className="bg-red-500/20 text-red-400 border-red-500/40 text-xs"
              data-ocid="smart_alerts.error_state"
            >
              {criticalCount} Critical
            </Badge>
          )}
          <Badge
            className="bg-teal/20 text-teal border-teal/40 text-xs"
            data-ocid="smart_alerts.success_state"
          >
            {allActive.length} Active
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="h-8 text-xs">
          <TabsTrigger
            value="all"
            className="text-xs"
            data-ocid="smart_alerts.all.tab"
          >
            All ({allActive.length})
          </TabsTrigger>
          <TabsTrigger
            value="stock"
            className="text-xs"
            data-ocid="smart_alerts.stock.tab"
          >
            Stock ({activeStock.length})
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="text-xs"
            data-ocid="smart_alerts.payment.tab"
          >
            Payments ({activePayment.length})
          </TabsTrigger>
          <TabsTrigger
            value="cashflow"
            className="text-xs"
            data-ocid="smart_alerts.cashflow.tab"
          >
            Cash Flow ({activeCashflow.length})
          </TabsTrigger>
          <TabsTrigger
            value="tax"
            className="text-xs"
            data-ocid="smart_alerts.tax.tab"
          >
            Tax ({activeTax.length})
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="text-xs"
            data-ocid="smart_alerts.config.tab"
          >
            Config
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-xs"
            data-ocid="smart_alerts.history.tab"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2 mt-3">
          {allActive.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="smart_alerts.empty_state"
            >
              <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
              All alerts acknowledged. No active alerts.
            </div>
          ) : (
            allActive.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                onAcknowledge={handleAcknowledge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="stock" className="space-y-2 mt-3">
          {activeStock.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="smart_alerts.stock.empty_state"
            >
              <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
              No stock alerts.
            </div>
          ) : (
            activeStock.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                onAcknowledge={handleAcknowledge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="payment" className="space-y-2 mt-3">
          {activePayment.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="smart_alerts.payment.empty_state"
            >
              <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
              No payment alerts.
            </div>
          ) : (
            activePayment.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                onAcknowledge={handleAcknowledge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-2 mt-3">
          {activeCashflow.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="smart_alerts.cashflow.empty_state"
            >
              <TrendingDown size={32} className="mx-auto mb-2 text-green-400" />
              No cash flow alerts.
            </div>
          ) : (
            activeCashflow.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                onAcknowledge={handleAcknowledge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="tax" className="space-y-2 mt-3">
          {activeTax.map((a) => (
            <AlertCard key={a.id} alert={a} onAcknowledge={handleAcknowledge} />
          ))}
        </TabsContent>

        <TabsContent value="config" className="mt-3">
          <div className="border border-border rounded p-4 space-y-4 max-w-md">
            <h3 className="text-sm font-semibold text-foreground">
              Alert Thresholds
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Low Stock Threshold (qty)</Label>
                <Input
                  type="number"
                  value={config.lowStockThreshold}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      lowStockThreshold: Number(e.target.value),
                    }))
                  }
                  className="h-8 text-xs w-40"
                  data-ocid="smart_alerts.config.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Overdue Payment Alert (days)</Label>
                <Input
                  type="number"
                  value={config.overduePaymentDays}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      overduePaymentDays: Number(e.target.value),
                    }))
                  }
                  className="h-8 text-xs w-40"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cash Flow Risk Amount (₹)</Label>
                <Input
                  type="number"
                  value={config.cashFlowRiskAmount}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      cashFlowRiskAmount: Number(e.target.value),
                    }))
                  }
                  className="h-8 text-xs w-40"
                />
              </div>
              <Button
                size="sm"
                onClick={handleSaveConfig}
                className="text-xs"
                data-ocid="smart_alerts.config.save_button"
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-3">
          {history.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="smart_alerts.history.empty_state"
            >
              <Clock size={32} className="mx-auto mb-2 opacity-40" />
              No alert history yet.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((a, i) => (
                <div
                  key={`${a.id}-${i}`}
                  className="flex items-start gap-3 p-3 border border-border/50 rounded text-xs opacity-70"
                >
                  <CheckCircle
                    size={13}
                    className="text-green-400 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{a.title}</div>
                    <div className="text-muted-foreground text-[11px]">
                      {a.description}
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Acknowledged:{" "}
                      {a.resolvedAt
                        ? new Date(a.resolvedAt).toLocaleString("en-IN")
                        : "—"}
                    </div>
                  </div>
                  <SeverityBadge severity={a.severity} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
