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
import { Edit, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Employee = {
  id: string;
  code: string;
  name: string;
  department: string;
  designation: string;
  joiningDate: string;
  salaryType: "Monthly" | "Daily";
  basicSalary: number;
  pan: string;
  aadhaar: string;
  bankAccount: string;
  ifsc: string;
  contact: string;
  status: "Active" | "Inactive";
};

const EMPTY: Omit<Employee, "id" | "code"> = {
  name: "",
  department: "",
  designation: "",
  joiningDate: "",
  salaryType: "Monthly",
  basicSalary: 0,
  pan: "",
  aadhaar: "",
  bankAccount: "",
  ifsc: "",
  contact: "",
  status: "Active",
};

export default function HREmployeeMaster() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_employees") || "[]");
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Omit<Employee, "id" | "code">>(EMPTY);
  const [search, setSearch] = useState("");

  const save = (data: Employee[]) => {
    setEmployees(data);
    localStorage.setItem("hk_employees", JSON.stringify(data));
  };

  const nextCode = () => `EMP${String(employees.length + 1).padStart(3, "0")}`;

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Employee name is required");
      return;
    }
    if (editing) {
      save(
        employees.map((e) =>
          e.id === editing.id ? { ...editing, ...form } : e,
        ),
      );
      toast.success("Employee updated");
    } else {
      const newEmp: Employee = {
        id: Date.now().toString(),
        code: nextCode(),
        ...form,
      };
      save([...employees, newEmp]);
      toast.success("Employee added");
    }
    setOpen(false);
    setEditing(null);
    setForm(EMPTY);
  };

  const handleEdit = (emp: Employee) => {
    setEditing(emp);
    const { id, code, ...rest } = emp;
    setForm(rest);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    save(employees.filter((e) => e.id !== id));
    toast.success("Employee removed");
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()),
  );

  const F = ({
    label,
    children,
  }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1">
      <Label className="text-[10px]">{label}</Label>
      {children}
    </div>
  );

  return (
    <div className="p-4 space-y-3" data-ocid="hr_employee.section">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Users size={14} className="text-teal" /> Employee Master
        </h2>
        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-7 text-[11px] w-40"
            data-ocid="hr_employee.search_input"
          />
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) {
                setEditing(null);
                setForm(EMPTY);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-7 text-[11px] gap-1"
                data-ocid="hr_employee.add_button"
              >
                <Plus size={11} /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-sm">
                  {editing ? "Edit" : "Add"} Employee
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                <F label="Full Name *">
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="h-7 text-[11px]"
                    data-ocid="hr_employee.name.input"
                  />
                </F>
                <F label="Department">
                  <Input
                    value={form.department}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, department: e.target.value }))
                    }
                    className="h-7 text-[11px]"
                    data-ocid="hr_employee.department.input"
                  />
                </F>
                <F label="Designation">
                  <Input
                    value={form.designation}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, designation: e.target.value }))
                    }
                    className="h-7 text-[11px]"
                    data-ocid="hr_employee.designation.input"
                  />
                </F>
                <F label="Joining Date">
                  <Input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, joiningDate: e.target.value }))
                    }
                    className="h-7 text-[11px]"
                  />
                </F>
                <F label="Salary Type">
                  <Select
                    value={form.salaryType}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, salaryType: v as any }))
                    }
                  >
                    <SelectTrigger
                      className="h-7 text-[11px]"
                      data-ocid="hr_employee.salary_type.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
                <F label="Basic Salary (₹)">
                  <Input
                    type="number"
                    value={form.basicSalary}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        basicSalary: Number(e.target.value),
                      }))
                    }
                    className="h-7 text-[11px]"
                    data-ocid="hr_employee.salary.input"
                  />
                </F>
                <F label="PAN">
                  <Input
                    value={form.pan}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        pan: e.target.value.toUpperCase(),
                      }))
                    }
                    className="h-7 text-[11px] font-mono"
                    placeholder="ABCDE1234F"
                  />
                </F>
                <F label="Aadhaar">
                  <Input
                    value={form.aadhaar}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, aadhaar: e.target.value }))
                    }
                    className="h-7 text-[11px] font-mono"
                    placeholder="XXXX XXXX XXXX"
                  />
                </F>
                <F label="Bank Account No.">
                  <Input
                    value={form.bankAccount}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bankAccount: e.target.value }))
                    }
                    className="h-7 text-[11px] font-mono"
                  />
                </F>
                <F label="IFSC Code">
                  <Input
                    value={form.ifsc}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        ifsc: e.target.value.toUpperCase(),
                      }))
                    }
                    className="h-7 text-[11px] font-mono"
                    placeholder="SBIN0001234"
                  />
                </F>
                <F label="Contact">
                  <Input
                    value={form.contact}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, contact: e.target.value }))
                    }
                    className="h-7 text-[11px]"
                    placeholder="+91 9XXXXXXXXX"
                  />
                </F>
                <F label="Status">
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, status: v as any }))
                    }
                  >
                    <SelectTrigger
                      className="h-7 text-[11px]"
                      data-ocid="hr_employee.status.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px]"
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                    setForm(EMPTY);
                  }}
                  data-ocid="hr_employee.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-[11px]"
                  onClick={handleSubmit}
                  data-ocid="hr_employee.save_button"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-[11px]">
            {filtered.length} Employees
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px]">
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Salary Type</TableHead>
                  <TableHead className="text-right">Basic (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-[10px] text-muted-foreground py-6"
                      data-ocid="hr_employee.empty_state"
                    >
                      No employees found. Add your first employee.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((emp, i) => (
                    <TableRow
                      key={emp.id}
                      className="text-[10px]"
                      data-ocid={`hr_employee.item.${i + 1}`}
                    >
                      <TableCell className="font-mono">{emp.code}</TableCell>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>{emp.salaryType}</TableCell>
                      <TableCell className="text-right font-mono">
                        {emp.basicSalary.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            emp.status === "Active" ? "default" : "secondary"
                          }
                          className="text-[9px]"
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEdit(emp)}
                            data-ocid={`hr_employee.edit_button.${i + 1}`}
                          >
                            <Edit size={10} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={() => handleDelete(emp.id)}
                            data-ocid={`hr_employee.delete_button.${i + 1}`}
                          >
                            <Trash2 size={10} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
