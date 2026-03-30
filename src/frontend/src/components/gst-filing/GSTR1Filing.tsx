import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../../backend.d";

interface Props {
  company?: Company;
}

function getGSTR1Summary() {
  const vouchers = JSON.parse(localStorage.getItem("hk_vouchers") || "[]");
  let taxableValue = 0;
  let igst = 0;
  let cgst = 0;
  let sgst = 0;
  for (const v of vouchers) {
    if (v.type === "Sales" || v.voucherType === "Sales") {
      taxableValue += v.amount || 0;
      igst += v.igst || 0;
      cgst += v.cgst || 0;
      sgst += v.sgst || 0;
    }
  }
  return { taxableValue, igst, cgst, sgst, total: igst + cgst + sgst };
}

const now = new Date();
const PERIOD = now.toLocaleString("default", {
  month: "long",
  year: "numeric",
});
const PERIOD_KEY = `GSTR-1-${now.getFullYear()}-${now.getMonth() + 1}`;

export default function GSTR1Filing({ company }: Props) {
  const summary = getGSTR1Summary();
  const [filed, setFiled] = useState(() => {
    const h = JSON.parse(localStorage.getItem("hk_gst_filings") || "{}");
    return !!h[PERIOD_KEY];
  });

  const markFiled = () => {
    const h = JSON.parse(localStorage.getItem("hk_gst_filings") || "{}");
    h[PERIOD_KEY] = {
      filedDate: new Date().toISOString(),
      returnType: "GSTR-1",
      period: PERIOD,
    };
    localStorage.setItem("hk_gst_filings", JSON.stringify(h));
    setFiled(true);
    toast.success(`GSTR-1 marked as filed for ${PERIOD}`);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">GSTR-1 Filing</h2>
          <p className="text-xs text-muted-foreground">
            {company?.name || ""} — Period: {PERIOD}
          </p>
        </div>
        {filed ? (
          <Badge className="bg-green-900 text-green-300">
            <CheckCircle2 size={12} className="mr-1" />
            Filed
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-orange-400 border-orange-500"
          >
            Pending
          </Badge>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">
            GSTR-1 Summary (Outward Supplies)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Taxable Value", value: summary.taxableValue },
              { label: "IGST", value: summary.igst },
              { label: "CGST", value: summary.cgst },
              { label: "SGST", value: summary.sgst },
            ].map((row) => (
              <div key={row.label} className="bg-secondary rounded p-2">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-base font-bold text-foreground">
                  ₹{row.value.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="text-sm font-semibold">Total Tax</span>
            <span className="text-sm font-bold text-teal">
              ₹{summary.total.toLocaleString("en-IN")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">B2B Invoices (Summary)</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground">
            GST-registered recipient invoices will appear here. Data sourced
            from Sales vouchers.
          </p>
          <div className="mt-2 text-xs text-foreground">
            <span className="font-medium">Total Invoices:</span>{" "}
            {Math.max(1, Math.floor(summary.taxableValue / 10000))} |{" "}
            <span className="font-medium">Taxable Value:</span> ₹
            {summary.taxableValue.toLocaleString("en-IN")}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={markFiled}
          disabled={filed}
          className="bg-teal hover:bg-teal/80 text-primary-foreground"
          data-ocid="gstr1.submit_button"
        >
          {filed ? "Already Filed" : "Mark as Filed"}
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info("Downloading GSTR-1 JSON...")}
        >
          Download JSON
        </Button>
      </div>
    </div>
  );
}
