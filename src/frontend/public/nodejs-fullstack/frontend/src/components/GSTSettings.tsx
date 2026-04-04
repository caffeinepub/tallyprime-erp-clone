import { Loader2, Save, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";
import { useGetGSTSettings, useSetGSTSettings } from "../hooks/useQueries";

interface Props {
  company: Company;
}

const STATE_CODES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh (New)" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh (Residual)" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
];

export default function GSTSettings({ company }: Props) {
  const { data: settings, isLoading } = useGetGSTSettings(company.id);
  const setSettings = useSetGSTSettings();

  const [form, setForm] = useState({
    registrationType: "Regular",
    stateCode: "27",
    stateName: "Maharashtra",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        registrationType: settings.registrationType,
        stateCode: settings.stateCode,
        stateName: settings.stateName,
      });
    }
  }, [settings]);

  const handleStateChange = (code: string) => {
    const state = STATE_CODES.find((s) => s.code === code);
    setForm((f) => ({ ...f, stateCode: code, stateName: state?.name || "" }));
  };

  const handleSave = async () => {
    try {
      await setSettings.mutateAsync({
        companyId: company.id,
        registrationType: form.registrationType,
        stateCode: form.stateCode,
        stateName: form.stateName,
      });
      toast.success("GST Settings saved successfully");
    } catch {
      toast.error("Failed to save GST Settings");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-20 gap-2"
        data-ocid="gst_settings.loading_state"
      >
        <Loader2 size={16} className="animate-spin text-teal" />
        <span className="text-muted-foreground text-[12px]">
          Loading GST Settings...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-secondary/50 border-b border-border">
        <Shield size={14} className="text-teal" />
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
            GST Settings
          </span>
          <span className="ml-3 text-[11px] text-muted-foreground">
            {company.name}
          </span>
        </div>
        {settings && (
          <span className="ml-auto text-[11px] px-2 py-0.5 bg-green-900/30 text-green-400 border border-green-800/40">
            ✓ GST Configured
          </span>
        )}
      </div>

      <div className="p-6 max-w-xl">
        {/* Company Info */}
        <div className="mb-6 p-4 bg-card border border-border">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">
            Company
          </div>
          <div className="text-[13px] font-semibold text-foreground">
            {company.name}
          </div>
          {company.gstin && (
            <div className="text-[12px] text-teal font-mono mt-1">
              GSTIN: {company.gstin}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {/* Registration Type */}
          <div>
            <label
              htmlFor="reg-type"
              className="text-[11px] text-muted-foreground block mb-1.5 uppercase tracking-wide"
            >
              Registration Type *
            </label>
            <select
              id="reg-type"
              data-ocid="gst_settings.select"
              className="tally-input"
              value={form.registrationType}
              onChange={(e) =>
                setForm((f) => ({ ...f, registrationType: e.target.value }))
              }
            >
              <option value="Regular">Regular</option>
              <option value="Composition">Composition</option>
              <option value="Unregistered">Unregistered</option>
              <option value="Consumer">Consumer</option>
              <option value="SEZ">SEZ</option>
              <option value="Overseas">Overseas</option>
            </select>
            <div className="text-[10px] text-muted-foreground mt-1">
              Regular: Standard GST taxpayer | Composition: Small businesses
              with flat rate
            </div>
          </div>

          {/* State Selection */}
          <div>
            <label
              htmlFor="state-code"
              className="text-[11px] text-muted-foreground block mb-1.5 uppercase tracking-wide"
            >
              State (for GSTIN Prefix)
            </label>
            <select
              id="state-code"
              className="tally-input"
              value={form.stateCode}
              onChange={(e) => handleStateChange(e.target.value)}
            >
              {STATE_CODES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} – {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Summary */}
          {settings && (
            <div className="p-3 bg-secondary/30 border border-border text-[11px]">
              <div className="text-muted-foreground mb-1 uppercase tracking-wide">
                Current Settings
              </div>
              <div className="flex gap-6 text-foreground">
                <div>
                  Type:{" "}
                  <span className="text-teal font-medium">
                    {settings.registrationType}
                  </span>
                </div>
                <div>
                  State:{" "}
                  <span className="text-teal font-medium">
                    {settings.stateCode} – {settings.stateName}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              data-ocid="gst_settings.save_button"
              onClick={handleSave}
              disabled={setSettings.isPending}
              className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
            >
              {setSettings.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              {setSettings.isPending ? "Saving..." : "Save GST Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
