import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";
import type { PurchaseOrder } from "./PurchaseOrderEntry";

const LS_KEY = "hk-purchase-orders";

function loadPOs(): PurchaseOrder[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function savePOs(pos: PurchaseOrder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(pos));
}

type Status = "All" | "Pending" | "Approved" | "Received" | "Cancelled";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  Approved: "bg-teal/20 text-teal border-teal/30",
  Received: "bg-green-500/20 text-green-600 border-green-500/30",
  Cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function PurchaseOrderList({ company }: { company: Company }) {
  const [tab, setTab] = useState<Status>("All");
  const [orders, setOrders] = useState<PurchaseOrder[]>(() =>
    loadPOs().filter((p) => p.companyName === company.name),
  );
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);

  const refresh = () =>
    setOrders(loadPOs().filter((p) => p.companyName === company.name));

  const filtered =
    tab === "All" ? orders : orders.filter((o) => o.status === tab);

  const changeStatus = (id: string, status: PurchaseOrder["status"]) => {
    const all = loadPOs();
    const updated = all.map((p) => (p.id === id ? { ...p, status } : p));
    savePOs(updated);
    toast.success(`PO status updated to ${status}`);
    refresh();
    setSelected(null);
  };

  return (
    <div
      className="h-full overflow-y-auto p-4 bg-background"
      data-ocid="po_list.page"
    >
      <div className="max-w-6xl mx-auto">
        <div className="tally-section-header mb-4">
          Purchase Order List — {company.name}
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
                "Approved",
                "Received",
                "Cancelled",
              ] as Status[]
            ).map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="text-[11px] h-7"
                data-ocid="po_list.tab"
              >
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            data-ocid="po_list.empty_state"
          >
            <span className="text-4xl mb-3">📋</span>
            <div className="text-[13px]">No purchase orders found</div>
            <div className="text-[11px] mt-1">
              Create a PO using the sidebar menu
            </div>
          </div>
        ) : (
          <div className="border border-border" data-ocid="po_list.table">
            <div className="grid grid-cols-12 bg-secondary/60 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
              <div className="col-span-2 px-3 py-2">PO No</div>
              <div className="col-span-2 px-3 py-2">Date</div>
              <div className="col-span-3 px-3 py-2">Vendor</div>
              <div className="col-span-2 px-3 py-2 text-right">Total (₹)</div>
              <div className="col-span-1 px-3 py-2">Status</div>
              <div className="col-span-2 px-3 py-2">Actions</div>
            </div>
            {filtered.map((po, i) => (
              <div
                key={po.id}
                className="grid grid-cols-12 border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                onClick={() => setSelected(selected?.id === po.id ? null : po)}
                onKeyDown={() => {}}
                data-ocid={`po_list.row.${i + 1}`}
              >
                <div className="col-span-2 px-3 py-2 text-[11px] font-mono text-teal">
                  {po.poNumber}
                </div>
                <div className="col-span-2 px-3 py-2 text-[11px]">
                  {po.date}
                </div>
                <div className="col-span-3 px-3 py-2 text-[11px] truncate">
                  {po.vendorName}
                </div>
                <div className="col-span-2 px-3 py-2 text-[11px] text-right font-mono">
                  ₹
                  {po.totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="col-span-1 px-3 py-2">
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border ${STATUS_COLORS[po.status]}`}
                  >
                    {po.status}
                  </span>
                </div>
                <div
                  className="col-span-2 px-3 py-2 flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  {po.status === "Pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2 text-teal border-teal/40"
                      onClick={() => changeStatus(po.id, "Approved")}
                      data-ocid={`po_list.edit_button.${i + 1}`}
                    >
                      Approve
                    </Button>
                  )}
                  {po.status !== "Cancelled" && po.status !== "Received" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2 text-destructive border-destructive/40"
                      onClick={() => changeStatus(po.id, "Cancelled")}
                      data-ocid={`po_list.delete_button.${i + 1}`}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <div
            className="mt-4 border border-teal/30 bg-teal/5 p-4"
            data-ocid="po_list.panel"
          >
            <div className="text-[12px] font-semibold text-teal mb-2">
              {selected.poNumber} — {selected.vendorName}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground mb-3">
              <div>
                Date: <span className="text-foreground">{selected.date}</span>
              </div>
              <div>
                Expected:{" "}
                <span className="text-foreground">
                  {selected.expectedDelivery || "N/A"}
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
