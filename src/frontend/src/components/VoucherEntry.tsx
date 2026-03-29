import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company, VoucherEntry as VEntry } from "../backend.d";
import { useCreateVoucher, useGetAllLedgers } from "../hooks/useQueries";
import InvoicePrint from "./InvoicePrint";

interface Props {
  company: Company;
  defaultType?: string;
}

const VOUCHER_TYPES = [
  "Payment",
  "Receipt",
  "Journal",
  "Contra",
  "Sales",
  "Purchase",
];

type EntryRow = {
  ledgerId: string;
  entryType: "Dr" | "Cr";
  amount: string;
};

export default function VoucherEntry({
  company,
  defaultType = "Journal",
}: Props) {
  const { data: ledgers } = useGetAllLedgers();
  const createVoucher = useCreateVoucher();

  const [voucherType, setVoucherType] = useState(defaultType);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [narration, setNarration] = useState("");
  const [voucherNumber, setVoucherNumber] = useState("1");
  const [entries, setEntries] = useState<EntryRow[]>([
    { ledgerId: "", entryType: "Dr", amount: "" },
    { ledgerId: "", entryType: "Cr", amount: "" },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);

  const companyLedgers = (ledgers || []).filter(
    (l) => l.companyId === company.id,
  );

  const ledgerNameMap = Object.fromEntries(
    companyLedgers.map((l) => [l.id.toString(), l.name]),
  );

  const totalDr = entries
    .filter((e) => e.entryType === "Dr")
    .reduce((s, e) => s + (Number.parseFloat(e.amount) || 0), 0);
  const totalCr = entries
    .filter((e) => e.entryType === "Cr")
    .reduce((s, e) => s + (Number.parseFloat(e.amount) || 0), 0);
  const isBalanced = Math.abs(totalDr - totalCr) < 0.001 && totalDr > 0;

  const addRow = () =>
    setEntries((prev) => [
      ...prev,
      { ledgerId: "", entryType: "Dr", amount: "" },
    ]);

  const removeRow = (i: number) =>
    setEntries((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i: number, field: keyof EntryRow, value: string) =>
    setEntries((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    );

  const handleSubmit = async () => {
    if (!isBalanced) {
      toast.error("Debit and Credit totals must be equal");
      return;
    }
    const vEntries: VEntry[] = entries
      .filter((e) => e.ledgerId && Number.parseFloat(e.amount) > 0)
      .map((e) => ({
        ledgerId: BigInt(e.ledgerId),
        entryType: e.entryType,
        amount: Number.parseFloat(e.amount),
      }));

    if (vEntries.length < 2) {
      toast.error("At least two entries required");
      return;
    }

    const dateTs = BigInt(new Date(date).getTime()) * 1000000n;

    await createVoucher.mutateAsync({
      companyId: company.id,
      voucherType,
      voucherNumber: BigInt(voucherNumber),
      date: dateTs,
      narration,
      entries: vEntries,
    });

    toast.success("Voucher saved successfully");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEntries([
        { ledgerId: "", entryType: "Dr", amount: "" },
        { ledgerId: "", entryType: "Cr", amount: "" },
      ]);
      setNarration("");
      setVoucherNumber((n) => (Number.parseInt(n) + 1).toString());
    }, 1500);
  };

  const printEntries = entries
    .filter((e) => e.ledgerId && Number.parseFloat(e.amount) > 0)
    .map((e) => ({
      ledgerName: ledgerNameMap[e.ledgerId] ?? `Ledger #${e.ledgerId}`,
      entryType: e.entryType,
      amount: Number.parseFloat(e.amount) || 0,
    }));

  const canPrint =
    (voucherType === "Sales" || voucherType === "Purchase") &&
    printEntries.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-4 py-2 bg-secondary/50 border-b border-border flex items-center justify-between">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            Voucher Entry
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            {company.name}
          </span>
        </div>
        {canPrint && (
          <button
            type="button"
            data-ocid="voucher.print.button"
            onClick={() => setShowInvoicePrint(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 transition-colors"
          >
            <Printer size={12} /> Print Invoice
          </button>
        )}
      </div>

      {/* Voucher Type Tabs */}
      <div className="flex border-b border-border">
        {VOUCHER_TYPES.map((vt, i) => (
          <button
            type="button"
            key={vt}
            data-ocid={`voucher.${vt.toLowerCase()}.tab`}
            onClick={() => setVoucherType(vt)}
            className={`px-3 py-1.5 text-[11px] font-medium border-r border-border transition-colors ${
              voucherType === vt
                ? "bg-teal text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            F{i + 4}: {vt}
          </button>
        ))}
      </div>

      {/* Form Area */}
      <div className="flex-1 overflow-auto p-4">
        {/* Top Meta Row */}
        <div className="flex gap-4 mb-4">
          <div>
            <label
              htmlFor="vch-date"
              className="text-[10px] text-muted-foreground uppercase block mb-1"
            >
              Date
            </label>
            <input
              id="vch-date"
              data-ocid="voucher.input"
              type="date"
              className="tally-input w-36"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="vch-no"
              className="text-[10px] text-muted-foreground uppercase block mb-1"
            >
              Vch No.
            </label>
            <input
              id="vch-no"
              className="tally-input w-24"
              value={voucherNumber}
              onChange={(e) => setVoucherNumber(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="vch-narration"
              className="text-[10px] text-muted-foreground uppercase block mb-1"
            >
              Narration
            </label>
            <input
              id="vch-narration"
              data-ocid="voucher.textarea"
              className="tally-input w-full"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Enter narration..."
            />
          </div>
        </div>

        {/* Entries Table */}
        <div className="border border-border">
          <table className="w-full tally-table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Ledger Account</th>
                <th className="w-24">Dr/Cr</th>
                <th className="w-36 text-right">Amount (INR)</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {entries.map((row, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: entry rows are order-dependent
                <tr key={i} data-ocid={`voucher.item.${i + 1}`}>
                  <td className="text-center text-muted-foreground">{i + 1}</td>
                  <td>
                    <select
                      className="tally-input"
                      value={row.ledgerId}
                      onChange={(e) => updateRow(i, "ledgerId", e.target.value)}
                    >
                      <option value="">-- Select Ledger --</option>
                      {companyLedgers.map((l) => (
                        <option key={l.id.toString()} value={l.id.toString()}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="tally-input"
                      value={row.entryType}
                      onChange={(e) =>
                        updateRow(i, "entryType", e.target.value as "Dr" | "Cr")
                      }
                    >
                      <option value="Dr">Dr</option>
                      <option value="Cr">Cr</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="tally-input text-right"
                      value={row.amount}
                      onChange={(e) => updateRow(i, "amount", e.target.value)}
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    {entries.length > 2 && (
                      <button
                        type="button"
                        data-ocid={`voucher.delete_button.${i + 1}`}
                        onClick={() => removeRow(i)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-secondary/50">
                <td
                  colSpan={3}
                  className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Totals
                </td>
                <td className="text-right font-mono">
                  <div
                    className={`text-[11px] ${
                      isBalanced
                        ? "text-green-400"
                        : totalDr > 0
                          ? "text-amber-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    Dr:{" "}
                    {totalDr.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div
                    className={`text-[11px] ${
                      isBalanced
                        ? "text-green-400"
                        : totalCr > 0
                          ? "text-amber-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    Cr:{" "}
                    {totalCr.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Balance indicator */}
        <div className="flex items-center justify-between mt-3">
          <button
            type="button"
            data-ocid="voucher.secondary_button"
            onClick={addRow}
            className="flex items-center gap-1 text-[11px] text-teal hover:text-teal-bright transition-colors"
          >
            <Plus size={12} /> Add Row (Alt+A)
          </button>
          <div className="flex items-center gap-1 text-[11px]">
            {isBalanced ? (
              <>
                <CheckCircle size={12} className="text-green-400" />
                <span className="text-green-400">Balanced</span>
              </>
            ) : (
              <>
                <AlertCircle size={12} className="text-amber-400" />
                <span className="text-amber-400">
                  Diff:{" "}
                  {Math.abs(totalDr - totalCr).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/30">
        <span className="text-[10px] text-muted-foreground">
          Press Ctrl+A to Accept | ESC to Abandon
        </span>
        <button
          type="button"
          data-ocid="voucher.submit_button"
          onClick={handleSubmit}
          disabled={createVoucher.isPending || submitted || !isBalanced}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
        >
          {createVoucher.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : submitted ? (
            <CheckCircle size={13} />
          ) : null}
          {submitted ? "Saved!" : "Accept Voucher (Ctrl+A)"}
        </button>
      </div>

      {/* Invoice Print Modal */}
      {showInvoicePrint && (
        <InvoicePrint
          company={company}
          voucherType={voucherType}
          entries={printEntries}
          voucherDate={date}
          voucherNumber={voucherNumber}
          onClose={() => setShowInvoicePrint(false)}
        />
      )}
    </div>
  );
}
