import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../../backend.d";

interface Props {
  company?: Company;
}

function getSummary() {
  const vouchers = JSON.parse(localStorage.getItem("hk_vouchers") || "[]");
  let outputTax = 0;
  let itcClaimed = 0;
  for (const v of vouchers) {
    const gst = (v.igst || 0) + (v.cgst || 0) + (v.sgst || 0);
    if (v.type === "Sales" || v.voucherType === "Sales") outputTax += gst;
    if (v.type === "Purchase" || v.voucherType === "Purchase")
      itcClaimed += gst;
  }
  return {
    outputTax,
    itcClaimed,
    netPayable: Math.max(0, outputTax - itcClaimed),
  };
}

const now = new Date();
const PERIOD = now.toLocaleString("default", {
  month: "long",
  year: "numeric",
});
const PERIOD_KEY = `GSTR-3B-${now.getFullYear()}-${now.getMonth() + 1}`;

export default function GSTR3BFiling({ company }: Props) {
  const summary = getSummary();
  const [challanRef, setChallanRef] = useState("");
  const [filed, setFiled] = useState(() => {
    const h = JSON.parse(localStorage.getItem("hk_gst_filings") || "{}");
    return !!h[PERIOD_KEY];
  });

  const markFiled = () => {
    const h = JSON.parse(localStorage.getItem("hk_gst_filings") || "{}");
    h[PERIOD_KEY] = {
      filedDate: new Date().toISOString(),
      returnType: "GSTR-3B",
      period: PERIOD,
      challanRef,
    };
    localStorage.setItem("hk_gst_filings", JSON.stringify(h));
    setFiled(true);
    toast.success(`GSTR-3B marked as filed for ${PERIOD}`);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">GSTR-3B Filing</h2>
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
          <CardTitle className="text-sm">Tax Liability Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Output GST (Sales)</span>
            <span className="font-medium text-red-400">
              ₹{summary.outputTax.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              ITC Available (Purchases)
            </span>
            <span className="font-medium text-green-400">
              ₹{summary.itcClaimed.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
            <span>Net Tax Payable</span>
            <span className="text-teal">
              ₹{summary.netPayable.toLocaleString("en-IN")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Payment Challan</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">IGST</p>
              <p className="font-medium">₹0</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">CGST</p>
              <p className="font-medium">
                ₹{Math.floor(summary.netPayable / 2).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">SGST</p>
              <p className="font-medium">
                ₹{Math.floor(summary.netPayable / 2).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Cess</p>
              <p className="font-medium">₹0</p>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Challan Reference No.</Label>
            <Input
              value={challanRef}
              onChange={(e) => setChallanRef(e.target.value)}
              placeholder="e.g. CHL2024031500001"
              className="h-8 text-xs"
              data-ocid="gstr3b.input"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={markFiled}
          disabled={filed}
          className="bg-teal hover:bg-teal/80 text-primary-foreground"
          data-ocid="gstr3b.submit_button"
        >
          {filed ? "Already Filed" : "Mark as Filed"}
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info("Generating challan...")}
        >
          Generate Challan
        </Button>
      </div>
    </div>
  );
}
