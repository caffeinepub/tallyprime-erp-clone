import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

const ENTITIES = ["Voucher", "Ledger", "Customer", "Vendor"];
const FIELD_TYPES = ["Text", "Number", "Date", "Dropdown"];

type Field = {
  id: number;
  name: string;
  type: string;
  required: boolean;
  active: boolean;
};

const DEMO_FIELDS: Record<string, Field[]> = {
  Voucher: [
    {
      id: 1,
      name: "PO Reference",
      type: "Text",
      required: false,
      active: true,
    },
    {
      id: 2,
      name: "Delivery Date",
      type: "Date",
      required: true,
      active: true,
    },
    {
      id: 3,
      name: "Approval Level",
      type: "Dropdown",
      required: false,
      active: false,
    },
  ],
  Ledger: [
    {
      id: 4,
      name: "Account Manager",
      type: "Text",
      required: false,
      active: true,
    },
    {
      id: 5,
      name: "Credit Score",
      type: "Number",
      required: false,
      active: true,
    },
  ],
  Customer: [
    {
      id: 6,
      name: "Customer Category",
      type: "Dropdown",
      required: true,
      active: true,
    },
    {
      id: 7,
      name: "Onboarding Date",
      type: "Date",
      required: false,
      active: true,
    },
  ],
  Vendor: [
    {
      id: 8,
      name: "Vendor Rating",
      type: "Number",
      required: false,
      active: true,
    },
  ],
};

export default function CustomFields() {
  const [entity, setEntity] = useState("Voucher");
  const [fields, setFields] = useState<Record<string, Field[]>>(DEMO_FIELDS);
  const [open, setOpen] = useState(false);
  const [editField, setEditField] = useState<Field | null>(null);
  const [form, setForm] = useState({ name: "", type: "Text", required: false });

  const current = fields[entity] || [];

  function openAdd() {
    setEditField(null);
    setForm({ name: "", type: "Text", required: false });
    setOpen(true);
  }

  function openEdit(f: Field) {
    setEditField(f);
    setForm({ name: f.name, type: f.type, required: f.required });
    setOpen(true);
  }

  function save() {
    if (!form.name.trim()) return;
    if (editField) {
      setFields((prev) => ({
        ...prev,
        [entity]: prev[entity].map((f) =>
          f.id === editField.id ? { ...f, ...form } : f,
        ),
      }));
    } else {
      setFields((prev) => ({
        ...prev,
        [entity]: [
          ...(prev[entity] || []),
          { id: Date.now(), ...form, active: true },
        ],
      }));
    }
    setOpen(false);
  }

  function deleteField(id: number) {
    setFields((prev) => ({
      ...prev,
      [entity]: prev[entity].filter((f) => f.id !== id),
    }));
  }

  function toggleActive(id: number) {
    setFields((prev) => ({
      ...prev,
      [entity]: prev[entity].map((f) =>
        f.id === id ? { ...f, active: !f.active } : f,
      ),
    }));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-teal-400" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Custom Fields</h1>
            <p className="text-sm text-muted-foreground">
              Manage custom fields per entity type
            </p>
          </div>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
          data-ocid="customfields.open_modal_button"
        >
          <Plus className="h-4 w-4" /> Add Field
        </Button>
      </div>

      <div className="flex gap-2">
        {ENTITIES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEntity(e)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              entity === e
                ? "bg-teal-600 text-white border-teal-600"
                : "border-border text-muted-foreground hover:border-teal-400"
            }`}
            data-ocid="customfields.tab"
          >
            {e} ({(fields[e] || []).length})
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{entity} Custom Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto" data-ocid="customfields.table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {current.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                      data-ocid="customfields.empty_state"
                    >
                      No custom fields for {entity}.
                    </TableCell>
                  </TableRow>
                )}
                {current.map((f, i) => (
                  <TableRow key={f.id} data-ocid={`customfields.item.${i + 1}`}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {f.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={f.required} disabled />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={f.active}
                        onCheckedChange={() => toggleActive(f.id)}
                        data-ocid={`customfields.switch.${i + 1}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(f)}
                          className="h-7 w-7 p-0"
                          data-ocid={`customfields.edit_button.${i + 1}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteField(f.id)}
                          className="h-7 w-7 p-0 text-destructive"
                          data-ocid={`customfields.delete_button.${i + 1}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="customfields.dialog">
          <DialogHeader>
            <DialogTitle>
              {editField ? "Edit Field" : "New Custom Field"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Field Name</Label>
              <Input
                placeholder="e.g. Purchase Order No."
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="customfields.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Field Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                <SelectTrigger data-ocid="customfields.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.required}
                onCheckedChange={(v) => setForm((p) => ({ ...p, required: v }))}
                data-ocid="customfields.switch"
              />
              <Label>Required field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="customfields.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={!form.name.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white"
              data-ocid="customfields.confirm_button"
            >
              {editField ? "Save Changes" : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
