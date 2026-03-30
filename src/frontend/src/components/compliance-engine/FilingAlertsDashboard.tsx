import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FilingItem {
  id: string;
  name: string;
  dueDate: Date;
  period: string;
  filed: boolean;
  filedAt?: string;
}

function getDueDate(monthOffset: number, day: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + monthOffset, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildFilings(): FilingItem[] {
  const now = new Date();
  const monthLabel = now.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
  return [
    {
      id: "gstr1",
      name: "GSTR-1",
      dueDate: getDueDate(1, 11),
      period: monthLabel,
      filed: false,
    },
    {
      id: "gstr3b",
      name: "GSTR-3B",
      dueDate: getDueDate(1, 20),
      period: monthLabel,
      filed: false,
    },
    {
      id: "gstr9",
      name: "GSTR-9 (Annual)",
      dueDate: new Date(new Date().getFullYear(), 11, 31),
      period: `FY ${new Date().getFullYear()}`,
      filed: false,
    },
    {
      id: "tds",
      name: "TDS Return",
      dueDate: getDueDate(1, 7),
      period: monthLabel,
      filed: false,
    },
    {
      id: "adv_tax",
      name: "Advance Tax",
      dueDate: new Date(new Date().getFullYear(), 2, 15),
      period: "Q4",
      filed: false,
    },
  ];
}

const FILINGS_KEY = "hkp_filings_status";

function loadFilings(): FilingItem[] {
  const base = buildFilings();
  try {
    const raw = localStorage.getItem(FILINGS_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Record<
        string,
        { filed: boolean; filedAt?: string }
      >;
      return base.map((f) => ({ ...f, ...(saved[f.id] ?? {}) }));
    }
  } catch {
    /* ignore */
  }
  return base;
}

function saveStatus(filings: FilingItem[]) {
  const s: Record<string, { filed: boolean; filedAt?: string }> = {};
  for (const f of filings) s[f.id] = { filed: f.filed, filedAt: f.filedAt };
  localStorage.setItem(FILINGS_KEY, JSON.stringify(s));
}

function getDaysRemaining(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function FilingAlertsDashboard() {
  const [filings, setFilings] = useState<FilingItem[]>(loadFilings);

  const markFiled = (id: string) => {
    const updated = filings.map((f) =>
      f.id === id
        ? { ...f, filed: true, filedAt: new Date().toISOString() }
        : f,
    );
    setFilings(updated);
    saveStatus(updated);
    toast.success("Marked as filed!");
  };

  const pending = filings.filter((f) => !f.filed);
  const history = filings.filter((f) => f.filed);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Bell size={16} className="text-yellow-400" />
          Filing Alerts Dashboard
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Track upcoming GST and tax filing due dates
        </p>
      </div>

      <div className="space-y-3">
        {pending.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="filing_alerts.empty_state"
          >
            <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
            All filings up to date!
          </div>
        ) : (
          pending.map((f, i) => {
            const days = getDaysRemaining(f.dueDate);
            const urgent =
              days < 0
                ? "Overdue"
                : days < 3
                  ? "Urgent"
                  : days < 7
                    ? "Due Soon"
                    : "On Track";
            const color =
              days < 0
                ? "text-red-400"
                : days < 3
                  ? "text-red-400"
                  : days < 7
                    ? "text-yellow-400"
                    : "text-green-400";
            const badgeCls =
              days < 0
                ? "bg-red-500/20 text-red-400 border-red-500/40"
                : days < 3
                  ? "bg-red-500/20 text-red-400 border-red-500/40"
                  : days < 7
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                    : "bg-green-500/20 text-green-400 border-green-500/40";
            return (
              <div
                key={f.id}
                className="border border-border rounded p-4 flex items-center justify-between flex-wrap gap-3"
                data-ocid={`filing_alerts.item.${i + 1}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock size={13} className={color} />
                    <span className="text-xs font-semibold text-foreground">
                      {f.name}
                    </span>
                    <Badge className={`text-[9px] px-1.5 py-0 ${badgeCls}`}>
                      {urgent}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Period: {f.period} &bull; Due:{" "}
                    {f.dueDate.toLocaleDateString("en-IN")}
                  </div>
                  <div className={`text-xs font-bold ${color}`}>
                    {days < 0
                      ? `${Math.abs(days)} days overdue`
                      : days === 0
                        ? "Due Today!"
                        : `${days} days remaining`}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="text-xs h-7 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30"
                  onClick={() => markFiled(f.id)}
                  data-ocid={`filing_alerts.mark_filed.${i + 1}.primary_button`}
                >
                  <CheckCircle size={11} className="mr-1" />
                  Mark as Filed
                </Button>
              </div>
            );
          })
        )}
      </div>

      {history.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Filing History
          </div>
          <div className="border border-border rounded overflow-hidden">
            {history.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between px-4 py-2 border-b border-border/50 last:border-0"
              >
                <div className="text-xs text-foreground font-medium">
                  {f.name} — {f.period}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-green-400" />
                  <span className="text-[10px] text-green-400">
                    Filed{" "}
                    {f.filedAt
                      ? new Date(f.filedAt).toLocaleDateString("en-IN")
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
