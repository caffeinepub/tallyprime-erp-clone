import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, Settings, Shield, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PENDING_KEY = "hisabkitab_pending_approvals";
const MC_SETTINGS_KEY = "hisabkitab_mc_settings";

interface PendingVoucher {
  id: string;
  date: string;
  voucherNo: string;
  type: string;
  amount: number;
  createdBy: string;
  narration: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
}

interface MCSettings {
  accountantThreshold: number;
  requireApprovalForRoles: string[];
}

const SAMPLE_VOUCHERS: PendingVoucher[] = [
  {
    id: "pv1",
    date: "28 Mar 2026",
    voucherNo: "PAY-2026-0312",
    type: "Payment",
    amount: 125000,
    createdBy: "accountant1",
    narration:
      "Advance payment to M/s Global Supplies Ltd for raw material purchase",
    status: "pending",
  },
  {
    id: "pv2",
    date: "29 Mar 2026",
    voucherNo: "JNL-2026-0089",
    type: "Journal",
    amount: 75500,
    createdBy: "accounts_mgr",
    narration: "Provision for doubtful debts — Q4 FY2026",
    status: "pending",
  },
  {
    id: "pv3",
    date: "30 Mar 2026",
    voucherNo: "PUR-2026-0445",
    type: "Purchase",
    amount: 89250,
    createdBy: "accountant1",
    narration: "Purchase of office furniture — F-23 Interiors Pvt Ltd",
    status: "pending",
  },
];

function loadPending(): PendingVoucher[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (raw) return JSON.parse(raw) as PendingVoucher[];
  } catch {
    /* ignore */
  }
  return SAMPLE_VOUCHERS;
}

function loadSettings(): MCSettings {
  try {
    const raw = localStorage.getItem(MC_SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as MCSettings;
  } catch {
    /* ignore */
  }
  return {
    accountantThreshold: 50000,
    requireApprovalForRoles: ["Accountant"],
  };
}

function savePending(data: PendingVoucher[]) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(data));
}

export default function MakerChecker() {
  const [vouchers, setVouchers] = useState<PendingVoucher[]>(loadPending);
  const [settings, setSettings] = useState<MCSettings>(loadSettings);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = vouchers.filter((v) => v.status === "pending");
  const history = vouchers.filter((v) => v.status !== "pending");

  const handleApprove = (id: string) => {
    const updated = vouchers.map((v) =>
      v.id === id
        ? {
            ...v,
            status: "approved" as const,
            reviewedBy: "admin",
            reviewedAt: new Date().toISOString(),
          }
        : v,
    );
    setVouchers(updated);
    savePending(updated);
    toast.success("Voucher approved and posted!");
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    const updated = vouchers.map((v) =>
      v.id === id
        ? {
            ...v,
            status: "rejected" as const,
            reviewedBy: "admin",
            reviewedAt: new Date().toISOString(),
            rejectReason,
          }
        : v,
    );
    setVouchers(updated);
    savePending(updated);
    setRejectId(null);
    setRejectReason("");
    toast.success("Voucher rejected.");
  };

  const handleSaveSettings = () => {
    localStorage.setItem(MC_SETTINGS_KEY, JSON.stringify(settings));
    toast.success("Maker-Checker settings saved!");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Shield size={16} className="text-teal" />
            Maker-Checker Approvals
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review and approve/reject vouchers pending authorization
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <Badge
              className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 text-xs"
              data-ocid="maker_checker.loading_state"
            >
              {pending.length} Pending
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger
            value="pending"
            className="text-xs"
            data-ocid="maker_checker.pending.tab"
          >
            <Clock size={11} className="mr-1" />
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-xs"
            data-ocid="maker_checker.history.tab"
          >
            History ({history.length})
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-xs"
            data-ocid="maker_checker.settings.tab"
          >
            <Settings size={11} className="mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-3">
          {pending.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground text-sm"
              data-ocid="maker_checker.empty_state"
            >
              <CheckCircle size={36} className="mx-auto mb-2 text-green-400" />
              No vouchers pending approval.
            </div>
          ) : (
            <div className="space-y-3" data-ocid="maker_checker.table">
              {pending.map((v, i) => (
                <div
                  key={v.id}
                  className="border border-border rounded p-4 space-y-3"
                  data-ocid={`maker_checker.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {v.voucherNo}
                        </span>
                        <Badge className="text-[9px] px-1.5 py-0 bg-teal/20 text-teal border-teal/40">
                          {v.type}
                        </Badge>
                        <Badge className="text-[9px] px-1.5 py-0 bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
                          Pending
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {v.date} &bull; Created by:{" "}
                        <span className="text-foreground">{v.createdBy}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {v.narration}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-bold text-foreground">
                        ₹{v.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Requires approval
                      </div>
                    </div>
                  </div>

                  {rejectId === v.id ? (
                    <div className="flex gap-2 items-end border-t border-border/50 pt-3">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Rejection Reason *</Label>
                        <Input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          className="h-7 text-xs"
                          data-ocid={`maker_checker.reject_reason.${i + 1}`}
                          autoFocus
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs h-7"
                        onClick={() => handleReject(v.id)}
                        data-ocid={`maker_checker.confirm_button.${i + 1}`}
                      >
                        Confirm Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => {
                          setRejectId(null);
                          setRejectReason("");
                        }}
                        data-ocid={`maker_checker.cancel_button.${i + 1}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 border-t border-border/50 pt-3">
                      <Button
                        size="sm"
                        className="text-xs h-7 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(v.id)}
                        data-ocid={`maker_checker.approve.${i + 1}.primary_button`}
                      >
                        <CheckCircle size={11} className="mr-1" />
                        Approve & Post
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => setRejectId(v.id)}
                        data-ocid={`maker_checker.reject.${i + 1}.delete_button`}
                      >
                        <XCircle size={11} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-3">
          {history.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground text-sm"
              data-ocid="maker_checker.history.empty_state"
            >
              No approval history yet.
            </div>
          ) : (
            <div className="border border-border rounded overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="text-xs">Voucher No</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Created By</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Reviewed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((v, i) => (
                    <TableRow
                      key={v.id}
                      className="h-8"
                      data-ocid={`maker_checker.history.item.${i + 1}`}
                    >
                      <TableCell className="text-xs font-mono">
                        {v.voucherNo}
                      </TableCell>
                      <TableCell className="text-xs">{v.type}</TableCell>
                      <TableCell className="text-xs font-medium">
                        ₹{v.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs">{v.createdBy}</TableCell>
                      <TableCell>
                        {v.status === "approved" ? (
                          <Badge className="text-[9px] px-1.5 py-0 bg-green-500/20 text-green-400 border-green-500/40">
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="text-[9px] px-1.5 py-0 bg-red-500/20 text-red-400 border-red-500/40">
                            Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {v.reviewedAt
                          ? new Date(v.reviewedAt).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-3">
          <div
            className="border border-border rounded p-4 space-y-4 max-w-md"
            data-ocid="maker_checker.settings.panel"
          >
            <h3 className="text-sm font-semibold text-foreground">
              Approval Configuration
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">
                  Approval Threshold for Accountant Role (₹)
                </Label>
                <Input
                  type="number"
                  value={settings.accountantThreshold}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      accountantThreshold: Number(e.target.value),
                    }))
                  }
                  className="h-8 text-xs w-40"
                  data-ocid="maker_checker.settings.input"
                />
                <p className="text-[10px] text-muted-foreground">
                  Vouchers above this amount created by Accountant role need
                  Admin approval
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Require Approval For</Label>
                <Select
                  value={settings.requireApprovalForRoles[0] ?? "Accountant"}
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, requireApprovalForRoles: [v] }))
                  }
                >
                  <SelectTrigger
                    className="h-8 text-xs w-48"
                    data-ocid="maker_checker.settings.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                    <SelectItem value="Auditor">Auditor</SelectItem>
                    <SelectItem value="All">All Roles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                onClick={handleSaveSettings}
                className="text-xs"
                data-ocid="maker_checker.settings.save_button"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
