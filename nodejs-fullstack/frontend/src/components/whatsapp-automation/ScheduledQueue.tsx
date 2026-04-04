import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ScheduledMsg = {
  id: string;
  customer: string;
  msgType: string;
  scheduledAt: string;
  status: string;
};

const SEED: ScheduledMsg[] = [
  {
    id: "SCH-001",
    customer: "Rahul Sharma",
    msgType: "Invoice",
    scheduledAt: "2026-04-01 09:00",
    status: "Pending",
  },
  {
    id: "SCH-002",
    customer: "Meera Textiles",
    msgType: "Reminder",
    scheduledAt: "2026-04-05 10:00",
    status: "Pending",
  },
  {
    id: "SCH-003",
    customer: "Star Electronics",
    msgType: "Ledger Summary",
    scheduledAt: "2026-03-31 08:00",
    status: "Sent",
  },
];

export default function ScheduledQueue() {
  const [items, setItems] = useState<ScheduledMsg[]>(SEED);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    msgType: "",
    scheduledAt: "",
  });

  const addSchedule = () => {
    if (!form.customer || !form.msgType || !form.scheduledAt) {
      toast.error("Fill all fields");
      return;
    }
    setItems((p) => [
      ...p,
      { id: `SCH-${Date.now()}`, ...form, status: "Pending" },
    ]);
    setOpen(false);
    setForm({ customer: "", msgType: "", scheduledAt: "" });
    toast.success("Message scheduled");
  };

  const cancel = (id: string) => {
    setItems((p) =>
      p.map((i) => (i.id === id ? { ...i, status: "Cancelled" } : i)),
    );
    toast.success("Schedule cancelled");
  };

  return (
    <div className="p-4 space-y-4" data-ocid="whatsapp.scheduled.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          Scheduled Message Queue
        </h2>
        <Button
          size="sm"
          className="text-xs h-7"
          onClick={() => setOpen(true)}
          data-ocid="whatsapp.new_schedule.open_modal_button"
        >
          <Plus size={12} className="mr-1" /> New Schedule
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">ID</TableHead>
              <TableHead className="text-xs">Recipient</TableHead>
              <TableHead className="text-xs">Message Type</TableHead>
              <TableHead className="text-xs">Scheduled At</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow
                key={item.id}
                data-ocid={`whatsapp.schedule.item.${idx + 1}`}
              >
                <TableCell className="text-xs font-mono">{item.id}</TableCell>
                <TableCell className="text-xs">{item.customer}</TableCell>
                <TableCell className="text-xs">{item.msgType}</TableCell>
                <TableCell className="text-xs">{item.scheduledAt}</TableCell>
                <TableCell>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.status === "Sent"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : item.status === "Cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>
                  {item.status === "Pending" && (
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => cancel(item.id)}
                      data-ocid={`whatsapp.cancel_schedule.button.${idx + 1}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="whatsapp.new_schedule.dialog">
          <DialogHeader>
            <DialogTitle className="text-sm">Schedule New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Customer Name</Label>
              <Input
                className="h-7 text-xs mt-1"
                value={form.customer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customer: e.target.value }))
                }
                data-ocid="whatsapp.schedule_customer.input"
              />
            </div>
            <div>
              <Label className="text-xs">Message Type</Label>
              <Select
                value={form.msgType}
                onValueChange={(v) => setForm((p) => ({ ...p, msgType: v }))}
              >
                <SelectTrigger
                  className="h-7 text-xs mt-1"
                  data-ocid="whatsapp.schedule_type.select"
                >
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {["Invoice", "Reminder", "Ledger Summary", "Custom"].map(
                    (t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Schedule Date & Time</Label>
              <Input
                className="h-7 text-xs mt-1"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scheduledAt: e.target.value }))
                }
                data-ocid="whatsapp.schedule_time.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setOpen(false)}
              data-ocid="whatsapp.schedule.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={addSchedule}
              data-ocid="whatsapp.schedule.confirm_button"
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
