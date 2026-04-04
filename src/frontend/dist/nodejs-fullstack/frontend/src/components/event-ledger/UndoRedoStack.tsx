import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Redo2, Undo2 } from "lucide-react";
import { useState } from "react";

const DEMO_EVENTS = [
  {
    id: 1,
    action: "Create Voucher",
    detail: "Payment ₹15,000 to Rahul Traders",
    user: "admin",
    time: "2024-03-31 14:32",
    before: "Balance: ₹2,10,000",
    after: "Balance: ₹1,95,000",
  },
  {
    id: 2,
    action: "Edit Ledger",
    detail: "Updated credit limit for Sharma Enterprises",
    user: "admin",
    time: "2024-03-31 13:10",
    before: "Limit: ₹50,000",
    after: "Limit: ₹75,000",
  },
  {
    id: 3,
    action: "Create Voucher",
    detail: "Sales Invoice #INV-2024-089 ₹42,000",
    user: "rajesh",
    time: "2024-03-31 11:55",
    before: "Debtors: ₹1,68,000",
    after: "Debtors: ₹2,10,000",
  },
  {
    id: 4,
    action: "Delete Entry",
    detail: "Removed duplicate journal entry JV-0023",
    user: "admin",
    time: "2024-03-30 17:20",
    before: "Entry existed",
    after: "Entry deleted",
  },
  {
    id: 5,
    action: "Create Ledger",
    detail: "New ledger: Office Supplies Expense",
    user: "admin",
    time: "2024-03-30 15:08",
    before: "Not exists",
    after: "Created under Indirect Expenses",
  },
  {
    id: 6,
    action: "Edit Voucher",
    detail: "Updated narration on Receipt #RCT-2024-044",
    user: "priya",
    time: "2024-03-30 12:45",
    before: "Old narration",
    after: "Being amount received from XYZ",
  },
];

export default function UndoRedoStack() {
  const [selected, setSelected] = useState<number[]>([]);
  const [diffEvent, setDiffEvent] = useState<(typeof DEMO_EVENTS)[0] | null>(
    null,
  );
  const [events, setEvents] = useState(DEMO_EVENTS);

  function toggleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function undoLast() {
    if (events.length === 0) return;
    setEvents((prev) => prev.slice(1));
    setSelected([]);
    setDiffEvent(null);
  }

  function redo() {
    setEvents(DEMO_EVENTS);
    setSelected([]);
  }

  function bulkUndo() {
    setEvents((prev) => prev.filter((e) => !selected.includes(e.id)));
    setSelected([]);
    setDiffEvent(null);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Undo2 className="h-6 w-6 text-teal-400" />
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Undo / Redo Stack
          </h1>
          <p className="text-sm text-muted-foreground">
            View, undo, or redo accounting events
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={undoLast}
          variant="outline"
          className="gap-2"
          data-ocid="undoredo.primary_button"
        >
          <Undo2 className="h-4 w-4" /> Undo Last
        </Button>
        <Button
          onClick={redo}
          variant="outline"
          className="gap-2"
          data-ocid="undoredo.secondary_button"
        >
          <Redo2 className="h-4 w-4" /> Redo
        </Button>
        <Button
          onClick={bulkUndo}
          disabled={selected.length === 0}
          variant="destructive"
          className="gap-2"
          data-ocid="undoredo.delete_button"
        >
          <Undo2 className="h-4 w-4" /> Bulk Undo ({selected.length})
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Event Stack ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent
            className="space-y-2 max-h-96 overflow-y-auto"
            data-ocid="undoredo.list"
          >
            {events.length === 0 && (
              <p
                className="text-muted-foreground text-sm text-center py-8"
                data-ocid="undoredo.empty_state"
              >
                No events in stack
              </p>
            )}
            {events.map((ev, i) => (
              <button
                type="button"
                key={ev.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  diffEvent?.id === ev.id
                    ? "border-teal-400 bg-teal-400/10"
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setDiffEvent(ev)}
                onKeyDown={(e) => e.key === "Enter" && setDiffEvent(ev)}
                data-ocid={`undoredo.item.${i + 1}`}
              >
                <Checkbox
                  checked={selected.includes(ev.id)}
                  onCheckedChange={() => toggleSelect(ev.id)}
                  onClick={(e) => e.stopPropagation()}
                  data-ocid={`undoredo.checkbox.${i + 1}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {ev.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {ev.time}
                    </span>
                  </div>
                  <p className="text-sm mt-1 truncate">{ev.detail}</p>
                  <p className="text-xs text-muted-foreground">by {ev.user}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Before / After Diff</CardTitle>
          </CardHeader>
          <CardContent>
            {!diffEvent ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Click an event to see before/after state
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Action
                  </p>
                  <p className="text-sm font-medium">
                    {diffEvent.action} — {diffEvent.detail}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-950/30 border border-red-800/40 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-400 mb-2 uppercase">
                      Before
                    </p>
                    <p className="text-sm text-foreground">
                      {diffEvent.before}
                    </p>
                  </div>
                  <div className="bg-green-950/30 border border-green-800/40 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-400 mb-2 uppercase">
                      After
                    </p>
                    <p className="text-sm text-foreground">{diffEvent.after}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Performed by <strong>{diffEvent.user}</strong> at{" "}
                  {diffEvent.time}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
