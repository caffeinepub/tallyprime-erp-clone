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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Task = {
  id: string;
  assetName: string;
  maintenanceType: "Preventive" | "Corrective";
  dueDate: string;
  assignedTo: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Done";
  notes: string;
};

const EMPTY: Omit<Task, "id"> = {
  assetName: "",
  maintenanceType: "Preventive",
  dueDate: "",
  assignedTo: "",
  priority: "Medium",
  status: "Pending",
  notes: "",
};

const PRIORITY_COLOR: Record<string, string> = {
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

export default function MaintenanceSchedule() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("hk_maintenance_schedule") || "[]",
      );
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Omit<Task, "id">>(EMPTY);

  // Fixed assets from existing data
  const fixedAssets: { name: string }[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("hk_fixed_assets") || "[]");
    } catch {
      return [];
    }
  })();

  const save = (data: Task[]) => {
    setTasks(data);
    localStorage.setItem("hk_maintenance_schedule", JSON.stringify(data));
  };

  const handleSubmit = () => {
    if (!form.assetName.trim() || !form.dueDate) {
      toast.error("Asset name and due date required");
      return;
    }
    if (editing) {
      save(
        tasks.map((t) => (t.id === editing.id ? { ...editing, ...form } : t)),
      );
      toast.success("Task updated");
    } else {
      save([...tasks, { id: Date.now().toString(), ...form }]);
      toast.success("Maintenance task created");
    }
    setOpen(false);
    setEditing(null);
    setForm(EMPTY);
  };

  const updateStatus = (id: string, status: Task["status"]) => {
    save(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const today = new Date().toISOString().split("T")[0];
  const overdue = tasks.filter(
    (t) => t.dueDate < today && t.status !== "Done",
  ).length;

  return (
    <div className="p-4 space-y-3" data-ocid="maintenance_schedule.section">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Wrench size={14} className="text-teal" /> Maintenance Schedule
          </h2>
          {overdue > 0 && (
            <Badge variant="destructive" className="text-[9px]">
              {overdue} Overdue
            </Badge>
          )}
        </div>
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
              data-ocid="maintenance_schedule.add.button"
            >
              <Plus size={11} /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm">
                {editing ? "Edit" : "New"} Maintenance Task
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Asset Name *</Label>
                {fixedAssets.length > 0 ? (
                  <Select
                    value={form.assetName}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, assetName: v }))
                    }
                  >
                    <SelectTrigger
                      className="h-7 text-[11px]"
                      data-ocid="maintenance_schedule.asset.select"
                    >
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {fixedAssets.map((a) => (
                        <SelectItem key={a.name} value={a.name}>
                          {a.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom">
                        Other (type below)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : null}
                {(fixedAssets.length === 0 ||
                  form.assetName === "__custom") && (
                  <Input
                    value={form.assetName === "__custom" ? "" : form.assetName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, assetName: e.target.value }))
                    }
                    className="h-7 text-[11px]"
                    placeholder="e.g. Generator, AC Unit"
                    data-ocid="maintenance_schedule.asset_name.input"
                  />
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Type</Label>
                <Select
                  value={form.maintenanceType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, maintenanceType: v as any }))
                  }
                >
                  <SelectTrigger className="h-7 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Corrective">Corrective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Due Date *</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Assigned To</Label>
                <Input
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, assignedTo: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                  placeholder="Technician name"
                  data-ocid="maintenance_schedule.assigned.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, priority: v as any }))
                  }
                >
                  <SelectTrigger
                    className="h-7 text-[11px]"
                    data-ocid="maintenance_schedule.priority.select"
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
              <div className="space-y-1">
                <Label className="text-[10px]">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, status: v as any }))
                  }
                >
                  <SelectTrigger
                    className="h-7 text-[11px]"
                    data-ocid="maintenance_schedule.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="text-[11px] h-16"
                  data-ocid="maintenance_schedule.notes.textarea"
                />
              </div>
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
                data-ocid="maintenance_schedule.cancel.button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-[11px]"
                onClick={handleSubmit}
                data-ocid="maintenance_schedule.save.button"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-[11px]">{tasks.length} Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px]">
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-[10px] text-muted-foreground py-6"
                      data-ocid="maintenance_schedule.empty_state"
                    >
                      No maintenance tasks. Add your first task.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((t, i) => (
                    <TableRow
                      key={t.id}
                      className={`text-[10px] ${t.dueDate < today && t.status !== "Done" ? "bg-red-500/5" : ""}`}
                      data-ocid={`maintenance_schedule.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {t.assetName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px]">
                          {t.maintenanceType}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          t.dueDate < today && t.status !== "Done"
                            ? "text-destructive font-bold"
                            : ""
                        }
                      >
                        {t.dueDate}
                      </TableCell>
                      <TableCell>{t.assignedTo || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={PRIORITY_COLOR[t.priority] as any}
                          className="text-[9px]"
                        >
                          {t.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={t.status}
                          onValueChange={(v) => updateStatus(t.id, v as any)}
                        >
                          <SelectTrigger className="h-6 text-[10px] w-24 border-0 p-0 bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setEditing(t);
                            const { id, ...r } = t;
                            setForm(r);
                            setOpen(true);
                          }}
                          data-ocid={`maintenance_schedule.edit.${i + 1}`}
                        >
                          <Wrench size={10} />
                        </Button>
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
