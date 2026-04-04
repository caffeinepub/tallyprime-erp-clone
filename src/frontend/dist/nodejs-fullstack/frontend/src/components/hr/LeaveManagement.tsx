import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type LeaveType = { id: string; name: string; maxDays: number };
type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedOn: string;
};

const DEFAULT_TYPES: LeaveType[] = [
  { id: "cl", name: "Casual Leave", maxDays: 12 },
  { id: "sl", name: "Sick Leave", maxDays: 8 },
  { id: "el", name: "Earned Leave", maxDays: 15 },
  { id: "ml", name: "Maternity Leave", maxDays: 180 },
];

export default function LeaveManagement() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("hk_leave_types") || JSON.stringify(DEFAULT_TYPES),
      );
    } catch {
      return DEFAULT_TYPES;
    }
  });
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_leaves") || "[]");
    } catch {
      return [];
    }
  });
  const [applyOpen, setApplyOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [newType, setNewType] = useState({ name: "", maxDays: 10 });
  const employees: { id: string; name: string }[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("hk_employees") || "[]");
    } catch {
      return [];
    }
  })();

  const [form, setForm] = useState({
    employeeId: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const saveLeaves = (data: LeaveRequest[]) => {
    setLeaves(data);
    localStorage.setItem("hk_leaves", JSON.stringify(data));
  };

  const saveTypes = (data: LeaveType[]) => {
    setLeaveTypes(data);
    localStorage.setItem("hk_leave_types", JSON.stringify(data));
  };

  const applyLeave = () => {
    if (!form.employeeId || !form.leaveType || !form.fromDate || !form.toDate) {
      toast.error("Fill all required fields");
      return;
    }
    const emp = employees.find((e) => e.id === form.employeeId);
    const req: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: form.employeeId,
      employeeName: emp?.name || "",
      leaveType: form.leaveType,
      fromDate: form.fromDate,
      toDate: form.toDate,
      reason: form.reason,
      status: "Pending",
      appliedOn: new Date().toISOString().split("T")[0],
    };
    saveLeaves([...leaves, req]);
    toast.success("Leave applied");
    setApplyOpen(false);
    setForm({
      employeeId: "",
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });
  };

  const updateStatus = (id: string, status: "Approved" | "Rejected") => {
    saveLeaves(leaves.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success(`Leave ${status.toLowerCase()}`);
  };

  const addType = () => {
    if (!newType.name.trim()) {
      toast.error("Type name required");
      return;
    }
    saveTypes([...leaveTypes, { id: Date.now().toString(), ...newType }]);
    setNewType({ name: "", maxDays: 10 });
    setTypeOpen(false);
    toast.success("Leave type added");
  };

  // Balance: count approved days per employee per type
  const balances: Record<string, Record<string, number>> = {};
  for (const emp of employees) {
    balances[emp.id] = {};
    for (const lt of leaveTypes) {
      const used = leaves
        .filter(
          (l) =>
            l.employeeId === emp.id &&
            l.leaveType === lt.name &&
            l.status === "Approved",
        )
        .reduce((acc, l) => {
          const from = new Date(l.fromDate);
          const to = new Date(l.toDate);
          return (
            acc + Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1
          );
        }, 0);
      balances[emp.id][lt.name] = Math.max(0, lt.maxDays - used);
    }
  }

  return (
    <div className="p-4 space-y-3" data-ocid="leave.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Leave Management</h2>
        <div className="flex gap-2">
          <Dialog open={typeOpen} onOpenChange={setTypeOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1"
                data-ocid="leave.add_type.button"
              >
                <Plus size={11} /> Leave Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-sm">Add Leave Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">Type Name</Label>
                  <Input
                    value={newType.name}
                    onChange={(e) =>
                      setNewType((p) => ({ ...p, name: e.target.value }))
                    }
                    className="h-7 text-[11px]"
                    data-ocid="leave.type_name.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Max Days/Year</Label>
                  <Input
                    type="number"
                    value={newType.maxDays}
                    onChange={(e) =>
                      setNewType((p) => ({
                        ...p,
                        maxDays: Number(e.target.value),
                      }))
                    }
                    className="h-7 text-[11px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  size="sm"
                  className="text-[11px]"
                  onClick={addType}
                  data-ocid="leave.add_type_save.button"
                >
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-7 text-[11px] gap-1"
                data-ocid="leave.apply.button"
              >
                <Plus size={11} /> Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-sm">Apply Leave</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">Employee *</Label>
                  <Select
                    value={form.employeeId}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, employeeId: v }))
                    }
                  >
                    <SelectTrigger
                      className="h-7 text-[11px]"
                      data-ocid="leave.employee.select"
                    >
                      <SelectValue placeholder="Select employee" />
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
                  <Label className="text-[10px]">Leave Type *</Label>
                  <Select
                    value={form.leaveType}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, leaveType: v }))
                    }
                  >
                    <SelectTrigger
                      className="h-7 text-[11px]"
                      data-ocid="leave.type.select"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((t) => (
                        <SelectItem key={t.id} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">From *</Label>
                    <Input
                      type="date"
                      value={form.fromDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, fromDate: e.target.value }))
                      }
                      className="h-7 text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">To *</Label>
                    <Input
                      type="date"
                      value={form.toDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, toDate: e.target.value }))
                      }
                      className="h-7 text-[11px]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Reason</Label>
                  <Textarea
                    value={form.reason}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, reason: e.target.value }))
                    }
                    className="text-[11px] h-16"
                    data-ocid="leave.reason.textarea"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px]"
                  onClick={() => setApplyOpen(false)}
                  data-ocid="leave.apply_cancel.button"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-[11px]"
                  onClick={applyLeave}
                  data-ocid="leave.apply_submit.button"
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="h-7 text-[11px]">
          <TabsTrigger
            value="requests"
            className="text-[11px] h-6"
            data-ocid="leave.requests.tab"
          >
            Leave Requests (
            {leaves.filter((l) => l.status === "Pending").length} pending)
          </TabsTrigger>
          <TabsTrigger
            value="balance"
            className="text-[11px] h-6"
            data-ocid="leave.balance.tab"
          >
            Leave Balance
          </TabsTrigger>
          <TabsTrigger
            value="types"
            className="text-[11px] h-6"
            data-ocid="leave.types.tab"
          >
            Leave Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-3">
          <Card className="border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[10px]">
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-[10px] text-muted-foreground py-6"
                          data-ocid="leave.empty_state"
                        >
                          No leave requests.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaves.map((l, i) => (
                        <TableRow
                          key={l.id}
                          className="text-[10px]"
                          data-ocid={`leave.item.${i + 1}`}
                        >
                          <TableCell>{l.employeeName}</TableCell>
                          <TableCell>{l.leaveType}</TableCell>
                          <TableCell>{l.fromDate}</TableCell>
                          <TableCell>{l.toDate}</TableCell>
                          <TableCell>{l.appliedOn}</TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            {l.status === "Pending" && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-green-600"
                                  onClick={() => updateStatus(l.id, "Approved")}
                                  data-ocid={`leave.approve.${i + 1}`}
                                >
                                  <Check size={10} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive"
                                  onClick={() => updateStatus(l.id, "Rejected")}
                                  data-ocid={`leave.reject.${i + 1}`}
                                >
                                  <X size={10} />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-3">
          <Card className="border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[10px]">
                      <TableHead>Employee</TableHead>
                      {leaveTypes.map((t) => (
                        <TableHead key={t.id} className="text-center">
                          {t.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={leaveTypes.length + 1}
                          className="text-center text-[10px] text-muted-foreground py-4"
                          data-ocid="leave.balance_empty_state"
                        >
                          No employees.
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((emp, i) => (
                        <TableRow
                          key={emp.id}
                          className="text-[10px]"
                          data-ocid={`leave.balance.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {emp.name}
                          </TableCell>
                          {leaveTypes.map((t) => (
                            <TableCell key={t.id} className="text-center">
                              <span
                                className={`font-bold ${(balances[emp.id]?.[t.name] ?? t.maxDays) < 3 ? "text-red-500" : "text-green-600"}`}
                              >
                                {balances[emp.id]?.[t.name] ?? t.maxDays}
                              </span>
                              <span className="text-muted-foreground">
                                /{t.maxDays}
                              </span>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="mt-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {leaveTypes.map((t, i) => (
              <Card
                key={t.id}
                className="border-border"
                data-ocid={`leave.type.item.${i + 1}`}
              >
                <CardHeader className="pb-1 pt-3">
                  <CardTitle className="text-[11px]">{t.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[18px] font-bold text-teal">
                    {t.maxDays}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    days/year
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
