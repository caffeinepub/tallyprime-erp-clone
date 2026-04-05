import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  FileEdit,
  Loader2,
  Plus,
  Printer,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Company, VoucherEntry as VEntry } from "../backend.d";
import {
  useCreateVoucher,
  useCreateVoucherDraft,
  useDeleteVoucherDraft,
  useGetAllLedgerGroups,
  useGetAllLedgers,
  useGetAllStockItems,
  useGetAllVoucherDrafts,
  useGetCompanySettings,
} from "../hooks/useQueries";
import { callOpenAI } from "../utils/openai";
import InvoicePrint from "./InvoicePrint";

interface Props {
  company: Company;
  defaultType?: string;
}

const VOUCHER_TYPES = [
  "Payment",
  "Receipt",
  "Contra",
  "Journal",
  "Sales",
  "Purchase",
];
const FKEYS = ["F4", "F5", "F6", "F7", "F8", "F9"];

type EntryRow = {
  ledgerId: string;
  entryType: "Dr" | "Cr";
  amount: string;
};

type ItemRow = {
  itemId: string;
  itemName: string;
  qty: string;
  unit: string;
  rate: string;
  amount: string;
  gstPct: string;
};

const emptyItemRow = (): ItemRow => ({
  itemId: "",
  itemName: "",
  qty: "1",
  unit: "pcs",
  rate: "",
  amount: "",
  gstPct: "0",
});

function isGroupBankOrCash(groupName: string): boolean {
  const n = groupName.toLowerCase();
  return n.includes("bank") || n.includes("cash");
}

type FeatureSettings = {
  enableTransport: boolean;
  enableEwayBill: boolean;
  enableInventory: boolean;
  enableGST: boolean;
  enableExportImport: boolean;
  desktopMode: string;
};

const DEFAULT_FEATURES: FeatureSettings = {
  enableTransport: false,
  enableEwayBill: false,
  enableInventory: true,
  enableGST: true,
  enableExportImport: false,
  desktopMode: "basic",
};

function loadFeatureSettings(): FeatureSettings {
  try {
    const raw = localStorage.getItem("hk_feature_settings");
    if (raw) return { ...DEFAULT_FEATURES, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_FEATURES;
}

export default function VoucherEntry({
  company,
  defaultType = "Journal",
}: Props) {
  const { data: ledgers } = useGetAllLedgers();
  const { data: groups } = useGetAllLedgerGroups();
  const { data: stockItems } = useGetAllStockItems();
  const { data: drafts } = useGetAllVoucherDrafts(company.id);
  const { data: companySettings } = useGetCompanySettings(company.id);
  const createVoucher = useCreateVoucher();
  const createDraft = useCreateVoucherDraft();
  const deleteDraft = useDeleteVoucherDraft();

  const [voucherType, setVoucherType] = useState(defaultType);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [narration, setNarration] = useState("");
  const [voucherNumber, setVoucherNumber] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [aiNarrating, setAiNarrating] = useState(false);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Feature settings from localStorage or backend settings
  const [features] = useState<FeatureSettings>(() => loadFeatureSettings());
  const effectiveFeatures: FeatureSettings = companySettings
    ? {
        enableTransport: companySettings.enableTransport,
        enableEwayBill: companySettings.enableEwayBill,
        enableInventory: companySettings.enableInventory,
        enableGST: companySettings.enableGST,
        enableExportImport: companySettings.enableExportImport,
        desktopMode: companySettings.desktopMode,
      }
    : features;

  // Payment / Receipt / Contra state
  const [payPartyLedger, setPayPartyLedger] = useState("");
  const [payBankLedger, setPayBankLedger] = useState("");
  const [payAmount, setPayAmount] = useState("");

  // Journal / multi-row state
  const [entries, setEntries] = useState<EntryRow[]>([
    { ledgerId: "", entryType: "Dr", amount: "" },
    { ledgerId: "", entryType: "Cr", amount: "" },
  ]);

  // Sales / Purchase inventory state
  const [salesPartyLedger, setSalesPartyLedger] = useState("");
  const [salesLedger, setSalesLedger] = useState(""); // auto-selected
  const [itemRows, setItemRows] = useState<ItemRow[]>([emptyItemRow()]);

  // Extra fields
  const [transportName, setTransportName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [ewayBillNo, setEwayBillNo] = useState("");
  const [exportDestination, setExportDestination] = useState("");
  const [portCode, setPortCode] = useState("");

  const companyLedgers = (ledgers || []).filter(
    (l) => l.companyId === company.id,
  );
  const companyGroups = groups || [];

  const groupNameFor = (ledgerId: string) => {
    const l = companyLedgers.find((x) => x.id.toString() === ledgerId);
    if (!l) return "";
    const g = companyGroups.find((x) => x.id === l.groupId);
    return g ? g.name : "";
  };

  const bankCashLedgers = companyLedgers.filter((l) => {
    const g = companyGroups.find((x) => x.id === l.groupId);
    return g ? isGroupBankOrCash(g.name) : false;
  });

  const nonBankCashLedgers = companyLedgers.filter((l) => {
    const g = companyGroups.find((x) => x.id === l.groupId);
    return g ? !isGroupBankOrCash(g.name) : true;
  });

  const salesGroupLedgers = companyLedgers.filter((l) => {
    const g = companyGroups.find((x) => x.id === l.groupId);
    return g ? g.name.toLowerCase().includes("sales") : false;
  });

  const purchaseGroupLedgers = companyLedgers.filter((l) => {
    const g = companyGroups.find((x) => x.id === l.groupId);
    return g ? g.name.toLowerCase().includes("purchase") : false;
  });

  const debtorLedgers = companyLedgers.filter((l) => {
    const g = companyGroups.find((x) => x.id === l.groupId);
    const name = g ? g.name.toLowerCase() : "";
    return (
      name.includes("debtor") ||
      name.includes("receivable") ||
      l.ledgerType === "Customer"
    );
  });

  const creditorLedgers = companyLedgers.filter((l) => {
    const g = companyGroups.find((x) => x.id === l.groupId);
    const name = g ? g.name.toLowerCase() : "";
    return (
      name.includes("creditor") ||
      name.includes("payable") ||
      l.ledgerType === "Vendor"
    );
  });

  // Auto-select sales ledger when type changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - array lengths as stable deps
  useEffect(() => {
    if (
      voucherType === "Sales" &&
      salesGroupLedgers.length > 0 &&
      !salesLedger
    ) {
      setSalesLedger(salesGroupLedgers[0].id.toString());
    }
    if (
      voucherType === "Purchase" &&
      purchaseGroupLedgers.length > 0 &&
      !salesLedger
    ) {
      setSalesLedger(purchaseGroupLedgers[0].id.toString());
    }
  }, [
    voucherType,
    salesGroupLedgers.length,
    purchaseGroupLedgers.length,
    salesLedger,
  ]);

  // Keyboard shortcuts: F4-F9 for voucher types, Ctrl+A save, Escape clear
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyboard handler needs full form state
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F4") {
        e.preventDefault();
        setVoucherType("Payment");
      }
      if (e.key === "F5") {
        e.preventDefault();
        setVoucherType("Receipt");
      }
      if (e.key === "F6") {
        e.preventDefault();
        setVoucherType("Contra");
      }
      if (e.key === "F7") {
        e.preventDefault();
        setVoucherType("Journal");
      }
      if (e.key === "F8") {
        e.preventDefault();
        setVoucherType("Sales");
      }
      if (e.key === "F9") {
        e.preventDefault();
        setVoucherType("Purchase");
      }
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    voucherType,
    payPartyLedger,
    payBankLedger,
    payAmount,
    entries,
    salesPartyLedger,
    salesLedger,
    itemRows,
    narration,
  ]);

  // ── Item Row helpers ─────────────────────────────────────────────
  const updateItemRow = (idx: number, field: keyof ItemRow, val: string) => {
    setItemRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const updated = { ...row, [field]: val };
        // If item selected from stock, auto-fill unit, rate
        if (field === "itemId" && val) {
          const si = (stockItems || []).find((s) => s.id.toString() === val);
          if (si) {
            updated.itemName = si.name;
            updated.unit = si.unit;
            updated.rate = si.openingRate.toString();
            updated.gstPct = si.gstRate.toString();
          }
        }
        // Auto-calc amount = qty * rate
        if (field === "qty" || field === "rate") {
          const qty =
            Number.parseFloat(field === "qty" ? val : updated.qty) || 0;
          const rate =
            Number.parseFloat(field === "rate" ? val : updated.rate) || 0;
          updated.amount = (qty * rate).toFixed(2);
        }
        return updated;
      }),
    );
  };

  const addItemRow = () => setItemRows((prev) => [...prev, emptyItemRow()]);
  const removeItemRow = (idx: number) =>
    setItemRows((prev) => prev.filter((_, i) => i !== idx));

  // ── Totals ──────────────────────────────────────────────────────
  const itemSubtotal = itemRows.reduce(
    (s, r) => s + (Number.parseFloat(r.amount) || 0),
    0,
  );
  const gstTotal = effectiveFeatures.enableGST
    ? itemRows.reduce((s, r) => {
        const base = Number.parseFloat(r.amount) || 0;
        const pct = Number.parseFloat(r.gstPct) || 0;
        return s + (base * pct) / 100;
      }, 0)
    : 0;
  const invoiceTotal = itemSubtotal + gstTotal;

  const totalDr = entries
    .filter((e) => e.entryType === "Dr")
    .reduce((s, e) => s + (Number.parseFloat(e.amount) || 0), 0);
  const totalCr = entries
    .filter((e) => e.entryType === "Cr")
    .reduce((s, e) => s + (Number.parseFloat(e.amount) || 0), 0);

  const getPaymentBalance = () => {
    const amt = Number.parseFloat(payAmount) || 0;
    return amt > 0 && payPartyLedger && payBankLedger;
  };

  const isSimpleVoucher = ["Payment", "Receipt", "Contra"].includes(
    voucherType,
  );
  const isInventoryVoucher = ["Sales", "Purchase"].includes(voucherType);
  const isJournalVoucher = voucherType === "Journal";

  const isBalanced = isSimpleVoucher
    ? getPaymentBalance()
    : isInventoryVoucher
      ? !!salesPartyLedger &&
        !!salesLedger &&
        itemRows.some((r) => Number.parseFloat(r.amount) > 0)
      : Math.abs(totalDr - totalCr) < 0.001 && totalDr > 0;

  // ── Handlers ────────────────────────────────────────────────────
  const handleClear = () => {
    setPayPartyLedger("");
    setPayBankLedger("");
    setPayAmount("");
    setEntries([
      { ledgerId: "", entryType: "Dr", amount: "" },
      { ledgerId: "", entryType: "Cr", amount: "" },
    ]);
    setSalesPartyLedger("");
    setItemRows([emptyItemRow()]);
    setNarration("");
    setValidationError(null);
    setTransportName("");
    setVehicleNo("");
    setEwayBillNo("");
    setExportDestination("");
    setPortCode("");
  };

  const buildEntriesFromState = (): VEntry[] => {
    if (voucherType === "Payment") {
      return [
        {
          ledgerId: BigInt(payPartyLedger),
          entryType: "Dr",
          amount: Number.parseFloat(payAmount),
        },
        {
          ledgerId: BigInt(payBankLedger),
          entryType: "Cr",
          amount: Number.parseFloat(payAmount),
        },
      ];
    }
    if (voucherType === "Receipt") {
      return [
        {
          ledgerId: BigInt(payBankLedger),
          entryType: "Dr",
          amount: Number.parseFloat(payAmount),
        },
        {
          ledgerId: BigInt(payPartyLedger),
          entryType: "Cr",
          amount: Number.parseFloat(payAmount),
        },
      ];
    }
    if (voucherType === "Contra") {
      return [
        {
          ledgerId: BigInt(payPartyLedger),
          entryType: "Dr",
          amount: Number.parseFloat(payAmount),
        },
        {
          ledgerId: BigInt(payBankLedger),
          entryType: "Cr",
          amount: Number.parseFloat(payAmount),
        },
      ];
    }
    if (isInventoryVoucher) {
      const result: VEntry[] = [];
      // Party ledger (Dr for Sales, Cr for Purchase)
      result.push({
        ledgerId: BigInt(salesPartyLedger),
        entryType: voucherType === "Sales" ? "Dr" : "Cr",
        amount: invoiceTotal,
      });
      // Sales/Purchase ledger (Cr for Sales, Dr for Purchase)
      result.push({
        ledgerId: BigInt(salesLedger),
        entryType: voucherType === "Sales" ? "Cr" : "Dr",
        amount: itemSubtotal,
      });
      // GST entries if enabled
      if (effectiveFeatures.enableGST && gstTotal > 0) {
        const gstLedger = companyLedgers.find((l) => {
          const g = companyGroups.find((x) => x.id === l.groupId);
          const name = g ? g.name.toLowerCase() : "";
          return (
            name.includes("gst") ||
            name.includes("tax") ||
            l.name.toLowerCase().includes("gst output") ||
            l.name.toLowerCase().includes("gst input")
          );
        });
        if (gstLedger) {
          result.push({
            ledgerId: gstLedger.id,
            entryType: voucherType === "Sales" ? "Cr" : "Dr",
            amount: gstTotal,
          });
        }
      }
      return result;
    }
    // Journal
    return entries
      .filter((e) => e.ledgerId && Number.parseFloat(e.amount) > 0)
      .map((e) => ({
        ledgerId: BigInt(e.ledgerId),
        entryType: e.entryType,
        amount: Number.parseFloat(e.amount),
      }));
  };

  const handleAINarration = async () => {
    setAiNarrating(true);
    try {
      let desc = "";
      if (isSimpleVoucher) {
        const partyName =
          companyLedgers.find((l) => l.id.toString() === payPartyLedger)
            ?.name ?? "party";
        const bankName =
          companyLedgers.find((l) => l.id.toString() === payBankLedger)?.name ??
          "bank";
        desc = `${voucherType} of ₹${payAmount} to ${partyName} via ${bankName}`;
      } else if (isInventoryVoucher) {
        const partyName =
          companyLedgers.find((l) => l.id.toString() === salesPartyLedger)
            ?.name ?? "party";
        const items = itemRows
          .filter((r) => r.itemName)
          .map((r) => `${r.itemName} x${r.qty}`)
          .join(", ");
        desc = `${voucherType} to ${partyName}: ${items}, Total ₹${invoiceTotal.toFixed(2)}`;
      } else {
        const entryList = entries
          .filter((e) => e.ledgerId && Number.parseFloat(e.amount) > 0)
          .map((e) => {
            const name =
              companyLedgers.find((l) => l.id.toString() === e.ledgerId)
                ?.name ?? e.ledgerId;
            return `${name} ${e.entryType} ₹${e.amount}`;
          })
          .join(", ");
        desc = entryList;
      }
      const prompt = `Generate a professional accounting narration in 1 sentence for: ${voucherType} entry. Details: ${desc}`;
      const result = await callOpenAI(prompt);
      setNarration(result.trim());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAiNarrating(false);
    }
  };

  const handleSaveDraft = async () => {
    const entriesJson = JSON.stringify({
      payPartyLedger,
      payBankLedger,
      payAmount,
      entries,
      salesPartyLedger,
      salesLedger,
      itemRows,
      transportName,
      vehicleNo,
      ewayBillNo,
      exportDestination,
      portCode,
    });
    try {
      await createDraft.mutateAsync({
        companyId: company.id,
        voucherType,
        date,
        narration,
        entriesJson,
      });
      toast.success("Draft saved! You can resume it later.");
    } catch (e: any) {
      toast.error(e.message || "Failed to save draft");
    }
  };

  const loadDraft = (draft: any) => {
    setVoucherType(draft.voucherType);
    setDate(draft.date);
    setNarration(draft.narration);
    try {
      const d = JSON.parse(draft.entriesJson);
      if (d.payPartyLedger !== undefined) setPayPartyLedger(d.payPartyLedger);
      if (d.payBankLedger !== undefined) setPayBankLedger(d.payBankLedger);
      if (d.payAmount !== undefined) setPayAmount(d.payAmount);
      if (d.entries !== undefined) setEntries(d.entries);
      if (d.salesPartyLedger !== undefined)
        setSalesPartyLedger(d.salesPartyLedger);
      if (d.salesLedger !== undefined) setSalesLedger(d.salesLedger);
      if (d.itemRows !== undefined) setItemRows(d.itemRows);
      if (d.transportName !== undefined) setTransportName(d.transportName);
      if (d.vehicleNo !== undefined) setVehicleNo(d.vehicleNo);
      if (d.ewayBillNo !== undefined) setEwayBillNo(d.ewayBillNo);
      if (d.exportDestination !== undefined)
        setExportDestination(d.exportDestination);
      if (d.portCode !== undefined) setPortCode(d.portCode);
    } catch {}
    setShowDrafts(false);
    toast.success("Draft loaded");
  };

  const handleDeleteDraft = async (id: bigint) => {
    await deleteDraft.mutateAsync({ id, companyId: company.id });
    toast.success("Draft deleted");
  };

  const handleDuplicate = () => {
    // Duplicate: keep all current form data, just reset date to today and increment vNo
    setDate(new Date().toISOString().split("T")[0]);
    setVoucherNumber((n) => (Number.parseInt(n) + 1).toString());
    setSubmitted(false);
    toast.success("Duplicated — edit and save");
  };

  const handleSubmit = async () => {
    setValidationError(null);

    // Validate Contra — only bank/cash allowed
    if (voucherType === "Contra") {
      const fromGroup = groupNameFor(payPartyLedger);
      const toGroup = groupNameFor(payBankLedger);
      if (payPartyLedger && !isGroupBankOrCash(fromGroup)) {
        setValidationError(
          "Contra entry: From Account must be Bank or Cash only",
        );
        return;
      }
      if (payBankLedger && !isGroupBankOrCash(toGroup)) {
        setValidationError(
          "Contra entry: To Account must be Bank or Cash only",
        );
        return;
      }
    }

    if (!isBalanced) {
      setValidationError(
        isSimpleVoucher
          ? "Please fill party ledger, bank/cash ledger, and amount"
          : isInventoryVoucher
            ? "Please select party, sales/purchase ledger and add at least one item"
            : `Debit (${totalDr.toFixed(2)}) and Credit (${totalCr.toFixed(2)}) totals must be equal`,
      );
      return;
    }

    const vEntries = buildEntriesFromState();
    if (vEntries.length < 2) {
      setValidationError("At least two accounting entries required");
      return;
    }

    const dateTs = BigInt(new Date(date).getTime()) * 1000000n;

    await createVoucher.mutateAsync({
      companyId: company.id,
      voucherType,
      voucherNumber: BigInt(voucherNumber),
      date: dateTs,
      narration,
      entries: vEntries,
    });

    toast.success(`${voucherType} entry saved!`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      handleClear();
      setVoucherNumber((n) => (Number.parseInt(n) + 1).toString());
    }, 1500);
  };

  const partyLabelForType = () => {
    if (voucherType === "Payment") return "Pay To (DR)";
    if (voucherType === "Receipt") return "Received From (CR)";
    if (voucherType === "Contra") return "From Account (DR)";
    return "Party";
  };

  const bankLabelForType = () => {
    if (voucherType === "Payment") return "Paid From (CR) — Bank/Cash Only";
    if (voucherType === "Receipt") return "Deposited To (DR) — Bank/Cash Only";
    if (voucherType === "Contra") return "To Account (CR) — Bank/Cash Only";
    return "Bank/Cash";
  };

  // Print entries for Sales/Purchase invoice
  const printEntries = isInventoryVoucher
    ? itemRows
        .filter((r) => Number.parseFloat(r.amount) > 0)
        .map((r) => ({
          ledgerName: r.itemName || `Item #${r.itemId}`,
          entryType: "Dr" as const,
          amount: Number.parseFloat(r.amount) || 0,
        }))
    : entries
        .filter((e) => e.ledgerId && Number.parseFloat(e.amount) > 0)
        .map((e) => ({
          ledgerName:
            companyLedgers.find((l) => l.id.toString() === e.ledgerId)?.name ??
            `Ledger #${e.ledgerId}`,
          entryType: e.entryType as "Dr" | "Cr",
          amount: Number.parseFloat(e.amount) || 0,
        }));

  const canPrint = isInventoryVoucher && printEntries.length > 0;
  const companyDrafts = (drafts || []).filter(() => true); // already filtered by company in query

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-4 py-2 bg-secondary/50 border-b border-border flex items-center justify-between">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            Voucher Entry
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            {company.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Drafts button */}
          <button
            type="button"
            data-ocid="voucher.open_modal_button"
            onClick={() => setShowDrafts(true)}
            className="flex items-center gap-1 cmd-btn text-[10px] relative"
            title="Saved Drafts"
          >
            <FileEdit size={11} /> Drafts
            {companyDrafts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal text-[9px] text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                {companyDrafts.length}
              </span>
            )}
          </button>
          <button
            type="button"
            data-ocid="voucher.secondary_button"
            onClick={handleDuplicate}
            className="flex items-center gap-1 cmd-btn text-[10px]"
            title="Duplicate this entry (Alt+D)"
          >
            <ClipboardCopy size={11} /> Duplicate
          </button>
          {canPrint && (
            <button
              type="button"
              data-ocid="voucher.print.button"
              onClick={() => setShowInvoicePrint(true)}
              className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 transition-colors"
            >
              <Printer size={12} /> Print Invoice
            </button>
          )}
        </div>
      </div>

      {/* Voucher Type Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {VOUCHER_TYPES.map((vt, i) => (
          <button
            type="button"
            key={vt}
            data-ocid={`voucher.${vt.toLowerCase()}.tab`}
            onClick={() => {
              setVoucherType(vt);
              setValidationError(null);
            }}
            className={`px-3 py-1.5 text-[11px] font-medium border-r border-border whitespace-nowrap transition-colors ${
              voucherType === vt
                ? "bg-teal text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            {FKEYS[i]}: {vt}
          </button>
        ))}
      </div>

      {/* Form Area */}
      <div className="flex-1 overflow-auto p-4">
        {/* Top Meta Row */}
        <div className="flex gap-4 mb-4">
          <div>
            <label
              htmlFor="vch-date"
              className="text-[10px] text-muted-foreground uppercase block mb-1"
            >
              Date
            </label>
            <input
              id="vch-date"
              data-ocid="voucher.input"
              type="date"
              className="tally-input w-36"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="vch-no"
              className="text-[10px] text-muted-foreground uppercase block mb-1"
            >
              Vch No.
            </label>
            <input
              id="vch-no"
              className="tally-input w-24"
              value={voucherNumber}
              onChange={(e) => setVoucherNumber(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="vch-narration"
              className="text-[10px] text-muted-foreground uppercase block mb-1"
            >
              Narration
            </label>
            <input
              id="vch-narration"
              data-ocid="voucher.textarea"
              className="tally-input w-full"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Enter narration or use AI..."
            />
            <button
              type="button"
              data-ocid="voucher.primary_button"
              onClick={handleAINarration}
              disabled={aiNarrating}
              className="mt-1 flex items-center gap-1 text-[10px] text-teal hover:text-teal/80 disabled:opacity-50"
            >
              {aiNarrating ? (
                <span className="animate-spin inline-block w-3 h-3 border border-teal border-t-transparent rounded-full" />
              ) : (
                <Sparkles size={11} />
              )}
              AI Narration
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div
            data-ocid="voucher.error_state"
            className="flex items-center gap-2 px-3 py-2 mb-3 bg-destructive/10 border border-destructive/30 text-destructive text-[11px] rounded-sm"
          >
            <AlertCircle size={12} />
            {validationError}
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="ml-auto"
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* ── PAYMENT / RECEIPT / CONTRA Form ─────────────────── */}
        {isSimpleVoucher && (
          <div className="border border-border rounded-sm p-4 bg-secondary/10">
            <div className="grid gap-3">
              {/* Rule hint */}
              <div className="text-[10px] text-muted-foreground bg-secondary/40 px-3 py-1.5 rounded-sm border border-border/40">
                {voucherType === "Payment" &&
                  "💡 Payment: DR Party/Expense → CR Bank/Cash"}
                {voucherType === "Receipt" &&
                  "💡 Receipt: DR Bank/Cash → CR Party/Income"}
                {voucherType === "Contra" &&
                  "💡 Contra: DR Bank/Cash → CR Bank/Cash (transfers between bank/cash only)"}
              </div>

              {/* Party Ledger */}
              <div>
                <label
                  htmlFor="pay-party"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  {partyLabelForType()} *
                </label>
                <select
                  id="pay-party"
                  data-ocid="voucher.select"
                  className="tally-input"
                  value={payPartyLedger}
                  onChange={(e) => {
                    setPayPartyLedger(e.target.value);
                    setValidationError(null);
                  }}
                >
                  <option value="">-- Select Ledger --</option>
                  {(voucherType === "Contra"
                    ? bankCashLedgers
                    : nonBankCashLedgers
                  ).map((l) => (
                    <option key={l.id.toString()} value={l.id.toString()}>
                      {l.name}
                    </option>
                  ))}
                </select>
                {payPartyLedger &&
                  voucherType === "Contra" &&
                  !isGroupBankOrCash(groupNameFor(payPartyLedger)) && (
                    <p className="text-[10px] text-destructive mt-0.5 flex items-center gap-1">
                      <AlertCircle size={10} /> Contra only allows Bank/Cash
                      ledgers
                    </p>
                  )}
              </div>

              {/* Bank/Cash Ledger */}
              <div>
                <label
                  htmlFor="pay-bank"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  {bankLabelForType()} *
                </label>
                <select
                  id="pay-bank"
                  className="tally-input"
                  value={payBankLedger}
                  onChange={(e) => {
                    setPayBankLedger(e.target.value);
                    setValidationError(null);
                  }}
                >
                  <option value="">-- Select Bank/Cash --</option>
                  {bankCashLedgers.map((l) => (
                    <option key={l.id.toString()} value={l.id.toString()}>
                      {l.name}
                    </option>
                  ))}
                </select>
                {bankCashLedgers.length === 0 && (
                  <p className="text-[10px] text-amber-400 mt-0.5">
                    ⚠ No Bank/Cash ledgers found. Create one first.
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="pay-amount"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  Amount (₹) *
                </label>
                <input
                  id="pay-amount"
                  type="number"
                  className="tally-input text-right font-mono text-[14px] w-full"
                  value={payAmount}
                  onChange={(e) => {
                    setPayAmount(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="0.00"
                />
              </div>

              {/* DR/CR Summary */}
              {payAmount && payPartyLedger && payBankLedger && (
                <div className="bg-secondary/30 border border-border/40 rounded-sm p-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-green-400">
                      DR:{" "}
                      {companyLedgers.find(
                        (l) =>
                          l.id.toString() ===
                          (voucherType === "Receipt"
                            ? payBankLedger
                            : payPartyLedger),
                      )?.name ?? "—"}
                    </span>
                    <span className="font-mono text-green-400">
                      ₹
                      {Number.parseFloat(payAmount || "0").toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-blue-400">
                      CR:{" "}
                      {companyLedgers.find(
                        (l) =>
                          l.id.toString() ===
                          (voucherType === "Receipt"
                            ? payPartyLedger
                            : payBankLedger),
                      )?.name ?? "—"}
                    </span>
                    <span className="font-mono text-blue-400">
                      ₹
                      {Number.parseFloat(payAmount || "0").toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── JOURNAL Form ─────────────────────────────────────── */}
        {isJournalVoucher && (
          <div className="border border-border">
            <table className="w-full tally-table">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Ledger Account</th>
                  <th className="w-20">Dr/Cr</th>
                  <th className="w-32 text-right">Amount (₹)</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {entries.map((row, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: order-dependent
                  <tr key={i} data-ocid={`voucher.item.${i + 1}`}>
                    <td className="text-center text-muted-foreground">
                      {i + 1}
                    </td>
                    <td>
                      <select
                        className="tally-input"
                        value={row.ledgerId}
                        onChange={(e) =>
                          setEntries((prev) =>
                            prev.map((r, idx) =>
                              idx === i
                                ? { ...r, ledgerId: e.target.value }
                                : r,
                            ),
                          )
                        }
                      >
                        <option value="">-- Select Ledger --</option>
                        {companyLedgers.map((l) => (
                          <option key={l.id.toString()} value={l.id.toString()}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="tally-input"
                        value={row.entryType}
                        onChange={(e) =>
                          setEntries((prev) =>
                            prev.map((r, idx) =>
                              idx === i
                                ? {
                                    ...r,
                                    entryType: e.target.value as "Dr" | "Cr",
                                  }
                                : r,
                            ),
                          )
                        }
                      >
                        <option value="Dr">Dr</option>
                        <option value="Cr">Cr</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="tally-input text-right"
                        value={row.amount}
                        onChange={(e) =>
                          setEntries((prev) =>
                            prev.map((r, idx) =>
                              idx === i ? { ...r, amount: e.target.value } : r,
                            ),
                          )
                        }
                        placeholder="0.00"
                      />
                    </td>
                    <td>
                      {entries.length > 2 && (
                        <button
                          type="button"
                          data-ocid={`voucher.delete_button.${i + 1}`}
                          onClick={() =>
                            setEntries((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-secondary/50">
                  <td
                    colSpan={3}
                    className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    Totals
                  </td>
                  <td className="text-right font-mono">
                    <div
                      className={`text-[11px] ${isBalanced ? "text-green-400" : totalDr > 0 ? "text-amber-400" : "text-muted-foreground"}`}
                    >
                      Dr:{" "}
                      {totalDr.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div
                      className={`text-[11px] ${isBalanced ? "text-green-400" : totalCr > 0 ? "text-amber-400" : "text-muted-foreground"}`}
                    >
                      Cr:{" "}
                      {totalCr.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
            <div className="flex items-center justify-between p-2">
              <button
                type="button"
                onClick={() =>
                  setEntries((prev) => [
                    ...prev,
                    { ledgerId: "", entryType: "Dr", amount: "" },
                  ])
                }
                className="flex items-center gap-1 text-[11px] text-teal hover:text-teal-bright"
              >
                <Plus size={12} /> Add Row (Alt+A)
              </button>
              <div className="flex items-center gap-1 text-[11px]">
                {isBalanced ? (
                  <>
                    <CheckCircle size={12} className="text-green-400" />
                    <span className="text-green-400">Balanced</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} className="text-amber-400" />
                    <span className="text-amber-400">
                      Diff:{" "}
                      {Math.abs(totalDr - totalCr).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SALES / PURCHASE Inventory Form ───────────────────── */}
        {isInventoryVoucher && (
          <div className="flex flex-col gap-3">
            {/* Party + Sales/Purchase Ledger row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="sales-party"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  {voucherType === "Sales"
                    ? "Customer / Debtor (DR) *"
                    : "Supplier / Vendor (CR) *"}
                </label>
                <select
                  id="sales-party"
                  className="tally-input"
                  value={salesPartyLedger}
                  onChange={(e) => {
                    setSalesPartyLedger(e.target.value);
                    setValidationError(null);
                  }}
                >
                  <option value="">-- Select Party --</option>
                  <optgroup label="Suggested">
                    {(voucherType === "Sales"
                      ? debtorLedgers
                      : creditorLedgers
                    ).map((l) => (
                      <option key={l.id.toString()} value={l.id.toString()}>
                        {l.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="All Ledgers">
                    {companyLedgers
                      .filter(
                        (l) =>
                          !(
                            voucherType === "Sales"
                              ? debtorLedgers
                              : creditorLedgers
                          ).some((d) => d.id === l.id),
                      )
                      .map((l) => (
                        <option key={l.id.toString()} value={l.id.toString()}>
                          {l.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label
                  htmlFor="sales-ledger"
                  className="text-[11px] text-muted-foreground block mb-1"
                >
                  {voucherType === "Sales"
                    ? "Sales Ledger (CR) — Auto"
                    : "Purchase Ledger (DR) — Auto"}
                </label>
                <select
                  id="sales-ledger"
                  className="tally-input"
                  value={salesLedger}
                  onChange={(e) => setSalesLedger(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {(voucherType === "Sales"
                    ? salesGroupLedgers
                    : purchaseGroupLedgers
                  ).map((l) => (
                    <option key={l.id.toString()} value={l.id.toString()}>
                      {l.name}
                    </option>
                  ))}
                  {/* Fallback: all ledgers */}
                  {(voucherType === "Sales"
                    ? salesGroupLedgers
                    : purchaseGroupLedgers
                  ).length === 0 &&
                    companyLedgers.map((l) => (
                      <option key={l.id.toString()} value={l.id.toString()}>
                        {l.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Item Rows Table */}
            <div className="border border-border">
              <div className="px-3 py-1.5 bg-secondary/40 border-b border-border flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Item Details
                </span>
                {effectiveFeatures.enableGST && (
                  <span className="text-[10px] text-teal">
                    GST Auto-Calculation ON
                  </span>
                )}
              </div>
              <table className="w-full tally-table">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Item Name</th>
                    <th className="w-20">Qty</th>
                    <th className="w-16">Unit</th>
                    <th className="w-24 text-right">Rate (₹)</th>
                    <th className="w-24 text-right">Amount (₹)</th>
                    {effectiveFeatures.enableGST && (
                      <th className="w-16 text-right">GST%</th>
                    )}
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {itemRows.map((row, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: order-dependent
                    <tr key={i} data-ocid={`voucher.item.${i + 1}`}>
                      <td className="text-center text-muted-foreground">
                        {i + 1}
                      </td>
                      <td>
                        {/* Item selector with search */}
                        <input
                          list={`items-${i}`}
                          className="tally-input"
                          value={row.itemName}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateItemRow(i, "itemName", val);
                            // Try to match stock item
                            const si = (stockItems || []).find(
                              (s) =>
                                s.name.toLowerCase() === val.toLowerCase() &&
                                s.companyId === company.id,
                            );
                            if (si)
                              updateItemRow(i, "itemId", si.id.toString());
                          }}
                          placeholder="Type item name..."
                        />
                        <datalist id={`items-${i}`}>
                          {(stockItems || [])
                            .filter((s) => s.companyId === company.id)
                            .map((s) => (
                              <option key={s.id.toString()} value={s.name}>
                                {s.name} - {s.unit} @ ₹{s.openingRate}
                              </option>
                            ))}
                        </datalist>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="tally-input text-right"
                          value={row.qty}
                          onChange={(e) =>
                            updateItemRow(i, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="tally-input"
                          value={row.unit}
                          onChange={(e) =>
                            updateItemRow(i, "unit", e.target.value)
                          }
                          placeholder="pcs"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="tally-input text-right"
                          value={row.rate}
                          onChange={(e) =>
                            updateItemRow(i, "rate", e.target.value)
                          }
                          placeholder="0.00"
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          className="tally-input text-right"
                          value={row.amount}
                          onChange={(e) =>
                            updateItemRow(i, "amount", e.target.value)
                          }
                          placeholder="0.00"
                        />
                      </td>
                      {effectiveFeatures.enableGST && (
                        <td>
                          <input
                            type="number"
                            className="tally-input text-right"
                            value={row.gstPct}
                            onChange={(e) =>
                              updateItemRow(i, "gstPct", e.target.value)
                            }
                            placeholder="0"
                          />
                        </td>
                      )}
                      <td>
                        {itemRows.length > 1 && (
                          <button
                            type="button"
                            data-ocid={`voucher.delete_button.${i + 1}`}
                            onClick={() => removeItemRow(i)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Item footer: Add row + totals */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-secondary/20">
                <button
                  type="button"
                  onClick={addItemRow}
                  className="flex items-center gap-1 text-[11px] text-teal hover:text-teal-bright"
                >
                  <Plus size={11} /> Add Item
                </button>
                <div className="text-[11px] font-mono text-right">
                  <div className="text-muted-foreground">
                    Subtotal: ₹
                    {itemSubtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  {effectiveFeatures.enableGST && gstTotal > 0 && (
                    <div className="text-teal">
                      GST: ₹
                      {gstTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  )}
                  <div className="font-semibold text-foreground">
                    Total: ₹
                    {invoiceTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Extra Fields Accordion ────────────────────────────── */}
        {(effectiveFeatures.enableTransport ||
          effectiveFeatures.enableEwayBill ||
          effectiveFeatures.enableExportImport) && (
          <div className="mt-3 border border-border/50 rounded-sm">
            <button
              type="button"
              onClick={() => setShowExtraFields((v) => !v)}
              className="flex items-center justify-between w-full px-3 py-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <span>
                ⊕ Additional Details (Transport / e-Way Bill / Export)
              </span>
              {showExtraFields ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </button>
            {showExtraFields && (
              <div className="px-3 pb-3 grid grid-cols-2 gap-3">
                {effectiveFeatures.enableTransport && (
                  <>
                    <div>
                      <label
                        htmlFor="transport-name"
                        className="text-[10px] text-muted-foreground block mb-1"
                      >
                        Transport Name
                      </label>
                      <input
                        id="transport-name"
                        className="tally-input"
                        value={transportName}
                        onChange={(e) => setTransportName(e.target.value)}
                        placeholder="ABC Logistics"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="vehicle-no"
                        className="text-[10px] text-muted-foreground block mb-1"
                      >
                        Vehicle No.
                      </label>
                      <input
                        id="vehicle-no"
                        className="tally-input"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value)}
                        placeholder="MH01AB1234"
                      />
                    </div>
                  </>
                )}
                {effectiveFeatures.enableEwayBill && (
                  <div>
                    <label
                      htmlFor="eway-bill"
                      className="text-[10px] text-muted-foreground block mb-1"
                    >
                      e-Way Bill No.
                    </label>
                    <input
                      id="eway-bill"
                      className="tally-input"
                      value={ewayBillNo}
                      onChange={(e) => setEwayBillNo(e.target.value)}
                      placeholder="EWBXXXXXXXXXXXXXXX"
                    />
                  </div>
                )}
                {effectiveFeatures.enableExportImport && (
                  <>
                    <div>
                      <label
                        htmlFor="export-dest"
                        className="text-[10px] text-muted-foreground block mb-1"
                      >
                        Export Destination
                      </label>
                      <input
                        id="export-dest"
                        className="tally-input"
                        value={exportDestination}
                        onChange={(e) => setExportDestination(e.target.value)}
                        placeholder="Dubai, UAE"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="port-code"
                        className="text-[10px] text-muted-foreground block mb-1"
                      >
                        Port Code
                      </label>
                      <input
                        id="port-code"
                        className="tally-input"
                        value={portCode}
                        onChange={(e) => setPortCode(e.target.value)}
                        placeholder="INMAA4"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Balance indicator for journal */}
        {isJournalVoucher && (
          <div className="flex items-center justify-end mt-3">
            <div className="flex items-center gap-1 text-[11px]">
              {isBalanced ? (
                <>
                  <CheckCircle size={12} className="text-green-400" />
                  <span className="text-green-400">Entry Balanced ✓</span>
                </>
              ) : (
                <>
                  <AlertCircle size={12} className="text-amber-400" />
                  <span className="text-amber-400">
                    Difference:{" "}
                    {Math.abs(totalDr - totalCr).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Balance indicator for Inventory */}
        {isInventoryVoucher && isBalanced && (
          <div className="flex items-center gap-1 text-[11px] mt-2">
            <CheckCircle size={12} className="text-green-400" />
            <span className="text-green-400">
              Ready to save — Invoice Total ₹
              {invoiceTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            F4-F9: Types | Ctrl+A: Save | Esc: Clear
          </span>
          <button
            type="button"
            data-ocid="voucher.save_button"
            onClick={handleSaveDraft}
            disabled={createDraft.isPending}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cmd-btn"
          >
            <Save size={11} /> Save Draft
          </button>
        </div>
        <button
          type="button"
          data-ocid="voucher.submit_button"
          onClick={handleSubmit}
          disabled={createVoucher.isPending || submitted || !isBalanced}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
        >
          {createVoucher.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : submitted ? (
            <CheckCircle size={13} />
          ) : null}
          {submitted ? "Saved!" : `Accept ${voucherType} (Ctrl+A)`}
        </button>
      </div>

      {/* Drafts Panel */}
      {showDrafts && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
          <div
            className="bg-card border border-teal/40 w-[520px] rounded-sm"
            data-ocid="voucher.modal"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <span className="text-[13px] font-semibold">Saved Drafts</span>
              <button
                type="button"
                onClick={() => setShowDrafts(false)}
                data-ocid="voucher.close_button"
              >
                <X
                  size={14}
                  className="text-muted-foreground hover:text-foreground"
                />
              </button>
            </div>
            <div className="p-3 max-h-72 overflow-auto">
              {companyDrafts.length === 0 ? (
                <p
                  className="text-center text-muted-foreground text-[12px] py-6"
                  data-ocid="voucher.empty_state"
                >
                  No saved drafts
                </p>
              ) : (
                companyDrafts.map((draft, idx) => (
                  <div
                    key={draft.id.toString()}
                    data-ocid={`voucher.item.${idx + 1}`}
                    className="flex items-center justify-between py-2 border-b border-border/40 text-[12px]"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {draft.voucherType}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        {draft.date}
                      </span>
                      {draft.narration && (
                        <div className="text-[10px] text-muted-foreground">
                          {draft.narration}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadDraft(draft)}
                        className="text-teal text-[11px] hover:text-teal-bright"
                        data-ocid={`voucher.edit_button.${idx + 1}`}
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="text-destructive text-[11px] hover:text-destructive/80"
                        data-ocid={`voucher.delete_button.${idx + 1}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
              Drafts auto-sync on save. Load to continue editing.
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      {showInvoicePrint && (
        <InvoicePrint
          company={company}
          voucherType={voucherType}
          entries={printEntries}
          voucherDate={date}
          voucherNumber={voucherNumber}
          onClose={() => setShowInvoicePrint(false)}
        />
      )}
    </div>
  );
}
