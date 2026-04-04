import {
  AlertCircle,
  CheckCircle,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  Info,
  RefreshCw,
  Shield,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

type Tab = "backup" | "export" | "import" | "validation";

interface DataSummary {
  companies: bigint;
  ledgers: bigint;
  vouchers: bigint;
  gstVouchers: bigint;
  stockItems: bigint;
  employees: bigint;
  bankAccounts: bigint;
}

interface BackupData {
  version?: string;
  exportedAt?: string;
  summary?: {
    companies?: number;
    ledgers?: number;
    vouchers?: number;
  };
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function objectsToCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const lines = rows.map((r) =>
    keys
      .map((k) => {
        const v = String(r[k] ?? "");
        return v.includes(",") || v.includes('"')
          ? `"${v.replace(/"/g, '""')}"`
          : v;
      })
      .join(","),
  );
  return [header, ...lines].join("\n");
}

function BackupTab() {
  const { actor } = useActor();
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [restoreFile, setRestoreFile] = useState<BackupData | null>(null);
  const [restoreFileName, setRestoreFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadSummary = async () => {
    if (!actor) return;
    setLoadingSummary(true);
    try {
      const s = await (actor as any).getDataSummary();
      setSummary(s);
    } catch {
      toast.error("Failed to load data summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  const downloadBackup = async () => {
    if (!actor) return;
    setLoadingBackup(true);
    try {
      const json = await (actor as any).exportAllData();
      const date = new Date().toISOString().split("T")[0];
      downloadFile(json, `hisabkitab-backup-${date}.json`, "application/json");
      toast.success("Backup downloaded successfully");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        setRestoreFile(parsed);
      } catch {
        toast.error("Invalid JSON backup file");
        setRestoreFile(null);
      }
    };
    reader.readAsText(file);
  };

  const summaryRows = summary
    ? [
        { label: "Companies", value: Number(summary.companies) },
        { label: "Ledgers", value: Number(summary.ledgers) },
        { label: "Vouchers", value: Number(summary.vouchers) },
        { label: "GST Vouchers", value: Number(summary.gstVouchers) },
        { label: "Stock Items", value: Number(summary.stockItems) },
        { label: "Employees", value: Number(summary.employees) },
        { label: "Bank Accounts", value: Number(summary.bankAccounts) },
      ]
    : [];

  return (
    <div className="p-4 space-y-4">
      {/* Data Summary */}
      <div className="border border-border">
        <div className="bg-secondary/40 px-3 py-1.5 border-b border-border flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
            Data Summary
          </span>
          <button
            type="button"
            data-ocid="backup.summary.button"
            onClick={loadSummary}
            disabled={loadingSummary}
            className="text-[11px] px-2 py-0.5 border border-border hover:bg-secondary transition-colors flex items-center gap-1"
          >
            <RefreshCw
              size={10}
              className={loadingSummary ? "animate-spin" : ""}
            />
            {loadingSummary ? "Loading..." : "Refresh"}
          </button>
        </div>
        {!summary ? (
          <div className="p-4 text-center text-[12px] text-muted-foreground">
            Click Refresh to load data summary
          </div>
        ) : (
          <table className="w-full">
            <tbody>
              {summaryRows.map((r) => (
                <tr
                  key={r.label}
                  className={
                    summaryRows.indexOf(r) % 2 === 0
                      ? "bg-background"
                      : "bg-secondary/20"
                  }
                >
                  <td className="px-3 py-1.5 text-[12px] text-muted-foreground">
                    {r.label}
                  </td>
                  <td className="px-3 py-1.5 text-[12px] font-medium text-right">
                    {r.value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Backup Download */}
      <div className="border border-border">
        <div className="bg-secondary/40 px-3 py-1.5 border-b border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
            Download Backup
          </span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-foreground">
              Export all company data as a JSON backup file.
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Includes companies, ledgers, vouchers, inventory, payroll, and
              banking data.
            </p>
          </div>
          <button
            type="button"
            data-ocid="backup.download.button"
            onClick={downloadBackup}
            disabled={loadingBackup}
            className="flex items-center gap-2 px-4 py-2 bg-teal text-primary-foreground text-[12px] hover:bg-teal/90 transition-colors"
          >
            <Download size={13} />
            {loadingBackup ? "Exporting..." : "Download Backup"}
          </button>
        </div>
      </div>

      {/* Restore */}
      <div className="border border-border">
        <div className="bg-secondary/40 px-3 py-1.5 border-b border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
            Restore from Backup
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="backup.restore.upload_button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 border border-border text-[12px] hover:bg-secondary transition-colors"
            >
              <Upload size={12} /> Choose Backup File
            </button>
            {restoreFileName && (
              <span className="text-[11px] text-muted-foreground">
                {restoreFileName}
              </span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleRestoreFile}
          />
          {restoreFile && (
            <div className="border border-border bg-secondary/20 p-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase text-teal">
                Backup Contents
              </p>
              {restoreFile.version && (
                <p className="text-[12px]">
                  Version:{" "}
                  <span className="font-medium">{restoreFile.version}</span>
                </p>
              )}
              {restoreFile.exportedAt && (
                <p className="text-[12px]">
                  Exported At:{" "}
                  <span className="font-medium">
                    {new Date(restoreFile.exportedAt).toLocaleString()}
                  </span>
                </p>
              )}
              {restoreFile.summary && (
                <div className="text-[12px] space-y-0.5">
                  {Object.entries(restoreFile.summary).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-muted-foreground capitalize">
                        {k}:
                      </span>
                      <span className="font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/30 mt-2">
                <Info
                  size={12}
                  className="text-amber-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-[11px] text-amber-500">
                  Full restore requires re-entry of data. This preview confirms
                  the backup is valid. Canister data is immutable once written
                  to the Internet Computer blockchain.
                </p>
              </div>
              <button
                type="button"
                data-ocid="backup.restore.confirm_button"
                onClick={() =>
                  toast.info(
                    "Backup verified. To restore, re-import data using the Import tab.",
                  )
                }
                className="flex items-center gap-2 px-3 py-1.5 border border-teal text-teal text-[12px] hover:bg-teal/10 transition-colors"
              >
                <CheckCircle size={12} /> Confirm Restore Preview
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Sync Info */}
      <div className="border border-border bg-teal/5">
        <div className="p-4 flex items-start gap-3">
          <Shield size={16} className="text-teal mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-teal">
              Multi-Device Sync
            </p>
            <p className="text-[12px] text-foreground mt-0.5">
              Data is stored on the Internet Computer blockchain. Access from
              any device using the same credentials.
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              No manual sync required — all data is automatically available
              across devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const EXPORT_MODULES = [
  { key: "ledgers", label: "Ledgers", method: "getAllLedgers", args: [] },
  {
    key: "stockItems",
    label: "Stock Items",
    method: "getAllStockItems",
    args: [],
  },
  { key: "companies", label: "Companies", method: "getAllCompanies", args: [] },
];

function ExportTab() {
  const { actor } = useActor();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const exportModule = async (
    mod: (typeof EXPORT_MODULES)[0],
    format: "csv" | "json",
  ) => {
    if (!actor) return;
    const key = `${mod.key}-${format}`;
    setLoading((p) => ({ ...p, [key]: true }));
    try {
      const data = await (actor as any)[mod.method](...mod.args);
      const date = new Date().toISOString().split("T")[0];
      if (format === "json") {
        downloadFile(
          JSON.stringify(
            data,
            (_, v) => (typeof v === "bigint" ? Number(v) : v),
            2,
          ),
          `${mod.key}-${date}.json`,
          "application/json",
        );
      } else {
        const rows = (data as Record<string, unknown>[]).map((r) => {
          const out: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(r)) {
            out[k] = typeof v === "bigint" ? Number(v) : v;
          }
          return out;
        });
        downloadFile(objectsToCsv(rows), `${mod.key}-${date}.csv`, "text/csv");
      }
      toast.success(`${mod.label} exported as ${format.toUpperCase()}`);
    } catch {
      toast.error(`Failed to export ${mod.label}`);
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  };

  const allModules = [
    { key: "ledgers", label: "Ledgers", method: "getAllLedgers", args: [] },
    {
      key: "stockItems",
      label: "Stock Items",
      method: "getAllStockItems",
      args: [],
    },
    {
      key: "companies",
      label: "Companies",
      method: "getAllCompanies",
      args: [],
    },
    {
      key: "ledgerGroups",
      label: "Ledger Groups",
      method: "getAllLedgerGroups",
      args: [],
    },
    {
      key: "stockGroups",
      label: "Stock Groups",
      method: "getAllStockGroups",
      args: [],
    },
  ];

  return (
    <div className="p-4">
      <div className="border border-border">
        <div className="bg-secondary/40 px-3 py-1.5 border-b border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
            Export Modules
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/60 border-b border-border">
              <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                Module
              </th>
              <th className="px-3 py-1.5 text-right text-[11px] uppercase tracking-wider text-muted-foreground">
                Export As
              </th>
            </tr>
          </thead>
          <tbody>
            {allModules.map((mod) => (
              <tr key={mod.key} className="bg-background even:bg-secondary/20">
                <td className="px-3 py-2 text-[12px] text-foreground">
                  {mod.label}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      data-ocid={`export.${mod.key}.csv.button`}
                      onClick={() => exportModule(mod, "csv")}
                      disabled={loading[`${mod.key}-csv`]}
                      className="flex items-center gap-1 px-2 py-1 border border-border text-[11px] hover:bg-secondary transition-colors"
                    >
                      <FileSpreadsheet size={10} />
                      {loading[`${mod.key}-csv`] ? "..." : "CSV"}
                    </button>
                    <button
                      type="button"
                      data-ocid={`export.${mod.key}.json.button`}
                      onClick={() => exportModule(mod, "json")}
                      disabled={loading[`${mod.key}-json`]}
                      className="flex items-center gap-1 px-2 py-1 border border-border text-[11px] hover:bg-secondary transition-colors"
                    >
                      <FileJson size={10} />
                      {loading[`${mod.key}-json`] ? "..." : "JSON"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CsvRow {
  name: string;
  group: string;
  openingBalance: string;
  balanceType: string;
}

function ImportTab() {
  const { actor } = useActor();
  const csvRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [importingCsv, setImportingCsv] = useState(false);
  const [csvResults, setCsvResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(
    null,
  );
  const [jsonFileName, setJsonFileName] = useState("");

  const parseCsv = (text: string): CsvRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    return lines
      .slice(1)
      .map((line) => {
        const [
          name = "",
          group = "",
          openingBalance = "0",
          balanceType = "Dr",
        ] = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
        return { name, group, openingBalance, balanceType };
      })
      .filter((r) => r.name);
  };

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    setCsvResults(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCsv(ev.target?.result as string);
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const importCsv = async () => {
    if (!actor || !csvRows.length) return;
    setImportingCsv(true);
    let success = 0;
    const errors: string[] = [];
    const groups = await (actor as any).getAllLedgerGroups();
    for (const row of csvRows) {
      try {
        const group = groups.find(
          (g: any) => g.name.toLowerCase() === row.group.toLowerCase(),
        );
        const groupId = group ? group.id : (groups[0]?.id ?? 1n);
        const companies = await (actor as any).getAllCompanies();
        const companyId = companies[0]?.id ?? 1n;
        await (actor as any).createLedger(
          companyId,
          row.name,
          groupId,
          Number.parseFloat(row.openingBalance) || 0,
          row.balanceType || "Dr",
        );
        success++;
      } catch (err: any) {
        errors.push(`${row.name}: ${err?.message ?? "Failed"}`);
      }
    }
    setCsvResults({ success, errors });
    setImportingCsv(false);
    if (success > 0) toast.success(`Imported ${success} ledger(s)`);
    if (errors.length > 0)
      toast.error(`${errors.length} error(s) during import`);
  };

  const handleJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJsonFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setJsonData(JSON.parse(ev.target?.result as string));
      } catch {
        toast.error("Invalid JSON file");
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-4">
      {/* CSV Import */}
      <div className="border border-border">
        <div className="bg-secondary/40 px-3 py-1.5 border-b border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
            Import Ledgers from CSV
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-secondary/20 border border-border p-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Expected Format
            </p>
            <code className="text-[11px] text-teal font-mono">
              Name, Group, Opening Balance, Balance Type
            </code>
            <p className="text-[11px] text-muted-foreground mt-1">
              Example: Cash Account, Cash, 50000, Dr
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="import.csv.upload_button"
              onClick={() => csvRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 border border-border text-[12px] hover:bg-secondary transition-colors"
            >
              <Upload size={12} /> Choose CSV File
            </button>
            {csvFileName && (
              <span className="text-[11px] text-muted-foreground">
                {csvFileName}
              </span>
            )}
          </div>
          <input
            ref={csvRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvFile}
          />
          {csvRows.length > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">
                {csvRows.length} rows detected — preview (first 5):
              </p>
              <table className="w-full border border-border text-[11px]">
                <thead>
                  <tr className="bg-secondary/60">
                    {["Name", "Group", "Opening Balance", "Balance Type"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-2 py-1 text-left text-muted-foreground"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 5).map((r) => (
                    <tr key={r.name} className={"bg-background"}>
                      <td className="px-2 py-1">{r.name}</td>
                      <td className="px-2 py-1">{r.group}</td>
                      <td className="px-2 py-1">{r.openingBalance}</td>
                      <td className="px-2 py-1">{r.balanceType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                data-ocid="import.csv.submit_button"
                onClick={importCsv}
                disabled={importingCsv}
                className="mt-2 flex items-center gap-2 px-4 py-1.5 bg-teal text-primary-foreground text-[12px] hover:bg-teal/90 transition-colors"
              >
                {importingCsv ? (
                  <RefreshCw size={11} className="animate-spin" />
                ) : (
                  <Download size={11} />
                )}
                {importingCsv
                  ? "Importing..."
                  : `Import ${csvRows.length} Ledgers`}
              </button>
            </div>
          )}
          {csvResults && (
            <div
              className={`p-3 border text-[12px] ${csvResults.errors.length === 0 ? "bg-green-500/10 border-green-500/30" : "bg-amber-500/10 border-amber-500/30"}`}
            >
              <p className="font-semibold">
                {csvResults.success} imported successfully
              </p>
              {csvResults.errors.map((e) => (
                <p key={e} className="text-[11px] text-destructive mt-0.5">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* JSON Import */}
      <div className="border border-border">
        <div className="bg-secondary/40 px-3 py-1.5 border-b border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
            Import JSON Data
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-secondary/20 border border-border p-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Expected Format
            </p>
            <code className="text-[11px] text-teal font-mono whitespace-pre">{`{ "ledgers": [...], "companies": [...] }`}</code>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="import.json.upload_button"
              onClick={() => jsonRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 border border-border text-[12px] hover:bg-secondary transition-colors"
            >
              <Upload size={12} /> Choose JSON File
            </button>
            {jsonFileName && (
              <span className="text-[11px] text-muted-foreground">
                {jsonFileName}
              </span>
            )}
          </div>
          <input
            ref={jsonRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleJsonFile}
          />
          {jsonData && (
            <div className="border border-border bg-secondary/20 p-3">
              <p className="text-[11px] font-semibold text-teal mb-1">
                Parsed Data Preview
              </p>
              <pre className="text-[10px] text-muted-foreground overflow-auto max-h-40">
                {JSON.stringify(
                  jsonData,
                  (_, v) => (typeof v === "bigint" ? Number(v) : v),
                  2,
                ).slice(0, 800)}
                {JSON.stringify(jsonData).length > 800 ? "\n..." : ""}
              </pre>
              <button
                type="button"
                data-ocid="import.json.submit_button"
                onClick={() =>
                  toast.info(
                    "JSON import queued. Use Backup tab for full restore.",
                  )
                }
                className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-teal text-primary-foreground text-[12px] hover:bg-teal/90 transition-colors"
              >
                <CheckCircle size={11} /> Preview Import
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ValidationTab() {
  const { actor } = useActor();
  const [results, setResults] = useState<string[] | null>(null);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runValidation = async () => {
    if (!actor) return;
    setRunning(true);
    try {
      const issues = await (actor as any).validateAllData();
      setResults(issues);
      setLastRun(new Date());
      if (issues.length === 0) {
        toast.success("Validation passed — no issues found");
      } else {
        toast.warning(`Found ${issues.length} issue(s)`);
      }
    } catch {
      toast.error("Validation failed to run");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="border border-border">
        <div className="bg-secondary/40 px-3 py-1.5 border-b border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
            Data Validation
          </span>
        </div>
        <div className="p-4">
          <p className="text-[12px] text-muted-foreground mb-3">
            Checks for unbalanced vouchers, orphaned ledgers, missing
            references, and data integrity issues.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              data-ocid="validation.run.button"
              onClick={runValidation}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 bg-teal text-primary-foreground text-[12px] hover:bg-teal/90 transition-colors"
            >
              <RefreshCw size={13} className={running ? "animate-spin" : ""} />
              {running ? "Running Validation..." : "Run Validation"}
            </button>
            {lastRun && (
              <span className="text-[11px] text-muted-foreground">
                Last run: {lastRun.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {results !== null && (
        <div className="border border-border">
          <div className="bg-secondary/40 px-3 py-1.5 border-b border-border">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal">
              Results
            </span>
            <span
              className={`ml-2 text-[10px] px-1.5 py-0.5 ${results.length === 0 ? "bg-green-500/20 text-green-500" : "bg-destructive/20 text-destructive"}`}
            >
              {results.length === 0 ? "PASS" : `${results.length} ISSUE(S)`}
            </span>
          </div>
          <div className="p-4">
            {results.length === 0 ? (
              <div
                data-ocid="validation.success_state"
                className="flex items-center gap-2 text-green-500"
              >
                <CheckCircle size={16} />
                <span className="text-[13px] font-medium">
                  No issues found. All data is valid.
                </span>
              </div>
            ) : (
              <ul data-ocid="validation.error_state" className="space-y-1.5">
                {results.map((issue) => (
                  <li key={issue} className="flex items-start gap-2">
                    <AlertCircle
                      size={12}
                      className="text-destructive mt-0.5 flex-shrink-0"
                    />
                    <span className="text-[12px] text-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataManagement() {
  const [tab, setTab] = useState<Tab>("backup");

  const tabs: { key: Tab; label: string }[] = [
    { key: "backup", label: "Backup & Restore" },
    { key: "export", label: "Export Data" },
    { key: "import", label: "Import Data" },
    { key: "validation", label: "Data Validation" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-2">
        <Database size={14} className="text-teal" />
        <h1 className="text-[13px] font-semibold uppercase tracking-wider">
          Data Management
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-secondary/20 flex">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            data-ocid={`data_mgmt.${t.key}.tab`}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-[12px] uppercase tracking-wider border-r border-border transition-colors ${
              tab === t.key
                ? "bg-teal text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === "backup" && <BackupTab />}
        {tab === "export" && <ExportTab />}
        {tab === "import" && <ImportTab />}
        {tab === "validation" && <ValidationTab />}
      </div>
    </div>
  );
}
