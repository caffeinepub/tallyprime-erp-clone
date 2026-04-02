import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const CUSTOMERS = [
  { id: "C001", name: "Rahul Sharma", phone: "+91 98765 43210" },
  { id: "C002", name: "Meera Textiles", phone: "+91 87654 32109" },
  { id: "C003", name: "Star Electronics", phone: "+91 76543 21098" },
  { id: "C004", name: "Patel Stores", phone: "+91 65432 10987" },
  { id: "C005", name: "Om Traders", phone: "+91 54321 09876" },
];

const MSG_TEMPLATES: Record<string, string> = {
  Invoice:
    "Dear {name}, please find your invoice attached. Total: ₹{amount}. Thank you for your business.",
  Reminder:
    "Dear {name}, this is a reminder that your payment of ₹{amount} is due. Please settle at the earliest.",
  "Ledger Summary":
    "Dear {name}, your account summary: Opening ₹0, Transactions ₹{amount}, Closing ₹{amount}.",
  Custom: "",
};

export default function BulkSend() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msgType, setMsgType] = useState("Invoice");
  const [message, setMessage] = useState(MSG_TEMPLATES.Invoice);

  const toggle = (id: string) =>
    setSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((p) =>
      p.size === CUSTOMERS.length
        ? new Set()
        : new Set(CUSTOMERS.map((c) => c.id)),
    );

  const handleTypeChange = (val: string) => {
    setMsgType(val);
    setMessage(MSG_TEMPLATES[val] ?? "");
  };

  const sendMessages = () => {
    if (selected.size === 0) {
      toast.error("Select at least one customer");
      return;
    }
    const log = JSON.parse(localStorage.getItem("hk_wa_delivery_log") || "[]");
    [...selected].forEach((id, i) => {
      const customer = CUSTOMERS.find((c) => c.id === id);
      log.push({
        id: `MSG-${Date.now()}-${i}`,
        recipient: customer?.name,
        phone: customer?.phone,
        type: msgType,
        sentAt: new Date().toISOString(),
        status: "Sent",
      });
    });
    localStorage.setItem("hk_wa_delivery_log", JSON.stringify(log));
    toast.success(`Sent to ${selected.size} customer(s)`);
    setSelected(new Set());
  };

  return (
    <div className="p-4 space-y-4" data-ocid="whatsapp.bulk_send.section">
      <h2 className="text-sm font-bold text-foreground">Bulk WhatsApp Send</h2>

      <div className="space-y-1">
        <Label className="text-xs">Message Type</Label>
        <Select value={msgType} onValueChange={handleTypeChange}>
          <SelectTrigger
            className="h-7 text-xs w-48"
            data-ocid="whatsapp.message_type.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(MSG_TEMPLATES).map((t) => (
              <SelectItem key={t} value={t} className="text-xs">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Message Preview</Label>
        <Textarea
          className="text-xs min-h-[80px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          data-ocid="whatsapp.message_preview.textarea"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Select Customers</Label>
          <button
            type="button"
            className="text-xs text-teal underline"
            onClick={toggleAll}
          >
            Toggle All
          </button>
        </div>
        {CUSTOMERS.map((c, idx) => (
          <div
            key={c.id}
            className="flex items-center gap-2 py-1"
            data-ocid={`whatsapp.customer.item.${idx + 1}`}
          >
            <Checkbox
              checked={selected.has(c.id)}
              onCheckedChange={() => toggle(c.id)}
              data-ocid={`whatsapp.customer.checkbox.${idx + 1}`}
            />
            <span className="text-xs flex-1">{c.name}</span>
            <span className="text-[10px] text-muted-foreground">{c.phone}</span>
          </div>
        ))}
      </div>

      <Button
        size="sm"
        className="text-xs h-7"
        onClick={sendMessages}
        data-ocid="whatsapp.send_selected.button"
      >
        Send to Selected ({selected.size})
      </Button>
    </div>
  );
}
