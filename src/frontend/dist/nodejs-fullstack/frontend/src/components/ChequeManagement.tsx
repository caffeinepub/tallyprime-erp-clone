import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ChevronDown, Loader2, Receipt } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { BankAccount, ChequeEntry, Company } from "../backend.d";
import { useBankingActor } from "../hooks/useBankingActor";

interface Props {
  company: Company;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n,
  );

const statusVariant = (
  s: string,
): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "Cleared") return "default";
  if (s === "Bounced") return "destructive";
  if (s === "Cancelled") return "secondary";
  return "outline"; // Pending
};

const STATUSES = ["Cleared", "Bounced", "Cancelled"];

const emptyForm = {
  bankAccountId: "",
  chequeNumber: "",
  chequeDate: "",
  amount: "",
  payeeName: "",
  remarks: "",
};

export default function ChequeManagement({ company }: Props) {
  const { actor } = useBankingActor();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cheques, setCheques] = useState<ChequeEntry[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("issue");

  const load = useCallback(async () => {
    if (!actor) return;
    try {
      const accs = await actor.getAllBankAccounts(BigInt(company.id));
      setBankAccounts(accs.filter((a: BankAccount) => a.isActive));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load accounts");
    }
  }, [actor, company.id]);

  const loadCheques = useCallback(async () => {
    if (!actor || !form.bankAccountId) return;
    try {
      const c = await actor.getChequesByBankAccount(
        BigInt(company.id),
        BigInt(form.bankAccountId),
      );
      setCheques(c);
    } catch {
      /* ignore */
    }
  }, [actor, company.id, form.bankAccountId]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    loadCheques();
  }, [loadCheques]);

  const f = (k: keyof typeof emptyForm, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!actor) return;
    if (
      !form.bankAccountId ||
      !form.chequeNumber ||
      !form.chequeDate ||
      !form.amount ||
      !form.payeeName
    ) {
      toast.error("Fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const chequeType = tab === "issue" ? "Issued" : "Received";
      const date = BigInt(new Date(form.chequeDate).getTime() * 1_000_000);
      await actor.createChequeEntry(
        BigInt(company.id),
        BigInt(form.bankAccountId),
        form.chequeNumber,
        date,
        Number.parseFloat(form.amount),
        form.payeeName,
        chequeType,
        form.remarks,
      );
      toast.success(`Cheque ${chequeType} recorded`);
      setForm((prev) => ({
        ...prev,
        chequeNumber: "",
        amount: "",
        payeeName: "",
        remarks: "",
        chequeDate: "",
      }));
      loadCheques();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save cheque");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: bigint, status: string) => {
    if (!actor) return;
    try {
      await actor.updateChequeStatus(id, status, "");
      toast.success(`Cheque marked as ${status}`);
      loadCheques();
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col h-full" data-ocid="cheque_management.page">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-secondary/40 flex-shrink-0">
        <Receipt size={16} className="text-primary" />
        <span className="font-semibold text-sm">
          Cheque Entry — {company.name}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Form Panel */}
        <div className="w-96 border-r border-border flex-shrink-0 flex flex-col">
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex flex-col flex-1"
          >
            <TabsList className="w-full rounded-none border-b border-border">
              <TabsTrigger
                value="issue"
                className="flex-1"
                data-ocid="cheque_management.tab"
              >
                Issue Cheque
              </TabsTrigger>
              <TabsTrigger
                value="receive"
                className="flex-1"
                data-ocid="cheque_management.tab"
              >
                Receive Cheque
              </TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="flex-1 p-4 space-y-3">
              <div className="space-y-1">
                <Label>Bank Account *</Label>
                <Select
                  value={form.bankAccountId}
                  onValueChange={(v) => f("bankAccountId", v)}
                >
                  <SelectTrigger data-ocid="cheque_management.select">
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((a) => (
                      <SelectItem key={a.id.toString()} value={a.id.toString()}>
                        {a.accountName} — {a.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Cheque No *</Label>
                  <Input
                    className="font-mono"
                    data-ocid="cheque_management.input"
                    value={form.chequeNumber}
                    onChange={(e) => f("chequeNumber", e.target.value)}
                    placeholder="123456"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Cheque Date *</Label>
                  <Input
                    type="date"
                    value={form.chequeDate}
                    defaultValue={today}
                    onChange={(e) => f("chequeDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => f("amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label>{tab === "issue" ? "Payee" : "Drawer"} Name *</Label>
                <Input
                  value={form.payeeName}
                  onChange={(e) => f("payeeName", e.target.value)}
                  placeholder="Party name"
                />
              </div>
              <div className="space-y-1">
                <Label>Remarks</Label>
                <Input
                  value={form.remarks}
                  onChange={(e) => f("remarks", e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={saving}
                data-ocid="cheque_management.submit_button"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {saving
                  ? "Saving..."
                  : `Record ${tab === "issue" ? "Issued" : "Received"} Cheque`}
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cheques List */}
        <div className="flex-1 overflow-auto">
          {cheques.length === 0 ? (
            <div
              className="flex items-center justify-center h-full text-muted-foreground text-sm"
              data-ocid="cheque_management.empty_state"
            >
              {form.bankAccountId
                ? "No cheques for this account"
                : "Select a bank account to view cheques"}
            </div>
          ) : (
            <Table data-ocid="cheque_management.table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Cheque No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cheques.map((c, i) => (
                  <TableRow
                    key={c.id.toString()}
                    data-ocid={`cheque_management.item.${i + 1}`}
                  >
                    <TableCell className="font-mono">
                      {c.chequeNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        Number(c.chequeDate) / 1_000_000,
                      ).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>{c.chequeType}</TableCell>
                    <TableCell>{c.payeeName}</TableCell>
                    <TableCell className="text-right font-mono">
                      {fmt(c.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(c.status)}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.status === "Pending" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid="cheque_management.dropdown_menu"
                            >
                              Update <ChevronDown size={12} className="ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {STATUSES.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() => updateStatus(c.id, s)}
                              >
                                {s}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
