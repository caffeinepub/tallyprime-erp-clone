import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Edit,
  History,
  Plus,
  Settings,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const RULES_KEY = "hisabkitab_rules";
const RULE_LOG_KEY = "hkp_rule_log";

type RuleType =
  | "auto_gst"
  | "approval_threshold"
  | "recurring_entry"
  | "auto_narration"
  | "late_payment_interest"
  | "gst_round_off"
  | "budget_overage_alert";

interface Rule {
  id: string;
  name: string;
  type: RuleType;
  condition: string;
  action: string;
  active: boolean;
  createdAt: string;
  priority: number;
}

interface RuleLogEntry {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: string;
  detail: string;
}

const DEFAULT_RULES: Rule[] = [
  {
    id: "r1",
    name: "GST 18% for Sales Ledger",
    type: "auto_gst",
    condition: "Ledger Group = Sales",
    action: "Apply GST 18%",
    active: true,
    createdAt: new Date().toISOString(),
    priority: 1,
  },
  {
    id: "r2",
    name: "Approval Required for Large Payments",
    type: "approval_threshold",
    condition: "Voucher Amount > \u20b950,000",
    action: "Require Maker-Checker Approval",
    active: true,
    createdAt: new Date().toISOString(),
    priority: 2,
  },
  {
    id: "r3",
    name: "Monthly Salary Recurring Entry",
    type: "recurring_entry",
    condition: "Every month on 1st",
    action: "Create Payment Voucher \u20b92,50,000 \u2014 Salary Expense",
    active: false,
    createdAt: new Date().toISOString(),
    priority: 3,
  },
  {
    id: "r4",
    name: "Auto Narration for Sales",
    type: "auto_narration",
    condition: "Voucher Type = Sales",
    action: 'Generate: "Sale of goods to [Party] on [Date]"',
    active: true,
    createdAt: new Date().toISOString(),
    priority: 4,
  },
  {
    id: "r5",
    name: "Late Payment Interest 18%",
    type: "late_payment_interest",
    condition: "Overdue > 30 days",
    action: "Calculate interest @ 18% p.a. on overdue amount",
    active: false,
    createdAt: new Date().toISOString(),
    priority: 5,
  },
  {
    id: "r6",
    name: "GST Round-Off",
    type: "gst_round_off",
    condition: "GST Amount has decimals",
    action: "Round off to nearest rupee",
    active: true,
    createdAt: new Date().toISOString(),
    priority: 6,
  },
  {
    id: "r7",
    name: "Budget Overage Alert",
    type: "budget_overage_alert",
    condition: "Expense > Budget by 10%",
    action: "Send alert to admin",
    active: true,
    createdAt: new Date().toISOString(),
    priority: 7,
  },
];

const DEMO_LOG: RuleLogEntry[] = [
  {
    id: "l1",
    ruleId: "r1",
    ruleName: "GST 18% for Sales Ledger",
    triggeredAt: new Date(Date.now() - 3600000).toISOString(),
    detail: "Applied on voucher SAL-2026-0142 for \u20b975,000",
  },
  {
    id: "l2",
    ruleId: "r2",
    ruleName: "Approval Required for Large Payments",
    triggeredAt: new Date(Date.now() - 7200000).toISOString(),
    detail: "Triggered for PAY-2026-0312, amount \u20b91,25,000",
  },
  {
    id: "l3",
    ruleId: "r4",
    ruleName: "Auto Narration for Sales",
    triggeredAt: new Date(Date.now() - 1800000).toISOString(),
    detail: "Generated narration for SAL-2026-0144",
  },
  {
    id: "l4",
    ruleId: "r6",
    ruleName: "GST Round-Off",
    triggeredAt: new Date(Date.now() - 900000).toISOString(),
    detail: "Rounded \u20b9847.35 to \u20b9847 on PUR-2026-0201",
  },
];

function loadRules(): Rule[] {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Rule[];
      return parsed.map((r, i) => ({ ...r, priority: r.priority ?? i + 1 }));
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_RULES;
}

function saveRules(rules: Rule[]) {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

function loadLog(): RuleLogEntry[] {
  try {
    const raw = localStorage.getItem(RULE_LOG_KEY);
    if (raw) return JSON.parse(raw) as RuleLogEntry[];
  } catch {
    /* ignore */
  }
  return DEMO_LOG;
}

const TYPE_LABELS: Record<RuleType, string> = {
  auto_gst: "Auto GST Rate",
  approval_threshold: "Approval Threshold",
  recurring_entry: "Recurring Entry",
  auto_narration: "Auto Narration",
  late_payment_interest: "Late Payment Interest",
  gst_round_off: "GST Round-off",
  budget_overage_alert: "Budget Overage Alert",
};

const TYPE_COLORS: Record<RuleType, string> = {
  auto_gst: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  approval_threshold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  recurring_entry: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  auto_narration: "bg-teal/20 text-teal border-teal/40",
  late_payment_interest:
    "bg-orange-500/20 text-orange-400 border-orange-500/40",
  gst_round_off: "bg-green-500/20 text-green-400 border-green-500/40",
  budget_overage_alert: "bg-red-500/20 text-red-400 border-red-500/40",
};

const GST_RATES = ["5", "12", "18", "28"];
const LEDGER_GROUPS = [
  "Sales",
  "Purchase",
  "Expenses",
  "Income",
  "Assets",
  "Liabilities",
];
const VOUCHER_TYPES = ["Payment", "Receipt", "Journal", "Sales", "Purchase"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly"];

export default function RuleEngine() {
  const [rules, setRules] = useState<Rule[]>(loadRules);
  const [log] = useState<RuleLogEntry[]>(loadLog);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  // Form state
  const [ruleType, setRuleType] = useState<RuleType>("auto_gst");
  const [ruleName, setRuleName] = useState("");
  const [gstLedgerGroup, setGstLedgerGroup] = useState("Sales");
  const [gstRate, setGstRate] = useState("18");
  const [approvalAmount, setApprovalAmount] = useState("50000");
  const [recurFreq, setRecurFreq] = useState("Monthly");
  const [recurDay, setRecurDay] = useState("1");
  const [recurVoucher, setRecurVoucher] = useState("Payment");
  const [recurAmount, setRecurAmount] = useState("");
  const [recurNarration, setRecurNarration] = useState("");

  const resetForm = () => {
    setRuleType("auto_gst");
    setRuleName("");
    setGstLedgerGroup("Sales");
    setGstRate("18");
    setApprovalAmount("50000");
    setRecurFreq("Monthly");
    setRecurDay("1");
    setRecurVoucher("Payment");
    setRecurAmount("");
    setRecurNarration("");
    setEditId(null);
  };

  const buildConditionAction = (): { condition: string; action: string } => {
    if (ruleType === "auto_gst") {
      return {
        condition: `Ledger Group = ${gstLedgerGroup}`,
        action: `Apply GST ${gstRate}%`,
      };
    }
    if (ruleType === "approval_threshold") {
      return {
        condition: `Voucher Amount > \u20b9${Number(approvalAmount).toLocaleString("en-IN")}`,
        action: "Require Maker-Checker Approval",
      };
    }
    if (ruleType === "auto_narration") {
      return {
        condition: "Voucher Type = any",
        action: 'Generate: "[Type] for [Party] on [Date]"',
      };
    }
    if (ruleType === "late_payment_interest") {
      return {
        condition: "Overdue > 30 days",
        action: "Calculate interest @ 18% p.a.",
      };
    }
    if (ruleType === "gst_round_off") {
      return {
        condition: "GST Amount has decimals",
        action: "Round off to nearest rupee",
      };
    }
    if (ruleType === "budget_overage_alert") {
      return {
        condition: "Expense exceeds budget",
        action: "Alert admin of overage",
      };
    }
    return {
      condition: `Every ${recurFreq} on ${recurDay}${recurFreq === "Monthly" ? "st/th" : ""}`,
      action: `Create ${recurVoucher} Voucher \u20b9${Number(recurAmount || 0).toLocaleString("en-IN")} \u2014 ${recurNarration || "Recurring entry"}`,
    };
  };

  const handleSave = () => {
    if (!ruleName.trim()) {
      toast.error("Rule name is required");
      return;
    }
    const { condition, action } = buildConditionAction();
    const newRule: Rule = {
      id: editId ?? `r${Date.now()}`,
      name: ruleName.trim(),
      type: ruleType,
      condition,
      action,
      active: true,
      createdAt: new Date().toISOString(),
      priority: editId
        ? (rules.find((r) => r.id === editId)?.priority ?? rules.length + 1)
        : rules.length + 1,
    };
    const updated = editId
      ? rules.map((r) => (r.id === editId ? newRule : r))
      : [...rules, newRule];
    setRules(updated);
    saveRules(updated);
    toast.success(editId ? "Rule updated!" : "Rule created!");
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    saveRules(updated);
    toast.success("Rule deleted");
  };

  const handleToggle = (id: string) => {
    const updated = rules.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r,
    );
    setRules(updated);
    saveRules(updated);
  };

  const handleEdit = (rule: Rule) => {
    setEditId(rule.id);
    setRuleName(rule.name);
    setRuleType(rule.type);
    setShowForm(true);
  };

  const movePriority = (id: string, dir: "up" | "down") => {
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);
    const idx = sorted.findIndex((r) => r.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === sorted.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const tmp = sorted[idx].priority;
    sorted[idx] = { ...sorted[idx], priority: sorted[swapIdx].priority };
    sorted[swapIdx] = { ...sorted[swapIdx], priority: tmp };
    setRules(sorted);
    saveRules(sorted);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hkp_rules.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rules exported!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as Rule[];
        setRules(imported);
        saveRules(imported);
        toast.success(`Imported ${imported.length} rules!`);
      } catch {
        toast.error("Invalid rules file");
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = "";
  };

  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Zap size={16} className="text-teal" />
            Rule Engine \u2014 Automation Rules
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define rules for auto GST, approval triggers, narration, and
            recurring entries
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={() => importRef.current?.click()}
            data-ocid="rule_engine.import.button"
          >
            <Upload size={11} className="mr-1" />
            Import
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={handleExport}
            data-ocid="rule_engine.export.button"
          >
            <Download size={11} className="mr-1" />
            Export
          </Button>
          <Button
            size="sm"
            className="text-xs h-7"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            data-ocid="rule_engine.add_button"
          >
            <Plus size={11} className="mr-1" />
            Add Rule
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rules">
        <TabsList className="h-8">
          <TabsTrigger
            value="rules"
            className="text-xs"
            data-ocid="rule_engine.rules.tab"
          >
            Rules ({rules.length})
          </TabsTrigger>
          <TabsTrigger
            value="log"
            className="text-xs"
            data-ocid="rule_engine.log.tab"
          >
            <History size={11} className="mr-1" />
            Rule Log ({log.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-3 space-y-3">
          {/* Add/Edit Form */}
          {showForm && (
            <div
              className="border border-border rounded p-4 space-y-4 bg-card"
              data-ocid="rule_engine.dialog"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {editId ? "Edit Rule" : "New Rule"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Rule Name *</Label>
                  <Input
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g. GST 18% for Electronics"
                    className="h-8 text-xs"
                    data-ocid="rule_engine.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Rule Type</Label>
                  <Select
                    value={ruleType}
                    onValueChange={(v) => setRuleType(v as RuleType)}
                  >
                    <SelectTrigger
                      className="h-8 text-xs"
                      data-ocid="rule_engine.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TYPE_LABELS) as RuleType[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {ruleType === "auto_gst" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Ledger Group</Label>
                    <Select
                      value={gstLedgerGroup}
                      onValueChange={setGstLedgerGroup}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEDGER_GROUPS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">GST Rate (%)</Label>
                    <Select value={gstRate} onValueChange={setGstRate}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GST_RATES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {ruleType === "approval_threshold" && (
                <div className="space-y-1 max-w-xs">
                  <Label className="text-xs">Amount Threshold (\u20b9)</Label>
                  <Input
                    type="number"
                    value={approvalAmount}
                    onChange={(e) => setApprovalAmount(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}

              {ruleType === "recurring_entry" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Frequency</Label>
                    <Select value={recurFreq} onValueChange={setRecurFreq}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Day</Label>
                    <Input
                      value={recurDay}
                      onChange={(e) => setRecurDay(e.target.value)}
                      className="h-8 text-xs"
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Voucher Type</Label>
                    <Select
                      value={recurVoucher}
                      onValueChange={setRecurVoucher}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOUCHER_TYPES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Amount (\u20b9)</Label>
                    <Input
                      type="number"
                      value={recurAmount}
                      onChange={(e) => setRecurAmount(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Narration</Label>
                    <Input
                      value={recurNarration}
                      onChange={(e) => setRecurNarration(e.target.value)}
                      className="h-8 text-xs"
                      placeholder="Monthly salary expense"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="text-xs"
                  data-ocid="rule_engine.save_button"
                >
                  {editId ? "Update Rule" : "Save Rule"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  data-ocid="rule_engine.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Rules Table */}
          <div
            className="border border-border rounded overflow-hidden"
            data-ocid="rule_engine.table"
          >
            <Table>
              <TableHeader>
                <TableRow className="h-8">
                  <TableHead className="text-xs w-12">Order</TableHead>
                  <TableHead className="text-xs">Rule Name</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Condition
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Action
                  </TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-xs text-muted-foreground py-8"
                      data-ocid="rule_engine.empty_state"
                    >
                      No rules defined. Click \"Add Rule\" to create your first
                      automation rule.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((rule, i) => (
                    <TableRow
                      key={rule.id}
                      className="h-9"
                      data-ocid={`rule_engine.item.${i + 1}`}
                    >
                      <TableCell className="text-xs">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => movePriority(rule.id, "up")}
                            className="hover:text-teal disabled:opacity-30"
                            data-ocid={`rule_engine.move_up.${i + 1}.button`}
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePriority(rule.id, "down")}
                            className="hover:text-teal disabled:opacity-30"
                            data-ocid={`rule_engine.move_down.${i + 1}.button`}
                          >
                            <ArrowDown size={10} />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {rule.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[9px] px-1.5 py-0 ${TYPE_COLORS[rule.type]}`}
                        >
                          {TYPE_LABELS[rule.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                        {rule.condition}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                        {rule.action}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleToggle(rule.id)}
                          data-ocid={`rule_engine.toggle.${i + 1}`}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            rule.active
                              ? "bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30"
                              : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                          }`}
                        >
                          {rule.active ? "Active" : "Inactive"}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(rule)}
                            data-ocid={`rule_engine.edit_button.${i + 1}`}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
                          >
                            <Edit size={11} className="text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rule.id)}
                            data-ocid={`rule_engine.delete_button.${i + 1}`}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={11} className="text-destructive" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="log" className="mt-3">
          {log.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-xs"
              data-ocid="rule_engine.log.empty_state"
            >
              No rule triggers logged yet.
            </div>
          ) : (
            <div className="border border-border rounded overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="text-xs">Rule Name</TableHead>
                    <TableHead className="text-xs">Detail</TableHead>
                    <TableHead className="text-xs">Triggered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.map((entry, i) => (
                    <TableRow
                      key={entry.id}
                      className="h-9"
                      data-ocid={`rule_engine.log.item.${i + 1}`}
                    >
                      <TableCell className="text-xs font-medium text-teal">
                        {entry.ruleName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.detail}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(entry.triggeredAt).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Settings size={10} />
        Rules are evaluated in priority order. Use arrows to reorder.
      </div>
    </div>
  );
}
