import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";

type Employee = {
  id: string;
  name: string;
  department: string;
  designation: string;
  status: string;
};

type AttRecord = Record<string, string>; // "EMP001_2024-01_1" => "P"

type LeaveRequest = {
  id: string;
  status: string;
  fromDate: string;
  toDate: string;
};

export default function HRDashboard() {
  const employees: Employee[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_employees") || "[]");
    } catch {
      return [];
    }
  }, []);

  const attendance: AttRecord = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_attendance") || "{}");
    } catch {
      return {};
    }
  }, []);

  const leaves: LeaveRequest[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_leaves") || "[]");
    } catch {
      return [];
    }
  }, []);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const today = now.getDate();

  // Attendance % for current month
  const totalPossible = employees.length * today;
  const presentCount = Object.entries(attendance).filter(
    ([k, v]) => k.includes(`_${monthKey}_`) && (v === "P" || v === "H"),
  ).length;
  const attendancePct =
    totalPossible > 0 ? Math.round((presentCount / totalPossible) * 100) : 0;

  // Dept breakdown
  const deptMap: Record<string, number> = {};
  for (const emp of employees) {
    deptMap[emp.department || "General"] =
      (deptMap[emp.department || "General"] || 0) + 1;
  }

  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;

  const stats = [
    {
      label: "Total Employees",
      value: employees.length,
      icon: Users,
      color: "text-teal",
    },
    {
      label: "Attendance This Month",
      value: `${attendancePct}%`,
      icon: Calendar,
      color: "text-green-500",
    },
    {
      label: "Pending Leave Requests",
      value: pendingLeaves,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      label: "Departments",
      value: Object.keys(deptMap).length,
      icon: TrendingUp,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="p-4 space-y-4" data-ocid="hr_dashboard.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">HR Dashboard</h2>
        <Badge variant="outline" className="text-[10px]">
          {monthKey}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <s.icon size={16} className={s.color} />
                <div>
                  <div className="text-[18px] font-bold text-foreground">
                    {s.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dept breakdown */}
        <Card className="border-border">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-[11px] font-semibold">
              Headcount by Department
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(deptMap).length === 0 ? (
              <p className="text-[10px] text-muted-foreground">
                No employees added yet.
              </p>
            ) : (
              Object.entries(deptMap).map(([dept, count]) => (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-foreground">{dept}</span>
                    <span className="text-muted-foreground">{count} emp</span>
                  </div>
                  <Progress
                    value={(count / employees.length) * 100}
                    className="h-1.5"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Attendance this month */}
        <Card className="border-border">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-[11px] font-semibold">
              Attendance Overview — {monthKey}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg
                  viewBox="0 0 36 36"
                  className="w-16 h-16 -rotate-90"
                  aria-label="Attendance donut chart"
                  role="img"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="oklch(var(--teal))"
                    strokeWidth="3"
                    strokeDasharray={`${attendancePct} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-foreground">
                    {attendancePct}%
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-1">
                  <CheckCircle size={10} className="text-green-500" /> Present:{" "}
                  {presentCount}
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle size={10} className="text-red-400" />{" "}
                  Absent/Leave: {totalPossible - presentCount}
                </div>
                <div className="text-muted-foreground">
                  Days elapsed: {today}/{daysInMonth}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent leave requests */}
      <Card className="border-border">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-[11px] font-semibold">
            Recent Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">
              No leave requests yet.
            </p>
          ) : (
            <div className="space-y-1">
              {leaves
                .slice(-5)
                .reverse()
                .map((l, i) => (
                  <div
                    key={l.id}
                    data-ocid={`hr_dashboard.leave.item.${i + 1}`}
                    className="flex items-center justify-between text-[10px] py-1 border-b border-border last:border-0"
                  >
                    <span className="text-foreground">
                      {(l as any).employeeName || "Employee"} —{" "}
                      {(l as any).leaveType || "Leave"}
                    </span>
                    <span className="text-muted-foreground">
                      {l.fromDate} → {l.toDate}
                    </span>
                    <Badge
                      variant={
                        l.status === "Approved"
                          ? "default"
                          : l.status === "Rejected"
                            ? "destructive"
                            : "outline"
                      }
                      className="text-[9px]"
                    >
                      {l.status}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
