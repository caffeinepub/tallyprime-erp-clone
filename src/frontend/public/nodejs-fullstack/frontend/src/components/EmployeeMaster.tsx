import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useState } from "react";
import type { Company, Employee } from "../backend.d";
import { usePayrollActor } from "../hooks/usePayrollActor";

interface Props {
  company: Company;
}

const EMPTY_FORM = {
  name: "",
  employeeCode: "",
  department: "",
  designation: "",
  dateOfJoining: "",
  pan: "",
  bankAccount: "",
  bankName: "",
  pfApplicable: false,
  esiApplicable: false,
  isActive: true,
};

export default function EmployeeMaster({ company }: Props) {
  const { actor } = usePayrollActor();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadEmployees = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const data = await actor.getAllEmployees(BigInt(company.id));
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [actor, company.id]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (emp: Employee) => {
    setForm({
      name: emp.name,
      employeeCode: emp.employeeCode,
      department: emp.department,
      designation: emp.designation,
      dateOfJoining: emp.dateOfJoining,
      pan: emp.pan,
      bankAccount: emp.bankAccount,
      bankName: emp.bankName,
      pfApplicable: emp.pfApplicable,
      esiApplicable: emp.esiApplicable,
      isActive: emp.isActive,
    });
    setEditingId(emp.id);
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!actor) return;
    if (!form.name.trim() || !form.employeeCode.trim()) {
      setError("Name and Employee Code are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId !== null) {
        await actor.updateEmployee(
          editingId,
          form.name,
          form.employeeCode,
          form.department,
          form.designation,
          form.dateOfJoining,
          form.pan,
          form.bankAccount,
          form.bankName,
          form.pfApplicable,
          form.esiApplicable,
          form.isActive,
        );
      } else {
        await actor.createEmployee(
          BigInt(company.id),
          form.name,
          form.employeeCode,
          form.department,
          form.designation,
          form.dateOfJoining,
          form.pan,
          form.bankAccount,
          form.bankName,
          form.pfApplicable,
          form.esiApplicable,
        );
      }
      setShowForm(false);
      await loadEmployees();
    } catch (e: any) {
      setError(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formatDate = (d: string) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return `${dt.getDate()}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
  };

  return (
    <div className="flex flex-col h-full" data-ocid="employee_master.page">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/40 flex-shrink-0">
        <span className="text-[12px] font-semibold text-foreground uppercase tracking-widest">
          Employee Master
        </span>
        <Button
          size="sm"
          className="text-[11px] bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 h-7 px-3"
          onClick={openNew}
          data-ocid="employee_master.open_modal_button"
        >
          + New Employee
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div
            className="flex items-center justify-center h-32 text-[12px] text-muted-foreground"
            data-ocid="employee_master.loading_state"
          >
            Loading employees...
          </div>
        ) : (
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-teal/20 border-b border-teal/30">
                {[
                  "Code",
                  "Name",
                  "Department",
                  "Designation",
                  "D.O.J",
                  "PF",
                  "ESI",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 text-teal font-semibold uppercase tracking-wide border-r border-teal/20 last:border-r-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="employee_master.empty_state"
                  >
                    No employees found. Create a new employee to get started.
                  </td>
                </tr>
              ) : (
                employees.map((emp, idx) => (
                  <tr
                    key={String(emp.id)}
                    className="border-b border-border/40 hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => openEdit(emp)}
                    onKeyDown={(e) => e.key === "Enter" && openEdit(emp)}
                    data-ocid={`employee_master.item.${idx + 1}`}
                  >
                    <td className="px-3 py-1.5 font-mono text-teal/80">
                      {emp.employeeCode}
                    </td>
                    <td className="px-3 py-1.5 font-semibold text-foreground">
                      {emp.name}
                    </td>
                    <td className="px-3 py-1.5 text-muted-foreground">
                      {emp.department}
                    </td>
                    <td className="px-3 py-1.5 text-muted-foreground">
                      {emp.designation}
                    </td>
                    <td className="px-3 py-1.5 text-muted-foreground">
                      {formatDate(emp.dateOfJoining)}
                    </td>
                    <td className="px-3 py-1.5">
                      <span
                        className={
                          emp.pfApplicable
                            ? "text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {emp.pfApplicable ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span
                        className={
                          emp.esiApplicable
                            ? "text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {emp.esiApplicable ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span
                        className={
                          emp.isActive ? "text-green-400" : "text-red-400"
                        }
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Panel */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          data-ocid="employee_master.modal"
        >
          <div className="bg-card border border-border w-[600px] max-h-[90vh] overflow-auto shadow-2xl">
            <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-foreground uppercase tracking-widest">
                {editingId !== null ? "Edit Employee" : "New Employee"}
              </span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground text-[16px] leading-none"
                data-ocid="employee_master.close_button"
              >
                ×
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {(
                [
                  ["Employee Name", "name", "text"],
                  ["Employee Code", "employeeCode", "text"],
                  ["Department", "department", "text"],
                  ["Designation", "designation", "text"],
                  ["Date of Joining", "dateOfJoining", "date"],
                  ["PAN", "pan", "text"],
                  ["Bank Account", "bankAccount", "text"],
                  ["Bank Name", "bankName", "text"],
                ] as [string, keyof typeof form, string][]
              ).map(([label, field, type]) => (
                <div key={field} className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {label}
                  </Label>
                  <Input
                    type={type}
                    value={form[field] as string}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                    className="h-7 text-[11px] bg-secondary/50 border-border"
                    data-ocid={`employee_master.${field}.input`}
                  />
                </div>
              ))}
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pf"
                    checked={form.pfApplicable}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, pfApplicable: !!v }))
                    }
                    data-ocid="employee_master.pf.checkbox"
                  />
                  <Label
                    htmlFor="pf"
                    className="text-[11px] text-foreground cursor-pointer"
                  >
                    PF Applicable
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="esi"
                    checked={form.esiApplicable}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, esiApplicable: !!v }))
                    }
                    data-ocid="employee_master.esi.checkbox"
                  />
                  <Label
                    htmlFor="esi"
                    className="text-[11px] text-foreground cursor-pointer"
                  >
                    ESI Applicable
                  </Label>
                </div>
                {editingId !== null && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="active"
                      checked={form.isActive}
                      onCheckedChange={(v) =>
                        setForm((f) => ({ ...f, isActive: !!v }))
                      }
                      data-ocid="employee_master.active.checkbox"
                    />
                    <Label
                      htmlFor="active"
                      className="text-[11px] text-foreground cursor-pointer"
                    >
                      Active
                    </Label>
                  </div>
                )}
              </div>
            </div>
            {error && (
              <div
                className="px-4 pb-2 text-[11px] text-red-400"
                data-ocid="employee_master.error_state"
              >
                {error}
              </div>
            )}
            <div className="px-4 py-3 border-t border-border flex gap-2 justify-end bg-secondary/30">
              <Button
                variant="secondary"
                size="sm"
                className="text-[11px] h-7"
                onClick={() => setShowForm(false)}
                data-ocid="employee_master.cancel_button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-[11px] h-7 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30"
                onClick={handleSave}
                disabled={saving}
                data-ocid="employee_master.save_button"
              >
                {saving ? "Saving..." : "Save Employee"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
