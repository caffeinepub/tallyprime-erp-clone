import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type BackupRecord,
  deleteBackup,
  getBackups,
  saveBackup,
} from "@/lib/indexedDB";
import { Download, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function BackupHistory() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getBackups();
      setBackups(data);
    } catch {
      toast.error("Failed to load backups from IndexedDB");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const snapshot: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) {
          try {
            snapshot[k] = JSON.parse(localStorage.getItem(k) ?? "null");
          } catch {
            snapshot[k] = localStorage.getItem(k);
          }
        }
      }
      await saveBackup(snapshot);
      await load();
      toast.success("Backup created successfully!");
    } catch {
      toast.error("Failed to create backup");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (backup: BackupRecord) => {
    try {
      const snapshot = JSON.parse(backup.data) as Record<string, unknown>;
      for (const [k, v] of Object.entries(snapshot)) {
        localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
      }
      toast.success(
        `Restored backup from ${new Date(backup.timestamp).toLocaleString()}. Please refresh the page.`,
      );
    } catch {
      toast.error("Failed to restore backup");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBackup(id);
      await load();
      toast.success("Backup deleted");
    } catch {
      toast.error("Failed to delete backup");
    }
  };

  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Backup History
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Local backups stored in IndexedDB — {backups.length} backup
            {backups.length !== 1 ? "s" : ""}, {(totalSize / 1024).toFixed(1)}{" "}
            KB total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            data-ocid="backup_history.secondary_button"
            className="text-xs"
          >
            <RefreshCw size={12} className="mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleCreateBackup}
            disabled={loading}
            data-ocid="backup_history.primary_button"
            className="text-xs"
          >
            <Plus size={12} className="mr-1" />
            {loading ? "Creating..." : "Create Backup Now"}
          </Button>
        </div>
      </div>

      {backups.length === 0 ? (
        <div
          data-ocid="backup_history.empty_state"
          className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded"
        >
          No backups yet. Click &quot;Create Backup Now&quot; to save your first
          backup.
        </div>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs">Date &amp; Time</TableHead>
                <TableHead className="text-xs">Label</TableHead>
                <TableHead className="text-xs">Size</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((b, idx) => (
                <TableRow
                  key={b.id}
                  data-ocid={`backup_history.item.${idx + 1}`}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(b.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {b.label}
                  </TableCell>
                  <TableCell className="text-xs">
                    {(b.size / 1024).toFixed(1)} KB
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={b.status === "ok" ? "default" : "destructive"}
                      className="text-[10px]"
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(b)}
                        data-ocid={`backup_history.edit_button.${idx + 1}`}
                        className="text-[10px] h-6 px-2"
                      >
                        <Download size={10} className="mr-1" />
                        Restore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => b.id !== undefined && handleDelete(b.id)}
                        data-ocid={`backup_history.delete_button.${idx + 1}`}
                        className="text-[10px] h-6 px-2"
                      >
                        <Trash2 size={10} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
