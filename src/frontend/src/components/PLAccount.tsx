import type { Company, Ledger, LedgerGroup } from "../backend.d";
import {
  useGetAllLedgerGroups,
  useGetAllLedgers,
  useGetTrialBalance,
} from "../hooks/useQueries";

interface Props {
  company: Company;
}

interface PLEntry {
  name: string;
  group: string;
  amount: number;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
}

export default function PLAccount({ company }: Props) {
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
      } else break;
    }
    return group.nature;
  };

  const getGroupName = (ledgerName: string): string => {
    const ledger = ledgerMap.get(ledgerName);
    if (!ledger) return "";
    return groupMap.get(ledger.groupId)?.name ?? "";
  };

  const income: PLEntry[] = [];
  const directExpenses: PLEntry[] = [];
  const indirectExpenses: PLEntry[] = [];

  for (const tb of tbEntries) {
    const nature = getNature(tb.ledgerName).toLowerCase();
    const groupName = getGroupName(tb.ledgerName).toLowerCase();
    const balance = tb.creditTotal - tb.debitTotal;
    const entry: PLEntry = {
      name: tb.ledgerName,
      group: getGroupName(tb.ledgerName),
      amount: balance,
    };

    if (
      nature.includes("income") ||
      nature.includes("revenue") ||
      groupName.includes("sales") ||
      groupName.includes("income") ||
      groupName.includes("revenue")
    ) {
      income.push(entry);
    } else if (
      nature.includes("direct expense") ||
      groupName.includes("direct expense") ||
      groupName.includes("purchase") ||
      groupName.includes("opening stock")
    ) {
      directExpenses.push({ ...entry, amount: tb.debitTotal - tb.creditTotal });
    } else if (
      nature.includes("indirect expense") ||
      nature.includes("expense") ||
      groupName.includes("indirect expense") ||
      groupName.includes("expense")
    ) {
      indirectExpenses.push({
        ...entry,
        amount: tb.debitTotal - tb.creditTotal,
      });
    }
  }

  const totalIncome = income.reduce((s, e) => s + e.amount, 0);
  const totalDirectExp = directExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIndirectExp = indirectExpenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalIncome - totalDirectExp;
  const netProfit = grossProfit - totalIndirectExp;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-ocid="pl_account.loading_state"
      >
        <span className="text-[12px] text-muted-foreground">
          Loading P&amp;L Account...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4" data-ocid="pl_account.panel">
      <div className="text-center mb-4">
        <div className="text-[15px] font-bold text-foreground">
          {company.name}
        </div>
        <div className="text-[12px] text-muted-foreground">
          Profit &amp; Loss Account
        </div>
        <div className="text-[11px] text-muted-foreground">
          For the period {company.financialYearStart} to{" "}
          {company.financialYearEnd}
        </div>
      </div>

      <div className="border border-border">
        {/* Headers */}
        <div className="grid grid-cols-2 border-b border-border">
          <div className="bg-secondary px-3 py-2 border-r border-border">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Expenditure (Dr)
            </div>
          </div>
          <div className="bg-secondary px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Income (Cr)
            </div>
          </div>
        </div>

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

        {/* Direct Expenses Section Header */}
        {directExpenses.length > 0 && (
          <div className="grid grid-cols-2 bg-secondary/20 border-b border-border/40">
            <div className="px-3 py-1 border-r border-border">
              <span className="text-[10px] font-semibold text-teal uppercase">
                Direct Expenses
              </span>
            </div>
            <div className="border-b-0" />
          </div>
        )}

        {/* Direct Expense Rows */}
        {directExpenses.map((exp, i) => (
          <div
            key={exp.name}
            className="grid grid-cols-2 border-b border-border/40 hover:bg-secondary/30"
          >
            <div className="grid grid-cols-[1fr_120px] border-r border-border">
              <div className="px-3 py-1">
                <div className="text-[12px] text-foreground">{exp.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {exp.group}
                </div>
              </div>
              <div className="px-3 py-1 text-right">
                <span className="text-numeric text-[12px]">
                  {fmt(exp.amount)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_120px]">
              {income[i] ? (
                <>
                  <div className="px-3 py-1">
                    <div className="text-[12px] text-foreground">
                      {income[i].name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {income[i].group}
                    </div>
                  </div>
                  <div className="px-3 py-1 text-right">
                    <span className="text-numeric text-[12px]">
                      {fmt(income[i].amount)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="col-span-2" />
              )}
            </div>
          </div>
        ))}

        {/* Gross Profit row */}
        <div className="grid grid-cols-2 bg-secondary/30 border-b border-border">
          <div className="grid grid-cols-[1fr_120px] border-r border-border px-3 py-1.5">
            <div className="text-[12px] font-semibold text-foreground">
              Gross Profit c/d
            </div>
            <div className="text-right">
              <span
                className={`text-[12px] font-semibold ${grossProfit >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {fmt(grossProfit)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_120px] px-3 py-1.5">
            <div className="text-[12px] text-muted-foreground">
              Total Sales / Revenue
            </div>
            <div className="text-right">
              <span className="text-numeric text-[12px] font-semibold">
                {fmt(totalIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Indirect Expenses Section */}
        {indirectExpenses.length > 0 && (
          <div className="grid grid-cols-2 bg-secondary/20 border-b border-border/40">
            <div className="px-3 py-1 border-r border-border">
              <span className="text-[10px] font-semibold text-teal uppercase">
                Indirect Expenses
              </span>
            </div>
            <div className="px-3 py-1">
              <span className="text-[10px] font-semibold text-teal uppercase">
                Gross Profit b/d
              </span>
            </div>
          </div>
        )}

        {/* Indirect expense rows */}
        {indirectExpenses.map((exp, i) => (
          <div
            key={exp.name}
            className="grid grid-cols-2 border-b border-border/40 hover:bg-secondary/30"
          >
            <div className="grid grid-cols-[1fr_120px] border-r border-border">
              <div className="px-3 py-1">
                <div className="text-[12px] text-foreground">{exp.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {exp.group}
                </div>
              </div>
              <div className="px-3 py-1 text-right">
                <span className="text-numeric text-[12px]">
                  {fmt(exp.amount)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_120px]">
              {i === 0 ? (
                <>
                  <div className="px-3 py-1 text-[12px] text-foreground">
                    Gross Profit b/d
                  </div>
                  <div className="px-3 py-1 text-right">
                    <span
                      className={`text-[12px] ${grossProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {fmt(grossProfit)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="col-span-2" />
              )}
            </div>
          </div>
        ))}

        {/* Net Profit/Loss */}
        <div className="grid grid-cols-2 bg-secondary border-t-2 border-teal/50">
          <div className="grid grid-cols-[1fr_120px] border-r border-border px-3 py-2">
            <div
              className={`text-[12px] font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {netProfit >= 0 ? "Net Profit" : "Net Loss"}
            </div>
            <div className="text-right">
              <span
                className={`text-[12px] font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {fmt(netProfit)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_120px] px-3 py-2">
            <div className="text-[12px] font-bold text-foreground">Total</div>
            <div className="text-right">
              <span className="text-numeric text-[12px] font-bold">
                {fmt(totalIncome + (grossProfit < 0 ? 0 : grossProfit))}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`px-4 py-2 text-center text-[11px] font-semibold ${
            netProfit >= 0
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {netProfit >= 0
            ? `Net Profit for the period: ₹${fmt(netProfit)}`
            : `Net Loss for the period: ₹${fmt(netProfit)}`}
        </div>
      </div>

      {tbEntries.length === 0 && (
        <div
          className="text-center py-8 text-muted-foreground text-[12px]"
          data-ocid="pl_account.empty_state"
        >
          No data available. Post income and expense vouchers first.
        </div>
      )}
    </div>
  );
}
