import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { toast } from "sonner";

const ORDERS = [
  { id: "ORD-1001", customer: "Rahul Sharma", revenue: 2250 },
  { id: "ORD-1002", customer: "Meera Textiles", revenue: 18000 },
  { id: "ORD-1003", customer: "Star Electronics", revenue: 3500 },
  { id: "ORD-1004", customer: "Patel Stores", revenue: 2700 },
  { id: "ORD-1005", customer: "Om Traders", revenue: 4000 },
  { id: "ORD-1006", customer: "Bhatia & Co", revenue: 12500 },
  { id: "ORD-1007", customer: "Sunrise Retail", revenue: 950 },
];

const COGS_PCT = 0.6;

export default function OrderProfitability() {
  const rows = ORDERS.map((o) => {
    const cogs = Math.round(o.revenue * COGS_PCT);
    const margin = o.revenue - cogs;
    const marginPct = Math.round((margin / o.revenue) * 100);
    return { ...o, cogs, margin, marginPct };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.revenue,
      cogs: acc.cogs + r.cogs,
      margin: acc.margin + r.margin,
    }),
    { revenue: 0, cogs: 0, margin: 0 },
  );
  const totalMarginPct = Math.round((totals.margin / totals.revenue) * 100);

  const marginColor = (pct: number) =>
    pct > 30
      ? "text-green-600 dark:text-green-400"
      : pct >= 15
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  const exportCSV = () => {
    const header = "Order ID,Customer,Revenue,COGS,Gross Margin,Margin %\n";
    const body = rows
      .map(
        (r) =>
          `${r.id},${r.customer},${r.revenue},${r.cogs},${r.margin},${r.marginPct}%`,
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "order-profitability.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="p-4 space-y-4" data-ocid="ecommerce.profitability.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          Order Profitability Report
        </h2>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={exportCSV}
          data-ocid="ecommerce.export_csv.button"
        >
          <Download size={12} className="mr-1" /> Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Order ID</TableHead>
              <TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs text-right">Revenue</TableHead>
              <TableHead className="text-xs text-right">COGS (60%)</TableHead>
              <TableHead className="text-xs text-right">Gross Margin</TableHead>
              <TableHead className="text-xs text-right">Margin %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow
                key={r.id}
                data-ocid={`ecommerce.profitability.item.${idx + 1}`}
              >
                <TableCell className="text-xs font-mono">{r.id}</TableCell>
                <TableCell className="text-xs">{r.customer}</TableCell>
                <TableCell className="text-xs text-right">
                  ₹{r.revenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-right text-muted-foreground">
                  ₹{r.cogs.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-right">
                  ₹{r.margin.toLocaleString()}
                </TableCell>
                <TableCell
                  className={`text-xs text-right font-semibold ${marginColor(r.marginPct)}`}
                >
                  {r.marginPct}%
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/40 font-bold">
              <TableCell className="text-xs" colSpan={2}>
                Total
              </TableCell>
              <TableCell className="text-xs text-right">
                ₹{totals.revenue.toLocaleString()}
              </TableCell>
              <TableCell className="text-xs text-right">
                ₹{totals.cogs.toLocaleString()}
              </TableCell>
              <TableCell className="text-xs text-right">
                ₹{totals.margin.toLocaleString()}
              </TableCell>
              <TableCell
                className={`text-xs text-right ${marginColor(totalMarginPct)}`}
              >
                {totalMarginPct}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex gap-4 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />{" "}
          &gt;30% Good
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />{" "}
          15–30% Average
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />{" "}
          &lt;15% Low
        </span>
      </div>
    </div>
  );
}
