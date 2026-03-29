import { FileDown, Loader2, Search } from "lucide-react";
import { useState } from "react";
import type { Company } from "../backend.d";
import { useGetGSTR1 } from "../hooks/useQueries";

interface Props {
  company: Company;
}

function dateToNano(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * 1_000_000n;
}

function formatDate(nano: bigint): string {
  return new Date(Number(nano / 1_000_000n)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GSTR1Report({ company }: Props) {
  const currentYear = new Date().getFullYear();
  const [fromDate, setFromDate] = useState(`${currentYear}-04-01`);
  const [toDate, setToDate] = useState(`${currentYear}-03-31`);
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [fromNano, setFromNano] = useState(dateToNano(`${currentYear}-04-01`));
  const [toNano, setToNano] = useState(dateToNano(`${currentYear}-03-31`));

  const {
    data: entries,
    isLoading,
    isFetching,
  } = useGetGSTR1(company.id, fromNano, toNano, queryEnabled);

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const handleFetch = () => {
    setFromNano(dateToNano(fromDate));
    setToNano(dateToNano(toDate));
    setQueryEnabled(true);
  };

  const totals = (entries || []).reduce(
    (acc, e) => ({
      invoiceValue: acc.invoiceValue + e.invoiceValue,
      taxableValue: acc.taxableValue + e.taxableValue,
      cgst: acc.cgst + e.cgst,
      sgst: acc.sgst + e.sgst,
      igst: acc.igst + e.igst,
      cess: acc.cess + e.cess,
    }),
    { invoiceValue: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, cess: 0 },
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            GSTR-1
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            Outward Supplies Return – {company.name}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground border border-border/60 px-2 py-0.5">
          <span className="tally-key-badge mr-1">E</span>Export
        </span>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-card">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
          Period:
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">From</span>
          <input
            type="date"
            className="tally-input py-0.5 px-2 text-[11px] w-36"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            data-ocid="gstr1.input"
          />
          <span className="text-[11px] text-muted-foreground">To</span>
          <input
            type="date"
            className="tally-input py-0.5 px-2 text-[11px] w-36"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <button
          type="button"
          data-ocid="gstr1.primary_button"
          onClick={handleFetch}
          className="flex items-center gap-1.5 px-3 py-1 text-[11px] bg-teal text-primary-foreground hover:bg-teal-bright transition-colors"
        >
          <Search size={11} /> Show Report
        </button>
        {isFetching && <Loader2 size={12} className="animate-spin text-teal" />}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading && queryEnabled ? (
          <div
            className="flex items-center justify-center py-10 gap-2"
            data-ocid="gstr1.loading_state"
          >
            <Loader2 size={16} className="animate-spin text-teal" />
            <span className="text-muted-foreground text-[12px]">
              Loading GSTR-1 data...
            </span>
          </div>
        ) : !queryEnabled ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="gstr1.empty_state"
          >
            <FileDown size={32} className="text-muted-foreground/30" />
            <p className="text-muted-foreground text-[12px]">
              Select period and click Show Report
            </p>
          </div>
        ) : (entries || []).length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="gstr1.empty_state"
          >
            <FileDown size={32} className="text-muted-foreground/30" />
            <p className="text-muted-foreground text-[12px]">
              No outward supply transactions found for the selected period
            </p>
          </div>
        ) : (
          <table className="w-full tally-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Invoice Date</th>
                <th>Party Name</th>
                <th>GSTIN</th>
                <th>Place of Supply</th>
                <th className="text-right">Invoice Value</th>
                <th className="text-right">Taxable Value</th>
                <th className="text-right">CGST</th>
                <th className="text-right">SGST</th>
                <th className="text-right">IGST</th>
                <th>HSN</th>
              </tr>
            </thead>
            <tbody>
              {(entries || []).map((e, i) => (
                <tr
                  key={e.invoiceNumber.toString()}
                  data-ocid={`gstr1.item.${i + 1}`}
                >
                  <td className="font-mono text-teal">
                    {e.invoiceNumber.toString()}
                  </td>
                  <td className="font-mono">{formatDate(e.invoiceDate)}</td>
                  <td className="text-foreground">{e.partyName}</td>
                  <td className="font-mono text-[10px]">
                    {e.partyGSTIN || "–"}
                  </td>
                  <td>{e.placeOfSupply}</td>
                  <td className="text-right font-mono text-numeric">
                    {fmt(e.invoiceValue)}
                  </td>
                  <td className="text-right font-mono text-numeric">
                    {fmt(e.taxableValue)}
                  </td>
                  <td className="text-right font-mono text-numeric">
                    {fmt(e.cgst)}
                  </td>
                  <td className="text-right font-mono text-numeric">
                    {fmt(e.sgst)}
                  </td>
                  <td className="text-right font-mono text-numeric">
                    {fmt(e.igst)}
                  </td>
                  <td className="font-mono text-[10px] text-muted-foreground">
                    {e.hsnCode || "–"}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-secondary/30 font-semibold">
                <td colSpan={5} className="text-right text-muted-foreground">
                  TOTALS
                </td>
                <td className="text-right font-mono text-foreground">
                  {fmt(totals.invoiceValue)}
                </td>
                <td className="text-right font-mono text-foreground">
                  {fmt(totals.taxableValue)}
                </td>
                <td className="text-right font-mono text-teal">
                  {fmt(totals.cgst)}
                </td>
                <td className="text-right font-mono text-teal">
                  {fmt(totals.sgst)}
                </td>
                <td className="text-right font-mono text-teal">
                  {fmt(totals.igst)}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
