import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useState } from "react";
import type { Company, Employee, SalaryStructure } from "../backend.d";
import { usePayrollActor } from "../hooks/usePayrollActor";

interface Props {
  company: Company;
}

const EMPTY_SS = {
  basic: 0,
  hra: 0,
  da: 0,
  conveyance: 0,
  specialAllowance: 0,
  otherAllowances: 0,
  pf: 0,
  esi: 0,
  tds: 0,
  professionalTax: 0,
  otherDeductions: 0,
};

export default function SalaryStructureSetup({ company }: Props) {
  const { actor } = usePayrollActor();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [form, setForm] = useState({ ...EMPTY_SS });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllEmployees(BigInt(company.id))
      .then(setEmployees)
      .catch(console.error);
  }, [actor, company.id]);

  const loadStructure = useCallback(
    async (emp: Employee) => {
      if (!actor) return;
      try {
        const ss: SalaryStructure | null = await actor.getSalaryStructure(
          BigInt(company.id),
          emp.id,
        );
        if (ss) {
          setForm({
            basic: ss.basic,
            hra: ss.hra,
            da: ss.da,
            conveyance: ss.conveyance,
            specialAllowance: ss.specialAllowance,
            otherAllowances: ss.otherAllowances,
            pf: ss.pf,
            esi: ss.esi,
            tds: ss.tds,
            professionalTax: ss.professionalTax,
            otherDeductions: ss.otherDeductions,
          });
        } else {
          setForm({ ...EMPTY_SS });
        }
      } catch (e) {
        console.error(e);
        setForm({ ...EMPTY_SS });
      }
    },
    [actor, company.id],
  );

  const selectEmployee = (emp: Employee) => {
    setSelectedEmp(emp);
    setSavedMsg("");
    setError("");
    loadStructure(emp);
  };

  const grossEarnings =
    form.basic +
    form.hra +
    form.da +
    form.conveyance +
    form.specialAllowance +
    form.otherAllowances;
  const totalDeductions =
    form.pf + form.esi + form.tds + form.professionalTax + form.otherDeductions;
  const netPayable = grossEarnings - totalDeductions;

  const handleSave = async () => {
    if (!actor || !selectedEmp) return;
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      await actor.saveSalaryStructure(
        BigInt(company.id),
        selectedEmp.id,
        form.basic,
        form.hra,
        form.da,
        form.conveyance,
        form.specialAllowance,
        form.otherAllowances,
        form.pf,
        form.esi,
        form.tds,
        form.professionalTax,
        form.otherDeductions,
      );
      setSavedMsg("Salary structure saved successfully.");
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const numField = (
    label: string,
    field: keyof typeof EMPTY_SS,
    ocid: string,
  ) => (
    <div className="flex items-center border-b border-border/30 px-3 py-1.5">
      <span className="w-48 text-[11px] text-muted-foreground">{label}</span>
      <Input
        type="number"
        min={0}
        step={0.01}
        value={form[field]}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [field]: Number.parseFloat(e.target.value) || 0,
          }))
        }
        className="h-6 text-[11px] w-32 bg-secondary/50 border-border text-right"
        data-ocid={ocid}
      />
    </div>
  );

  return (
    <div className="flex h-full" data-ocid="salary_structure.page">
      {/* Left: Employee List */}
      <div className="w-64 border-r border-border flex flex-col flex-shrink-0">
        <div className="px-3 py-2 border-b border-teal/30 bg-teal/10">
          <span className="text-[10px] font-semibold text-teal uppercase tracking-widest">
            Employees
          </span>
        </div>
        <div className="flex-1 overflow-auto">
          {employees.length === 0 ? (
            <div
              className="px-3 py-4 text-[11px] text-muted-foreground"
              data-ocid="salary_structure.empty_state"
            >
              No employees found.
            </div>
          ) : (
            employees.map((emp, idx) => (
              <button
                key={String(emp.id)}
                type="button"
                className={`w-full text-left px-3 py-2 border-b border-border/30 transition-colors text-[11px] ${
                  selectedEmp?.id === emp.id
                    ? "bg-teal/20 text-teal"
                    : "hover:bg-secondary/50 text-foreground"
                }`}
                onClick={() => selectEmployee(emp)}
                data-ocid={`salary_structure.item.${idx + 1}`}
              >
                <div className="font-semibold">{emp.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {emp.employeeCode}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 overflow-auto">
        {!selectedEmp ? (
          <div className="flex items-center justify-center h-full text-[12px] text-muted-foreground">
            Select an employee from the left to configure salary structure.
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="px-4 py-2 border-b border-border bg-secondary/40 flex items-center justify-between flex-shrink-0">
              <span className="text-[12px] font-semibold text-foreground">
                Salary Structure: {selectedEmp.name}
                <span className="text-[10px] text-muted-foreground font-mono ml-2">
                  ({selectedEmp.employeeCode})
                </span>
              </span>
            </div>

            <div className="flex flex-1 overflow-auto">
              {/* Earnings */}
              <div className="flex-1 border-r border-border">
                <div className="px-3 py-2 bg-teal/10 border-b border-teal/30">
                  <span className="text-[10px] font-semibold text-teal uppercase tracking-widest">
                    Earnings
                  </span>
                </div>
                {numField("Basic", "basic", "salary_structure.basic.input")}
                {numField("HRA", "hra", "salary_structure.hra.input")}
                {numField("DA", "da", "salary_structure.da.input")}
                {numField(
                  "Conveyance",
                  "conveyance",
                  "salary_structure.conveyance.input",
                )}
                {numField(
                  "Special Allowance",
                  "specialAllowance",
                  "salary_structure.special.input",
                )}
                {numField(
                  "Other Allowances",
                  "otherAllowances",
                  "salary_structure.other_earn.input",
                )}
                <div className="flex items-center px-3 py-2 bg-secondary/50 border-b border-border">
                  <span className="w-48 text-[11px] font-semibold text-foreground">
                    Gross Earnings
                  </span>
                  <span className="text-[12px] font-bold text-teal w-32 text-right font-mono">
                    {grossEarnings.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Deductions */}
              <div className="flex-1">
                <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/30">
                  <span className="text-[10px] font-semibold text-red-400 uppercase tracking-widest">
                    Deductions
                  </span>
                </div>
                {numField("PF", "pf", "salary_structure.pf.input")}
                {numField("ESI", "esi", "salary_structure.esi.input")}
                {numField("TDS", "tds", "salary_structure.tds.input")}
                {numField(
                  "Professional Tax",
                  "professionalTax",
                  "salary_structure.pt.input",
                )}
                {numField(
                  "Other Deductions",
                  "otherDeductions",
                  "salary_structure.other_ded.input",
                )}
                <div className="flex items-center px-3 py-2 bg-secondary/50 border-b border-border">
                  <span className="w-48 text-[11px] font-semibold text-foreground">
                    Total Deductions
                  </span>
                  <span className="text-[12px] font-bold text-red-400 w-32 text-right font-mono">
                    {totalDeductions.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center px-3 py-3 bg-teal/10 border-b border-teal/30">
                  <span className="w-48 text-[12px] font-bold text-foreground">
                    Net Payable
                  </span>
                  <span className="text-[13px] font-bold text-teal w-32 text-right font-mono">
                    {netPayable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border flex items-center gap-3 bg-secondary/30 flex-shrink-0">
              {savedMsg && (
                <span
                  className="text-[11px] text-green-400"
                  data-ocid="salary_structure.success_state"
                >
                  {savedMsg}
                </span>
              )}
              {error && (
                <span
                  className="text-[11px] text-red-400"
                  data-ocid="salary_structure.error_state"
                >
                  {error}
                </span>
              )}
              <div className="flex-1" />
              <Button
                size="sm"
                className="text-[11px] h-7 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30"
                onClick={handleSave}
                disabled={saving}
                data-ocid="salary_structure.save_button"
              >
                {saving ? "Saving..." : "Save Structure"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
