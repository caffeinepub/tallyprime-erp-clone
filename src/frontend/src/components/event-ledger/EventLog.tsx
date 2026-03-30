import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface AccountingEvent {
  id: string;
  timestamp: string;
  eventType:
    | "VoucherCreated"
    | "VoucherModified"
    | "VoucherCancelled"
    | "Compensating";
  entity: string;
  user: string;
  amount: number;
  status: "Active" | "Reversed";
  description?: string;
}

const STORAGE_KEY = "hkp_event_log";

const SAMPLE_EVENTS: AccountingEvent[] = [
  {
    id: "EVT-001",
    timestamp: "2026-03-01T09:00:00",
    eventType: "VoucherCreated",
    entity: "Sales #001",
    user: "admin",
    amount: 25000,
    status: "Active",
    description: "Sales to Sharma Traders",
  },
  {
    id: "EVT-002",
    timestamp: "2026-03-01T10:15:00",
    eventType: "VoucherCreated",
    entity: "Purchase #001",
    user: "admin",
    amount: 18500,
    status: "Active",
    description: "Purchase from Gupta Wholesale",
  },
  {
    id: "EVT-003",
    timestamp: "2026-03-02T11:00:00",
    eventType: "VoucherModified",
    entity: "Sales #001",
    user: "admin",
    amount: 26000,
    status: "Active",
    description: "Amount corrected",
  },
  {
    id: "EVT-004",
    timestamp: "2026-03-03T14:30:00",
    eventType: "VoucherCreated",
    entity: "Payment #001",
    user: "cashier",
    amount: 5000,
    status: "Active",
    description: "Cash payment to supplier",
  },
  {
    id: "EVT-005",
    timestamp: "2026-03-04T09:45:00",
    eventType: "VoucherCancelled",
    entity: "Purchase #001",
    user: "admin",
    amount: 18500,
    status: "Active",
    description: "Supplier dispute",
  },
  {
    id: "EVT-006",
    timestamp: "2026-03-05T16:00:00",
    eventType: "VoucherCreated",
    entity: "Receipt #001",
    user: "admin",
    amount: 26000,
    status: "Active",
    description: "Payment received from Sharma",
  },
  {
    id: "EVT-007",
    timestamp: "2026-03-06T10:00:00",
    eventType: "VoucherCreated",
    entity: "Journal #001",
    user: "accountant",
    amount: 1200,
    status: "Active",
    description: "Depreciation entry",
  },
  {
    id: "EVT-008",
    timestamp: "2026-03-07T11:30:00",
    eventType: "Compensating",
    entity: "Sales #001",
    user: "admin",
    amount: 26000,
    status: "Active",
    description: "Reversal of Sales #001",
  },
  {
    id: "EVT-009",
    timestamp: "2026-03-08T14:00:00",
    eventType: "VoucherCreated",
    entity: "Sales #002",
    user: "cashier",
    amount: 45000,
    status: "Active",
    description: "Sales to Mehta Enterprises",
  },
  {
    id: "EVT-010",
    timestamp: "2026-03-09T09:00:00",
    eventType: "VoucherModified",
    entity: "Journal #001",
    user: "accountant",
    amount: 1500,
    status: "Active",
    description: "Depreciation amount updated",
  },
];

const EVENT_TYPE_COLORS: Record<string, string> = {
  VoucherCreated: "bg-green-900/30 text-green-300 border-green-700",
  VoucherModified: "bg-blue-900/30 text-blue-300 border-blue-700",
  VoucherCancelled: "bg-orange-900/30 text-orange-300 border-orange-700",
  Compensating: "bg-red-900/30 text-red-300 border-red-700",
};

export function loadEvents(): AccountingEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEvents(events: AccountingEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export default function EventLog() {
  const [events, setEvents] = useState<AccountingEvent[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterEntity, setFilterEntity] = useState("");

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const handleSeedSamples = () => {
    const existing = loadEvents();
    const ids = new Set(existing.map((e) => e.id));
    const toAdd = SAMPLE_EVENTS.filter((e) => !ids.has(e.id));
    const merged = [...existing, ...toAdd];
    saveEvents(merged);
    setEvents(merged);
    toast.success(`Added ${toAdd.length} sample events`);
  };

  const filtered = events.filter((e) => {
    if (filterType !== "all" && e.eventType !== filterType) return false;
    if (filterFrom && e.timestamp < filterFrom) return false;
    if (filterTo && e.timestamp > `${filterTo}T23:59:59`) return false;
    if (
      filterEntity &&
      !e.entity.toLowerCase().includes(filterEntity.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-semibold text-foreground">Event Log</h2>
          <Badge className="bg-teal-700 text-white">
            {events.length} events
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={handleSeedSamples}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          Add Sample Events
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="VoucherCreated">Voucher Created</SelectItem>
              <SelectItem value="VoucherModified">Voucher Modified</SelectItem>
              <SelectItem value="VoucherCancelled">
                Voucher Cancelled
              </SelectItem>
              <SelectItem value="Compensating">Compensating</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="h-8 text-xs w-36"
          />
          <Input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="h-8 text-xs w-36"
          />
          <Input
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="h-8 text-xs w-44"
            placeholder="Filter by entity..."
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFilterType("all");
              setFilterFrom("");
              setFilterTo("");
              setFilterEntity("");
            }}
            className="h-8 text-xs"
          >
            Clear
          </Button>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs">Event ID</TableHead>
              <TableHead className="text-xs">Timestamp</TableHead>
              <TableHead className="text-xs">Event Type</TableHead>
              <TableHead className="text-xs">Entity</TableHead>
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="text-xs text-right">Amount (₹)</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-xs text-muted-foreground py-8"
                >
                  No events found. Click &ldquo;Add Sample Events&rdquo; to seed
                  demo data.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ev) => (
                <TableRow
                  key={ev.id}
                  className={`${EVENT_TYPE_COLORS[ev.eventType]} border-b border-border/30`}
                >
                  <TableCell className="text-xs font-mono">{ev.id}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(ev.timestamp).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge
                      variant="outline"
                      className={`text-xs ${EVENT_TYPE_COLORS[ev.eventType]}`}
                    >
                      {ev.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{ev.entity}</TableCell>
                  <TableCell className="text-xs">{ev.user}</TableCell>
                  <TableCell className="text-xs text-right font-mono">
                    {ev.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge
                      className={
                        ev.status === "Active"
                          ? "bg-green-700 text-white"
                          : "bg-red-700 text-white"
                      }
                    >
                      {ev.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
