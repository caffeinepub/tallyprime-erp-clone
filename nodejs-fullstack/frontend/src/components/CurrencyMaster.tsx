import { Edit2, Loader2, Plus, Star, X } from "lucide-react";
import { useState } from "react";
import {
  useCreateCurrency,
  useGetAllCurrencies,
  useUpdateCurrency,
} from "../hooks/useQueries";

const emptyForm = () => ({
  code: "",
  symbol: "",
  name: "",
  exchangeRate: "",
  isBase: false,
});

export default function CurrencyMaster() {
  const { data: currencies = [], isLoading } = useGetAllCurrencies();
  const createCurrency = useCreateCurrency();
  const updateCurrency = useUpdateCurrency();

  const [showForm, setShowForm] = useState(false);
  const [editCurrency, setEditCurrency] = useState<
    null | (typeof currencies)[0]
  >(null);
  const [form, setForm] = useState(emptyForm());

  const openCreate = () => {
    setEditCurrency(null);
    setForm(emptyForm());
    setShowForm(true);
  };
  const openEdit = (c: (typeof currencies)[0]) => {
    setEditCurrency(c);
    setForm({
      code: c.code,
      symbol: c.symbol,
      name: c.name,
      exchangeRate: String(c.exchangeRate),
      isBase: c.isBase,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    if (editCurrency) {
      await updateCurrency.mutateAsync({
        id: editCurrency.id,
        code: form.code,
        symbol: form.symbol,
        name: form.name,
        exchangeRate: Number(form.exchangeRate),
        isBase: form.isBase,
      });
    } else {
      await createCurrency.mutateAsync({
        code: form.code,
        symbol: form.symbol,
        name: form.name,
        exchangeRate: Number(form.exchangeRate),
        isBase: form.isBase,
      });
    }
    setShowForm(false);
    setEditCurrency(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30 flex-shrink-0">
        <h2 className="text-[13px] font-semibold text-foreground">
          Currency Master
        </h2>
        <button
          type="button"
          data-ocid="currency.open_modal_button"
          onClick={openCreate}
          className="flex items-center gap-1 text-[11px] text-teal border border-teal/40 px-2 py-1 hover:bg-teal/10"
        >
          <Plus size={11} /> New Currency
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div
            className="flex justify-center py-10"
            data-ocid="currency.loading_state"
          >
            <Loader2 size={18} className="animate-spin text-teal" />
          </div>
        )}
        {!isLoading && currencies.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="currency.empty_state"
          >
            <p className="text-muted-foreground text-[12px]">
              No currencies found. Add INR as base currency to start.
            </p>
            <button
              type="button"
              data-ocid="currency.primary_button"
              onClick={openCreate}
              className="mt-3 text-[11px] text-teal border border-teal/40 px-3 py-1.5 hover:bg-teal/10"
            >
              + Add Currency
            </button>
          </div>
        )}
        {!isLoading && currencies.length > 0 && (
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-secondary/50">
                {[
                  "Code",
                  "Symbol",
                  "Name",
                  "Exchange Rate (to INR)",
                  "Base",
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
              {currencies.map((c, i) => (
                <tr
                  key={c.id.toString()}
                  data-ocid={`currency.item.${i + 1}`}
                  className={`border-b border-border/30 hover:bg-secondary/30 ${c.isBase ? "bg-teal/5" : ""}`}
                >
                  <td className="px-2 py-1.5 font-mono font-bold text-teal">
                    {c.code}
                  </td>
                  <td className="px-2 py-1.5 font-mono">{c.symbol}</td>
                  <td className="px-2 py-1.5 text-foreground">{c.name}</td>
                  <td className="px-2 py-1.5 text-right">
                    {c.isBase ? "1.0000 (Base)" : c.exchangeRate.toFixed(4)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {c.isBase && (
                      <Star
                        size={12}
                        className="text-amber-400 inline"
                        fill="currentColor"
                      />
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      data-ocid={`currency.edit_button.${i + 1}`}
                      onClick={() => openEdit(c)}
                      className="cmd-btn flex items-center gap-0.5"
                    >
                      <Edit2 size={10} /> Alter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-card border border-border w-[420px] p-4"
            data-ocid="currency.dialog"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <span className="text-[13px] font-semibold">
                {editCurrency ? "Alter Currency" : "Create Currency"}
              </span>
              <button
                type="button"
                data-ocid="currency.close_button"
                onClick={() => setShowForm(false)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="cur-code"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Code (e.g. USD) *
                </label>
                <input
                  id="cur-code"
                  data-ocid="currency.input"
                  className="tally-input font-mono uppercase"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="USD"
                />
              </div>
              <div>
                <label
                  htmlFor="cur-symbol"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Symbol
                </label>
                <input
                  id="cur-symbol"
                  className="tally-input font-mono"
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  placeholder="$"
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="cur-name"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="cur-name"
                  className="tally-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="US Dollar"
                />
              </div>
              <div>
                <label
                  htmlFor="cur-rate"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Exchange Rate (to INR)
                </label>
                <input
                  id="cur-rate"
                  className="tally-input"
                  type="number"
                  step="0.0001"
                  value={form.exchangeRate}
                  onChange={(e) =>
                    setForm({ ...form, exchangeRate: e.target.value })
                  }
                  placeholder="83.0000"
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <input
                  id="currency-isbase"
                  data-ocid="currency.checkbox"
                  type="checkbox"
                  checked={form.isBase}
                  onChange={(e) =>
                    setForm({ ...form, isBase: e.target.checked })
                  }
                  className="w-4 h-4 accent-teal"
                />
                <label
                  htmlFor="currency-isbase"
                  className="text-[11px] text-muted-foreground"
                >
                  Base Currency
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                data-ocid="currency.cancel_button"
                onClick={() => setShowForm(false)}
                className="cmd-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="currency.submit_button"
                onClick={handleSubmit}
                disabled={
                  createCurrency.isPending ||
                  updateCurrency.isPending ||
                  !form.code.trim() ||
                  !form.name.trim()
                }
                className="flex items-center gap-1 px-4 py-1 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50"
              >
                {(createCurrency.isPending || updateCurrency.isPending) && (
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
