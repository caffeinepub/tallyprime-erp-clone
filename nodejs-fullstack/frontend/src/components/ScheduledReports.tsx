import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const LS_KEY = "hkpro_scheduled_reports";

type Frequency = "Daily" | "Weekly" | "Monthly";

type Schedule = {
  id: string;
  name: string;
  reportType: string;
  frequency: Frequency;
  emailNote: string;
  active: boolean;
  createdAt: string;
};

const REPORT_TYPES = [
  "P&L Summary",
  "Trial Balance",
  "GST Summary",
  "Payroll Summary",
  "Stock Summary",
];

function calcNextRun(frequency: Frequency, from: string): string {
  const d = new Date(from);
  if (frequency === "Daily") d.setDate(d.getDate() + 1);
  else if (frequency === "Weekly") d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function load(): Schedule[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(s: Schedule[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export default function ScheduledReports() {
  const [schedules, setSchedules] = useState<Schedule[]>(() => load());
  const [form, setForm] = useState({
    name: "",
    reportType: REPORT_TYPES[0],
    frequency: "Monthly" as Frequency,
    emailNote: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    save(schedules);
  }, [schedules]);

  const handleAdd = () => {
    if (!form.name.trim()) {
      setError("Schedule name is required.");
      return;
    }
    const s: Schedule = {
      id: Date.now().toString(),
      name: form.name.trim(),
      reportType: form.reportType,
      frequency: form.frequency,
      emailNote: form.emailNote,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setSchedules((prev) => [s, ...prev]);
    setForm({
      name: "",
      reportType: REPORT_TYPES[0],
      frequency: "Monthly",
      emailNote: "",
    });
    setError("");
  };

  const toggleActive = (id: string) =>
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    );

  const del = (id: string) =>
    setSchedules((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <CalendarClock size={16} className="text-teal" />
        <h2 className="text-[13px] font-bold text-foreground tracking-tight">
          Scheduled Reports
        </h2>
        <Badge
          variant="outline"
          className="text-[10px] border-teal/40 text-teal"
        >
          {schedules.length} schedule{schedules.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Form */}
      <div className="px-4 py-3 border-b border-border bg-secondary/20 flex-shrink-0">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          New Schedule
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="sr-name"
              className="text-[10px] text-muted-foreground uppercase tracking-wide"
            >
              Schedule Name *
            </label>
            <input
              id="sr-name"
              data-ocid="scheduled_reports.name.input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Monthly P&L"
              className="tally-input text-[12px] px-2 py-1 w-48"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="sr-type"
              className="text-[10px] text-muted-foreground uppercase tracking-wide"
            >
              Report Type
            </label>
            <select
              id="sr-type"
              data-ocid="scheduled_reports.type.select"
              value={form.reportType}
              onChange={(e) =>
                setForm((f) => ({ ...f, reportType: e.target.value }))
              }
              className="tally-input text-[12px] px-2 py-1 w-40"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="sr-freq"
              className="text-[10px] text-muted-foreground uppercase tracking-wide"
            >
              Frequency
            </label>
            <select
              id="sr-freq"
              data-ocid="scheduled_reports.frequency.select"
              value={form.frequency}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  frequency: e.target.value as Frequency,
                }))
              }
              className="tally-input text-[12px] px-2 py-1 w-32"
            >
              {(["Daily", "Weekly", "Monthly"] as Frequency[]).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="sr-email"
              className="text-[10px] text-muted-foreground uppercase tracking-wide"
            >
              Email Note (display only)
            </label>
            <input
              id="sr-email"
              data-ocid="scheduled_reports.email.input"
              value={form.emailNote}
              onChange={(e) =>
                setForm((f) => ({ ...f, emailNote: e.target.value }))
              }
              placeholder="Note for report email"
              className="tally-input text-[12px] px-2 py-1 w-52"
            />
          </div>
          <Button
            data-ocid="scheduled_reports.save.primary_button"
            onClick={handleAdd}
            size="sm"
            className="bg-teal text-primary-foreground hover:bg-teal/90 text-[12px] h-8 px-4"
          >
            Save Schedule
          </Button>
        </div>
        {error && (
          <div
            data-ocid="scheduled_reports.name.error_state"
            className="text-[11px] text-destructive mt-1"
          >
            {error}
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div className="flex-1 overflow-auto p-4">
        {schedules.length === 0 ? (
          <div
            data-ocid="scheduled_reports.empty_state"
            className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground"
          >
            <CalendarClock size={28} className="opacity-20" />
            <span className="text-[12px]">
              No schedules yet. Create one above.
            </span>
          </div>
        ) : (
          <div className="border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {[
                    "Schedule Name",
                    "Report Type",
                    "Frequency",
                    "Next Run",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] text-muted-foreground uppercase tracking-wide px-4 py-2"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedules.map((s, idx) => (
                  <tr
                    key={s.id}
                    data-ocid={`scheduled_reports.item.${idx + 1}`}
                    className="border-b border-border/40 hover:bg-secondary/20"
                  >
                    <td className="text-[12px] text-foreground px-4 py-2 font-medium">
                      {s.name}
                    </td>
                    <td className="text-[12px] text-muted-foreground px-4 py-2">
                      {s.reportType}
                    </td>
                    <td className="text-[12px] text-muted-foreground px-4 py-2">
                      {s.frequency}
                    </td>
                    <td className="text-[12px] font-mono text-muted-foreground px-4 py-2">
                      {calcNextRun(s.frequency, s.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={s.active ? "default" : "secondary"}
                        className={`text-[10px] ${
                          s.active
                            ? "bg-teal/20 text-teal border-teal/40"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.active ? "Active" : "Paused"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          data-ocid={`scheduled_reports.toggle.${idx + 1}`}
                          onClick={() => toggleActive(s.id)}
                          className="text-muted-foreground hover:text-teal transition-colors"
                          title={s.active ? "Pause" : "Resume"}
                        >
                          {s.active ? (
                            <PauseCircle size={14} />
                          ) : (
                            <PlayCircle size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          data-ocid={`scheduled_reports.delete_button.${idx + 1}`}
                          onClick={() => del(s.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
