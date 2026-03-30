import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Employee = { id: string; code: string; name: string; department: string };
type AttRecord = Record<string, string>;

const STATUSES = ["P", "A", "H", "L", ""] as const;
const STATUS_COLOR: Record<string, string> = {
  P: "bg-green-500/20 text-green-700 dark:text-green-400",
  A: "bg-red-500/20 text-red-700 dark:text-red-400",
  H: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  L: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  "": "text-muted-foreground",
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

export default function AttendanceRegister() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [attendance, setAttendance] = useState<AttRecord>(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_attendance") || "{}");
    } catch {
      return {};
    }
  });

  const employees: Employee[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("hk_employees") || "[]");
    } catch {
      return [];
    }
  })();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const key = (empId: string, day: number) => `${empId}_${monthKey}_${day}`;

  const toggle = (empId: string, day: number) => {
    const k = key(empId, day);
    const cur = attendance[k] || "";
    const idx = STATUSES.indexOf(cur as any);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    const updated = { ...attendance, [k]: next };
    setAttendance(updated);
    localStorage.setItem("hk_attendance", JSON.stringify(updated));
  };

  const markAllPresent = () => {
    const updated = { ...attendance };
    for (const emp of employees) {
      for (const day of days) {
        updated[key(emp.id, day)] = "P";
      }
    }
    setAttendance(updated);
    localStorage.setItem("hk_attendance", JSON.stringify(updated));
    toast.success(`All marked Present for ${MONTHS[month]} ${year}`);
  };

  const countFor = (empId: string, status: string) =>
    days.filter((d) => attendance[key(empId, d)] === status).length;

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="p-4 space-y-3" data-ocid="attendance.section">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm font-bold text-foreground">
          Attendance Register
        </h2>
        <div className="flex gap-2 items-center">
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger
              className="h-7 w-28 text-[11px]"
              data-ocid="attendance.month.select"
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
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger
              className="h-7 w-20 text-[11px]"
              data-ocid="attendance.year.select"
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
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px] gap-1"
            onClick={markAllPresent}
            data-ocid="attendance.mark_all.button"
          >
            <CheckCheck size={11} /> Mark All Present
          </Button>
        </div>
      </div>

      <div className="flex gap-3 text-[10px]">
        {[
          { s: "P", l: "Present" },
          { s: "A", l: "Absent" },
          { s: "H", l: "Half-Day" },
          { s: "L", l: "Leave" },
        ].map(({ s, l }) => (
          <span
            key={s}
            className={`px-2 py-0.5 rounded text-[9px] font-bold ${STATUS_COLOR[s]}`}
          >
            {s} = {l}
          </span>
        ))}
        <span className="text-muted-foreground">
          Click cell to cycle P→A→H→L
        </span>
      </div>

      {employees.length === 0 ? (
        <Card className="border-border">
          <CardContent
            className="py-6 text-center text-[10px] text-muted-foreground"
            data-ocid="attendance.empty_state"
          >
            No employees found. Add employees in Employee Master first.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-[11px]">
              {MONTHS[month]} {year} — {employees.length} Employees
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="sticky left-0 bg-muted/60 z-10 text-left px-2 py-1.5 min-w-[120px] text-[10px] font-semibold border-r border-border">
                      Employee
                    </th>
                    {days.map((d) => (
                      <th
                        key={d}
                        className="px-1 py-1.5 text-center min-w-[22px] border-r border-border/40 text-muted-foreground"
                      >
                        {d}
                      </th>
                    ))}
                    <th className="px-2 py-1.5 text-center bg-green-500/10 border-l border-border">
                      P
                    </th>
                    <th className="px-2 py-1.5 text-center bg-red-500/10">A</th>
                    <th className="px-2 py-1.5 text-center bg-yellow-500/10">
                      H
                    </th>
                    <th className="px-2 py-1.5 text-center bg-blue-500/10">
                      L
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, ri) => (
                    <tr
                      key={emp.id}
                      className={`border-b border-border/30 ${ri % 2 === 0 ? "" : "bg-muted/10"}`}
                      data-ocid={`attendance.row.${ri + 1}`}
                    >
                      <td className="sticky left-0 bg-card z-10 px-2 py-1 border-r border-border">
                        <div className="font-medium text-[10px] text-foreground">
                          {emp.name}
                        </div>
                        <div className="text-muted-foreground">{emp.code}</div>
                      </td>
                      {days.map((d) => {
                        const val = attendance[key(emp.id, d)] || "";
                        return (
                          <td
                            key={d}
                            className="px-0.5 py-1 text-center border-r border-border/20"
                          >
                            <button
                              type="button"
                              onClick={() => toggle(emp.id, d)}
                              className={`w-5 h-5 rounded text-[9px] font-bold transition-colors ${STATUS_COLOR[val] || "hover:bg-muted"}`}
                              title={`${emp.name} - Day ${d}`}
                            >
                              {val || "·"}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-2 py-1 text-center font-bold text-green-600 dark:text-green-400 bg-green-500/5">
                        {countFor(emp.id, "P")}
                      </td>
                      <td className="px-2 py-1 text-center font-bold text-red-500 bg-red-500/5">
                        {countFor(emp.id, "A")}
                      </td>
                      <td className="px-2 py-1 text-center font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-500/5">
                        {countFor(emp.id, "H")}
                      </td>
                      <td className="px-2 py-1 text-center font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5">
                        {countFor(emp.id, "L")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
