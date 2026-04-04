import { Loader2, Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { HSNCode } from "../backend.d";
import {
  useCreateHSNCode,
  useGetAllHSNCodes,
  useUpdateHSNCode,
} from "../hooks/useQueries";

type HSNForm = { code: string; description: string; gstRate: string };
const emptyForm: HSNForm = { code: "", description: "", gstRate: "18" };

export default function HSNMaster() {
  const { data: hsnCodes, isLoading } = useGetAllHSNCodes();
  const createHSN = useCreateHSNCode();
  const updateHSN = useUpdateHSNCode();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<HSNCode | null>(null);
  const [form, setForm] = useState<HSNForm>(emptyForm);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        openCreate();
      }
      if (e.key === "Escape" && showForm) setShowForm(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showForm]);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (h: HSNCode) => {
    setEditItem(h);
    setForm({
      code: h.code,
      description: h.description,
      gstRate: h.gstRate.toString(),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const rate = Number.parseFloat(form.gstRate) || 0;
    try {
      if (editItem) {
        await updateHSN.mutateAsync({
          id: editItem.id,
          code: form.code,
          description: form.description,
          gstRate: rate,
        });
        toast.success("HSN Code updated");
      } else {
        await createHSN.mutateAsync({
          code: form.code,
          description: form.description,
          gstRate: rate,
        });
        toast.success("HSN Code created");
      }
      setShowForm(false);
      setForm(emptyForm);
    } catch {
      toast.error("Failed to save HSN Code");
    }
  };

  const filtered = (hsnCodes || []).filter(
    (h) =>
      h.code.toLowerCase().includes(search.toLowerCase()) ||
      h.description.toLowerCase().includes(search.toLowerCase()),
  );

  const isPending = createHSN.isPending || updateHSN.isPending;

  return (
    <div className="flex flex-col h-full relative">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            HSN / SAC Master
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            Harmonised System of Nomenclature
          </span>
        </div>
        <button
          type="button"
          data-ocid="hsn.open_modal_button"
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1 text-[11px] bg-teal text-primary-foreground hover:bg-teal-bright transition-colors"
        >
          <Plus size={12} /> Create (Alt+C)
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2 bg-input/30 border border-border px-2">
          <Search size={12} className="text-muted-foreground" />
          <input
            data-ocid="hsn.search_input"
            className="bg-transparent py-1.5 text-[12px] text-foreground focus:outline-none w-full"
            placeholder="Search by HSN code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div
            className="flex items-center justify-center py-10 gap-2"
            data-ocid="hsn.loading_state"
          >
            <Loader2 size={16} className="animate-spin text-teal" />
            <span className="text-muted-foreground text-[12px]">
              Loading HSN codes...
            </span>
          </div>
        ) : (
          <table className="w-full tally-table">
            <thead>
              <tr>
                <th>HSN / SAC Code</th>
                <th>Description</th>
                <th className="text-right">GST Rate %</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="hsn.empty_state"
                  >
                    {search
                      ? "No HSN codes match your search"
                      : "No HSN codes created yet. Press Alt+C to create."}
                  </td>
                </tr>
              ) : (
                filtered.map((h, i) => (
                  <tr key={h.id.toString()} data-ocid={`hsn.item.${i + 1}`}>
                    <td className="font-mono font-medium text-teal">
                      {h.code}
                    </td>
                    <td className="text-foreground">{h.description}</td>
                    <td className="text-right font-mono text-numeric">
                      <span className="px-2 py-0.5 bg-amber-900/30 text-amber-400 text-[11px] rounded-sm">
                        {h.gstRate}%
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        data-ocid={`hsn.edit_button.${i + 1}`}
                        onClick={() => openEdit(h)}
                        className="p-1 hover:text-teal text-muted-foreground transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
          <div
            className="bg-card border border-teal/40 w-[480px] rounded-sm"
            data-ocid="hsn.dialog"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <span className="text-[13px] font-semibold">
                {editItem ? "Alter HSN Code" : "Create HSN Code"}
              </span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground text-[11px]"
              >
                ESC
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label
                  htmlFor="hsn-code"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  HSN / SAC Code *
                </label>
                <input
                  id="hsn-code"
                  data-ocid="hsn.input"
                  className="tally-input font-mono"
                  placeholder="e.g. 0901, 9954"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div>
                <label
                  htmlFor="hsn-desc"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Description *
                </label>
                <input
                  id="hsn-desc"
                  className="tally-input"
                  placeholder="e.g. Coffee, whether or not roasted"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="hsn-rate"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  GST Rate (%)
                </label>
                <select
                  id="hsn-rate"
                  data-ocid="hsn.select"
                  className="tally-input"
                  value={form.gstRate}
                  onChange={(e) =>
                    setForm({ ...form, gstRate: e.target.value })
                  }
                >
                  <option value="0">0% (Exempt)</option>
                  <option value="0.1">0.1%</option>
                  <option value="0.25">0.25%</option>
                  <option value="1">1%</option>
                  <option value="1.5">1.5%</option>
                  <option value="3">3%</option>
                  <option value="5">5%</option>
                  <option value="6">6%</option>
                  <option value="7.5">7.5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
              <button
                type="button"
                data-ocid="hsn.cancel_button"
                onClick={() => setShowForm(false)}
                className="cmd-btn"
              >
                Cancel (ESC)
              </button>
              <button
                type="button"
                data-ocid="hsn.save_button"
                onClick={handleSave}
                disabled={
                  isPending || !form.code.trim() || !form.description.trim()
                }
                className="flex items-center gap-1 px-4 py-1 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
              >
                {isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : null}
                Accept (Ctrl+A)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
