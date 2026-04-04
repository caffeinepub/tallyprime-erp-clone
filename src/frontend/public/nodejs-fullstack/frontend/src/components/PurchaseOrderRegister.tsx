import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
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

const STATUS_COLORS: Record<string, string> = {
  Pending: "text-yellow-600",
  Approved: "text-teal",
  Received: "text-green-600",
  Cancelled: "text-destructive",
};

export default function PurchaseOrderRegister({
  company,
}: { company: Company }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const all = loadPOs().filter((p) => p.companyName === company.name);

  const filtered = all.filter((p) => {
    if (fromDate && p.date < fromDate) return false;
    if (toDate && p.date > toDate) return false;
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    return true;
  });

  const totalAmt = filtered.reduce((s, p) => s + p.totalAmount, 0);

  return (
    <div
      className="h-full overflow-y-auto p-4 bg-background"
      data-ocid="po_register.page"
    >
      <div className="max-w-6xl mx-auto">
        <div className="tally-section-header mb-4">
          PO Register — {company.name}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div>
            <Label className="text-[10px] text-muted-foreground">
              From Date
            </Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-7 text-[11px] w-36"
              data-ocid="po_register.input"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-7 text-[11px] w-36"
              data-ocid="po_register.input"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">Status</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block h-7 text-[11px] border border-input bg-background px-2 text-foreground w-28"
              data-ocid="po_register.select"
            >
              {["All", "Pending", "Approved", "Received", "Cancelled"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-muted-foreground"
            data-ocid="po_register.empty_state"
          >
            <span className="text-4xl mb-3">📊</span>
            <div className="text-[13px]">
              No purchase orders match the filter
            </div>
          </div>
        ) : (
          <div className="border border-border" data-ocid="po_register.table">
            <div className="grid grid-cols-12 bg-secondary/60 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
              <div className="col-span-2 px-3 py-2">PO No</div>
              <div className="col-span-2 px-3 py-2">Date</div>
              <div className="col-span-3 px-3 py-2">Vendor</div>
              <div className="col-span-1 px-3 py-2 text-right">Items</div>
              <div className="col-span-2 px-3 py-2 text-right">Amount (₹)</div>
              <div className="col-span-2 px-3 py-2">Status</div>
            </div>
            {filtered.map((po, i) => (
              <div
                key={po.id}
                className="grid grid-cols-12 border-b border-border/50 hover:bg-secondary/20"
                data-ocid={`po_register.row.${i + 1}`}
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
                <div className="col-span-1 px-3 py-2 text-[11px] text-right">
                  {po.lineItems.length}
                </div>
                <div className="col-span-2 px-3 py-2 text-[11px] text-right font-mono">
                  ₹
                  {po.totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div
                  className={`col-span-2 px-3 py-2 text-[11px] font-semibold ${STATUS_COLORS[po.status]}`}
                >
                  {po.status}
                </div>
              </div>
            ))}
            {/* Summary row */}
            <div className="grid grid-cols-12 bg-secondary/60 border-t border-border text-[11px] font-bold">
              <div className="col-span-8 px-3 py-2 text-muted-foreground">
                Total ({filtered.length} orders)
              </div>
              <div className="col-span-2 px-3 py-2 text-right text-teal font-mono">
                ₹
                {totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="col-span-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
