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
import { Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EWayBillFormProps {
  onGenerated?: (ewb: EWayBillEntry) => void;
}

export interface EWayBillEntry {
  ewbNo: string;
  date: string;
  supplierGSTIN: string;
  recipientGSTIN: string;
  placeOfSupply: string;
  transportMode: string;
  vehicleNo: string;
  distanceKm: string;
  itemDescription: string;
  hsnCode: string;
  quantity: string;
  taxableValue: string;
  gstRate: string;
  status: "Active" | "Cancelled" | "Expired";
}

const EW_KEY = "hk_eway_bills";

export function loadEWayBills(): EWayBillEntry[] {
  try {
    return JSON.parse(localStorage.getItem(EW_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEWayBills(bills: EWayBillEntry[]) {
  localStorage.setItem(EW_KEY, JSON.stringify(bills));
}

export default function EWayBillForm({ onGenerated }: EWayBillFormProps) {
  const [form, setForm] = useState({
    supplierGSTIN: "",
    recipientGSTIN: "",
    placeOfSupply: "",
    transportMode: "Road",
    vehicleNo: "",
    distanceKm: "",
    itemDescription: "",
    hsnCode: "",
    quantity: "",
    taxableValue: "",
    gstRate: "18",
  });
  const [generated, setGenerated] = useState<EWayBillEntry | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierGSTIN || !form.recipientGSTIN || !form.taxableValue) {
      toast.error("Please fill all required fields");
      return;
    }
    const ewbNo = `EWB${Date.now().toString().slice(-10)}`;
    const entry: EWayBillEntry = {
      ...form,
      ewbNo,
      date: new Date().toLocaleDateString("en-IN"),
      status: "Active",
    };
    const existing = loadEWayBills();
    saveEWayBills([entry, ...existing]);
    setGenerated(entry);
    onGenerated?.(entry);
    toast.success(`e-Way Bill generated: ${ewbNo}`);
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-4">
        <Truck size={18} className="text-teal" />
        <h2 className="text-[15px] font-bold text-foreground">
          Generate e-Way Bill
        </h2>
      </div>

      {generated && (
        <div
          data-ocid="eway.success_state"
          className="mb-4 p-4 bg-green-500/10 border border-green-500/40 rounded"
        >
          <div className="text-[13px] font-bold text-green-500 mb-1">
            ✅ e-Way Bill Generated Successfully
          </div>
          <div className="text-[12px] text-foreground">
            EWB Number:{" "}
            <span className="font-mono font-bold text-teal">
              {generated.ewbNo}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Valid for 24 hours from {generated.date}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 text-[11px]"
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
              Supplier GSTIN *
            </Label>
            <Input
              data-ocid="eway.supplier_gstin.input"
              className="h-8 text-[12px] mt-1"
              placeholder="27AABCX1234D1ZE"
              value={form.supplierGSTIN}
              onChange={(e) => handleChange("supplierGSTIN", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Recipient GSTIN *
            </Label>
            <Input
              data-ocid="eway.recipient_gstin.input"
              className="h-8 text-[12px] mt-1"
              placeholder="29AABCX9876F1ZP"
              value={form.recipientGSTIN}
              onChange={(e) => handleChange("recipientGSTIN", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Place of Supply
            </Label>
            <Input
              data-ocid="eway.place_of_supply.input"
              className="h-8 text-[12px] mt-1"
              placeholder="Maharashtra"
              value={form.placeOfSupply}
              onChange={(e) => handleChange("placeOfSupply", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Transport Mode
            </Label>
            <Select
              value={form.transportMode}
              onValueChange={(v) => handleChange("transportMode", v)}
            >
              <SelectTrigger
                data-ocid="eway.transport_mode.select"
                className="h-8 text-[12px] mt-1"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Road", "Rail", "Air", "Ship"].map((m) => (
                  <SelectItem key={m} value={m} className="text-[12px]">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Vehicle Number
            </Label>
            <Input
              data-ocid="eway.vehicle_no.input"
              className="h-8 text-[12px] mt-1"
              placeholder="MH12AB1234"
              value={form.vehicleNo}
              onChange={(e) => handleChange("vehicleNo", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Distance (km)
            </Label>
            <Input
              data-ocid="eway.distance.input"
              type="number"
              className="h-8 text-[12px] mt-1"
              placeholder="250"
              value={form.distanceKm}
              onChange={(e) => handleChange("distanceKm", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Item Description *
            </Label>
            <Input
              data-ocid="eway.item_desc.input"
              className="h-8 text-[12px] mt-1"
              placeholder="Electronic Components"
              value={form.itemDescription}
              onChange={(e) => handleChange("itemDescription", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              HSN Code
            </Label>
            <Input
              data-ocid="eway.hsn.input"
              className="h-8 text-[12px] mt-1"
              placeholder="8542"
              value={form.hsnCode}
              onChange={(e) => handleChange("hsnCode", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Quantity
            </Label>
            <Input
              data-ocid="eway.quantity.input"
              className="h-8 text-[12px] mt-1"
              placeholder="100"
              value={form.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Taxable Value (₹) *
            </Label>
            <Input
              data-ocid="eway.taxable_value.input"
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
                data-ocid="eway.gst_rate.select"
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
            data-ocid="eway.submit_button"
            type="submit"
            size="sm"
            className="bg-teal hover:bg-teal/80 text-white text-[12px] min-h-[44px] lg:min-h-[32px]"
          >
            <Truck size={12} className="mr-1" />
            Generate e-Way Bill
          </Button>
          <Button
            data-ocid="eway.reset.button"
            type="button"
            variant="outline"
            size="sm"
            className="text-[12px] min-h-[44px] lg:min-h-[32px]"
            onClick={() =>
              setForm({
                supplierGSTIN: "",
                recipientGSTIN: "",
                placeOfSupply: "",
                transportMode: "Road",
                vehicleNo: "",
                distanceKm: "",
                itemDescription: "",
                hsnCode: "",
                quantity: "",
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
