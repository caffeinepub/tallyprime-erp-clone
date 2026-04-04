import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

type UPIStatus = "Reconciled" | "Pending";

interface UPIEntry {
  id: string;
  date: string;
  utr: string;
  party: string;
  amount: number;
  status: UPIStatus;
}

const DEMO_DATA: UPIEntry[] = [
  {
    id: "1",
    date: "2026-03-01",
    utr: "308010123456",
    party: "Ravi Traders",
    amount: 50000,
    status: "Reconciled",
  },
  {
    id: "2",
    date: "2026-03-03",
    utr: "308010234567",
    party: "Amit Kumar",
    amount: 15000,
    status: "Reconciled",
  },
  {
    id: "3",
    date: "2026-03-06",
    utr: "308010345678",
    party: "Priya Stores",
    amount: 8500,
    status: "Pending",
  },
  {
    id: "4",
    date: "2026-03-09",
    utr: "308010456789",
    party: "Suresh Metals",
    amount: 32000,
    status: "Pending",
  },
  {
    id: "5",
    date: "2026-03-11",
    utr: "308010567890",
    party: "City Electricals",
    amount: 4200,
    status: "Reconciled",
  },
];

export default function UPITracker() {
  const [entries, setEntries] = useState<UPIEntry[]>(() => {
    const saved = localStorage.getItem("hk_upi_transactions");
    return saved ? JSON.parse(saved) : DEMO_DATA;
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: "",
    utr: "",
    party: "",
    amount: "",
    status: "Pending" as UPIStatus,
  });

  const save = (list: UPIEntry[]) => {
    setEntries(list);
    localStorage.setItem("hk_upi_transactions", JSON.stringify(list));
  };

  const addEntry = () => {
    if (!form.utr || !form.party || !form.amount) return;
    const newEntry: UPIEntry = {
      id: Date.now().toString(),
      date: form.date || new Date().toISOString().split("T")[0],
      utr: form.utr,
      party: form.party,
      amount: Number.parseFloat(form.amount),
      status: form.status,
    };
    save([...entries, newEntry]);
    setForm({ date: "", utr: "", party: "", amount: "", status: "Pending" });
    setOpen(false);
  };

  const reconciled = entries.filter((e) => e.status === "Reconciled");
  const pending = entries.filter((e) => e.status === "Pending");

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            UPI Tracker
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track UPI collection receipts and reconciliation
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 text-xs bg-teal-600 hover:bg-teal-700"
          onClick={() => setOpen(true)}
          data-ocid="upi.open_modal_button"
        >
          <Plus className="w-3 h-3 mr-1" /> Add UPI
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Entries</p>
            <p className="text-xl font-bold">{entries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Reconciled</p>
            <p className="text-xl font-bold text-green-600">
              {reconciled.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-xl font-bold text-yellow-500">
              {pending.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                UTR Number
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Party
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                Amount (₹)
              </th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr
                key={e.id}
                className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}
                data-ocid={`upi.item.${i + 1}`}
              >
                <td className="px-3 py-1.5">{e.date}</td>
                <td className="px-3 py-1.5 font-mono text-teal-500">{e.utr}</td>
                <td className="px-3 py-1.5 text-foreground">{e.party}</td>
                <td className="px-3 py-1.5 text-right font-medium">
                  {e.amount.toLocaleString()}
                </td>
                <td className="px-3 py-1.5 text-center">
                  <Badge
                    className={
                      e.status === "Reconciled"
                        ? "bg-green-600 text-white"
                        : "bg-yellow-500 text-white"
                    }
                  >
                    {e.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="upi.dialog">
          <DialogHeader>
            <DialogTitle className="text-sm">Add UPI Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <Input
                  type="date"
                  className="h-7 text-xs mt-1"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  data-ocid="upi.input"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">UTR Number</p>
                <Input
                  className="h-7 text-xs mt-1"
                  placeholder="308010..."
                  value={form.utr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, utr: e.target.value }))
                  }
                  data-ocid="upi.input"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Party Name</p>
              <Input
                className="h-7 text-xs mt-1"
                placeholder="Customer/Vendor name"
                value={form.party}
                onChange={(e) =>
                  setForm((f) => ({ ...f, party: e.target.value }))
                }
                data-ocid="upi.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Amount (₹)</p>
                <Input
                  type="number"
                  className="h-7 text-xs mt-1"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  data-ocid="upi.input"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as UPIStatus }))
                  }
                >
                  <SelectTrigger
                    className="h-7 text-xs mt-1"
                    data-ocid="upi.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Reconciled">Reconciled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setOpen(false)}
                data-ocid="upi.cancel_button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-teal-600 hover:bg-teal-700"
                onClick={addEntry}
                data-ocid="upi.submit_button"
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
