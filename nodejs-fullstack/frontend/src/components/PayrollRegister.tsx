import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import type { Company, PayrollEntry, PayrollVoucher } from "../backend.d";
import { usePayrollActor } from "../hooks/usePayrollActor";

interface Props {
  company: Company;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function PayrollRegister({ company }: Props) {
  const { actor } = usePayrollActor();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [voucher, setVoucher] = useState<PayrollVoucher | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    setError("");
    try {
      const v = await actor.getPayrollVoucher(
        BigInt(company.id),
        BigInt(month),
        BigInt(year),
      );
      setVoucher(v);
      if (!v) setError(`No payroll found for ${MONTHS[month - 1]} ${year}.`);
    } catch (e: any) {
      setError(e?.message || "Failed to load payroll.");
    } finally {
      setLoading(false);
    }
  }, [actor, company.id, month, year]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const entries: PayrollEntry[] = voucher?.entries ?? [];
  const totals = entries.reduce(
    (acc, e) => ({
      gross: acc.gross + e.grossEarnings,
      deds: acc.deds + e.totalDeductions,
      net: acc.net + e.netPayable,
    }),
    { gross: 0, deds: 0, net: 0 },
  );

  return (
    <div className="flex flex-col h-full" data-ocid="payroll_register.page">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-secondary/40 flex-shrink-0">
        <span className="text-[12px] font-semibold text-foreground uppercase tracking-widest">
          Payroll Register
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Month:</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number.parseInt(e.target.value))}
            className="h-7 text-[11px] bg-secondary border border-border px-2 text-foreground"
            data-ocid="payroll_register.month.select"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-muted-foreground">Year:</span>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number.parseInt(e.target.value) || year)}
            className="h-7 text-[11px] w-20 bg-secondary/50 border-border"
            data-ocid="payroll_register.year.input"
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="text-[11px] h-7"
          onClick={loadReport}
          disabled={loading}
          data-ocid="payroll_register.primary_button"
        >
          {loading ? "Loading..." : "Load Report"}
        </Button>
        {voucher && (
          <Button
            size="sm"
            className="text-[11px] h-7 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30"
            onClick={() => window.print()}
            data-ocid="payroll_register.secondary_button"
          >
            Print
          </Button>
        )}
      </div>

      {error && (
        <div
          className="px-4 py-2 text-[11px] text-muted-foreground border-b border-border"
          data-ocid="payroll_register.error_state"
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div
            className="flex items-center justify-center h-32 text-[12px] text-muted-foreground"
            data-ocid="payroll_register.loading_state"
          >
            Loading...
          </div>
        ) : voucher ? (
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-teal/20 border-b border-teal/30 sticky top-0">
                <th className="text-left px-3 py-2 text-teal font-semibold uppercase tracking-wide border-r border-teal/20">
                  #
                </th>
                <th className="text-left px-3 py-2 text-teal font-semibold uppercase tracking-wide border-r border-teal/20">
                  Employee
                </th>
                <th className="text-left px-3 py-2 text-teal font-semibold uppercase tracking-wide border-r border-teal/20">
                  Department
                </th>
                <th className="text-left px-3 py-2 text-teal font-semibold uppercase tracking-wide border-r border-teal/20">
                  Designation
                </th>
                <th className="text-right px-3 py-2 text-teal font-semibold uppercase tracking-wide border-r border-teal/20">
                  Gross Earnings
                </th>
                <th className="text-right px-3 py-2 text-teal font-semibold uppercase tracking-wide border-r border-teal/20">
                  Total Deductions
                </th>
                <th className="text-right px-3 py-2 text-teal font-semibold uppercase tracking-wide">
                  Net Payable
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={String(entry.employeeId)}
                  className="border-b border-border/40 hover:bg-secondary/30"
                  data-ocid={`payroll_register.item.${idx + 1}`}
                >
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-1.5 font-semibold text-foreground">
                    {entry.employeeName}
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {entry.department}
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {entry.designation}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-teal">
                    {entry.grossEarnings.toFixed(2)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-red-400">
                    {entry.totalDeductions.toFixed(2)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono font-bold text-green-400">
                    {entry.netPayable.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-teal/30 bg-teal/10">
                <td
                  colSpan={4}
                  className="px-3 py-2 text-[11px] font-bold text-foreground uppercase tracking-wide"
                >
                  Total
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-teal">
                  {totals.gross.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-red-400">
                  {totals.deds.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-green-400">
                  {totals.net.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        ) : null}
      </div>
    </div>
  );
}
