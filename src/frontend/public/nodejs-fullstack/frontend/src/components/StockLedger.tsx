import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { Company } from "../backend.d";
import { useInventoryActor } from "../hooks/useInventoryActor";

interface Props {
  company: Company;
}

export default function StockLedger({ company }: Props) {
  const { actor, isFetching } = useInventoryActor();
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const { data: stockItems = [] } = useQuery({
    queryKey: ["stockItems"],
    queryFn: async () => (actor ? actor.getAllStockItems() : []),
    enabled: !!actor && !isFetching,
  });

  const { data: ledgerEntries = [], isLoading } = useQuery({
    queryKey: ["stockLedger", company.id.toString(), selectedItemId],
    queryFn: async () => {
      if (!actor || !selectedItemId) return [];
      return actor.getStockLedger(company.id, BigInt(selectedItemId));
    },
    enabled: !!actor && !isFetching && !!selectedItemId,
  });

  const companyItems = stockItems.filter((it) => it.companyId === company.id);
  const selectedItem = companyItems.find(
    (it) => it.id.toString() === selectedItemId,
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const fmtDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 bg-secondary/50 border-b border-border flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
          Stock Ledger
        </span>
        <span className="text-[11px] text-muted-foreground">
          {company.name}
        </span>
      </div>

      {/* Item selector */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="text-[11px] text-muted-foreground">
          Select Stock Item:
        </div>
        <select
          data-ocid="stock_ledger.select"
          className="tally-input w-56"
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
        >
          <option value="">-- Select Item --</option>
          {companyItems.map((it) => (
            <option key={it.id.toString()} value={it.id.toString()}>
              {it.name} ({it.unit})
            </option>
          ))}
        </select>
        {selectedItem && (
          <span className="text-[11px] text-muted-foreground">
            Opening: {selectedItem.openingQty} {selectedItem.unit} @ ₹
            {fmt(selectedItem.openingRate)}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {!selectedItemId ? (
          <div
            data-ocid="stock_ledger.empty_state"
            className="flex items-center justify-center h-32 text-muted-foreground text-[12px]"
          >
            Select a stock item to view its ledger.
          </div>
        ) : isLoading ? (
          <div
            data-ocid="stock_ledger.loading_state"
            className="flex items-center justify-center h-32 text-muted-foreground text-[12px]"
          >
            <Loader2 size={16} className="animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <table className="w-full tally-table" data-ocid="stock_ledger.table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Voucher Type</th>
                <th>Vch No.</th>
                <th>Narration</th>
                <th className="text-right">In Qty</th>
                <th className="text-right">In Value</th>
                <th className="text-right">Out Qty</th>
                <th className="text-right">Out Value</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {/* Opening row */}
              {selectedItem && (
                <tr className="bg-secondary/40 font-medium">
                  <td className="text-muted-foreground">Opening</td>
                  <td>—</td>
                  <td>—</td>
                  <td className="text-muted-foreground">Opening Balance</td>
                  <td className="text-right font-mono text-green-500">
                    {selectedItem.openingQty}
                  </td>
                  <td className="text-right font-mono text-green-500">
                    {fmt(selectedItem.openingValue)}
                  </td>
                  <td className="text-right text-muted-foreground">—</td>
                  <td className="text-right text-muted-foreground">—</td>
                  <td className="text-right font-mono font-bold">
                    {selectedItem.openingQty}
                  </td>
                </tr>
              )}
              {ledgerEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center text-muted-foreground py-4 text-[12px]"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                ledgerEntries.map((entry, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: ledger entries ordered by date
                  <tr key={i} data-ocid={`stock_ledger.item.${i + 1}`}>
                    <td className="font-mono text-[11px]">
                      {fmtDate(entry.date)}
                    </td>
                    <td>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 font-semibold ${
                          entry.voucherType === "Receipt"
                            ? "bg-green-500/20 text-green-400"
                            : entry.voucherType === "Issue"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {entry.voucherType}
                      </span>
                    </td>
                    <td className="font-mono text-[11px]">
                      {entry.voucherNumber.toString()}
                    </td>
                    <td className="text-muted-foreground text-[11px] truncate max-w-[160px]">
                      {entry.narration || "—"}
                    </td>
                    <td className="text-right font-mono text-green-500">
                      {entry.inQty > 0 ? entry.inQty : "—"}
                    </td>
                    <td className="text-right font-mono text-green-500">
                      {entry.inValue > 0 ? fmt(entry.inValue) : "—"}
                    </td>
                    <td className="text-right font-mono text-amber-500">
                      {entry.outQty > 0 ? entry.outQty : "—"}
                    </td>
                    <td className="text-right font-mono text-amber-500">
                      {entry.outValue > 0 ? fmt(entry.outValue) : "—"}
                    </td>
                    <td className="text-right font-mono font-semibold">
                      {entry.balance}
                    </td>
                  </tr>
                ))
              )}
              {/* Closing row */}
              {ledgerEntries.length > 0 && (
                <tr className="bg-secondary/60 border-t-2 border-border font-bold">
                  <td
                    colSpan={4}
                    className="text-right uppercase text-[10px] tracking-wide text-muted-foreground"
                  >
                    Closing Balance
                  </td>
                  <td className="text-right font-mono text-green-500">
                    {ledgerEntries.reduce((s, e) => s + e.inQty, 0)}
                  </td>
                  <td className="text-right font-mono text-green-500">
                    {fmt(ledgerEntries.reduce((s, e) => s + e.inValue, 0))}
                  </td>
                  <td className="text-right font-mono text-amber-500">
                    {ledgerEntries.reduce((s, e) => s + e.outQty, 0)}
                  </td>
                  <td className="text-right font-mono text-amber-500">
                    {fmt(ledgerEntries.reduce((s, e) => s + e.outValue, 0))}
                  </td>
                  <td className="text-right font-mono">
                    {ledgerEntries[ledgerEntries.length - 1]?.balance ?? 0}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
