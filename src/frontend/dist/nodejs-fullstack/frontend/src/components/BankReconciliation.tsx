import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { BankAccount, BankTransaction, Company } from "../backend.d";
import { useBankingActor } from "../hooks/useBankingActor";

interface Props {
  company: Company;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n,
  );

const emptyTxn = {
  date: "",
  description: "",
  amount: "",
  transactionType: "Debit",
};

export default function BankReconciliation({ company }: Props) {
  const { actor } = useBankingActor();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [txnForm, setTxnForm] = useState(emptyTxn);
  const [saving, setSaving] = useState(false);

  const loadAccounts = useCallback(async () => {
    if (!actor) return;
    try {
      const accs = await actor.getAllBankAccounts(BigInt(company.id));
      setAccounts(accs.filter((a: BankAccount) => a.isActive));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load accounts");
    }
  }, [actor, company.id]);

  const loadTransactions = useCallback(async () => {
    if (!actor || !selectedAccount) return;
    setLoading(true);
    try {
      const txns = await actor.getBankTransactions(
        BigInt(company.id),
        BigInt(selectedAccount),
      );
      setTransactions(txns);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [actor, company.id, selectedAccount]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleReconcile = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.reconcileTransaction(id, null, "");
      toast.success("Transaction reconciled");
      loadTransactions();
    } catch (e: any) {
      toast.error(e?.message || "Reconcile failed");
    }
  };

  const handleUnreconcile = async (id: bigint) => {
    if (!actor) return;
    try {
      await actor.unreconcileTransaction(id);
      toast.success("Transaction unreconciled");
      loadTransactions();
    } catch (e: any) {
      toast.error(e?.message || "Unreconcile failed");
    }
  };

  const handleAddTransaction = async () => {
    if (!actor || !selectedAccount) return;
    if (!txnForm.date || !txnForm.description || !txnForm.amount) {
      toast.error("Fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const date = BigInt(new Date(txnForm.date).getTime() * 1_000_000);
      await actor.createBankTransaction(
        BigInt(company.id),
        BigInt(selectedAccount),
        date,
        txnForm.description,
        Number.parseFloat(txnForm.amount),
        txnForm.transactionType,
        null,
      );
      toast.success("Transaction added");
      setAddOpen(false);
      setTxnForm(emptyTxn);
      loadTransactions();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add transaction");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(
    () => ({
      debits: transactions
        .filter((t) => t.transactionType === "Debit")
        .reduce((s, t) => s + t.amount, 0),
      credits: transactions
        .filter((t) => t.transactionType === "Credit")
        .reduce((s, t) => s + t.amount, 0),
      reconciled: transactions.filter((t) => t.isReconciled).length,
      unreconciled: transactions.filter((t) => !t.isReconciled).length,
    }),
    [transactions],
  );

  const tf = (k: keyof typeof emptyTxn, v: string) =>
    setTxnForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="flex flex-col h-full" data-ocid="bank_reconciliation.page">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-secondary/40 flex-shrink-0">
        <BarChart3 size={16} className="text-primary" />
        <span className="font-semibold text-sm">
          Bank Reconciliation — {company.name}
        </span>
        <div className="flex-1" />
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger
            className="w-72"
            data-ocid="bank_reconciliation.select"
          >
            <SelectValue placeholder="Select bank account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id.toString()} value={a.id.toString()}>
                {a.accountName} — {a.bankName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedAccount && (
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            data-ocid="bank_reconciliation.open_modal_button"
          >
            <Plus size={14} className="mr-1" /> Add Transaction
          </Button>
        )}
      </div>

      {/* Summary */}
      {selectedAccount && (
        <div className="grid grid-cols-4 gap-3 px-4 py-3 border-b border-border flex-shrink-0">
          {[
            {
              label: "Total Debits",
              value: fmt(summary.debits),
              color: "text-red-500",
            },
            {
              label: "Total Credits",
              value: fmt(summary.credits),
              color: "text-green-500",
            },
            {
              label: "Reconciled",
              value: summary.reconciled,
              color: "text-primary",
            },
            {
              label: "Unreconciled",
              value: summary.unreconciled,
              color: "text-yellow-500",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-sm p-3"
            >
              <div className={`text-xl font-bold font-mono ${s.color}`}>
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {!selectedAccount ? (
        <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
          Select a bank account to view transactions
        </div>
      ) : loading ? (
        <div
          className="flex items-center justify-center flex-1"
          data-ocid="bank_reconciliation.loading_state"
        >
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : transactions.length === 0 ? (
        <div
          className="flex items-center justify-center flex-1 text-muted-foreground text-sm"
          data-ocid="bank_reconciliation.empty_state"
        >
          No transactions. Click "Add Transaction" to begin.
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <Table data-ocid="bank_reconciliation.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t, i) => (
                <TableRow
                  key={t.id.toString()}
                  data-ocid={`bank_reconciliation.item.${i + 1}`}
                  className={t.isReconciled ? "bg-green-500/5" : ""}
                >
                  <TableCell>
                    {new Date(Number(t.date) / 1_000_000).toLocaleDateString(
                      "en-IN",
                    )}
                  </TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.transactionType === "Debit"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {t.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {fmt(t.amount)}
                  </TableCell>
                  <TableCell>
                    {t.isReconciled ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle2 size={14} /> Reconciled
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-xs">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {t.isReconciled ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnreconcile(t.id)}
                        data-ocid="bank_reconciliation.toggle"
                      >
                        <Undo2 size={12} className="mr-1" /> Undo
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReconcile(t.id)}
                        data-ocid="bank_reconciliation.button"
                      >
                        <CheckCircle2 size={12} className="mr-1" /> Reconcile
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="bank_reconciliation.dialog">
          <DialogHeader>
            <DialogTitle>Add Bank Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input
                type="date"
                value={txnForm.date}
                onChange={(e) => tf("date", e.target.value)}
                data-ocid="bank_reconciliation.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Description *</Label>
              <Input
                value={txnForm.description}
                onChange={(e) => tf("description", e.target.value)}
                placeholder="Transaction description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={txnForm.amount}
                  onChange={(e) => tf("amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label>Type *</Label>
                <Select
                  value={txnForm.transactionType}
                  onValueChange={(v) => tf("transactionType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="bank_reconciliation.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTransaction}
              disabled={saving}
              data-ocid="bank_reconciliation.submit_button"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {saving ? "Adding..." : "Add Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
