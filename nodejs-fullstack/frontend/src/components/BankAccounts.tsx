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
import { Landmark, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { BankAccount, Company, Ledger } from "../backend.d";
import { useBankingActor } from "../hooks/useBankingActor";

interface Props {
  company: Company;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n,
  );

const emptyForm = {
  accountName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branchName: "",
  linkedLedgerId: "",
  openingBalance: "0",
  isActive: true,
};

export default function BankAccounts({ company }: Props) {
  const { actor } = useBankingActor();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [accs, ldgs] = await Promise.all([
        actor.getAllBankAccounts(BigInt(company.id)),
        actor.getAllLedgers(),
      ]);
      setAccounts(accs);
      // Filter ledgers that are likely bank accounts (group contains 'bank')
      setLedgers(ldgs);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  }, [actor, company.id]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (acc: BankAccount) => {
    setEditId(acc.id);
    setForm({
      accountName: acc.accountName,
      accountNumber: acc.accountNumber,
      ifscCode: acc.ifscCode,
      bankName: acc.bankName,
      branchName: acc.branchName,
      linkedLedgerId: acc.linkedLedgerId.toString(),
      openingBalance: acc.openingBalance.toString(),
      isActive: acc.isActive,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    if (
      !form.accountName ||
      !form.accountNumber ||
      !form.bankName ||
      !form.linkedLedgerId
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      if (editId !== null) {
        await actor.updateBankAccount(
          editId,
          form.accountName,
          form.accountNumber,
          form.ifscCode,
          form.bankName,
          form.branchName,
          BigInt(form.linkedLedgerId),
          Number.parseFloat(form.openingBalance) || 0,
          form.isActive,
        );
        toast.success("Bank account updated");
      } else {
        await actor.createBankAccount(
          BigInt(company.id),
          form.accountName,
          form.accountNumber,
          form.ifscCode,
          form.bankName,
          form.branchName,
          BigInt(form.linkedLedgerId),
          Number.parseFloat(form.openingBalance) || 0,
        );
        toast.success("Bank account created");
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const f = (k: keyof typeof emptyForm, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="flex flex-col h-full" data-ocid="bank_accounts.page">
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-secondary/40 flex-shrink-0">
        <Landmark size={16} className="text-primary" />
        <span className="font-semibold text-sm">
          Bank Accounts — {company.name}
        </span>
        <div className="flex-1" />
        <Button
          size="sm"
          onClick={openNew}
          data-ocid="bank_accounts.open_modal_button"
        >
          <Plus size={14} className="mr-1" /> New Bank Account
        </Button>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center flex-1"
          data-ocid="bank_accounts.loading_state"
        >
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : accounts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-2"
          data-ocid="bank_accounts.empty_state"
        >
          <Landmark size={40} className="opacity-30" />
          <p>No bank accounts. Click "New Bank Account" to add one.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <Table data-ocid="bank_accounts.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Account Name</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>IFSC</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((acc, i) => (
                <TableRow
                  key={acc.id.toString()}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => openEdit(acc)}
                  data-ocid={`bank_accounts.item.${i + 1}`}
                >
                  <TableCell className="font-medium">
                    {acc.accountName}
                  </TableCell>
                  <TableCell>{acc.bankName}</TableCell>
                  <TableCell className="font-mono">
                    {acc.accountNumber}
                  </TableCell>
                  <TableCell className="font-mono">{acc.ifscCode}</TableCell>
                  <TableCell>{acc.branchName}</TableCell>
                  <TableCell className="text-right font-mono">
                    {fmt(acc.openingBalance)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={acc.isActive ? "default" : "secondary"}>
                      {acc.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" data-ocid="bank_accounts.dialog">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Bank Account" : "New Bank Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Account Name *</Label>
              <Input
                data-ocid="bank_accounts.input"
                value={form.accountName}
                onChange={(e) => f("accountName", e.target.value)}
                placeholder="e.g. SBI Current Account"
              />
            </div>
            <div className="space-y-1">
              <Label>Bank Name *</Label>
              <Input
                value={form.bankName}
                onChange={(e) => f("bankName", e.target.value)}
                placeholder="State Bank of India"
              />
            </div>
            <div className="space-y-1">
              <Label>Account Number *</Label>
              <Input
                className="font-mono"
                value={form.accountNumber}
                onChange={(e) => f("accountNumber", e.target.value)}
                placeholder="00000XXXXXXXXXX"
              />
            </div>
            <div className="space-y-1">
              <Label>IFSC Code</Label>
              <Input
                className="font-mono"
                value={form.ifscCode}
                onChange={(e) => f("ifscCode", e.target.value)}
                placeholder="SBIN0001234"
              />
            </div>
            <div className="space-y-1">
              <Label>Branch Name</Label>
              <Input
                value={form.branchName}
                onChange={(e) => f("branchName", e.target.value)}
                placeholder="Main Branch"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Linked Ledger *</Label>
              <Select
                value={form.linkedLedgerId}
                onValueChange={(v) => f("linkedLedgerId", v)}
              >
                <SelectTrigger data-ocid="bank_accounts.select">
                  <SelectValue placeholder="Select bank ledger" />
                </SelectTrigger>
                <SelectContent>
                  {ledgers.map((l) => (
                    <SelectItem key={l.id.toString()} value={l.id.toString()}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Opening Balance</Label>
              <Input
                type="number"
                value={form.openingBalance}
                onChange={(e) => f("openingBalance", e.target.value)}
              />
            </div>
            {editId !== null && (
              <div className="space-y-1 flex flex-col justify-end">
                <Label>Status</Label>
                <Select
                  value={form.isActive ? "active" : "inactive"}
                  onValueChange={(v) => f("isActive", v === "active")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="bank_accounts.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              data-ocid="bank_accounts.save_button"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
