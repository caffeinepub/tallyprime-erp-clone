import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Eye, EyeOff, Loader2, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { callOpenAI } from "../utils/openai";

const STORAGE_KEY = "hisabkitab_openai_key";

export default function AISettings() {
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const hasSaved = !!localStorage.getItem(STORAGE_KEY);

  const handleSave = () => {
    if (!keyInput.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    localStorage.setItem(STORAGE_KEY, keyInput.trim());
    setKeyInput("");
    toast.success("API key saved successfully");
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await callOpenAI("Say hello in one word.");
      toast.success(`Connection OK: ${res.trim()}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setKeyInput("");
    toast.success("API key removed");
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={16} className="text-teal" />
        <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
          AI Settings — OpenAI Configuration
        </h2>
        {hasSaved && (
          <Badge className="bg-teal/20 text-teal border border-teal/40 text-[10px] gap-1">
            <CheckCircle size={10} /> Key saved ✓
          </Badge>
        )}
      </div>

      <div className="border border-border bg-secondary/20 p-4 space-y-4">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground uppercase">
            OpenAI API Key
          </Label>
          <div className="relative">
            <Input
              data-ocid="ai_settings.input"
              type={showKey ? "text" : "password"}
              placeholder="sk-proj-..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="font-mono text-[11px] pr-10 bg-background border-border"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          {hasSaved && (
            <p className="text-[10px] text-teal mt-1">
              A key is currently stored. Enter a new key above to replace it.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            data-ocid="ai_settings.save_button"
            size="sm"
            onClick={handleSave}
            className="bg-teal hover:bg-teal/80 text-primary-foreground text-[11px] h-7"
          >
            Save Key
          </Button>
          <Button
            data-ocid="ai_settings.primary_button"
            size="sm"
            variant="outline"
            onClick={handleTest}
            disabled={testing}
            className="text-[11px] h-7 border-border"
          >
            {testing ? (
              <Loader2 size={11} className="animate-spin mr-1" />
            ) : null}
            Test Connection
          </Button>
          {hasSaved && (
            <Button
              data-ocid="ai_settings.delete_button"
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="text-[11px] h-7 border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              Remove Key
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 border border-border/50 bg-secondary/10 p-3">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Security:</strong> Your API key is
          stored only in your browser&apos;s localStorage. It is never sent to
          any server other than OpenAI directly. Never share your key.
        </p>
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          Features powered by AI: Narration Generator (Voucher Entry), Anomaly
          Detector explanations, and &quot;Explain This Report&quot; on Balance
          Sheet / P&amp;L / Trial Balance.
        </p>
      </div>
    </div>
  );
}
