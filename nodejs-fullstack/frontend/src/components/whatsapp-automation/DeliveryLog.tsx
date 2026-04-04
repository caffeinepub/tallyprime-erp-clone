import { Button } from "@/components/ui/button";
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
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type LogEntry = {
  id: string;
  recipient: string;
  phone?: string;
  type: string;
  sentAt: string;
  status: string;
};

const SEED: LogEntry[] = [
  {
    id: "MSG-001",
    recipient: "Rahul Sharma",
    phone: "+91 98765 43210",
    type: "Invoice",
    sentAt: "2026-03-30 10:32",
    status: "Sent",
  },
  {
    id: "MSG-002",
    recipient: "Meera Textiles",
    phone: "+91 87654 32109",
    type: "Reminder",
    sentAt: "2026-03-30 09:15",
    status: "Sent",
  },
  {
    id: "MSG-003",
    recipient: "Patel Stores",
    phone: "+91 65432 10987",
    type: "Ledger Summary",
    sentAt: "2026-03-30 08:50",
    status: "Failed",
  },
  {
    id: "MSG-004",
    recipient: "Om Traders",
    phone: "+91 54321 09876",
    type: "Invoice",
    sentAt: "2026-03-29 16:00",
    status: "Pending",
  },
];

const STATUS_ICON: Record<string, string> = {
  Sent: "✅",
  Pending: "⏳",
  Failed: "❌",
};

export default function DeliveryLog() {
  const [log, setLog] = useState<LogEntry[]>(SEED);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("hk_wa_delivery_log") || "[]",
    );
    if (stored.length > 0) setLog([...SEED, ...stored]);
  }, []);

  const retry = (id: string) => {
    setLog((p) => p.map((l) => (l.id === id ? { ...l, status: "Sent" } : l)));
    toast.success("Message resent successfully");
  };

  const filtered =
    filter === "All" ? log : log.filter((l) => l.status === filter);

  return (
    <div className="p-4 space-y-4" data-ocid="whatsapp.delivery_log.section">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Delivery Log</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger
            className="h-7 text-xs w-32"
            data-ocid="whatsapp.log_filter.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["All", "Sent", "Pending", "Failed"].map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Msg ID</TableHead>
              <TableHead className="text-xs">Recipient</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Sent At</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-xs text-muted-foreground py-8"
                  data-ocid="whatsapp.delivery_log.empty_state"
                >
                  No messages found
                </TableCell>
              </TableRow>
            )}
            {filtered.map((entry, idx) => (
              <TableRow
                key={entry.id}
                data-ocid={`whatsapp.log.item.${idx + 1}`}
              >
                <TableCell className="text-xs font-mono">{entry.id}</TableCell>
                <TableCell className="text-xs">{entry.recipient}</TableCell>
                <TableCell className="text-xs">{entry.type}</TableCell>
                <TableCell className="text-xs">{entry.sentAt}</TableCell>
                <TableCell className="text-xs">
                  {STATUS_ICON[entry.status]} {entry.status}
                </TableCell>
                <TableCell>
                  {entry.status === "Failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={() => retry(entry.id)}
                      data-ocid={`whatsapp.retry.button.${idx + 1}`}
                    >
                      <RefreshCw size={10} className="mr-1" /> Retry
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
