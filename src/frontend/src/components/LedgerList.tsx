import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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

type LedgerTypeOption = "General" | "Customer" | "Vendor" | "Bank" | "Employee";

type LedgerForm = {
  name: string;
  groupId: string;
  openingBalance: string;
  balanceType: string;
  ledgerType: LedgerTypeOption;
  // Customer/Vendor
  gstin: string;
  pan: string;
  address: string;
  contactNo: string;
  email: string;
  // Bank
  bankAccountNo: string;
  ifscCode: string;
  // Custom fields
  customFields: { key: string; value: string }[];
};

const emptyForm: LedgerForm = {
  name: "",
  groupId: "",
  openingBalance: "0",
  balanceType: "Dr",
  ledgerType: "General",
  gstin: "",
  pan: "",
  address: "",
  contactNo: "",
  email: "",
  bankAccountNo: "",
  ifscCode: "",
  customFields: [],
};

const LEDGER_TYPE_OPTIONS: {
  value: LedgerTypeOption;
  label: string;
  description: string;
}[] = [
  {
    value: "General",
    label: "General",
    description: "Standard ledger account",
  },
  {
    value: "Customer",
    label: "Customer / Debtor",
    description: "Sundry Debtors, customers",
  },
  {
    value: "Vendor",
    label: "Vendor / Creditor",
    description: "Sundry Creditors, suppliers",
  },
  {
    value: "Bank",
    label: "Bank / Cash",
    description: "Bank accounts, cash in hand",
  },
  {
    value: "Employee",
    label: "Employee",
    description: "Staff & payroll ledgers",
  },
];

// Default groups to auto-suggest based on ledger type
const SUGGESTED_GROUPS: Record<LedgerTypeOption, string[]> = {
  General: [],
  Customer: ["Sundry Debtors", "Accounts Receivable"],
  Vendor: ["Sundry Creditors", "Accounts Payable"],
  Bank: ["Bank Accounts", "Cash-in-Hand"],
  Employee: ["Indirect Expenses", "Current Liabilities"],
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
  const [filterType, setFilterType] = useState<string>("All");
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  const companyLedgers = (ledgers || []).filter(
    (l) => l.companyId === company.id,
  );

  const filtered = companyLedgers.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.gstin || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.pan || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.contactNo || "").toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === "All" || (l.ledgerType || "General") === filterType;
    return matchSearch && matchType;
  });

  // Auto-focus name input when form opens
  useEffect(() => {
    if (showForm && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [showForm]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Alt+C = Create
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        openCreate();
      }
      // Escape = Close form
      if (e.key === "Escape" && showForm) {
        e.preventDefault();
        setShowForm(false);
      }
      // Ctrl+A = Accept/Save (when form is open)
      if (e.ctrlKey && e.key === "a" && showForm) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showForm]);

  const openCreate = () => {
    setEditLedger(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowExtraFields(false);
    setShowForm(true);
  };

  const openEdit = (l: Ledger) => {
    setEditLedger(l);
    let customFields: { key: string; value: string }[] = [];
    try {
      const parsed = JSON.parse(l.address || "{}");
      if (parsed.__customFields) {
        customFields = parsed.__customFields;
      }
    } catch {}
    setForm({
      name: l.name,
      groupId: l.groupId.toString(),
      openingBalance: l.openingBalance.toString(),
      balanceType: l.balanceType,
      ledgerType: (l.ledgerType as LedgerTypeOption) || "General",
      gstin: l.gstin || "",
      pan: l.pan || "",
      address: l.address || "",
      contactNo: l.contactNo || "",
      email: l.email || "",
      bankAccountNo: l.bankAccountNo || "",
      ifscCode: l.ifscCode || "",
      customFields,
    });
    setFormErrors({});
    setShowExtraFields(false);
    setShowForm(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.groupId) errors.groupId = "Please select a group";
    if (
      form.gstin &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        form.gstin,
      )
    ) {
      errors.gstin = "Invalid GSTIN format (e.g. 29ABCDE1234F1Z5)";
    }
    if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) {
      errors.pan = "Invalid PAN format (e.g. ABCDE1234F)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const groupId = BigInt(form.groupId || "0");
    const balance = Number.parseFloat(form.openingBalance) || 0;
    try {
      if (editLedger) {
        await updateLedger.mutateAsync({
          ledgerId: editLedger.id,
          name: form.name,
          groupId,
          openingBalance: balance,
          balanceType: form.balanceType,
          ledgerType: form.ledgerType,
          address: form.address || null,
          pan: form.pan || null,
          gstin: form.gstin || null,
          contactNo: form.contactNo || null,
          email: form.email || null,
          bankAccountNo: form.bankAccountNo || null,
          ifscCode: form.ifscCode || null,
        });
        toast.success("Ledger updated successfully");
      } else {
        await createLedger.mutateAsync({
          companyId: company.id,
          name: form.name,
          groupId,
          openingBalance: balance,
          balanceType: form.balanceType,
          ledgerType: form.ledgerType,
          address: form.address || null,
          pan: form.pan || null,
          gstin: form.gstin || null,
          contactNo: form.contactNo || null,
          email: form.email || null,
          bankAccountNo: form.bankAccountNo || null,
          ifscCode: form.ifscCode || null,
        });
        toast.success("Ledger created successfully");
      }
      setShowForm(false);
      setForm(emptyForm);
    } catch (err: any) {
      toast.error(err.message || "Failed to save ledger");
    }
  };

  const groupName = (id: bigint) => {
    const g = (groups || []).find((grp) => grp.id === id);
    return g ? g.name : id.toString();
  };

  const addCustomField = () => {
    setForm((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { key: "", value: "" }],
    }));
  };

  const updateCustomField = (
    idx: number,
    field: "key" | "value",
    val: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) =>
        i === idx ? { ...cf, [field]: val } : cf,
      ),
    }));
  };

  const removeCustomField = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== idx),
    }));
  };

  // Suggest group based on ledger type
  const suggestedGroups = SUGGESTED_GROUPS[form.ledgerType];
  const sortedGroups = [...(groups || [])].sort((a, b) => {
    const aMatch = suggestedGroups.some((sg) =>
      a.name.toLowerCase().includes(sg.toLowerCase()),
    );
    const bMatch = suggestedGroups.some((sg) =>
      b.name.toLowerCase().includes(sg.toLowerCase()),
    );
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return a.name.localeCompare(b.name);
  });

  const showCustomerFields = form.ledgerType === "Customer";
  const showVendorFields = form.ledgerType === "Vendor";
  const showBankFields = form.ledgerType === "Bank";
  const showEmployeeFields = form.ledgerType === "Employee";
  const showGSTFields = showCustomerFields || showVendorFields;

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

      {/* Search + Filter Row */}
      <div className="px-4 py-2 border-b border-border flex gap-2 items-center">
        <div className="flex items-center gap-2 bg-input/30 border border-border px-2 flex-1">
          <Search size={12} className="text-muted-foreground" />
          <input
            data-ocid="ledger.search_input"
            className="bg-transparent py-1.5 text-[12px] text-foreground focus:outline-none w-full"
            placeholder="Search by name, GSTIN, PAN, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={11} />
            </button>
          )}
        </div>
        <select
          className="tally-input text-[11px] w-36"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          data-ocid="ledger.select"
        >
          <option value="All">All Types</option>
          {LEDGER_TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {filtered.length} ledger{filtered.length !== 1 ? "s" : ""}
        </span>
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
                <th>Type</th>
                <th>GST / PAN / Contact</th>
                <th className="text-right">Opening Balance</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
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
                    <td className="font-medium text-foreground">
                      {l.name}
                      {l.email && (
                        <div className="text-[10px] text-muted-foreground">
                          {l.email}
                        </div>
                      )}
                    </td>
                    <td className="text-muted-foreground">
                      {groupName(l.groupId)}
                    </td>
                    <td>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                          l.ledgerType === "Customer"
                            ? "bg-blue-900/30 text-blue-400"
                            : l.ledgerType === "Vendor"
                              ? "bg-purple-900/30 text-purple-400"
                              : l.ledgerType === "Bank"
                                ? "bg-teal/20 text-teal"
                                : l.ledgerType === "Employee"
                                  ? "bg-orange-900/30 text-orange-400"
                                  : "bg-secondary/70 text-muted-foreground"
                        }`}
                      >
                        {l.ledgerType || "General"}
                      </span>
                    </td>
                    <td className="text-[11px] text-muted-foreground">
                      {l.gstin && (
                        <div className="font-mono">GST: {l.gstin}</div>
                      )}
                      {l.pan && <div>PAN: {l.pan}</div>}
                      {l.contactNo && <div>📞 {l.contactNo}</div>}
                    </td>
                    <td className="text-right font-mono text-numeric">
                      {l.openingBalance.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                      <span
                        className={`ml-1 text-[10px] ${l.balanceType === "Dr" ? "text-blue-400" : "text-green-400"}`}
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
                        title="Edit Ledger"
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
        <div className="absolute inset-0 bg-background/80 flex items-start justify-center z-50 overflow-auto py-4">
          <div
            className="bg-card border border-teal/40 w-[600px] rounded-sm flex flex-col"
            data-ocid="ledger.dialog"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <span className="text-[13px] font-semibold">
                {editLedger ? "Alter Ledger" : "Create Ledger"}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="hk-key-badge">Ctrl+A</span> Accept
                <span className="hk-key-badge ml-1">Esc</span> Close
                <button
                  type="button"
                  data-ocid="ledger.close_button"
                  onClick={() => setShowForm(false)}
                  className="ml-2 hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3 overflow-auto max-h-[80vh]">
              {/* Ledger Type - First field */}
              <div>
                <label
                  htmlFor="ledger-type-selector"
                  className="text-[11px] text-muted-foreground block mb-1 font-medium"
                >
                  Ledger Type *
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {LEDGER_TYPE_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          ledgerType: t.value,
                          groupId: "",
                        }))
                      }
                      title={t.description}
                      className={`py-1.5 px-2 text-[10px] font-medium border transition-colors rounded-sm ${
                        form.ledgerType === t.value
                          ? "border-teal bg-teal/20 text-teal"
                          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {suggestedGroups.length > 0 && (
                  <p className="text-[10px] text-teal mt-1">
                    💡 Suggested group: {suggestedGroups.join(", ")}
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="ledger-name"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Ledger Name *
                </label>
                <input
                  id="ledger-name"
                  ref={nameInputRef}
                  data-ocid="ledger.input"
                  className={`tally-input ${formErrors.name ? "border-destructive" : ""}`}
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (formErrors.name)
                      setFormErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. ABC Traders, HDFC Bank, Cash"
                />
                {formErrors.name && (
                  <p
                    className="text-[10px] text-destructive mt-0.5 flex items-center gap-1"
                    data-ocid="ledger.error_state"
                  >
                    <AlertCircle size={10} /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* Under Group */}
              <div>
                <label
                  htmlFor="ledger-group"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Under Group *
                </label>
                <select
                  id="ledger-group"
                  data-ocid="ledger.select"
                  className={`tally-input ${formErrors.groupId ? "border-destructive" : ""}`}
                  value={form.groupId}
                  onChange={(e) => {
                    setForm({ ...form, groupId: e.target.value });
                    if (formErrors.groupId)
                      setFormErrors((prev) => ({ ...prev, groupId: "" }));
                  }}
                >
                  <option value="">-- Select Group --</option>
                  {sortedGroups.map((g) => {
                    const isSuggested = suggestedGroups.some((sg) =>
                      g.name.toLowerCase().includes(sg.toLowerCase()),
                    );
                    return (
                      <option key={g.id.toString()} value={g.id.toString()}>
                        {isSuggested ? "★ " : ""}
                        {g.name}
                      </option>
                    );
                  })}
                </select>
                {formErrors.groupId && (
                  <p
                    className="text-[10px] text-destructive mt-0.5 flex items-center gap-1"
                    data-ocid="ledger.error_state"
                  >
                    <AlertCircle size={10} /> {formErrors.groupId}
                  </p>
                )}
              </div>

              {/* Opening Balance */}
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
                    htmlFor="ledger-baltype"
                    className="text-[11px] text-muted-foreground block mb-1"
                  >
                    Balance Type
                  </label>
                  <select
                    id="ledger-baltype"
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

              {/* Dynamic Fields Based on Ledger Type */}
              {(showGSTFields || showVendorFields) && (
                <div className="border border-border/60 rounded-sm p-3 bg-secondary/20">
                  <p className="text-[10px] font-semibold text-teal uppercase tracking-wide mb-2">
                    {showCustomerFields ? "Customer Details" : "Vendor Details"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="ledger-gstin"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        GSTIN
                      </label>
                      <input
                        id="ledger-gstin"
                        className={`tally-input ${formErrors.gstin ? "border-destructive" : ""}`}
                        value={form.gstin}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            gstin: e.target.value.toUpperCase(),
                          });
                          if (formErrors.gstin)
                            setFormErrors((prev) => ({ ...prev, gstin: "" }));
                        }}
                        placeholder="29ABCDE1234F1Z5"
                        maxLength={15}
                      />
                      {formErrors.gstin && (
                        <p className="text-[10px] text-destructive mt-0.5 flex items-center gap-1">
                          <AlertCircle size={10} /> {formErrors.gstin}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="ledger-pan"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        PAN Number
                      </label>
                      <input
                        id="ledger-pan"
                        className={`tally-input ${formErrors.pan ? "border-destructive" : ""}`}
                        value={form.pan}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            pan: e.target.value.toUpperCase(),
                          });
                          if (formErrors.pan)
                            setFormErrors((prev) => ({ ...prev, pan: "" }));
                        }}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                      {formErrors.pan && (
                        <p className="text-[10px] text-destructive mt-0.5 flex items-center gap-1">
                          <AlertCircle size={10} /> {formErrors.pan}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="ledger-contact"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        Contact No.
                      </label>
                      <input
                        id="ledger-contact"
                        className="tally-input"
                        value={form.contactNo}
                        onChange={(e) =>
                          setForm({ ...form, contactNo: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    {showCustomerFields && (
                      <div>
                        <label
                          htmlFor="ledger-email"
                          className="text-[11px] text-muted-foreground block mb-1"
                        >
                          Email
                        </label>
                        <input
                          id="ledger-email"
                          className="tally-input"
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="contact@example.com"
                        />
                      </div>
                    )}
                    <div className="col-span-2">
                      <label
                        htmlFor="ledger-address"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        Address
                      </label>
                      <textarea
                        id="ledger-address"
                        className="tally-input resize-none"
                        rows={2}
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                        placeholder="Street, City, State, PIN"
                      />
                    </div>
                  </div>
                </div>
              )}

              {showBankFields && (
                <div className="border border-border/60 rounded-sm p-3 bg-secondary/20">
                  <p className="text-[10px] font-semibold text-teal uppercase tracking-wide mb-2">
                    Bank Account Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="ledger-accno"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        Account Number
                      </label>
                      <input
                        id="ledger-accno"
                        className="tally-input font-mono"
                        value={form.bankAccountNo}
                        onChange={(e) =>
                          setForm({ ...form, bankAccountNo: e.target.value })
                        }
                        placeholder="XXXX XXXX XXXX"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ledger-ifsc"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        IFSC Code
                      </label>
                      <input
                        id="ledger-ifsc"
                        className="tally-input font-mono"
                        value={form.ifscCode}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            ifscCode: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="HDFC0001234"
                        maxLength={11}
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="ledger-branch"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        Bank Name / Branch
                      </label>
                      <input
                        id="ledger-branch"
                        className="tally-input"
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                        placeholder="HDFC Bank, MG Road Branch, Bangalore"
                      />
                    </div>
                  </div>
                </div>
              )}

              {showEmployeeFields && (
                <div className="border border-border/60 rounded-sm p-3 bg-secondary/20">
                  <p className="text-[10px] font-semibold text-teal uppercase tracking-wide mb-2">
                    Employee Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="emp-contact"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        Contact No.
                      </label>
                      <input
                        id="emp-contact"
                        className="tally-input"
                        value={form.contactNo}
                        onChange={(e) =>
                          setForm({ ...form, contactNo: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="emp-email"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        Email
                      </label>
                      <input
                        id="emp-email"
                        className="tally-input"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="employee@company.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="emp-pan"
                        className="text-[11px] text-muted-foreground block mb-1"
                      >
                        PAN
                      </label>
                      <input
                        id="emp-pan"
                        className="tally-input"
                        value={form.pan}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            pan: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Fields - Expandable */}
              <div className="border border-border/40 rounded-sm">
                <button
                  type="button"
                  onClick={() => setShowExtraFields((v) => !v)}
                  className="flex items-center justify-between w-full px-3 py-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>⊕ Custom Fields ({form.customFields.length})</span>
                  {showExtraFields ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </button>
                {showExtraFields && (
                  <div className="px-3 pb-3 flex flex-col gap-2">
                    {form.customFields.map((cf, idx) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: order-dependent
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          className="tally-input flex-1"
                          placeholder="Field name"
                          value={cf.key}
                          onChange={(e) =>
                            updateCustomField(idx, "key", e.target.value)
                          }
                        />
                        <input
                          className="tally-input flex-1"
                          placeholder="Value"
                          value={cf.value}
                          onChange={(e) =>
                            updateCustomField(idx, "value", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomField(idx)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCustomField}
                      className="flex items-center gap-1 text-[11px] text-teal hover:text-teal-bright"
                    >
                      <Plus size={11} /> Add Custom Field
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-secondary/20">
              <span className="text-[10px] text-muted-foreground">
                {editLedger ? `Editing: ${editLedger.name}` : "New Ledger"}
              </span>
              <div className="flex gap-2">
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
        </div>
      )}
    </div>
  );
}
