import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import {
  useAddExchangeRate,
  useGetAllCurrencies,
  useGetExchangeRates,
} from "../hooks/useQueries";

const timeToDate = (t: bigint) =>
  new Date(Number(t / 1000000n)).toISOString().split("T")[0];

function RateHistory({ currencyId }: { currencyId: bigint }) {
  const { data: rates = [], isLoading } = useGetExchangeRates(currencyId);
  const sorted = [...rates].sort((a, b) => Number(b.date - a.date));
  if (isLoading)
    return (
      <div className="flex justify-center py-6">
        <Loader2 size={16} className="animate-spin text-teal" />
      </div>
    );
  if (sorted.length === 0)
    return (
      <p className="text-muted-foreground text-[11px] py-4 text-center">
        No rate history found.
      </p>
    );
  return (
    <table className="w-full text-[11px] border-collapse mt-3">
      <thead>
        <tr className="bg-secondary/50">
          {["Date", "Rate (to INR)", "Narration"].map((h) => (
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
        {sorted.map((r, i) => (
          <tr
            key={r.id.toString()}
            data-ocid={`exchangerates.item.${i + 1}`}
            className="border-b border-border/30 hover:bg-secondary/30"
          >
            <td className="px-2 py-1.5 font-mono">{timeToDate(r.date)}</td>
            <td className="px-2 py-1.5 text-right text-teal font-semibold">
              {r.rate.toFixed(4)}
            </td>
            <td className="px-2 py-1.5 text-muted-foreground">{r.narration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ExchangeRates() {
  const { data: currencies = [], isLoading: loadingCurrencies } =
    useGetAllCurrencies();
  const addRate = useAddExchangeRate();
  const [selectedId, setSelectedId] = useState<bigint | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    rate: "",
    narration: "",
  });

  const selectedCurrency = currencies.find((c) => c.id === selectedId);

  const handleAdd = async () => {
    if (!selectedId || !form.rate) return;
    await addRate.mutateAsync({
      currencyId: selectedId,
      date: form.date,
      rate: Number(form.rate),
      narration: form.narration,
    });
    setShowForm(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      rate: "",
      narration: "",
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-secondary/30 flex-shrink-0">
        <h2 className="text-[13px] font-semibold text-foreground">
          Exchange Rates
        </h2>
        <p className="text-[10px] text-muted-foreground">
          View and manage historical exchange rates
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <label
            htmlFor="er-currency"
            className="text-[11px] text-muted-foreground"
          >
            Select Currency:
          </label>
          {loadingCurrencies ? (
            <Loader2 size={14} className="animate-spin text-teal" />
          ) : (
            <select
              id="er-currency"
              data-ocid="exchangerates.select"
              className="tally-input w-48"
              value={selectedId?.toString() ?? ""}
              onChange={(e) =>
                setSelectedId(e.target.value ? BigInt(e.target.value) : null)
              }
            >
              <option value="">— Select —</option>
              {currencies
                .filter((c) => !c.isBase)
                .map((c) => (
                  <option key={c.id.toString()} value={c.id.toString()}>
                    {c.code} — {c.name}
                  </option>
                ))}
            </select>
          )}
          {selectedId && (
            <button
              type="button"
              data-ocid="exchangerates.open_modal_button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 text-[11px] text-teal border border-teal/40 px-2 py-1 hover:bg-teal/10"
            >
              <Plus size={11} /> Add Rate
            </button>
          )}
        </div>

        {selectedId && <RateHistory currencyId={selectedId} />}

        {!selectedId && currencies.length > 0 && (
          <div
            className="text-center py-12 text-muted-foreground text-[11px]"
            data-ocid="exchangerates.empty_state"
          >
            Select a currency above to view its exchange rate history.
          </div>
        )}

        {currencies.length === 0 && !loadingCurrencies && (
          <div
            className="text-center py-12 text-muted-foreground text-[11px]"
            data-ocid="exchangerates.empty_state"
          >
            No currencies defined. Add currencies in Currency Master first.
          </div>
        )}
      </div>

      {showForm && selectedCurrency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-card border border-border w-[400px] p-4"
            data-ocid="exchangerates.dialog"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <span className="text-[13px] font-semibold">
                Add Rate — {selectedCurrency.code}
              </span>
              <button
                type="button"
                data-ocid="exchangerates.close_button"
                onClick={() => setShowForm(false)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="er-date"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Date
                </label>
                <input
                  id="er-date"
                  className="tally-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label
                  htmlFor="er-rate"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Rate (to INR)
                </label>
                <input
                  id="er-rate"
                  data-ocid="exchangerates.input"
                  className="tally-input"
                  type="number"
                  step="0.0001"
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: e.target.value })}
                  placeholder="83.0000"
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="er-narration"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Narration
                </label>
                <input
                  id="er-narration"
                  className="tally-input"
                  value={form.narration}
                  onChange={(e) =>
                    setForm({ ...form, narration: e.target.value })
                  }
                  placeholder="RBI reference rate..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                data-ocid="exchangerates.cancel_button"
                onClick={() => setShowForm(false)}
                className="cmd-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="exchangerates.submit_button"
                onClick={handleAdd}
                disabled={addRate.isPending || !form.rate}
                className="flex items-center gap-1 px-4 py-1 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50"
              >
                {addRate.isPending && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Add Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
