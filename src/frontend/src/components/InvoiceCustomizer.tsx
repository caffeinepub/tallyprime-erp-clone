import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Eye,
  Image,
  Palette,
  Printer,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "hk_invoice_customizer";
const LOGO_KEY = "hk_invoice_logo";
const SIG_KEY = "hk_invoice_signature";
const INFO_KEY = "hk_invoice_info";
const ACCENT_KEY = "hk_invoice_accent";

const PRESET_COLORS = [
  "#0d9488", // teal
  "#2563eb", // blue
  "#7c3aed", // purple
  "#dc2626", // red
  "#ea580c", // orange
  "#16a34a", // green
];

type InvoiceSettings = {
  fontSize: "small" | "medium" | "large";
  paperSize: "A4" | "Letter";
  showGSTIN: boolean;
  showPAN: boolean;
  showBankDetails: boolean;
  showQRCode: boolean;
  showTerms: boolean;
  terms: string;
  showHSN: boolean;
  showDiscount: boolean;
  showSerialNo: boolean;
  showEwayBillNo: boolean;
  showVehicleNo: boolean;
};

const DEFAULT_SETTINGS: InvoiceSettings = {
  fontSize: "medium",
  paperSize: "A4",
  showGSTIN: true,
  showPAN: false,
  showBankDetails: true,
  showQRCode: false,
  showTerms: true,
  terms:
    "1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment not made within due date.",
  showHSN: true,
  showDiscount: false,
  showSerialNo: true,
  showEwayBillNo: false,
  showVehicleNo: false,
};

function loadSettings(): InvoiceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function InvoicePreview({
  settings,
  logo,
  signature,
  info,
  accent,
}: {
  settings: InvoiceSettings;
  logo: string | null;
  signature: string | null;
  info: Record<string, string>;
  accent: string;
}) {
  const fontScale =
    settings.fontSize === "small" ? 6 : settings.fontSize === "large" ? 9 : 7;
  return (
    <div
      className="bg-white border border-gray-300 shadow-sm"
      style={{
        width: "595px",
        minHeight: "800px",
        fontSize: `${fontScale}px`,
        color: "#1a1a1a",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: accent,
          color: "white",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {logo ? (
          <img
            src={logo}
            alt="Logo"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            {(info.companyName || "HK")[0]}
          </div>
        )}
        <div>
          <div style={{ fontSize: 13, fontWeight: "bold" }}>
            {info.companyName || "Your Company Name"}
          </div>
          <div style={{ fontSize: 8, opacity: 0.85 }}>
            {info.address || "123 Business Street, City - 110001"}
          </div>
          {settings.showGSTIN && (
            <div style={{ fontSize: 8, opacity: 0.85 }}>
              GSTIN: {info.gstin || "29XXXXX1234Z5"} | Ph:{" "}
              {info.phone || "9876543210"}
            </div>
          )}
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: "bold" }}>TAX INVOICE</div>
          <div style={{ fontSize: 8, opacity: 0.85 }}>No: 2024-001</div>
          <div style={{ fontSize: 8, opacity: 0.85 }}>
            Date: {new Date().toLocaleDateString("en-IN")}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div
        style={{
          padding: "8px 16px",
          borderBottom: `2px solid ${accent}`,
          display: "flex",
          gap: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: "bold",
              color: accent,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Bill To
          </div>
          <div style={{ fontWeight: "bold" }}>Sample Customer Ltd.</div>
          <div>456 Market Road, Delhi - 110002</div>
          <div>GSTIN: 07ABCDE1234F1Z5</div>
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: "bold",
              color: accent,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Ship To
          </div>
          <div style={{ fontWeight: "bold" }}>Same as Bill To</div>
        </div>
      </div>

      {/* Table */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", margin: "0 0" }}
      >
        <thead>
          <tr style={{ background: accent, color: "white" }}>
            {settings.showSerialNo && (
              <th style={{ padding: "4px 8px", textAlign: "center" }}>#</th>
            )}
            <th style={{ padding: "4px 8px", textAlign: "left" }}>
              Description
            </th>
            {settings.showHSN && (
              <th style={{ padding: "4px 8px", textAlign: "center" }}>HSN</th>
            )}
            <th style={{ padding: "4px 8px", textAlign: "right" }}>Qty</th>
            <th style={{ padding: "4px 8px", textAlign: "right" }}>Rate</th>
            {settings.showDiscount && (
              <th style={{ padding: "4px 8px", textAlign: "right" }}>Disc%</th>
            )}
            <th style={{ padding: "4px 8px", textAlign: "right" }}>Taxable</th>
            <th style={{ padding: "4px 8px", textAlign: "right" }}>GST</th>
            <th style={{ padding: "4px 8px", textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: "Product A", hsn: "8471", qty: 10, rate: 1000, gst: 18 },
            { name: "Service B", hsn: "9983", qty: 5, rate: 2000, gst: 18 },
          ].map((item, i) => {
            const taxable = item.qty * item.rate;
            const gstAmt = (taxable * item.gst) / 100;
            return (
              <tr
                key={item.name}
                style={{ background: i % 2 === 0 ? "#f9f9f9" : "white" }}
              >
                {settings.showSerialNo && (
                  <td style={{ padding: "3px 8px", textAlign: "center" }}>
                    {i + 1}
                  </td>
                )}
                <td style={{ padding: "3px 8px" }}>{item.name}</td>
                {settings.showHSN && (
                  <td style={{ padding: "3px 8px", textAlign: "center" }}>
                    {item.hsn}
                  </td>
                )}
                <td style={{ padding: "3px 8px", textAlign: "right" }}>
                  {item.qty}
                </td>
                <td style={{ padding: "3px 8px", textAlign: "right" }}>
                  ₹{item.rate.toLocaleString()}
                </td>
                {settings.showDiscount && (
                  <td style={{ padding: "3px 8px", textAlign: "right" }}>0</td>
                )}
                <td style={{ padding: "3px 8px", textAlign: "right" }}>
                  ₹{taxable.toLocaleString()}
                </td>
                <td style={{ padding: "3px 8px", textAlign: "right" }}>
                  ₹{gstAmt.toLocaleString()}
                </td>
                <td style={{ padding: "3px 8px", textAlign: "right" }}>
                  ₹{(taxable + gstAmt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 16px",
          borderTop: `2px solid ${accent}`,
        }}
      >
        <table style={{ fontSize: 8, minWidth: 180 }}>
          <tbody>
            <tr>
              <td style={{ padding: "1px 8px", color: "#666" }}>Subtotal:</td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>
                ₹20,000
              </td>
            </tr>
            <tr>
              <td style={{ padding: "1px 8px", color: "#666" }}>CGST @9%:</td>
              <td style={{ textAlign: "right" }}>₹1,800</td>
            </tr>
            <tr>
              <td style={{ padding: "1px 8px", color: "#666" }}>SGST @9%:</td>
              <td style={{ textAlign: "right" }}>₹1,800</td>
            </tr>
            <tr
              style={{
                borderTop: `1px solid ${accent}`,
                fontWeight: "bold",
                color: accent,
              }}
            >
              <td style={{ padding: "2px 8px" }}>TOTAL:</td>
              <td style={{ textAlign: "right", fontSize: 10 }}>₹23,600</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer / Signature */}
      <div
        style={{
          padding: "8px 16px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ maxWidth: 280 }}>
          {settings.showTerms && (
            <>
              <div
                style={{
                  fontSize: 7,
                  fontWeight: "bold",
                  color: accent,
                  marginBottom: 2,
                }}
              >
                Terms &amp; Conditions
              </div>
              <div style={{ fontSize: 6, color: "#666", lineHeight: 1.4 }}>
                {settings.terms
                  .split("\n")
                  .slice(0, 2)
                  .map((t) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static terms preview
                    <div key={t}>{t}</div>
                  ))}
              </div>
            </>
          )}
          {settings.showBankDetails && (
            <div style={{ marginTop: 4, fontSize: 6, color: "#666" }}>
              Bank: State Bank of India | A/C: 1234567890 | IFSC: SBIN0001234
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", minWidth: 120 }}>
          {signature ? (
            <img
              src={signature}
              alt="Signature"
              style={{ height: 30, maxWidth: 120, objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                height: 30,
                borderBottom: `1px solid ${accent}`,
                width: 100,
              }}
            />
          )}
          <div
            style={{
              fontSize: 6,
              color: accent,
              fontWeight: "bold",
              marginTop: 2,
            }}
          >
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceCustomizer() {
  const [settings, setSettings] = useState<InvoiceSettings>(loadSettings);
  const [logo, setLogo] = useState<string | null>(() =>
    localStorage.getItem(LOGO_KEY),
  );
  const [signature, setSignature] = useState<string | null>(() =>
    localStorage.getItem(SIG_KEY),
  );
  const [info, setInfo] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(INFO_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [accent, setAccent] = useState<string>(
    () => localStorage.getItem(ACCENT_KEY) || PRESET_COLORS[0],
  );
  const [customHex, setCustomHex] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const saveAll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    localStorage.setItem(INFO_KEY, JSON.stringify(info));
    localStorage.setItem(ACCENT_KEY, accent);
    toast.success("Invoice customization saved!");
  };

  const updateSetting = <K extends keyof InvoiceSettings>(
    key: K,
    value: InvoiceSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setLogo(b64);
      localStorage.setItem(LOGO_KEY, b64);
      toast.success("Logo uploaded");
    };
    reader.readAsDataURL(file);
  };

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setSignature(b64);
      localStorage.setItem(SIG_KEY, b64);
      toast.success("Signature uploaded");
    };
    reader.readAsDataURL(file);
  };

  const handleAccent = (color: string) => {
    setAccent(color);
    localStorage.setItem(ACCENT_KEY, color);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/40 flex items-center gap-2 flex-shrink-0">
        <Settings size={16} className="text-teal" />
        <span className="text-[15px] font-bold uppercase tracking-wide text-foreground">
          Invoice Customizer
        </span>
        <Badge className="bg-teal/20 text-teal border border-teal/40 text-[10px] ml-2">
          Advanced
        </Badge>
        <div className="flex-1" />
        <Button
          size="sm"
          onClick={saveAll}
          className="bg-teal hover:bg-teal/80 text-primary-foreground text-[11px] h-7"
          data-ocid="invoice_customizer.save_button"
        >
          <Check size={11} className="mr-1" /> Save All
        </Button>
      </div>

      <Tabs
        defaultValue="logo"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-4 pt-3 border-b border-border flex-shrink-0">
          <TabsList className="h-8">
            <TabsTrigger
              value="logo"
              className="text-[11px]"
              data-ocid="invoice_customizer.logo.tab"
            >
              <Image size={11} className="mr-1" /> Logo &amp; Branding
            </TabsTrigger>
            <TabsTrigger
              value="colors"
              className="text-[11px]"
              data-ocid="invoice_customizer.colors.tab"
            >
              <Palette size={11} className="mr-1" /> Colors &amp; Style
            </TabsTrigger>
            <TabsTrigger
              value="fields"
              className="text-[11px]"
              data-ocid="invoice_customizer.fields.tab"
            >
              <Settings size={11} className="mr-1" /> Fields
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="text-[11px]"
              data-ocid="invoice_customizer.preview.tab"
            >
              <Eye size={11} className="mr-1" /> Preview
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Logo & Branding */}
        <TabsContent value="logo" className="flex-1 overflow-auto p-5 m-0">
          <div className="max-w-xl space-y-5">
            {/* Logo Upload */}
            <div className="border border-border bg-secondary/20 p-4 space-y-3">
              <Label className="text-[12px] font-semibold text-foreground">
                Company Logo
              </Label>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 border border-dashed border-border bg-background flex items-center justify-center rounded overflow-hidden flex-shrink-0">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image size={24} className="text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[11px] h-7"
                    onClick={() => logoInputRef.current?.click()}
                    data-ocid="invoice_customizer.logo.upload_button"
                  >
                    <Upload size={11} className="mr-1" /> Upload Logo
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {logo && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-7 ml-1 border-destructive/40 text-destructive"
                      onClick={() => {
                        setLogo(null);
                        localStorage.removeItem(LOGO_KEY);
                        toast.info("Logo removed");
                      }}
                      data-ocid="invoice_customizer.logo.delete_button"
                    >
                      <X size={11} className="mr-1" /> Remove
                    </Button>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    PNG, JPG, SVG. Max 2MB. Stored in browser.
                  </p>
                </div>
              </div>
            </div>

            {/* Signature Upload */}
            <div className="border border-border bg-secondary/20 p-4 space-y-3">
              <Label className="text-[12px] font-semibold text-foreground">
                Authorized Signatory
              </Label>
              <div className="flex items-start gap-4">
                <div className="w-28 h-16 border border-dashed border-border bg-background flex items-center justify-center rounded overflow-hidden flex-shrink-0">
                  {signature ? (
                    <img
                      src={signature}
                      alt="Signature"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[9px] text-muted-foreground text-center px-2">
                      Signature
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[11px] h-7"
                    onClick={() => sigInputRef.current?.click()}
                    data-ocid="invoice_customizer.signature.upload_button"
                  >
                    <Upload size={11} className="mr-1" /> Upload Signature
                  </Button>
                  <input
                    ref={sigInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSigUpload}
                  />
                  {signature && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-7 ml-1 border-destructive/40 text-destructive"
                      onClick={() => {
                        setSignature(null);
                        localStorage.removeItem(SIG_KEY);
                        toast.info("Signature removed");
                      }}
                      data-ocid="invoice_customizer.signature.delete_button"
                    >
                      <X size={11} className="mr-1" /> Remove
                    </Button>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    PNG with transparent background recommended.
                  </p>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="border border-border bg-secondary/20 p-4 space-y-3">
              <Label className="text-[12px] font-semibold text-foreground">
                Company Information
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    key: "companyName",
                    label: "Company Name",
                    placeholder: "Your Company Ltd.",
                  },
                  {
                    key: "gstin",
                    label: "GSTIN",
                    placeholder: "29XXXXX1234Z5",
                  },
                  {
                    key: "address",
                    label: "Address",
                    placeholder: "123 Street, City",
                  },
                  { key: "phone", label: "Phone", placeholder: "9876543210" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      {label}
                    </Label>
                    <Input
                      value={info[key] || ""}
                      onChange={(e) =>
                        setInfo((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      placeholder={placeholder}
                      className="h-7 text-[11px]"
                      data-ocid={`invoice_customizer.${key}.input`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Colors & Style */}
        <TabsContent value="colors" className="flex-1 overflow-auto p-5 m-0">
          <div className="max-w-xl space-y-5">
            {/* Accent Color */}
            <div className="border border-border bg-secondary/20 p-4 space-y-3">
              <Label className="text-[12px] font-semibold text-foreground">
                Accent Color
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleAccent(c)}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      accent === c
                        ? "border-foreground scale-110"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                    style={{ background: c }}
                    title={c}
                    data-ocid="invoice_customizer.accent.toggle"
                  />
                ))}
                <div className="flex items-center gap-2 ml-2">
                  <Input
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    placeholder="#rrggbb"
                    className="h-7 w-28 text-[11px] font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[11px] h-7"
                    onClick={() => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(customHex)) {
                        handleAccent(customHex);
                        toast.success("Custom color applied");
                      } else {
                        toast.error("Enter a valid hex color like #3B82F6");
                      }
                    }}
                    data-ocid="invoice_customizer.custom_color.button"
                  >
                    Apply
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-16 h-5 rounded"
                  style={{ background: accent }}
                />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {accent}
                </span>
              </div>
            </div>

            {/* Font Size */}
            <div className="border border-border bg-secondary/20 p-4 space-y-3">
              <Label className="text-[12px] font-semibold text-foreground">
                Font Size
              </Label>
              <div className="flex gap-2">
                {(["small", "medium", "large"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateSetting("fontSize", s)}
                    className={`px-3 py-1.5 text-[11px] border transition-colors ${
                      settings.fontSize === s
                        ? "bg-teal text-primary-foreground border-teal"
                        : "border-border hover:border-teal/40"
                    }`}
                    data-ocid={`invoice_customizer.font_${s}.toggle`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Size */}
            <div className="border border-border bg-secondary/20 p-4 space-y-3">
              <Label className="text-[12px] font-semibold text-foreground">
                Paper Size
              </Label>
              <div className="flex gap-2">
                {(["A4", "Letter"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateSetting("paperSize", s)}
                    className={`px-3 py-1.5 text-[11px] border transition-colors ${
                      settings.paperSize === s
                        ? "bg-teal text-primary-foreground border-teal"
                        : "border-border hover:border-teal/40"
                    }`}
                    data-ocid={`invoice_customizer.paper_${s}.toggle`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Show/Hide Rows */}
            <div className="border border-border bg-secondary/20 p-4 space-y-3">
              <Label className="text-[12px] font-semibold text-foreground">
                Show / Hide Sections
              </Label>
              <div className="space-y-2">
                {[
                  { key: "showGSTIN" as const, label: "GSTIN & Contact Row" },
                  { key: "showPAN" as const, label: "PAN Number Row" },
                  {
                    key: "showBankDetails" as const,
                    label: "Bank Details Footer",
                  },
                  { key: "showQRCode" as const, label: "QR Code Placeholder" },
                  { key: "showTerms" as const, label: "Terms & Conditions" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch
                      checked={settings[key]}
                      onCheckedChange={(v) => updateSetting(key, v)}
                      data-ocid={`invoice_customizer.${key}.switch`}
                    />
                    <Label className="text-[11px] text-foreground cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            {settings.showTerms && (
              <div className="border border-border bg-secondary/20 p-4 space-y-2">
                <Label className="text-[12px] font-semibold text-foreground">
                  Terms &amp; Conditions
                </Label>
                <Textarea
                  value={settings.terms}
                  onChange={(e) => updateSetting("terms", e.target.value)}
                  rows={4}
                  className="text-[11px]"
                  data-ocid="invoice_customizer.terms.textarea"
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Fields */}
        <TabsContent value="fields" className="flex-1 overflow-auto p-5 m-0">
          <div className="max-w-md space-y-4">
            <div className="border border-border bg-secondary/20 p-4 space-y-3">
              <Label className="text-[12px] font-semibold text-foreground">
                Optional Invoice Columns
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Toggle to show or hide columns in the invoice line items table.
              </p>
              <div className="space-y-2">
                {[
                  { key: "showHSN" as const, label: "HSN / SAC Code Column" },
                  { key: "showDiscount" as const, label: "Discount % Column" },
                  {
                    key: "showSerialNo" as const,
                    label: "Serial No. (#) Column",
                  },
                  {
                    key: "showEwayBillNo" as const,
                    label: "e-Way Bill Number",
                  },
                  { key: "showVehicleNo" as const, label: "Vehicle Number" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch
                      checked={settings[key]}
                      onCheckedChange={(v) => updateSetting(key, v)}
                      data-ocid={`invoice_customizer.${key}.switch`}
                    />
                    <Label className="text-[11px] text-foreground cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Preview */}
        <TabsContent
          value="preview"
          className="flex-1 overflow-auto p-5 m-0 bg-gray-100 dark:bg-gray-900"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <p className="text-[11px] text-muted-foreground">
                Live preview of your invoice with current settings.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] h-7"
                onClick={() => window.print()}
                data-ocid="invoice_customizer.print_button"
              >
                <Printer size={11} className="mr-1" /> Print
              </Button>
            </div>
            <div className="overflow-auto">
              <InvoicePreview
                settings={settings}
                logo={logo}
                signature={signature}
                info={info}
                accent={accent}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
