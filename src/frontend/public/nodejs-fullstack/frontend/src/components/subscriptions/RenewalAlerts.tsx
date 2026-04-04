import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bell, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Template } from "./RecurringTemplates";

type BillingLog = { templateId: string; billedOn: string };

function calcNextDue(
  startDate: string,
  frequency: Template["frequency"],
  log: BillingLog[],
  templateId: string,
): string {
  const lastBilled = log
    .filter((l) => l.templateId === templateId)
    .sort((a, b) => b.billedOn.localeCompare(a.billedOn))[0];
  const base = lastBilled ? new Date(lastBilled.billedOn) : new Date(startDate);
  const next = new Date(base);
  if (frequency === "Monthly") next.setMonth(next.getMonth() + 1);
  else if (frequency === "Quarterly") next.setMonth(next.getMonth() + 3);
  else next.setFullYear(next.getFullYear() + 1);
  return next.toISOString().split("T")[0];
}

export default function RenewalAlerts() {
  const templates: Template[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("hk_recurring_templates") || "[]");
    } catch {
      return [];
    }
  })();

  const log: BillingLog[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("hk_subscription_log") || "[]");
    } catch {
      return [];
    }
  })();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);
  const in30 = new Date(today);
  in30.setDate(today.getDate() + 30);

  const active = templates.filter((t) => t.status === "Active");

  const categorized = active.map((t) => {
    const nextDue = calcNextDue(t.startDate, t.frequency, log, t.id);
    const dueDate = new Date(nextDue);
    let category: "overdue" | "week" | "month" | "ok" = "ok";
    if (nextDue <= todayStr) category = "overdue";
    else if (dueDate <= in7) category = "week";
    else if (dueDate <= in30) category = "month";
    return { ...t, nextDue, category };
  });

  const overdue = categorized.filter((t) => t.category === "overdue");
  const week = categorized.filter((t) => t.category === "week");
  const month = categorized.filter((t) => t.category === "month");

  const sendReminder = (name: string) => {
    toast.success(`Reminder sent for: ${name} (simulated)`);
  };

  const Section = ({
    title,
    items,
    color,
    icon: Icon,
  }: {
    title: string;
    items: typeof categorized;
    color: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }) => (
    <Card className={`border-border ${items.length > 0 ? color : ""}`}>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-[11px] flex items-center gap-1.5">
          <Icon size={12} />
          {title}{" "}
          <Badge variant="outline" className="text-[9px] ml-1">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="px-3 pb-3 text-[10px] text-muted-foreground">None</p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((t, i) => (
              <div
                key={t.id}
                className="px-3 py-2 flex items-center justify-between"
                data-ocid={`renewal_alerts.${t.category}.item.${i + 1}`}
              >
                <div>
                  <div className="text-[10px] font-medium text-foreground">
                    {t.name}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {t.customerName} · {t.frequency} · ₹
                    {t.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[9px] font-bold text-foreground">
                    Due: {t.nextDue}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1"
                  onClick={() => sendReminder(t.name)}
                  data-ocid={`renewal_alerts.remind.${i + 1}`}
                >
                  <Bell size={10} /> Remind
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-4" data-ocid="renewal_alerts.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Bell size={14} className="text-teal" /> Renewal Alerts
        </h2>
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          <span>{overdue.length} overdue</span>
          <span>{week.length} due this week</span>
          <span>{month.length} due this month</span>
        </div>
      </div>

      {active.length === 0 ? (
        <Card className="border-border">
          <CardContent
            className="py-6 text-center text-[10px] text-muted-foreground"
            data-ocid="renewal_alerts.empty_state"
          >
            No active subscriptions.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <Section
            title="Overdue"
            items={overdue}
            color="border-red-400/50 bg-red-500/5"
            icon={AlertCircle}
          />
          <Section
            title="Due within 7 Days"
            items={week}
            color="border-orange-400/50 bg-orange-500/5"
            icon={Clock}
          />
          <Section
            title="Due within 30 Days"
            items={month}
            color="border-yellow-400/50 bg-yellow-500/5"
            icon={AlertCircle}
          />
          <Section
            title="All Good"
            items={categorized.filter((t) => t.category === "ok")}
            color=""
            icon={CheckCircle}
          />
        </div>
      )}
    </div>
  );
}
