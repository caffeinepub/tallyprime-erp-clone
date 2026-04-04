import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { Company } from "../backend.d";
import { useGetAllLedgers, useGetDayBook } from "../hooks/useQueries";

interface Props {
  company: Company;
}

function dateToNs(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * 1000000n;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export default function DayBook({ company }: Props) {
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const dateNs = dateToNs(date);
  const { data, isLoading, refetch } = useGetDayBook(company.id, dateNs);
  const { data: ledgers } = useGetAllLedgers();

  const ledgerName = (id: bigint) => {
    const l = (ledgers || []).find((item) => item.id === id);
    return l ? l.name : id.toString();
  };

  const prevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split("T")[0]);
  };

  const nextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().split("T")[0]);
  };

  const totalDr = (data || []).reduce(
    (s, v) =>
      s +
      v.entries
        .filter((e) => e.entryType === "Dr")
        .reduce((es, e) => es + e.amount, 0),
    0,
  );
  const totalCr = (data || []).reduce(
    (s, v) =>
      s +
      v.entries
        .filter((e) => e.entryType === "Cr")
        .reduce((es, e) => es + e.amount, 0),
    0,
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            Day Book
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            {company.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="daybook.pagination_prev"
            onClick={prevDay}
            className="p-1 hover:text-teal text-muted-foreground transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <input
            data-ocid="daybook.input"
            type="date"
            className="tally-input w-36"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            type="button"
            data-ocid="daybook.pagination_next"
            onClick={nextDay}
            className="p-1 hover:text-teal text-muted-foreground transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            data-ocid="daybook.secondary_button"
            onClick={() => refetch()}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-teal transition-colors"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-card">
        <span className="text-[11px] text-muted-foreground">
          Company:{" "}
          <span className="text-foreground font-medium">
            {company.name.toUpperCase()}
          </span>
        </span>
        <span className="text-[11px] text-muted-foreground">
          Date: {formatDate(date)}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-10 gap-2"
            data-ocid="daybook.loading_state"
          >
            <Loader2 size={16} className="animate-spin text-teal" />
            <span className="text-muted-foreground text-[12px]">
              Loading day book...
            </span>
          </div>
        ) : (
          <table className="w-full tally-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars</th>
                <th>Vch Type</th>
                <th className="text-right">Vch No.</th>
                <th className="text-right">Debit (INR)</th>
                <th className="text-right">Credit (INR)</th>
              </tr>
            </thead>
            <tbody>
              {!data || data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="daybook.empty_state"
                  >
                    No vouchers found for {formatDate(date)}
                  </td>
                </tr>
              ) : (
                data.map((v, i) => {
                  const drAmt = v.entries
                    .filter((e) => e.entryType === "Dr")
                    .reduce((s, e) => s + e.amount, 0);
                  const crAmt = v.entries
                    .filter((e) => e.entryType === "Cr")
                    .reduce((s, e) => s + e.amount, 0);
                  const particulars = v.entries
                    .map((e) => ledgerName(e.ledgerId))
                    .join(" / ");
                  return (
                    <tr
                      key={v.voucherNumber.toString()}
                      data-ocid={`daybook.item.${i + 1}`}
                    >
                      <td className="text-muted-foreground whitespace-nowrap">
                        {formatDate(date)}
                      </td>
                      <td className="text-foreground max-w-[240px]">
                        <div className="truncate">{particulars}</div>
                        {v.narration && (
                          <div className="text-[10px] text-muted-foreground truncate">
                            {v.narration}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="text-[11px] px-1.5 py-0.5 bg-teal/20 text-teal">
                          {v.voucherType}
                        </span>
                      </td>
                      <td className="text-right font-mono text-muted-foreground">
                        {v.voucherNumber.toString()}
                      </td>
                      <td className="text-right font-mono text-numeric">
                        {drAmt > 0
                          ? drAmt.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })
                          : "-"}
                      </td>
                      <td className="text-right font-mono text-numeric">
                        {crAmt > 0
                          ? crAmt.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
              {data && data.length > 0 && (
                <tr className="bg-secondary/70">
                  <td
                    colSpan={4}
                    className="text-right font-bold text-[11px] uppercase tracking-wide text-muted-foreground"
                  >
                    Total
                  </td>
                  <td className="text-right font-mono font-bold text-foreground">
                    {totalDr.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right font-mono font-bold text-foreground">
                    {totalCr.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
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
