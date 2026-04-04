import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Task {
  id: string;
  voucherRef: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const STATUS_COLORS: Record<string, string> = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-orange-100 text-orange-700",
  Done: "bg-green-100 text-green-700",
};

function getTasks(): Task[] {
  return JSON.parse(localStorage.getItem("hkp_collab_tasks") || "[]");
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem("hkp_collab_tasks", JSON.stringify(tasks));
}

export default function VoucherTasks() {
  const currentUser =
    JSON.parse(localStorage.getItem("hkp_current_user") || "null")?.username ||
    "admin";

  const [tasks, setTasks] = useState<Task[]>(getTasks);
  const [filterStatus, setFilterStatus] = useState("All");
  const [form, setForm] = useState({
    voucherRef: "",
    title: "",
    assignee: "",
    dueDate: "",
    priority: "Medium",
  });

  const filtered =
    filterStatus === "All"
      ? tasks
      : tasks.filter((t) => t.status === filterStatus);

  const updateField = (field: string, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const addTask = () => {
    if (!form.voucherRef.trim() || !form.title.trim()) {
      toast.error("Voucher ref and title are required");
      return;
    }
    const updated = [
      ...tasks,
      {
        id: Date.now().toString(),
        ...form,
        status: "Open",
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
      },
    ];
    saveTasks(updated);
    setTasks(updated);
    setForm({
      voucherRef: "",
      title: "",
      assignee: "",
      dueDate: "",
      priority: "Medium",
    });
    toast.success("Task created");
  };

  const updateStatus = (id: string, status: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, status } : t));
    saveTasks(updated);
    setTasks(updated);
  };

  return (
    <div className="p-4 space-y-4" data-ocid="voucher_tasks.panel">
      <h2 className="text-sm font-semibold text-foreground">Voucher Tasks</h2>

      {/* Create Task Form */}
      <div className="border border-border rounded p-3 bg-muted/20 space-y-3">
        <div className="text-[10px] font-semibold text-foreground flex items-center gap-1">
          <Plus className="w-3 h-3" /> New Task
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          <div>
            <Label className="text-[10px]">Voucher Ref</Label>
            <Input
              className="h-7 text-[10px]"
              value={form.voucherRef}
              onChange={(e) => updateField("voucherRef", e.target.value)}
              placeholder="INV/2024/001"
              data-ocid="voucher_tasks.input"
            />
          </div>
          <div>
            <Label className="text-[10px]">Task Title</Label>
            <Input
              className="h-7 text-[10px]"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Verify invoice amount"
            />
          </div>
          <div>
            <Label className="text-[10px]">Assignee</Label>
            <Input
              className="h-7 text-[10px]"
              value={form.assignee}
              onChange={(e) => updateField("assignee", e.target.value)}
              placeholder="Username"
            />
          </div>
          <div>
            <Label className="text-[10px]">Due Date</Label>
            <Input
              type="date"
              className="h-7 text-[10px]"
              value={form.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[10px]">Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(v) => updateField("priority", v)}
            >
              <SelectTrigger
                className="h-7 text-[10px]"
                data-ocid="voucher_tasks.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              className="h-7 text-[10px] w-full"
              onClick={addTask}
              data-ocid="voucher_tasks.submit_button"
            >
              Create Task
            </Button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 items-center">
        <span className="text-[10px] text-muted-foreground">Filter:</span>
        {["All", "Open", "In Progress", "Done"].map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-[9px] px-2 py-0.5 rounded border ${
              filterStatus === s
                ? "bg-teal text-white border-teal"
                : "border-border text-muted-foreground"
            }`}
            data-ocid="voucher_tasks.tab"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Task Table */}
      {filtered.length === 0 ? (
        <div
          className="py-10 text-center text-[10px] text-muted-foreground border border-dashed border-border rounded"
          data-ocid="voucher_tasks.empty_state"
        >
          No tasks found
        </div>
      ) : (
        <div className="border border-border rounded overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">#</TableHead>
                <TableHead className="text-[10px]">Voucher Ref</TableHead>
                <TableHead className="text-[10px]">Title</TableHead>
                <TableHead className="text-[10px]">Assignee</TableHead>
                <TableHead className="text-[10px]">Due Date</TableHead>
                <TableHead className="text-[10px]">Priority</TableHead>
                <TableHead className="text-[10px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((task, i) => (
                <TableRow
                  key={task.id}
                  data-ocid={`voucher_tasks.item.${i + 1}`}
                >
                  <TableCell className="text-[10px] text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="text-[10px] font-mono">
                    {task.voucherRef}
                  </TableCell>
                  <TableCell className="text-[10px]">{task.title}</TableCell>
                  <TableCell className="text-[10px]">{task.assignee}</TableCell>
                  <TableCell className="text-[10px]">{task.dueDate}</TableCell>
                  <TableCell>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        PRIORITY_COLORS[task.priority] || ""
                      }`}
                    >
                      {task.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(v) => updateStatus(task.id, v)}
                    >
                      <SelectTrigger
                        className={`h-6 text-[9px] px-1.5 py-0.5 rounded font-medium border-0 ${
                          STATUS_COLORS[task.status] || ""
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
