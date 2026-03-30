import { Building2, CheckCircle, Edit2, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Company } from "../backend.d";
import {
  useCreateCompany,
  useGetCompaniesForUser,
  useInitializeLedgerGroups,
} from "../hooks/useQueries";
import type { AppUser } from "../types/rbac";

interface Props {
  onSelectCompany: (company: Company) => void;
  currentUser: AppUser | null;
}

export default function CompanySelection({
  onSelectCompany,
  currentUser,
}: Props) {
  const isAdmin = currentUser?.role === "admin";
  const username = currentUser?.username ?? "";
  const { data: companies, isLoading } = useGetCompaniesForUser(
    username,
    isAdmin,
  );
  const createCompany = useCreateCompany();
  const initGroups = useInitializeLedgerGroups();
  const [showForm, setShowForm] = useState(false);
  const [alterCompany, setAlterCompany] = useState<Company | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState({
    name: "",
    financialYearStart: "2023-04-01",
    financialYearEnd: "2024-03-31",
    currency: "INR",
    gstin: "",
    address: "",
  });

  useEffect(() => {
    if (!initialized) {
      initGroups.mutate();
      setInitialized(true);
    }
  }, [initialized, initGroups]);

  // Keyboard shortcuts: Alt+C / Ctrl+N / F3 = create, Alt+Z = alter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.altKey && e.key.toLowerCase() === "c") ||
        (e.ctrlKey && e.key.toLowerCase() === "n") ||
        e.key === "F3"
      ) {
        e.preventDefault();
        setAlterCompany(null);
        setShowForm(true);
        return;
      }
      if (e.altKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (companies && companies.length > 0) {
          setShowForm(false);
          setAlterCompany(companies[0]);
        }
        return;
      }
      if (e.key === "Escape") {
        setShowForm(false);
        setAlterCompany(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [companies]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const company = await createCompany.mutateAsync({
      ...form,
      owner: username,
    });
    onSelectCompany(company);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background">
      <div className="w-[640px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-teal flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">H</span>
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-foreground">
              HisabKitab Pro
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Select or create a company to proceed
            </p>
          </div>
        </div>

        {/* Companies List */}
        <div className="bg-card border border-border rounded-sm mb-4">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Companies
            </span>
            <button
              type="button"
              data-ocid="company.open_modal_button"
              onClick={() => {
                setAlterCompany(null);
                setShowForm(!showForm);
              }}
              className="flex items-center gap-1 text-[11px] text-teal hover:text-teal-bright transition-colors"
            >
              <Plus size={12} />
              Create New
            </button>
          </div>

          {isLoading && (
            <div
              className="flex items-center justify-center py-8 gap-2"
              data-ocid="company.loading_state"
            >
              <Loader2 size={16} className="animate-spin text-teal" />
              <span className="text-muted-foreground text-[12px]">
                Loading companies...
              </span>
            </div>
          )}

          {!isLoading && companies && companies.length === 0 && !showForm && (
            <div
              className="flex flex-col items-center justify-center py-10 gap-3"
              data-ocid="company.empty_state"
            >
              <Building2 size={32} className="text-border" />
              <p className="text-muted-foreground text-[12px]">
                No companies found. Create your first company.
              </p>
              <button
                type="button"
                data-ocid="company.primary_button"
                onClick={() => setShowForm(true)}
                className="text-[11px] text-teal border border-teal/40 px-3 py-1.5 hover:bg-teal/10 transition-colors"
              >
                + Create Company
              </button>
            </div>
          )}

          {!isLoading &&
            companies &&
            companies.map((c, i) => (
              <div
                key={c.id.toString()}
                className="flex items-center gap-0 border-b border-border/50 last:border-0 group"
              >
                <button
                  type="button"
                  data-ocid={`company.item.${i + 1}`}
                  onClick={() => onSelectCompany(c)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-sm bg-teal/20 flex items-center justify-center">
                    <span className="text-teal text-[13px] font-bold">
                      {c.name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-foreground">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      FY: {c.financialYearStart} to {c.financialYearEnd} |{" "}
                      {c.currency}
                    </div>
                  </div>
                  <CheckCircle
                    size={14}
                    className="text-teal opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
                <button
                  type="button"
                  data-ocid={`company.edit_button.${i + 1}`}
                  onClick={() => {
                    setShowForm(false);
                    setAlterCompany(c);
                  }}
                  className="px-3 py-3 text-[11px] text-muted-foreground hover:text-teal hover:bg-secondary/50 transition-colors border-l border-border/30 flex items-center gap-1"
                  title="Alter Company (Alt+Z)"
                >
                  <Edit2 size={11} />
                  <span>Alter</span>
                </button>
              </div>
            ))}
        </div>

        {/* Create Form */}
        {showForm && (
          <div
            className="bg-card border border-teal/40 rounded-sm p-4"
            data-ocid="company.dialog"
          >
            <div className="text-[13px] font-semibold text-foreground mb-3 pb-2 border-b border-border">
              Create Company
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label
                  htmlFor="co-name"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Company Name *
                </label>
                <input
                  id="co-name"
                  data-ocid="company.input"
                  className="tally-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. ABC Traders"
                />
              </div>
              <div>
                <label
                  htmlFor="co-fy-start"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  FY Start
                </label>
                <input
                  id="co-fy-start"
                  className="tally-input"
                  type="date"
                  value={form.financialYearStart}
                  onChange={(e) =>
                    setForm({ ...form, financialYearStart: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="co-fy-end"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  FY End
                </label>
                <input
                  id="co-fy-end"
                  className="tally-input"
                  type="date"
                  value={form.financialYearEnd}
                  onChange={(e) =>
                    setForm({ ...form, financialYearEnd: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="co-currency"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Currency
                </label>
                <input
                  id="co-currency"
                  className="tally-input"
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                  placeholder="INR"
                />
              </div>
              <div>
                <label
                  htmlFor="co-gstin"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  GSTIN
                </label>
                <input
                  id="co-gstin"
                  className="tally-input"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  placeholder="29ABCDE1234F1Z5"
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="co-address"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Address
                </label>
                <input
                  id="co-address"
                  className="tally-input"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Business address"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                data-ocid="company.cancel_button"
                onClick={() => setShowForm(false)}
                className="cmd-btn"
              >
                Cancel (ESC)
              </button>
              <button
                type="button"
                data-ocid="company.submit_button"
                onClick={handleCreate}
                disabled={createCompany.isPending || !form.name.trim()}
                className="flex items-center gap-1 px-4 py-1 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
              >
                {createCompany.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : null}
                Accept (Enter)
              </button>
            </div>
          </div>
        )}

        {/* Alter (Read-Only View) */}
        {alterCompany && (
          <div
            className="bg-card border border-teal/40 rounded-sm p-4"
            data-ocid="company.modal"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <span className="text-[13px] font-semibold text-foreground">
                Alter Company — {alterCompany.name}
              </span>
              <button
                type="button"
                data-ocid="company.close_button"
                onClick={() => setAlterCompany(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label
                  htmlFor="alt-name"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Company Name
                </label>
                <input
                  id="alt-name"
                  className="tally-input"
                  value={alterCompany.name}
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="alt-fy-start"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  FY Start
                </label>
                <input
                  id="alt-fy-start"
                  className="tally-input"
                  value={alterCompany.financialYearStart}
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="alt-fy-end"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  FY End
                </label>
                <input
                  id="alt-fy-end"
                  className="tally-input"
                  value={alterCompany.financialYearEnd}
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="alt-currency"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Currency
                </label>
                <input
                  id="alt-currency"
                  className="tally-input"
                  value={alterCompany.currency}
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="alt-gstin"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  GSTIN
                </label>
                <input
                  id="alt-gstin"
                  className="tally-input"
                  value={alterCompany.gstin}
                  readOnly
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="alt-address"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Address
                </label>
                <input
                  id="alt-address"
                  className="tally-input"
                  value={alterCompany.address}
                  readOnly
                />
              </div>
            </div>
            <div className="mt-3 text-[10px] text-muted-foreground italic">
              Read-only view. Company details can be modified via backend
              administration.
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="button"
                data-ocid="company.cancel_button"
                onClick={() => setAlterCompany(null)}
                className="cmd-btn"
              >
                Close (ESC)
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 text-[10px] text-muted-foreground text-center">
          <span className="tally-key-badge">Alt+C</span> /{" "}
          <span className="tally-key-badge">Ctrl+N</span> /{" "}
          <span className="tally-key-badge">F3</span> Create Company
          <span className="mx-2">|</span>
          <span className="tally-key-badge">Alt+Z</span> Alter Company
          <span className="mx-2">|</span>
          <span className="tally-key-badge">ESC</span> Close
        </div>
      </div>
    </div>
  );
}
