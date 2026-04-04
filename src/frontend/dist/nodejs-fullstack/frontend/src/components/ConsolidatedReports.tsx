import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { useState } from "react";
import type { Company } from "../backend.d";

interface Ledger {
  id: string;
  name: string;
  group: string;
  openingBalance: number;
  closingBalance?: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    v,
  );

const ASSET_GROUPS = [
  "Assets",
  "Current Assets",
  "Fixed Assets",
  "Bank Accounts",
  "Cash-in-Hand",
  "Loans & Advances (Asset)",
  "Sundry Debtors",
];
const LIABILITY_GROUPS = [
  "Liabilities",
  "Current Liabilities",
  "Capital Account",
  "Loans (Liability)",
  "Sundry Creditors",
  "Reserves & Surplus",
];
const INCOME_GROUPS = [
  "Income",
  "Sales Accounts",
  "Direct Income",
  "Indirect Income",
];
const EXPENSE_GROUPS = [
  "Expenses",
  "Purchase Accounts",
  "Direct Expenses",
  "Indirect Expenses",
];

function isAsset(g: string) {
  return ASSET_GROUPS.some(
    (a) =>
      g.toLowerCase().includes(a.toLowerCase()) ||
      a.toLowerCase().includes(g.toLowerCase()),
  );
}
function isLiability(g: string) {
  return LIABILITY_GROUPS.some(
    (a) =>
      g.toLowerCase().includes(a.toLowerCase()) ||
      a.toLowerCase().includes(g.toLowerCase()),
  );
}
function isIncome(g: string) {
  return INCOME_GROUPS.some(
    (a) =>
      g.toLowerCase().includes(a.toLowerCase()) ||
      a.toLowerCase().includes(g.toLowerCase()),
  );
}
function isExpense(g: string) {
  return EXPENSE_GROUPS.some(
    (a) =>
      g.toLowerCase().includes(a.toLowerCase()) ||
      a.toLowerCase().includes(g.toLowerCase()),
  );
}

export default function ConsolidatedReports({
  currentCompany,
}: { currentCompany: Company }) {
  const allCompanies: Company[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("hkp-companies") ?? "[]");
    } catch {
      return [];
    }
  })();

  const cid = (c: Company) => String(c.id);

  const [selected, setSelected] = useState<Set<string>>(
    new Set([cid(currentCompany)]),
  );
  const [intercoExclude, setIntercoExclude] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("bs");

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleInterco = (id: string) => {
    setIntercoExclude((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getLedgers = (companyId: string): Ledger[] => {
    try {
      return JSON.parse(
        localStorage.getItem(`hkp-ledgers-${companyId}`) ?? "[]",
      );
    } catch {
      return [];
    }
  };

  const INTERCO_FACTOR = 0.1;

  const consolidate = (classifier: (g: string) => boolean) => {
    const groupMap: Record<string, number> = {};
    for (const companyId of selected) {
      const ledgers = getLedgers(companyId);
      const factor = intercoExclude.has(companyId) ? 1 - INTERCO_FACTOR : 1;
      for (const l of ledgers) {
        if (!classifier(l.group)) continue;
        const bal = (l.closingBalance ?? l.openingBalance ?? 0) * factor;
        if (!groupMap[l.group]) groupMap[l.group] = 0;
        groupMap[l.group] += bal;
      }
    }
    return groupMap;
  };

  const assets = consolidate(isAsset);
  const liabilities = consolidate(isLiability);
  const income = consolidate(isIncome);
  const expenses = consolidate(isExpense);

  const sum = (m: Record<string, number>) =>
    Object.values(m).reduce((s, v) => s + v, 0);

  const exportCSV = (tab: string) => {
    let rows: string[] = [];
    if (tab === "bs") {
      rows = [
        "Side,Group,Amount",
        ...Object.entries(assets).map(([g, v]) => `Assets,${g},${v}`),
        `Assets,TOTAL,${sum(assets)}`,
        ...Object.entries(liabilities).map(([g, v]) => `Liabilities,${g},${v}`),
        `Liabilities,TOTAL,${sum(liabilities)}`,
      ];
    } else {
      rows = [
        "Side,Group,Amount",
        ...Object.entries(income).map(([g, v]) => `Income,${g},${v}`),
        `Income,TOTAL,${sum(income)}`,
        ...Object.entries(expenses).map(([g, v]) => `Expenses,${g},${v}`),
        `Expenses,TOTAL,${sum(expenses)}`,
        `Net Profit,,${sum(income) - sum(expenses)}`,
      ];
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "consolidated-report.csv";
    a.click();
  };

  const GroupTable = ({
    data,
    title,
  }: { data: Record<string, number>; title: string }) => (
    <div className="mb-4">
      <div className="text-[10px] font-bold uppercase tracking-wide text-teal px-3 py-1.5 bg-teal/10 border border-teal/20">
        {title}
      </div>
      {Object.entries(data).length === 0 ? (
        <div className="px-3 py-2 text-[11px] text-muted-foreground italic">
          No data
        </div>
      ) : (
        <>
          {Object.entries(data).map(([g, v]) => (
            <div
              key={g}
              className="flex justify-between px-3 py-1.5 border-b border-border/40 hover:bg-secondary/20 text-[11px]"
            >
              <span className="text-muted-foreground">{g}</span>
              <span className="font-mono text-foreground">{fmt(v)}</span>
            </div>
          ))}
          <div className="flex justify-between px-3 py-2 bg-secondary/40 font-semibold text-[11px]">
            <span className="text-foreground">Total {title}</span>
            <span className="font-mono text-teal">{fmt(sum(data))}</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="tally-section-header mb-4">Consolidated Reports</div>

      {/* Company Selection */}
      <div className="bg-card border border-border p-4 mb-4">
        <div className="text-[11px] font-semibold text-teal uppercase tracking-wide mb-3">
          Select Companies to Consolidate
        </div>
        {allCompanies.length === 0 ? (
          <div className="text-[11px] text-muted-foreground">
            No companies found in storage.
          </div>
        ) : (
          <div className="space-y-2">
            {allCompanies.map((c) => (
              <div key={cid(c)} className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    data-ocid="consolidation.company.checkbox"
                    checked={selected.has(cid(c))}
                    onChange={() => toggle(cid(c))}
                    className="accent-teal"
                  />
                  <span className="text-[12px] text-foreground">{c.name}</span>
                  {cid(c) === cid(currentCompany) && (
                    <span className="text-[10px] text-teal">(Current)</span>
                  )}
                </label>
                {selected.has(cid(c)) && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={intercoExclude.has(cid(c))}
                      onChange={() => toggleInterco(cid(c))}
                      className="accent-destructive"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Exclude Intercompany (−10%)
                    </span>
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected.size < 2 ? (
        <div
          data-ocid="consolidation.empty_state"
          className="bg-card border border-border p-6 text-center text-muted-foreground text-[12px]"
        >
          Select at least 2 companies above to generate consolidated reports.
        </div>
      ) : (
        <div className="bg-card border border-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <div className="text-[11px] text-muted-foreground">
              Consolidating {selected.size} companies
            </div>
            <button
              type="button"
              data-ocid="consolidation.export.button"
              onClick={() => exportCSV(activeTab)}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 transition-colors"
            >
              <Download size={12} /> Export CSV
            </button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-secondary/30 border-b border-border w-full justify-start rounded-none px-4 h-9">
              <TabsTrigger
                data-ocid="consolidation.bs.tab"
                value="bs"
                className="text-[11px]"
              >
                Consolidated Balance Sheet
              </TabsTrigger>
              <TabsTrigger
                data-ocid="consolidation.pl.tab"
                value="pl"
                className="text-[11px]"
              >
                Consolidated P&L
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bs" className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <GroupTable data={assets} title="Assets" />
                </div>
                <div>
                  <GroupTable data={liabilities} title="Liabilities & Equity" />
                  <div className="mt-2 flex justify-between px-3 py-2 bg-teal/10 border border-teal/20 text-[11px] font-semibold">
                    <span className="text-foreground">
                      Difference (Assets − Liabilities)
                    </span>
                    <span
                      className={`font-mono ${
                        Math.abs(sum(assets) - sum(liabilities)) < 1
                          ? "text-green-400"
                          : "text-destructive"
                      }`}
                    >
                      {fmt(sum(assets) - sum(liabilities))}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pl" className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <GroupTable data={income} title="Income" />
                </div>
                <div>
                  <GroupTable data={expenses} title="Expenses" />
                  <div className="mt-2 flex justify-between px-3 py-2 bg-teal/10 border border-teal/20 text-[11px] font-semibold">
                    <span className="text-foreground">Net Profit / (Loss)</span>
                    <span
                      className={`font-mono ${
                        sum(income) - sum(expenses) >= 0
                          ? "text-green-400"
                          : "text-destructive"
                      }`}
                    >
                      {fmt(sum(income) - sum(expenses))}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
