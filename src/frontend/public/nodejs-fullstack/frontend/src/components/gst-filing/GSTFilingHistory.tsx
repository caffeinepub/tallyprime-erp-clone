import { Badge } from "@/components/ui/badge";
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

interface FilingRecord {
  key: string;
  period: string;
  returnType: string;
  filedDate: string;
  challanRef?: string;
}

function getHistory(): FilingRecord[] {
  const h: Record<
    string,
    {
      filedDate: string;
      returnType: string;
      period: string;
      challanRef?: string;
    }
  > = JSON.parse(localStorage.getItem("hk_gst_filings") || "{}");
  return Object.entries(h)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.filedDate.localeCompare(a.filedDate));
}

export default function GSTFilingHistory() {
  const records = getHistory();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">GST Filing History</h2>
          <p className="text-xs text-muted-foreground">
            All past GST return filings
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {records.length} records
        </Badge>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Filing Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground text-sm"
              data-ocid="gst-history.empty_state"
            >
              No filings recorded yet. File GSTR-1 or GSTR-3B to see history
              here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Period</TableHead>
                    <TableHead className="text-xs">Return Type</TableHead>
                    <TableHead className="text-xs">Filed Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, i) => (
                    <TableRow key={r.key} className="border-border text-xs">
                      <TableCell className="text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell>{r.period}</TableCell>
                      <TableCell className="font-medium">
                        {r.returnType}
                      </TableCell>
                      <TableCell>
                        {new Date(r.filedDate).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-900 text-green-300 text-xs">
                          Filed
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
