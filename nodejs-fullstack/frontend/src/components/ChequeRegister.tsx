import { Badge } from "@/components/ui/badge";
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
import { FileText, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  return "outline";
};

export default function ChequeRegister({ company }: Props) {
  const { actor } = useBankingActor();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [cheques, setCheques] = useState<ChequeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [accs, chqs] = await Promise.all([
        actor.getAllBankAccounts(BigInt(company.id)),
        actor.getAllCheques(BigInt(company.id)),
      ]);
      setAccounts(accs);
      setCheques(chqs);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load cheques");
    } finally {
      setLoading(false);
    }
  }, [actor, company.id]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return cheques.filter((c) => {
      if (
        filterAccount !== "all" &&
        c.bankAccountId.toString() !== filterAccount
      )
        return false;
      if (filterType !== "all" && c.chequeType !== filterType) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      return true;
    });
  }, [cheques, filterAccount, filterType, filterStatus]);

  const accountName = (id: bigint) =>
    accounts.find((a) => a.id === id)?.accountName ?? id.toString();

  const summary = useMemo(
    () => ({
      issued: cheques.filter((c) => c.chequeType === "Issued").length,
      received: cheques.filter((c) => c.chequeType === "Received").length,
      pending: cheques.filter((c) => c.status === "Pending").length,
      bounced: cheques.filter((c) => c.status === "Bounced").length,
    }),
    [cheques],
  );

  return (
    <div className="flex flex-col h-full" data-ocid="cheque_register.page">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-secondary/40 flex-shrink-0">
        <FileText size={16} className="text-primary" />
        <span className="font-semibold text-sm">
          Cheque Register — {company.name}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 border-b border-border flex-shrink-0">
        {[
          {
            label: "Total Issued",
            value: summary.issued,
            color: "text-blue-500",
          },
          {
            label: "Total Received",
            value: summary.received,
            color: "text-green-500",
          },
          {
            label: "Pending Clearance",
            value: summary.pending,
            color: "text-yellow-500",
          },
          { label: "Bounced", value: summary.bounced, color: "text-red-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-sm p-3"
          >
            <div className={`text-2xl font-bold font-mono ${s.color}`}>
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border flex-shrink-0">
        <Select value={filterAccount} onValueChange={setFilterAccount}>
          <SelectTrigger className="w-52" data-ocid="cheque_register.select">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id.toString()} value={a.id.toString()}>
                {a.accountName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Issued">Issued</SelectItem>
            <SelectItem value="Received">Received</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Cleared">Cleared</SelectItem>
            <SelectItem value="Bounced">Bounced</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} record(s)
        </span>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center flex-1"
          data-ocid="cheque_register.loading_state"
        >
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex items-center justify-center flex-1 text-muted-foreground text-sm"
          data-ocid="cheque_register.empty_state"
        >
          No cheques found.
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <Table data-ocid="cheque_register.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Cheque No</TableHead>
                <TableHead>Bank Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payee</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, i) => (
                <TableRow
                  key={c.id.toString()}
                  data-ocid={`cheque_register.item.${i + 1}`}
                >
                  <TableCell>
                    {new Date(
                      Number(c.chequeDate) / 1_000_000,
                    ).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="font-mono">{c.chequeNumber}</TableCell>
                  <TableCell>{accountName(c.bankAccountId)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.chequeType === "Issued" ? "outline" : "secondary"
                      }
                    >
                      {c.chequeType}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.payeeName}</TableCell>
                  <TableCell className="text-right font-mono">
                    {fmt(c.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
