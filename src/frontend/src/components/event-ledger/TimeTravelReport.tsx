import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, RefreshCw } from "lucide-react";
import { useState } from "react";

const DEMO_ACCOUNTS = [
  {
    account: "Cash Account",
    group: "Assets",
    opening: 150000,
    transactions: 45200,
    closing: 195200,
  },
  {
    account: "Bank - HDFC Current",
    group: "Assets",
    opening: 380000,
    transactions: -62000,
    closing: 318000,
  },
  {
    account: "Sundry Debtors",
    group: "Assets",
    opening: 210000,
    transactions: 88000,
    closing: 298000,
  },
  {
    account: "Stock in Hand",
    group: "Assets",
    opening: 540000,
    transactions: -120000,
    closing: 420000,
  },
  {
    account: "Capital Account",
    group: "Liabilities",
    opening: 1000000,
    transactions: 0,
    closing: 1000000,
  },
  {
    account: "Sundry Creditors",
    group: "Liabilities",
    opening: 125000,
    transactions: 35000,
    closing: 160000,
  },
  {
    account: "GST Payable",
    group: "Liabilities",
    opening: 42000,
    transactions: 18000,
    closing: 60000,
  },
  {
    account: "Sales Account",
    group: "Income",
    opening: 0,
    transactions: 520000,
    closing: 520000,
  },
  {
    account: "Purchase Account",
    group: "Expenses",
    opening: 0,
    transactions: 310000,
    closing: 310000,
  },
  {
    account: "Salary Expense",
    group: "Expenses",
    opening: 0,
    transactions: 85000,
    closing: 85000,
  },
];

function fmt(n: number) {
  const abs = Math.abs(n);
  const str = `₹${abs.toLocaleString("en-IN")}`;
  return n < 0 ? `-${str}` : str;
}

export default function TimeTravelReport() {
  const [date, setDate] = useState("2024-03-31");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  function generate() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 800);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-teal-400" />
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Time-Travel Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Rebuild Trial Balance from event history as of any date
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="travel-date">As of Date</Label>
              <Input
                id="travel-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setGenerated(false);
                }}
                className="w-48"
              />
            </div>
            <Button
              onClick={generate}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white"
              data-ocid="timetravel.primary_button"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              {loading ? "Rebuilding..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Trial Balance as of{" "}
                {new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              <Badge
                variant="outline"
                className="text-teal-400 border-teal-400"
              >
                Reconstructed from Events
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto" data-ocid="timetravel.table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">
                      Opening Balance
                    </TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">
                      Closing Balance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_ACCOUNTS.map((row) => (
                    <TableRow key={row.account}>
                      <TableCell className="font-medium">
                        {row.account}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {row.group}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(row.opening)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${row.transactions >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {fmt(row.transactions)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {fmt(row.closing)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
