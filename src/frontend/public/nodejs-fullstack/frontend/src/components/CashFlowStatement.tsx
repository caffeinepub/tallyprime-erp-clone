import type { Company, Ledger, LedgerGroup } from "../backend.d";
import {
  useGetAllLedgerGroups,
  useGetAllLedgers,
  useGetTrialBalance,
} from "../hooks/useQueries";

interface Props {
  company: Company;
}

interface CashItem {
  name: string;
  amount: number;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
}

function AmountCell({ amount }: { amount: number }) {
  return (
    <span
      className={`font-mono text-[12px] ${amount >= 0 ? "text-green-400" : "text-red-400"}`}
    >
      {amount < 0 ? "(" : ""}₹{fmt(amount)}
      {amount < 0 ? ")" : ""}
    </span>
  );
}

function Section({
  title,
  items,
  net,
}: { title: string; items: CashItem[]; net: number }) {
  return (
    <div className="mb-4">
      <div className="bg-secondary px-3 py-2 border-b border-teal/40">
        <span className="text-[12px] font-semibold text-teal uppercase tracking-wide">
          {title}
        </span>
      </div>
      {items.map((item) => (
        <div
          key={item.name}
          className="flex justify-between items-center px-3 py-1.5 border-b border-border/40 hover:bg-secondary/30 transition-colors"
        >
          <div className="text-[12px] text-foreground">{item.name}</div>
          <AmountCell amount={item.amount} />
        </div>
      ))}
      {items.length === 0 && (
        <div className="px-3 py-2 text-[11px] text-muted-foreground italic">
          No activity in this period
        </div>
      )}
      <div className="flex justify-between items-center px-3 py-2 bg-secondary/50 border-b border-border">
        <span className="text-[12px] font-semibold text-foreground">
          Net Cash from {title.split(" ").slice(-1)}
        </span>
        <AmountCell amount={net} />
      </div>
    </div>
  );
}

export default function CashFlowStatement({ company }: Props) {
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

  const getGroupName = (ledgerName: string): string => {
    const ledger = ledgerMap.get(ledgerName);
    if (!ledger) return "";
    return groupMap.get(ledger.groupId)?.name ?? "";
  };

  const getNature = (ledgerName: string): string => {
    const ledger = ledgerMap.get(ledgerName);
    if (!ledger) return "";
    const group = groupMap.get(ledger.groupId);
    let current: LedgerGroup | undefined = group;
    while (current) {
      if (current.nature) return current.nature.toLowerCase();
      if (current.parentGroup) current = groupMap.get(current.parentGroup);
      else break;
    }
    return group?.nature.toLowerCase() ?? "";
  };

  const operating: CashItem[] = [];
  const investing: CashItem[] = [];
  const financing: CashItem[] = [];

  let netProfit = 0;

  for (const tb of tbEntries) {
    const nature = getNature(tb.ledgerName);
    const groupName = getGroupName(tb.ledgerName).toLowerCase();
    const movement = tb.creditTotal - tb.debitTotal;

    if (
      nature.includes("income") ||
      nature.includes("revenue") ||
      groupName.includes("sales")
    ) {
      netProfit += movement;
    } else if (nature.includes("expense") || groupName.includes("purchase")) {
      netProfit -= Math.abs(movement);
    } else if (
      nature.includes("fixed asset") ||
      groupName.includes("fixed asset") ||
      groupName.includes("investment")
    ) {
      investing.push({ name: tb.ledgerName, amount: -movement });
    } else if (
      nature.includes("capital") ||
      groupName.includes("capital") ||
      groupName.includes("reserve") ||
      (groupName.includes("loan") && nature.includes("liabilit"))
    ) {
      financing.push({ name: tb.ledgerName, amount: movement });
    } else if (
      groupName.includes("cash") ||
      groupName.includes("bank") ||
      groupName.includes("sundry debtor") ||
      groupName.includes("sundry creditor") ||
      groupName.includes("current asset") ||
      groupName.includes("current liabilit")
    ) {
      operating.push({ name: tb.ledgerName, amount: movement });
    }
  }

  const allOperating: CashItem[] = [
    { name: "Net Profit / (Loss) for the period", amount: netProfit },
    ...operating,
  ];

  const netOperating = allOperating.reduce((s, e) => s + e.amount, 0);
  const netInvesting = investing.reduce((s, e) => s + e.amount, 0);
  const netFinancing = financing.reduce((s, e) => s + e.amount, 0);
  const totalNet = netOperating + netInvesting + netFinancing;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-ocid="cash_flow.loading_state"
      >
        <span className="text-[12px] text-muted-foreground">
          Loading Cash Flow Statement...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4" data-ocid="cash_flow.panel">
      <div className="text-center mb-4">
        <div className="text-[15px] font-bold text-foreground">
          {company.name}
        </div>
        <div className="text-[12px] text-muted-foreground">
          Cash Flow Statement
        </div>
        <div className="text-[11px] text-muted-foreground">
          For the period {company.financialYearStart} to{" "}
          {company.financialYearEnd}
        </div>
      </div>

      <div className="border border-border max-w-2xl mx-auto">
        <Section
          title="Operating Activities"
          items={allOperating}
          net={netOperating}
        />
        <Section
          title="Investing Activities"
          items={investing}
          net={netInvesting}
        />
        <Section
          title="Financing Activities"
          items={financing}
          net={netFinancing}
        />

        {/* Net Cash Flow */}
        <div
          className={`flex justify-between items-center px-4 py-3 border-t-2 border-teal/50 ${
            totalNet >= 0 ? "bg-green-500/10" : "bg-red-500/10"
          }`}
        >
          <span className="text-[13px] font-bold text-foreground">
            Net Increase / (Decrease) in Cash &amp; Cash Equivalents
          </span>
          <AmountCell amount={totalNet} />
        </div>

        <div className="px-4 py-2 text-[10px] text-muted-foreground border-t border-border/40">
          Note: Cash flow is derived from trial balance movements. For a precise
          indirect method statement, ensure all transactions are posted.
        </div>
      </div>

      {tbEntries.length === 0 && (
        <div
          className="text-center py-8 text-muted-foreground text-[12px]"
          data-ocid="cash_flow.empty_state"
        >
          No trial balance data available. Post some vouchers first.
        </div>
      )}
    </div>
  );
}
