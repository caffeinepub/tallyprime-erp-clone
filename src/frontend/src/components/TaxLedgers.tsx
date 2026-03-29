import { Loader2 } from "lucide-react";
import type { Company, TaxLedgerBalance } from "../backend.d";
import { useGetTaxLedgerBalances } from "../hooks/useQueries";

interface Props {
  company: Company;
}

const TAX_TYPE_STYLES: Record<string, string> = {
  CGST: "bg-blue-900/30 text-blue-400 border-blue-800/40",
  SGST: "bg-green-900/30 text-green-400 border-green-800/40",
  IGST: "bg-amber-900/30 text-amber-400 border-amber-800/40",
  CESS: "bg-purple-900/30 text-purple-400 border-purple-800/40",
};

export default function TaxLedgers({ company }: Props) {
  const { data: balances, isLoading } = useGetTaxLedgerBalances(company.id);
  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const totalLiability = (balances || []).reduce(
    (sum, b) => sum + b.closingBalance,
    0,
  );

  const grouped = (balances || []).reduce<Record<string, TaxLedgerBalance[]>>(
    (acc, b) => {
      const key = b.taxType || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(b);
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            Tax Ledger Balances
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            {company.name}
          </span>
        </div>
        {!isLoading && (
          <div className="text-[11px]">
            <span className="text-muted-foreground">Total Tax Liability: </span>
            <span className="font-mono font-bold text-teal">
              ₹ {fmt(totalLiability)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-10 gap-2"
            data-ocid="tax_ledgers.loading_state"
          >
            <Loader2 size={16} className="animate-spin text-teal" />
            <span className="text-muted-foreground text-[12px]">
              Loading tax ledgers...
            </span>
          </div>
        ) : (balances || []).length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="tax_ledgers.empty_state"
          >
            <p className="text-muted-foreground text-[12px]">
              No tax ledger transactions found. Record GST vouchers to see
              balances here.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full tally-table">
              <thead>
                <tr>
                  <th>Ledger Name</th>
                  <th>Tax Type</th>
                  <th>Ledger Type</th>
                  <th className="text-right">Opening Balance</th>
                  <th className="text-right">Total Debits</th>
                  <th className="text-right">Total Credits</th>
                  <th className="text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([taxType, rows]) => (
                  <>
                    <tr key={`header-${taxType}`} className="bg-secondary/50">
                      <td colSpan={7} className="py-1 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-sm ${TAX_TYPE_STYLES[taxType] || "bg-secondary text-muted-foreground"}`}
                        >
                          {taxType}
                        </span>
                      </td>
                    </tr>
                    {rows.map((b, i) => (
                      <tr
                        key={`${b.ledgerName}-${i}`}
                        data-ocid={`tax_ledgers.item.${i + 1}`}
                      >
                        <td className="font-medium text-foreground">
                          {b.ledgerName}
                        </td>
                        <td>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 border rounded-sm ${TAX_TYPE_STYLES[b.taxType] || "bg-secondary text-muted-foreground"}`}
                          >
                            {b.taxType}
                          </span>
                        </td>
                        <td className="text-muted-foreground text-[11px]">
                          {b.ledgerType}
                        </td>
                        <td className="text-right font-mono text-numeric">
                          {fmt(b.openingBalance)}
                        </td>
                        <td className="text-right font-mono text-red-400">
                          {fmt(b.totalDebits)}
                        </td>
                        <td className="text-right font-mono text-green-400">
                          {fmt(b.totalCredits)}
                        </td>
                        <td className="text-right font-mono font-semibold text-teal">
                          {fmt(b.closingBalance)}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="border-t border-border bg-secondary/30 p-4">
              <div className="flex justify-end">
                <div className="min-w-[360px]">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">
                    Tax Liability Summary
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(grouped).map(([taxType, rows]) => {
                      const subtotal = rows.reduce(
                        (s, r) => s + r.closingBalance,
                        0,
                      );
                      return (
                        <div
                          key={taxType}
                          className={`p-2 border rounded-sm ${TAX_TYPE_STYLES[taxType] || "border-border"}`}
                        >
                          <div className="text-[10px] font-bold uppercase">
                            {taxType}
                          </div>
                          <div className="text-[14px] font-mono font-bold mt-0.5">
                            {fmt(subtotal)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                    <span className="text-[13px] font-semibold text-foreground">
                      Total Tax Liability
                    </span>
                    <span className="text-[16px] font-mono font-bold text-teal">
                      ₹ {fmt(totalLiability)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
