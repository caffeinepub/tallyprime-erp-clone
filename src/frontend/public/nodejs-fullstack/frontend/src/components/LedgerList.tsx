import { Loader2, Pencil, Plus, Search } from "lucide-react";
import { useState } from "react";
import type { Company, Ledger } from "../backend.d";
import {
  useCreateLedger,
  useGetAllLedgerGroups,
  useGetAllLedgers,
  useUpdateLedger,
} from "../hooks/useQueries";

interface Props {
  company: Company;
}

type LedgerForm = {
  name: string;
  groupId: string;
  openingBalance: string;
  balanceType: string;
};

const emptyForm: LedgerForm = {
  name: "",
  groupId: "",
  openingBalance: "0",
  balanceType: "Dr",
};

export default function LedgerList({ company }: Props) {
  const { data: ledgers, isLoading } = useGetAllLedgers();
  const { data: groups } = useGetAllLedgerGroups();
  const createLedger = useCreateLedger();
  const updateLedger = useUpdateLedger();

  const [showForm, setShowForm] = useState(false);
  const [editLedger, setEditLedger] = useState<Ledger | null>(null);
  const [form, setForm] = useState<LedgerForm>(emptyForm);
  const [search, setSearch] = useState("");

  const companyLedgers = (ledgers || []).filter(
    (l) => l.companyId === company.id,
  );
  const filtered = companyLedgers.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditLedger(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (l: Ledger) => {
    setEditLedger(l);
    setForm({
      name: l.name,
      groupId: l.groupId.toString(),
      openingBalance: l.openingBalance.toString(),
      balanceType: l.balanceType,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const groupId = BigInt(form.groupId || "0");
    const balance = Number.parseFloat(form.openingBalance) || 0;
    if (editLedger) {
      await updateLedger.mutateAsync({
        ledgerId: editLedger.id,
        name: form.name,
        groupId,
        openingBalance: balance,
        balanceType: form.balanceType,
      });
    } else {
      await createLedger.mutateAsync({
        companyId: company.id,
        name: form.name,
        groupId,
        openingBalance: balance,
        balanceType: form.balanceType,
      });
    }
    setShowForm(false);
    setForm(emptyForm);
  };

  const groupName = (id: bigint) => {
    const g = (groups || []).find((grp) => grp.id === id);
    return g ? g.name : id.toString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            List of Ledgers
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            {company.name}
          </span>
        </div>
        <button
          type="button"
          data-ocid="ledger.open_modal_button"
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
            data-ocid="ledger.search_input"
            className="bg-transparent py-1.5 text-[12px] text-foreground focus:outline-none w-full"
            placeholder="Search ledgers..."
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
            data-ocid="ledger.loading_state"
          >
            <Loader2 size={16} className="animate-spin text-teal" />
            <span className="text-muted-foreground text-[12px]">
              Loading ledgers...
            </span>
          </div>
        ) : (
          <table className="w-full tally-table">
            <thead>
              <tr>
                <th>Ledger Name</th>
                <th>Group</th>
                <th className="text-right">Opening Balance</th>
                <th>Type</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="ledger.empty_state"
                  >
                    {search
                      ? "No ledgers match your search"
                      : "No ledgers created yet. Press Alt+C to create."}
                  </td>
                </tr>
              ) : (
                filtered.map((l, i) => (
                  <tr key={l.id.toString()} data-ocid={`ledger.item.${i + 1}`}>
                    <td className="font-medium text-foreground">{l.name}</td>
                    <td className="text-muted-foreground">
                      {groupName(l.groupId)}
                    </td>
                    <td className="text-right font-mono text-numeric">
                      {l.openingBalance.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-sm ${
                          l.balanceType === "Dr"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        {l.balanceType}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        data-ocid={`ledger.edit_button.${i + 1}`}
                        onClick={() => openEdit(l)}
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

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
          <div
            className="bg-card border border-teal/40 w-[480px] rounded-sm"
            data-ocid="ledger.dialog"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <span className="text-[13px] font-semibold">
                {editLedger ? "Alter Ledger" : "Create Ledger"}
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
                  htmlFor="ledger-name"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Name *
                </label>
                <input
                  id="ledger-name"
                  data-ocid="ledger.input"
                  className="tally-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label
                  htmlFor="ledger-group"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Group
                </label>
                <select
                  id="ledger-group"
                  data-ocid="ledger.select"
                  className="tally-input"
                  value={form.groupId}
                  onChange={(e) =>
                    setForm({ ...form, groupId: e.target.value })
                  }
                >
                  <option value="">-- Select Group --</option>
                  {(groups || []).map((g) => (
                    <option key={g.id.toString()} value={g.id.toString()}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ledger-balance"
                    className="text-[11px] text-muted-foreground block mb-1"
                  >
                    Opening Balance
                  </label>
                  <input
                    id="ledger-balance"
                    className="tally-input"
                    type="number"
                    value={form.openingBalance}
                    onChange={(e) =>
                      setForm({ ...form, openingBalance: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="ledger-type"
                    className="text-[11px] text-muted-foreground block mb-1"
                  >
                    Balance Type
                  </label>
                  <select
                    id="ledger-type"
                    className="tally-input"
                    value={form.balanceType}
                    onChange={(e) =>
                      setForm({ ...form, balanceType: e.target.value })
                    }
                  >
                    <option value="Dr">Dr (Debit)</option>
                    <option value="Cr">Cr (Credit)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
              <button
                type="button"
                data-ocid="ledger.cancel_button"
                onClick={() => setShowForm(false)}
                className="cmd-btn"
              >
                Cancel (ESC)
              </button>
              <button
                type="button"
                data-ocid="ledger.save_button"
                onClick={handleSave}
                disabled={
                  createLedger.isPending ||
                  updateLedger.isPending ||
                  !form.name.trim()
                }
                className="flex items-center gap-1 px-4 py-1 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
              >
                {createLedger.isPending || updateLedger.isPending ? (
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
