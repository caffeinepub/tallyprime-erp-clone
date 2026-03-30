import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, FileText, Upload } from "lucide-react";
import { useState } from "react";

interface BankRow {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

const SAMPLE_ROWS: BankRow[] = [
  {
    id: "1",
    date: "2026-03-01",
    description: "NEFT/ICICI/001 - Ravi Traders",
    debit: 0,
    credit: 50000,
    balance: 150000,
  },
  {
    id: "2",
    date: "2026-03-03",
    description: "IMPS/UPI - Office Rent",
    debit: 25000,
    credit: 0,
    balance: 125000,
  },
  {
    id: "3",
    date: "2026-03-05",
    description: "NEFT/HDFC/102 - Kumar Suppliers",
    debit: 12500,
    credit: 0,
    balance: 112500,
  },
  {
    id: "4",
    date: "2026-03-07",
    description: "RTGS/SBI/205 - Client Payment",
    debit: 0,
    credit: 80000,
    balance: 192500,
  },
  {
    id: "5",
    date: "2026-03-10",
    description: "CHQ/003312 - Electricity Bill",
    debit: 4200,
    credit: 0,
    balance: 188300,
  },
  {
    id: "6",
    date: "2026-03-12",
    description: "UPI/9876543210 - Amit Kumar",
    debit: 0,
    credit: 15000,
    balance: 203300,
  },
];

export default function BankStatementImport() {
  const [rows, setRows] = useState<BankRow[]>([]);
  const [imported, setImported] = useState(false);
  const [colMap, setColMap] = useState({
    date: "A",
    description: "B",
    debit: "C",
    credit: "D",
    balance: "E",
  });
  const [dragging, setDragging] = useState(false);

  const handleFileLoad = () => {
    setRows(SAMPLE_ROWS);
  };

  const handleImport = () => {
    const existing = JSON.parse(
      localStorage.getItem("hk_bank_statements") || "[]",
    );
    const merged = [...existing, ...rows];
    localStorage.setItem("hk_bank_statements", JSON.stringify(merged));
    setImported(true);
  };

  const colOptions = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Bank Statement Import
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload CSV bank statement and map columns
          </p>
        </div>
        {imported && (
          <Badge className="bg-green-600 text-white gap-1">
            <CheckCircle className="w-3 h-3" /> Imported
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Rows</p>
            <p className="text-xl font-bold text-foreground">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Credits</p>
            <p className="text-xl font-bold text-green-600">
              ₹{rows.reduce((s, r) => s + r.credit, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Debits</p>
            <p className="text-xl font-bold text-red-500">
              ₹{rows.reduce((s, r) => s + r.debit, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-teal-500 bg-teal-50/10"
                : "border-border hover:border-teal-400"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFileLoad();
            }}
            onClick={handleFileLoad}
            onKeyDown={(e) => e.key === "Enter" && handleFileLoad()}
            data-ocid="bank_import.dropzone"
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Drag & drop CSV file here, or click to load sample data
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports .csv, .xlsx formats
            </p>
          </button>

          <div>
            <p className="text-xs font-medium text-foreground mb-2">
              Column Mapping
            </p>
            <div className="grid grid-cols-5 gap-2">
              {(
                ["date", "description", "debit", "credit", "balance"] as const
              ).map((field) => (
                <div key={field}>
                  <p className="text-xs text-muted-foreground capitalize">
                    {field}
                  </p>
                  <Select
                    value={colMap[field]}
                    onValueChange={(v) =>
                      setColMap((m) => ({ ...m, [field]: v }))
                    }
                  >
                    <SelectTrigger
                      className="h-7 text-xs mt-1"
                      data-ocid="bank_import.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          Col {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-500" /> Preview (
                {rows.length} rows)
              </CardTitle>
              <Button
                size="sm"
                className="h-7 text-xs bg-teal-600 hover:bg-teal-700"
                onClick={handleImport}
                data-ocid="bank_import.submit_button"
              >
                <Upload className="w-3 h-3 mr-1" /> Import to Ledger
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      Debit (₹)
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      Credit (₹)
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      Balance (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}
                      data-ocid={`bank_import.item.${i + 1}`}
                    >
                      <td className="px-3 py-1.5 text-foreground">
                        {row.date}
                      </td>
                      <td className="px-3 py-1.5 text-foreground max-w-xs truncate">
                        {row.description}
                      </td>
                      <td className="px-3 py-1.5 text-right text-red-500">
                        {row.debit > 0 ? row.debit.toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-1.5 text-right text-green-600">
                        {row.credit > 0 ? row.credit.toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-1.5 text-right text-foreground">
                        {row.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
