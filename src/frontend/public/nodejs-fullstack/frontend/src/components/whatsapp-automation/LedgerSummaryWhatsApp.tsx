import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";

const CUSTOMERS = [
  { id: "C001", name: "Rahul Sharma", phone: "+91 98765 43210" },
  { id: "C002", name: "Meera Textiles", phone: "+91 87654 32109" },
  { id: "C003", name: "Star Electronics", phone: "+91 76543 21098" },
];

const LEDGER_DUMMY = [
  { date: "2026-03-01", narration: "Opening Balance", debit: 0, credit: 15000 },
  {
    date: "2026-03-10",
    narration: "Invoice #INV-2290",
    debit: 0,
    credit: 8500,
  },
  {
    date: "2026-03-15",
    narration: "Payment Received",
    debit: 10000,
    credit: 0,
  },
  {
    date: "2026-03-25",
    narration: "Invoice #INV-2305",
    debit: 0,
    credit: 12000,
  },
];

export default function LedgerSummaryWhatsApp() {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const customer = CUSTOMERS.find((c) => c.id === selectedCustomer);

  const handleSelect = (id: string) => {
    setSelectedCustomer(id);
    const c = CUSTOMERS.find((x) => x.id === id);
    setPhone(c?.phone ?? "");
  };

  const sendSummary = () => {
    const log = JSON.parse(localStorage.getItem("hk_wa_delivery_log") || "[]");
    log.push({
      id: `MSG-${Date.now()}`,
      recipient: customer?.name,
      phone,
      type: "Ledger Summary",
      sentAt: new Date().toISOString(),
      status: "Sent",
    });
    localStorage.setItem("hk_wa_delivery_log", JSON.stringify(log));
    toast.success(`Ledger summary sent to ${customer?.name}`);
    setConfirmOpen(false);
  };

  const closing = LEDGER_DUMMY.reduce((acc, r) => acc + r.credit - r.debit, 0);

  return (
    <div className="p-4 space-y-4" data-ocid="whatsapp.ledger_send.section">
      <h2 className="text-sm font-bold text-foreground">Ledger Summary Send</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Select Customer</Label>
          <Select value={selectedCustomer} onValueChange={handleSelect}>
            <SelectTrigger
              className="h-7 text-xs mt-1"
              data-ocid="whatsapp.ledger_customer.select"
            >
              <SelectValue placeholder="Select customer..." />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMERS.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Phone Number</Label>
          <Input
            className="h-7 text-xs mt-1"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 ..."
            data-ocid="whatsapp.phone.input"
          />
        </div>
      </div>

      {selectedCustomer && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold">
            Ledger Summary — {customer?.name}
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Narration</TableHead>
                <TableHead className="text-xs text-right">Debit</TableHead>
                <TableHead className="text-xs text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LEDGER_DUMMY.map((row) => (
                <TableRow key={`${row.date}-${row.narration}`}>
                  <TableCell className="text-xs">{row.date}</TableCell>
                  <TableCell className="text-xs">{row.narration}</TableCell>
                  <TableCell className="text-xs text-right">
                    {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/40 font-bold">
                <TableCell className="text-xs" colSpan={3}>
                  Closing Balance
                </TableCell>
                <TableCell className="text-xs text-right">
                  ₹{closing.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Button
            size="sm"
            className="text-xs h-7"
            onClick={() => setConfirmOpen(true)}
            data-ocid="whatsapp.send_ledger.button"
          >
            Send on WhatsApp
          </Button>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Confirm Send</DialogTitle>
          </DialogHeader>
          <p className="text-xs">
            Send ledger summary to {customer?.name} at {phone}?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setConfirmOpen(false)}
              data-ocid="whatsapp.ledger_cancel.button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={sendSummary}
              data-ocid="whatsapp.ledger_confirm.button"
            >
              Confirm Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
