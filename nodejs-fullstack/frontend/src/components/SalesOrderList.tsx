import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";
import type { SalesOrder } from "./SalesOrderEntry";

const LS_KEY = "hk-sales-orders";

function loadSOs(): SalesOrder[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveSOs(sos: SalesOrder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sos));
}

type Status = "All" | "Pending" | "Confirmed" | "Dispatched" | "Cancelled";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  Confirmed: "bg-teal/20 text-teal border-teal/30",
  Dispatched: "bg-green-500/20 text-green-600 border-green-500/30",
  Cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function SalesOrderList({ company }: { company: Company }) {
  const [tab, setTab] = useState<Status>("All");
  const [orders, setOrders] = useState<SalesOrder[]>(() =>
    loadSOs().filter((s) => s.companyName === company.name),
  );
  const [selected, setSelected] = useState<SalesOrder | null>(null);

  const refresh = () =>
    setOrders(loadSOs().filter((s) => s.companyName === company.name));

  const filtered =
    tab === "All" ? orders : orders.filter((o) => o.status === tab);

  const changeStatus = (id: string, status: SalesOrder["status"]) => {
    const all = loadSOs();
    saveSOs(all.map((s) => (s.id === id ? { ...s, status } : s)));
    toast.success(`SO status updated to ${status}`);
    refresh();
    setSelected(null);
  };

  return (
    <div
      className="h-full overflow-y-auto p-4 bg-background"
      data-ocid="so_list.page"
    >
      <div className="max-w-6xl mx-auto">
        <div className="tally-section-header mb-4">
          Sales Order List — {company.name}
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as Status)}
          className="mb-3"
        >
          <TabsList className="bg-secondary/40 h-8">
            {(
              [
                "All",
                "Pending",
                "Confirmed",
                "Dispatched",
                "Cancelled",
              ] as Status[]
            ).map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="text-[11px] h-7"
                data-ocid="so_list.tab"
              >
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            data-ocid="so_list.empty_state"
          >
            <span className="text-4xl mb-3">📋</span>
            <div className="text-[13px]">No sales orders found</div>
            <div className="text-[11px] mt-1">
              Create an SO using the sidebar menu
            </div>
          </div>
        ) : (
          <div className="border border-border" data-ocid="so_list.table">
            <div className="grid grid-cols-12 bg-secondary/60 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
              <div className="col-span-2 px-3 py-2">SO No</div>
              <div className="col-span-2 px-3 py-2">Date</div>
              <div className="col-span-3 px-3 py-2">Customer</div>
              <div className="col-span-2 px-3 py-2 text-right">Total (₹)</div>
              <div className="col-span-1 px-3 py-2">Status</div>
              <div className="col-span-2 px-3 py-2">Actions</div>
            </div>
            {filtered.map((so, i) => (
              <div
                key={so.id}
                className="grid grid-cols-12 border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                onClick={() => setSelected(selected?.id === so.id ? null : so)}
                onKeyDown={() => {}}
                data-ocid={`so_list.row.${i + 1}`}
              >
                <div className="col-span-2 px-3 py-2 text-[11px] font-mono text-teal">
                  {so.soNumber}
                </div>
                <div className="col-span-2 px-3 py-2 text-[11px]">
                  {so.date}
                </div>
                <div className="col-span-3 px-3 py-2 text-[11px] truncate">
                  {so.customerName}
                </div>
                <div className="col-span-2 px-3 py-2 text-[11px] text-right font-mono">
                  ₹
                  {so.totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="col-span-1 px-3 py-2">
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border ${STATUS_COLORS[so.status]}`}
                  >
                    {so.status}
                  </span>
                </div>
                <div
                  className="col-span-2 px-3 py-2 flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  {so.status === "Pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2 text-teal border-teal/40"
                      onClick={() => changeStatus(so.id, "Confirmed")}
                      data-ocid={`so_list.edit_button.${i + 1}`}
                    >
                      Confirm
                    </Button>
                  )}
                  {so.status !== "Cancelled" && so.status !== "Dispatched" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2 text-destructive border-destructive/40"
                      onClick={() => changeStatus(so.id, "Cancelled")}
                      data-ocid={`so_list.delete_button.${i + 1}`}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div
            className="mt-4 border border-teal/30 bg-teal/5 p-4"
            data-ocid="so_list.panel"
          >
            <div className="text-[12px] font-semibold text-teal mb-2">
              {selected.soNumber} — {selected.customerName}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground mb-3">
              <div>
                Date: <span className="text-foreground">{selected.date}</span>
              </div>
              <div>
                Delivery:{" "}
                <span className="text-foreground">
                  {selected.deliveryDate || "N/A"}
                </span>
              </div>
              <div>
                Terms:{" "}
                <span className="text-foreground">
                  {selected.terms || "N/A"}
                </span>
              </div>
            </div>
            <div className="border border-border">
              <div className="grid grid-cols-5 bg-secondary/60 text-[10px] font-semibold text-muted-foreground uppercase">
                <div className="col-span-2 px-2 py-1">Item</div>
                <div className="px-2 py-1 text-right">Qty</div>
                <div className="px-2 py-1 text-right">Rate</div>
                <div className="px-2 py-1 text-right">Amount</div>
              </div>
              {selected.lineItems.map((l, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: line items ordered by position
                  key={i}
                  className="grid grid-cols-5 border-t border-border/50 text-[11px]"
                >
                  <div className="col-span-2 px-2 py-1">{l.itemName}</div>
                  <div className="px-2 py-1 text-right">{l.qty}</div>
                  <div className="px-2 py-1 text-right">₹{l.rate}</div>
                  <div className="px-2 py-1 text-right font-mono text-teal">
                    ₹{l.amount.toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-[12px] font-bold text-teal">
              Total: ₹
              {selected.totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
