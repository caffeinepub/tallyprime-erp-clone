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
import { CheckCircle2, Download, History, XCircle } from "lucide-react";

const DEMO_HISTORY = [
  {
    id: 1,
    date: "31 Mar 2024",
    filename: "tally-fy2024-final.xml",
    records: 1247,
    imported: 1235,
    errors: 12,
    status: "success",
  },
  {
    id: 2,
    date: "28 Feb 2024",
    filename: "feb2024-vouchers.csv",
    records: 342,
    imported: 342,
    errors: 0,
    status: "success",
  },
  {
    id: 3,
    date: "15 Jan 2024",
    filename: "opening-balances-jan24.xml",
    records: 89,
    imported: 67,
    errors: 22,
    status: "partial",
  },
];

export default function MigrationHistory() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-6 w-6 text-teal-400" />
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Migration History
          </h1>
          <p className="text-sm text-muted-foreground">
            Past Tally import sessions and their results
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Import Sessions ({DEMO_HISTORY.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto" data-ocid="migrationhistory.table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead className="text-right">Total Records</TableHead>
                  <TableHead className="text-right">Imported</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_HISTORY.map((row, i) => (
                  <TableRow
                    key={row.id}
                    data-ocid={`migrationhistory.item.${i + 1}`}
                  >
                    <TableCell className="text-muted-foreground">
                      {row.date}
                    </TableCell>
                    <TableCell className="font-medium">
                      {row.filename}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.records.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-green-400">
                      {row.imported.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-400">
                      {row.errors}
                    </TableCell>
                    <TableCell>
                      {row.status === "success" ? (
                        <Badge className="bg-green-700 text-green-100 gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Success
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3 text-yellow-400" />{" "}
                          Partial
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        data-ocid={`migrationhistory.secondary_button.${i + 1}`}
                      >
                        <Download className="h-3 w-3" /> Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {DEMO_HISTORY.length === 0 && (
            <p
              className="text-center text-muted-foreground py-10"
              data-ocid="migrationhistory.empty_state"
            >
              No imports yet. Use Import Wizard to bring in Tally data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
