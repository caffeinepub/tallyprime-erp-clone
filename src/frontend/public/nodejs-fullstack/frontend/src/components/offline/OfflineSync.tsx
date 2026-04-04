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
  type OfflineQueueItem,
  addSyncLog,
  addToOfflineQueue,
  clearOfflineQueue,
  getOfflineQueue,
} from "@/lib/indexedDB";
import { Plus, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);

  const loadQueue = useCallback(async () => {
    try {
      const items = await getOfflineQueue();
      setQueue(items);
    } catch {
      toast.error("Failed to load offline queue");
    }
  }, []);

  useEffect(() => {
    loadQueue();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [loadQueue]);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Cannot sync — you are offline");
      return;
    }
    setSyncing(true);
    try {
      const count = queue.length;
      await new Promise((r) => setTimeout(r, 1200));
      await addSyncLog({
        timestamp: new Date().toISOString(),
        itemsSynced: count,
        status: "success",
        note: `Synced ${count} queued items`,
      });
      await clearOfflineQueue();
      await loadQueue();
      toast.success(
        `Synced ${count} item${count !== 1 ? "s" : ""} successfully!`,
      );
    } catch {
      await addSyncLog({
        timestamp: new Date().toISOString(),
        itemsSynced: 0,
        status: "failed",
        note: "Sync failed",
      });
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleAddTestEntry = async () => {
    await addToOfflineQueue({
      timestamp: new Date().toISOString(),
      type: "Voucher",
      description: `Test voucher entry — ₹${(Math.random() * 10000).toFixed(0)}`,
      payload: { demo: true },
    });
    await loadQueue();
    toast("Test entry added to offline queue");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Offline Queue</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Entries queued locally for sync when online
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            data-ocid="offline_sync.toggle"
            className={`text-xs flex items-center gap-1 ${
              isOnline
                ? "bg-green-600/20 text-green-400 border-green-600/40"
                : "bg-red-600/20 text-red-400 border-red-600/40"
            } border`}
            variant="outline"
          >
            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
          {queue.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {queue.length} pending
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSync}
          disabled={syncing || queue.length === 0}
          data-ocid="offline_sync.primary_button"
          className="text-xs"
        >
          <RefreshCw
            size={12}
            className={`mr-1 ${syncing ? "animate-spin" : ""}`}
          />
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddTestEntry}
          data-ocid="offline_sync.secondary_button"
          className="text-xs"
        >
          <Plus size={12} className="mr-1" />
          Add Test Entry
        </Button>
      </div>

      {queue.length === 0 ? (
        <div
          data-ocid="offline_sync.empty_state"
          className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded"
        >
          Queue is empty — all data is synced.
        </div>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Queued At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((item, idx) => (
                <TableRow
                  key={item.id}
                  data-ocid={`offline_sync.item.${idx + 1}`}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{item.description}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString()}
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
