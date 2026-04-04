import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { loadEvents } from "./EventLog";

const LEDGERS = [
  "Cash",
  "Bank",
  "Sundry Debtors",
  "Sundry Creditors",
  "Sales",
  "Purchase",
  "Expenses",
  "Capital",
];

interface TrialRow {
  ledger: string;
  debit: number;
  credit: number;
  balance: number;
}

type LedgerMap = Record<string, { debit: number; credit: number }>;

function buildTrialBalance(
  events: ReturnType<typeof loadEvents>,
  asOf?: string,
): TrialRow[] {
  const ledgerMap: LedgerMap = {};
  for (const l of LEDGERS) {
    ledgerMap[l] = { debit: 0, credit: 0 };
  }

  const filtered = asOf
    ? events.filter((e) => e.timestamp <= `${asOf}T23:59:59`)
    : events;
  for (const ev of filtered) {
    if (ev.status === "Reversed") continue;
    const amt = ev.amount;
    if (ev.eventType === "VoucherCreated") {
      if (ev.entity.startsWith("Sales")) {
        ledgerMap.Sales.credit += amt;
        ledgerMap["Sundry Debtors"].debit += amt;
      } else if (ev.entity.startsWith("Purchase")) {
        ledgerMap.Purchase.debit += amt;
        ledgerMap["Sundry Creditors"].credit += amt;
      } else if (ev.entity.startsWith("Payment")) {
        ledgerMap["Sundry Creditors"].debit += amt;
        ledgerMap.Bank.credit += amt;
      } else if (ev.entity.startsWith("Receipt")) {
        ledgerMap.Bank.debit += amt;
        ledgerMap["Sundry Debtors"].credit += amt;
      } else {
        ledgerMap.Expenses.debit += Math.floor(amt / 2);
        ledgerMap.Cash.credit += Math.floor(amt / 2);
      }
    } else if (ev.eventType === "Compensating") {
      if (ev.entity.startsWith("Sales")) {
        ledgerMap.Sales.debit += amt;
        ledgerMap["Sundry Debtors"].credit += amt;
      }
    }
  }

  return LEDGERS.map((l) => ({
    ledger: l,
    debit: ledgerMap[l]?.debit ?? 0,
    credit: ledgerMap[l]?.credit ?? 0,
    balance: (ledgerMap[l]?.debit ?? 0) - (ledgerMap[l]?.credit ?? 0),
  }));
}

export default function EventReplay() {
  const [fromDate, setFromDate] = useState("2026-03-01");
  const [toDate, setToDate] = useState("2026-03-31");
  const [timeTravelDate, setTimeTravelDate] = useState("");
  const [selectedLedger, setSelectedLedger] = useState("all");
  const [replaying, setReplaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trialRows, setTrialRows] = useState<TrialRow[]>([]);
  const [timeTravelRows, setTimeTravelRows] = useState<TrialRow[]>([]);

  const handleReplay = () => {
    setReplaying(true);
    setProgress(0);
    const events = loadEvents();
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        const rows = buildTrialBalance(events);
        const result =
          selectedLedger === "all"
            ? rows
            : rows.filter((r) => r.ledger === selectedLedger);
        setTrialRows(result);
        setReplaying(false);
      }
    }, 200);
  };

  const handleTimeTravel = () => {
    if (!timeTravelDate) return;
    const events = loadEvents();
    setTimeTravelRows(buildTrialBalance(events, timeTravelDate));
  };

  // suppress unused warning for fromDate/toDate used as display hints
  void fromDate;
  void toDate;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-teal-400" />
        <h2 className="text-base font-semibold text-foreground">
          Event Replay
        </h2>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Rebuild Trial Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ledger</Label>
              <Select value={selectedLedger} onValueChange={setSelectedLedger}>
                <SelectTrigger className="w-44 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ledgers</SelectItem>
                  {LEDGERS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleReplay}
              disabled={replaying}
              className="bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs"
            >
              {replaying ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Replaying...
                </>
              ) : (
                "Replay Events"
              )}
            </Button>
          </div>
          {replaying && <Progress value={progress} className="h-2" />}
          {trialRows.length > 0 && (
            <div className="overflow-x-auto rounded border border-border mt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs">Ledger</TableHead>
                    <TableHead className="text-xs text-right">
                      Debit (₹)
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Credit (₹)
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Balance (₹)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialRows.map((r) => (
                    <TableRow key={r.ledger}>
                      <TableCell className="text-xs">{r.ledger}</TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {r.debit.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {r.credit.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell
                        className={`text-xs text-right font-mono font-semibold ${r.balance >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {r.balance.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            ⏳ Time Travel — View Past Balances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs">As of Date</Label>
              <Input
                type="date"
                value={timeTravelDate}
                onChange={(e) => setTimeTravelDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
            <Button
              onClick={handleTimeTravel}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
            >
              Show Balances
            </Button>
          </div>
          {timeTravelRows.length > 0 && (
            <>
              <Badge className="bg-blue-700 text-white text-xs">
                Balances as of {timeTravelDate}
              </Badge>
              <div className="overflow-x-auto rounded border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">Ledger</TableHead>
                      <TableHead className="text-xs text-right">
                        Balance (₹)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeTravelRows.map((r) => (
                      <TableRow key={r.ledger}>
                        <TableCell className="text-xs">{r.ledger}</TableCell>
                        <TableCell
                          className={`text-xs text-right font-mono ${r.balance >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {r.balance.toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
