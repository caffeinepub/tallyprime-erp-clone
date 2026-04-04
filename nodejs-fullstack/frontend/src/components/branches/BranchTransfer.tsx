import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useState } from "react";
import { toast } from "sonner";

interface Branch {
  id: string;
  name: string;
}
interface Transfer {
  id: string;
  fromBranch: string;
  toBranch: string;
  transferType: string;
  itemOrAmount: string;
  narration: string;
  date: string;
}

function loadBranches(): Branch[] {
  return JSON.parse(localStorage.getItem("hk_branches") || "[]");
}
function loadTransfers(): Transfer[] {
  return JSON.parse(localStorage.getItem("hk_branch_transfers") || "[]");
}

export default function BranchTransfer() {
  const branches = loadBranches();
  const [transfers, setTransfers] = useState<Transfer[]>(loadTransfers);
  const [form, setForm] = useState({
    fromBranch: "",
    toBranch: "",
    transferType: "Stock",
    itemOrAmount: "",
    narration: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const save = () => {
    if (!form.fromBranch || !form.toBranch) {
      toast.error("Select both branches");
      return;
    }
    if (form.fromBranch === form.toBranch) {
      toast.error("From and To branches must differ");
      return;
    }
    if (!form.itemOrAmount.trim()) {
      toast.error("Enter item/amount");
      return;
    }
    const newT: Transfer = { ...form, id: Date.now().toString() };
    const updated = [newT, ...transfers];
    setTransfers(updated);
    localStorage.setItem("hk_branch_transfers", JSON.stringify(updated));
    toast.success("Branch transfer recorded");
    setForm({
      fromBranch: "",
      toBranch: "",
      transferType: "Stock",
      itemOrAmount: "",
      narration: "",
      date: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold">Branch Transfer</h2>
        <p className="text-xs text-muted-foreground">
          Inter-branch stock and fund transfers
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">New Transfer</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">From Branch *</Label>
              <Select
                value={form.fromBranch}
                onValueChange={(v) => setForm((p) => ({ ...p, fromBranch: v }))}
              >
                <SelectTrigger
                  className="h-8 text-xs"
                  data-ocid="branch-transfer.select"
                >
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.name} className="text-xs">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To Branch *</Label>
              <Select
                value={form.toBranch}
                onValueChange={(v) => setForm((p) => ({ ...p, toBranch: v }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.name} className="text-xs">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Transfer Type</Label>
              <Select
                value={form.transferType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, transferType: v }))
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stock" className="text-xs">
                    Stock
                  </SelectItem>
                  <SelectItem value="Funds" className="text-xs">
                    Funds
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                {form.transferType === "Funds"
                  ? "Amount (₹)"
                  : "Item / Quantity"}{" "}
                *
              </Label>
              <Input
                value={form.itemOrAmount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, itemOrAmount: e.target.value }))
                }
                className="h-8 text-xs"
                placeholder={
                  form.transferType === "Funds" ? "5000" : "Rice 50kg"
                }
                data-ocid="branch-transfer.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Narration</Label>
              <Input
                value={form.narration}
                onChange={(e) =>
                  setForm((p) => ({ ...p, narration: e.target.value }))
                }
                className="h-8 text-xs"
                placeholder="Optional note"
              />
            </div>
          </div>
          <Button
            onClick={save}
            className="mt-3 h-8 text-xs bg-teal hover:bg-teal/80 text-primary-foreground"
            data-ocid="branch-transfer.submit_button"
          >
            Record Transfer
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Transfer History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transfers.length === 0 ? (
            <div
              className="p-6 text-center text-muted-foreground text-sm"
              data-ocid="branch-transfer.empty_state"
            >
              No transfers recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {[
                      "Date",
                      "From",
                      "To",
                      "Type",
                      "Item/Amount",
                      "Narration",
                    ].map((h) => (
                      <TableHead key={h} className="text-xs">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t, i) => (
                    <TableRow
                      key={t.id}
                      className="border-border text-xs"
                      data-ocid={`branch-transfer.item.${i + 1}`}
                    >
                      <TableCell>{t.date}</TableCell>
                      <TableCell>{t.fromBranch}</TableCell>
                      <TableCell>{t.toBranch}</TableCell>
                      <TableCell>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${t.transferType === "Funds" ? "bg-blue-900 text-blue-300" : "bg-orange-900 text-orange-300"}`}
                        >
                          {t.transferType}
                        </span>
                      </TableCell>
                      <TableCell>{t.itemOrAmount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.narration || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
