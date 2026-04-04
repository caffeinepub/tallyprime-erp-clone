import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { Company } from "../../backend.d";

interface Props {
  company?: Company;
}

interface FilingEntry {
  period: string;
  returnType: string;
  dueDate: string;
  status: "Filed" | "Overdue" | "Due Soon" | "Upcoming";
  key: string;
}

function getFilings(): FilingEntry[] {
  const filingHistory: Record<string, { filedDate: string }> = JSON.parse(
    localStorage.getItem("hk_gst_filings") || "{}",
  );
  const now = new Date();
  const entries: FilingEntry[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = d.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const yr = d.getFullYear();
    const mo = d.getMonth() + 1;
    const gstr1Due = new Date(yr, mo, 11);
    const gstr3bDue = new Date(yr, mo, 20);
    const key1 = `GSTR-1-${yr}-${mo}`;
    const key3b = `GSTR-3B-${yr}-${mo}`;
    const getStatus = (due: Date, key: string): FilingEntry["status"] => {
      if (filingHistory[key]) return "Filed";
      if (due < now) return "Overdue";
      const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 7) return "Due Soon";
      return "Upcoming";
    };
    entries.push({
      period,
      returnType: "GSTR-1",
      dueDate: gstr1Due.toLocaleDateString("en-IN"),
      status: getStatus(gstr1Due, key1),
      key: key1,
    });
    entries.push({
      period,
      returnType: "GSTR-3B",
      dueDate: gstr3bDue.toLocaleDateString("en-IN"),
      status: getStatus(gstr3bDue, key3b),
      key: key3b,
    });
  }
  return entries;
}

const statusConfig: Record<string, { icon: React.ReactNode; badge: string }> = {
  Filed: {
    icon: <CheckCircle2 size={14} />,
    badge: "bg-green-900 text-green-300",
  },
  Overdue: {
    icon: <AlertCircle size={14} />,
    badge: "bg-red-900 text-red-300",
  },
  "Due Soon": {
    icon: <Clock size={14} />,
    badge: "bg-orange-900 text-orange-300",
  },
  Upcoming: {
    icon: <Clock size={14} />,
    badge: "bg-secondary text-muted-foreground",
  },
};

export default function GSTFilingDashboard({ company }: Props) {
  const filings = getFilings();
  const filed = filings.filter((f) => f.status === "Filed").length;
  const overdue = filings.filter((f) => f.status === "Overdue").length;
  const dueSoon = filings.filter((f) => f.status === "Due Soon").length;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            GST Filing Dashboard
          </h2>
          <p className="text-xs text-muted-foreground">
            {company?.name || "Select a company"} — Filing Calendar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card border-border">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs text-muted-foreground">
              Filed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold text-green-400">{filed}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold text-red-400">{overdue}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs text-muted-foreground">
              Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold text-orange-400">{dueSoon}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">
            Filing Calendar (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs">Period</TableHead>
                  <TableHead className="text-xs">Return Type</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filings.map((f) => {
                  const cfg = statusConfig[f.status];
                  return (
                    <TableRow key={f.key} className="border-border text-xs">
                      <TableCell>{f.period}</TableCell>
                      <TableCell className="font-medium">
                        {f.returnType}
                      </TableCell>
                      <TableCell>{f.dueDate}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.badge}`}
                        >
                          {cfg.icon} {f.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {f.status !== "Filed" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs px-2"
                          >
                            File Now
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
