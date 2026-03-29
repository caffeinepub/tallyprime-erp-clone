import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import type { Company } from "../backend.d";
import { useGetGSTR3B } from "../hooks/useQueries";

interface Props {
  company: Company;
}

function dateToNano(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * 1_000_000n;
}

function Row({
  label,
  value,
  indent = false,
  bold = false,
}: { label: string; value: number; indent?: boolean; bold?: boolean }) {
  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
  return (
    <div
      className={`flex justify-between py-1 px-3 border-b border-border/40 ${bold ? "bg-secondary/30" : ""}`}
    >
      <span
        className={`text-[12px] ${indent ? "pl-4" : ""} ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`font-mono text-[12px] ${bold ? "text-teal font-semibold" : "text-numeric"}`}
      >
        {fmt(value)}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border mb-4">
      <div className="px-3 py-2 bg-secondary/50 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wide text-teal">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function GSTR3BReport({ company }: Props) {
  const currentYear = new Date().getFullYear();
  const [fromDate, setFromDate] = useState(`${currentYear}-04-01`);
  const [toDate, setToDate] = useState(`${currentYear}-03-31`);
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [fromNano, setFromNano] = useState(dateToNano(`${currentYear}-04-01`));
  const [toNano, setToNano] = useState(dateToNano(`${currentYear}-03-31`));

  const {
    data: summary,
    isLoading,
    isFetching,
  } = useGetGSTR3B(company.id, fromNano, toNano, queryEnabled);

  const handleFetch = () => {
    setFromNano(dateToNano(fromDate));
    setToNano(dateToNano(toDate));
    setQueryEnabled(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            GSTR-3B
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            Monthly Return Summary – {company.name}
          </span>
        </div>
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
            data-ocid="gstr3b.input"
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
          data-ocid="gstr3b.primary_button"
          onClick={handleFetch}
          className="flex items-center gap-1.5 px-3 py-1 text-[11px] bg-teal text-primary-foreground hover:bg-teal-bright transition-colors"
        >
          <Search size={11} /> Show Return
        </button>
        {isFetching && <Loader2 size={12} className="animate-spin text-teal" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading && queryEnabled ? (
          <div
            className="flex items-center justify-center py-10 gap-2"
            data-ocid="gstr3b.loading_state"
          >
            <Loader2 size={16} className="animate-spin text-teal" />
            <span className="text-muted-foreground text-[12px]">
              Generating GSTR-3B...
            </span>
          </div>
        ) : !queryEnabled ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="gstr3b.empty_state"
          >
            <p className="text-muted-foreground text-[12px]">
              Select period and click Show Return to generate GSTR-3B summary
            </p>
          </div>
        ) : !summary ? (
          <div
            className="text-center py-10 text-muted-foreground text-[12px]"
            data-ocid="gstr3b.empty_state"
          >
            No data available for the selected period
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="mb-4 text-[12px] text-muted-foreground">
              Form GSTR-3B · {company.name} · Period: {fromDate} to {toDate}
            </div>

            {/* Section 3.1 */}
            <Section title="3.1 Details of Outward Supplies and Inward Supplies Liable to Reverse Charge">
              <Row
                label="(a) Outward Taxable Supplies (other than zero rated, nil & exempted)"
                value={summary.outwardTaxableSupplies}
              />
              <Row
                label="    — IGST"
                value={summary.outwardTaxableIGST}
                indent
              />
              <Row
                label="    — CGST"
                value={summary.outwardTaxableCGST}
                indent
              />
              <Row
                label="    — SGST"
                value={summary.outwardTaxableSGST}
                indent
              />
            </Section>

            {/* Section 3.2 */}
            <Section title="3.2 Zero Rated & Exempt Supplies">
              <Row
                label="(b) Zero Rated Supplies (Exports)"
                value={summary.zeroRatedSupplies}
              />
              <Row label="(c) Exempt Supplies" value={summary.exemptSupplies} />
            </Section>

            {/* Section 4 – ITC */}
            <Section title="4. Eligible ITC (Input Tax Credit)">
              <Row
                label="(A) ITC Available – Import of Goods/Services"
                value={summary.inwardSuppliesITC}
              />
              <Row label="    — IGST" value={summary.inwardIGST} indent />
              <Row label="    — CGST" value={summary.inwardCGST} indent />
              <Row label="    — SGST" value={summary.inwardSGST} indent />
            </Section>

            {/* Section 5 – Net Tax */}
            <Section title="5. Values of Exempt, Nil and Non-GST Inward Supplies">
              <Row label="Net IGST Payable" value={summary.netIGST} />
              <Row label="Net CGST Payable" value={summary.netCGST} />
              <Row label="Net SGST Payable" value={summary.netSGST} />
              <Row
                label="Total Tax Payable"
                value={summary.totalTaxPayable}
                bold
              />
            </Section>

            {/* Tax Payable Summary Box */}
            <div className="border-2 border-teal/40 p-4 bg-teal/5 mt-4">
              <div className="text-[11px] text-teal uppercase tracking-wide mb-3 font-semibold">
                Net Tax Payable Summary
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "IGST",
                    value: summary.netIGST,
                    color: "text-amber-400",
                  },
                  {
                    label: "CGST",
                    value: summary.netCGST,
                    color: "text-blue-400",
                  },
                  {
                    label: "SGST",
                    value: summary.netSGST,
                    color: "text-green-400",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="text-center p-3 bg-card border border-border"
                  >
                    <div className={`text-[18px] font-mono font-bold ${color}`}>
                      {value.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex justify-between">
                <span className="text-[13px] font-semibold text-foreground">
                  Total Tax Payable
                </span>
                <span className="text-[18px] font-mono font-bold text-teal">
                  ₹{" "}
                  {summary.totalTaxPayable.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
