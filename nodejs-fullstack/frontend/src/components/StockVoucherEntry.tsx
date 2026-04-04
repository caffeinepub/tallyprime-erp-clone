import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company, StockVoucherEntry as SVEntry } from "../backend.d";
import { useInventoryActor } from "../hooks/useInventoryActor";

interface Props {
  company: Company;
  defaultType?: string;
}

type LineRow = {
  stockItemId: string;
  qty: string;
  rate: string;
};

export default function StockVoucherEntry({
  company,
  defaultType = "Receipt",
}: Props) {
  const { actor, isFetching } = useInventoryActor();
  const qc = useQueryClient();

  const { data: stockItems = [] } = useQuery({
    queryKey: ["stockItems"],
    queryFn: async () => (actor ? actor.getAllStockItems() : []),
    enabled: !!actor && !isFetching,
  });

  const createMut = useMutation({
    mutationFn: async (v: {
      voucherType: string;
      voucherNumber: bigint;
      date: bigint;
      narration: string;
      entries: SVEntry[];
    }) =>
      actor!.createStockVoucher(
        company.id,
        v.voucherType,
        v.voucherNumber,
        v.date,
        v.narration,
        v.entries,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stockVouchers"] });
      qc.invalidateQueries({ queryKey: ["stockSummary"] });
    },
    onError: () => toast.error("Failed to save stock voucher"),
  });

  const [voucherType] = useState(defaultType);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [narration, setNarration] = useState("");
  const [voucherNumber, setVoucherNumber] = useState("1");
  const [rows, setRows] = useState<LineRow[]>([
    { stockItemId: "", qty: "", rate: "" },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const companyItems = stockItems.filter((it) => it.companyId === company.id);

  const addRow = () =>
    setRows((prev) => [...prev, { stockItemId: "", qty: "", rate: "" }]);
  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof LineRow, value: string) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );

  const handleItemSelect = (i: number, itemId: string) => {
    const item = companyItems.find((it) => it.id.toString() === itemId);
    setRows((prev) =>
      prev.map((r, idx) =>
        idx === i
          ? {
              ...r,
              stockItemId: itemId,
              rate: item ? item.openingRate.toString() : r.rate,
            }
          : r,
      ),
    );
  };

  const totalAmount = rows.reduce(
    (s, r) => s + (Number(r.qty) || 0) * (Number(r.rate) || 0),
    0,
  );

  const handleSubmit = async () => {
    const validRows = rows.filter(
      (r) => r.stockItemId && Number(r.qty) > 0 && Number(r.rate) > 0,
    );
    if (validRows.length === 0) {
      toast.error("Add at least one valid line item");
      return;
    }

    const entries: SVEntry[] = validRows.map((r) => ({
      stockItemId: BigInt(r.stockItemId),
      qty: Number(r.qty),
      rate: Number(r.rate),
      amount: Number(r.qty) * Number(r.rate),
    }));

    const dateTs = BigInt(new Date(date).getTime()) * 1_000_000n;

    await createMut.mutateAsync({
      voucherType,
      voucherNumber: BigInt(voucherNumber),
      date: dateTs,
      narration,
      entries,
    });

    toast.success(`Stock ${voucherType} voucher saved`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRows([{ stockItemId: "", qty: "", rate: "" }]);
      setNarration("");
      setVoucherNumber((n) => (Number.parseInt(n) + 1).toString());
    }, 1500);
  };

  const typeColor: Record<string, string> = {
    Receipt: "bg-green-600/80",
    Issue: "bg-amber-600/80",
    Transfer: "bg-blue-600/80",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 bg-secondary/50 border-b border-border flex items-center gap-3">
        <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
          Stock Voucher Entry
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 text-white ${
            typeColor[voucherType] ?? "bg-secondary"
          }`}
        >
          {voucherType}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {company.name}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Meta row */}
        <div className="flex gap-4 mb-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase mb-1">
              Date
            </div>
            <input
              data-ocid="stock_voucher.input"
              type="date"
              className="tally-input w-36"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase mb-1">
              Vch No.
            </div>
            <input
              className="tally-input w-24"
              value={voucherNumber}
              onChange={(e) => setVoucherNumber(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">
              Narration
            </div>
            <input
              data-ocid="stock_voucher.textarea"
              className="tally-input w-full"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Enter narration..."
            />
          </div>
        </div>

        {/* Lines table */}
        <div className="border border-border">
          <table className="w-full tally-table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Stock Item</th>
                <th className="w-28 text-right">Qty</th>
                <th className="w-28 text-right">Rate (₹)</th>
                <th className="w-32 text-right">Amount (₹)</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const amount = (Number(row.qty) || 0) * (Number(row.rate) || 0);
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: row order matters
                  <tr key={i} data-ocid={`stock_voucher.item.${i + 1}`}>
                    <td className="text-center text-muted-foreground">
                      {i + 1}
                    </td>
                    <td>
                      <select
                        className="tally-input w-full"
                        value={row.stockItemId}
                        onChange={(e) => handleItemSelect(i, e.target.value)}
                      >
                        <option value="">-- Select Item --</option>
                        {companyItems.map((it) => (
                          <option
                            key={it.id.toString()}
                            value={it.id.toString()}
                          >
                            {it.name} ({it.unit})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="tally-input text-right w-full"
                        value={row.qty}
                        onChange={(e) => updateRow(i, "qty", e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="tally-input text-right w-full"
                        value={row.rate}
                        onChange={(e) => updateRow(i, "rate", e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="text-right font-mono text-[11px] pr-2">
                      {amount > 0
                        ? amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
                        : "—"}
                    </td>
                    <td>
                      {rows.length > 1 && (
                        <button
                          type="button"
                          data-ocid={`stock_voucher.delete_button.${i + 1}`}
                          onClick={() => removeRow(i)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-secondary/50">
                <td
                  colSpan={4}
                  className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide pr-2"
                >
                  Total Amount
                </td>
                <td className="text-right font-mono font-bold text-[12px] pr-2">
                  ₹
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <button
            type="button"
            data-ocid="stock_voucher.secondary_button"
            onClick={addRow}
            className="flex items-center gap-1 text-[11px] text-teal hover:text-teal/80 transition-colors"
          >
            <Plus size={12} /> Add Row
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/30">
        <span className="text-[10px] text-muted-foreground">
          Press Ctrl+A to Accept | ESC to Abandon
        </span>
        <button
          type="button"
          data-ocid="stock_voucher.submit_button"
          onClick={handleSubmit}
          disabled={createMut.isPending || submitted}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold bg-teal text-primary-foreground hover:bg-teal/90 disabled:opacity-50 transition-colors"
        >
          {createMut.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : submitted ? (
            <CheckCircle size={13} />
          ) : null}
          {submitted ? "Saved!" : "Accept Voucher (Ctrl+A)"}
        </button>
      </div>
    </div>
  );
}
