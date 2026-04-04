import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadEInvoices, saveEInvoices } from "./EInvoiceForm";
import type { EInvoiceEntry } from "./EInvoiceForm";

export default function EInvoiceList() {
  const [invoices, setInvoices] = useState<EInvoiceEntry[]>([]);

  useEffect(() => {
    setInvoices(loadEInvoices());
  }, []);

  const cancel = (irn: string) => {
    const updated = invoices.map((inv) =>
      inv.irn === irn ? { ...inv, status: "Cancelled" as const } : inv,
    );
    saveEInvoices(updated);
    setInvoices(updated);
    toast.success("E-Invoice cancelled");
  };

  const statusBadge = (s: string) => {
    if (s === "Generated")
      return (
        <Badge className="bg-green-500/20 text-green-500 border-green-500/40 text-[10px]">
          Generated
        </Badge>
      );
    return (
      <Badge className="bg-red-500/20 text-red-500 border-red-500/40 text-[10px]">
        Cancelled
      </Badge>
    );
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-4">
        <QrCode size={18} className="text-teal" />
        <h2 className="text-[15px] font-bold text-foreground">
          E-Invoice Register
        </h2>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {invoices.length} invoices
        </span>
      </div>

      {invoices.length === 0 ? (
        <div
          data-ocid="einvoice.list.empty_state"
          className="text-center py-12 text-muted-foreground text-[12px]"
        >
          No E-Invoices generated yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="einvoice.list.table">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">#</TableHead>
                <TableHead className="text-[11px]">IRN (truncated)</TableHead>
                <TableHead className="text-[11px]">Invoice No</TableHead>
                <TableHead className="text-[11px]">Date</TableHead>
                <TableHead className="text-[11px]">Buyer GSTIN</TableHead>
                <TableHead className="text-[11px]">Buyer</TableHead>
                <TableHead className="text-[11px]">Value</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
                <TableHead className="text-[11px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv, i) => (
                <TableRow
                  key={inv.irn}
                  data-ocid={`einvoice.list.item.${i + 1}`}
                >
                  <TableCell className="text-[11px] text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-teal max-w-[120px] truncate">
                    {inv.irn.slice(0, 16)}…
                  </TableCell>
                  <TableCell className="text-[11px]">{inv.invoiceNo}</TableCell>
                  <TableCell className="text-[11px]">
                    {inv.invoiceDate}
                  </TableCell>
                  <TableCell className="text-[11px] font-mono">
                    {inv.buyerGSTIN}
                  </TableCell>
                  <TableCell className="text-[11px]">{inv.buyerName}</TableCell>
                  <TableCell className="text-[11px]">
                    ₹{Number(inv.taxableValue).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>{statusBadge(inv.status)}</TableCell>
                  <TableCell>
                    {inv.status === "Generated" && (
                      <Button
                        data-ocid={`einvoice.cancel.button.${i + 1}`}
                        size="sm"
                        variant="destructive"
                        className="text-[10px] h-6 px-2"
                        onClick={() => cancel(inv.irn)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
