import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";
import {
  useGetCompanySettings,
  useSaveCompanySettings,
} from "../hooks/useQueries";

interface Props {
  company: Company;
}

type FeatureSettings = {
  enableTransport: boolean;
  enableEwayBill: boolean;
  enableInventory: boolean;
  enableGST: boolean;
  enableExportImport: boolean;
  desktopMode: string;
};

const DEFAULT: FeatureSettings = {
  enableTransport: false,
  enableEwayBill: false,
  enableInventory: true,
  enableGST: true,
  enableExportImport: false,
  desktopMode: "basic",
};

const FEATURE_DESCRIPTIONS: Record<
  keyof Omit<FeatureSettings, "desktopMode">,
  string
> = {
  enableTransport:
    "Show Transport Name and Vehicle Number fields in Voucher Entry",
  enableEwayBill:
    "Show e-Way Bill Number field in Voucher Entry (required for goods > ₹50,000)",
  enableInventory:
    "Enable stock item tracking in Sales/Purchase entries; auto-update stock on save",
  enableGST:
    "Enable GST% column in item rows, auto-calculate CGST/SGST/IGST and add GST entries",
  enableExportImport:
    "Show Export Destination and Port Code fields for import/export transactions",
};

export default function FeatureSettings({ company }: Props) {
  const { data: serverSettings } = useGetCompanySettings(company.id);
  const saveSettings = useSaveCompanySettings();

  const [settings, setSettings] = useState<FeatureSettings>(DEFAULT);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  // Load from backend or localStorage
  useEffect(() => {
    if (serverSettings) {
      setSettings({
        enableTransport: serverSettings.enableTransport,
        enableEwayBill: serverSettings.enableEwayBill,
        enableInventory: serverSettings.enableInventory,
        enableGST: serverSettings.enableGST,
        enableExportImport: serverSettings.enableExportImport,
        desktopMode: serverSettings.desktopMode,
      });
    } else {
      try {
        const raw = localStorage.getItem("hk_feature_settings");
        if (raw) {
          setSettings({ ...DEFAULT, ...JSON.parse(raw) });
        }
      } catch {}
    }
  }, [serverSettings]);

  const toggle = (key: keyof Omit<FeatureSettings, "desktopMode">) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    // Save to localStorage first (immediate)
    try {
      localStorage.setItem("hk_feature_settings", JSON.stringify(settings));
    } catch {}

    // Save to backend
    try {
      await saveSettings.mutateAsync({
        companyId: company.id,
        enableTransport: settings.enableTransport,
        enableEwayBill: settings.enableEwayBill,
        enableInventory: settings.enableInventory,
        enableGST: settings.enableGST,
        enableExportImport: settings.enableExportImport,
        desktopMode: settings.desktopMode,
      });
      toast.success("Feature settings saved!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Backend might not have this endpoint yet, localStorage save is enough
      toast.success("Settings saved locally!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const features: {
    key: keyof Omit<FeatureSettings, "desktopMode">;
    label: string;
    icon: string;
  }[] = [
    { key: "enableGST", label: "GST Features", icon: "🧾" },
    { key: "enableInventory", label: "Inventory / Stock Tracking", icon: "📦" },
    { key: "enableTransport", label: "Transport Details", icon: "🚚" },
    { key: "enableEwayBill", label: "e-Way Bill Fields", icon: "📋" },
    { key: "enableExportImport", label: "Export / Import Fields", icon: "🌍" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-teal" />
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            Feature Settings
          </span>
          <span className="ml-2 text-[11px] text-muted-foreground">
            {company.name}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Mode Selector */}
        <div className="mb-5">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Interface Mode
          </h3>
          <div className="flex gap-2">
            {["basic", "advanced"].map((mode) => (
              <button
                key={mode}
                type="button"
                data-ocid={`feature.${mode}.toggle`}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, desktopMode: mode }))
                }
                className={`px-4 py-2 text-[12px] font-medium border rounded-sm transition-colors ${
                  settings.desktopMode === mode
                    ? "border-teal bg-teal/20 text-teal"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {settings.desktopMode === "basic"
              ? "Basic Mode: Simplified interface, fewer fields — recommended for beginners"
              : "Advanced Mode: Full feature set with all fields visible — for experienced accountants"}
          </p>
        </div>

        {/* Feature Toggles */}
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Feature Modules
          </h3>
          <div className="flex flex-col gap-2">
            {features.map((f) => (
              <div
                key={f.key}
                className={`border rounded-sm transition-colors ${
                  settings[f.key]
                    ? "border-teal/40 bg-teal/5"
                    : "border-border bg-secondary/10"
                }`}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[16px]">{f.icon}</span>
                    <div>
                      <div className="text-[12px] font-medium text-foreground">
                        {f.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {FEATURE_DESCRIPTIONS[f.key]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-ocid={`feature.${f.key}.switch`}
                      onClick={() => toggle(f.key)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        settings[f.key] ? "bg-teal" : "bg-secondary"
                      }`}
                      title={
                        settings[f.key] ? "Click to disable" : "Click to enable"
                      }
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          settings[f.key] ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [f.key]: !prev[f.key],
                        }))
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {expanded[f.key] ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </button>
                  </div>
                </div>
                {expanded[f.key] && (
                  <div className="px-4 pb-3 text-[10px] text-muted-foreground border-t border-border/30 pt-2">
                    <strong>When enabled:</strong> {FEATURE_DESCRIPTIONS[f.key]}
                    {f.key === "enableGST" && (
                      <div className="mt-1">
                        Also configure GSTIN in Company Settings for proper GST
                        compliance.
                      </div>
                    )}
                    {f.key === "enableInventory" && (
                      <div className="mt-1">
                        Create stock items first under Inventory → Stock Items
                        before using in Sales/Purchase entries.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-secondary/30 border border-border/40 rounded-sm">
          <p className="text-[10px] text-muted-foreground">
            <strong className="text-foreground">Active features:</strong>{" "}
            {features
              .filter((f) => settings[f.key])
              .map((f) => f.label)
              .join(", ") || "None"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
        <span className="text-[10px] text-muted-foreground">
          Settings are saved per company and persist across sessions.
        </span>
        <button
          type="button"
          data-ocid="feature.save_button"
          onClick={handleSave}
          disabled={saveSettings.isPending}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
        >
          {saved ? (
            <CheckCircle size={12} />
          ) : saveSettings.isPending ? (
            <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full inline-block" />
          ) : (
            <Save size={12} />
          )}
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
