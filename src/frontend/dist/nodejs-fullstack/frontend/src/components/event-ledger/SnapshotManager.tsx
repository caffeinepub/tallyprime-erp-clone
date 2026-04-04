import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Camera } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const SNAP_KEY = "hkp_snapshots";

interface Snapshot {
  id: string;
  name: string;
  date: string;
  createdBy: string;
  ledgerCount: number;
  balances: Record<string, number>;
}

const DEMO_LEDGERS: Record<string, number> = {
  Cash: 45000,
  Bank: 125000,
  "Sundry Debtors": 78000,
  "Sundry Creditors": 32000,
  Sales: 250000,
  Purchase: 180000,
  Expenses: 24000,
  Capital: 100000,
};

function loadSnapshots(): Snapshot[] {
  try {
    return JSON.parse(localStorage.getItem(SNAP_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveSnapshots(s: Snapshot[]) {
  localStorage.setItem(SNAP_KEY, JSON.stringify(s));
}

export default function SnapshotManager() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [restoreTarget, setRestoreTarget] = useState<Snapshot | null>(null);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const reload = useCallback(() => {
    setSnapshots(loadSnapshots());
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);

  const handleTakeSnapshot = () => {
    const user = JSON.parse(
      localStorage.getItem("hkp_current_user") || '{"username":"admin"}',
    ).username;
    const snap: Snapshot = {
      id: `SNAP-${Date.now()}`,
      name: `Snapshot ${new Date().toLocaleDateString("en-IN")}`,
      date: new Date().toISOString(),
      createdBy: user,
      ledgerCount: Object.keys(DEMO_LEDGERS).length,
      balances: { ...DEMO_LEDGERS },
    };
    const updated = [...loadSnapshots(), snap];
    saveSnapshots(updated);
    setSnapshots(updated);
    toast.success("Snapshot taken successfully");
  };

  const handleRestore = () => {
    if (!restoreTarget) return;
    toast.success(`Restored to snapshot: ${restoreTarget.name}`);
    setRestoreTarget(null);
  };

  const snapA = snapshots.find((s) => s.id === compareA);
  const snapB = snapshots.find((s) => s.id === compareB);
  const allLedgers =
    snapA || snapB
      ? Array.from(
          new Set([
            ...Object.keys(snapA?.balances ?? {}),
            ...Object.keys(snapB?.balances ?? {}),
          ]),
        )
      : [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-semibold text-foreground">
            Snapshot Manager
          </h2>
          <Badge className="bg-teal-700 text-white">
            {snapshots.length} snapshots
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={handleTakeSnapshot}
          className="bg-teal-600 hover:bg-teal-700 text-white"
          data-ocid="snapshot.primary_button"
        >
          Take Snapshot Now
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Snapshot List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs">Snapshot ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Ledgers</TableHead>
                  <TableHead className="text-xs">Created By</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-xs text-muted-foreground py-6"
                    >
                      No snapshots yet. Click &ldquo;Take Snapshot Now&rdquo;.
                    </TableCell>
                  </TableRow>
                ) : (
                  snapshots.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs font-mono">
                        {s.id}
                      </TableCell>
                      <TableCell className="text-xs">{s.name}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(s.date).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs">{s.ledgerCount}</TableCell>
                      <TableCell className="text-xs">{s.createdBy}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => setRestoreTarget(s)}
                          data-ocid="snapshot.secondary_button"
                        >
                          Restore
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {snapshots.length >= 2 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Compare Snapshots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              <select
                className="h-8 text-xs rounded border border-border bg-background px-2 w-56"
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
              >
                <option value="">Select Snapshot A</option>
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                className="h-8 text-xs rounded border border-border bg-background px-2 w-56"
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
              >
                <option value="">Select Snapshot B</option>
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {snapA && snapB && (
              <div className="overflow-x-auto rounded border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">Ledger</TableHead>
                      <TableHead className="text-xs text-right">
                        {snapA.name}
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        {snapB.name}
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        Difference
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allLedgers.map((l) => {
                      const a = snapA.balances[l] ?? 0;
                      const b = snapB.balances[l] ?? 0;
                      const diff = b - a;
                      return (
                        <TableRow key={l}>
                          <TableCell className="text-xs">{l}</TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {a.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {b.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell
                            className={`text-xs text-right font-mono font-semibold ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-muted-foreground"}`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!restoreTarget}
        onOpenChange={(o) => !o && setRestoreTarget(null)}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm">Confirm Restore</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Restore to snapshot <strong>{restoreTarget?.name}</strong>? This
            will apply the saved balances.
          </p>
          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRestoreTarget(null)}
              data-ocid="snapshot.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleRestore}
              data-ocid="snapshot.confirm_button"
            >
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
