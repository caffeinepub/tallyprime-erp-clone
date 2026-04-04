import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";
import { useInventoryActor } from "../hooks/useInventoryActor";

interface Props {
  company: Company;
}

const UNITS = ["Nos", "Kgs", "Ltrs", "Mtrs", "Boxes", "Pcs"];

export default function StockGroups({ company: _company }: Props) {
  const { actor, isFetching } = useInventoryActor();
  const qc = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["stockGroups"],
    queryFn: async () => (actor ? actor.getAllStockGroups() : []),
    enabled: !!actor && !isFetching,
  });

  const createMut = useMutation({
    mutationFn: async (v: {
      name: string;
      parentGroupId: bigint | null;
      unit: string;
    }) => actor!.createStockGroup(v.name, v.parentGroupId, v.unit),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stockGroups"] });
      toast.success("Stock group created");
    },
    onError: () => toast.error("Failed to create stock group"),
  });

  const [form, setForm] = useState({
    name: "",
    parentGroupId: "",
    unit: "Nos",
  });
  const [editId, setEditId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    parentGroupId: "",
    unit: "Nos",
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    await createMut.mutateAsync({
      name: form.name.trim(),
      parentGroupId: form.parentGroupId ? BigInt(form.parentGroupId) : null,
      unit: form.unit,
    });
    setForm({ name: "", parentGroupId: "", unit: "Nos" });
  };

  const startEdit = (g: (typeof groups)[0]) => {
    setEditId(g.id);
    setEditForm({
      name: g.name,
      parentGroupId: g.parentGroupId ? g.parentGroupId.toString() : "",
      unit: g.unit,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 bg-secondary/50 border-b border-border">
        <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
          Stock Groups
        </span>
      </div>

      {/* Create Form */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
          Create New Group
        </div>
        <div className="flex gap-2 items-end">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Name *</div>
            <input
              data-ocid="stock_groups.input"
              className="tally-input w-48"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Raw Materials"
            />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">
              Parent Group
            </div>
            <select
              data-ocid="stock_groups.select"
              className="tally-input w-44"
              value={form.parentGroupId}
              onChange={(e) =>
                setForm((f) => ({ ...f, parentGroupId: e.target.value }))
              }
            >
              <option value="">(Primary)</option>
              {groups.map((g) => (
                <option key={g.id.toString()} value={g.id.toString()}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Unit</div>
            <select
              className="tally-input w-24"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            >
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            data-ocid="stock_groups.primary_button"
            onClick={handleCreate}
            disabled={createMut.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-teal text-primary-foreground text-[11px] font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors"
          >
            {createMut.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Plus size={12} />
            )}
            Create
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div
            data-ocid="stock_groups.loading_state"
            className="flex items-center justify-center h-32 text-muted-foreground text-[12px]"
          >
            <Loader2 size={16} className="animate-spin mr-2" /> Loading...
          </div>
        ) : groups.length === 0 ? (
          <div
            data-ocid="stock_groups.empty_state"
            className="flex items-center justify-center h-32 text-muted-foreground text-[12px]"
          >
            No stock groups yet. Create one above.
          </div>
        ) : (
          <table className="w-full tally-table">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Group Name</th>
                <th>Parent Group</th>
                <th>Unit</th>
                <th className="w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, i) => {
                const parent = groups.find((p) => p.id === g.parentGroupId);
                const isEditing = editId === g.id;
                return (
                  <tr
                    key={g.id.toString()}
                    data-ocid={`stock_groups.item.${i + 1}`}
                  >
                    <td className="text-center text-muted-foreground">
                      {i + 1}
                    </td>
                    {isEditing ? (
                      <>
                        <td>
                          <input
                            className="tally-input w-full"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                name: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <select
                            className="tally-input w-full"
                            value={editForm.parentGroupId}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                parentGroupId: e.target.value,
                              }))
                            }
                          >
                            <option value="">(Primary)</option>
                            {groups
                              .filter((p) => p.id !== g.id)
                              .map((p) => (
                                <option
                                  key={p.id.toString()}
                                  value={p.id.toString()}
                                >
                                  {p.name}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className="tally-input"
                            value={editForm.unit}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                unit: e.target.value,
                              }))
                            }
                          >
                            {UNITS.map((u) => (
                              <option key={u}>{u}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              data-ocid={`stock_groups.save_button.${i + 1}`}
                              onClick={() => setEditId(null)}
                              className="p-1 text-teal hover:text-teal/80"
                            >
                              <Save size={12} />
                            </button>
                            <button
                              type="button"
                              data-ocid={`stock_groups.cancel_button.${i + 1}`}
                              onClick={() => setEditId(null)}
                              className="p-1 text-muted-foreground hover:text-foreground"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="font-medium">{g.name}</td>
                        <td className="text-muted-foreground">
                          {parent?.name ?? "—"}
                        </td>
                        <td>{g.unit}</td>
                        <td>
                          <button
                            type="button"
                            data-ocid={`stock_groups.edit_button.${i + 1}`}
                            onClick={() => startEdit(g)}
                            className="p-1 text-muted-foreground hover:text-teal transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
