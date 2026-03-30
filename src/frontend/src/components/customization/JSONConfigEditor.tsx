import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Download, RefreshCw, Save, Upload } from "lucide-react";
import { useRef, useState } from "react";

const TEMPLATES: Record<string, object> = {
  Minimal: {
    app: "HisabKitab Pro",
    features: {
      gst: true,
      inventory: false,
      payroll: false,
      multiCurrency: false,
    },
    ui: { sidebar: "compact", theme: "dark", fontSize: 10 },
  },
  Full: {
    app: "HisabKitab Pro",
    features: {
      gst: true,
      inventory: true,
      payroll: true,
      multiCurrency: true,
      pos: true,
      crm: true,
      compliance: true,
    },
    ui: { sidebar: "expanded", theme: "dark", fontSize: 10 },
    gst: { autoDetect: true, hsnLookup: true, eInvoice: true, eWayBill: true },
    security: {
      rbac: true,
      makerChecker: true,
      fieldPermissions: true,
      passwordPolicy: true,
    },
  },
  "GST-Only": {
    app: "HisabKitab Pro",
    features: { gst: true, inventory: false, payroll: false },
    gst: {
      autoDetect: true,
      hsnLookup: true,
      eInvoice: true,
      eWayBill: true,
      gstr1: true,
      gstr3b: true,
    },
    ui: { sidebar: "minimal", theme: "dark" },
  },
};

export default function JSONConfigEditor() {
  const [json, setJson] = useState(JSON.stringify(TEMPLATES.Full, null, 2));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function validate(val: string) {
    try {
      JSON.parse(val);
      setError("");
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
    }
  }

  function handleChange(val: string) {
    setJson(val);
    setSaved(false);
    validate(val);
  }

  function save() {
    try {
      JSON.parse(json);
      localStorage.setItem("hkp_json_config", json);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Cannot save: invalid JSON");
    }
  }

  function reset() {
    const def = JSON.stringify(TEMPLATES.Full, null, 2);
    setJson(def);
    setError("");
  }

  function exportJSON() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hkp-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setJson(text);
      validate(text);
    };
    reader.readAsText(f);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Code className="h-6 w-6 text-teal-400" />
        <div>
          <h1 className="text-xl font-bold text-foreground">
            JSON Config Editor
          </h1>
          <p className="text-sm text-muted-foreground">
            Customize app behavior using JSON configuration
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base">Configuration Templates</CardTitle>
            <div className="flex gap-2">
              {Object.keys(TEMPLATES).map((t) => (
                <Button
                  key={t}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setJson(JSON.stringify(TEMPLATES[t], null, 2));
                    setError("");
                  }}
                  data-ocid="jsonconfigeditor.toggle"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <textarea
              value={json}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full h-80 font-mono text-xs bg-muted/30 border border-border rounded-lg p-4 text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-teal-500"
              spellCheck={false}
              data-ocid="jsonconfigeditor.editor"
            />
            {error && (
              <div
                className="mt-2 text-xs text-red-400 flex items-center gap-1"
                data-ocid="jsonconfigeditor.error_state"
              >
                <span>⚠</span> {error}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={save}
              disabled={!!error}
              className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
              data-ocid="jsonconfigeditor.save_button"
            >
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save"}
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              className="gap-2"
              data-ocid="jsonconfigeditor.secondary_button"
            >
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
            <Button
              onClick={exportJSON}
              variant="outline"
              className="gap-2"
              disabled={!!error}
            >
              <Download className="h-4 w-4" /> Export JSON
            </Button>
            <Button
              onClick={() => fileRef.current?.click()}
              variant="outline"
              className="gap-2"
              data-ocid="jsonconfigeditor.upload_button"
            >
              <Upload className="h-4 w-4" /> Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={importJSON}
            />
            {!error && (
              <Badge className="bg-green-700/30 text-green-300 border-green-700">
                Valid JSON
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
