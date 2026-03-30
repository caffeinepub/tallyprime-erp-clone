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
  GitBranch,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { loadEvents } from "./EventLog";

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

export default function EventTimeline() {
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");

  const allEvents = loadEvents();
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
        return `[${new Date(e.timestamp).toLocaleString("en-IN")}] ${e.id} | ${e.eventType} | ${e.entity} | \u20b9${e.amount.toLocaleString("en-IN")} | ${e.user}${desc}`;
      })
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Timeline copied to clipboard");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-semibold text-foreground">
            Event Timeline
          </h2>
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
        <p className="text-xs text-muted-foreground text-center py-8">
          No events found. Add sample events from Event Log.
        </p>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-3">
            {displayed.map((ev) => {
              const cfg =
                TYPE_CONFIG[ev.eventType] || TYPE_CONFIG.VoucherCreated;
              const Icon = cfg.icon;
              return (
                <div key={ev.id} className="relative">
                  <div
                    className="absolute -left-4 w-3 h-3 rounded-full bg-teal-500 border-2 border-background"
                    style={{ top: "10px" }}
                  />
                  <Card className={`border-l-4 ${cfg.color} bg-card`}>
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
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
