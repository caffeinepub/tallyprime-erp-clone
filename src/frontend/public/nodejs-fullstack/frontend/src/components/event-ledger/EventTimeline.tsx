import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  CheckCircle2,
  Edit3,
  Eye,
  GitBranch,
  RotateCcw,
  Undo2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { loadEvents } from "./EventLog";

type EventData = {
  id: string;
  eventType: string;
  entity: string;
  amount: number;
  user: string;
  timestamp: string;
  description?: string;
  status?: string;
};

// Demo events shown when no real events have been added
const DEMO_EVENTS: EventData[] = [
  {
    id: "EVT-001",
    eventType: "VoucherCreated",
    entity: "Sales Entry #2024-001",
    amount: 118000,
    user: "admin",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    description: "Sales to Reliance Industries — GST 18%",
    status: "Active",
  },
  {
    id: "EVT-002",
    eventType: "VoucherCreated",
    entity: "Payment Entry #2024-042",
    amount: 45000,
    user: "admin",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    description: "Vendor payment — Office Supplies",
    status: "Active",
  },
  {
    id: "EVT-003",
    eventType: "VoucherModified",
    entity: "Purchase Entry #2024-018",
    amount: 82500,
    user: "accountant1",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    description: "Amended: GST rate corrected from 12% to 18%",
    status: "Active",
  },
  {
    id: "EVT-004",
    eventType: "VoucherCancelled",
    entity: "Journal Entry #2024-007",
    amount: 15000,
    user: "admin",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: "Duplicate entry — cancelled by admin",
    status: "Reversed",
  },
  {
    id: "EVT-005",
    eventType: "VoucherCreated",
    entity: "Receipt Entry #2024-031",
    amount: 200000,
    user: "accountant1",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    description: "Customer advance received — Tata Projects",
    status: "Active",
  },
];

const TYPE_CONFIG = {
  VoucherCreated: {
    color: "border-green-500 bg-green-900/20",
    badge: "bg-green-700 text-white",
    icon: CheckCircle2,
    iconColor: "text-green-400",
  },
  VoucherModified: {
    color: "border-blue-500 bg-blue-900/20",
    badge: "bg-blue-700 text-white",
    icon: Edit3,
    iconColor: "text-blue-400",
  },
  VoucherCancelled: {
    color: "border-orange-500 bg-orange-900/20",
    badge: "bg-orange-700 text-white",
    icon: XCircle,
    iconColor: "text-orange-400",
  },
  Compensating: {
    color: "border-red-500 bg-red-900/20",
    badge: "bg-red-700 text-white",
    icon: RotateCcw,
    iconColor: "text-red-400",
  },
};

function EventDetailPanel({
  ev,
  onClose,
}: { ev: EventData; onClose: () => void }) {
  const cfg =
    TYPE_CONFIG[ev.eventType as keyof typeof TYPE_CONFIG] ||
    TYPE_CONFIG.VoucherCreated;
  const Icon = cfg.icon;

  const handleAction = (action: string) => {
    toast.info(`${action} triggered for event ${ev.id}`);
  };

  return (
    <div className="w-80 flex-shrink-0 border-l border-border bg-card flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-1.5">
          <Icon size={13} className={cfg.iconColor} />
          <span className="text-[11px] font-semibold text-foreground">
            Event Detail
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          data-ocid="event_timeline.detail.close_button"
          className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground rounded"
        >
          <X size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* Badge row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-[10px] ${cfg.badge}`}>{ev.eventType}</Badge>
          <Badge variant="outline" className="text-[10px]">
            {ev.entity}
          </Badge>
          {ev.status === "Reversed" && (
            <Badge className="bg-gray-600 text-white text-[10px]">
              Reversed
            </Badge>
          )}
        </div>

        {/* Details grid */}
        <div className="space-y-2">
          {[
            { label: "Event ID", value: ev.id, mono: true },
            { label: "Type", value: ev.eventType },
            { label: "Entity", value: ev.entity },
            {
              label: "Amount",
              value: `₹${ev.amount.toLocaleString("en-IN")}`,
              mono: true,
            },
            { label: "User", value: ev.user },
            {
              label: "Timestamp",
              value: new Date(ev.timestamp).toLocaleString("en-IN"),
            },
            { label: "Status", value: ev.status || "Active" },
            { label: "Description", value: ev.description || "—" },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                {label}
              </span>
              <span
                className={`text-[11px] text-foreground ${mono ? "font-mono" : ""}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Actions */}
        <div className="space-y-1.5">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
            Actions
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-[10px] h-7 justify-start gap-2"
            onClick={() => handleAction("View Entry")}
            data-ocid="event_timeline.detail.view_voucher_button"
          >
            <Eye size={11} className="text-teal" />
            View Entry
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-[10px] h-7 justify-start gap-2"
            onClick={() => handleAction("Replay Event")}
            data-ocid="event_timeline.detail.replay_button"
          >
            <RotateCcw size={11} className="text-blue-400" />
            Replay Event
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-[10px] h-7 justify-start gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => handleAction("Undo This Event")}
            data-ocid="event_timeline.detail.undo_button"
          >
            <Undo2 size={11} />
            Undo This Event
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EventTimeline() {
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const storedEvents = loadEvents();
  // Use demo events as fallback when no real events have been logged yet
  const allEvents: EventData[] =
    storedEvents.length > 0 ? storedEvents : DEMO_EVENTS;

  const entities = Array.from(new Set(allEvents.map((e) => e.entity))).sort();

  const displayed = allEvents
    .filter((e) => {
      if (selectedEntity && e.entity !== selectedEntity) return false;
      if (
        search &&
        !e.entity.toLowerCase().includes(search.toLowerCase()) &&
        !e.id.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const handleExport = () => {
    const text = displayed
      .map((e) => {
        const desc = e.description ? ` | ${e.description}` : "";
        return `[${new Date(e.timestamp).toLocaleString("en-IN")}] ${e.id} | ${e.eventType} | ${e.entity} | ₹${e.amount.toLocaleString("en-IN")} | ${e.user}${desc}`;
      })
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Timeline copied to clipboard");
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Timeline Panel */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-semibold text-foreground">
              Event Timeline
            </h2>
            {selectedEvent && (
              <Badge
                variant="outline"
                className="text-[10px] text-teal border-teal/40"
              >
                1 selected
              </Badge>
            )}
            {storedEvents.length === 0 && (
              <Badge
                variant="outline"
                className="text-[10px] text-muted-foreground border-border/50"
              >
                Demo data — add events from Event Log
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleExport}
            variant="outline"
            className="text-xs h-8"
          >
            Export Timeline
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Search Entity / ID</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs w-52"
              placeholder="e.g. Sales #001"
              data-ocid="event_timeline.search_input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Filter by Entity</Label>
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-52 h-8 text-xs">
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Entities</SelectItem>
                {entities.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {displayed.length === 0 ? (
          <p
            className="text-xs text-muted-foreground text-center py-8"
            data-ocid="event_timeline.empty_state"
          >
            No events found matching your filter.
          </p>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-3">
              {displayed.map((ev) => {
                const cfg =
                  TYPE_CONFIG[ev.eventType as keyof typeof TYPE_CONFIG] ||
                  TYPE_CONFIG.VoucherCreated;
                const Icon = cfg.icon;
                const isSelected = selectedEvent?.id === ev.id;
                return (
                  <div key={ev.id} className="relative">
                    <div
                      className="absolute -left-4 w-3 h-3 rounded-full bg-teal-500 border-2 border-background"
                      style={{ top: "10px" }}
                    />
                    <Card
                      className={`border-l-4 ${cfg.color} bg-card cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "ring-2 ring-teal/60 shadow-md"
                          : "hover:ring-1 hover:ring-teal/30"
                      }`}
                      onClick={() =>
                        setSelectedEvent(isSelected ? null : (ev as EventData))
                      }
                      data-ocid={`event_timeline.item.${ev.id}`}
                    >
                      <CardContent className="py-2 px-3 flex items-start gap-3">
                        <Icon
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.iconColor}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground">
                              {ev.id}
                            </span>
                            <Badge className={`text-xs ${cfg.badge}`}>
                              {ev.eventType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {ev.entity}
                            </Badge>
                            {ev.status === "Reversed" && (
                              <Badge className="bg-gray-600 text-white text-xs">
                                Reversed
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs mt-0.5">
                            {ev.description || "—"}
                          </p>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>
                              {new Date(ev.timestamp).toLocaleString("en-IN")}
                            </span>
                            <span>By: {ev.user}</span>
                            <span className="font-mono">
                              ₹{ev.amount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-teal mt-1" />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedEvent && (
        <EventDetailPanel
          ev={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
