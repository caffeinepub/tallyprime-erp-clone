import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Order = {
  order_id: string;
  customer: string;
  product: string;
  qty: string;
  price: string;
  date: string;
  status: string;
  importedAt?: string;
};

export default function AutoSalesEntry() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("hk_ecom_orders") || "[]");
    if (data.length === 0) {
      const seed: Order[] = [
        {
          order_id: "ORD-1001",
          customer: "Rahul Sharma",
          product: "LED Bulb 9W",
          qty: "50",
          price: "45",
          date: "2026-03-28",
          status: "Pending",
        },
        {
          order_id: "ORD-1002",
          customer: "Meera Textiles",
          product: "Cotton Fabric",
          qty: "20",
          price: "900",
          date: "2026-03-29",
          status: "Converted",
        },
        {
          order_id: "ORD-1003",
          customer: "Star Electronics",
          product: "USB Cable",
          qty: "100",
          price: "35",
          date: "2026-03-30",
          status: "Pending",
        },
      ];
      setOrders(seed);
    } else {
      setOrders(data);
    }
  }, []);

  const toggle = (id: string) =>
    setSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((p) =>
      p.size === orders.length
        ? new Set()
        : new Set(orders.map((o) => o.order_id)),
    );

  const convertOrders = (ids: string[]) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        ids.includes(o.order_id) ? { ...o, status: "Converted" } : o,
      );
      localStorage.setItem("hk_ecom_orders", JSON.stringify(updated));
      return updated;
    });
    setSelected(new Set());
    toast.success(`${ids.length} order(s) converted to Sales Voucher`);
  };

  return (
    <div className="p-4 space-y-4" data-ocid="ecommerce.auto_sales.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Auto Sales Entry</h2>
        {selected.size > 0 && (
          <Button
            size="sm"
            className="text-xs h-7"
            onClick={() => convertOrders([...selected])}
            data-ocid="ecommerce.bulk_convert.button"
          >
            Convert Selected ({selected.size})
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={selected.size === orders.length && orders.length > 0}
                  onCheckedChange={toggleAll}
                  data-ocid="ecommerce.select_all.checkbox"
                />
              </TableHead>
              <TableHead className="text-xs">Order ID</TableHead>
              <TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs">Product</TableHead>
              <TableHead className="text-xs text-right">Qty</TableHead>
              <TableHead className="text-xs text-right">Price</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-xs text-muted-foreground py-8"
                  data-ocid="ecommerce.auto_sales.empty_state"
                >
                  No orders imported yet. Use Order Import to add orders.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order, idx) => (
              <TableRow
                key={order.order_id}
                data-ocid={`ecommerce.sales_entry.item.${idx + 1}`}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(order.order_id)}
                    onCheckedChange={() => toggle(order.order_id)}
                    disabled={order.status === "Converted"}
                  />
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {order.order_id}
                </TableCell>
                <TableCell className="text-xs">{order.customer}</TableCell>
                <TableCell className="text-xs">{order.product}</TableCell>
                <TableCell className="text-xs text-right">
                  {order.qty}
                </TableCell>
                <TableCell className="text-xs text-right">
                  ₹{order.price}
                </TableCell>
                <TableCell className="text-xs">{order.date}</TableCell>
                <TableCell>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      order.status === "Converted"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  {order.status === "Pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={() => convertOrders([order.order_id])}
                      data-ocid={`ecommerce.convert.button.${idx + 1}`}
                    >
                      Convert
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
