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
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadEWayBills, saveEWayBills } from "./EWayBillForm";
import type { EWayBillEntry } from "./EWayBillForm";

export default function EWayBillList() {
  const [bills, setBills] = useState<EWayBillEntry[]>([]);

  useEffect(() => {
    setBills(loadEWayBills());
  }, []);

  const cancel = (ewbNo: string) => {
    const updated = bills.map((b) =>
      b.ewbNo === ewbNo ? { ...b, status: "Cancelled" as const } : b,
    );
    saveEWayBills(updated);
    setBills(updated);
    toast.success(`e-Way Bill ${ewbNo} cancelled`);
  };

  const statusBadge = (s: string) => {
    if (s === "Active")
      return (
        <Badge className="bg-green-500/20 text-green-500 border-green-500/40 text-[10px]">
          Active
        </Badge>
      );
    if (s === "Cancelled")
      return (
        <Badge className="bg-red-500/20 text-red-500 border-red-500/40 text-[10px]">
          Cancelled
        </Badge>
      );
    return (
      <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/40 text-[10px]">
        Expired
      </Badge>
    );
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={18} className="text-teal" />
        <h2 className="text-[15px] font-bold text-foreground">
          e-Way Bill Register
        </h2>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {bills.length} bills
        </span>
      </div>

      {bills.length === 0 ? (
        <div
          data-ocid="eway.list.empty_state"
          className="text-center py-12 text-muted-foreground text-[12px]"
        >
          No e-Way Bills generated yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="eway.list.table">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">#</TableHead>
                <TableHead className="text-[11px]">EWB No</TableHead>
                <TableHead className="text-[11px]">Date</TableHead>
                <TableHead className="text-[11px]">From (GSTIN)</TableHead>
                <TableHead className="text-[11px]">To (GSTIN)</TableHead>
                <TableHead className="text-[11px]">Mode</TableHead>
                <TableHead className="text-[11px]">Value</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
                <TableHead className="text-[11px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((b, i) => (
                <TableRow key={b.ewbNo} data-ocid={`eway.list.item.${i + 1}`}>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="text-[11px] font-mono text-teal">
                    {b.ewbNo}
                  </TableCell>
                  <TableCell className="text-[11px]">{b.date}</TableCell>
                  <TableCell className="text-[11px] font-mono">
                    {b.supplierGSTIN}
                  </TableCell>
                  <TableCell className="text-[11px] font-mono">
                    {b.recipientGSTIN}
                  </TableCell>
                  <TableCell className="text-[11px]">
                    {b.transportMode}
                  </TableCell>
                  <TableCell className="text-[11px]">
                    ₹{Number(b.taxableValue).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>{statusBadge(b.status)}</TableCell>
                  <TableCell>
                    {b.status === "Active" && (
                      <Button
                        data-ocid={`eway.cancel.button.${i + 1}`}
                        size="sm"
                        variant="destructive"
                        className="text-[10px] h-6 px-2"
                        onClick={() => cancel(b.ewbNo)}
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
