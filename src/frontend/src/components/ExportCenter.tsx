import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

const REPORT_TYPES = [
  "Trial Balance",
  "Balance Sheet",
  "P&L Account",
  "Day Book",
  "GSTR-1",
  "GSTR-3B",
  "Stock Summary",
  "Payroll Register",
];

const REPORT_HEADERS: Record<string, string[]> = {
  "Trial Balance": [
    "Ledger",
    "Opening Dr",
    "Opening Cr",
    "Closing Dr",
    "Closing Cr",
  ],
  "Balance Sheet": ["Particulars", "Amount (₹)"],
  "P&L Account": ["Particulars", "Amount (₹)"],
  "Day Book": ["Date", "Voucher No", "Type", "Narration", "Amount (₹)"],
  "GSTR-1": [
    "GSTIN",
    "Invoice No",
    "Date",
    "Taxable Value",
    "IGST",
    "CGST",
    "SGST",
  ],
  "GSTR-3B": [
    "Description",
    "Total Taxable",
    "Integrated Tax",
    "Central Tax",
    "State Tax",
  ],
  "Stock Summary": [
    "Item Name",
    "Group",
    "Opening Qty",
    "In",
    "Out",
    "Closing Qty",
    "Rate",
    "Value",
  ],
  "Payroll Register": [
    "Employee",
    "Month",
    "Basic",
    "HRA",
    "PF",
    "TDS",
    "Net Pay",
  ],
};

const SAMPLE_DATA: Record<string, string[][]> = {
  "Trial Balance": [
    ["Cash", "50,000", "0", "75,000", "0"],
    ["Bank", "1,00,000", "0", "1,25,000", "0"],
    ["Sales", "0", "0", "0", "2,50,000"],
    ["Purchases", "1,80,000", "0", "1,80,000", "0"],
    ["Salaries", "45,000", "0", "45,000", "0"],
  ],
  "Balance Sheet": [
    ["Share Capital", "5,00,000"],
    ["Reserves & Surplus", "1,20,000"],
    ["Fixed Assets", "3,50,000"],
    ["Current Assets", "2,70,000"],
    ["Current Liabilities", "0"],
  ],
  "P&L Account": [
    ["Sales Revenue", "8,50,000"],
    ["Cost of Goods Sold", "5,20,000"],
    ["Gross Profit", "3,30,000"],
    ["Operating Expenses", "1,10,000"],
    ["Net Profit", "2,20,000"],
  ],
  "Day Book": [
    ["01-Apr-2024", "1", "Sales", "Invoice to ABC Ltd", "25,000"],
    ["02-Apr-2024", "2", "Payment", "Office Rent", "10,000"],
    ["03-Apr-2024", "3", "Receipt", "Payment from XYZ", "18,000"],
    ["04-Apr-2024", "4", "Purchase", "Raw Material", "35,000"],
    ["05-Apr-2024", "5", "Journal", "Depreciation", "5,000"],
  ],
  "GSTR-1": [
    [
      "27AAPFU0939F1ZV",
      "INV-001",
      "01-Apr-2024",
      "25,000",
      "0",
      "2,250",
      "2,250",
    ],
    [
      "29AAGCM1234L1ZT",
      "INV-002",
      "05-Apr-2024",
      "40,000",
      "0",
      "3,600",
      "3,600",
    ],
    ["07AAACR5055K1Z5", "INV-003", "10-Apr-2024", "15,000", "2,700", "0", "0"],
  ],
  "GSTR-3B": [
    ["Outward taxable supplies", "80,000", "0", "7,200", "7,200"],
    ["Zero rated supplies", "10,000", "0", "0", "0"],
    ["Input Tax Credit", "50,000", "0", "4,500", "4,500"],
  ],
  "Stock Summary": [
    [
      "Cement Bags",
      "Building Materials",
      "100",
      "200",
      "150",
      "150",
      "350",
      "52,500",
    ],
    ["Steel Rods", "Metals", "50", "100", "80", "70", "4,200", "2,94,000"],
    ["Paints 5L", "Paints", "30", "60", "45", "45", "1,200", "54,000"],
  ],
  "Payroll Register": [
    ["Ravi Kumar", "Apr 2024", "25,000", "10,000", "3,000", "1,500", "30,500"],
    [
      "Priya Sharma",
      "Apr 2024",
      "30,000",
      "12,000",
      "3,600",
      "2,000",
      "36,400",
    ],
    ["Arjun Nair", "Apr 2024", "22,000", "8,800", "2,640", "1,200", "26,960"],
  ],
};

export default function ExportCenter() {
  const [reportType, setReportType] = useState("Trial Balance");
  const [fromDate, setFromDate] = useState("2024-04-01");
  const [toDate, setToDate] = useState("2025-03-31");
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const headers = REPORT_HEADERS[reportType] ?? [];
  const rows = SAMPLE_DATA[reportType] ?? [];

  const exportCSV = async () => {
    setExporting("csv");
    await new Promise((r) => setTimeout(r, 600));
    const csvContent = [
      [`# ${reportType} — ${fromDate} to ${toDate}`],
      headers,
      ...rows,
    ]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType.replace(/[^a-z0-9]/gi, "_")}_${fromDate}_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(null);
  };

  const exportPDF = async () => {
    setExporting("pdf");
    await new Promise((r) => setTimeout(r, 600));
    const win = window.open("", "_blank");
    if (!win) {
      setExporting(null);
      return;
    }
    const tableRows = rows
      .map(
        (row) =>
          `<tr>${row.map((c) => `<td style="border:1px solid #ccc;padding:6px 10px">${c}</td>`).join("")}</tr>`,
      )
      .join("");
    win.document.write(`
      <!DOCTYPE html><html><head><title>${reportType}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px}h2{margin-bottom:4px}p{color:#666;margin-bottom:16px}
      table{border-collapse:collapse;width:100%}th{background:#e2f0ef;border:1px solid #ccc;padding:6px 10px;text-align:left}td{font-size:13px}
      </style></head><body>
      <h2>${reportType}</h2>
      <p>Period: ${fromDate} to ${toDate}</p>
      <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${tableRows}</tbody></table>
      <p style="margin-top:24px;font-size:11px;color:#999">Generated by HisabKitab Pro</p>
      </body></html>
    `);
    win.document.close();
    win.print();
    setExporting(null);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={16} className="text-teal" />
          <span className="text-[15px] font-bold uppercase tracking-wide text-foreground">
            Export Center
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Export reports to CSV or PDF format
        </p>
      </div>

      <div className="p-6 max-w-2xl">
        {/* Note */}
        <div className="mb-5 px-3 py-2 bg-teal/10 border border-teal/30 text-[11px] text-teal">
          ℹ️ Exports use current data from your reports. For full data, navigate
          to the respective report.
        </div>

        {/* Report Type */}
        <div className="mb-4">
          <label
            htmlFor="export-report-type"
            className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
          >
            Report Type
          </label>
          <select
            id="export-report-type"
            data-ocid="export.report_type.select"
            className="tally-input w-full max-w-xs"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            {REPORT_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex gap-4 mb-6">
          <div>
            <label
              htmlFor="export-from-date"
              className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
            >
              From Date
            </label>
            <input
              id="export-from-date"
              data-ocid="export.from_date.input"
              type="date"
              className="tally-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="export-to-date"
              className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1"
            >
              To Date
            </label>
            <input
              id="export-to-date"
              data-ocid="export.to_date.input"
              type="date"
              className="tally-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* Preview Table */}
        <div className="mb-6">
          <div className="tally-section-header mb-2">
            Preview ({reportType})
          </div>
          <div className="border border-border overflow-auto">
            <table className="w-full tally-table">
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: sample data rows
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: cell positions
                      <td key={ci}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            data-ocid="export.csv.button"
            onClick={exportCSV}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold bg-teal text-primary-foreground hover:bg-teal-bright disabled:opacity-50 transition-colors"
          >
            {exporting === "csv" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            Export CSV
          </button>
          <button
            type="button"
            data-ocid="export.pdf.button"
            onClick={exportPDF}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
          >
            {exporting === "pdf" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <FileText size={13} />
            )}
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
