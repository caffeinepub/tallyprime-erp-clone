import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type SyncLogItem, getSyncHistory } from "@/lib/indexedDB";
import { RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function SyncHistory() {
  const [history, setHistory] = useState<SyncLogItem[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getSyncHistory();
      setHistory(data);
    } catch {
      toast.error("Failed to load sync history");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClearHistory = async () => {
    try {
      const req = indexedDB.open("hisabkitab_db");
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("sync_history", "readwrite");
        tx.objectStore("sync_history").clear();
        tx.oncomplete = async () => {
          await load();
          toast.success("Sync history cleared");
        };
      };
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const filtered = history.filter((h) => {
    if (fromDate && new Date(h.timestamp) < new Date(fromDate)) return false;
    if (toDate && new Date(h.timestamp) > new Date(`${toDate}T23:59:59`))
      return false;
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Sync History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record of all sync events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            data-ocid="sync_history.secondary_button"
            className="text-xs"
          >
            <RefreshCw size={12} className="mr-1" />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearHistory}
            data-ocid="sync_history.delete_button"
            className="text-xs"
          >
            <Trash2 size={12} className="mr-1" />
            Clear History
          </Button>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-xs text-muted-foreground">From:</span>
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="h-7 text-xs w-36"
          data-ocid="sync_history.input"
        />
        <span className="text-xs text-muted-foreground">To:</span>
        <Input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="h-7 text-xs w-36"
          data-ocid="sync_history.search_input"
        />
        {(fromDate || toDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="text-xs h-7"
          >
            Clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="sync_history.empty_state"
          className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded"
        >
          No sync history found.
        </div>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs">Date &amp; Time</TableHead>
                <TableHead className="text-xs">Items Synced</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, idx) => (
                <TableRow
                  key={item.id}
                  data-ocid={`sync_history.item.${idx + 1}`}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(item.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-medium numeric">
                    {item.itemsSynced}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "success" ? "default" : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.note ?? "—"}
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
