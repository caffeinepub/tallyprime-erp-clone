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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle, Edit, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AMCEntry = {
  id: string;
  assetName: string;
  vendor: string;
  amcStart: string;
  amcEnd: string;
  warrantyExpiry: string;
  annualCost: number;
  contact: string;
  notes: string;
};

const EMPTY: Omit<AMCEntry, "id"> = {
  assetName: "",
  vendor: "",
  amcStart: "",
  amcEnd: "",
  warrantyExpiry: "",
  annualCost: 0,
  contact: "",
  notes: "",
};

function getStatus(
  amcEnd: string,
  warrantyExpiry: string,
): {
  label: string;
  variant: "destructive" | "default" | "secondary";
  icon: React.ReactNode;
} {
  const today = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  const end = amcEnd ? new Date(amcEnd) : null;
  const warr = warrantyExpiry ? new Date(warrantyExpiry) : null;
  const expiry = end && warr ? (end < warr ? end : warr) : end || warr;

  if (!expiry)
    return {
      label: "Unknown",
      variant: "secondary",
      icon: <AlertCircle size={10} />,
    };
  if (expiry < today)
    return {
      label: "EXPIRED",
      variant: "destructive",
      icon: <XCircle size={10} />,
    };
  if (expiry <= soon)
    return {
      label: "EXPIRING SOON",
      variant: "default",
      icon: <AlertCircle size={10} className="text-orange-400" />,
    };
  return {
    label: "OK",
    variant: "secondary",
    icon: <CheckCircle size={10} className="text-green-500" />,
  };
}

export default function AMCTracker() {
  const [entries, setEntries] = useState<AMCEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_amc") || "[]");
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AMCEntry | null>(null);
  const [form, setForm] = useState<Omit<AMCEntry, "id">>(EMPTY);

  const save = (data: AMCEntry[]) => {
    setEntries(data);
    localStorage.setItem("hk_amc", JSON.stringify(data));
  };

  const handleSubmit = () => {
    if (!form.assetName.trim()) {
      toast.error("Asset name required");
      return;
    }
    if (editing) {
      save(
        entries.map((e) => (e.id === editing.id ? { ...editing, ...form } : e)),
      );
      toast.success("AMC entry updated");
    } else {
      save([...entries, { id: Date.now().toString(), ...form }]);
      toast.success("AMC entry added");
    }
    setOpen(false);
    setEditing(null);
    setForm(EMPTY);
  };

  const expired = entries.filter((e) => {
    const s = getStatus(e.amcEnd, e.warrantyExpiry);
    return s.label === "EXPIRED";
  }).length;

  const expiringSoon = entries.filter((e) => {
    const s = getStatus(e.amcEnd, e.warrantyExpiry);
    return s.label === "EXPIRING SOON";
  }).length;

  return (
    <div className="p-4 space-y-3" data-ocid="amc_tracker.section">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground">
            AMC / Warranty Tracker
          </h2>
          {expired > 0 && (
            <Badge variant="destructive" className="text-[9px]">
              {expired} Expired
            </Badge>
          )}
          {expiringSoon > 0 && (
            <Badge className="text-[9px] bg-orange-500">
              {expiringSoon} Expiring Soon
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
              data-ocid="amc_tracker.add.button"
            >
              <Plus size={11} /> Add AMC
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm">
                {editing ? "Edit" : "Add"} AMC/Warranty
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Asset Name *</Label>
                <Input
                  value={form.assetName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, assetName: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                  data-ocid="amc_tracker.asset_name.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Vendor</Label>
                <Input
                  value={form.vendor}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, vendor: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                  data-ocid="amc_tracker.vendor.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Contact</Label>
                <Input
                  value={form.contact}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contact: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                  data-ocid="amc_tracker.contact.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">AMC Start</Label>
                <Input
                  type="date"
                  value={form.amcStart}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amcStart: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">AMC End</Label>
                <Input
                  type="date"
                  value={form.amcEnd}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amcEnd: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Warranty Expiry</Label>
                <Input
                  type="date"
                  value={form.warrantyExpiry}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, warrantyExpiry: e.target.value }))
                  }
                  className="h-7 text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Annual Cost (₹)</Label>
                <Input
                  type="number"
                  value={form.annualCost}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      annualCost: Number(e.target.value),
                    }))
                  }
                  className="h-7 text-[11px]"
                  data-ocid="amc_tracker.cost.input"
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
                data-ocid="amc_tracker.cancel.button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-[11px]"
                onClick={handleSubmit}
                data-ocid="amc_tracker.save.button"
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
            {entries.length} AMC/Warranty Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px]">
                  <TableHead>Asset</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>AMC End</TableHead>
                  <TableHead>Warranty Expiry</TableHead>
                  <TableHead className="text-right">Annual Cost</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-[10px] text-muted-foreground py-6"
                      data-ocid="amc_tracker.empty_state"
                    >
                      No AMC/Warranty entries. Add your first one.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((e, i) => {
                    const status = getStatus(e.amcEnd, e.warrantyExpiry);
                    return (
                      <TableRow
                        key={e.id}
                        className="text-[10px]"
                        data-ocid={`amc_tracker.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">
                          {e.assetName}
                        </TableCell>
                        <TableCell>{e.vendor || "—"}</TableCell>
                        <TableCell>{e.amcEnd || "—"}</TableCell>
                        <TableCell>{e.warrantyExpiry || "—"}</TableCell>
                        <TableCell className="text-right font-mono">
                          {e.annualCost
                            ? e.annualCost.toLocaleString("en-IN")
                            : "—"}
                        </TableCell>
                        <TableCell>{e.contact || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={status.variant}
                            className="text-[9px] flex items-center gap-0.5 w-fit"
                          >
                            {status.icon}
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setEditing(e);
                              const { id, ...r } = e;
                              setForm(r);
                              setOpen(true);
                            }}
                            data-ocid={`amc_tracker.edit.${i + 1}`}
                          >
                            <Edit size={10} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
