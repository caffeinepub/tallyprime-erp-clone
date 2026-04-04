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
import { BookOpen, CheckCircle2, Clock, Loader2 } from "lucide-react";
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

export default function BankStatement({ company }: Props) {
  const { actor } = useBankingActor();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const todayStr = now.toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(todayStr);

  const loadAccounts = useCallback(async () => {
    if (!actor) return;
    try {
      const accs = await actor.getAllBankAccounts(BigInt(company.id));
      setAccounts(accs);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load accounts");
    }
  }, [actor, company.id]);

  const loadStatement = useCallback(async () => {
    if (!actor || !selectedAccount || !fromDate || !toDate) return;
    setLoading(true);
    try {
      const from = BigInt(new Date(fromDate).getTime() * 1_000_000);
      const to = BigInt(new Date(`${toDate}T23:59:59`).getTime() * 1_000_000);
      const txns = await actor.getBankStatement(
        BigInt(company.id),
        BigInt(selectedAccount),
        from,
        to,
      );
      setTransactions(txns);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load statement");
    } finally {
      setLoading(false);
    }
  }, [actor, company.id, selectedAccount, fromDate, toDate]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const openingBalance = useMemo(() => {
    const acc = accounts.find((a) => a.id.toString() === selectedAccount);
    return acc?.openingBalance ?? 0;
  }, [accounts, selectedAccount]);

  const rows = useMemo(() => {
    let running = openingBalance;
    return transactions.map((t) => {
      const debit = t.transactionType === "Debit" ? t.amount : 0;
      const credit = t.transactionType === "Credit" ? t.amount : 0;
      running = running - debit + credit;
      return { ...t, debit, credit, balance: running };
    });
  }, [transactions, openingBalance]);

  const summary = useMemo(
    () => ({
      totalDebits: rows.reduce((s, r) => s + r.debit, 0),
      totalCredits: rows.reduce((s, r) => s + r.credit, 0),
      closingBalance:
        rows.length > 0 ? rows[rows.length - 1].balance : openingBalance,
    }),
    [rows, openingBalance],
  );

  return (
    <div className="flex flex-col h-full" data-ocid="bank_statement.page">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-secondary/40 flex-shrink-0">
        <BookOpen size={16} className="text-primary" />
        <span className="font-semibold text-sm">
          Bank Statement — {company.name}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-end gap-4 px-4 py-3 border-b border-border flex-shrink-0">
        <div className="space-y-1">
          <Label>Bank Account</Label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-72" data-ocid="bank_statement.select">
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
        </div>
        <div className="space-y-1">
          <Label>From Date</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            data-ocid="bank_statement.input"
          />
        </div>
        <div className="space-y-1">
          <Label>To Date</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <Button
          onClick={loadStatement}
          disabled={!selectedAccount || loading}
          data-ocid="bank_statement.button"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Loading..." : "Show Statement"}
        </Button>
      </div>

      {!selectedAccount ? (
        <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
          Select a bank account and date range to view statement
        </div>
      ) : loading ? (
        <div
          className="flex items-center justify-center flex-1"
          data-ocid="bank_statement.loading_state"
        >
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto">
            <Table data-ocid="bank_statement.table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Reconciled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Opening Balance Row */}
                <TableRow className="bg-muted/30 font-medium">
                  <TableCell
                    colSpan={4}
                    className="text-xs text-muted-foreground"
                  >
                    Opening Balance
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {fmt(openingBalance)}
                  </TableCell>
                  <TableCell />
                </TableRow>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                      data-ocid="bank_statement.empty_state"
                    >
                      No transactions in this period
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, i) => (
                    <TableRow
                      key={r.id.toString()}
                      data-ocid={`bank_statement.item.${i + 1}`}
                    >
                      <TableCell>
                        {new Date(
                          Number(r.date) / 1_000_000,
                        ).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        {r.debit > 0 ? fmt(r.debit) : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {r.credit > 0 ? fmt(r.credit) : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {fmt(r.balance)}
                      </TableCell>
                      <TableCell>
                        {r.isReconciled ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle2 size={12} /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock size={12} /> No
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer Summary */}
          <div className="border-t border-border bg-muted/30 px-4 py-3 flex-shrink-0">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Opening Balance
                </div>
                <div className="font-mono font-semibold">
                  {fmt(openingBalance)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Total Debits
                </div>
                <div className="font-mono font-semibold text-red-600">
                  {fmt(summary.totalDebits)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Total Credits
                </div>
                <div className="font-mono font-semibold text-green-600">
                  {fmt(summary.totalCredits)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Closing Balance
                </div>
                <div className="font-mono font-semibold text-primary">
                  {fmt(summary.closingBalance)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
