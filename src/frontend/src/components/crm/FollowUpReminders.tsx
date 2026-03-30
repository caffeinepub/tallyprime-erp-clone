import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadLeads, saveLeads } from "./LeadMaster";
import type { Lead } from "./LeadMaster";

export default function FollowUpReminders() {
  const [due, setDue] = useState<Lead[]>([]);
  const [upcoming, setUpcoming] = useState<Lead[]>([]);

  useEffect(() => {
    const all = loadLeads();
    const today = new Date().toISOString().slice(0, 10);
    const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    setDue(
      all.filter(
        (l) =>
          l.followUpDate &&
          l.followUpDate <= today &&
          l.status !== "Won" &&
          l.status !== "Lost",
      ),
    );
    setUpcoming(
      all.filter(
        (l) =>
          l.followUpDate &&
          l.followUpDate > today &&
          l.followUpDate <= in7 &&
          l.status !== "Won" &&
          l.status !== "Lost",
      ),
    );
  }, []);

  const markDone = (id: string) => {
    const all = loadLeads();
    const updated = all.map((l) =>
      l.id === id ? { ...l, status: "Follow-up", followUpDate: "" } : l,
    );
    saveLeads(updated);
    setDue((prev) => prev.filter((l) => l.id !== id));
    toast.success("Follow-up marked done");
  };

  const renderCard = (lead: Lead, isDue: boolean, i: number) => (
    <div
      key={lead.id}
      data-ocid={`followup.item.${i + 1}`}
      className={`p-3 border rounded-sm flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${isDue ? "border-red-500/40 bg-red-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-semibold text-foreground">
            {lead.name}
          </span>
          <Badge
            className={`text-[10px] ${isDue ? "bg-red-500/20 text-red-500 border-red-500/40" : "bg-yellow-500/20 text-yellow-600 border-yellow-500/40"}`}
          >
            {isDue ? "Overdue" : "Due Soon"}
          </Badge>
          <Badge className="text-[10px] bg-secondary/60 text-foreground border-border">
            {lead.status}
          </Badge>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {lead.company} · {lead.phone}
        </div>
        {lead.notes && (
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {lead.notes}
          </div>
        )}
        <div className="text-[11px] mt-1">
          <span className="text-muted-foreground">Follow-up: </span>
          <span
            className={
              isDue
                ? "text-red-500 font-semibold"
                : "text-yellow-600 font-semibold"
            }
          >
            {lead.followUpDate}
          </span>
        </div>
      </div>
      {isDue && (
        <Button
          data-ocid={`followup.done.button.${i + 1}`}
          size="sm"
          variant="outline"
          className="text-[11px] h-7 border-green-500/40 text-green-500 hover:bg-green-500/10 self-start min-h-[44px] lg:min-h-[28px]"
          onClick={() => markDone(lead.id)}
        >
          <CheckCircle size={12} className="mr-1" />
          Done
        </Button>
      )}
    </div>
  );

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={18} className="text-teal" />
        <h2 className="text-[15px] font-bold text-foreground">
          Follow-up Reminders
        </h2>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-red-500 uppercase tracking-wide mb-2">
            Overdue ({due.length})
          </div>
          {due.length === 0 ? (
            <div
              data-ocid="followup.overdue.empty_state"
              className="text-[12px] text-muted-foreground py-4 text-center border border-dashed border-border rounded"
            >
              No overdue follow-ups 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {due.map((l, i) => renderCard(l, true, i))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[11px] font-semibold text-yellow-600 uppercase tracking-wide mb-2">
            Due in next 7 days ({upcoming.length})
          </div>
          {upcoming.length === 0 ? (
            <div
              data-ocid="followup.upcoming.empty_state"
              className="text-[12px] text-muted-foreground py-4 text-center border border-dashed border-border rounded"
            >
              No upcoming follow-ups
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((l, i) => renderCard(l, false, i))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
