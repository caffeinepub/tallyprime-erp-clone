import { Badge } from "@/components/ui/badge";
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  code: string;
  description: string;
  rate: number;
  hsnSac: string;
  gstRate: number;
  type: string;
}

function load(): Service[] {
  return JSON.parse(localStorage.getItem("hk_services") || "[]");
}

const TYPES = ["Labour", "AMC", "Repair", "Consultation"];

export default function ServiceMaster() {
  const [services, setServices] = useState<Service[]>(load);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    rate: "",
    hsnSac: "",
    gstRate: "18",
    type: "Labour",
  });

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Service name required");
      return;
    }
    let updated: Service[];
    if (editId) {
      updated = services.map((s) =>
        s.id === editId
          ? {
              ...s,
              ...form,
              rate: Number.parseFloat(form.rate) || 0,
              gstRate: Number.parseFloat(form.gstRate) || 0,
            }
          : s,
      );
      toast.success("Service updated");
    } else {
      const s: Service = {
        ...form,
        id: Date.now().toString(),
        rate: Number.parseFloat(form.rate) || 0,
        gstRate: Number.parseFloat(form.gstRate) || 0,
      };
      updated = [...services, s];
      toast.success("Service created");
    }
    setServices(updated);
    localStorage.setItem("hk_services", JSON.stringify(updated));
    setForm({
      name: "",
      code: "",
      description: "",
      rate: "",
      hsnSac: "",
      gstRate: "18",
      type: "Labour",
    });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (s: Service) => {
    setForm({
      name: s.name,
      code: s.code,
      description: s.description,
      rate: String(s.rate),
      hsnSac: s.hsnSac,
      gstRate: String(s.gstRate),
      type: s.type,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Service Master</h2>
          <p className="text-xs text-muted-foreground">
            {services.length} services
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 text-xs bg-teal hover:bg-teal/80 text-primary-foreground"
          onClick={() => {
            setForm({
              name: "",
              code: "",
              description: "",
              rate: "",
              hsnSac: "",
              gstRate: "18",
              type: "Labour",
            });
            setEditId(null);
            setShowForm(!showForm);
          }}
          data-ocid="service.open_modal_button"
        >
          <Plus size={12} className="mr-1" />
          {showForm ? "Cancel" : "New Service"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">
              {editId ? "Edit" : "Create"} Service
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Service Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="h-8 text-xs"
                  data-ocid="service.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, code: e.target.value }))
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rate (₹)</Label>
                <Input
                  type="number"
                  value={form.rate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rate: e.target.value }))
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">HSN / SAC Code</Label>
                <Input
                  value={form.hsnSac}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, hsnSac: e.target.value }))
                  }
                  className="h-8 text-xs"
                  placeholder="998314"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">GST Rate (%)</Label>
                <Select
                  value={form.gstRate}
                  onValueChange={(v) => setForm((p) => ({ ...p, gstRate: v }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["0", "5", "12", "18", "28"].map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {r}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={save}
                className="h-8 text-xs bg-teal hover:bg-teal/80 text-primary-foreground"
                data-ocid="service.submit_button"
              >
                {editId ? "Update" : "Create"}
              </Button>
              <Button
                variant="outline"
                className="h-8 text-xs"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                data-ocid="service.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground text-sm"
              data-ocid="service.empty_state"
            >
              No services created yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {["Code", "Name", "Type", "Rate", "GST", "HSN/SAC", ""].map(
                      (h) => (
                        <TableHead key={h} className="text-xs">
                          {h}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((s, i) => (
                    <TableRow
                      key={s.id}
                      className="border-border text-xs"
                      data-ocid={`service.item.${i + 1}`}
                    >
                      <TableCell className="font-mono">{s.code}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {s.type}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{s.rate.toLocaleString("en-IN")}</TableCell>
                      <TableCell>{s.gstRate}%</TableCell>
                      <TableCell className="font-mono">
                        {s.hsnSac || "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => startEdit(s)}
                          data-ocid={`service.edit_button.${i + 1}`}
                        >
                          Edit
                        </Button>
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
