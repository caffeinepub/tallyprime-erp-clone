import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer } from "lucide-react";
import { useState } from "react";

type Employee = {
  id: string;
  code: string;
  name: string;
  department: string;
  designation: string;
  salaryType: string;
  basicSalary: number;
  pan: string;
  bankAccount: string;
  ifsc: string;
};

const MONTHS = [
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

export default function SalarySlip() {
  const employees: Employee[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("hk_employees") || "[]");
    } catch {
      return [];
    }
  })();

  const companies = (() => {
    try {
      return JSON.parse(localStorage.getItem("hk_companies") || "[]");
    } catch {
      return [];
    }
  })();
  const company = companies[0] || { name: "Your Company" };

  const now = new Date();
  const [empId, setEmpId] = useState("");
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const emp = employees.find((e) => e.id === empId);
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const calc = (basic: number) => {
    const hra = basic * 0.4;
    const conv = basic * 0.1;
    const gross = basic + hra + conv;
    const pf = basic * 0.12;
    const esi = gross * 0.0075;
    const tds = gross * 0.05;
    const deductions = pf + esi + tds;
    const net = gross - deductions;
    return { basic, hra, conv, gross, pf, esi, tds, deductions, net };
  };

  const s = emp ? calc(emp.basicSalary) : null;

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="p-4 space-y-4" data-ocid="salary_slip.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          Salary Slip Generator
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-lg">
        <div className="space-y-1">
          <Label className="text-[10px]">Employee</Label>
          <Select value={empId} onValueChange={setEmpId}>
            <SelectTrigger
              className="h-7 text-[11px]"
              data-ocid="salary_slip.employee.select"
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Month</Label>
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger
              className="h-7 text-[11px]"
              data-ocid="salary_slip.month.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Year</Label>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger
              className="h-7 text-[11px]"
              data-ocid="salary_slip.year.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!emp && (
        <Card className="border-border max-w-2xl">
          <CardContent
            className="py-8 text-center text-[10px] text-muted-foreground"
            data-ocid="salary_slip.empty_state"
          >
            Select an employee to generate salary slip.
          </CardContent>
        </Card>
      )}

      {emp && s && (
        <div id="salary-slip-print">
          <Card className="border-border max-w-2xl print:shadow-none print:border-none">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-teal text-primary-foreground px-6 py-4 print:bg-gray-800">
                <div className="text-[14px] font-bold">{company.name}</div>
                <div className="text-[10px] opacity-80">
                  Salary Slip — {MONTHS[month]} {year}
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-2 gap-x-8 gap-y-1 border-b border-border">
                {[
                  ["Employee Code", emp.code],
                  ["Employee Name", emp.name],
                  ["Department", emp.department],
                  ["Designation", emp.designation],
                  ["PAN", emp.pan || "—"],
                  ["Bank A/c", emp.bankAccount || "—"],
                  ["IFSC", emp.ifsc || "—"],
                  ["Salary Type", emp.salaryType],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between text-[10px] py-0.5"
                  >
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-foreground">{v}</span>
                  </div>
                ))}
              </div>

              {/* Earnings & Deductions */}
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="px-6 py-4">
                  <div className="text-[11px] font-bold text-foreground mb-2">
                    Earnings
                  </div>
                  {[
                    ["Basic Salary", s.basic],
                    ["HRA (40%)", s.hra],
                    ["Conveyance (10%)", s.conv],
                  ].map(([k, v]) => (
                    <div
                      key={k as string}
                      className="flex justify-between text-[10px] py-1 border-b border-border/40"
                    >
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-foreground font-mono">
                        {fmt(v as number)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[11px] font-bold pt-2 text-green-600 dark:text-green-400">
                    <span>Gross Pay</span>
                    <span>{fmt(s.gross)}</span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="text-[11px] font-bold text-foreground mb-2">
                    Deductions
                  </div>
                  {[
                    ["PF (12%)", s.pf],
                    ["ESI (0.75%)", s.esi],
                    ["TDS (5%)", s.tds],
                  ].map(([k, v]) => (
                    <div
                      key={k as string}
                      className="flex justify-between text-[10px] py-1 border-b border-border/40"
                    >
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-destructive font-mono">
                        {fmt(v as number)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[11px] font-bold pt-2 text-destructive">
                    <span>Total Deductions</span>
                    <span>{fmt(s.deductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-teal/10 px-6 py-3 flex justify-between items-center">
                <span className="text-[13px] font-bold text-foreground">
                  Net Pay
                </span>
                <span className="text-[18px] font-bold text-teal">
                  {fmt(s.net)}
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2 mt-3 print:hidden">
            <Button
              size="sm"
              className="h-7 text-[11px] gap-1"
              onClick={() => window.print()}
              data-ocid="salary_slip.print.button"
            >
              <Printer size={11} /> Print Salary Slip
            </Button>
          </div>
        </div>
      )}

      <style>
        {
          "@media print { body * { visibility: hidden; } #salary-slip-print, #salary-slip-print * { visibility: visible; } #salary-slip-print { position: absolute; left: 0; top: 0; width: 100%; } }"
        }
      </style>
    </div>
  );
}
