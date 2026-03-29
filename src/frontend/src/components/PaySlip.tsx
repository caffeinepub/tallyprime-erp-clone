import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import type {
  Company,
  Employee,
  PayrollEntry,
  PayrollVoucher,
} from "../backend.d";
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

export default function PaySlip({ company }: Props) {
  const { actor } = usePayrollActor();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [voucher, setVoucher] = useState<PayrollVoucher | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllEmployees(BigInt(company.id))
      .then(setEmployees)
      .catch(console.error);
  }, [actor, company.id]);

  const loadPaySlip = useCallback(async () => {
    if (!actor || !selectedEmpId) return;
    setLoading(true);
    setError("");
    try {
      const v = await actor.getPayrollVoucher(
        BigInt(company.id),
        BigInt(month),
        BigInt(year),
      );
      setVoucher(v);
      if (!v)
        setError(`No payroll processed for ${MONTHS[month - 1]} ${year}.`);
    } catch (e: any) {
      setError(e?.message || "Failed to load pay slip.");
    } finally {
      setLoading(false);
    }
  }, [actor, company.id, month, year, selectedEmpId]);

  const entry: PayrollEntry | null = voucher
    ? (voucher.entries.find((e) => String(e.employeeId) === selectedEmpId) ??
      null)
    : null;

  const selectedEmp = employees.find((e) => String(e.id) === selectedEmpId);

  return (
    <div className="flex flex-col h-full" data-ocid="pay_slip.page">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-secondary/40 flex-shrink-0">
        <span className="text-[12px] font-semibold text-foreground uppercase tracking-widest">
          Pay Slip
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Month:</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number.parseInt(e.target.value))}
            className="h-7 text-[11px] bg-secondary border border-border px-2 text-foreground"
            data-ocid="pay_slip.month.select"
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
            data-ocid="pay_slip.year.input"
          />
          <span className="text-[11px] text-muted-foreground">Employee:</span>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="h-7 text-[11px] bg-secondary border border-border px-2 text-foreground min-w-[160px]"
            data-ocid="pay_slip.employee.select"
          >
            <option value="">-- Select Employee --</option>
            {employees.map((emp) => (
              <option key={String(emp.id)} value={String(emp.id)}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="text-[11px] h-7"
          onClick={loadPaySlip}
          disabled={loading || !selectedEmpId}
          data-ocid="pay_slip.primary_button"
        >
          {loading ? "Loading..." : "Load Pay Slip"}
        </Button>
        {entry && (
          <Button
            size="sm"
            className="text-[11px] h-7 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30"
            onClick={() => window.print()}
            data-ocid="pay_slip.secondary_button"
          >
            Print
          </Button>
        )}
      </div>

      {error && (
        <div
          className="px-4 py-2 text-[11px] text-muted-foreground border-b border-border"
          data-ocid="pay_slip.error_state"
        >
          {error}
        </div>
      )}

      {/* Pay Slip Layout */}
      <div className="flex-1 overflow-auto p-6">
        {!entry ? (
          <div
            className="flex items-center justify-center h-full text-[12px] text-muted-foreground"
            data-ocid="pay_slip.empty_state"
          >
            Select month, year, and employee, then click Load Pay Slip.
          </div>
        ) : (
          <div
            className="max-w-[700px] mx-auto border border-border bg-card shadow-lg"
            id="pay-slip-print"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b-2 border-teal/50 text-center bg-teal/10">
              <div className="text-[16px] font-bold text-foreground tracking-wide">
                {company.name}
              </div>
              {company.address && (
                <div className="text-[11px] text-muted-foreground mt-1">
                  {company.address}
                </div>
              )}
              <div className="text-[13px] font-semibold text-teal mt-2 uppercase tracking-widest">
                Pay Slip — {MONTHS[month - 1]} {year}
              </div>
            </div>

            {/* Employee Info */}
            <div className="px-6 py-3 grid grid-cols-2 gap-x-8 gap-y-1.5 border-b border-border bg-secondary/30">
              {[
                ["Employee Name", entry.employeeName],
                ["Employee Code", selectedEmp?.employeeCode ?? "—"],
                ["Department", entry.department],
                ["Designation", entry.designation],
                ["Bank Account", selectedEmp?.bankAccount ?? "—"],
                ["Bank Name", selectedEmp?.bankName ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 text-[11px]">
                  <span className="text-muted-foreground w-32 flex-shrink-0">
                    {label}:
                  </span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>

            {/* Earnings / Deductions table */}
            <div className="flex border-b border-border">
              {/* Earnings */}
              <div className="flex-1 border-r border-border">
                <div className="px-4 py-2 bg-teal/10 border-b border-teal/30">
                  <span className="text-[10px] font-bold text-teal uppercase tracking-widest">
                    Earnings
                  </span>
                </div>
                {[
                  ["Basic", entry.basic],
                  ["HRA", entry.hra],
                  ["DA", entry.da],
                  ["Conveyance", entry.conveyance],
                  ["Special Allowance", entry.specialAllowance],
                  ["Other Allowances", entry.otherAllowances],
                ].map(([label, val]) => (
                  <div
                    key={label as string}
                    className="flex justify-between px-4 py-1.5 border-b border-border/30 text-[11px]"
                  >
                    <span className="text-muted-foreground">
                      {label as string}
                    </span>
                    <span className="font-mono text-foreground">
                      {(val as number).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              {/* Deductions */}
              <div className="flex-1">
                <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    Deductions
                  </span>
                </div>
                {[
                  ["PF", entry.pf],
                  ["ESI", entry.esi],
                  ["TDS", entry.tds],
                  ["Professional Tax", entry.professionalTax],
                  ["Other Deductions", entry.otherDeductions],
                ].map(([label, val]) => (
                  <div
                    key={label as string}
                    className="flex justify-between px-4 py-1.5 border-b border-border/30 text-[11px]"
                  >
                    <span className="text-muted-foreground">
                      {label as string}
                    </span>
                    <span className="font-mono text-foreground">
                      {(val as number).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary row */}
            <div className="flex border-b border-border bg-secondary/40">
              <div className="flex-1 flex justify-between items-center px-4 py-3 border-r border-border">
                <span className="text-[11px] font-semibold text-foreground">
                  Gross Earnings
                </span>
                <span className="font-mono font-bold text-teal text-[13px]">
                  {entry.grossEarnings.toFixed(2)}
                </span>
              </div>
              <div className="flex-1 flex justify-between items-center px-4 py-3">
                <span className="text-[11px] font-semibold text-foreground">
                  Total Deductions
                </span>
                <span className="font-mono font-bold text-red-400 text-[13px]">
                  {entry.totalDeductions.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center px-6 py-4 bg-teal/10">
              <span className="text-[13px] font-bold text-foreground">
                Net Payable
              </span>
              <span className="font-mono font-bold text-teal text-[16px]">
                {entry.netPayable.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
