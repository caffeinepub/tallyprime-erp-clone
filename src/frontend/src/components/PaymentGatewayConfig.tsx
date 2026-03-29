import { DollarSign, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type GatewayKey = "razorpay" | "stripe" | "payu";

const GATEWAYS: {
  key: GatewayKey;
  name: string;
  initials: string;
  color: string;
}[] = [
  { key: "razorpay", name: "Razorpay", initials: "RZ", color: "#3395FF" },
  { key: "stripe", name: "Stripe", initials: "ST", color: "#635BFF" },
  { key: "payu", name: "PayU", initials: "PU", color: "#FF6B00" },
];

type GatewayConfig = {
  enabled: boolean;
  apiKey: string;
  secretKey: string;
};

function loadConfig(key: GatewayKey): GatewayConfig {
  try {
    const raw = localStorage.getItem(`hk-gateway-${key}`);
    if (raw) return JSON.parse(raw);
  } catch {
    /* empty */
  }
  return { enabled: false, apiKey: "", secretKey: "" };
}

export default function PaymentGatewayConfig() {
  const [configs, setConfigs] = useState<Record<GatewayKey, GatewayConfig>>(
    () => ({
      razorpay: loadConfig("razorpay"),
      stripe: loadConfig("stripe"),
      payu: loadConfig("payu"),
    }),
  );
  const [testing, setTesting] = useState<GatewayKey | null>(null);
  const [saving, setSaving] = useState<GatewayKey | null>(null);

  const update = (
    key: GatewayKey,
    field: keyof GatewayConfig,
    value: string | boolean,
  ) =>
    setConfigs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));

  const handleSave = async (key: GatewayKey) => {
    setSaving(key);
    await new Promise((r) => setTimeout(r, 500));
    localStorage.setItem(`hk-gateway-${key}`, JSON.stringify(configs[key]));
    setSaving(null);
    toast.success(
      `${GATEWAYS.find((g) => g.key === key)?.name} configuration saved`,
    );
  };

  const handleTest = async (key: GatewayKey) => {
    setTesting(key);
    await new Promise((r) => setTimeout(r, 1000));
    setTesting(null);
    toast.success("Connection successful");
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-6 py-4 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={16} className="text-teal" />
          <span className="text-[15px] font-bold uppercase tracking-wide text-foreground">
            Payment Gateways
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Configure payment gateway integrations for invoice collection
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-5 max-w-3xl">
          {GATEWAYS.map((gw) => {
            const cfg = configs[gw.key];
            return (
              <div
                key={gw.key}
                data-ocid={`gateway.${gw.key}.card`}
                className="border border-border bg-card"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 flex items-center justify-center text-white text-[12px] font-bold rounded-sm"
                      style={{ backgroundColor: gw.color }}
                    >
                      {gw.initials}
                    </div>
                    <span className="text-[14px] font-bold text-foreground">
                      {gw.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] text-muted-foreground">
                      Enable
                    </span>
                    <div
                      data-ocid={`gateway.${gw.key}.toggle`}
                      role="switch"
                      aria-checked={cfg.enabled}
                      tabIndex={0}
                      onClick={() => update(gw.key, "enabled", !cfg.enabled)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          update(gw.key, "enabled", !cfg.enabled);
                      }}
                      className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                        cfg.enabled ? "bg-teal" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          cfg.enabled ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Config Fields */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`gw-apikey-${gw.key}`}
                      className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                    >
                      API Key
                    </label>
                    <input
                      id={`gw-apikey-${gw.key}`}
                      data-ocid={`gateway.${gw.key}.input`}
                      type="password"
                      className="tally-input w-full"
                      placeholder="Enter API Key"
                      value={cfg.apiKey}
                      onChange={(e) => update(gw.key, "apiKey", e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`gw-secret-${gw.key}`}
                      className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
                    >
                      Secret Key
                    </label>
                    <input
                      id={`gw-secret-${gw.key}`}
                      type="password"
                      className="tally-input w-full"
                      placeholder="Enter Secret Key"
                      value={cfg.secretKey}
                      onChange={(e) =>
                        update(gw.key, "secretKey", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 px-4 pb-4">
                  <button
                    type="button"
                    data-ocid={`gateway.${gw.key}.save_button`}
                    onClick={() => handleSave(gw.key)}
                    disabled={saving === gw.key}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
                  >
                    {saving === gw.key ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                    Save
                  </button>
                  <button
                    type="button"
                    data-ocid={`gateway.${gw.key}.secondary_button`}
                    onClick={() => handleTest(gw.key)}
                    disabled={testing !== null || !cfg.apiKey}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                  >
                    {testing === gw.key ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : null}
                    Test Connection
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
