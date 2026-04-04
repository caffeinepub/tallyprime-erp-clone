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
import { GitCompare } from "lucide-react";
import { useState } from "react";

const DEMO_DIFF = [
  { ledger: "Cash Account", balanceA: 195200, balanceB: 230500 },
  { ledger: "Bank - HDFC Current", balanceA: 318000, balanceB: 290000 },
  { ledger: "Sundry Debtors", balanceA: 298000, balanceB: 350000 },
  { ledger: "Stock in Hand", balanceA: 420000, balanceB: 395000 },
  { ledger: "Sundry Creditors", balanceA: 160000, balanceB: 185000 },
  { ledger: "GST Payable", balanceA: 60000, balanceB: 72000 },
  { ledger: "Sales Account", balanceA: 520000, balanceB: 680000 },
  { ledger: "Purchase Account", balanceA: 310000, balanceB: 420000 },
  { ledger: "Salary Expense", balanceA: 85000, balanceB: 102000 },
  { ledger: "Capital Account", balanceA: 1000000, balanceB: 1000000 },
];

function fmt(n: number) {
  return `₹${Math.abs(n).toLocaleString("en-IN")}`;
}

export default function DiffViewer() {
  const [snapshotA, setSnapshotA] = useState("2024-03-31");
  const [snapshotB, setSnapshotB] = useState("2024-06-30");
  const [generated, setGenerated] = useState(false);

  function generate() {
    setGenerated(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <GitCompare className="h-6 w-6 text-teal-400" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Diff Viewer</h1>
          <p className="text-sm text-muted-foreground">
            Compare ledger balances between two date snapshots
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="snapshot-a">Snapshot A</Label>
              <Input
                id="snapshot-a"
                type="date"
                value={snapshotA}
                onChange={(e) => {
                  setSnapshotA(e.target.value);
                  setGenerated(false);
                }}
                className="w-44"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="snapshot-b">Snapshot B</Label>
              <Input
                id="snapshot-b"
                type="date"
                value={snapshotB}
                onChange={(e) => {
                  setSnapshotB(e.target.value);
                  setGenerated(false);
                }}
                className="w-44"
              />
            </div>
            <Button
              onClick={generate}
              className="bg-teal-600 hover:bg-teal-700 text-white"
              data-ocid="diffviewer.primary_button"
            >
              <GitCompare className="h-4 w-4 mr-2" /> Compare Snapshots
            </Button>
          </div>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Balance Comparison</CardTitle>
              <div className="flex gap-2 text-xs">
                <Badge
                  variant="outline"
                  className="border-blue-400 text-blue-400"
                >
                  A: {snapshotA}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-purple-400 text-purple-400"
                >
                  B: {snapshotB}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto" data-ocid="diffviewer.table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ledger</TableHead>
                    <TableHead className="text-right text-blue-400">
                      Balance A
                    </TableHead>
                    <TableHead className="text-right text-purple-400">
                      Balance B
                    </TableHead>
                    <TableHead className="text-right">Delta</TableHead>
                    <TableHead className="text-right">Change %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_DIFF.map((row) => {
                    const delta = row.balanceB - row.balanceA;
                    const pct =
                      row.balanceA !== 0
                        ? ((delta / row.balanceA) * 100).toFixed(1)
                        : "N/A";
                    return (
                      <TableRow key={row.ledger}>
                        <TableCell className="font-medium">
                          {row.ledger}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(row.balanceA)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt(row.balanceB)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${delta >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {delta >= 0 ? "+" : ""}
                          {fmt(delta)}
                        </TableCell>
                        <TableCell
                          className={`text-right text-sm ${delta >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {pct !== "N/A"
                            ? `${delta >= 0 ? "+" : ""}${pct}%`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
