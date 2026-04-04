import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, RefreshCw } from "lucide-react";
import { useState } from "react";

type ReportRow = { label: string; amount: number; sub?: boolean };

const REPORT_TYPES = [
  "P&L Summary",
  "Trial Balance",
  "GST Summary",
  "Payroll Summary",
  "Stock Summary",
];

const MOCK_DATA: Record<string, ReportRow[]> = {
  "P&L Summary": [
    { label: "Sales Revenue", amount: 1850000 },
    { label: "Service Income", amount: 420000 },
    { label: "Total Income", amount: 2270000 },
    { label: "Purchase / COGS", amount: 980000, sub: true },
    { label: "Salaries & Wages", amount: 340000, sub: true },
    { label: "Rent & Utilities", amount: 85000, sub: true },
    { label: "Depreciation", amount: 42000, sub: true },
    { label: "Total Expenses", amount: 1447000 },
    { label: "Net Profit", amount: 823000 },
  ],
  "Trial Balance": [
    { label: "Cash in Hand", amount: 125000 },
    { label: "Bank — HDFC Current", amount: 680000 },
    { label: "Debtors Control", amount: 342000 },
    { label: "Stock in Trade", amount: 510000 },
    { label: "Fixed Assets", amount: 1200000 },
    { label: "Creditors Control", amount: -280000, sub: true },
    { label: "Loans (Liability)", amount: -500000, sub: true },
    { label: "Capital Account", amount: -1500000, sub: true },
    { label: "Sales Ledger", amount: -1850000, sub: true },
    { label: "Purchase Ledger", amount: 980000 },
    { label: "Difference", amount: -707000 },
  ],
  "GST Summary": [
    { label: "CGST Collected", amount: 92500 },
    { label: "SGST Collected", amount: 92500 },
    { label: "IGST Collected", amount: 37800 },
    { label: "Total Output Tax", amount: 222800 },
    { label: "CGST Paid (Input)", amount: 49000, sub: true },
    { label: "SGST Paid (Input)", amount: 49000, sub: true },
    { label: "IGST Paid (Input)", amount: 18200, sub: true },
    { label: "Total Input Credit", amount: 116200 },
    { label: "Net GST Payable", amount: 106600 },
  ],
  "Payroll Summary": [
    { label: "Basic Salary", amount: 640000 },
    { label: "HRA", amount: 128000 },
    { label: "Special Allowance", amount: 96000 },
    { label: "Gross Salary", amount: 864000 },
    { label: "PF Deduction", amount: -76800, sub: true },
    { label: "TDS Deduction", amount: -42000, sub: true },
    { label: "ESI Deduction", amount: -19200, sub: true },
    { label: "Net Salary Paid", amount: 726000 },
  ],
  "Stock Summary": [
    { label: "Opening Stock", amount: 380000 },
    { label: "Purchases (Inward)", amount: 620000 },
    { label: "Total Available", amount: 1000000 },
    { label: "Issues (Outward)", amount: -490000, sub: true },
    { label: "Closing Stock", amount: 510000 },
    { label: "Stock Value Gain", amount: 18500 },
  ],
};

function formatINR(n: number) {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-IN");
  return n < 0 ? `(${formatted})` : formatted;
}

export default function ReportBuilder() {
  const today = new Date();
  const firstOfYear = `${today.getFullYear()}-04-01`;
  const todayStr = today.toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(firstOfYear);
  const [toDate, setToDate] = useState(todayStr);
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setRows(MOCK_DATA[reportType] ?? []);
    setGenerated(true);
  };

  const handleExportCSV = () => {
    if (!rows) return;
    const header = "Description,Amount (₹)\n";
    const body = rows
      .map((r) => `"${r.label}",${Math.abs(r.amount)}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType.replace(/\s+/g, "_")}_${fromDate}_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = rows ? (rows[rows.length - 1]?.amount ?? 0) : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <BarChart3 size={16} className="text-teal" />
        <h2 className="text-[13px] font-bold text-foreground tracking-tight">
          Custom Report Builder
        </h2>
        <Badge
          variant="outline"
          className="text-[10px] border-teal/40 text-teal"
        >
          Phase 11
        </Badge>
      </div>

      {/* Controls */}
      <div className="flex items-end gap-4 px-4 py-3 border-b border-border bg-secondary/20 flex-shrink-0">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="rb-from"
            className="text-[10px] text-muted-foreground uppercase tracking-wide"
          >
            From Date
          </label>
          <input
            id="rb-from"
            type="date"
            data-ocid="report_builder.from.input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="tally-input text-[12px] px-2 py-1 w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="rb-to"
            className="text-[10px] text-muted-foreground uppercase tracking-wide"
          >
            To Date
          </label>
          <input
            id="rb-to"
            type="date"
            data-ocid="report_builder.to.input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="tally-input text-[12px] px-2 py-1 w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="rb-type"
            className="text-[10px] text-muted-foreground uppercase tracking-wide"
          >
            Report Type
          </label>
          <select
            id="rb-type"
            data-ocid="report_builder.type.select"
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setGenerated(false);
              setRows(null);
            }}
            className="tally-input text-[12px] px-2 py-1 w-44"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <Button
          data-ocid="report_builder.generate.primary_button"
          onClick={handleGenerate}
          size="sm"
          className="bg-teal text-primary-foreground hover:bg-teal/90 text-[12px] h-8 px-4 gap-1.5"
        >
          <RefreshCw size={12} />
          Generate Report
        </Button>
        {generated && rows && (
          <Button
            data-ocid="report_builder.export.secondary_button"
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-[12px] h-8 px-3 gap-1.5 border-border text-muted-foreground hover:text-foreground"
          >
            <Download size={12} />
            Export CSV
          </Button>
        )}
      </div>

      {/* Report Output */}
      <div className="flex-1 overflow-auto p-4">
        {!generated ? (
          <div
            data-ocid="report_builder.empty_state"
            className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground"
          >
            <BarChart3 size={32} className="opacity-20" />
            <span className="text-[12px]">
              Select parameters and click Generate Report
            </span>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="border border-border bg-card">
              {/* Report Title */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
                <div>
                  <div className="text-[13px] font-bold text-foreground">
                    {reportType}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Period: {fromDate} to {toDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">Net</div>
                  <div
                    className={`text-[14px] font-bold font-mono ${
                      totalAmount >= 0 ? "text-teal" : "text-destructive"
                    }`}
                  >
                    ₹{formatINR(totalAmount)}
                  </div>
                </div>
              </div>
              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[10px] text-muted-foreground uppercase tracking-wide px-4 py-1.5">
                      Description
                    </th>
                    <th className="text-right text-[10px] text-muted-foreground uppercase tracking-wide px-4 py-1.5">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows?.map((row, idx) => (
                    <tr
                      // biome-ignore lint/suspicious/noArrayIndexKey: static report rows
                      key={idx}
                      data-ocid={`report_builder.row.item.${idx + 1}`}
                      className={`border-b border-border/40 ${
                        idx === (rows?.length ?? 0) - 1
                          ? "bg-secondary/30 font-semibold"
                          : "hover:bg-secondary/20"
                      }`}
                    >
                      <td
                        className={`text-[12px] px-4 py-1.5 ${
                          row.sub
                            ? "text-muted-foreground pl-8"
                            : "text-foreground"
                        }`}
                      >
                        {row.sub && (
                          <span className="text-muted-foreground mr-1">–</span>
                        )}
                        {row.label}
                      </td>
                      <td
                        className={`text-right text-[12px] font-mono px-4 py-1.5 ${
                          row.amount < 0
                            ? "text-destructive"
                            : idx === (rows?.length ?? 0) - 1
                              ? "text-teal"
                              : "text-foreground"
                        }`}
                      >
                        {formatINR(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
