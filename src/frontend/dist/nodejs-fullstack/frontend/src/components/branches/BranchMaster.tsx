import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Building2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  manager: string;
  phone: string;
  createdAt: string;
}

function loadBranches(): Branch[] {
  return JSON.parse(localStorage.getItem("hk_branches") || "[]");
}

const INIT: Omit<Branch, "id" | "createdAt"> = {
  name: "",
  code: "",
  address: "",
  city: "",
  state: "",
  gstin: "",
  manager: "",
  phone: "",
};

export default function BranchMaster() {
  const [branches, setBranches] = useState<Branch[]>(loadBranches);
  const [form, setForm] = useState({ ...INIT });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Branch name is required");
      return;
    }
    let updated: Branch[];
    if (editId) {
      updated = branches.map((b) => (b.id === editId ? { ...b, ...form } : b));
      toast.success("Branch updated");
    } else {
      const newBranch: Branch = {
        ...form,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      updated = [...branches, newBranch];
      toast.success("Branch created");
    }
    setBranches(updated);
    localStorage.setItem("hk_branches", JSON.stringify(updated));
    setForm({ ...INIT });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (b: Branch) => {
    setForm({
      name: b.name,
      code: b.code,
      address: b.address,
      city: b.city,
      state: b.state,
      gstin: b.gstin,
      manager: b.manager,
      phone: b.phone,
    });
    setEditId(b.id);
    setShowForm(true);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Branch Master</h2>
          <p className="text-xs text-muted-foreground">
            {branches.length} branches
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 text-xs bg-teal hover:bg-teal/80 text-primary-foreground"
          onClick={() => {
            setForm({ ...INIT });
            setEditId(null);
            setShowForm(!showForm);
          }}
          data-ocid="branch.open_modal_button"
        >
          <Plus size={12} className="mr-1" />
          {showForm ? "Cancel" : "New Branch"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">
              {editId ? "Edit Branch" : "Create Branch"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ["name", "Branch Name *", "text"],
                  ["code", "Branch Code", "text"],
                  ["address", "Address", "text"],
                  ["city", "City", "text"],
                  ["state", "State", "text"],
                  ["gstin", "GSTIN", "text"],
                  ["manager", "Manager Name", "text"],
                  ["phone", "Phone", "tel"],
                ] as [keyof typeof INIT, string, string][]
              ).map(([field, label, type]) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type={type}
                    value={form[field]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [field]: e.target.value }))
                    }
                    className="h-8 text-xs"
                    data-ocid={`branch.${field === "name" ? "input" : "input"}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={save}
                className="h-8 text-xs bg-teal hover:bg-teal/80 text-primary-foreground"
                data-ocid="branch.submit_button"
              >
                {editId ? "Update" : "Create"} Branch
              </Button>
              <Button
                variant="outline"
                className="h-8 text-xs"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setForm({ ...INIT });
                }}
                data-ocid="branch.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {branches.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground text-sm"
              data-ocid="branch.empty_state"
            >
              No branches created yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {[
                      "Code",
                      "Name",
                      "City",
                      "State",
                      "GSTIN",
                      "Manager",
                      "Phone",
                      "",
                    ].map((h) => (
                      <TableHead key={h} className="text-xs">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((b, i) => (
                    <TableRow
                      key={b.id}
                      className="border-border text-xs"
                      data-ocid={`branch.item.${i + 1}`}
                    >
                      <TableCell className="font-mono">{b.code}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <Building2 size={12} className="text-teal" />
                          {b.name}
                        </div>
                      </TableCell>
                      <TableCell>{b.city}</TableCell>
                      <TableCell>{b.state}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {b.gstin || "—"}
                      </TableCell>
                      <TableCell>{b.manager}</TableCell>
                      <TableCell>{b.phone}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => startEdit(b)}
                          data-ocid={`branch.edit_button.${i + 1}`}
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
