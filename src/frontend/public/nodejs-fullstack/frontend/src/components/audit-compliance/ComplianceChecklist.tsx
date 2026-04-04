import { CheckSquare, Square } from "lucide-react";
import { useState } from "react";

interface ChecklistItem {
  id: string;
  task: string;
  category: string;
  dueDate: string;
  frequency: string;
  status: "Pending" | "Filed" | "Overdue";
  notes?: string;
}

const INITIAL: ChecklistItem[] = [
  {
    id: "1",
    task: "GSTR-1 Filing (March)",
    category: "GST",
    dueDate: "2024-04-11",
    frequency: "Monthly",
    status: "Pending",
  },
  {
    id: "2",
    task: "GSTR-3B Filing (March)",
    category: "GST",
    dueDate: "2024-04-20",
    frequency: "Monthly",
    status: "Pending",
  },
  {
    id: "3",
    task: "TDS Return – Form 26Q (Q4)",
    category: "TDS",
    dueDate: "2024-05-31",
    frequency: "Quarterly",
    status: "Pending",
  },
  {
    id: "4",
    task: "Advance Tax (4th Installment)",
    category: "Income Tax",
    dueDate: "2024-03-15",
    frequency: "Quarterly",
    status: "Filed",
  },
  {
    id: "5",
    task: "GSTR-9 Annual Return",
    category: "GST",
    dueDate: "2024-12-31",
    frequency: "Annual",
    status: "Pending",
  },
  {
    id: "6",
    task: "ITR Filing",
    category: "Income Tax",
    dueDate: "2024-07-31",
    frequency: "Annual",
    status: "Pending",
  },
  {
    id: "7",
    task: "ROC Annual Filing (MGT-7)",
    category: "MCA",
    dueDate: "2024-11-29",
    frequency: "Annual",
    status: "Pending",
  },
  {
    id: "8",
    task: "GSTR-1 Filing (February)",
    category: "GST",
    dueDate: "2024-03-11",
    frequency: "Monthly",
    status: "Filed",
  },
  {
    id: "9",
    task: "PF Return",
    category: "Labour",
    dueDate: "2024-04-15",
    frequency: "Monthly",
    status: "Overdue",
  },
  {
    id: "10",
    task: "ESI Return",
    category: "Labour",
    dueDate: "2024-04-11",
    frequency: "Monthly",
    status: "Overdue",
  },
  {
    id: "11",
    task: "Form 16 / 16A Issuance",
    category: "TDS",
    dueDate: "2024-06-15",
    frequency: "Annual",
    status: "Pending",
  },
  {
    id: "12",
    task: "Director DIN KYC",
    category: "MCA",
    dueDate: "2024-09-30",
    frequency: "Annual",
    status: "Pending",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  GST: "bg-teal/15 text-teal border-teal/30",
  TDS: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  "Income Tax": "bg-purple-500/15 text-purple-600 border-purple-500/30",
  MCA: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  Labour: "bg-orange-500/15 text-orange-600 border-orange-500/30",
};

export default function ComplianceChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL);
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const markDone = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Filed" } : i)),
    );
  };

  const categories = [
    "All",
    ...Array.from(new Set(INITIAL.map((i) => i.category))),
  ];

  const filtered = items.filter((i) => {
    if (filterCat !== "All" && i.category !== filterCat) return false;
    if (filterStatus !== "All" && i.status !== filterStatus) return false;
    return true;
  });

  const counts = {
    total: items.length,
    filed: items.filter((i) => i.status === "Filed").length,
    pending: items.filter((i) => i.status === "Pending").length,
    overdue: items.filter((i) => i.status === "Overdue").length,
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare size={16} className="text-teal" />
        <h2 className="text-sm font-bold text-foreground">
          Compliance Checklist
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Total Tasks",
            value: counts.total,
            color: "text-foreground",
          },
          { label: "Filed", value: counts.filed, color: "text-teal" },
          { label: "Pending", value: counts.pending, color: "text-amber-500" },
          { label: "Overdue", value: counts.overdue, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-sm p-3 text-center"
          >
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-sm p-3 mb-4">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Compliance Progress</span>
          <span>
            {Math.round((counts.filed / counts.total) * 100)}% complete
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-teal transition-all rounded-full"
            style={{ width: `${(counts.filed / counts.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex gap-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCat(c)}
              className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                filterCat === c
                  ? "bg-teal/20 border-teal/40 text-teal"
                  : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
              }`}
              data-ocid={`checklist.cat.${c.toLowerCase()}.tab`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {["All", "Pending", "Filed", "Overdue"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`text-[10px] px-2 py-1 rounded-sm border transition-colors ${
                filterStatus === s
                  ? "bg-teal/20 border-teal/40 text-teal"
                  : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
              }`}
              data-ocid={`checklist.status.${s.toLowerCase()}.tab`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className={`bg-card border rounded-sm p-3 flex items-center gap-3 transition-all ${
              item.status === "Overdue"
                ? "border-red-500/40 bg-red-500/5"
                : item.status === "Filed"
                  ? "border-teal/20 opacity-60"
                  : "border-border hover:border-border/80"
            }`}
            data-ocid={`checklist.item.${idx + 1}`}
          >
            <button
              type="button"
              onClick={() => item.status !== "Filed" && markDone(item.id)}
              className="flex-shrink-0"
              data-ocid={`checklist.checkbox.${idx + 1}`}
            >
              {item.status === "Filed" ? (
                <CheckSquare size={16} className="text-teal" />
              ) : (
                <Square
                  size={16}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div
                className={`text-[11px] font-medium ${
                  item.status === "Filed"
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {item.task}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Due: {item.dueDate} · {item.frequency}
              </div>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${
                CATEGORY_COLORS[item.category] ??
                "bg-secondary text-muted-foreground border-border"
              }`}
            >
              {item.category}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                item.status === "Filed"
                  ? "bg-teal/15 text-teal"
                  : item.status === "Overdue"
                    ? "bg-red-500/15 text-red-500"
                    : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {item.status}
            </span>
            {item.status !== "Filed" && (
              <button
                type="button"
                onClick={() => markDone(item.id)}
                className="text-[10px] px-2 py-0.5 bg-teal/20 text-teal border border-teal/30 hover:bg-teal/30 rounded-sm transition-colors flex-shrink-0"
                data-ocid={`checklist.mark_done.button.${idx + 1}`}
              >
                Mark Done
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
