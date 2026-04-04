import { Landmark, Loader2, Plug, PlugZap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type BankKey = "hdfc" | "sbi" | "icici" | "axis";

const BANKS: { key: BankKey; name: string; color: string }[] = [
  { key: "hdfc", name: "HDFC Bank", color: "#004C8F" },
  { key: "sbi", name: "State Bank of India", color: "#22539A" },
  { key: "icici", name: "ICICI Bank", color: "#B02A2A" },
  { key: "axis", name: "Axis Bank", color: "#97144C" },
];

type BankConfig = {
  accountNumber: string;
  ifscCode: string;
  connected: boolean;
};

function loadBankConfig(key: BankKey): BankConfig {
  try {
    const raw = localStorage.getItem(`hk-bank-api-${key}`);
    if (raw) return JSON.parse(raw);
  } catch {
    /* empty */
  }
  return { accountNumber: "", ifscCode: "", connected: false };
}

export default function BankingAPIConfig() {
  const [configs, setConfigs] = useState<Record<BankKey, BankConfig>>(() => ({
    hdfc: loadBankConfig("hdfc"),
    sbi: loadBankConfig("sbi"),
    icici: loadBankConfig("icici"),
    axis: loadBankConfig("axis"),
  }));
  const [connecting, setConnecting] = useState<BankKey | null>(null);

  const update = (
    key: BankKey,
    field: keyof BankConfig,
    value: string | boolean,
  ) =>
    setConfigs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));

  const handleConnect = async (key: BankKey) => {
    if (!configs[key].accountNumber || !configs[key].ifscCode) {
      toast.error("Please enter Account Number and IFSC Code");
      return;
    }
    setConnecting(key);
    await new Promise((r) => setTimeout(r, 1500));
    const updated = { ...configs[key], connected: true };
    setConfigs((prev) => ({ ...prev, [key]: updated }));
    localStorage.setItem(`hk-bank-api-${key}`, JSON.stringify(updated));
    setConnecting(null);
    toast.success(
      `${BANKS.find((b) => b.key === key)?.name} connected successfully`,
    );
  };

  const handleDisconnect = (key: BankKey) => {
    const updated = { ...configs[key], connected: false };
    setConfigs((prev) => ({ ...prev, [key]: updated }));
    localStorage.setItem(`hk-bank-api-${key}`, JSON.stringify(updated));
    toast.success("Bank disconnected");
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-6 py-4 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2 mb-1">
          <Landmark size={16} className="text-teal" />
          <span className="text-[15px] font-bold uppercase tracking-wide text-foreground">
            Banking API Configuration
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Connect your bank accounts for automated reconciliation and statement
          import
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-5 max-w-3xl">
          {BANKS.map((bank) => {
            const cfg = configs[bank.key];
            return (
              <div
                key={bank.key}
                data-ocid={`bankapi.${bank.key}.card`}
                className="border border-border bg-card"
              >
                {/* Header */}
                <div
                  className="px-4 py-3 border-b border-border flex items-center justify-between"
                  style={{ borderTop: `3px solid ${bank.color}` }}
                >
                  <span className="text-[13px] font-bold text-foreground">
                    {bank.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 ${
                      cfg.connected
                        ? "bg-green-500/20 text-green-400 border border-green-500/40"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {cfg.connected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <label
                      htmlFor={`bankapi-acct-${bank.key}`}
                      className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                    >
                      Account Number
                    </label>
                    <input
                      id={`bankapi-acct-${bank.key}`}
                      data-ocid={`bankapi.${bank.key}.input`}
                      type="text"
                      className="tally-input w-full"
                      placeholder="Enter account number"
                      value={cfg.accountNumber}
                      onChange={(e) =>
                        update(bank.key, "accountNumber", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`bankapi-ifsc-${bank.key}`}
                      className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                    >
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      className="tally-input w-full"
                      id={`bankapi-ifsc-${bank.key}`}
                      placeholder="e.g. HDFC0001234"
                      value={cfg.ifscCode}
                      onChange={(e) =>
                        update(bank.key, "ifscCode", e.target.value)
                      }
                    />
                  </div>

                  <div className="pt-1">
                    {cfg.connected ? (
                      <button
                        type="button"
                        data-ocid={`bankapi.${bank.key}.delete_button`}
                        onClick={() => handleDisconnect(bank.key)}
                        className="flex items-center gap-1.5 w-full justify-center py-1.5 text-[11px] font-semibold bg-destructive/10 border border-destructive/40 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <Plug size={12} /> Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-ocid={`bankapi.${bank.key}.primary_button`}
                        onClick={() => handleConnect(bank.key)}
                        disabled={connecting === bank.key}
                        className="flex items-center gap-1.5 w-full justify-center py-1.5 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
                      >
                        {connecting === bank.key ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <PlugZap size={12} />
                        )}
                        {connecting === bank.key ? "Connecting..." : "Connect"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
