import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface EInvoiceEntry {
  irn: string;
  invoiceNo: string;
  invoiceDate: string;
  buyerGSTIN: string;
  buyerName: string;
  itemDescription: string;
  hsnCode: string;
  qty: string;
  unitPrice: string;
  taxableValue: string;
  gstRate: string;
  status: "Generated" | "Cancelled";
}

const EI_KEY = "hk_einvoices";

export function loadEInvoices(): EInvoiceEntry[] {
  try {
    return JSON.parse(localStorage.getItem(EI_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEInvoices(list: EInvoiceEntry[]) {
  localStorage.setItem(EI_KEY, JSON.stringify(list));
}

function generateIRN(): string {
  const chars = "abcdef0123456789";
  return Array.from(
    { length: 64 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

interface EInvoiceFormProps {
  onGenerated?: (entry: EInvoiceEntry) => void;
}

export default function EInvoiceForm({ onGenerated }: EInvoiceFormProps) {
  const [form, setForm] = useState({
    invoiceNo: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    buyerGSTIN: "",
    buyerName: "",
    itemDescription: "",
    hsnCode: "",
    qty: "",
    unitPrice: "",
    taxableValue: "",
    gstRate: "18",
  });
  const [generated, setGenerated] = useState<EInvoiceEntry | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoiceNo || !form.buyerGSTIN || !form.taxableValue) {
      toast.error("Fill all required fields");
      return;
    }
    const entry: EInvoiceEntry = {
      ...form,
      irn: generateIRN(),
      status: "Generated",
    };
    const existing = loadEInvoices();
    saveEInvoices([entry, ...existing]);
    setGenerated(entry);
    onGenerated?.(entry);
    toast.success("E-Invoice generated with IRN");
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-4">
        <QrCode size={18} className="text-teal" />
        <h2 className="text-[15px] font-bold text-foreground">
          Generate GST E-Invoice
        </h2>
      </div>

      {generated && (
        <div
          data-ocid="einvoice.success_state"
          className="mb-4 p-4 bg-green-500/10 border border-green-500/40 rounded space-y-2"
        >
          <div className="text-[13px] font-bold text-green-500">
            ✅ E-Invoice Generated
          </div>
          <div className="text-[11px] text-muted-foreground">IRN:</div>
          <div className="text-[10px] font-mono text-teal break-all bg-secondary/40 p-2 rounded">
            {generated.irn}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-secondary/60 border border-border flex items-center justify-center">
              <QrCode size={40} className="text-muted-foreground" />
              <span className="sr-only">QR Placeholder</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              QR code embeds IRN + signed payload (simulated)
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-[11px]"
            onClick={() => setGenerated(null)}
          >
            Generate New
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Invoice Number *
            </Label>
            <Input
              data-ocid="einvoice.invoice_no.input"
              className="h-8 text-[12px] mt-1"
              placeholder="INV-2024-001"
              value={form.invoiceNo}
              onChange={(e) => handleChange("invoiceNo", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Invoice Date
            </Label>
            <Input
              data-ocid="einvoice.invoice_date.input"
              type="date"
              className="h-8 text-[12px] mt-1"
              value={form.invoiceDate}
              onChange={(e) => handleChange("invoiceDate", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Buyer GSTIN *
            </Label>
            <Input
              data-ocid="einvoice.buyer_gstin.input"
              className="h-8 text-[12px] mt-1"
              placeholder="29AABCX1234D1ZE"
              value={form.buyerGSTIN}
              onChange={(e) => handleChange("buyerGSTIN", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Buyer Name
            </Label>
            <Input
              data-ocid="einvoice.buyer_name.input"
              className="h-8 text-[12px] mt-1"
              placeholder="ABC Enterprises"
              value={form.buyerName}
              onChange={(e) => handleChange("buyerName", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Item Description
            </Label>
            <Input
              data-ocid="einvoice.item_desc.input"
              className="h-8 text-[12px] mt-1"
              placeholder="Laptop Computers"
              value={form.itemDescription}
              onChange={(e) => handleChange("itemDescription", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              HSN Code
            </Label>
            <Input
              data-ocid="einvoice.hsn.input"
              className="h-8 text-[12px] mt-1"
              placeholder="8471"
              value={form.hsnCode}
              onChange={(e) => handleChange("hsnCode", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Quantity
            </Label>
            <Input
              data-ocid="einvoice.qty.input"
              type="number"
              className="h-8 text-[12px] mt-1"
              placeholder="10"
              value={form.qty}
              onChange={(e) => handleChange("qty", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Unit Price (₹)
            </Label>
            <Input
              data-ocid="einvoice.unit_price.input"
              type="number"
              className="h-8 text-[12px] mt-1"
              placeholder="5000"
              value={form.unitPrice}
              onChange={(e) => handleChange("unitPrice", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Taxable Value (₹) *
            </Label>
            <Input
              data-ocid="einvoice.taxable_value.input"
              type="number"
              className="h-8 text-[12px] mt-1"
              placeholder="50000"
              value={form.taxableValue}
              onChange={(e) => handleChange("taxableValue", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              GST Rate (%)
            </Label>
            <Select
              value={form.gstRate}
              onValueChange={(v) => handleChange("gstRate", v)}
            >
              <SelectTrigger
                data-ocid="einvoice.gst_rate.select"
                className="h-8 text-[12px] mt-1"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["0", "5", "12", "18", "28"].map((r) => (
                  <SelectItem key={r} value={r} className="text-[12px]">
                    {r}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            data-ocid="einvoice.submit_button"
            type="submit"
            size="sm"
            className="bg-teal hover:bg-teal/80 text-white text-[12px] min-h-[44px] lg:min-h-[32px]"
          >
            <QrCode size={12} className="mr-1" />
            Generate E-Invoice & IRN
          </Button>
          <Button
            data-ocid="einvoice.reset.button"
            type="button"
            variant="outline"
            size="sm"
            className="text-[12px] min-h-[44px] lg:min-h-[32px]"
            onClick={() =>
              setForm({
                invoiceNo: "",
                invoiceDate: new Date().toISOString().slice(0, 10),
                buyerGSTIN: "",
                buyerName: "",
                itemDescription: "",
                hsnCode: "",
                qty: "",
                unitPrice: "",
                taxableValue: "",
                gstRate: "18",
              })
            }
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
