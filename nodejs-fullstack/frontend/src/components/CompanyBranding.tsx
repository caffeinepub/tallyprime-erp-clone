import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Palette, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const LOGO_KEY = "hk_company_logo";
const COLOR_KEY = "hk_brand_color";
const TAGLINE_KEY = "hk_company_tagline";

const PRESET_COLORS = [
  "#0d9488",
  "#2563eb",
  "#7c3aed",
  "#dc2626",
  "#ea580c",
  "#16a34a",
];

export default function CompanyBranding() {
  const [logo, setLogo] = useState<string | null>(() =>
    localStorage.getItem(LOGO_KEY),
  );
  const [brandColor, setBrandColor] = useState(
    () => localStorage.getItem(COLOR_KEY) || PRESET_COLORS[0],
  );
  const [tagline, setTagline] = useState(
    () => localStorage.getItem(TAGLINE_KEY) || "",
  );
  const [customHex, setCustomHex] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setLogo(b64);
      localStorage.setItem(LOGO_KEY, b64);
      toast.success("Company logo uploaded");
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (color: string) => {
    setBrandColor(color);
    localStorage.setItem(COLOR_KEY, color);
  };

  const handleSaveTagline = () => {
    localStorage.setItem(TAGLINE_KEY, tagline);
    toast.success("Tagline saved");
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Palette size={16} className="text-teal" />
        <h2 className="text-[14px] font-bold uppercase tracking-wider text-foreground">
          Company Branding
        </h2>
      </div>

      {/* Logo Section */}
      <div className="border border-border bg-secondary/20 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Image size={14} className="text-teal" />
          <Label className="text-[12px] font-semibold text-foreground">
            Company Logo
          </Label>
        </div>

        <div className="flex items-start gap-6">
          {/* Preview */}
          <div className="w-24 h-24 border-2 border-dashed border-border bg-background rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
            {logo ? (
              <img
                src={logo}
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Image size={20} className="text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">
                  No logo
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[11px] h-7"
              onClick={() => fileRef.current?.click()}
              data-ocid="company_branding.upload_button"
            >
              <Upload size={11} className="mr-1" /> Upload Logo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              size="sm"
              variant="outline"
              className="text-[11px] h-7 ml-1"
              onClick={() => {
                const defaultLogo = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="#0d9488"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif" font-weight="bold">H</text></svg>')}`;
                setLogo(defaultLogo);
                localStorage.setItem(LOGO_KEY, defaultLogo);
                toast.success("Default logo applied");
              }}
              data-ocid="company_branding.default_logo.button"
            >
              Use Default HK Logo
            </Button>
            {logo && (
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] h-7 ml-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setLogo(null);
                  localStorage.removeItem(LOGO_KEY);
                  toast.info("Logo removed");
                }}
                data-ocid="company_branding.logo.delete_button"
              >
                <X size={11} className="mr-1" /> Remove Logo
              </Button>
            )}
            <p className="text-[10px] text-muted-foreground">
              PNG, JPG, or SVG. Max 2MB. Stored in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Color */}
      <div className="border border-border bg-secondary/20 p-5 space-y-4">
        <Label className="text-[12px] font-semibold text-foreground">
          Brand Color
        </Label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleColorChange(c)}
              className={`w-8 h-8 rounded border-2 transition-all ${
                brandColor === c
                  ? "border-foreground scale-110 shadow-md"
                  : "border-transparent hover:border-muted-foreground"
              }`}
              style={{ background: c }}
              title={c}
              data-ocid="company_branding.color.toggle"
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
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
                handleColorChange(customHex);
                toast.success("Custom brand color applied");
              } else {
                toast.error("Enter a valid hex color");
              }
            }}
            data-ocid="company_branding.custom_color.button"
          >
            Apply Custom
          </Button>
        </div>
      </div>

      {/* Tagline */}
      <div className="border border-border bg-secondary/20 p-5 space-y-3">
        <Label className="text-[12px] font-semibold text-foreground">
          Company Tagline
        </Label>
        <div className="flex gap-2">
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Your vision, our numbers."
            className="h-8 text-[11px] flex-1"
            data-ocid="company_branding.tagline.input"
          />
          <Button
            size="sm"
            onClick={handleSaveTagline}
            className="bg-teal hover:bg-teal/80 text-primary-foreground text-[11px] h-8"
            data-ocid="company_branding.tagline.save_button"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="border border-border bg-secondary/20 p-5 space-y-3">
        <Label className="text-[12px] font-semibold text-foreground">
          Header Preview
        </Label>
        <div
          className="rounded p-3 flex items-center gap-3"
          style={{ background: brandColor }}
        >
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              className="w-10 h-10 object-contain rounded"
            />
          ) : (
            <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
          )}
          <div>
            <div className="text-white font-bold text-sm">HisabKitab Pro</div>
            {tagline && (
              <div className="text-white/80 text-[10px]">{tagline}</div>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Your company logo appears on invoices and the app header when
          configured.
        </p>
      </div>
    </div>
  );
}
