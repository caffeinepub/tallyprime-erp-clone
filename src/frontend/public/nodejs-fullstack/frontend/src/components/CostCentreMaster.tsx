import { Edit2, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import type { Company } from "../backend.d";
import {
  useCreateCostCentre,
  useGetAllCostCentres,
  useUpdateCostCentre,
} from "../hooks/useQueries";

interface Props {
  company: Company;
}

const emptyForm = () => ({ name: "", parentCentreId: "", description: "" });

export default function CostCentreMaster({ company }: Props) {
  const { data: centres = [], isLoading } = useGetAllCostCentres(company.id);
  const createCC = useCreateCostCentre();
  const updateCC = useUpdateCostCentre();

  const [showForm, setShowForm] = useState(false);
  const [editCC, setEditCC] = useState<null | (typeof centres)[0]>(null);
  const [form, setForm] = useState(emptyForm());

  const openCreate = () => {
    setEditCC(null);
    setForm(emptyForm());
    setShowForm(true);
  };
  const openEdit = (c: (typeof centres)[0]) => {
    setEditCC(c);
    setForm({
      name: c.name,
      parentCentreId: c.parentCentreId ? c.parentCentreId.toString() : "",
      description: c.description,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const parentId = form.parentCentreId
      ? BigInt(form.parentCentreId)
      : undefined;
    if (editCC) {
      await updateCC.mutateAsync({
        id: editCC.id,
        name: form.name,
        parentCentreId: parentId,
        description: form.description,
      });
    } else {
      await createCC.mutateAsync({
        companyId: company.id,
        name: form.name,
        parentCentreId: parentId,
        description: form.description,
      });
    }
    setShowForm(false);
    setEditCC(null);
  };

  const centreMap = new Map(centres.map((c) => [c.id.toString(), c]));
  const rootCentres = centres.filter((c) => !c.parentCentreId);
  const childrenOf = (parentId: bigint) =>
    centres.filter((c) => c.parentCentreId?.toString() === parentId.toString());

  const renderRow = (c: (typeof centres)[0], idx: number, depth: number) => (
    <tr
      key={c.id.toString()}
      data-ocid={`costcentre.item.${idx}`}
      className="border-b border-border/30 hover:bg-secondary/30"
    >
      <td
        className="px-2 py-1.5 text-foreground font-medium"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {depth > 0 && <span className="text-muted-foreground mr-1">└</span>}
        {c.name}
      </td>
      <td className="px-2 py-1.5 text-muted-foreground">
        {c.parentCentreId
          ? (centreMap.get(c.parentCentreId.toString())?.name ?? "-")
          : "—"}
      </td>
      <td className="px-2 py-1.5 text-muted-foreground">{c.description}</td>
      <td className="px-2 py-1.5">
        <button
          type="button"
          data-ocid={`costcentre.edit_button.${idx}`}
          onClick={() => openEdit(c)}
          className="cmd-btn flex items-center gap-0.5"
        >
          <Edit2 size={10} /> Alter
        </button>
      </td>
    </tr>
  );

  let rowIdx = 0;
  const renderTree = (
    items: typeof centres,
    depth: number,
  ): React.ReactNode[] =>
    items.flatMap((c) => {
      rowIdx++;
      const current = renderRow(c, rowIdx, depth);
      const children = renderTree(childrenOf(c.id), depth + 1);
      return [current, ...children];
    });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30 flex-shrink-0">
        <h2 className="text-[13px] font-semibold text-foreground">
          Cost Centre Master
        </h2>
        <button
          type="button"
          data-ocid="costcentre.open_modal_button"
          onClick={openCreate}
          className="flex items-center gap-1 text-[11px] text-teal border border-teal/40 px-2 py-1 hover:bg-teal/10"
        >
          <Plus size={11} /> New Centre
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div
            className="flex justify-center py-10"
            data-ocid="costcentre.loading_state"
          >
            <Loader2 size={18} className="animate-spin text-teal" />
          </div>
        )}
        {!isLoading && centres.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="costcentre.empty_state"
          >
            <p className="text-muted-foreground text-[12px]">
              No cost centres found. Click "New Centre" to add one.
            </p>
          </div>
        )}
        {!isLoading && centres.length > 0 && (
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-secondary/50">
                {["Centre Name", "Parent Centre", "Description", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="tally-key-badge text-left px-2 py-1.5 font-semibold border border-border/40"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>{renderTree(rootCentres, 0)}</tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-card border border-border w-[420px] p-4"
            data-ocid="costcentre.dialog"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <span className="text-[13px] font-semibold">
                {editCC ? "Alter Cost Centre" : "Create Cost Centre"}
              </span>
              <button
                type="button"
                data-ocid="costcentre.close_button"
                onClick={() => setShowForm(false)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid gap-3">
              <div>
                <label
                  htmlFor="cc-name"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Centre Name *
                </label>
                <input
                  id="cc-name"
                  data-ocid="costcentre.input"
                  className="tally-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label
                  htmlFor="cc-parent"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Parent Centre (optional)
                </label>
                <select
                  id="cc-parent"
                  data-ocid="costcentre.select"
                  className="tally-input"
                  value={form.parentCentreId}
                  onChange={(e) =>
                    setForm({ ...form, parentCentreId: e.target.value })
                  }
                >
                  <option value="">— None (Root) —</option>
                  {centres
                    .filter((c) => !editCC || c.id !== editCC.id)
                    .map((c) => (
                      <option key={c.id.toString()} value={c.id.toString()}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="cc-desc"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Description
                </label>
                <input
                  id="cc-desc"
                  className="tally-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                data-ocid="costcentre.cancel_button"
                onClick={() => setShowForm(false)}
                className="cmd-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="costcentre.submit_button"
                onClick={handleSubmit}
                disabled={
                  createCC.isPending || updateCC.isPending || !form.name.trim()
                }
                className="flex items-center gap-1 px-4 py-1 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50"
              >
                {(createCC.isPending || updateCC.isPending) && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
