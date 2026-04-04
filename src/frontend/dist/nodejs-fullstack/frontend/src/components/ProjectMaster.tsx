import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Company } from "../backend.d";

interface Project {
  id: string;
  name: string;
  clientName: string;
  projectType: "Internal" | "External" | "Contract";
  status: "Active" | "Completed" | "On Hold";
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
}

const empty = (): Omit<Project, "id"> => ({
  name: "",
  clientName: "",
  projectType: "External",
  status: "Active",
  startDate: "",
  endDate: "",
  budget: 0,
  description: "",
});

export default function ProjectMaster({ company }: { company: Company }) {
  const key = `hkp-projects-${company.id}`;
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState(empty());
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(projects));
  }, [projects, key]);

  const save = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setProjects((p) =>
        p.map((x) => (x.id === editId ? { ...form, id: editId } : x)),
      );
    } else {
      setProjects((p) => [...p, { ...form, id: Date.now().toString() }]);
    }
    setForm(empty());
    setEditId(null);
    setShowForm(false);
  };

  const edit = (p: Project) => {
    setForm({ ...p });
    setEditId(p.id);
    setShowForm(true);
  };
  const del = (id: string) => setProjects((p) => p.filter((x) => x.id !== id));

  const statusColor = (s: string) =>
    s === "Active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : s === "Completed"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-foreground">
          Project Master
        </h2>
        <button
          type="button"
          data-ocid="project.open_modal_button"
          onClick={() => {
            setForm(empty());
            setEditId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-teal text-primary-foreground text-[12px] rounded hover:opacity-90"
        >
          <Plus size={13} /> New Project
        </button>
      </div>

      {showForm && (
        <div
          className="bg-card border border-border rounded p-4 space-y-3"
          data-ocid="project.dialog"
        >
          <h3 className="text-[13px] font-semibold text-foreground">
            {editId ? "Edit" : "Create"} Project
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-muted-foreground">
                Project Name *
              </span>
              <input
                data-ocid="project.input"
                className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">
                Client Name
              </span>
              <input
                className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                value={form.clientName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clientName: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">
                Project Type
              </span>
              <select
                className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                value={form.projectType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    projectType: e.target.value as Project["projectType"],
                  }))
                }
              >
                <option>Internal</option>
                <option>External</option>
                <option>Contract</option>
              </select>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">Status</span>
              <select
                className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as Project["status"],
                  }))
                }
              >
                <option>Active</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">
                Start Date
              </span>
              <input
                type="date"
                className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">
                End Date
              </span>
              <input
                type="date"
                className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
              />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">
                Budget (₹)
              </span>
              <input
                type="number"
                className="w-full mt-1 px-2 py-1 text-[12px] bg-background border border-border rounded"
                value={form.budget}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    budget: Number.parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="col-span-2">
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
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="project.save_button"
              onClick={save}
              className="px-3 py-1.5 bg-teal text-primary-foreground text-[12px] rounded hover:opacity-90"
            >
              Save
            </button>
            <button
              type="button"
              data-ocid="project.cancel_button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 border border-border text-[12px] rounded hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              {[
                "Project",
                "Client",
                "Type",
                "Status",
                "Budget",
                "Start",
                "End",
                "Actions",
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
                  colSpan={8}
                  className="text-center text-[12px] text-muted-foreground py-6"
                  data-ocid="project.empty_state"
                >
                  No projects yet. Create your first project.
                </td>
              </tr>
            )}
            {projects.map((p, i) => (
              <tr
                key={p.id}
                className="border-b border-border hover:bg-muted/30"
                data-ocid={`project.item.${i + 1}`}
              >
                <td className="px-3 py-2 text-[12px] font-medium text-foreground">
                  {p.name}
                </td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  {p.clientName}
                </td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  {p.projectType}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-[12px] text-right text-foreground">
                  ₹{p.budget.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  {p.startDate}
                </td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  {p.endDate}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-ocid={`project.edit_button.${i + 1}`}
                      onClick={() => edit(p)}
                      className="text-teal hover:opacity-70"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      data-ocid={`project.delete_button.${i + 1}`}
                      onClick={() => del(p.id)}
                      className="text-destructive hover:opacity-70"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
