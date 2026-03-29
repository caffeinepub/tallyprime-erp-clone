import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";

interface Props {
  company: Company | null;
}

interface ParsedVoucher {
  voucherType: string;
  amount: number;
  party: string;
  mode: string;
}

const HINDI_NUMBERS: Record<string, number> = {
  एक: 1,
  दो: 2,
  तीन: 3,
  चार: 4,
  पाँच: 5,
  पांच: 5,
  छह: 6,
  सात: 7,
  आठ: 8,
  नौ: 9,
  दस: 10,
  बीस: 20,
  तीस: 30,
  चालीस: 40,
  पचास: 50,
  साठ: 60,
  सत्तर: 70,
  अस्सी: 80,
  नब्बे: 90,
  सौ: 100,
  लाख: 100000,
};

function extractAmount(text: string): number {
  // Hindi numeric words
  const hindiMatch = text.match(
    /([\u0900-\u097F\s]+)\s*(?:रुपये|रुपय|rupee|rupees)?/,
  );
  if (hindiMatch) {
    let val = 0;
    let current = 0;
    for (const word of text.split(/\s+/)) {
      const n = HINDI_NUMBERS[word];
      if (n) {
        if (n >= 1000) {
          val += (current || 1) * n;
          current = 0;
        } else if (n === 100) {
          current = (current || 1) * n;
        } else {
          current += n;
        }
      }
    }
    val += current;
    if (val > 0) return val;
  }
  // English numbers: ₹5000 or 5000
  const numMatch = text.match(/[₹Rs\.\s]?([0-9,]+(?:\.[0-9]+)?)/i);
  if (numMatch) {
    return Number.parseFloat(numMatch[1].replace(/,/g, ""));
  }
  return 0;
}

function parseVoiceText(text: string): ParsedVoucher | null {
  const lower = text.toLowerCase();
  let voucherType = "Journal";
  let amount = 0;
  let party = "";
  let mode = "";

  // Determine type
  if (/paid|payment|diya|दिए|दिया|दिये/.test(lower)) voucherType = "Payment";
  else if (/received|receipt|mila|मिला|मिले/.test(lower))
    voucherType = "Receipt";
  else if (/sales|sale|becha|bechi|बेचा/.test(lower)) voucherType = "Sales";
  else if (/purchase|bought|kharida|ख़रीदा|खरीदा/.test(lower))
    voucherType = "Purchase";

  amount = extractAmount(text);

  // Party extraction: "to Ram", "from Shyam", "ko Ram"
  const toMatch = text.match(/(?:to|ko|\bको\b)\s+([A-Za-z\u0900-\u097F]+)/i);
  const fromMatch = text.match(/(?:from|se|\bसे\b)\s+([A-Za-z\u0900-\u097F]+)/i);
  if (toMatch) party = toMatch[1];
  else if (fromMatch) party = fromMatch[1];

  // Mode
  if (/cash|nakit|नकद|नक़द/.test(lower)) mode = "Cash";
  else if (/bank|cheque|check/.test(lower)) mode = "Bank";

  if (amount === 0) return null;
  return { voucherType, amount, party, mode };
}

export default function VoiceVoucherEntry({ company }: Props) {
  const [lang, setLang] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<ParsedVoucher | null>(null);
  const recogRef = useRef<any>(null);

  const SpeechRecognitionCtor =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      : null;

  const startListening = () => {
    if (!SpeechRecognitionCtor) {
      toast.error("Voice input requires Chrome browser");
      return;
    }
    const recog = new SpeechRecognitionCtor();
    recog.lang = lang;
    recog.interimResults = true;
    recog.continuous = true;
    recog.onresult = (e: any) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript;
      }
      setTranscript(full);
      const p = parseVoiceText(full);
      setParsed(p);
    };
    recog.onerror = () => {
      setListening(false);
    };
    recog.onend = () => {
      setListening(false);
    };
    recog.start();
    recogRef.current = recog;
    setListening(true);
    setTranscript("");
    setParsed(null);
  };

  const stopListening = () => {
    recogRef.current?.stop();
    setListening(false);
  };

  const handleCreate = () => {
    if (!company || !parsed) return;
    const vouchers = JSON.parse(
      localStorage.getItem(`hisabkitab_vouchers_${company.id}`) || "[]",
    );
    const newV = {
      id: Date.now(),
      voucherNumber: vouchers.length + 1,
      voucherType: parsed.voucherType,
      amount: parsed.amount,
      party: parsed.party,
      mode: parsed.mode,
      narration: transcript,
      date: new Date().toISOString().split("T")[0],
      companyId: company.id,
      source: "voice",
    };
    localStorage.setItem(
      `hisabkitab_vouchers_${company.id}`,
      JSON.stringify([...vouchers, newV]),
    );
    toast.success(
      `${parsed.voucherType} voucher for ₹${parsed.amount.toLocaleString("en-IN")} created`,
    );
    setTranscript("");
    setParsed(null);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Volume2 size={16} className="text-teal" />
        <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
          Voice-Based Accounting
        </h2>
      </div>

      {!SpeechRecognitionCtor && (
        <div
          data-ocid="voice.error_state"
          className="border border-destructive/50 bg-destructive/10 p-4 text-[12px] text-destructive"
        >
          ⚠ Voice input requires Chrome browser (Web Speech API not supported in
          this browser).
        </div>
      )}

      {SpeechRecognitionCtor && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] text-muted-foreground uppercase">
              Language:
            </span>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger
                data-ocid="voice.select"
                className="w-52 h-7 text-[11px] border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="en-IN" className="text-[11px]">
                  English (India)
                </SelectItem>
                <SelectItem value="hi-IN" className="text-[11px]">
                  Hindi (हिन्दी)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-4 my-8">
            <button
              type="button"
              data-ocid="voice.primary_button"
              onClick={listening ? stopListening : startListening}
              className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all ${
                listening
                  ? "border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
                  : "border-teal bg-teal/20 hover:bg-teal/30 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
              }`}
            >
              {listening ? (
                <MicOff size={32} className="text-red-400" />
              ) : (
                <Mic size={32} className="text-teal" />
              )}
            </button>
            <p className="text-[11px] text-muted-foreground">
              {listening
                ? "Listening... Click to stop"
                : "Click microphone to start"}
            </p>
          </div>

          {/* Live transcript */}
          {transcript && (
            <div className="border border-border bg-secondary/20 p-3 mb-4">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">
                Live Transcript
              </p>
              <p className="text-[13px] text-foreground italic">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Parsed preview */}
          {parsed && (
            <div className="border border-teal/40 bg-teal/5 p-4 mb-4">
              <p className="text-[11px] text-teal uppercase font-semibold mb-3">
                Parsed Voucher Preview
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Voucher Type", parsed.voucherType],
                  ["Amount", `₹${parsed.amount.toLocaleString("en-IN")}`],
                  ["Party", parsed.party || "—"],
                  ["Mode", parsed.mode || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase w-24">
                      {label}:
                    </span>
                    <span className="text-[12px] text-foreground font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                data-ocid="voice.submit_button"
                size="sm"
                onClick={handleCreate}
                disabled={!company}
                className="mt-3 bg-teal hover:bg-teal/80 text-primary-foreground h-7 text-[11px]"
              >
                Create Voucher
              </Button>
            </div>
          )}

          {!parsed && !transcript && (
            <div
              data-ocid="voice.empty_state"
              className="border border-border/50 bg-secondary/10 p-4"
            >
              <p className="text-[11px] text-muted-foreground mb-2">
                Try saying:
              </p>
              <ul className="space-y-1 text-[11px] text-muted-foreground list-disc list-inside">
                <li>"Paid ₹5000 to Ram via cash"</li>
                <li>"Received ₹10000 from Shyam"</li>
                <li>"Sales of ₹25000"</li>
                <li>"पाँच हज़ार रुपये राम को नकद में दिए"</li>
              </ul>
            </div>
          )}

          {!company && (
            <p className="text-[11px] text-destructive mt-3">
              ⚠ No company selected. Voucher will not be saved.
            </p>
          )}

          <div className="mt-6 border border-border/40 bg-secondary/10 p-3">
            <p className="text-[10px] text-muted-foreground">
              Voice support depends on your browser. Chrome on desktop works
              best. Hindi recognition uses your device&apos;s speech model.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
