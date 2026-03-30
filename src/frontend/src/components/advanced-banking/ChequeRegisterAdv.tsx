import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Plus } from "lucide-react";
import { useState } from "react";

type ChequeStatus = "Issued" | "Cleared" | "Bounced";

interface Cheque {
  id: string;
  chequeNo: string;
  date: string;
  payee: string;
  amount: number;
  bank: string;
  status: ChequeStatus;
}

const DEMO_CHEQUES: Cheque[] = [
  {
    id: "1",
    chequeNo: "003311",
    date: "2026-03-01",
    payee: "Kumar Suppliers",
    amount: 45000,
    bank: "SBI",
    status: "Cleared",
  },
  {
    id: "2",
    chequeNo: "003312",
    date: "2026-03-03",
    payee: "Electricity Board",
    amount: 4200,
    bank: "HDFC",
    status: "Cleared",
  },
  {
    id: "3",
    chequeNo: "003313",
    date: "2026-03-07",
    payee: "Office Supplies Co",
    amount: 12000,
    bank: "ICICI",
    status: "Issued",
  },
  {
    id: "4",
    chequeNo: "003314",
    date: "2026-03-10",
    payee: "Ravi Enterprises",
    amount: 28000,
    bank: "SBI",
    status: "Bounced",
  },
  {
    id: "5",
    chequeNo: "003315",
    date: "2026-03-14",
    payee: "Transport Co",
    amount: 9500,
    bank: "HDFC",
    status: "Issued",
  },
];

const statusColors: Record<ChequeStatus, string> = {
  Issued: "bg-blue-500",
  Cleared: "bg-green-600",
  Bounced: "bg-red-500",
};

export default function ChequeRegisterAdv() {
  const [cheques, setCheques] = useState<Cheque[]>(() => {
    const saved = localStorage.getItem("hk_cheques_adv");
    return saved ? JSON.parse(saved) : DEMO_CHEQUES;
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    chequeNo: "",
    date: "",
    payee: "",
    amount: "",
    bank: "",
    status: "Issued" as ChequeStatus,
  });

  const saveCheques = (list: Cheque[]) => {
    setCheques(list);
    localStorage.setItem("hk_cheques_adv", JSON.stringify(list));
  };

  const openAdd = () => {
    setEditId(null);
    setForm({
      chequeNo: "",
      date: "",
      payee: "",
      amount: "",
      bank: "",
      status: "Issued",
    });
    setOpen(true);
  };

  const openEdit = (c: Cheque) => {
    setEditId(c.id);
    setForm({
      chequeNo: c.chequeNo,
      date: c.date,
      payee: c.payee,
      amount: String(c.amount),
      bank: c.bank,
      status: c.status,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.chequeNo || !form.payee || !form.amount) return;
    if (editId) {
      saveCheques(
        cheques.map((c) =>
          c.id === editId
            ? { ...c, ...form, amount: Number.parseFloat(form.amount) }
            : c,
        ),
      );
    } else {
      saveCheques([
        ...cheques,
        {
          id: Date.now().toString(),
          ...form,
          amount: Number.parseFloat(form.amount),
        },
      ]);
    }
    setOpen(false);
  };

  const issued = cheques.filter((c) => c.status === "Issued").length;
  const bounced = cheques.filter((c) => c.status === "Bounced").length;
  const outstanding = cheques
    .filter((c) => c.status === "Issued")
    .reduce((s, c) => s + c.amount, 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Cheque Register
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track issued, cleared and bounced cheques
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 text-xs bg-teal-600 hover:bg-teal-700"
          onClick={openAdd}
          data-ocid="cheque.open_modal_button"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Cheque
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-xl font-bold text-blue-500">{issued}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Bounced</p>
            <p className="text-xl font-bold text-red-500">{bounced}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Outstanding Amt</p>
            <p className="text-xl font-bold text-blue-500">
              ₹{outstanding.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Cheque No
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Payee
              </th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                Amount (₹)
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Bank
              </th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                Edit
              </th>
            </tr>
          </thead>
          <tbody>
            {cheques.map((c, i) => (
              <tr
                key={c.id}
                className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}
                data-ocid={`cheque.item.${i + 1}`}
              >
                <td className="px-3 py-1.5 font-mono text-teal-500">
                  {c.chequeNo}
                </td>
                <td className="px-3 py-1.5">{c.date}</td>
                <td className="px-3 py-1.5 text-foreground">{c.payee}</td>
                <td className="px-3 py-1.5 text-right font-medium">
                  {c.amount.toLocaleString()}
                </td>
                <td className="px-3 py-1.5">{c.bank}</td>
                <td className="px-3 py-1.5 text-center">
                  <Badge
                    className={`${statusColors[c.status]} text-white text-xs`}
                  >
                    {c.status}
                  </Badge>
                </td>
                <td className="px-3 py-1.5 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => openEdit(c)}
                    data-ocid={`cheque.edit_button.${i + 1}`}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="cheque.dialog">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editId ? "Edit Cheque" : "Add Cheque"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Cheque No</p>
                <Input
                  className="h-7 text-xs mt-1"
                  value={form.chequeNo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, chequeNo: e.target.value }))
                  }
                  data-ocid="cheque.input"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <Input
                  type="date"
                  className="h-7 text-xs mt-1"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  data-ocid="cheque.input"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payee</p>
              <Input
                className="h-7 text-xs mt-1"
                value={form.payee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, payee: e.target.value }))
                }
                data-ocid="cheque.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <Input
                  type="number"
                  className="h-7 text-xs mt-1"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  data-ocid="cheque.input"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bank</p>
                <Input
                  className="h-7 text-xs mt-1"
                  value={form.bank}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bank: e.target.value }))
                  }
                  data-ocid="cheque.input"
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as ChequeStatus }))
                }
              >
                <SelectTrigger
                  className="h-7 text-xs mt-1"
                  data-ocid="cheque.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Issued">Issued</SelectItem>
                  <SelectItem value="Cleared">Cleared</SelectItem>
                  <SelectItem value="Bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setOpen(false)}
                data-ocid="cheque.cancel_button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-teal-600 hover:bg-teal-700"
                onClick={submit}
                data-ocid="cheque.submit_button"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
