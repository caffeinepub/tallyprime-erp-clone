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
import { Edit, Plus, Settings, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const RULES_KEY = "hisabkitab_rules";

type RuleType = "auto_gst" | "approval_threshold" | "recurring_entry";

interface Rule {
  id: string;
  name: string;
  type: RuleType;
  condition: string;
  action: string;
  active: boolean;
  createdAt: string;
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
  },
  {
    id: "r2",
    name: "Approval Required for Large Payments",
    type: "approval_threshold",
    condition: "Voucher Amount > ₹50,000",
    action: "Require Maker-Checker Approval",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "r3",
    name: "Monthly Salary Recurring Entry",
    type: "recurring_entry",
    condition: "Every month on 1st",
    action: "Create Payment Voucher ₹2,50,000 — Salary Expense",
    active: false,
    createdAt: new Date().toISOString(),
  },
];

function loadRules(): Rule[] {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (raw) return JSON.parse(raw) as Rule[];
  } catch {
    /* ignore */
  }
  return DEFAULT_RULES;
}

function saveRules(rules: Rule[]) {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

const TYPE_LABELS: Record<RuleType, string> = {
  auto_gst: "Auto GST Rate",
  approval_threshold: "Approval Threshold",
  recurring_entry: "Recurring Entry",
};

const TYPE_COLORS: Record<RuleType, string> = {
  auto_gst: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  approval_threshold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  recurring_entry: "bg-purple-500/20 text-purple-400 border-purple-500/40",
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
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

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
        condition: `Voucher Amount > ₹${Number(approvalAmount).toLocaleString("en-IN")}`,
        action: "Require Maker-Checker Approval",
      };
    }
    return {
      condition: `Every ${recurFreq} on ${recurDay}${recurFreq === "Monthly" ? "st/th" : ""}`,
      action: `Create ${recurVoucher} Voucher ₹${Number(recurAmount || 0).toLocaleString("en-IN")} — ${recurNarration || "Recurring entry"}`,
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Zap size={16} className="text-teal" />
            Rule Engine — Automation Rules
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define rules for auto GST, approval triggers, and recurring entries
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="text-xs"
          data-ocid="rule_engine.add_button"
        >
          <Plus size={12} className="mr-1" />
          Add Rule
        </Button>
      </div>

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
                  <SelectItem value="auto_gst">Auto GST Rate</SelectItem>
                  <SelectItem value="approval_threshold">
                    Approval Threshold
                  </SelectItem>
                  <SelectItem value="recurring_entry">
                    Recurring Entry
                  </SelectItem>
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
              <Label className="text-xs">Amount Threshold (₹)</Label>
              <Input
                type="number"
                value={approvalAmount}
                onChange={(e) => setApprovalAmount(e.target.value)}
                placeholder="50000"
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Vouchers above this amount will require approval before posting
              </p>
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
                <Label className="text-xs">Day of Month/Week</Label>
                <Input
                  value={recurDay}
                  onChange={(e) => setRecurDay(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="1"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Voucher Type</Label>
                <Select value={recurVoucher} onValueChange={setRecurVoucher}>
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
                <Label className="text-xs">Amount (₹)</Label>
                <Input
                  type="number"
                  value={recurAmount}
                  onChange={(e) => setRecurAmount(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="250000"
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
            {rules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-xs text-muted-foreground py-8"
                  data-ocid="rule_engine.empty_state"
                >
                  No rules defined yet. Click "Add Rule" to create your first
                  automation rule.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule, i) => (
                <TableRow
                  key={rule.id}
                  className="h-9"
                  data-ocid={`rule_engine.item.${i + 1}`}
                >
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

      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Settings size={10} />
        Rules are evaluated in order. Active rules run automatically when
        conditions are met.
      </div>
    </div>
  );
}
