import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";
import { callOpenAI } from "../utils/openai";

interface Props {
  company: Company | null;
}

interface Anomaly {
  voucherNum: string;
  type: string;
  date: string;
  issue: string;
  severity: "High" | "Medium" | "Low";
}

function severityColor(s: string) {
  if (s === "High") return "bg-red-500/20 text-red-400 border-red-500/40";
  if (s === "Medium")
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
  return "bg-blue-500/20 text-blue-400 border-blue-500/40";
}

export default function AIAnomalyDetector({ company }: Props) {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainText, setExplainText] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const anomalies = useMemo<Anomaly[]>(() => {
    if (!company) return [];
    const raw = localStorage.getItem(`hisabkitab_vouchers_${company.id}`);
    if (!raw) return [];
    let vouchers: any[] = [];
    try {
      vouchers = JSON.parse(raw);
    } catch {
      return [];
    }

    const results: Anomaly[] = [];
    const seen = new Map<string, number>();

    // Count per date
    const dateCount = new Map<string, number>();
    for (const v of vouchers) {
      const d = v.date?.split("T")[0] || v.date || "";
      dateCount.set(d, (dateCount.get(d) || 0) + 1);
    }

    for (const v of vouchers) {
      const amount = Number(v.amount || v.totalAmount || 0);
      const d = v.date?.split("T")[0] || v.date || "";
      const key = `${v.voucherType}|${amount}|${d}`;

      // Duplicate
      const prev = seen.get(key) || 0;
      if (prev > 0) {
        results.push({
          voucherNum: String(v.voucherNumber || v.id || "?"),
          type: v.voucherType || "Unknown",
          date: d,
          issue: `Duplicate entry: same type, amount ₹${amount.toLocaleString("en-IN")}, and date`,
          severity: "High",
        });
      }
      seen.set(key, prev + 1);

      // Round number alert
      if (amount > 100000 && amount % 10000 === 0) {
        results.push({
          voucherNum: String(v.voucherNumber || v.id || "?"),
          type: v.voucherType || "Unknown",
          date: d,
          issue: `Large round number: ₹${amount.toLocaleString("en-IN")} — may warrant review`,
          severity: "Medium",
        });
      }

      // Frequency alert
      if ((dateCount.get(d) || 0) > 5) {
        results.push({
          voucherNum: String(v.voucherNumber || v.id || "?"),
          type: v.voucherType || "Unknown",
          date: d,
          issue: `High transaction frequency: ${dateCount.get(d)} vouchers on ${d}`,
          severity: "Low",
        });
      }
    }

    return results;
  }, [company]);

  const handleExplain = async (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    setExplainText("");
    setExplainOpen(true);
    setExplainLoading(true);
    try {
      const text = await callOpenAI(
        `In accounting and fraud detection, explain briefly why the following pattern might be concerning:\n\n"${anomaly.issue}" (Voucher #${anomaly.voucherNum}, Type: ${anomaly.type}, Date: ${anomaly.date})\n\nExplain in 3-4 sentences for a small business accountant.`,
      );
      setExplainText(text);
    } catch (e: any) {
      toast.error(e.message);
      setExplainOpen(false);
    } finally {
      setExplainLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-teal" />
        <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
          AI Anomaly Detector
        </h2>
        <Badge className="bg-secondary/50 border-border text-muted-foreground text-[10px]">
          {anomalies.length} issues found
        </Badge>
      </div>

      {!company && (
        <p className="text-[12px] text-muted-foreground">
          No company selected.
        </p>
      )}

      {company && anomalies.length === 0 && (
        <div
          data-ocid="anomaly.empty_state"
          className="border border-border bg-secondary/20 p-6 text-center"
        >
          <p className="text-[12px] text-teal">
            ✓ No anomalies detected in voucher data.
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Voucher data is stored in localStorage after vouchers are created.
          </p>
        </div>
      )}

      {anomalies.length > 0 && (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                <th className="text-left px-3 py-2 text-muted-foreground uppercase text-[10px] font-medium">
                  Voucher #
                </th>
                <th className="text-left px-3 py-2 text-muted-foreground uppercase text-[10px] font-medium">
                  Type
                </th>
                <th className="text-left px-3 py-2 text-muted-foreground uppercase text-[10px] font-medium">
                  Date
                </th>
                <th className="text-left px-3 py-2 text-muted-foreground uppercase text-[10px] font-medium">
                  Issue
                </th>
                <th className="text-left px-3 py-2 text-muted-foreground uppercase text-[10px] font-medium">
                  Severity
                </th>
                <th className="text-left px-3 py-2 text-muted-foreground uppercase text-[10px] font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a, i) => (
                <tr
                  key={`${a.voucherNum}-${i}`}
                  data-ocid={`anomaly.item.${i + 1}`}
                  className="border-b border-border/50 hover:bg-secondary/20"
                >
                  <td className="px-3 py-2 font-mono text-teal">
                    {a.voucherNum}
                  </td>
                  <td className="px-3 py-2">{a.type}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.date}</td>
                  <td className="px-3 py-2 text-foreground">{a.issue}</td>
                  <td className="px-3 py-2">
                    <Badge
                      className={`text-[10px] border ${severityColor(a.severity)}`}
                    >
                      {a.severity}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      data-ocid={`anomaly.primary_button.${i + 1}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleExplain(a)}
                      className="h-6 text-[10px] border-teal/40 text-teal hover:bg-teal/10"
                    >
                      ✨ Explain
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={explainOpen} onOpenChange={setExplainOpen}>
        <DialogContent
          className="bg-background border-border max-w-lg"
          data-ocid="anomaly.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold">
              ✨ AI Explanation — Voucher #{selectedAnomaly?.voucherNum}
            </DialogTitle>
          </DialogHeader>
          {explainLoading ? (
            <div
              className="flex items-center gap-2 py-4"
              data-ocid="anomaly.loading_state"
            >
              <Loader2 size={14} className="animate-spin text-teal" />
              <span className="text-[12px] text-muted-foreground">
                Asking AI...
              </span>
            </div>
          ) : (
            <p className="text-[12px] text-foreground leading-relaxed whitespace-pre-wrap">
              {explainText}
            </p>
          )}
          <div className="flex justify-end">
            <Button
              data-ocid="anomaly.close_button"
              size="sm"
              variant="outline"
              onClick={() => setExplainOpen(false)}
              className="h-7 text-[11px]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-4 border border-border/40 bg-secondary/10 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle
            size={12}
            className="text-yellow-400 mt-0.5 flex-shrink-0"
          />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Anomaly detection is rule-based (duplicates, round numbers &gt;₹1L,
            high frequency). &quot;Explain&quot; uses OpenAI GPT-3.5 — requires
            API key in AI Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
