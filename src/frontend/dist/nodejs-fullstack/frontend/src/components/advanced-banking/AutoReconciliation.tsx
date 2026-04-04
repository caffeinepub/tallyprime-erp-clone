import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useState } from "react";

type RecStatus = "Matched" | "Unmatched" | "Partial";

interface RecRow {
  id: string;
  date: string;
  description: string;
  bankAmount: number;
  bookAmount: number;
  status: RecStatus;
  voucherRef: string;
}

const INITIAL_ROWS: RecRow[] = [
  {
    id: "1",
    date: "2026-03-01",
    description: "NEFT - Ravi Traders",
    bankAmount: 50000,
    bookAmount: 50000,
    status: "Matched",
    voucherRef: "REC/001",
  },
  {
    id: "2",
    date: "2026-03-03",
    description: "Office Rent",
    bankAmount: 25000,
    bookAmount: 25000,
    status: "Matched",
    voucherRef: "PAY/012",
  },
  {
    id: "3",
    date: "2026-03-05",
    description: "Kumar Suppliers",
    bankAmount: 12500,
    bookAmount: 0,
    status: "Unmatched",
    voucherRef: "",
  },
  {
    id: "4",
    date: "2026-03-07",
    description: "Client Payment RTGS",
    bankAmount: 80000,
    bookAmount: 75000,
    status: "Partial",
    voucherRef: "REC/002",
  },
  {
    id: "5",
    date: "2026-03-10",
    description: "Electricity Bill",
    bankAmount: 4200,
    bookAmount: 4200,
    status: "Matched",
    voucherRef: "PAY/015",
  },
  {
    id: "6",
    date: "2026-03-12",
    description: "UPI - Amit Kumar",
    bankAmount: 15000,
    bookAmount: 0,
    status: "Unmatched",
    voucherRef: "",
  },
  {
    id: "7",
    date: "2026-03-14",
    description: "Salary - Staff",
    bankAmount: 45000,
    bookAmount: 45000,
    status: "Matched",
    voucherRef: "PAY/018",
  },
];

const statusConfig: Record<
  RecStatus,
  { color: string; icon: React.ReactNode }
> = {
  Matched: { color: "bg-green-600", icon: <CheckCircle className="w-3 h-3" /> },
  Unmatched: { color: "bg-red-500", icon: <AlertCircle className="w-3 h-3" /> },
  Partial: { color: "bg-yellow-500", icon: <Clock className="w-3 h-3" /> },
};

export default function AutoReconciliation() {
  const [rows, setRows] = useState<RecRow[]>(INITIAL_ROWS);

  const matchRow = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Matched" as RecStatus,
              bookAmount: r.bankAmount,
              voucherRef: `AUTO/${id.padStart(3, "0")}`,
            }
          : r,
      ),
    );
  };

  const matched = rows.filter((r) => r.status === "Matched").length;
  const unmatched = rows.filter((r) => r.status === "Unmatched");
  const partial = rows.filter((r) => r.status === "Partial").length;
  const unmatchedAmt = unmatched.reduce((s, r) => s + r.bankAmount, 0);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Auto Reconciliation
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Match bank transactions against book vouchers
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-xl font-bold text-foreground">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Matched</p>
            <p className="text-xl font-bold text-green-600">{matched}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Unmatched</p>
            <p className="text-xl font-bold text-red-500">{unmatched.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Unmatched Amount</p>
            <p className="text-xl font-bold text-red-500">
              ₹{unmatchedAmt.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />{" "}
          Matched: {matched}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{" "}
          Unmatched: {unmatched.length}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />{" "}
          Partial: {partial}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Description
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                Bank Amt
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                Book Amt
              </th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Voucher
              </th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}
                data-ocid={`reconciliation.item.${i + 1}`}
              >
                <td className="px-3 py-1.5 text-foreground">{row.date}</td>
                <td className="px-3 py-1.5 text-foreground">
                  {row.description}
                </td>
                <td className="px-3 py-1.5 text-right">
                  ₹{row.bankAmount.toLocaleString()}
                </td>
                <td className="px-3 py-1.5 text-right">
                  {row.bookAmount > 0 ? (
                    `₹${row.bookAmount.toLocaleString()}`
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-center">
                  <Badge
                    className={`${statusConfig[row.status].color} text-white gap-1 text-xs`}
                  >
                    {statusConfig[row.status].icon} {row.status}
                  </Badge>
                </td>
                <td className="px-3 py-1.5 text-foreground font-mono">
                  {row.voucherRef || (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-center">
                  {row.status !== "Matched" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2"
                      onClick={() => matchRow(row.id)}
                      data-ocid="reconciliation.button"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Match
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
