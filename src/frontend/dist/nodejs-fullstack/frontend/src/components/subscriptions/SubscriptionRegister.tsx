import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Template } from "./RecurringTemplates";

type BillingLog = { templateId: string; billedOn: string; amount: number };

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

export default function SubscriptionRegister() {
  const templates: Template[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("hk_recurring_templates") || "[]");
    } catch {
      return [];
    }
  })();

  const [log, setLog] = useState<BillingLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_subscription_log") || "[]");
    } catch {
      return [];
    }
  });

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const markBilled = (t: Template) => {
    const entry: BillingLog = {
      templateId: t.id,
      billedOn: new Date().toISOString().split("T")[0],
      amount: t.amount * (1 + t.gstPercent / 100),
    };
    const updated = [...log, entry];
    setLog(updated);
    localStorage.setItem("hk_subscription_log", JSON.stringify(updated));
    toast.success(`Marked as billed: ${t.name}`);
  };

  const filtered = templates.filter(
    (t) => statusFilter === "all" || t.status === statusFilter,
  );

  return (
    <div className="p-4 space-y-3" data-ocid="subscription_register.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          Subscription Register
        </h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="h-7 w-32 text-[11px]"
            data-ocid="subscription_register.filter.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-[11px]">
            {filtered.length} Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px]">
                  <TableHead>Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Last Billed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-[10px] text-muted-foreground py-6"
                      data-ocid="subscription_register.empty_state"
                    >
                      No subscriptions. Create templates first.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t, i) => {
                    const nextDue = calcNextDue(
                      t.startDate,
                      t.frequency,
                      log,
                      t.id,
                    );
                    const lastBilledEntry = log
                      .filter((l) => l.templateId === t.id)
                      .sort((a, b) => b.billedOn.localeCompare(a.billedOn))[0];
                    const today = new Date().toISOString().split("T")[0];
                    const isOverdue = nextDue <= today && t.status === "Active";
                    return (
                      <TableRow
                        key={t.id}
                        className={`text-[10px] ${isOverdue ? "bg-red-500/5" : ""}`}
                        data-ocid={`subscription_register.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>{t.customerName}</TableCell>
                        <TableCell className="text-right font-mono">
                          {(t.amount * (1 + t.gstPercent / 100)).toLocaleString(
                            "en-IN",
                          )}
                        </TableCell>
                        <TableCell>{t.frequency}</TableCell>
                        <TableCell
                          className={
                            isOverdue ? "text-destructive font-bold" : ""
                          }
                        >
                          {nextDue}
                        </TableCell>
                        <TableCell>
                          {lastBilledEntry?.billedOn || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              t.status === "Active"
                                ? "default"
                                : t.status === "Paused"
                                  ? "outline"
                                  : "secondary"
                            }
                            className="text-[9px]"
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {t.status === "Active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] gap-1"
                              onClick={() => markBilled(t)}
                              data-ocid={`subscription_register.bill.${i + 1}`}
                            >
                              <CheckCircle
                                size={10}
                                className="text-green-500"
                              />{" "}
                              Mark Billed
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
