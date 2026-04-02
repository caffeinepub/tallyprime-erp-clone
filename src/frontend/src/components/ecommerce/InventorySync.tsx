import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";

const PRODUCTS = [
  { name: "LED Bulb 9W", current: 420, reserved: 50, available: 370 },
  { name: "USB Cable Pack", current: 280, reserved: 100, available: 180 },
  { name: "Cotton Fabric (mtr)", current: 150, reserved: 20, available: 130 },
  { name: "Notebook A4", current: 600, reserved: 200, available: 400 },
  { name: "Water Bottle 1L", current: 90, reserved: 30, available: 60 },
  { name: "Wireless Mouse", current: 45, reserved: 15, available: 30 },
];

export default function InventorySync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>(
    () => localStorage.getItem("hk_ecom_last_sync") ?? "Never",
  );

  const syncNow = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      const ts = new Date().toLocaleString();
      setLastSync(ts);
      localStorage.setItem("hk_ecom_last_sync", ts);
      toast.success("Inventory synced successfully");
    }, 1800);
  };

  return (
    <div className="p-4 space-y-4" data-ocid="ecommerce.inventory_sync.section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Inventory Sync</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Last sync: {lastSync}
          </p>
        </div>
        <Button
          size="sm"
          className="text-xs h-7"
          onClick={syncNow}
          disabled={syncing}
          data-ocid="ecommerce.sync_now.button"
        >
          <RefreshCw
            size={12}
            className={`mr-1 ${syncing ? "animate-spin" : ""}`}
          />
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Product Name</TableHead>
              <TableHead className="text-xs text-right">
                Current Stock
              </TableHead>
              <TableHead className="text-xs text-right">
                Reserved (Pending Orders)
              </TableHead>
              <TableHead className="text-xs text-right">Available</TableHead>
              <TableHead className="text-xs">Stock Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PRODUCTS.map((p, idx) => {
              const pct = Math.round((p.available / p.current) * 100);
              const color =
                pct > 50
                  ? "bg-green-500"
                  : pct > 20
                    ? "bg-yellow-500"
                    : "bg-red-500";
              return (
                <TableRow
                  key={p.name}
                  data-ocid={`ecommerce.inventory.item.${idx + 1}`}
                >
                  <TableCell className="text-xs font-medium">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {p.current}
                  </TableCell>
                  <TableCell className="text-xs text-right text-orange-500">
                    {p.reserved}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {p.available}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5 min-w-[60px]">
                        <div
                          className={`h-1.5 rounded-full ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
