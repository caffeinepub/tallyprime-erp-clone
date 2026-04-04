import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Voucher = {
  id: string;
  type: string;
  amount: number;
  createdBy: string;
  date: string;
  status: string;
};

const SEED: Voucher[] = [
  {
    id: "VCH-1201",
    type: "Purchase",
    amount: 45000,
    createdBy: "accountant1",
    date: "2026-03-30",
    status: "Pending",
  },
  {
    id: "VCH-1202",
    type: "Payment",
    amount: 18500,
    createdBy: "accountant2",
    date: "2026-03-30",
    status: "Pending",
  },
  {
    id: "VCH-1203",
    type: "Journal",
    amount: 7200,
    createdBy: "accountant1",
    date: "2026-03-29",
    status: "Pending",
  },
  {
    id: "VCH-1204",
    type: "Sales",
    amount: 92000,
    createdBy: "accountant2",
    date: "2026-03-29",
    status: "Approved",
  },
];

export default function MobileApprovals() {
  const [vouchers, setVouchers] = useState<Voucher[]>(SEED);
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    action: "approve" | "reject";
  } | null>(null);

  const confirm = () => {
    if (!confirmModal) return;
    setVouchers((p) =>
      p.map((v) =>
        v.id === confirmModal.id
          ? {
              ...v,
              status:
                confirmModal.action === "approve" ? "Approved" : "Rejected",
            }
          : v,
      ),
    );
    toast.success(
      `Voucher ${confirmModal.action === "approve" ? "approved" : "rejected"}`,
    );
    setConfirmModal(null);
  };

  const pending = vouchers.filter((v) => v.status === "Pending");
  const done = vouchers.filter((v) => v.status !== "Pending");

  return (
    <div className="p-4 space-y-4" data-ocid="mobile.approvals.section">
      <h2 className="text-sm font-bold text-foreground">Mobile Approvals</h2>
      <div className="text-xs text-muted-foreground">
        {pending.length} pending approval(s)
      </div>

      <div className="space-y-2">
        {pending.map((v, idx) => (
          <Card key={v.id} data-ocid={`mobile.approval.item.${idx + 1}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold">
                    {v.type} Voucher — {v.id}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    By {v.createdBy} on {v.date}
                  </div>
                  <div className="text-sm font-bold text-foreground mt-1">
                    ₹{v.amount.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-900/60"
                    onClick={() =>
                      setConfirmModal({ id: v.id, action: "approve" })
                    }
                    data-ocid={`mobile.approve.button.${idx + 1}`}
                  >
                    <CheckCircle size={14} className="text-green-600" />
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/60"
                    onClick={() =>
                      setConfirmModal({ id: v.id, action: "reject" })
                    }
                    data-ocid={`mobile.reject.button.${idx + 1}`}
                  >
                    <XCircle size={14} className="text-red-600" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {pending.length === 0 && (
          <div
            className="text-xs text-muted-foreground text-center py-8"
            data-ocid="mobile.approvals.empty_state"
          >
            No pending approvals
          </div>
        )}
      </div>

      {done.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground">
            Processed
          </div>
          {done.map((v, idx) => (
            <div
              key={v.id}
              className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-xs"
              data-ocid={`mobile.processed.item.${idx + 1}`}
            >
              <span>
                {v.id} — {v.type}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${v.status === "Approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
              >
                {v.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!confirmModal} onOpenChange={() => setConfirmModal(null)}>
        <DialogContent data-ocid="mobile.approval.dialog">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {confirmModal?.action === "approve" ? "Approve" : "Reject"}{" "}
              Voucher
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs">
            Are you sure you want to {confirmModal?.action} this voucher?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setConfirmModal(null)}
              data-ocid="mobile.approval.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={confirm}
              data-ocid="mobile.approval.confirm_button"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
