import {
  CheckCircle,
  Clock,
  Download,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { type ReactElement, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const STATUSES = [
  "All",
  "Issued",
  "Cleared",
  "Bounced",
  "Cancelled",
  "Pending",
];

const STATUS_COLORS: Record<string, string> = {
  Issued: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Cleared: "bg-green-500/20 text-green-300 border-green-500/30",
  Bounced: "bg-red-500/20 text-red-300 border-red-500/30",
  Cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

const SAMPLE_CHEQUES = [
  {
    id: 1,
    chequeNo: "001234",
    date: "2025-04-01",
    payee: "ABC Suppliers",
    bank: "HDFC Bank",
    amount: 50000,
    status: "Cleared",
    clearDate: "2025-04-03",
    remarks: "Supplier payment",
  },
  {
    id: 2,
    chequeNo: "001235",
    date: "2025-04-02",
    payee: "XYZ Services",
    bank: "SBI",
    amount: 25000,
    status: "Issued",
    clearDate: "",
    remarks: "Service charges",
  },
  {
    id: 3,
    chequeNo: "001236",
    date: "2025-04-03",
    payee: "Raj Traders",
    bank: "ICICI Bank",
    amount: 75000,
    status: "Bounced",
    clearDate: "2025-04-05",
    remarks: "Insufficient funds",
  },
  {
    id: 4,
    chequeNo: "001237",
    date: "2025-04-04",
    payee: "Kumar & Co",
    bank: "HDFC Bank",
    amount: 12000,
    status: "Pending",
    clearDate: "",
    remarks: "Advance payment",
  },
  {
    id: 5,
    chequeNo: "001238",
    date: "2025-04-05",
    payee: "National Logistics",
    bank: "Axis Bank",
    amount: 38000,
    status: "Cleared",
    clearDate: "2025-04-07",
    remarks: "Transport payment",
  },
];

const STATUS_ICONS: Record<string, ReactElement> = {
  Cleared: <CheckCircle className="w-3 h-3" />,
  Issued: <Clock className="w-3 h-3" />,
  Bounced: <XCircle className="w-3 h-3" />,
  Cancelled: <XCircle className="w-3 h-3" />,
  Pending: <Clock className="w-3 h-3" />,
};

export default function ChequeRegisterAdv() {
  const [cheques, setCheques] = useState(SAMPLE_CHEQUES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    chequeNo: "",
    date: "",
    payee: "",
    bank: "",
    amount: "",
    status: "Issued",
    clearDate: "",
    remarks: "",
  });

  const filtered = cheques.filter((c) => {
    const matchSearch =
      c.chequeNo.includes(search) ||
      c.payee.toLowerCase().includes(search.toLowerCase()) ||
      c.bank.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((s, c) => s + c.amount, 0);
  const clearedCount = filtered.filter((c) => c.status === "Cleared").length;
  const pendingCount = filtered.filter(
    (c) => c.status === "Issued" || c.status === "Pending",
  ).length;
  const bouncedCount = filtered.filter((c) => c.status === "Bounced").length;

  const handleAdd = () => {
    if (!form.chequeNo || !form.payee || !form.amount) return;
    setCheques((prev) => [
      ...prev,
      { ...form, id: Date.now(), amount: Number(form.amount) },
    ]);
    setForm({
      chequeNo: "",
      date: "",
      payee: "",
      bank: "",
      amount: "",
      status: "Issued",
      clearDate: "",
      remarks: "",
    });
    setShowAdd(false);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setCheques((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              clearDate:
                newStatus === "Cleared"
                  ? new Date().toISOString().split("T")[0]
                  : c.clearDate,
            }
          : c,
      ),
    );
  };

  const exportCSV = () => {
    const rows = ["Cheque No,Date,Payee,Bank,Amount,Status,Clear Date,Remarks"];
    for (const c of filtered) {
      rows.push(
        `${c.chequeNo},${c.date},${c.payee},${c.bank},${c.amount},${c.status},${c.clearDate},${c.remarks}`,
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cheque-register.csv";
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Advanced Cheque Register
          </h2>
          <p className="text-sm text-muted-foreground">
            Track all issued, cleared, bounced and pending cheques
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Cheque
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Amount",
            value: `₹${totalAmount.toLocaleString("en-IN")}`,
            color: "text-blue-400",
          },
          { label: "Cleared", value: clearedCount, color: "text-green-400" },
          {
            label: "Pending/Issued",
            value: pendingCount,
            color: "text-yellow-400",
          },
          { label: "Bounced", value: bouncedCount, color: "text-red-400" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-card border border-border rounded-lg p-4"
          >
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cheque no, payee, bank..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearch("");
            setFilterStatus("All");
          }}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm">Add New Cheque</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              placeholder="Cheque No"
              value={form.chequeNo}
              onChange={(e) =>
                setForm((f) => ({ ...f, chequeNo: e.target.value }))
              }
            />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            <Input
              placeholder="Payee Name"
              value={form.payee}
              onChange={(e) =>
                setForm((f) => ({ ...f, payee: e.target.value }))
              }
            />
            <Input
              placeholder="Bank Name"
              value={form.bank}
              onChange={(e) => setForm((f) => ({ ...f, bank: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
            />
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.filter((s) => s !== "All").map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Remarks"
              value={form.remarks}
              onChange={(e) =>
                setForm((f) => ({ ...f, remarks: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd}>
              Save Cheque
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Cheque No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payee</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Clear Date</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-8"
                >
                  No cheques found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="border-border hover:bg-muted/30"
                >
                  <TableCell className="font-mono font-semibold">
                    {c.chequeNo}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.date}
                  </TableCell>
                  <TableCell>{c.payee}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.bank}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{c.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`flex items-center gap-1 w-fit text-xs ${STATUS_COLORS[c.status] || ""}`}
                    >
                      {STATUS_ICONS[c.status]} {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.clearDate || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {c.remarks}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={c.status}
                      onValueChange={(v) => handleStatusChange(c.id, v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.filter((s) => s !== "All").map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {filtered.length} cheque(s) | Total: ₹
        {totalAmount.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
