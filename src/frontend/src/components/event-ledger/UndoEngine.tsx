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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Undo2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { type AccountingEvent, loadEvents, saveEvents } from "./EventLog";

export default function UndoEngine() {
  const [events, setEvents] = useState<AccountingEvent[]>([]);
  const [confirmEvent, setConfirmEvent] = useState<AccountingEvent | null>(
    null,
  );
  const [reason, setReason] = useState("");

  const reload = useCallback(() => {
    setEvents(loadEvents());
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);

  const activeEvents = events.filter(
    (e) => e.status === "Active" && e.eventType !== "Compensating",
  );
  const undoHistory = events.filter((e) => e.eventType === "Compensating");

  const handleUndo = () => {
    if (!confirmEvent) return;
    const current = loadEvents();
    const updated = current.map((e) =>
      e.id === confirmEvent.id ? { ...e, status: "Reversed" as const } : e,
    );
    const compensating: AccountingEvent = {
      id: `EVT-COMP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "Compensating",
      entity: confirmEvent.entity,
      user: JSON.parse(
        localStorage.getItem("hkp_current_user") || '{"username":"admin"}',
      ).username,
      amount: confirmEvent.amount,
      status: "Active",
      description: `Undo of ${confirmEvent.id}: ${reason || "No reason provided"}`,
    };
    updated.push(compensating);
    saveEvents(updated);
    setEvents(updated);
    setConfirmEvent(null);
    setReason("");
    toast.success(`Event ${confirmEvent.id} reversed with compensating entry`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Undo2 className="w-5 h-5 text-teal-400" />
        <h2 className="text-base font-semibold text-foreground">Undo Engine</h2>
        <Badge className="bg-teal-700 text-white">
          {activeEvents.length} active
        </Badge>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Active Events (Undoable)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs">Event ID</TableHead>
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Entity</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs text-right">
                    Amount (₹)
                  </TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEvents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-xs text-muted-foreground py-6"
                    >
                      No active events. Add sample events from Event Log.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeEvents.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="text-xs font-mono">
                        {ev.id}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(ev.timestamp).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs">{ev.entity}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-xs">
                          {ev.eventType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {ev.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs border-orange-500 text-orange-400 hover:bg-orange-900/20"
                          onClick={() => {
                            setConfirmEvent(ev);
                            setReason("");
                          }}
                          data-ocid="undo.delete_button"
                        >
                          Undo
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

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Undo History (Compensating Events)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs">Comp. Event ID</TableHead>
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Entity</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {undoHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-xs text-muted-foreground py-4"
                    >
                      No undo history yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  undoHistory.map((ev) => (
                    <TableRow key={ev.id} className="bg-red-900/10">
                      <TableCell className="text-xs font-mono">
                        {ev.id}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(ev.timestamp).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs">{ev.entity}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {ev.description}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!confirmEvent}
        onOpenChange={(o) => !o && setConfirmEvent(null)}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Confirm Undo — {confirmEvent?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              This will mark event <strong>{confirmEvent?.id}</strong> (
              {confirmEvent?.entity}) as Reversed and create a Compensating
              entry. The original event is NOT deleted.
            </p>
            <div className="space-y-1">
              <Label className="text-xs">Reason for Undo</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                className="text-xs h-20"
                data-ocid="undo.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmEvent(null)}
              data-ocid="undo.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleUndo}
              data-ocid="undo.confirm_button"
            >
              Confirm Undo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
