import { Info, Keyboard, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const ALL_SCREENS = [
  { key: "gateway", label: "Dashboard / Gateway" },
  { key: "ledgers", label: "Ledger List" },
  { key: "voucherContra", label: "Contra Voucher" },
  { key: "voucherPayment", label: "Payment Voucher" },
  { key: "voucherReceipt", label: "Receipt Voucher" },
  { key: "voucher", label: "Journal Voucher" },
  { key: "voucherSales", label: "Sales Voucher" },
  { key: "voucherPurchase", label: "Purchase Voucher" },
  { key: "gstVoucher", label: "GST Voucher" },
  { key: "balanceSheet", label: "Balance Sheet" },
  { key: "plAccount", label: "P&L Account" },
  { key: "trialBalance", label: "Trial Balance" },
  { key: "dayBook", label: "Day Book" },
  { key: "cashFlow", label: "Cash Flow" },
  { key: "stockItems", label: "Stock Items" },
  { key: "stockSummary", label: "Stock Summary" },
  { key: "employeeMaster", label: "Employee Master" },
  { key: "payrollVoucher", label: "Process Payroll" },
  { key: "bankAccounts", label: "Bank Accounts" },
  { key: "bankReconciliation", label: "Bank Reconciliation" },
  { key: "analyticsDashboard", label: "Analytics Dashboard" },
  { key: "notifications", label: "Notifications" },
  { key: "exportCenter", label: "Export Center" },
  { key: "aiSettings", label: "AI Settings" },
  { key: "voiceEntry", label: "Voice Entry" },
  { key: "smartAlerts", label: "Smart Alerts" },
  { key: "themeCustomizer", label: "Theme Customizer" },
  { key: "userProfile", label: "My Profile" },
  { key: "budgetMaster", label: "Budget Master" },
  { key: "projectDashboard", label: "Project Dashboard" },
  { key: "customerMaster", label: "Customer Master" },
  { key: "vendorMaster", label: "Vendor Master" },
  { key: "posTerminal", label: "POS Terminal" },
  { key: "gstFilingDashboard", label: "GST Filing Dashboard" },
  { key: "leadMaster", label: "Create Lead" },
  { key: "poEntry", label: "Purchase Order" },
  { key: "soEntry", label: "Sales Order" },
];

export interface CustomShortcut {
  id: string;
  key: string; // e.g. "ctrl+k", "alt+1"
  screen: string;
  label: string;
}

function getStorageKey(username: string) {
  return `hisabkitab_shortcuts_${username}`;
}

export function loadShortcuts(username: string): CustomShortcut[] {
  try {
    const raw = localStorage.getItem(getStorageKey(username));
    if (!raw) return [];
    return JSON.parse(raw) as CustomShortcut[];
  } catch {
    return [];
  }
}

export function saveShortcuts(username: string, shortcuts: CustomShortcut[]) {
  localStorage.setItem(getStorageKey(username), JSON.stringify(shortcuts));
}

interface Props {
  username: string;
}

export default function CustomShortcuts({ username }: Props) {
  const [shortcuts, setShortcuts] = useState<CustomShortcut[]>(() =>
    loadShortcuts(username),
  );
  const [recording, setRecording] = useState(false);
  const [recordedKey, setRecordedKey] = useState("");
  const [selectedScreen, setSelectedScreen] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleKeyCapture = (e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parts: string[] = [];
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    const k = e.key;
    if (!["Control", "Alt", "Shift", "Meta"].includes(k)) {
      parts.push(k.length === 1 ? k.toUpperCase() : k);
    }
    if (parts.length > 0) {
      setRecordedKey(parts.join("+"));
    }
  };

  const addShortcut = () => {
    if (!recordedKey || !selectedScreen) return;
    const screen = ALL_SCREENS.find((s) => s.key === selectedScreen);
    if (!screen) return;
    // Check for duplicate key
    const duplicate = shortcuts.find(
      (s) => s.key === recordedKey && s.id !== editId,
    );
    if (duplicate) {
      alert(
        `Key "${recordedKey}" is already assigned to "${duplicate.label}". Please choose a different key.`,
      );
      return;
    }
    if (editId) {
      const updated = shortcuts.map((s) =>
        s.id === editId
          ? { ...s, key: recordedKey, screen: screen.key, label: screen.label }
          : s,
      );
      setShortcuts(updated);
      saveShortcuts(username, updated);
      setEditId(null);
    } else {
      const newShortcut: CustomShortcut = {
        id: Date.now().toString(),
        key: recordedKey,
        screen: screen.key,
        label: screen.label,
      };
      const updated = [...shortcuts, newShortcut];
      setShortcuts(updated);
      saveShortcuts(username, updated);
    }
    setRecordedKey("");
    setSelectedScreen("");
    setRecording(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteShortcut = (id: string) => {
    const updated = shortcuts.filter((s) => s.id !== id);
    setShortcuts(updated);
    saveShortcuts(username, updated);
  };

  const startEdit = (s: CustomShortcut) => {
    setEditId(s.id);
    setRecordedKey(s.key);
    setSelectedScreen(s.screen);
    setRecording(false);
  };

  return (
    <div className="tally-page">
      <div className="tally-content">
        <div className="tally-section-title">
          <Keyboard size={14} className="text-teal" />
          Custom Keyboard Shortcuts
        </div>
        <p className="text-[11px] text-muted-foreground mb-4">
          Create personal shortcuts that only work for your login (
          <strong className="text-foreground">{username}</strong>). Other users
          are not affected.
        </p>

        <div className="bg-teal/10 border border-teal/30 p-3 mb-4 flex gap-2">
          <Info size={12} className="text-teal mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-teal">
            Avoid overriding system keys: F1–F9 (vouchers), G (GoTo), H (Help),
            E (Export), M (Email), P (Print), Escape. Use Ctrl+letter or
            Alt+letter combinations for best results.
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="border border-border p-4 mb-6 bg-card">
          <div className="text-[12px] font-semibold text-foreground mb-3">
            {editId ? "Edit Shortcut" : "Add New Shortcut"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            {/* Key recorder */}
            <div>
              <label htmlFor="key-recorder" className="tally-label">
                Key Combination
              </label>
              <div className="relative">
                {recording ? (
                  <input
                    id="key-recorder"
                    // biome-ignore lint/a11y/noAutofocus: intentional for key capture
                    autoFocus
                    className="tally-input font-mono bg-teal/10 border-teal/60 text-teal"
                    placeholder="Press keys now..."
                    value={recordedKey}
                    onKeyDown={handleKeyCapture}
                    onChange={() => {}}
                    readOnly={false}
                  />
                ) : (
                  <button
                    type="button"
                    className="tally-input w-full cursor-pointer font-mono hover:border-teal/60 transition-colors flex items-center justify-between text-left"
                    onClick={() => setRecording(true)}
                  >
                    <span
                      className={
                        recordedKey ? "text-teal" : "text-muted-foreground"
                      }
                    >
                      {recordedKey || "Click to record key..."}
                    </span>
                    {recordedKey && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecordedKey("");
                        }}
                        className="text-muted-foreground hover:text-destructive text-[10px]"
                      >
                        ✕
                      </button>
                    )}
                  </button>
                )}
              </div>
              {recording && (
                <div className="text-[10px] text-teal mt-1">
                  Press your desired key combination, then click Save below
                </div>
              )}
            </div>

            {/* Screen selector */}
            <div>
              <label htmlFor="screen-select" className="tally-label">
                Navigate To
              </label>
              <select
                id="screen-select"
                className="tally-input"
                value={selectedScreen}
                onChange={(e) => setSelectedScreen(e.target.value)}
              >
                <option value="">-- Select screen --</option>
                {ALL_SCREENS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addShortcut}
                disabled={!recordedKey || !selectedScreen}
                className="tally-btn flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save size={11} />
                {editId ? "Update" : "Add"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setRecordedKey("");
                    setSelectedScreen("");
                  }}
                  className="tally-btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {saved && (
            <div className="text-[11px] text-green-500 mt-2">
              Shortcut saved!
            </div>
          )}
        </div>

        {/* Shortcuts list */}
        {shortcuts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Keyboard size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-[12px]">No custom shortcuts yet.</p>
            <p className="text-[11px] mt-1">
              Add your first shortcut above to get started.
            </p>
          </div>
        ) : (
          <div className="border border-border overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="text-left px-3 py-2 font-semibold text-foreground/70">
                    Key Combo
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-foreground/70">
                    Navigates To
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-foreground/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/60 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <span className="font-mono bg-secondary px-2 py-0.5 border border-border text-teal text-[11px]">
                        {s.key}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-foreground">{s.label}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          className="text-[10px] px-2 py-0.5 border border-border hover:bg-secondary/60 text-foreground transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteShortcut(s.id)}
                          className="text-[10px] px-2 py-0.5 border border-destructive/40 hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
