import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FP_KEY = "hkp_field_permissions";

type FieldAccess = "Visible" | "Hidden" | "ReadOnly";

interface FieldPermRow {
  field: string;
  Accountant: FieldAccess;
  Viewer: FieldAccess;
  Manager: FieldAccess;
}

const DEFAULT_PERMS: FieldPermRow[] = [
  {
    field: "Amount",
    Accountant: "Visible",
    Viewer: "ReadOnly",
    Manager: "Visible",
  },
  {
    field: "Narration",
    Accountant: "Visible",
    Viewer: "Hidden",
    Manager: "Visible",
  },
  {
    field: "Date",
    Accountant: "Visible",
    Viewer: "ReadOnly",
    Manager: "Visible",
  },
  {
    field: "Party Name",
    Accountant: "Visible",
    Viewer: "ReadOnly",
    Manager: "Visible",
  },
  {
    field: "Ledger",
    Accountant: "Visible",
    Viewer: "Hidden",
    Manager: "Visible",
  },
  {
    field: "GST Rate",
    Accountant: "Visible",
    Viewer: "Hidden",
    Manager: "Visible",
  },
  {
    field: "Reference No",
    Accountant: "Visible",
    Viewer: "ReadOnly",
    Manager: "Visible",
  },
];

function loadPerms(): FieldPermRow[] {
  try {
    const raw = localStorage.getItem(FP_KEY);
    if (raw) return JSON.parse(raw) as FieldPermRow[];
  } catch {
    /* ignore */
  }
  return DEFAULT_PERMS;
}

const ACCESS_OPTIONS: FieldAccess[] = ["Visible", "ReadOnly", "Hidden"];
const ACCESS_COLORS: Record<FieldAccess, string> = {
  Visible: "bg-green-500/20 text-green-400 border-green-500/40",
  ReadOnly: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  Hidden: "bg-secondary text-muted-foreground border-border",
};

type RoleKey = "Accountant" | "Viewer" | "Manager";

export default function FieldPermissions() {
  const [perms, setPerms] = useState<FieldPermRow[]>(loadPerms);

  const cycle = (rowIdx: number, role: RoleKey) => {
    setPerms((prev) => {
      const next = prev.map((r, i) => {
        if (i !== rowIdx) return r;
        const cur = r[role];
        const nextAccess =
          ACCESS_OPTIONS[
            (ACCESS_OPTIONS.indexOf(cur) + 1) % ACCESS_OPTIONS.length
          ];
        return { ...r, [role]: nextAccess };
      });
      return next;
    });
  };

  const handleSave = () => {
    localStorage.setItem(FP_KEY, JSON.stringify(perms));
    toast.success("Field permissions saved!");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Shield size={16} className="text-teal" />
            Field-Level Permissions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control which voucher fields each role can see or edit. Admin always
            has full access.
          </p>
        </div>
        <Button
          size="sm"
          className="text-xs h-7"
          onClick={handleSave}
          data-ocid="field_perms.save_button"
        >
          Save Changes
        </Button>
      </div>

      <div className="text-[10px] text-muted-foreground flex gap-4 flex-wrap">
        {ACCESS_OPTIONS.map((a) => (
          <span
            key={a}
            className={`px-2 py-0.5 rounded border text-[10px] ${ACCESS_COLORS[a]}`}
          >
            {a}
          </span>
        ))}
        <span className="text-muted-foreground">
          Click a cell to cycle access level. Admin: always Visible.
        </span>
      </div>

      <div
        className="border border-border rounded overflow-hidden"
        data-ocid="field_perms.table"
      >
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="text-xs">Voucher Field</TableHead>
              <TableHead className="text-xs">Accountant</TableHead>
              <TableHead className="text-xs">Viewer</TableHead>
              <TableHead className="text-xs">Manager</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perms.map((row, i) => (
              <TableRow
                key={row.field}
                className="h-9"
                data-ocid={`field_perms.item.${i + 1}`}
              >
                <TableCell className="text-xs font-medium">
                  {row.field}
                </TableCell>
                {(["Accountant", "Viewer", "Manager"] as RoleKey[]).map(
                  (role) => (
                    <TableCell key={role}>
                      <button
                        type="button"
                        onClick={() => cycle(i, role)}
                        data-ocid={`field_perms.${role.toLowerCase()}.${i + 1}.toggle`}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${ACCESS_COLORS[row[role]]}`}
                      >
                        {row[role]}
                      </button>
                    </TableCell>
                  ),
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
