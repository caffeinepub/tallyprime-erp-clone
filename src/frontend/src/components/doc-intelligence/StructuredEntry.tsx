import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface OCRData {
  vendor: string;
  invoiceNumber: string;
  date: string;
  totalAmount: string;
  gstAmount: string;
  gstin: string;
}

interface VoucherEntry {
  id: string;
  type: string;
  ledger: string;
  date: string;
  amount: string;
  narration: string;
  sourceDoc: string;
  createdAt: string;
}

function loadOCRPending(): OCRData | null {
  try {
    const d = localStorage.getItem("hkp_ocr_pending");
    return d ? JSON.parse(d) : null;
  } catch {
    return null;
  }
}

function loadVouchers(): VoucherEntry[] {
  try {
    return JSON.parse(localStorage.getItem("hkp_vouchers") || "[]");
  } catch {
    return [];
  }
}

function saveVouchers(v: VoucherEntry[]) {
  localStorage.setItem("hkp_vouchers", JSON.stringify(v));
}

export default function StructuredEntry() {
  const [ocr, setOcr] = useState<OCRData | null>(null);
  const [voucherType, setVoucherType] = useState("Purchase");
  const [ledger, setLedger] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [created, setCreated] = useState(false);

  const reload = useCallback(() => {
    const data = loadOCRPending();
    if (data) {
      setOcr(data);
      setVoucherType("Purchase");
      setLedger(data.vendor || "");
      setDate(data.date || new Date().toLocaleDateString("en-IN"));
      setAmount(data.totalAmount || "");
      setNarration(
        `Purchase from ${data.vendor} | Invoice ${data.invoiceNumber} | GST: \u20b9${data.gstAmount}`,
      );
    }
    setCreated(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCreate = () => {
    if (!amount || !ledger) {
      toast.error("Please fill all required fields");
      return;
    }
    const vouchers = loadVouchers();
    const entry: VoucherEntry = {
      id: `VCH-OCR-${Date.now()}`,
      type: voucherType,
      ledger,
      date,
      amount,
      narration,
      sourceDoc: ocr?.invoiceNumber || "Manual",
      createdAt: new Date().toISOString(),
    };
    vouchers.push(entry);
    saveVouchers(vouchers);
    localStorage.removeItem("hkp_ocr_pending");
    try {
      const docs = JSON.parse(
        localStorage.getItem("hkp_document_register") || "[]",
      );
      const updated = docs.map(
        (d: {
          invoiceNumber: string;
          status: string;
          linkedVoucherId: string;
        }) =>
          d.invoiceNumber === ocr?.invoiceNumber
            ? { ...d, status: "Linked", linkedVoucherId: entry.id }
            : d,
      );
      localStorage.setItem("hkp_document_register", JSON.stringify(updated));
    } catch {
      /* ignore */
    }
    setCreated(true);
    toast.success(`Voucher ${entry.id} created successfully`);
  };

  const handleClear = () => {
    localStorage.removeItem("hkp_ocr_pending");
    setOcr(null);
    setVoucherType("Purchase");
    setLedger("");
    setDate("");
    setAmount("");
    setNarration("");
    setCreated(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-teal-400" />
        <h2 className="text-base font-semibold text-foreground">
          Structured Entry
        </h2>
        {ocr && !created && (
          <Badge className="bg-blue-700 text-white">OCR Data Pending</Badge>
        )}
        {created && (
          <Badge className="bg-green-700 text-white">Voucher Created</Badge>
        )}
      </div>

      {!ocr ? (
        <Card className="bg-card border-border">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              No pending OCR data.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Go to <strong>Doc Intelligence &rarr; Scan Document</strong>, scan
              an invoice and click &ldquo;Use for Voucher Entry&rdquo;.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Create Voucher from OCR</CardTitle>
              <Badge variant="outline" className="text-xs">
                Source: {ocr.invoiceNumber}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Voucher Type *</Label>
                <Select value={voucherType} onValueChange={setVoucherType}>
                  <SelectTrigger
                    className="h-8 text-xs"
                    data-ocid="structured_entry.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Purchase",
                      "Sales",
                      "Payment",
                      "Receipt",
                      "Journal",
                      "Contra",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ledger / Party *</Label>
                <Input
                  value={ledger}
                  onChange={(e) => setLedger(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="Vendor / Ledger name"
                  data-ocid="structured_entry.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Amount (₹) *</Label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Narration</Label>
              <Textarea
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="text-xs h-16"
                data-ocid="structured_entry.textarea"
              />
            </div>

            <div className="rounded border border-teal-700/30 bg-teal-900/10 p-2 text-xs space-y-1">
              <p className="font-medium text-teal-400">OCR Source Data</p>
              <div className="grid grid-cols-3 gap-1 text-muted-foreground">
                <span>
                  GSTIN:{" "}
                  <span className="font-mono text-foreground">{ocr.gstin}</span>
                </span>
                <span>GST: ₹{ocr.gstAmount}</span>
                <span>Vendor: {ocr.vendor}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={created}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                data-ocid="structured_entry.submit_button"
              >
                {created ? "Voucher Created" : "Create Voucher"}
              </Button>
              <Button
                variant="outline"
                className="text-xs"
                onClick={handleClear}
                data-ocid="structured_entry.cancel_button"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
