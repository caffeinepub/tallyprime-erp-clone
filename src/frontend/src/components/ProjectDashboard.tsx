import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Company } from "../backend.d";

interface Project {
  id: string;
  name: string;
  clientName: string;
  status: string;
  budget: number;
}
interface CostEntry {
  projectId: string;
  amount: number;
}

export default function ProjectDashboard({ company }: { company: Company }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [costs, setCosts] = useState<CostEntry[]>([]);

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
  }, [company.id]);

  const getSpent = (pId: string) =>
    costs.filter((c) => c.projectId === pId).reduce((s, c) => s + c.amount, 0);

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + getSpent(p.id), 0);
  const active = projects.filter((p) => p.status === "Active").length;

  const chartData = projects.slice(0, 10).map((p) => ({
    name: p.name.length > 12 ? `${p.name.slice(0, 12)}…` : p.name,
    Budget: p.budget,
    Spent: getSpent(p.id),
  }));

  const statusColor = (s: string) =>
    s === "Active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : s === "Completed"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-[14px] font-bold text-foreground">
        Project Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Projects",
            value: projects.length.toString(),
            color: "text-teal",
          },
          {
            label: "Active Projects",
            value: active.toString(),
            color: "text-green-600",
          },
          {
            label: "Total Budget",
            value: `₹${totalBudget.toLocaleString("en-IN")}`,
            color: "text-blue-600",
          },
          {
            label: "Total Spent",
            value: `₹${totalSpent.toLocaleString("en-IN")}`,
            color:
              totalSpent > totalBudget ? "text-red-600" : "text-foreground",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-card border border-border rounded p-3"
          >
            <div className="text-[11px] text-muted-foreground">
              {card.label}
            </div>
            <div className={`text-[18px] font-bold mt-1 ${card.color}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded p-4">
          <h3 className="text-[12px] font-semibold mb-3">
            Budget vs Actual (Top 10 Projects)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 10, left: 10, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Budget" fill="#2dd4bf" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Spent" fill="#f97316" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Project List */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              {[
                "Project",
                "Client",
                "Status",
                "Budget",
                "Spent",
                "Progress",
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
            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-[12px] text-muted-foreground py-6"
                  data-ocid="projectdash.empty_state"
                >
                  No projects yet.
                </td>
              </tr>
            )}
            {projects.map((p, i) => {
              const spent = getSpent(p.id);
              const pct =
                p.budget > 0 ? Math.min((spent / p.budget) * 100, 100) : 0;
              return (
                <tr
                  key={p.id}
                  className="border-b border-border hover:bg-muted/30"
                  data-ocid={`projectdash.item.${i + 1}`}
                >
                  <td className="px-3 py-2 text-[12px] font-medium">
                    {p.name}
                  </td>
                  <td className="px-3 py-2 text-[12px] text-muted-foreground">
                    {p.clientName}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[12px] text-right">
                    ₹{p.budget.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2 text-[12px] text-right">
                    ₹{spent.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2 w-32">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-teal"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {pct.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
