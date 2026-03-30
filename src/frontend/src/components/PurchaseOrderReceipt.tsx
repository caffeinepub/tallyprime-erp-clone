import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../backend.d";
import type { PurchaseOrder } from "./PurchaseOrderEntry";

const LS_KEY = "hk-purchase-orders";
const RECEIPT_KEY = "hk-po-receipts";

function loadPOs(): PurchaseOrder[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function savePOs(pos: PurchaseOrder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(pos));
}

interface ReceiptRecord {
  id: string;
  poId: string;
  poNumber: string;
  receiptDate: string;
  receivedQtys: Record<number, number>;
  companyName: string;
  createdAt: string;
}

export default function PurchaseOrderReceipt({
  company,
}: { company: Company }) {
  const today = new Date().toISOString().slice(0, 10);
  const approvedPOs = loadPOs().filter(
    (p) => p.companyName === company.name && p.status === "Approved",
  );
  const [selectedPOId, setSelectedPOId] = useState<string>("");
  const [receiptDate, setReceiptDate] = useState(today);
  const [receivedQtys, setReceivedQtys] = useState<Record<number, number>>({});

  const selectedPO = approvedPOs.find((p) => p.id === selectedPOId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedPOId(id);
    const po = approvedPOs.find((p) => p.id === id);
    if (po) {
      const defaults: Record<number, number> = {};
      po.lineItems.forEach((l, i) => {
        defaults[i] = l.qty;
      });
      setReceivedQtys(defaults);
    }
  };

  const handleSubmit = () => {
    if (!selectedPO) {
      toast.error("Select an approved PO first");
      return;
    }
    const record: ReceiptRecord = {
      id: Date.now().toString(),
      poId: selectedPO.id,
      poNumber: selectedPO.poNumber,
      receiptDate,
      receivedQtys,
      companyName: company.name,
      createdAt: new Date().toISOString(),
    };
    const receipts: ReceiptRecord[] = JSON.parse(
      localStorage.getItem(RECEIPT_KEY) ?? "[]",
    );
    localStorage.setItem(RECEIPT_KEY, JSON.stringify([...receipts, record]));
    const all = loadPOs();
    savePOs(
      all.map((p) =>
        p.id === selectedPO.id ? { ...p, status: "Received" } : p,
      ),
    );
    toast.success(`PO ${selectedPO.poNumber} marked as Received!`);
    setSelectedPOId("");
    setReceivedQtys({});
  };

  return (
    <div
      className="h-full overflow-y-auto p-4 bg-background"
      data-ocid="po_receipt.page"
    >
      <div className="max-w-3xl mx-auto">
        <div className="tally-section-header mb-4">
          PO Receipt — {company.name}
        </div>

        {approvedPOs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            data-ocid="po_receipt.empty_state"
          >
            <span className="text-4xl mb-3">📦</span>
            <div className="text-[13px]">No approved purchase orders</div>
            <div className="text-[11px] mt-1">
              Approve a PO in the PO List first
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <Label className="text-[11px] text-muted-foreground">
                  Select Approved PO
                </Label>
                <select
                  value={selectedPOId}
                  onChange={(e) => handleSelect(e.target.value)}
                  className="w-full h-8 text-[12px] border border-input bg-background px-2 text-foreground"
                  data-ocid="po_receipt.select"
                >
                  <option value="">-- Choose PO --</option>
                  {approvedPOs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.poNumber} — {p.vendorName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">
                  Receipt Date
                </Label>
                <Input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="h-8 text-[12px]"
                  data-ocid="po_receipt.input"
                />
              </div>
            </div>

            {selectedPO && (
              <div className="border border-border mb-4">
                <div className="bg-secondary/60 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase border-b border-border">
                  Line Items — Received Quantities
                </div>
                {selectedPO.lineItems.map((l, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: line items ordered by position
                    key={i}
                    className="grid grid-cols-4 border-b border-border/50 px-3 py-2 items-center"
                    data-ocid={`po_receipt.row.${i + 1}`}
                  >
                    <div className="col-span-2 text-[12px]">{l.itemName}</div>
                    <div className="text-[11px] text-muted-foreground text-right">
                      Ordered: {l.qty}
                    </div>
                    <div className="pl-2">
                      <Input
                        type="number"
                        value={receivedQtys[i] ?? l.qty}
                        onChange={(e) =>
                          setReceivedQtys((prev) => ({
                            ...prev,
                            [i]: Number(e.target.value),
                          }))
                        }
                        max={l.qty}
                        className="h-7 text-[11px] text-right"
                        data-ocid="po_receipt.input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="bg-teal hover:bg-teal/90 text-primary-foreground text-[12px] h-8"
                data-ocid="po_receipt.submit_button"
              >
                Mark as Received
              </Button>
              <Button
                variant="outline"
                className="text-[12px] h-8"
                onClick={() => setSelectedPOId("")}
                data-ocid="po_receipt.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
