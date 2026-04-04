import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company, GSTVoucherEntry as GSTEntry } from "../backend.d";
import {
  useCreateGSTVoucher,
  useGetAllHSNCodes,
  useGetAllLedgers,
} from "../hooks/useQueries";

interface Props {
  company: Company;
}

type LineItem = {
  uid: string;
  ledgerId: string;
  entryType: string;
  taxableAmount: string;
  hsnCode: string;
  gstRate: number;
};

let lineCounter = 0;
const newLine = (): LineItem => ({
  uid: `line-${++lineCounter}`,
  ledgerId: "",
  entryType: "Dr",
  taxableAmount: "",
  hsnCode: "",
  gstRate: 18,
});

function calcTax(taxable: number, rate: number, interState: boolean) {
  const total = (taxable * rate) / 100;
  if (interState) return { cgst: 0, sgst: 0, igst: total, cess: 0 };
  return { cgst: total / 2, sgst: total / 2, igst: 0, cess: 0 };
}

export default function GSTVoucherEntry({ company }: Props) {
  const { data: ledgers } = useGetAllLedgers();
  const { data: hsnCodes } = useGetAllHSNCodes();
  const createGSTVoucher = useCreateGSTVoucher();

  const companyLedgers = (ledgers || []).filter(
    (l) => l.companyId === company.id,
  );

  const [voucherType, setVoucherType] = useState("Sales");
  const [voucherNumber, setVoucherNumber] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [narration, setNarration] = useState("");
  const [partyName, setPartyName] = useState("");
  const [partyGSTIN, setPartyGSTIN] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("Maharashtra");
  const [isInterState, setIsInterState] = useState(false);
  const [lines, setLines] = useState<LineItem[]>([newLine()]);

  const updateLine = (uid: string, patch: Partial<LineItem>) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.uid !== uid) return line;
        const updated = { ...line, ...patch };
        if (patch.hsnCode !== undefined) {
          const hsn = (hsnCodes || []).find((h) => h.code === patch.hsnCode);
          if (hsn) updated.gstRate = hsn.gstRate;
        }
        return updated;
      }),
    );
  };

  const removeLine = (uid: string) =>
    setLines((p) => p.filter((l) => l.uid !== uid));

  const totals = lines.reduce(
    (acc, line) => {
      const taxable = Number.parseFloat(line.taxableAmount) || 0;
      const { cgst, sgst, igst, cess } = calcTax(
        taxable,
        line.gstRate,
        isInterState,
      );
      return {
        taxable: acc.taxable + taxable,
        cgst: acc.cgst + cgst,
        sgst: acc.sgst + sgst,
        igst: acc.igst + igst,
        cess: acc.cess + cess,
        total: acc.total + taxable + cgst + sgst + igst + cess,
      };
    },
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const handleSave = async () => {
    try {
      const entries: GSTEntry[] = lines.map((line) => {
        const taxable = Number.parseFloat(line.taxableAmount) || 0;
        const { cgst, sgst, igst, cess } = calcTax(
          taxable,
          line.gstRate,
          isInterState,
        );
        const half = line.gstRate / 2;
        return {
          ledgerId: BigInt(line.ledgerId || "0"),
          amount: taxable + cgst + sgst + igst + cess,
          entryType: line.entryType,
          hsnCode: line.hsnCode || undefined,
          taxableAmount: taxable > 0 ? taxable : undefined,
          cgstRate: !isInterState ? half : undefined,
          sgstRate: !isInterState ? half : undefined,
          igstRate: isInterState ? line.gstRate : undefined,
          cgstAmount: !isInterState ? cgst : undefined,
          sgstAmount: !isInterState ? sgst : undefined,
          igstAmount: isInterState ? igst : undefined,
          cessAmount: cess > 0 ? cess : undefined,
        };
      });

      await createGSTVoucher.mutateAsync({
        companyId: company.id,
        voucherType,
        voucherNumber: BigInt(voucherNumber),
        date: BigInt(new Date(date).getTime() * 1_000_000),
        narration,
        entries,
        partyName,
        partyGSTIN,
        placeOfSupply,
        isInterState,
      });
      toast.success("GST Voucher saved successfully");
      setLines([newLine()]);
      setPartyName("");
      setPartyGSTIN("");
      setNarration("");
    } catch {
      toast.error("Failed to save GST Voucher");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border flex-shrink-0">
        <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
          GST Voucher Entry
        </span>
        <div className="flex items-center gap-2">
          <select
            className="tally-input text-[11px] py-0.5 px-2"
            value={voucherType}
            onChange={(e) => setVoucherType(e.target.value)}
            data-ocid="gst_voucher.select"
          >
            <option>Sales</option>
            <option>Purchase</option>
          </select>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {/* Top Section */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1 uppercase">
                  Voucher No.
                </span>
                <input
                  className="tally-input font-mono"
                  value={voucherNumber}
                  onChange={(e) => setVoucherNumber(e.target.value)}
                  data-ocid="gst_voucher.input"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1 uppercase">
                  Date
                </span>
                <input
                  type="date"
                  className="tally-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 uppercase">
                Party Name *
              </span>
              <input
                className="tally-input"
                placeholder="Enter party / customer name"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 uppercase">
                Party GSTIN
              </span>
              <input
                className="tally-input font-mono uppercase"
                placeholder="e.g. 27AABCU9603R1ZX"
                value={partyGSTIN}
                onChange={(e) => setPartyGSTIN(e.target.value.toUpperCase())}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 uppercase">
                Place of Supply
              </span>
              <input
                className="tally-input"
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 p-3 bg-card border border-border">
              <span className="text-[12px] text-foreground flex-1">
                Inter-State Supply (IGST applicable)
              </span>
              <button
                type="button"
                data-ocid="gst_voucher.toggle"
                onClick={() => setIsInterState((p) => !p)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isInterState ? "bg-teal" : "bg-border"}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    isInterState ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 uppercase">
                Narration
              </span>
              <input
                className="tally-input"
                placeholder="Brief description"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-border mb-0">
          <div className="px-3 py-1.5 bg-secondary/50 border-b border-border">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
              Line Items
            </span>
          </div>
          <table className="w-full" style={{ fontSize: "11px" }}>
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">
                  Ledger
                </th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">
                  Dr/Cr
                </th>
                <th className="px-2 py-1.5 text-left text-muted-foreground font-medium">
                  HSN Code
                </th>
                <th className="px-2 py-1.5 text-right text-muted-foreground font-medium">
                  Taxable Amt
                </th>
                <th className="px-2 py-1.5 text-right text-muted-foreground font-medium">
                  GST %
                </th>
                <th className="px-2 py-1.5 text-right text-muted-foreground font-medium">
                  {isInterState ? "IGST" : "CGST"}
                </th>
                <th className="px-2 py-1.5 text-right text-muted-foreground font-medium">
                  {isInterState ? "\u2013" : "SGST"}
                </th>
                <th className="px-2 py-1.5 text-right text-muted-foreground font-medium">
                  Total
                </th>
                <th className="px-2 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => {
                const taxable = Number.parseFloat(line.taxableAmount) || 0;
                const { cgst, sgst, igst } = calcTax(
                  taxable,
                  line.gstRate,
                  isInterState,
                );
                const lineTotal = taxable + cgst + sgst + igst;
                return (
                  <tr
                    key={line.uid}
                    className="border-b border-border/50 hover:bg-secondary/20"
                    data-ocid={`gst_voucher.item.${idx + 1}`}
                  >
                    <td className="px-2 py-1">
                      <select
                        className="bg-transparent text-foreground text-[11px] focus:outline-none w-full min-w-[120px]"
                        value={line.ledgerId}
                        onChange={(e) =>
                          updateLine(line.uid, { ledgerId: e.target.value })
                        }
                      >
                        <option value="">-- Select --</option>
                        {companyLedgers.map((l) => (
                          <option key={l.id.toString()} value={l.id.toString()}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <select
                        className="bg-transparent text-foreground text-[11px] focus:outline-none"
                        value={line.entryType}
                        onChange={(e) =>
                          updateLine(line.uid, { entryType: e.target.value })
                        }
                      >
                        <option value="Dr">Dr</option>
                        <option value="Cr">Cr</option>
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <select
                        className="bg-transparent text-teal font-mono text-[11px] focus:outline-none w-full"
                        value={line.hsnCode}
                        onChange={(e) =>
                          updateLine(line.uid, { hsnCode: e.target.value })
                        }
                      >
                        <option value="">-- None --</option>
                        {(hsnCodes || []).map((h) => (
                          <option key={h.id.toString()} value={h.code}>
                            {h.code} – {h.description}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        className="bg-transparent text-right text-foreground font-mono text-[11px] focus:outline-none w-24"
                        value={line.taxableAmount}
                        onChange={(e) =>
                          updateLine(line.uid, {
                            taxableAmount: e.target.value,
                          })
                        }
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-2 py-1 text-right font-mono text-amber-400">
                      {line.gstRate}%
                    </td>
                    <td className="px-2 py-1 text-right font-mono text-numeric">
                      {fmt(isInterState ? igst : cgst)}
                    </td>
                    <td className="px-2 py-1 text-right font-mono text-numeric">
                      {isInterState ? "\u2013" : fmt(sgst)}
                    </td>
                    <td className="px-2 py-1 text-right font-mono font-semibold text-foreground">
                      {fmt(lineTotal)}
                    </td>
                    <td className="px-2 py-1">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(line.uid)}
                          className="text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-border">
            <button
              type="button"
              data-ocid="gst_voucher.primary_button"
              onClick={() => setLines((p) => [...p, newLine()])}
              className="flex items-center gap-1 text-[11px] text-teal hover:text-teal-bright transition-colors"
            >
              <Plus size={11} /> Add Line
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="border border-border border-t-0 bg-secondary/20">
          <div className="flex justify-end">
            <div className="min-w-[400px] p-3">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">
                Invoice Summary
              </div>
              {[
                { label: "Taxable Value", value: totals.taxable },
                ...(isInterState
                  ? [{ label: "IGST", value: totals.igst }]
                  : [
                      { label: "CGST", value: totals.cgst },
                      { label: "SGST", value: totals.sgst },
                    ]),
                ...(totals.cess > 0
                  ? [{ label: "Cess", value: totals.cess }]
                  : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between py-0.5 text-[12px]"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono text-foreground">
                    {fmt(value)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-1 border-t border-border mt-1 text-[13px] font-bold">
                <span className="text-foreground">Invoice Total</span>
                <span className="font-mono text-teal">{fmt(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            data-ocid="gst_voucher.submit_button"
            onClick={handleSave}
            disabled={createGSTVoucher.isPending || !partyName.trim()}
            className="flex items-center gap-2 px-6 py-2 text-[12px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
          >
            {createGSTVoucher.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : null}
            Accept (Ctrl+A)
          </button>
        </div>
      </div>
    </div>
  );
}
