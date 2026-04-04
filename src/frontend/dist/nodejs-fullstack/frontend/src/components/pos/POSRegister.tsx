import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface Sale {
  id: string;
  billNo: string;
  date: string;
  items: { name: string; qty: number; rate: number }[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  payMode: string;
}

export default function POSRegister() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const allSales: Sale[] = JSON.parse(
    localStorage.getItem("pos_sales") || "[]",
  );

  const filtered = allSales.filter((s) => {
    const d = s.date.slice(0, 10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });

  const totals = filtered.reduce(
    (acc, s) => ({
      subtotal: acc.subtotal + s.subtotal,
      discount: acc.discount + s.discount,
      gst: acc.gst + s.gst,
      total: acc.total + s.total,
    }),
    { subtotal: 0, discount: 0, gst: 0, total: 0 },
  );

  const payBadge = (mode: string) => {
    const map: Record<string, string> = {
      Cash: "bg-green-900 text-green-300",
      Card: "bg-blue-900 text-blue-300",
      UPI: "bg-purple-900 text-purple-300",
    };
    return map[mode] || "bg-secondary text-muted-foreground";
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-lg font-bold">POS Sales Register</h2>
          <p className="text-xs text-muted-foreground">
            {filtered.length} transactions
          </p>
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-7 text-xs w-36"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-7 text-xs w-36"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Subtotal", value: totals.subtotal },
          { label: "Discount", value: totals.discount },
          { label: "GST", value: totals.gst },
          { label: "Net Total", value: totals.total },
        ].map((row) => (
          <Card key={row.label} className="bg-card border-border">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{row.label}</p>
              <p className="text-base font-bold text-teal">
                ₹{row.value.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Sales</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground text-sm"
              data-ocid="pos-register.empty_state"
            >
              No sales found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Bill No</TableHead>
                    <TableHead className="text-xs">Date/Time</TableHead>
                    <TableHead className="text-xs">Items</TableHead>
                    <TableHead className="text-xs text-right">
                      Subtotal
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Discount
                    </TableHead>
                    <TableHead className="text-xs text-right">Tax</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                    <TableHead className="text-xs">Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s, i) => (
                    <TableRow
                      key={s.id}
                      className="border-border text-xs"
                      data-ocid={`pos-register.item.${i + 1}`}
                    >
                      <TableCell className="text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">{s.billNo}</TableCell>
                      <TableCell>
                        {new Date(s.date).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>{s.items.length}</TableCell>
                      <TableCell className="text-right">
                        ₹{s.subtotal.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-red-400">
                        ₹{s.discount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{s.gst.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{s.total.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${payBadge(s.payMode)}`}
                        >
                          {s.payMode}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
