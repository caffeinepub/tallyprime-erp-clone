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
import { Edit, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type Template = {
  id: string;
  name: string;
  customerName: string;
  amount: number;
  gstPercent: number;
  frequency: "Monthly" | "Quarterly" | "Annual";
  startDate: string;
  description: string;
  status: "Active" | "Paused" | "Cancelled";
};

const EMPTY: Omit<Template, "id"> = {
  name: "",
  customerName: "",
  amount: 0,
  gstPercent: 18,
  frequency: "Monthly",
  startDate: "",
  description: "",
  status: "Active",
};

export default function RecurringTemplates() {
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_recurring_templates") || "[]");
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState<Omit<Template, "id">>(EMPTY);

  const save = (data: Template[]) => {
    setTemplates(data);
    localStorage.setItem("hk_recurring_templates", JSON.stringify(data));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.customerName.trim() || !form.startDate) {
      toast.error("Name, customer, and start date required");
      return;
    }
    if (editing) {
      save(
        templates.map((t) =>
          t.id === editing.id ? { ...editing, ...form } : t,
        ),
      );
      toast.success("Template updated");
    } else {
      save([...templates, { id: Date.now().toString(), ...form }]);
      toast.success("Recurring template created");
    }
    setOpen(false);
    setEditing(null);
    setForm(EMPTY);
  };

  const handleDelete = (id: string) => {
    save(templates.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const totalAnnualValue = templates
    .filter((t) => t.status === "Active")
    .reduce((acc, t) => {
      const mult =
        t.frequency === "Monthly" ? 12 : t.frequency === "Quarterly" ? 4 : 1;
      return acc + t.amount * mult;
    }, 0);

  return (
    <div className="p-4 space-y-3" data-ocid="recurring_templates.section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <RefreshCw size={14} className="text-teal" /> Recurring Templates
          </h2>
          <p className="text-[10px] text-muted-foreground">
            Annual Active Value:{" "}
            <span className="font-bold text-foreground">
              ₹{totalAnnualValue.toLocaleString("en-IN")}
            </span>
          </p>
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
              data-ocid="recurring_templates.add.button"
            >
              <Plus size={11} /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm">
                {editing ? "Edit" : "New"} Recurring Template
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Template Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                  data-ocid="recurring_templates.name.input"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Customer Name *</Label>
                <Input
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, customerName: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                  data-ocid="recurring_templates.customer.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Amount (₹) *</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: Number(e.target.value) }))
                  }
                  className="h-7 text-[11px]"
                  data-ocid="recurring_templates.amount.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">GST %</Label>
                <Input
                  type="number"
                  value={form.gstPercent}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      gstPercent: Number(e.target.value),
                    }))
                  }
                  className="h-7 text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Frequency</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, frequency: v as any }))
                  }
                >
                  <SelectTrigger
                    className="h-7 text-[11px]"
                    data-ocid="recurring_templates.frequency.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Start Date *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                />
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
                    data-ocid="recurring_templates.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="text-[11px] h-16"
                  data-ocid="recurring_templates.description.textarea"
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
                data-ocid="recurring_templates.cancel.button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-[11px]"
                onClick={handleSubmit}
                data-ocid="recurring_templates.save.button"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-[11px]">
            {templates.length} Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px]">
                  <TableHead>Template Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead>GST%</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-[10px] text-muted-foreground py-6"
                      data-ocid="recurring_templates.empty_state"
                    >
                      No templates yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((t, i) => (
                    <TableRow
                      key={t.id}
                      className="text-[10px]"
                      data-ocid={`recurring_templates.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.customerName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {t.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>{t.gstPercent}%</TableCell>
                      <TableCell>{t.frequency}</TableCell>
                      <TableCell>{t.startDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.status === "Active"
                              ? "default"
                              : t.status === "Paused"
                                ? "outline"
                                : "secondary"
                          }
                          className="text-[9px]"
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
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
                            data-ocid={`recurring_templates.edit.${i + 1}`}
                          >
                            <Edit size={10} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={() => handleDelete(t.id)}
                            data-ocid={`recurring_templates.delete.${i + 1}`}
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
