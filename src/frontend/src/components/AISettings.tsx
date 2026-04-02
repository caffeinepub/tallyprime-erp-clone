import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BrainCircuit,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { callGemini } from "../utils/gemini";
import { callOpenAI } from "../utils/openai";

const OPENAI_KEY = "hisabkitab_openai_key";
const GEMINI_KEY = "hisabkitab_gemini_key";

export default function AISettings() {
  // OpenAI state
  const [openaiInput, setOpenaiInput] = useState("");
  const [showOpenai, setShowOpenai] = useState(false);
  const [testingOpenai, setTestingOpenai] = useState(false);
  const hasOpenai = !!localStorage.getItem(OPENAI_KEY);

  // Gemini state
  const [geminiInput, setGeminiInput] = useState("");
  const [showGemini, setShowGemini] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const hasGemini = !!localStorage.getItem(GEMINI_KEY);

  // OpenAI handlers
  const handleSaveOpenai = () => {
    if (!openaiInput.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    localStorage.setItem(OPENAI_KEY, openaiInput.trim());
    setOpenaiInput("");
    toast.success("OpenAI API key saved successfully");
  };

  const handleTestOpenai = async () => {
    setTestingOpenai(true);
    try {
      const res = await callOpenAI("Say hello in one word.");
      toast.success(`OpenAI OK: ${res.trim()}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTestingOpenai(false);
    }
  };

  const handleClearOpenai = () => {
    localStorage.removeItem(OPENAI_KEY);
    setOpenaiInput("");
    toast.success("OpenAI key removed");
  };

  // Gemini handlers
  const handleSaveGemini = () => {
    if (!geminiInput.trim()) {
      toast.error("Please enter a Gemini API key");
      return;
    }
    localStorage.setItem(GEMINI_KEY, geminiInput.trim());
    setGeminiInput("");
    toast.success("Gemini API key saved successfully");
  };

  const handleTestGemini = async () => {
    setTestingGemini(true);
    try {
      const res = await callGemini("Say hello in one word.");
      toast.success(`Gemini OK: ${res.trim()}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTestingGemini(false);
    }
  };

  const handleClearGemini = () => {
    localStorage.removeItem(GEMINI_KEY);
    setGeminiInput("");
    toast.success("Gemini key removed");
  };

  return (
    <div className="p-6 max-w-xl space-y-6">
      {/* OpenAI Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-teal" />
          <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
            OpenAI Configuration
          </h2>
          {hasOpenai && (
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
                type={showOpenai ? "text" : "password"}
                placeholder="sk-proj-..."
                value={openaiInput}
                onChange={(e) => setOpenaiInput(e.target.value)}
                className="font-mono text-[11px] pr-10 bg-background border-border"
              />
              <button
                type="button"
                onClick={() => setShowOpenai((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showOpenai ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {hasOpenai && (
              <p className="text-[10px] text-teal mt-1">
                A key is currently stored. Enter a new key above to replace it.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              data-ocid="ai_settings.save_button"
              size="sm"
              onClick={handleSaveOpenai}
              className="bg-teal hover:bg-teal/80 text-primary-foreground text-[11px] h-7"
            >
              Save Key
            </Button>
            <Button
              data-ocid="ai_settings.primary_button"
              size="sm"
              variant="outline"
              onClick={handleTestOpenai}
              disabled={testingOpenai}
              className="text-[11px] h-7 border-border"
            >
              {testingOpenai ? (
                <Loader2 size={11} className="animate-spin mr-1" />
              ) : null}
              Test Connection
            </Button>
            {hasOpenai && (
              <Button
                data-ocid="ai_settings.delete_button"
                size="sm"
                variant="outline"
                onClick={handleClearOpenai}
                className="text-[11px] h-7 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                Remove Key
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 border border-border/50 bg-secondary/10 p-3">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Model:</strong> gpt-4o-mini
            (cost-efficient). Your key is stored only in your browser&apos;s
            localStorage. It is never sent to any server other than OpenAI
            directly.
          </p>
          <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
            If you get a quota error, add credits at{" "}
            <span className="text-teal font-mono">
              platform.openai.com/account/billing
            </span>
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Gemini Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-teal" />
          <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
            Gemini (Google AI) Configuration
          </h2>
          {hasGemini && (
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/40 text-[10px] gap-1">
              <CheckCircle size={10} /> Key saved ✓
            </Badge>
          )}
        </div>

        <div className="border border-border bg-secondary/20 p-4 space-y-4">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground uppercase">
              Gemini API Key
            </Label>
            <div className="relative">
              <Input
                data-ocid="ai_settings.gemini_input"
                type={showGemini ? "text" : "password"}
                placeholder="AIza..."
                value={geminiInput}
                onChange={(e) => setGeminiInput(e.target.value)}
                className="font-mono text-[11px] pr-10 bg-background border-border"
              />
              <button
                type="button"
                onClick={() => setShowGemini((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showGemini ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {hasGemini && (
              <p className="text-[10px] text-green-400 mt-1">
                A Gemini key is stored. Enter a new key above to replace it.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              data-ocid="ai_settings.gemini_save_button"
              size="sm"
              onClick={handleSaveGemini}
              className="bg-teal hover:bg-teal/80 text-primary-foreground text-[11px] h-7"
            >
              Save Key
            </Button>
            <Button
              data-ocid="ai_settings.gemini_test_button"
              size="sm"
              variant="outline"
              onClick={handleTestGemini}
              disabled={testingGemini}
              className="text-[11px] h-7 border-border"
            >
              {testingGemini ? (
                <Loader2 size={11} className="animate-spin mr-1" />
              ) : null}
              Test Connection
            </Button>
            {hasGemini && (
              <Button
                data-ocid="ai_settings.gemini_delete_button"
                size="sm"
                variant="outline"
                onClick={handleClearGemini}
                className="text-[11px] h-7 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                Remove Key
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 border border-border/50 bg-secondary/10 p-3">
          <div className="flex items-center gap-1 mb-1">
            <BrainCircuit size={11} className="text-teal" />
            <p className="text-[10px] text-muted-foreground">
              <strong className="text-foreground">Model:</strong>{" "}
              gemini-1.5-flash
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Used for OCR invoice scanning, document intelligence, and as an
            OpenAI alternative. Get a free key at{" "}
            <span className="text-teal font-mono">aistudio.google.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
