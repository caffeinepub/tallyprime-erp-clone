import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEMES, applyTheme, getCurrentThemeName } from "@/lib/themeManager";
import { Check, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ThemeCustomizer() {
  const [activeTheme, setActiveTheme] = useState(getCurrentThemeName);
  const [customColor, setCustomColor] = useState("#3b82f6");

  useEffect(() => {
    setActiveTheme(getCurrentThemeName());
  }, []);

  const handleSelectTheme = (name: string) => {
    applyTheme(name);
    setActiveTheme(name);
    // Notify App to re-apply theme
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: { name } }));
    window.dispatchEvent(new StorageEvent("storage"));
    toast.success(`Theme changed to ${name}`);
  };

  const handleCustomColor = () => {
    const root = document.documentElement;
    root.style.setProperty("--theme-accent", customColor);
    // Convert hex to approximate OKLCH effect by adjusting teal variable
    root.style.setProperty("--teal", "60% 0.18 235");
    toast.success("Custom accent color applied!");
  };

  const handleReset = () => {
    applyTheme("Default Blue");
    setActiveTheme("Default Blue");
    toast.success("Reset to Default Blue theme");
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Theme Customizer
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose a color theme for your HisabKitab Pro interface
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          data-ocid="theme_customizer.secondary_button"
          className="text-xs"
        >
          <RotateCcw size={12} className="mr-1" />
          Reset to Default
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {THEMES.map((theme) => {
          const isActive = activeTheme === theme.name;
          return (
            <button
              type="button"
              key={theme.name}
              data-ocid={`theme_customizer.${theme.name.toLowerCase().replace(/\s/g, "_")}.button`}
              onClick={() => handleSelectTheme(theme.name)}
              className={`relative p-3 border rounded text-left transition-all hover:scale-[1.02] ${
                isActive
                  ? "border-teal/70 bg-teal/10 shadow-sm"
                  : "border-border hover:border-border/80 bg-card"
              }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal/80 flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
              {/* Color swatches */}
              <div className="flex gap-1 mb-2">
                <div
                  className="w-6 h-6 rounded-sm border border-white/20"
                  style={{ backgroundColor: theme.primary }}
                  title="Primary"
                />
                <div
                  className="w-6 h-6 rounded-sm border border-white/20"
                  style={{ backgroundColor: theme.sidebar }}
                  title="Sidebar"
                />
                <div
                  className="w-6 h-6 rounded-sm border border-white/20"
                  style={{ backgroundColor: theme.accent }}
                  title="Accent"
                />
              </div>
              <div className="text-[11px] font-semibold text-foreground">
                {theme.name}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {theme.description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="border border-border rounded p-4 space-y-3">
        <div>
          <Label className="text-sm font-medium">
            Custom Accent Color Override
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Override the accent color with any hex value
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer border border-border bg-transparent"
          />
          <Input
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="h-8 text-xs font-mono w-32"
            placeholder="#3b82f6"
            data-ocid="theme_customizer.input"
          />
          <Button
            size="sm"
            onClick={handleCustomColor}
            data-ocid="theme_customizer.primary_button"
            className="text-xs"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
