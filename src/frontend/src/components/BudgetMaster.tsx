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
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Company } from "../backend.d";

interface Budget {
  id: string;
  name: string;
  ledgerName: string;
  ledgerGroup: string;
  amount: number;
  period: "Monthly" | "Quarterly" | "Annual";
  financialYear: string;
  createdAt: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    v,
  );

const currentFY = () => {
  const now = new Date();
  const yr = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${yr}-${String(yr + 1).slice(-2)}`;
};

const EMPTY: Omit<Budget, "id" | "createdAt"> = {
  name: "",
  ledgerName: "",
  ledgerGroup: "Expense",
  amount: 0,
  period: "Monthly",
  financialYear: currentFY(),
};

export default function BudgetMaster({ company }: { company: Company }) {
  const key = `hkp-budgets-${company.id}`;
  const load = (): Budget[] => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "[]");
    } catch {
      return [];
    }
  };

  const [budgets, setBudgets] = useState<Budget[]>(load);
  const [form, setForm] = useState<Omit<Budget, "id" | "createdAt">>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const save = (list: Budget[]) => {
    setBudgets(list);
    localStorage.setItem(key, JSON.stringify(list));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError("Budget name is required");
      return;
    }
    if (!form.ledgerName.trim()) {
      setError("Ledger name is required");
      return;
    }
    if (form.amount <= 0) {
      setError("Amount must be > 0");
      return;
    }
    setError("");
    if (editId) {
      save(budgets.map((b) => (b.id === editId ? { ...b, ...form } : b)));
      setEditId(null);
    } else {
      save([
        ...budgets,
        {
          ...form,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setForm(EMPTY);
  };

  const handleEdit = (b: Budget) => {
    setEditId(b.id);
    setForm({
      name: b.name,
      ledgerName: b.ledgerName,
      ledgerGroup: b.ledgerGroup,
      amount: b.amount,
      period: b.period,
      financialYear: b.financialYear,
    });
  };

  const handleDelete = (id: string) => save(budgets.filter((b) => b.id !== id));

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="tally-section-header mb-4">
        Budget Master — {company.name}
      </div>

      {/* Form */}
      <div className="bg-card border border-border p-4 mb-4">
        <div className="text-[11px] font-semibold text-teal uppercase tracking-wide mb-3">
          {editId ? "Edit Budget" : "Create Budget"}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="tally-label">Budget Name *</Label>
            <Input
              data-ocid="budget.name.input"
              className="tally-input"
              placeholder="e.g. Marketing Q1"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <Label className="tally-label">Ledger Name *</Label>
            <Input
              data-ocid="budget.ledger_name.input"
              className="tally-input"
              placeholder="e.g. Advertising Expenses"
              value={form.ledgerName}
              onChange={(e) => set("ledgerName", e.target.value)}
            />
          </div>
          <div>
            <Label className="tally-label">Ledger Group</Label>
            <Select
              value={form.ledgerGroup}
              onValueChange={(v) => set("ledgerGroup", v)}
            >
              <SelectTrigger
                data-ocid="budget.ledger_group.select"
                className="tally-input"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Income", "Expense", "Assets", "Liabilities"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="tally-label">Amount (₹) *</Label>
            <Input
              data-ocid="budget.amount.input"
              className="tally-input font-mono"
              type="number"
              min={0}
              placeholder="0"
              value={form.amount || ""}
              onChange={(e) =>
                set("amount", Number.parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <Label className="tally-label">Period</Label>
            <Select
              value={form.period}
              onValueChange={(v) => set("period", v as Budget["period"])}
            >
              <SelectTrigger
                data-ocid="budget.period.select"
                className="tally-input"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Monthly", "Quarterly", "Annual"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="tally-label">Financial Year</Label>
            <Input
              data-ocid="budget.fy.input"
              className="tally-input"
              placeholder="2025-26"
              value={form.financialYear}
              onChange={(e) => set("financialYear", e.target.value)}
            />
          </div>
        </div>
        {error && (
          <div
            data-ocid="budget.error_state"
            className="text-destructive text-[11px] mt-2"
          >
            {error}
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Button
            data-ocid="budget.submit_button"
            size="sm"
            className="bg-teal text-primary-foreground hover:bg-teal/80 text-[11px]"
            onClick={handleSubmit}
          >
            <Plus size={12} className="mr-1" />
            {editId ? "Update Budget" : "Add Budget"}
          </Button>
          {editId && (
            <Button
              data-ocid="budget.cancel_button"
              size="sm"
              variant="outline"
              className="text-[11px]"
              onClick={() => {
                setEditId(null);
                setForm(EMPTY);
                setError("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border">
        <div className="text-[11px] font-semibold text-teal uppercase tracking-wide px-4 py-2 border-b border-border">
          Budget List ({budgets.length})
        </div>
        {budgets.length === 0 ? (
          <div
            data-ocid="budget.empty_state"
            className="text-center text-muted-foreground text-[12px] py-8"
          >
            No budgets created yet. Create your first budget above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {[
                    "Budget Name",
                    "Ledger",
                    "Group",
                    "Period",
                    "FY",
                    "Amount",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-semibold text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {budgets.map((b, i) => (
                  <tr
                    key={b.id}
                    data-ocid={`budget.item.${i + 1}`}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-medium text-foreground">
                      {b.name}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {b.ledgerName}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 bg-teal/10 text-teal text-[10px] rounded-sm">
                        {b.ledgerGroup}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {b.period}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {b.financialYear}
                    </td>
                    <td className="px-3 py-2 font-mono text-foreground">
                      {fmt(b.amount)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          data-ocid={`budget.edit_button.${i + 1}`}
                          onClick={() => handleEdit(b)}
                          className="p-1 hover:bg-teal/10 text-teal rounded-sm transition-colors"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          type="button"
                          data-ocid={`budget.delete_button.${i + 1}`}
                          onClick={() => handleDelete(b.id)}
                          className="p-1 hover:bg-destructive/10 text-destructive rounded-sm transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
