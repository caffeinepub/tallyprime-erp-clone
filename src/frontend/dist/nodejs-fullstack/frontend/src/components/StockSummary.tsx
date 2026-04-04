import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Company } from "../backend.d";
import { useInventoryActor } from "../hooks/useInventoryActor";

interface Props {
  company: Company;
}

export default function StockSummary({ company }: Props) {
  const { actor, isFetching } = useInventoryActor();

  const { data: summary = [], isLoading } = useQuery({
    queryKey: ["stockSummary", company.id.toString()],
    queryFn: async () => (actor ? actor.getStockSummary(company.id) : []),
    enabled: !!actor && !isFetching,
  });

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const totals = summary.reduce(
    (acc, row) => ({
      openingQty: acc.openingQty + row.openingQty,
      openingValue: acc.openingValue + row.openingValue,
      inQty: acc.inQty + row.inQty,
      inValue: acc.inValue + row.inValue,
      outQty: acc.outQty + row.outQty,
      outValue: acc.outValue + row.outValue,
      closingQty: acc.closingQty + row.closingQty,
      closingValue: acc.closingValue + row.closingValue,
    }),
    {
      openingQty: 0,
      openingValue: 0,
      inQty: 0,
      inValue: 0,
      outQty: 0,
      outValue: 0,
      closingQty: 0,
      closingValue: 0,
    },
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 bg-secondary/50 border-b border-border flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
          Stock Summary
        </span>
        <span className="text-[11px] text-muted-foreground">
          {company.name}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div
            data-ocid="stock_summary.loading_state"
            className="flex items-center justify-center h-32 text-muted-foreground text-[12px]"
          >
            <Loader2 size={16} className="animate-spin mr-2" /> Loading...
          </div>
        ) : summary.length === 0 ? (
          <div
            data-ocid="stock_summary.empty_state"
            className="flex flex-col items-center justify-center h-32 text-muted-foreground text-[12px]"
          >
            <span>No stock data found.</span>
            <span className="text-[11px] mt-1">
              Create stock items and record receipts/issues to see data here.
            </span>
          </div>
        ) : (
          <table className="w-full tally-table" data-ocid="stock_summary.table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Name</th>
                <th>Unit</th>
                <th className="text-right">Op. Qty</th>
                <th className="text-right">Op. Value</th>
                <th className="text-right">In Qty</th>
                <th className="text-right">In Value</th>
                <th className="text-right">Out Qty</th>
                <th className="text-right">Out Value</th>
                <th className="text-right">Cl. Qty</th>
                <th className="text-right">Cl. Value</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row, i) => (
                <tr
                  key={row.itemId.toString()}
                  data-ocid={`stock_summary.item.${i + 1}`}
                >
                  <td className="text-center text-muted-foreground">{i + 1}</td>
                  <td className="font-medium">{row.itemName}</td>
                  <td className="text-muted-foreground">{row.unit}</td>
                  <td className="text-right font-mono">{row.openingQty}</td>
                  <td className="text-right font-mono">
                    {fmt(row.openingValue)}
                  </td>
                  <td className="text-right font-mono text-green-500">
                    {row.inQty}
                  </td>
                  <td className="text-right font-mono text-green-500">
                    {fmt(row.inValue)}
                  </td>
                  <td className="text-right font-mono text-amber-500">
                    {row.outQty}
                  </td>
                  <td className="text-right font-mono text-amber-500">
                    {fmt(row.outValue)}
                  </td>
                  <td className="text-right font-mono font-semibold">
                    {row.closingQty}
                  </td>
                  <td className="text-right font-mono font-semibold">
                    {fmt(row.closingValue)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-secondary/60 border-t-2 border-border font-bold">
                <td
                  colSpan={3}
                  className="text-right uppercase text-[10px] tracking-wide text-muted-foreground"
                >
                  Totals
                </td>
                <td className="text-right font-mono">{totals.openingQty}</td>
                <td className="text-right font-mono">
                  {fmt(totals.openingValue)}
                </td>
                <td className="text-right font-mono text-green-500">
                  {totals.inQty}
                </td>
                <td className="text-right font-mono text-green-500">
                  {fmt(totals.inValue)}
                </td>
                <td className="text-right font-mono text-amber-500">
                  {totals.outQty}
                </td>
                <td className="text-right font-mono text-amber-500">
                  {fmt(totals.outValue)}
                </td>
                <td className="text-right font-mono">{totals.closingQty}</td>
                <td className="text-right font-mono">
                  {fmt(totals.closingValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
