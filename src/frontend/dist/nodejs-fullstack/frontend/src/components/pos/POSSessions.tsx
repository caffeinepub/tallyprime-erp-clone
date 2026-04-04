import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "../../backend.d";

interface Props {
  company?: Company;
}

interface Session {
  id: string;
  openTime: string;
  closeTime?: string;
  openingBalance: number;
  closingBalance?: number;
  status: "Open" | "Closed";
}

function getCurrentSession(): Session | null {
  const s = localStorage.getItem("hk_pos_current_session");
  return s ? JSON.parse(s) : null;
}

function getSessionSummary(session: Session) {
  const sales = JSON.parse(localStorage.getItem("pos_sales") || "[]");
  const sessionSales = sales.filter(
    (s: { date: string }) => s.date >= session.openTime,
  );
  const totalSales = sessionSales.reduce(
    (sum: number, s: { total: number }) => sum + s.total,
    0,
  );
  const cashSales = sessionSales
    .filter((s: { payMode: string }) => s.payMode === "Cash")
    .reduce((sum: number, s: { total: number }) => sum + s.total, 0);
  const cardSales = sessionSales
    .filter((s: { payMode: string }) => s.payMode === "Card")
    .reduce((sum: number, s: { total: number }) => sum + s.total, 0);
  const upiSales = sessionSales
    .filter((s: { payMode: string }) => s.payMode === "UPI")
    .reduce((sum: number, s: { total: number }) => sum + s.total, 0);
  return {
    totalSales,
    transactions: sessionSales.length,
    cashSales,
    cardSales,
    upiSales,
  };
}

export default function POSSessions({ company }: Props) {
  const [session, setSession] = useState<Session | null>(getCurrentSession);
  const [openingBal, setOpeningBal] = useState("");
  const [closingBal, setClosingBal] = useState("");

  const openSession = () => {
    const s: Session = {
      id: Date.now().toString(),
      openTime: new Date().toISOString(),
      openingBalance: Number.parseFloat(openingBal) || 0,
      status: "Open",
    };
    localStorage.setItem("hk_pos_current_session", JSON.stringify(s));
    setSession(s);
    toast.success("POS Session opened");
  };

  const closeSession = () => {
    if (!session) return;
    const closed = {
      ...session,
      closeTime: new Date().toISOString(),
      closingBalance: Number.parseFloat(closingBal) || 0,
      status: "Closed" as const,
    };
    const allSessions = JSON.parse(
      localStorage.getItem("hk_pos_sessions") || "[]",
    );
    allSessions.unshift(closed);
    localStorage.setItem("hk_pos_sessions", JSON.stringify(allSessions));
    localStorage.removeItem("hk_pos_current_session");
    setSession(null);
    setOpeningBal("");
    setClosingBal("");
    toast.success("POS Session closed");
  };

  const summary = session ? getSessionSummary(session) : null;

  return (
    <div className="p-4 space-y-4 max-w-xl">
      <div>
        <h2 className="text-lg font-bold">POS Sessions</h2>
        <p className="text-xs text-muted-foreground">{company?.name || ""}</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            Session Status
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${session?.status === "Open" ? "bg-green-900 text-green-300" : "bg-secondary text-muted-foreground"}`}
            >
              {session?.status || "Closed"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {!session ? (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Opening Balance (₹)</Label>
                <Input
                  value={openingBal}
                  onChange={(e) => setOpeningBal(e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-xs"
                  type="number"
                  data-ocid="pos-session.input"
                />
              </div>
              <Button
                onClick={openSession}
                className="bg-teal hover:bg-teal/80 text-primary-foreground h-8 text-xs"
                data-ocid="pos-session.primary_button"
              >
                Open Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Opened At</p>
                  <p className="font-medium">
                    {new Date(session.openTime).toLocaleTimeString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Opening Balance</p>
                  <p className="font-medium">
                    ₹{session.openingBalance.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              {summary && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-secondary rounded p-2">
                    <p className="text-muted-foreground">Total Sales</p>
                    <p className="font-bold text-teal">
                      ₹{summary.totalSales.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-secondary rounded p-2">
                    <p className="text-muted-foreground">Transactions</p>
                    <p className="font-bold">{summary.transactions}</p>
                  </div>
                  <div className="bg-secondary rounded p-2">
                    <p className="text-muted-foreground">Cash</p>
                    <p className="font-bold">
                      ₹{summary.cashSales.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-secondary rounded p-2">
                    <p className="text-muted-foreground">Card + UPI</p>
                    <p className="font-bold">
                      ₹
                      {(summary.cardSales + summary.upiSales).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Closing Balance (₹)</Label>
                <Input
                  value={closingBal}
                  onChange={(e) => setClosingBal(e.target.value)}
                  placeholder="0.00"
                  className="h-8 text-xs"
                  type="number"
                />
              </div>
              <Button
                onClick={closeSession}
                variant="destructive"
                className="h-8 text-xs"
                data-ocid="pos-session.delete_button"
              >
                Close Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
