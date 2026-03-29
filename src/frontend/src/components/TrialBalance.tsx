import { Loader2, RefreshCw } from "lucide-react";
import type { Company } from "../backend.d";
import { useGetTrialBalance } from "../hooks/useQueries";

interface Props {
  company: Company;
}

export default function TrialBalance({ company }: Props) {
  const { data, isLoading, refetch } = useGetTrialBalance(company.id);

  const totalDr = (data || []).reduce((s, r) => s + r.debitTotal, 0);
  const totalCr = (data || []).reduce((s, r) => s + r.creditTotal, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            Trial Balance
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            {company.name}
          </span>
        </div>
        <button
          type="button"
          data-ocid="trial.secondary_button"
          onClick={() => refetch()}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-teal transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-b border-border text-[11px] text-muted-foreground">
        <span>
          Company:{" "}
          <span className="text-foreground font-medium">
            {company.name.toUpperCase()}
          </span>
        </span>
        <span>
          FY: {company.financialYearStart} to {company.financialYearEnd}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-10 gap-2"
            data-ocid="trial.loading_state"
          >
            <Loader2 size={16} className="animate-spin text-teal" />
            <span className="text-muted-foreground text-[12px]">
              Loading trial balance...
            </span>
          </div>
        ) : (
          <table className="w-full tally-table">
            <thead>
              <tr>
                <th>Ledger Name</th>
                <th className="text-right">Debit (INR)</th>
                <th className="text-right">Credit (INR)</th>
              </tr>
            </thead>
            <tbody>
              {!data || data.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="trial.empty_state"
                  >
                    No entries found. Create vouchers to see trial balance.
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={row.ledgerName} data-ocid={`trial.item.${i + 1}`}>
                    <td className="text-foreground">{row.ledgerName}</td>
                    <td className="text-right font-mono text-numeric">
                      {row.debitTotal > 0
                        ? row.debitTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
                        : "-"}
                    </td>
                    <td className="text-right font-mono text-numeric">
                      {row.creditTotal > 0
                        ? row.creditTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
              {data && data.length > 0 && (
                <tr className="bg-secondary/70 border-t border-border">
                  <td className="font-bold text-foreground uppercase text-[11px] tracking-wide">
                    GRAND TOTAL
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

      {data && data.length > 0 && (
        <div className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground flex justify-end">
          {Math.abs(totalDr - totalCr) < 0.01 ? (
            <span className="text-green-400">✓ Balanced — Debit = Credit</span>
          ) : (
            <span className="text-amber-400">
              ⚠ Difference:{" "}
              {Math.abs(totalDr - totalCr).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
