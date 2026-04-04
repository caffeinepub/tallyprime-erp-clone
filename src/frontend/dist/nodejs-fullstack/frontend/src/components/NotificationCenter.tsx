import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BellOff,
  CheckCheck,
  Info,
  Sparkles,
  Trash2,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const LS_KEY = "hkpro_notifications";

type NType = "warning" | "error" | "info" | "success";

type Notification = {
  id: string;
  message: string;
  type: NType;
  timestamp: string;
  read: boolean;
};

const SEED: Omit<Notification, "id" | "timestamp" | "read">[] = [
  {
    message: "Low stock alert: Item 'Widget A' below reorder level",
    type: "warning",
  },
  {
    message: "Cheque #1042 overdue by 5 days",
    type: "error",
  },
  {
    message: "Payroll for March 2026 not yet processed",
    type: "info",
  },
  {
    message: "GSTR-1 filing due in 3 days",
    type: "warning",
  },
  {
    message: "Balance Sheet reconciliation complete",
    type: "success",
  },
];

function load(): Notification[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "null") ?? [];
  } catch {
    return [];
  }
}

function save(n: Notification[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(n));
}

const TYPE_STYLES: Record<
  NType,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  warning: {
    icon: <TriangleAlert size={14} />,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-l-2 border-yellow-500/60",
  },
  error: {
    icon: <XCircle size={14} />,
    color: "text-destructive",
    bg: "bg-destructive/10 border-l-2 border-destructive/60",
  },
  info: {
    icon: <Info size={14} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-l-2 border-blue-400/60",
  },
  success: {
    icon: <Sparkles size={14} />,
    color: "text-teal",
    bg: "bg-teal/10 border-l-2 border-teal/60",
  },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const existing = load();
    if (existing.length > 0) return existing;
    const seeded = SEED.map((s, i) => ({
      ...s,
      id: `seed_${i}`,
      timestamp: new Date(
        Date.now() - (SEED.length - i) * 3600000,
      ).toISOString(),
      read: false,
    }));
    save(seeded);
    return seeded;
  });

  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    save(notifications);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayed =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(LS_KEY);
  };

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((x) => (x.id === id ? { ...x, read: true } : x)),
    );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <Bell size={16} className="text-teal" />
        <h2 className="text-[13px] font-bold text-foreground tracking-tight">
          Notification Center
        </h2>
        {unreadCount > 0 && (
          <Badge className="bg-teal text-primary-foreground text-[10px] h-5 px-1.5">
            {unreadCount} unread
          </Badge>
        )}
        <div className="flex-1" />
        <Button
          data-ocid="notifications.mark_read.secondary_button"
          variant="outline"
          size="sm"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="text-[11px] h-7 px-3 gap-1.5 border-border"
        >
          <CheckCheck size={12} />
          Mark all read
        </Button>
        <Button
          data-ocid="notifications.clear.delete_button"
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-[11px] h-7 px-3 gap-1.5 text-destructive hover:text-destructive"
        >
          <Trash2 size={12} />
          Clear all
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-0 px-4 border-b border-border bg-card flex-shrink-0">
        {(["all", "unread"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            data-ocid={`notifications.${tab}.tab`}
            onClick={() => setFilter(tab)}
            className={`text-[11px] capitalize px-4 py-2 border-b-2 transition-colors ${
              filter === tab
                ? "border-teal text-teal"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {tab === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-teal/20 text-teal rounded-full px-1.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-auto p-4">
        {displayed.length === 0 ? (
          <div
            data-ocid="notifications.empty_state"
            className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground"
          >
            <BellOff size={28} className="opacity-20" />
            <span className="text-[12px]">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications"}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-w-2xl">
            {displayed.map((n, idx) => {
              const style = TYPE_STYLES[n.type];
              return (
                <button
                  type="button"
                  key={n.id}
                  data-ocid={`notifications.item.${idx + 1}`}
                  className={`flex items-start gap-3 px-4 py-3 rounded-sm text-left w-full ${
                    style.bg
                  } ${
                    !n.read ? "opacity-100" : "opacity-60"
                  } hover:opacity-80 transition-opacity`}
                  onClick={() => markRead(n.id)}
                >
                  <span className={`mt-0.5 flex-shrink-0 ${style.color}`}>
                    {style.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-foreground leading-snug">
                      {n.message}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {fmtDate(n.timestamp)}
                    </div>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-teal mt-1 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
