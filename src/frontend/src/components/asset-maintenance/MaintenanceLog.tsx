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
import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type LogEntry = {
  id: string;
  taskRef: string;
  assetName: string;
  dateCompleted: string;
  cost: number;
  technician: string;
  notes: string;
};

const EMPTY: Omit<LogEntry, "id"> = {
  taskRef: "",
  assetName: "",
  dateCompleted: "",
  cost: 0,
  technician: "",
  notes: "",
};

export default function MaintenanceLog() {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_maintenance_log") || "[]");
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<LogEntry, "id">>(EMPTY);
  const [filterAsset, setFilterAsset] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const tasks: { id: string; assetName: string }[] = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("hk_maintenance_schedule") || "[]",
      );
    } catch {
      return [];
    }
  })();

  const save = (data: LogEntry[]) => {
    setLogs(data);
    localStorage.setItem("hk_maintenance_log", JSON.stringify(data));
  };

  const handleSubmit = () => {
    if (!form.assetName.trim() || !form.dateCompleted) {
      toast.error("Asset and date required");
      return;
    }
    save([...logs, { id: Date.now().toString(), ...form }]);
    toast.success("Maintenance log entry added");
    setOpen(false);
    setForm(EMPTY);
  };

  const filtered = logs.filter(
    (l) =>
      (!filterAsset ||
        l.assetName.toLowerCase().includes(filterAsset.toLowerCase())) &&
      (!filterDate || l.dateCompleted.startsWith(filterDate)),
  );

  const totalCost = filtered.reduce((a, b) => a + b.cost, 0);

  return (
    <div className="p-4 space-y-3" data-ocid="maintenance_log.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <ClipboardList size={14} className="text-teal" /> Maintenance Log
        </h2>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setForm(EMPTY);
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-7 text-[11px] gap-1"
              data-ocid="maintenance_log.add.button"
            >
              <Plus size={11} /> Add Log Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm">Add Maintenance Log</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Asset Name *</Label>
                {tasks.length > 0 ? (
                  <Select
                    value={form.assetName}
                    onValueChange={(v) => {
                      setForm((p) => ({
                        ...p,
                        assetName: v,
                        taskRef: tasks.find((t) => t.assetName === v)?.id || "",
                      }));
                    }}
                  >
                    <SelectTrigger
                      className="h-7 text-[11px]"
                      data-ocid="maintenance_log.asset.select"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((t) => (
                        <SelectItem key={t.id} value={t.assetName}>
                          {t.assetName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={form.assetName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, assetName: e.target.value }))
                    }
                    className="h-7 text-[11px]"
                    data-ocid="maintenance_log.asset_name.input"
                  />
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Date Completed *</Label>
                <Input
                  type="date"
                  value={form.dateCompleted}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dateCompleted: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Cost (₹)</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cost: Number(e.target.value) }))
                  }
                  className="h-7 text-[11px]"
                  data-ocid="maintenance_log.cost.input"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Technician</Label>
                <Input
                  value={form.technician}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, technician: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                  data-ocid="maintenance_log.technician.input"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="text-[11px] h-16"
                  data-ocid="maintenance_log.notes.textarea"
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
                  setForm(EMPTY);
                }}
                data-ocid="maintenance_log.cancel.button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-[11px]"
                onClick={handleSubmit}
                data-ocid="maintenance_log.save.button"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 items-end flex-wrap">
        <div className="space-y-1">
          <Label className="text-[10px]">Filter by Asset</Label>
          <Input
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            placeholder="Asset name..."
            className="h-7 text-[11px] w-40"
            data-ocid="maintenance_log.filter_asset.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Filter by Month</Label>
          <Input
            type="month"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-7 text-[11px]"
            data-ocid="maintenance_log.filter_date.input"
          />
        </div>
        <div className="text-[10px] text-muted-foreground pb-1">
          Total Cost:{" "}
          <span className="font-bold text-foreground">
            ₹{totalCost.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-[11px]">
            {filtered.length} Log Entries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px]">
                  <TableHead>Asset</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Cost (₹)</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-[10px] text-muted-foreground py-6"
                      data-ocid="maintenance_log.empty_state"
                    >
                      No log entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l, i) => (
                    <TableRow
                      key={l.id}
                      className="text-[10px]"
                      data-ocid={`maintenance_log.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {l.assetName}
                      </TableCell>
                      <TableCell>{l.dateCompleted}</TableCell>
                      <TableCell className="text-right font-mono">
                        {l.cost.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>{l.technician || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {l.notes || "—"}
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
