import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";

interface LineItem {
  itemName: string;
  qty: number;
  rate: number;
  gstPct: number;
  amount: number;
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  date: string;
  customerName: string;
  deliveryDate: string;
  terms: string;
  lineItems: LineItem[];
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Dispatched" | "Cancelled";
  companyName: string;
  createdAt: string;
}

const LS_KEY = "hk-sales-orders";

function loadSOs(): SalesOrder[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveSOs(sos: SalesOrder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sos));
}

function genSONumber(): string {
  const existing = loadSOs();
  return `SO-${String(existing.length + 1).padStart(4, "0")}`;
}

const emptyLine = (): LineItem => ({
  itemName: "",
  qty: 1,
  rate: 0,
  gstPct: 18,
  amount: 0,
});

export default function SalesOrderEntry({ company }: { company: Company }) {
  const today = new Date().toISOString().slice(0, 10);
  const [soNumber] = useState(genSONumber);
  const [date, setDate] = useState(today);
  const [customerName, setCustomerName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [terms, setTerms] = useState("");
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const customerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    customerRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const calcLine = (line: LineItem): LineItem => {
    const base = line.qty * line.rate;
    return {
      ...line,
      amount: Math.round((base + base * (line.gstPct / 100)) * 100) / 100,
    };
  };

  const updateLine = (
    i: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setLines((prev) => {
      const u = [...prev];
      u[i] = calcLine({ ...u[i], [field]: value });
      return u;
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (i: number) =>
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  const totalAmount = lines.reduce((s, l) => s + l.amount, 0);

  const handleSave = () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (lines.some((l) => !l.itemName.trim())) {
      toast.error("All items need a name");
      return;
    }
    const so: SalesOrder = {
      id: Date.now().toString(),
      soNumber,
      date,
      customerName: customerName.trim(),
      deliveryDate,
      terms,
      lineItems: lines,
      totalAmount,
      status: "Pending",
      companyName: company.name,
      createdAt: new Date().toISOString(),
    };
    saveSOs([...loadSOs(), so]);
    toast.success(`Sales Order ${soNumber} saved!`);
    setCustomerName("");
    setDeliveryDate("");
    setTerms("");
    setLines([emptyLine()]);
  };

  return (
    <div
      className="h-full overflow-y-auto p-4 bg-background"
      data-ocid="so_entry.page"
    >
      <div className="max-w-5xl mx-auto">
        <div className="tally-section-header mb-4">
          Create Sales Order — {company.name}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <Label className="text-[11px] text-muted-foreground">
              SO Number
            </Label>
            <Input
              value={soNumber}
              readOnly
              className="font-mono text-teal bg-secondary/30 h-8 text-[12px]"
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 text-[12px]"
              data-ocid="so_entry.input"
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Customer Name *
            </Label>
            <Input
              ref={customerRef}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="h-8 text-[12px]"
              data-ocid="so_entry.input"
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">
              Delivery Date
            </Label>
            <Input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="h-8 text-[12px]"
              data-ocid="so_entry.input"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-[11px] text-muted-foreground">
              Terms & Conditions
            </Label>
            <Input
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Payment/delivery terms..."
              className="h-8 text-[12px]"
              data-ocid="so_entry.input"
            />
          </div>
        </div>

        <div className="border border-border mb-3">
          <div className="grid grid-cols-12 gap-0 bg-secondary/60 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
            <div className="col-span-4 px-2 py-1.5"># Item Name</div>
            <div className="col-span-2 px-2 py-1.5 text-right">Qty</div>
            <div className="col-span-2 px-2 py-1.5 text-right">Rate (₹)</div>
            <div className="col-span-1 px-2 py-1.5 text-right">GST%</div>
            <div className="col-span-2 px-2 py-1.5 text-right">Amount (₹)</div>
            <div className="col-span-1 px-2 py-1.5" />
          </div>
          {lines.map((line, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: line items ordered by position
              key={i}
              className="grid grid-cols-12 gap-0 border-b border-border/50 hover:bg-secondary/20"
            >
              <div className="col-span-4 px-1 py-1">
                <Input
                  value={line.itemName}
                  onChange={(e) => updateLine(i, "itemName", e.target.value)}
                  placeholder={`Item ${i + 1}`}
                  className="h-7 text-[11px] border-0 bg-transparent focus-visible:ring-0"
                  data-ocid={`so_entry.item.${i + 1}`}
                />
              </div>
              <div className="col-span-2 px-1 py-1">
                <Input
                  type="number"
                  value={line.qty}
                  onChange={(e) => updateLine(i, "qty", Number(e.target.value))}
                  className="h-7 text-[11px] text-right border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <div className="col-span-2 px-1 py-1">
                <Input
                  type="number"
                  value={line.rate}
                  onChange={(e) =>
                    updateLine(i, "rate", Number(e.target.value))
                  }
                  className="h-7 text-[11px] text-right border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <div className="col-span-1 px-1 py-1">
                <Input
                  type="number"
                  value={line.gstPct}
                  onChange={(e) =>
                    updateLine(i, "gstPct", Number(e.target.value))
                  }
                  className="h-7 text-[11px] text-right border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <div className="col-span-2 px-2 py-1 flex items-center justify-end text-[11px] font-mono text-teal">
                {line.amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="col-span-1 px-1 py-1 flex items-center justify-center">
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="text-destructive hover:text-destructive/70"
                    data-ocid={`so_entry.delete_button.${i + 1}`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLine}
            className="text-[11px] h-7"
            data-ocid="so_entry.secondary_button"
          >
            <Plus size={12} className="mr-1" /> Add Line
          </Button>
          <div className="text-[13px] font-bold text-teal font-mono">
            Total: ₹
            {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="mb-3">
          <Label className="text-[11px] text-muted-foreground">
            Narration / Remarks
          </Label>
          <Textarea
            className="text-[12px] min-h-[60px]"
            placeholder="Additional notes..."
            data-ocid="so_entry.textarea"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="bg-teal hover:bg-teal/90 text-primary-foreground text-[12px] h-8"
            data-ocid="so_entry.submit_button"
          >
            Alt+S: Save SO
          </Button>
          <Button
            variant="outline"
            className="text-[12px] h-8"
            onClick={() => {
              setCustomerName("");
              setLines([emptyLine()]);
            }}
            data-ocid="so_entry.cancel_button"
          >
            ESC: Cancel
          </Button>
        </div>

        <div className="mt-3 text-[10px] text-muted-foreground border-t border-border pt-2">
          Keyboard: <span className="tally-key-badge mx-1">Alt+S</span> Save
          &nbsp; <span className="tally-key-badge mx-1">ESC</span> Cancel
        </div>
      </div>
    </div>
  );
}
