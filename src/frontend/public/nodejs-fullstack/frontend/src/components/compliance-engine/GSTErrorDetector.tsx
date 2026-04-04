import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Severity = "High" | "Medium" | "Low";

interface GSTError {
  id: string;
  errorType: string;
  description: string;
  suggestedFix: string;
  severity: Severity;
  dismissed: boolean;
}

const DEMO_ERRORS: GSTError[] = [
  {
    id: "ge1",
    errorType: "Missing GSTIN",
    description:
      'Sales voucher SAL-2026-0142 (₹75,000) has no GSTIN for party "Ramesh Traders".',
    suggestedFix:
      "Open the voucher and enter the customer's 15-digit GSTIN in the party details.",
    severity: "High",
    dismissed: false,
  },
  {
    id: "ge2",
    errorType: "Invalid GST Rate",
    description:
      'Stock item "Premium Chair" has GST rate 15% — not a valid rate (valid: 0, 5, 12, 18, 28%).',
    suggestedFix:
      "Go to Stock Items and update the GST rate to a valid percentage.",
    severity: "High",
    dismissed: false,
  },
  {
    id: "ge3",
    errorType: "Missing HSN Code",
    description:
      'Stock item "Office Furniture Set" (value ₹85,000) has no HSN code. Mandatory for items above ₹50,000.',
    suggestedFix:
      "Open HSN Master, create an entry for this product category, and assign it to the stock item.",
    severity: "High",
    dismissed: false,
  },
  {
    id: "ge4",
    errorType: "Invalid GSTIN Format",
    description:
      'Ledger "Tech Solutions Ltd" has GSTIN "29ABCDE1234" — only 11 characters (must be 15).',
    suggestedFix:
      "Go to Ledger List, open this ledger, and enter the correct 15-character GSTIN.",
    severity: "High",
    dismissed: false,
  },
  {
    id: "ge5",
    errorType: "Duplicate Invoice Number",
    description:
      'Invoice number "INV-2026-0089" appears in both SAL-2026-0089 and SAL-2026-0089B.',
    suggestedFix:
      "Rename one of the vouchers with a unique invoice number before filing GSTR-1.",
    severity: "Medium",
    dismissed: false,
  },
  {
    id: "ge6",
    errorType: "IGST on Intra-State Transaction",
    description:
      "Purchase voucher PUR-2026-0201: IGST applied on a within-state transaction (same state GSTIN).",
    suggestedFix:
      "Change IGST to CGST+SGST. Intra-state supplies should use CGST and SGST.",
    severity: "Medium",
    dismissed: false,
  },
  {
    id: "ge7",
    errorType: "Zero-Rate B2B Supply",
    description:
      'Sales to registered dealer "ABC Corp" (GSTIN present) with 0% GST — may need exemption certificate.',
    suggestedFix:
      "Verify exemption. If taxable, update GST rate. If exempt, attach exemption document.",
    severity: "Low",
    dismissed: false,
  },
];

const SEV_COLORS: Record<Severity, string> = {
  High: "bg-red-500/20 text-red-400 border-red-500/40",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  Low: "bg-blue-500/20 text-blue-400 border-blue-500/40",
};

function loadErrors(): GSTError[] {
  try {
    const raw = localStorage.getItem("hkp_gst_errors");
    if (raw) return JSON.parse(raw) as GSTError[];
  } catch {
    /* ignore */
  }
  return DEMO_ERRORS;
}

function saveErrors(errs: GSTError[]) {
  localStorage.setItem("hkp_gst_errors", JSON.stringify(errs));
}

export default function GSTErrorDetector() {
  const [errors, setErrors] = useState<GSTError[]>(loadErrors);
  const [scanning, setScanning] = useState(false);

  const active = errors.filter((e) => !e.dismissed);
  const high = active.filter((e) => e.severity === "High").length;
  const medium = active.filter((e) => e.severity === "Medium").length;
  const low = active.filter((e) => e.severity === "Low").length;

  const handleDismiss = (id: string) => {
    const updated = errors.map((e) =>
      e.id === id ? { ...e, dismissed: true } : e,
    );
    setErrors(updated);
    saveErrors(updated);
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const fresh = DEMO_ERRORS.map((e) => ({ ...e, dismissed: false }));
      setErrors(fresh);
      saveErrors(fresh);
      setScanning(false);
      toast.success(`GST scan complete — ${fresh.length} issues found`);
    }, 1200);
  };

  const handleExport = () => {
    const csv = ["Error Type,Description,Severity,Suggested Fix"]
      .concat(
        active.map(
          (e) =>
            `"${e.errorType}","${e.description}","${e.severity}","${e.suggestedFix}"`,
        ),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gst_errors.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            GST Error Detector
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-scan for GST compliance issues before filing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={handleExport}
            data-ocid="gst_errors.export.button"
          >
            <Download size={11} className="mr-1" />
            Export
          </Button>
          <Button
            size="sm"
            className="text-xs h-7"
            onClick={handleScan}
            disabled={scanning}
            data-ocid="gst_errors.scan.primary_button"
          >
            <RefreshCw
              size={11}
              className={`mr-1 ${scanning ? "animate-spin" : ""}`}
            />
            {scanning ? "Scanning..." : "Scan Now"}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "High", count: high, cls: "text-red-400" },
          { label: "Medium", count: medium, cls: "text-yellow-400" },
          { label: "Low", count: low, cls: "text-blue-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-border rounded p-3 text-center bg-card/40"
          >
            <div className={`text-2xl font-bold ${s.cls}`}>{s.count}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {s.label} Severity
            </div>
          </div>
        ))}
      </div>

      {/* Error cards */}
      {active.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="gst_errors.empty_state"
        >
          <CheckCircle size={36} className="mx-auto mb-2 text-green-400" />
          <div className="text-sm">No active GST errors found!</div>
          <div className="text-xs mt-1">
            Your data is compliant. Click Scan Now to re-check.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((err, i) => (
            <div
              key={err.id}
              className="border border-border rounded p-4 space-y-2"
              data-ocid={`gst_errors.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <XCircle size={13} className="text-red-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-foreground">
                    {err.errorType}
                  </span>
                  <Badge
                    className={`text-[9px] px-1.5 py-0 ${SEV_COLORS[err.severity]}`}
                  >
                    {err.severity}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-6 text-muted-foreground"
                  onClick={() => handleDismiss(err.id)}
                  data-ocid={`gst_errors.dismiss.${i + 1}.button`}
                >
                  Dismiss
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {err.description}
              </div>
              <div className="text-[11px] text-teal bg-teal/5 border border-teal/20 rounded p-2">
                <span className="font-semibold">Fix: </span>
                {err.suggestedFix}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
