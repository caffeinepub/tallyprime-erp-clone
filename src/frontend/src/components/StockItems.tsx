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
const GST_RATES = [0, 5, 12, 18, 28];

type ItemForm = {
  name: string;
  stockGroupId: string;
  unit: string;
  openingQty: string;
  openingRate: string;
  gstRate: string;
  hsnCode: string;
};

const DEFAULT_FORM: ItemForm = {
  name: "",
  stockGroupId: "",
  unit: "Nos",
  openingQty: "0",
  openingRate: "0",
  gstRate: "18",
  hsnCode: "",
};

export default function StockItems({ company }: Props) {
  const { actor, isFetching } = useInventoryActor();
  const qc = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ["stockGroups"],
    queryFn: async () => (actor ? actor.getAllStockGroups() : []),
    enabled: !!actor && !isFetching,
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["stockItems"],
    queryFn: async () => (actor ? actor.getAllStockItems() : []),
    enabled: !!actor && !isFetching,
  });

  const createMut = useMutation({
    mutationFn: async (f: ItemForm) =>
      actor!.createStockItem(
        company.id,
        f.name.trim(),
        BigInt(f.stockGroupId),
        f.unit,
        Number(f.openingQty),
        Number(f.openingRate),
        Number(f.gstRate),
        f.hsnCode.trim(),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stockItems"] });
      toast.success("Stock item created");
    },
    onError: () => toast.error("Failed to create stock item"),
  });

  const updateMut = useMutation({
    mutationFn: async (v: { id: bigint; f: ItemForm }) =>
      actor!.updateStockItem(
        v.id,
        v.f.name.trim(),
        BigInt(v.f.stockGroupId),
        v.f.unit,
        Number(v.f.openingQty),
        Number(v.f.openingRate),
        Number(v.f.gstRate),
        v.f.hsnCode.trim(),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stockItems"] });
      toast.success("Stock item updated");
      setEditId(null);
    },
    onError: () => toast.error("Failed to update stock item"),
  });

  const [form, setForm] = useState<ItemForm>(DEFAULT_FORM);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState<ItemForm>(DEFAULT_FORM);

  const companyItems = items.filter((it) => it.companyId === company.id);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    if (!form.stockGroupId) {
      toast.error("Stock group required");
      return;
    }
    await createMut.mutateAsync(form);
    setForm(DEFAULT_FORM);
  };

  const startEdit = (it: (typeof items)[0]) => {
    setEditId(it.id);
    setEditForm({
      name: it.name,
      stockGroupId: it.stockGroupId.toString(),
      unit: it.unit,
      openingQty: it.openingQty.toString(),
      openingRate: it.openingRate.toString(),
      gstRate: it.gstRate.toString(),
      hsnCode: it.hsnCode,
    });
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 bg-secondary/50 border-b border-border">
        <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
          Stock Items
        </span>
        <span className="ml-3 text-[11px] text-muted-foreground">
          {company.name}
        </span>
      </div>

      {/* Create Form */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
          Create New Item
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Name *</div>
            <input
              data-ocid="stock_items.input"
              className="tally-input w-44"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Item name"
            />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">
              Stock Group *
            </div>
            <select
              data-ocid="stock_items.select"
              className="tally-input w-36"
              value={form.stockGroupId}
              onChange={(e) =>
                setForm((f) => ({ ...f, stockGroupId: e.target.value }))
              }
            >
              <option value="">-- Select --</option>
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
              className="tally-input w-20"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            >
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">
              Opening Qty
            </div>
            <input
              type="number"
              className="tally-input w-24"
              value={form.openingQty}
              onChange={(e) =>
                setForm((f) => ({ ...f, openingQty: e.target.value }))
              }
            />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">
              Opening Rate
            </div>
            <input
              type="number"
              className="tally-input w-24"
              value={form.openingRate}
              onChange={(e) =>
                setForm((f) => ({ ...f, openingRate: e.target.value }))
              }
            />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">GST %</div>
            <select
              className="tally-input w-20"
              value={form.gstRate}
              onChange={(e) =>
                setForm((f) => ({ ...f, gstRate: e.target.value }))
              }
            >
              {GST_RATES.map((r) => (
                <option key={r} value={r}>
                  {r}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">
              HSN Code
            </div>
            <input
              className="tally-input w-24"
              value={form.hsnCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, hsnCode: e.target.value }))
              }
              placeholder="e.g. 8471"
            />
          </div>
          <button
            type="button"
            data-ocid="stock_items.primary_button"
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
            data-ocid="stock_items.loading_state"
            className="flex items-center justify-center h-32 text-muted-foreground text-[12px]"
          >
            <Loader2 size={16} className="animate-spin mr-2" /> Loading...
          </div>
        ) : companyItems.length === 0 ? (
          <div
            data-ocid="stock_items.empty_state"
            className="flex items-center justify-center h-32 text-muted-foreground text-[12px]"
          >
            No stock items yet. Create one above.
          </div>
        ) : (
          <table className="w-full tally-table">
            <thead>
              <tr>
                <th className="w-8">#</th>
                <th>Item Name</th>
                <th>Group</th>
                <th>Unit</th>
                <th className="text-right">Op. Qty</th>
                <th className="text-right">Op. Rate</th>
                <th className="text-right">Op. Value</th>
                <th className="text-right">GST %</th>
                <th>HSN</th>
                <th className="w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companyItems.map((it, i) => {
                const grp = groups.find((g) => g.id === it.stockGroupId);
                const isEditing = editId === it.id;
                return (
                  <tr
                    key={it.id.toString()}
                    data-ocid={`stock_items.item.${i + 1}`}
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
                            value={editForm.stockGroupId}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                stockGroupId: e.target.value,
                              }))
                            }
                          >
                            {groups.map((g) => (
                              <option
                                key={g.id.toString()}
                                value={g.id.toString()}
                              >
                                {g.name}
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
                          <input
                            type="number"
                            className="tally-input w-20 text-right"
                            value={editForm.openingQty}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                openingQty: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="tally-input w-20 text-right"
                            value={editForm.openingRate}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                openingRate: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td className="text-right text-muted-foreground font-mono text-[11px]">
                          {fmt(
                            Number(editForm.openingQty) *
                              Number(editForm.openingRate),
                          )}
                        </td>
                        <td>
                          <select
                            className="tally-input"
                            value={editForm.gstRate}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                gstRate: e.target.value,
                              }))
                            }
                          >
                            {GST_RATES.map((r) => (
                              <option key={r} value={r}>
                                {r}%
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            className="tally-input w-20"
                            value={editForm.hsnCode}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                hsnCode: e.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              data-ocid={`stock_items.save_button.${i + 1}`}
                              onClick={() =>
                                updateMut.mutate({ id: it.id, f: editForm })
                              }
                              disabled={updateMut.isPending}
                              className="p-1 text-teal hover:text-teal/80 disabled:opacity-50"
                            >
                              {updateMut.isPending ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Save size={12} />
                              )}
                            </button>
                            <button
                              type="button"
                              data-ocid={`stock_items.cancel_button.${i + 1}`}
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
                        <td className="font-medium">{it.name}</td>
                        <td className="text-muted-foreground">
                          {grp?.name ?? "—"}
                        </td>
                        <td>{it.unit}</td>
                        <td className="text-right font-mono">
                          {it.openingQty}
                        </td>
                        <td className="text-right font-mono">
                          {fmt(it.openingRate)}
                        </td>
                        <td className="text-right font-mono">
                          {fmt(it.openingValue)}
                        </td>
                        <td className="text-right">{it.gstRate}%</td>
                        <td className="font-mono text-[11px]">
                          {it.hsnCode || "—"}
                        </td>
                        <td>
                          <button
                            type="button"
                            data-ocid={`stock_items.edit_button.${i + 1}`}
                            onClick={() => startEdit(it)}
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
