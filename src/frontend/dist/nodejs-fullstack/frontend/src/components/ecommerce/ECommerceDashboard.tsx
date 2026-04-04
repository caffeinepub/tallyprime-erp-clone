import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Package, ShoppingBag, TrendingUp } from "lucide-react";

const RECENT_ORDERS = [
  {
    id: "ORD-1001",
    customer: "Rahul Sharma",
    product: "LED Bulb 9W",
    qty: 50,
    amount: 2250,
    status: "Delivered",
    date: "2026-03-28",
  },
  {
    id: "ORD-1002",
    customer: "Meera Textiles",
    product: "Cotton Fabric",
    qty: 20,
    amount: 18000,
    status: "Pending",
    date: "2026-03-29",
  },
  {
    id: "ORD-1003",
    customer: "Star Electronics",
    product: "USB Cable",
    qty: 100,
    amount: 3500,
    status: "Processing",
    date: "2026-03-29",
  },
  {
    id: "ORD-1004",
    customer: "Patel Stores",
    product: "Water Bottle",
    qty: 30,
    amount: 2700,
    status: "Shipped",
    date: "2026-03-30",
  },
  {
    id: "ORD-1005",
    customer: "Om Traders",
    product: "Notebook A4",
    qty: 200,
    amount: 4000,
    status: "Pending",
    date: "2026-03-30",
  },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Processing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Shipped:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function ECommerceDashboard({
  onNavigate,
}: { onNavigate?: (v: string) => void }) {
  const pending = RECENT_ORDERS.filter((o) => o.status === "Pending").length;
  const totalRevenue = RECENT_ORDERS.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="p-4 space-y-4" data-ocid="ecommerce.dashboard.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          E-Commerce Dashboard
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={() => onNavigate?.("ecommerce-order-import")}
            data-ocid="ecommerce.import_orders.button"
          >
            Import Orders
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={() => onNavigate?.("ecommerce-profitability")}
            data-ocid="ecommerce.view_report.button"
          >
            View Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-teal" />
              <div>
                <div className="text-[10px] text-muted-foreground">
                  Total Orders
                </div>
                <div className="text-lg font-bold text-foreground">
                  {RECENT_ORDERS.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-teal" />
              <div>
                <div className="text-[10px] text-muted-foreground">
                  Total Revenue
                </div>
                <div className="text-lg font-bold text-foreground">
                  ₹{totalRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-yellow-500" />
              <div>
                <div className="text-[10px] text-muted-foreground">
                  Pending Fulfilment
                </div>
                <div className="text-lg font-bold text-foreground">
                  {pending}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-blue-500" />
              <div>
                <div className="text-[10px] text-muted-foreground">
                  Top Product
                </div>
                <div className="text-xs font-bold text-foreground">
                  Notebook A4
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Order ID</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs text-right">Qty</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_ORDERS.map((order, idx) => (
                  <TableRow
                    key={order.id}
                    data-ocid={`ecommerce.order.item.${idx + 1}`}
                  >
                    <TableCell className="text-xs font-mono">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-xs">{order.customer}</TableCell>
                    <TableCell className="text-xs">{order.product}</TableCell>
                    <TableCell className="text-xs text-right">
                      {order.qty}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      ₹{order.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] ?? ""}`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
