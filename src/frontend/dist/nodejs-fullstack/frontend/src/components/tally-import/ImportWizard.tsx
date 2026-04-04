import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

const STEPS = [
  "Upload File",
  "Map Fields",
  "Preview & Validate",
  "Import Summary",
];

const SAMPLE_COLUMNS = [
  "Date",
  "Voucher Type",
  "Party Name",
  "Amount",
  "Narration",
  "GSTIN",
  "HSN Code",
];
const TARGET_FIELDS = [
  "Date",
  "Voucher Type",
  "Ledger Name",
  "Amount (₹)",
  "Narration",
  "GSTIN",
  "HSN Code",
  "-- Skip --",
];

const PREVIEW_ROWS = [
  {
    idx: 1,
    date: "31-Mar-2024",
    vtype: "Sales",
    party: "Sharma Traders",
    amount: "₹42,000",
    narration: "Against Invoice #001",
    valid: true,
  },
  {
    idx: 2,
    date: "30-Mar-2024",
    vtype: "Payment",
    party: "Rahul Enterprises",
    amount: "₹15,500",
    narration: "Rent payment",
    valid: true,
  },
  {
    idx: 3,
    date: "29-Mar-2024",
    vtype: "Receipt",
    party: "",
    amount: "₹8,000",
    narration: "Cash received",
    valid: false,
  },
  {
    idx: 4,
    date: "28-Mar-2024",
    vtype: "Purchase",
    party: "ABC Supplies",
    amount: "₹62,000",
    narration: "Stock purchase",
    valid: true,
  },
  {
    idx: 5,
    date: "invalid-date",
    vtype: "Journal",
    party: "Capital",
    amount: "₹1,00,000",
    narration: "",
    valid: false,
  },
];

export default function ImportWizard() {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [mappings, setMappings] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      SAMPLE_COLUMNS.map((c, i) => [c, TARGET_FIELDS[i] || "-- Skip --"]),
    ),
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const validRows = PREVIEW_ROWS.filter((r) => r.valid).length;
  const errorRows = PREVIEW_ROWS.filter((r) => !r.valid).length;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  }

  function downloadSample() {
    const csv =
      "Date,Voucher Type,Party Name,Amount,Narration,GSTIN,HSN Code\n31-Mar-2024,Sales,Sharma Traders,42000,Sample entry,27AABC1234D1Z5,9988";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tally-import-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadErrors() {
    const errorData = PREVIEW_ROWS.filter((r) => !r.valid)
      .map(
        (r) =>
          `${r.idx},${r.date},${r.party},${r.amount},Missing party or invalid date`,
      )
      .join("\n");
    const csv = `Row,Date,Party,Amount,Error
${errorData}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Upload className="h-6 w-6 text-teal-400" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Import Wizard</h1>
            <p className="text-sm text-muted-foreground">
              Import Tally ERP 9 data (XML / CSV)
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={downloadSample}
          className="gap-2"
          data-ocid="importwizard.secondary_button"
        >
          <Download className="h-4 w-4" /> Download Sample
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                i === step
                  ? "bg-teal-600 text-white"
                  : i < step
                    ? "bg-teal-900/60 text-teal-300"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  i < step ? "bg-teal-400 text-teal-900" : ""
                }`}
              >
                {i < step ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </span>
              {s}
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Upload */}
      {step === 0 && (
        <Card>
          <CardContent className="pt-6">
            <button
              type="button"
              className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-teal-400 transition-colors w-full"
              onClick={() => fileRef.current?.click()}
              data-ocid="importwizard.dropzone"
            >
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">
                {fileName ||
                  "Click or drag-and-drop a Tally XML / CSV file here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .xml and .csv formats exported from Tally ERP 9
              </p>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xml,.csv"
              className="hidden"
              onChange={handleFile}
            />
            {fileName && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" /> {fileName} selected
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={!fileName}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-ocid="importwizard.primary_button"
              >
                Next: Map Fields
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Field mapping */}
      {step === 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Map Source Fields to HisabKitab Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SAMPLE_COLUMNS.map((col) => (
                <div key={col} className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium text-muted-foreground">
                    {col}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={mappings[col]}
                    onValueChange={(v) =>
                      setMappings((prev) => ({ ...prev, [col]: v }))
                    }
                  >
                    <SelectTrigger
                      className="w-48"
                      data-ocid="importwizard.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_FIELDS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-ocid="importwizard.primary_button"
              >
                Next: Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Preview & Validate</CardTitle>
              <div className="flex gap-2">
                <Badge className="bg-green-700 text-green-100">
                  {validRows} Valid
                </Badge>
                <Badge variant="destructive">{errorRows} Errors</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto" data-ocid="importwizard.table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PREVIEW_ROWS.map((row) => (
                    <TableRow
                      key={row.idx}
                      className={row.valid ? "" : "bg-red-950/20"}
                    >
                      <TableCell>{row.idx}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.vtype}</TableCell>
                      <TableCell className={!row.party ? "text-red-400" : ""}>
                        {row.party || "(missing)"}
                      </TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>{row.narration}</TableCell>
                      <TableCell>
                        {row.valid ? (
                          <Badge className="bg-green-700 text-green-100 text-xs">
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Error
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-ocid="importwizard.primary_button"
              >
                Import {validRows} Records
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Summary */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <CheckCircle2 className="h-14 w-14 text-green-400 mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Import Complete
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tally data has been imported into HisabKitab Pro
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-400">{validRows}</p>
                <p className="text-xs text-muted-foreground">Imported</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-400">{errorRows}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-2xl font-bold">{PREVIEW_ROWS.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              {errorRows > 0 && (
                <Button
                  variant="outline"
                  onClick={downloadErrors}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" /> Download Error Report
                </Button>
              )}
              <Button
                onClick={() => setStep(0)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-ocid="importwizard.secondary_button"
              >
                Import Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
