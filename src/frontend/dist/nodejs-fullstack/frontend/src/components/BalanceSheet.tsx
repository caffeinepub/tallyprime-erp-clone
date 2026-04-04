import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Company, Ledger, LedgerGroup } from "../backend.d";
import {
  useGetAllLedgerGroups,
  useGetAllLedgers,
  useGetTrialBalance,
} from "../hooks/useQueries";
import { callOpenAI } from "../utils/openai";

interface Props {
  company: Company;
}

interface ClassifiedEntry {
  name: string;
  group: string;
  balance: number;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
}

export default function BalanceSheet({ company }: Props) {
  const { data: tbEntries = [], isLoading: tbLoading } = useGetTrialBalance(
    company.id,
  );
  const { data: ledgers = [], isLoading: lLoading } = useGetAllLedgers();
  const { data: groups = [], isLoading: gLoading } = useGetAllLedgerGroups();

  const isLoading = tbLoading || lLoading || gLoading;
  const groupMap = new Map<bigint, LedgerGroup>();
  for (const g of groups) groupMap.set(g.id, g);

  const ledgerMap = new Map<string, Ledger>();
  for (const l of ledgers) {
    if (l.companyId === company.id) ledgerMap.set(l.name, l);
  }

  const getNature = (ledgerName: string): string => {
    const ledger = ledgerMap.get(ledgerName);
    if (!ledger) return "";
    const group = groupMap.get(ledger.groupId);
    if (!group) return "";
    let current: LedgerGroup | undefined = group;
    while (current) {
      if (current.nature) return current.nature;
      if (current.parentGroup) {
        current = groupMap.get(current.parentGroup);
      } else {
        break;
      }
    }
    return group.nature;
  };

  const getGroupName = (ledgerName: string): string => {
    const ledger = ledgerMap.get(ledgerName);
    if (!ledger) return "";
    const group = groupMap.get(ledger.groupId);
    return group?.name ?? "";
  };

  const assets: ClassifiedEntry[] = [];
  const liabilities: ClassifiedEntry[] = [];

  for (const tb of tbEntries) {
    const nature = getNature(tb.ledgerName).toLowerCase();
    const groupName = getGroupName(tb.ledgerName).toLowerCase();
    const balance = tb.debitTotal - tb.creditTotal;
    const entry: ClassifiedEntry = {
      name: tb.ledgerName,
      group: getGroupName(tb.ledgerName),
      balance,
    };

    if (
      nature.includes("asset") ||
      groupName.includes("asset") ||
      groupName.includes("stock") ||
      groupName.includes("cash") ||
      groupName.includes("bank") ||
      groupName.includes("sundry debtors") ||
      groupName.includes("loans & advances (assets)")
    ) {
      assets.push(entry);
    } else if (
      nature.includes("liabilit") ||
      nature.includes("capital") ||
      groupName.includes("capital") ||
      groupName.includes("reserve") ||
      groupName.includes("loans (liabilit") ||
      groupName.includes("sundry creditors") ||
      groupName.includes("current liabilit")
    ) {
      liabilities.push(entry);
    } else if (balance > 0) {
      assets.push(entry);
    } else {
      liabilities.push(entry);
    }
  }

  const totalAssets = assets.reduce((s, e) => s + Math.abs(e.balance), 0);
  const totalLiabilities = liabilities.reduce(
    (s, e) => s + Math.abs(e.balance),
    0,
  );
  const maxRows = Math.max(assets.length, liabilities.length);

  const [aiExplain, setAiExplain] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const handleExplain = async () => {
    setAiOpen(true);
    setAiExplain("");
    setAiLoading(true);
    try {
      const text = await callOpenAI(
        `I have a Balance Sheet for ${company.name}. Total Assets: ₹${totalAssets.toLocaleString("en-IN")}, Total Liabilities: ₹${totalLiabilities.toLocaleString("en-IN")}. Please explain this balance sheet in simple terms in Hindi or English for a small business owner.`,
      );
      setAiExplain(text);
    } catch (e: any) {
      toast.error(e.message);
      setAiOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-ocid="balance_sheet.loading_state"
      >
        <span className="text-[12px] text-muted-foreground">
          Loading Balance Sheet...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4" data-ocid="balance_sheet.panel">
      {/* Header */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          data-ocid="balance_sheet.primary_button"
          onClick={handleExplain}
          className="flex items-center gap-1 text-[11px] text-teal border border-teal/40 px-2 py-1 hover:bg-teal/10"
        >
          <Sparkles size={11} /> Explain with AI
        </button>
      </div>
      {aiOpen && (
        <div className="mb-4 border border-teal/40 bg-teal/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-teal font-semibold">
              AI Explanation
            </span>
            <button
              type="button"
              onClick={() => setAiOpen(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          {aiLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-teal" />
              <span className="text-[11px] text-muted-foreground">
                Analyzing...
              </span>
            </div>
          ) : (
            <p className="text-[12px] text-foreground leading-relaxed whitespace-pre-wrap">
              {aiExplain}
            </p>
          )}
        </div>
      )}
      <div className="text-center mb-4">
        <div className="text-[15px] font-bold text-foreground">
          {company.name}
        </div>
        <div className="text-[12px] text-muted-foreground">Balance Sheet</div>
        <div className="text-[11px] text-muted-foreground">
          As at {company.financialYearEnd}
        </div>
      </div>

      <div className="border border-border">
        {/* Column Headers */}
        <div className="grid grid-cols-2 border-b border-border">
          <div className="bg-secondary px-3 py-2 border-r border-border">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Liabilities &amp; Capital
            </div>
          </div>
          <div className="bg-secondary px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Assets
            </div>
          </div>
        </div>

        {/* Sub-headers */}
        <div className="grid grid-cols-2 border-b border-border bg-secondary/40">
          <div className="grid grid-cols-[1fr_120px] border-r border-border">
            <div className="px-3 py-1 text-[10px] text-muted-foreground uppercase">
              Particulars
            </div>
            <div className="px-3 py-1 text-[10px] text-muted-foreground uppercase text-right">
              Amount (₹)
            </div>
          </div>
          <div className="grid grid-cols-[1fr_120px]">
            <div className="px-3 py-1 text-[10px] text-muted-foreground uppercase">
              Particulars
            </div>
            <div className="px-3 py-1 text-[10px] text-muted-foreground uppercase text-right">
              Amount (₹)
            </div>
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: maxRows }).map((_, i) => {
          const lib = liabilities[i];
          const ast = assets[i];
          return (
            <div
              key={lib ? lib.name : ast ? ast.name : String(i)}
              className="grid grid-cols-2 border-b border-border/40 hover:bg-secondary/30 transition-colors"
            >
              <div className="grid grid-cols-[1fr_120px] border-r border-border">
                {lib ? (
                  <>
                    <div className="px-3 py-1">
                      <div className="text-[12px] text-foreground">
                        {lib.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {lib.group}
                      </div>
                    </div>
                    <div className="px-3 py-1 text-right">
                      <span className="text-numeric text-[12px]">
                        {fmt(lib.balance)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 py-1" />
                )}
              </div>
              <div className="grid grid-cols-[1fr_120px]">
                {ast ? (
                  <>
                    <div className="px-3 py-1">
                      <div className="text-[12px] text-foreground">
                        {ast.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {ast.group}
                      </div>
                    </div>
                    <div className="px-3 py-1 text-right">
                      <span className="text-numeric text-[12px]">
                        {fmt(ast.balance)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 py-1" />
                )}
              </div>
            </div>
          );
        })}

        {/* Totals */}
        <div className="grid grid-cols-2 bg-secondary border-t-2 border-teal/50">
          <div className="grid grid-cols-[1fr_120px] border-r border-border px-3 py-2">
            <div className="text-[12px] font-bold text-foreground">Total</div>
            <div className="text-right">
              <span className="text-numeric text-[12px] font-bold">
                {fmt(totalLiabilities)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_120px] px-3 py-2">
            <div className="text-[12px] font-bold text-foreground">Total</div>
            <div className="text-right">
              <span className="text-numeric text-[12px] font-bold">
                {fmt(totalAssets)}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Check */}
        {Math.abs(totalAssets - totalLiabilities) > 0.01 && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-[11px] text-center">
            ⚠ Balance Sheet does not tally. Difference: ₹
            {fmt(Math.abs(totalAssets - totalLiabilities))}
          </div>
        )}
      </div>

      {tbEntries.length === 0 && (
        <div
          className="text-center py-8 text-muted-foreground text-[12px]"
          data-ocid="balance_sheet.empty_state"
        >
          No trial balance data available. Post some vouchers first.
        </div>
      )}
    </div>
  );
}
