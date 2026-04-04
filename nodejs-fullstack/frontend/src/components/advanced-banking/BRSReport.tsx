import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Printer } from "lucide-react";
import { useState } from "react";

interface BRSItem {
  label: string;
  amount: number;
  type: "add" | "less";
}

export default function BRSReport() {
  const [bankBalance, setBankBalance] = useState(203300);
  const [bookBalance, setBookBalance] = useState(195800);
  const [deposits] = useState<BRSItem[]>([
    {
      label: "NEFT deposit in transit - Ravi Traders",
      amount: 50000,
      type: "add",
    },
    {
      label: "UPI collection pending - Priya Stores",
      amount: 8500,
      type: "add",
    },
  ]);
  const [outstanding] = useState<BRSItem[]>([
    { label: "CHQ/003313 - Office Supplies Co", amount: 12000, type: "less" },
    { label: "CHQ/003315 - Transport Co", amount: 9500, type: "less" },
  ]);

  const totalDeposits = deposits.reduce((s, d) => s + d.amount, 0);
  const totalOutstanding = outstanding.reduce((s, o) => s + o.amount, 0);
  const adjustedBankBalance = bankBalance + totalDeposits - totalOutstanding;
  const difference = adjustedBankBalance - bookBalance;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Bank Reconciliation Statement
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare bank balance with book balance
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => window.print()}
          data-ocid="brs.button"
        >
          <Printer className="w-3 h-3 mr-1" /> Print BRS
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">
              Bank Statement Balance
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">₹</span>
              <Input
                type="number"
                className="h-7 text-sm font-bold w-full"
                value={bankBalance}
                onChange={(e) =>
                  setBankBalance(Number.parseFloat(e.target.value) || 0)
                }
                data-ocid="brs.input"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">
              Book (Ledger) Balance
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">₹</span>
              <Input
                type="number"
                className="h-7 text-sm font-bold w-full"
                value={bookBalance}
                onChange={(e) =>
                  setBookBalance(Number.parseFloat(e.target.value) || 0)
                }
                data-ocid="brs.input"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Reconciliation Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 font-semibold text-foreground">
                  Balance as per Bank Statement
                </td>
                <td className="py-2 text-right font-bold text-foreground">
                  ₹{bankBalance.toLocaleString()}
                </td>
              </tr>

              <tr>
                <td
                  className="pt-3 pb-1 text-muted-foreground font-medium"
                  colSpan={2}
                >
                  Add: Deposits in Transit
                </td>
              </tr>
              {deposits.map((d) => (
                <tr key={d.label}>
                  <td className="py-1 pl-4 text-foreground">{d.label}</td>
                  <td className="py-1 text-right text-green-600">
                    +₹{d.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-border">
                <td className="py-1 pl-4 font-medium text-muted-foreground">
                  Total Deposits in Transit
                </td>
                <td className="py-1 text-right font-medium text-green-600">
                  +₹{totalDeposits.toLocaleString()}
                </td>
              </tr>

              <tr>
                <td
                  className="pt-3 pb-1 text-muted-foreground font-medium"
                  colSpan={2}
                >
                  Less: Outstanding Cheques
                </td>
              </tr>
              {outstanding.map((o) => (
                <tr key={o.label}>
                  <td className="py-1 pl-4 text-foreground">{o.label}</td>
                  <td className="py-1 text-right text-red-500">
                    -₹{o.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-border">
                <td className="py-1 pl-4 font-medium text-muted-foreground">
                  Total Outstanding Cheques
                </td>
                <td className="py-1 text-right font-medium text-red-500">
                  -₹{totalOutstanding.toLocaleString()}
                </td>
              </tr>

              <tr className="border-t-2 border-border bg-muted/20">
                <td className="py-2 font-bold text-foreground">
                  Adjusted Bank Balance
                </td>
                <td className="py-2 text-right font-bold text-foreground">
                  ₹{adjustedBankBalance.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-2 font-semibold text-foreground">
                  Balance as per Books
                </td>
                <td className="py-2 text-right font-bold text-foreground">
                  ₹{bookBalance.toLocaleString()}
                </td>
              </tr>
              <tr
                className={`border-t-2 border-border ${difference === 0 ? "bg-green-50/20" : "bg-red-50/20"}`}
              >
                <td className="py-2 font-bold text-foreground">Difference</td>
                <td
                  className={`py-2 text-right font-bold text-lg ${difference === 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {difference === 0
                    ? "✓ Reconciled"
                    : `₹${Math.abs(difference).toLocaleString()} ${difference > 0 ? "(Excess)" : "(Short)"}`}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
