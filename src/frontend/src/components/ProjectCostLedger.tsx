import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Company } from "../backend.d";

interface Project {
  id: string;
  name: string;
  budget: number;
}
interface CostEntry {
  id: string;
  projectId: string;
  date: string;
  description: string;
  category: "Labour" | "Material" | "Overhead" | "Travel" | "Other";
  amount: number;
}

export default function ProjectCostLedger({ company }: { company: Company }) {
  const pKey = `hkp-projects-${company.id}`;
  const cKey = `hkp-project-costs-${company.id}`;
  const [projects, setProjects] = useState<Project[]>([]);
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [form, setForm] = useState({
    date: "",
    description: "",
    category: "Labour" as CostEntry["category"],
    amount: 0,
  });

  useEffect(() => {
    try {
      setProjects(JSON.parse(localStorage.getItem(pKey) || "[]"));
    } catch {
      /**/
    }
    try {
      setCosts(JSON.parse(localStorage.getItem(cKey) || "[]"));
    } catch {
      /**/
    }
  }, [pKey, cKey]);

  useEffect(() => {
    localStorage.setItem(cKey, JSON.stringify(costs));
  }, [costs, cKey]);

  const addCost = () => {
    if (!selectedProject || !form.date || form.amount <= 0) return;
    setCosts((c) => [
      ...c,
      { ...form, id: Date.now().toString(), projectId: selectedProject },
    ]);
    setForm({ date: "", description: "", category: "Labour", amount: 0 });
  };

  const filtered = costs.filter((c) => c.projectId === selectedProject);
  const total = filtered.reduce((s, c) => s + c.amount, 0);
  const project = projects.find((p) => p.id === selectedProject);
  const budget = project?.budget || 0;
  const pct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-[14px] font-bold text-foreground">
        Project Cost Ledger
      </h2>

      <div className="flex items-center gap-3">
        <span className="text-[12px] text-muted-foreground">
          Select Project:
        </span>
        <select
          data-ocid="cost.select"
          className="px-2 py-1 text-[12px] bg-background border border-border rounded"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">-- Select --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          {/* Budget Progress */}
          <div className="bg-card border border-border rounded p-3">
            <div className="flex justify-between text-[12px] mb-2">
              <span className="text-muted-foreground">
                Budget:{" "}
                <span className="text-foreground font-semibold">
                  ₹{budget.toLocaleString("en-IN")}
                </span>
              </span>
              <span className="text-muted-foreground">
                Spent:{" "}
                <span className="text-foreground font-semibold">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </span>
              <span className="text-muted-foreground">
                Remaining:{" "}
                <span
                  className={`font-semibold ${budget - total >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{(budget - total).toLocaleString("en-IN")}
                </span>
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-teal"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {pct.toFixed(1)}% used
            </div>
          </div>

          {/* Add Cost */}
          <div
            className="bg-card border border-border rounded p-3 space-y-2"
            data-ocid="cost.dialog"
          >
            <h3 className="text-[12px] font-semibold">Add Cost Entry</h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-muted-foreground">Date</span>
                <input
                  type="date"
                  className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground">
                  Description
                </span>
                <input
                  className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground">
                  Category
                </span>
                <select
                  className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as CostEntry["category"],
                    }))
                  }
                >
                  {["Labour", "Material", "Overhead", "Travel", "Other"].map(
                    (c) => (
                      <option key={c}>{c}</option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground">
                  Amount (₹)
                </span>
                <input
                  type="number"
                  className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      amount: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <button
              type="button"
              data-ocid="cost.primary_button"
              onClick={addCost}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal text-primary-foreground text-[12px] rounded hover:opacity-90"
            >
              <Plus size={13} /> Add Entry
            </button>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  {["Date", "Description", "Category", "Amount", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-[11px] font-semibold text-muted-foreground px-3 py-2 border-b border-border"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-[12px] text-muted-foreground py-6"
                      data-ocid="cost.empty_state"
                    >
                      No cost entries yet.
                    </td>
                  </tr>
                )}
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-b border-border hover:bg-muted/30"
                    data-ocid={`cost.item.${i + 1}`}
                  >
                    <td className="px-3 py-2 text-[12px]">{c.date}</td>
                    <td className="px-3 py-2 text-[12px]">{c.description}</td>
                    <td className="px-3 py-2 text-[12px]">{c.category}</td>
                    <td className="px-3 py-2 text-[12px] text-right">
                      ₹{c.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        data-ocid={`cost.delete_button.${i + 1}`}
                        onClick={() =>
                          setCosts((cs) => cs.filter((x) => x.id !== c.id))
                        }
                        className="text-destructive hover:opacity-70"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length > 0 && (
                  <tr className="bg-muted/50 font-semibold">
                    <td colSpan={3} className="px-3 py-2 text-[12px]">
                      Total
                    </td>
                    <td className="px-3 py-2 text-[12px] text-right">
                      ₹{total.toLocaleString("en-IN")}
                    </td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
