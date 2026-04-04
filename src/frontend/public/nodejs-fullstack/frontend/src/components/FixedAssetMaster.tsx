import { Edit2, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import type { Company } from "../backend.d";
import {
  useCreateFixedAsset,
  useGetAllFixedAssets,
  useRecordDepreciation,
  useUpdateFixedAsset,
} from "../hooks/useQueries";

const CATEGORIES = [
  "Land",
  "Building",
  "Plant & Machinery",
  "Furniture",
  "Vehicle",
  "Computer",
  "Other",
];
const DEP_METHODS = ["SLM", "WDV"];

const timeToDate = (t: bigint) =>
  new Date(Number(t / 1000000n)).toISOString().split("T")[0];

interface Props {
  company: Company;
}

const emptyForm = () => ({
  name: "",
  category: "Building",
  purchaseDate: new Date().toISOString().split("T")[0],
  cost: "",
  salvageValue: "",
  usefulLifeYears: "",
  depreciationMethod: "SLM",
});

export default function FixedAssetMaster({ company }: Props) {
  const { data: assets = [], isLoading } = useGetAllFixedAssets(company.id);
  const createAsset = useCreateFixedAsset();
  const updateAsset = useUpdateFixedAsset();
  const recordDep = useRecordDepreciation();

  const [showForm, setShowForm] = useState(false);
  const [editAsset, setEditAsset] = useState<null | (typeof assets)[0]>(null);
  const [depAsset, setDepAsset] = useState<null | (typeof assets)[0]>(null);
  const [form, setForm] = useState(emptyForm());
  const [depForm, setDepForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    narration: "",
  });

  const openCreate = () => {
    setEditAsset(null);
    setForm(emptyForm());
    setShowForm(true);
  };
  const openEdit = (a: (typeof assets)[0]) => {
    setEditAsset(a);
    setForm({
      name: a.name,
      category: a.category,
      purchaseDate: timeToDate(a.purchaseDate),
      cost: String(a.cost),
      salvageValue: String(a.salvageValue),
      usefulLifeYears: String(a.usefulLifeYears),
      depreciationMethod: a.depreciationMethod,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    if (editAsset) {
      await updateAsset.mutateAsync({
        id: editAsset.id,
        name: form.name,
        category: form.category,
        purchaseDate: form.purchaseDate,
        cost: Number(form.cost),
        salvageValue: Number(form.salvageValue),
        usefulLifeYears: BigInt(form.usefulLifeYears || 5),
        depreciationMethod: form.depreciationMethod,
        accumulatedDepreciation: editAsset.accumulatedDepreciation,
        isDisposed: editAsset.isDisposed,
      });
    } else {
      await createAsset.mutateAsync({
        companyId: company.id,
        name: form.name,
        category: form.category,
        purchaseDate: form.purchaseDate,
        cost: Number(form.cost),
        salvageValue: Number(form.salvageValue),
        usefulLifeYears: BigInt(form.usefulLifeYears || 5),
        depreciationMethod: form.depreciationMethod,
      });
    }
    setShowForm(false);
    setEditAsset(null);
  };

  const handleRecordDep = async () => {
    if (!depAsset || !depForm.amount) return;
    await recordDep.mutateAsync({
      assetId: depAsset.id,
      amount: Number(depForm.amount),
      date: depForm.date,
      narration: depForm.narration,
    });
    setDepAsset(null);
    setDepForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      narration: "",
    });
  };

  const bookValue = (a: (typeof assets)[0]) =>
    Math.max(0, a.cost - a.accumulatedDepreciation);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30 flex-shrink-0">
        <h2 className="text-[13px] font-semibold text-foreground">
          Fixed Asset Master
        </h2>
        <button
          type="button"
          data-ocid="fixedasset.open_modal_button"
          onClick={openCreate}
          className="flex items-center gap-1 text-[11px] text-teal border border-teal/40 px-2 py-1 hover:bg-teal/10 transition-colors"
        >
          <Plus size={11} /> New Asset
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div
            className="flex justify-center py-10"
            data-ocid="fixedasset.loading_state"
          >
            <Loader2 size={18} className="animate-spin text-teal" />
          </div>
        )}

        {!isLoading && assets.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="fixedasset.empty_state"
          >
            <p className="text-muted-foreground text-[12px]">
              No fixed assets found. Click "New Asset" to add one.
            </p>
          </div>
        )}

        {!isLoading && assets.length > 0 && (
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-secondary/50">
                {[
                  "Asset Name",
                  "Category",
                  "Purchase Date",
                  "Cost",
                  "Accum. Dep.",
                  "Book Value",
                  "Method",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="tally-key-badge text-left px-2 py-1.5 font-semibold border border-border/40"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((a, i) => (
                <tr
                  key={a.id.toString()}
                  data-ocid={`fixedasset.item.${i + 1}`}
                  className="border-b border-border/30 hover:bg-secondary/30"
                >
                  <td className="px-2 py-1.5 text-foreground font-medium">
                    {a.name}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground">
                    {a.category}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground">
                    {timeToDate(a.purchaseDate)}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    ₹{a.cost.toLocaleString("en-IN")}
                  </td>
                  <td className="px-2 py-1.5 text-right text-amber-500">
                    ₹{a.accumulatedDepreciation.toLocaleString("en-IN")}
                  </td>
                  <td className="px-2 py-1.5 text-right text-teal">
                    ₹{bookValue(a).toLocaleString("en-IN")}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground">
                    {a.depreciationMethod}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] rounded-sm ${a.isDisposed ? "bg-destructive/20 text-destructive" : "bg-teal/20 text-teal"}`}
                    >
                      {a.isDisposed ? "Disposed" : "Active"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        data-ocid={`fixedasset.edit_button.${i + 1}`}
                        onClick={() => openEdit(a)}
                        className="cmd-btn flex items-center gap-0.5"
                      >
                        <Edit2 size={10} /> Alter
                      </button>
                      <button
                        type="button"
                        data-ocid={`fixedasset.secondary_button.${i + 1}`}
                        onClick={() => setDepAsset(a)}
                        className="cmd-btn flex items-center gap-0.5 text-amber-500"
                      >
                        Dep.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-card border border-border w-[520px] p-4"
            data-ocid="fixedasset.dialog"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <span className="text-[13px] font-semibold">
                {editAsset ? "Alter Fixed Asset" : "Create Fixed Asset"}
              </span>
              <button
                type="button"
                data-ocid="fixedasset.close_button"
                onClick={() => setShowForm(false)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label
                  htmlFor="fa-name"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Asset Name *
                </label>
                <input
                  id="fa-name"
                  data-ocid="fixedasset.input"
                  className="tally-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label
                  htmlFor="fa-cat"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Category
                </label>
                <select
                  id="fa-cat"
                  data-ocid="fixedasset.select"
                  className="tally-input"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="fa-date"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Purchase Date
                </label>
                <input
                  id="fa-date"
                  className="tally-input"
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) =>
                    setForm({ ...form, purchaseDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="fa-cost"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Cost (₹)
                </label>
                <input
                  id="fa-cost"
                  className="tally-input"
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label
                  htmlFor="fa-salvage"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Salvage Value (₹)
                </label>
                <input
                  id="fa-salvage"
                  className="tally-input"
                  type="number"
                  value={form.salvageValue}
                  onChange={(e) =>
                    setForm({ ...form, salvageValue: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <label
                  htmlFor="fa-life"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Useful Life (Years)
                </label>
                <input
                  id="fa-life"
                  className="tally-input"
                  type="number"
                  value={form.usefulLifeYears}
                  onChange={(e) =>
                    setForm({ ...form, usefulLifeYears: e.target.value })
                  }
                  placeholder="5"
                />
              </div>
              <div>
                <label
                  htmlFor="fa-method"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Depreciation Method
                </label>
                <select
                  id="fa-method"
                  className="tally-input"
                  value={form.depreciationMethod}
                  onChange={(e) =>
                    setForm({ ...form, depreciationMethod: e.target.value })
                  }
                >
                  {DEP_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                data-ocid="fixedasset.cancel_button"
                onClick={() => setShowForm(false)}
                className="cmd-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="fixedasset.submit_button"
                onClick={handleSubmit}
                disabled={
                  createAsset.isPending ||
                  updateAsset.isPending ||
                  !form.name.trim()
                }
                className="flex items-center gap-1 px-4 py-1 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50"
              >
                {(createAsset.isPending || updateAsset.isPending) && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Depreciation */}
      {depAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-card border border-border w-[400px] p-4"
            data-ocid="fixedasset.modal"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <span className="text-[13px] font-semibold">
                Record Depreciation — {depAsset.name}
              </span>
              <button
                type="button"
                data-ocid="fixedasset.close_button"
                onClick={() => setDepAsset(null)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="dep-date"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Date
                </label>
                <input
                  id="dep-date"
                  className="tally-input"
                  type="date"
                  value={depForm.date}
                  onChange={(e) =>
                    setDepForm({ ...depForm, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="dep-amount"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Amount (₹)
                </label>
                <input
                  id="dep-amount"
                  className="tally-input"
                  type="number"
                  value={depForm.amount}
                  onChange={(e) =>
                    setDepForm({ ...depForm, amount: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="dep-narration"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Narration
                </label>
                <input
                  id="dep-narration"
                  className="tally-input"
                  value={depForm.narration}
                  onChange={(e) =>
                    setDepForm({ ...depForm, narration: e.target.value })
                  }
                  placeholder="Depreciation for period..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                data-ocid="fixedasset.cancel_button"
                onClick={() => setDepAsset(null)}
                className="cmd-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="fixedasset.confirm_button"
                onClick={handleRecordDep}
                disabled={recordDep.isPending || !depForm.amount}
                className="flex items-center gap-1 px-4 py-1 text-[11px] font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {recordDep.isPending && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
