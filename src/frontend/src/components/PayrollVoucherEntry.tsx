import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import type {
  Company,
  Employee,
  PayrollEntry,
  SalaryStructure,
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

type EditableEntry = PayrollEntry & { _modified?: boolean };

export default function PayrollVoucherEntry({ company }: Props) {
  const { actor } = usePayrollActor();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [processed, setProcessed] = useState(false);
  const [processedAt, setProcessedAt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checkExisting = useCallback(async () => {
    if (!actor) return;
    try {
      const existing = await actor.getPayrollVoucher(
        BigInt(company.id),
        BigInt(month),
        BigInt(year),
      );
      if (existing) {
        setProcessed(true);
        setProcessedAt(
          new Date(Number(existing.processedAt) / 1_000_000).toLocaleString(),
        );
        setEntries(existing.entries);
      } else {
        setProcessed(false);
        setProcessedAt("");
        setEntries([]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [actor, company.id, month, year]);

  useEffect(() => {
    checkExisting();
  }, [checkExisting]);

  const handleGenerate = async () => {
    if (!actor) return;
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      const [emps, structs]: [Employee[], SalaryStructure[]] =
        await Promise.all([
          actor.getAllEmployees(BigInt(company.id)),
          actor.getAllSalaryStructures(BigInt(company.id)),
        ]);
      const structMap = new Map<string, SalaryStructure>();
      for (const s of structs) structMap.set(String(s.employeeId), s);

      const generated: EditableEntry[] = emps
        .filter((e) => e.isActive)
        .map((emp) => {
          const ss = structMap.get(String(emp.id));
          const basic = ss?.basic ?? 0;
          const hra = ss?.hra ?? 0;
          const da = ss?.da ?? 0;
          const conveyance = ss?.conveyance ?? 0;
          const specialAllowance = ss?.specialAllowance ?? 0;
          const otherAllowances = ss?.otherAllowances ?? 0;
          const grossEarnings =
            basic + hra + da + conveyance + specialAllowance + otherAllowances;
          const pf = ss?.pf ?? 0;
          const esi = ss?.esi ?? 0;
          const tds = ss?.tds ?? 0;
          const professionalTax = ss?.professionalTax ?? 0;
          const otherDeductions = ss?.otherDeductions ?? 0;
          const totalDeductions =
            pf + esi + tds + professionalTax + otherDeductions;
          const netPayable = grossEarnings - totalDeductions;
          return {
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            designation: emp.designation,
            basic,
            hra,
            da,
            conveyance,
            specialAllowance,
            otherAllowances,
            grossEarnings,
            pf,
            esi,
            tds,
            professionalTax,
            otherDeductions,
            totalDeductions,
            netPayable,
          };
        });
      setEntries(generated);
    } catch (e: any) {
      setError(e?.message || "Failed to generate payroll.");
    } finally {
      setGenerating(false);
    }
  };

  const updateEntry = (idx: number, field: keyof PayrollEntry, val: number) => {
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i !== idx) return e;
        const updated = { ...e, [field]: val };
        const gross =
          updated.basic +
          updated.hra +
          updated.da +
          updated.conveyance +
          updated.specialAllowance +
          updated.otherAllowances;
        const deds =
          updated.pf +
          updated.esi +
          updated.tds +
          updated.professionalTax +
          updated.otherDeductions;
        return {
          ...updated,
          grossEarnings: gross,
          totalDeductions: deds,
          netPayable: gross - deds,
        };
      }),
    );
  };

  const handleProcess = async () => {
    if (!actor || entries.length === 0) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await actor.createPayrollVoucher(
        BigInt(company.id),
        BigInt(month),
        BigInt(year),
        entries,
      );
      setSuccess("Payroll processed and saved successfully.");
      setProcessed(true);
      setProcessedAt(new Date().toLocaleString());
    } catch (e: any) {
      setError(e?.message || "Failed to process payroll.");
    } finally {
      setSaving(false);
    }
  };

  const numCell = (val: number, idx: number, field: keyof PayrollEntry) =>
    processed ? (
      <td className="px-2 py-1 text-right font-mono text-[10px]">
        {val.toFixed(0)}
      </td>
    ) : (
      <td className="px-1 py-0.5">
        <Input
          type="number"
          min={0}
          value={val}
          onChange={(e) =>
            updateEntry(idx, field, Number.parseFloat(e.target.value) || 0)
          }
          className="h-5 text-[10px] w-16 text-right bg-secondary/50 border-border p-1"
        />
      </td>
    );

  return (
    <div className="flex flex-col h-full" data-ocid="payroll_voucher.page">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-secondary/40 flex-shrink-0">
        <span className="text-[12px] font-semibold text-foreground uppercase tracking-widest">
          Process Payroll
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Month:</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number.parseInt(e.target.value))}
            className="h-7 text-[11px] bg-secondary border border-border px-2 text-foreground"
            data-ocid="payroll_voucher.month.select"
            disabled={processed}
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
            data-ocid="payroll_voucher.year.input"
            disabled={processed}
          />
        </div>
        {processed ? (
          <span className="text-[11px] text-green-400 border border-green-400/30 bg-green-400/10 px-2 py-0.5">
            ✓ Processed on {processedAt}
          </span>
        ) : (
          <Button
            size="sm"
            className="text-[11px] h-7 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30"
            onClick={handleGenerate}
            disabled={generating}
            data-ocid="payroll_voucher.primary_button"
          >
            {generating ? "Generating..." : "Generate Payroll"}
          </Button>
        )}
      </div>

      {/* Messages */}
      {(error || success) && (
        <div
          className={`px-4 py-2 text-[11px] border-b border-border ${error ? "text-red-400 bg-red-400/5" : "text-green-400 bg-green-400/5"}`}
          data-ocid={
            error
              ? "payroll_voucher.error_state"
              : "payroll_voucher.success_state"
          }
        >
          {error || success}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div
            className="flex items-center justify-center h-32 text-[12px] text-muted-foreground"
            data-ocid="payroll_voucher.empty_state"
          >
            {processed
              ? "No entries found."
              : "Select month/year and click Generate Payroll."}
          </div>
        ) : (
          <table
            className="w-full border-collapse text-[10px]"
            style={{ minWidth: "1100px" }}
          >
            <thead>
              <tr className="bg-teal/20 border-b border-teal/30 sticky top-0">
                {[
                  "Employee",
                  "Dept",
                  "Desig",
                  "Basic",
                  "HRA",
                  "DA",
                  "Conv",
                  "Spl",
                  "Other Earn",
                  "Gross",
                  "PF",
                  "ESI",
                  "TDS",
                  "PT",
                  "Other Ded",
                  "Tot Ded",
                  "Net Pay",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-2 text-left text-teal font-semibold uppercase tracking-wide border-r border-teal/20 last:border-r-0 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={String(entry.employeeId)}
                  className="border-b border-border/40 hover:bg-secondary/30"
                  data-ocid={`payroll_voucher.item.${idx + 1}`}
                >
                  <td className="px-2 py-1 font-semibold text-foreground whitespace-nowrap">
                    {entry.employeeName}
                  </td>
                  <td className="px-2 py-1 text-muted-foreground whitespace-nowrap">
                    {entry.department}
                  </td>
                  <td className="px-2 py-1 text-muted-foreground whitespace-nowrap">
                    {entry.designation}
                  </td>
                  {numCell(entry.basic, idx, "basic")}
                  {numCell(entry.hra, idx, "hra")}
                  {numCell(entry.da, idx, "da")}
                  {numCell(entry.conveyance, idx, "conveyance")}
                  {numCell(entry.specialAllowance, idx, "specialAllowance")}
                  {numCell(entry.otherAllowances, idx, "otherAllowances")}
                  <td className="px-2 py-1 text-right font-mono font-semibold text-teal">
                    {entry.grossEarnings.toFixed(0)}
                  </td>
                  {numCell(entry.pf, idx, "pf")}
                  {numCell(entry.esi, idx, "esi")}
                  {numCell(entry.tds, idx, "tds")}
                  {numCell(entry.professionalTax, idx, "professionalTax")}
                  {numCell(entry.otherDeductions, idx, "otherDeductions")}
                  <td className="px-2 py-1 text-right font-mono text-red-400 font-semibold">
                    {entry.totalDeductions.toFixed(0)}
                  </td>
                  <td className="px-2 py-1 text-right font-mono font-bold text-green-400">
                    {entry.netPayable.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Process button */}
      {!processed && entries.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-secondary/30 flex justify-end flex-shrink-0">
          <Button
            size="sm"
            className="text-[11px] h-7 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30"
            onClick={handleProcess}
            disabled={saving}
            data-ocid="payroll_voucher.submit_button"
          >
            {saving ? "Processing..." : "Process & Save Payroll"}
          </Button>
        </div>
      )}
    </div>
  );
}
