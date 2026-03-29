import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import type { Company } from "../backend.d";

interface Project {
  id: string;
  name: string;
  clientName: string;
  budget: number;
}
interface CostEntry {
  projectId: string;
  amount: number;
}
interface Revenue {
  projectId: string;
  revenue: number;
}

export default function ProjectPL({ company }: { company: Company }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "margin" | "profit">("name");

  useEffect(() => {
    try {
      setProjects(
        JSON.parse(localStorage.getItem(`hkp-projects-${company.id}`) || "[]"),
      );
    } catch {
      /**/
    }
    try {
      setCosts(
        JSON.parse(
          localStorage.getItem(`hkp-project-costs-${company.id}`) || "[]",
        ),
      );
    } catch {
      /**/
    }
    const saved = localStorage.getItem(`hkp-project-revenues-${company.id}`);
    if (saved) {
      try {
        setRevenues(JSON.parse(saved));
      } catch {
        /**/
      }
    }
  }, [company.id]);

  const getRevenue = (pId: string) =>
    revenues.find((r) => r.projectId === pId)?.revenue || 0;
  const getCost = (pId: string) =>
    costs.filter((c) => c.projectId === pId).reduce((s, c) => s + c.amount, 0);

  const rows = projects
    .map((p) => {
      const rev = getRevenue(p.id);
      const cost = getCost(p.id);
      const profit = rev - cost;
      const margin = rev > 0 ? (profit / rev) * 100 : 0;
      return { ...p, rev, cost, profit, margin };
    })
    .sort((a, b) =>
      sortBy === "margin"
        ? b.margin - a.margin
        : sortBy === "profit"
          ? b.profit - a.profit
          : a.name.localeCompare(b.name),
    );

  const updateRevenue = (pId: string, val: number) => {
    setRevenues((rs) => {
      const updated = rs.filter((r) => r.projectId !== pId);
      if (val > 0) updated.push({ projectId: pId, revenue: val });
      localStorage.setItem(
        `hkp-project-revenues-${company.id}`,
        JSON.stringify(updated),
      );
      return updated;
    });
  };

  const exportCSV = () => {
    const header = "Project,Client,Revenue,Cost,Gross Profit,Margin%";
    const lines = rows.map(
      (r) =>
        `${r.name},${r.clientName},${r.rev},${r.cost},${r.profit},${r.margin.toFixed(2)}`,
    );
    const blob = new Blob([[header, ...lines].join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "project-pl.csv";
    a.click();
  };

  const marginColor = (m: number) =>
    m >= 20 ? "text-green-600" : m >= 5 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-foreground">
          Project P&amp;L Report
        </h2>
        <div className="flex gap-3 items-center">
          <span className="text-[12px] text-muted-foreground">Sort by:</span>
          <select
            data-ocid="projectpl.select"
            className="px-2 py-1 text-[12px] bg-background border border-border rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="name">Name</option>
            <option value="margin">Margin</option>
            <option value="profit">Profit</option>
          </select>
          <button
            type="button"
            data-ocid="projectpl.primary_button"
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-1.5 bg-teal text-primary-foreground text-[12px] rounded hover:opacity-90"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              {[
                "Project",
                "Client",
                "Revenue (₹)",
                "Cost (₹)",
                "Gross Profit (₹)",
                "Margin %",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-muted-foreground px-3 py-2 border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-[12px] text-muted-foreground py-6"
                  data-ocid="projectpl.empty_state"
                >
                  No projects found.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr
                key={r.id}
                className="border-b border-border hover:bg-muted/30"
                data-ocid={`projectpl.item.${i + 1}`}
              >
                <td className="px-3 py-2 text-[12px] font-medium">{r.name}</td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  {r.clientName}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-28 px-2 py-0.5 text-[12px] bg-background border border-border rounded"
                    value={r.rev || ""}
                    onChange={(e) =>
                      updateRevenue(
                        r.id,
                        Number.parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-2 text-[12px] text-right">
                  ₹{r.cost.toLocaleString("en-IN")}
                </td>
                <td
                  className={`px-3 py-2 text-[12px] text-right font-semibold ${r.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{r.profit.toLocaleString("en-IN")}
                </td>
                <td
                  className={`px-3 py-2 text-[12px] text-right font-bold ${marginColor(r.margin)}`}
                >
                  {r.margin.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
