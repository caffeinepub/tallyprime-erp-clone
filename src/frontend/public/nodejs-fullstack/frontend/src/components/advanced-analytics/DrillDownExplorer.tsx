import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface TxnRow {
  date: string;
  voucher: string;
  party: string;
  amount: number;
}

interface SubGroup {
  name: string;
  total: number;
  transactions: TxnRow[];
}

interface LedgerGroup {
  name: string;
  total: number;
  color: string;
  subGroups: SubGroup[];
}

const DATA: LedgerGroup[] = [
  {
    name: "Sales",
    total: 485000,
    color: "text-green-600",
    subGroups: [
      {
        name: "Domestic Sales",
        total: 320000,
        transactions: [
          {
            date: "2026-03-05",
            voucher: "SLS/001",
            party: "Ravi Traders",
            amount: 120000,
          },
          {
            date: "2026-03-10",
            voucher: "SLS/002",
            party: "Priya Stores",
            amount: 85000,
          },
          {
            date: "2026-03-15",
            voucher: "SLS/003",
            party: "City Electronics",
            amount: 115000,
          },
        ],
      },
      {
        name: "Export Sales",
        total: 165000,
        transactions: [
          {
            date: "2026-03-07",
            voucher: "SLS/004",
            party: "Global Trade Co",
            amount: 95000,
          },
          {
            date: "2026-03-18",
            voucher: "SLS/005",
            party: "Asia Exports Ltd",
            amount: 70000,
          },
        ],
      },
    ],
  },
  {
    name: "Purchases",
    total: 285000,
    color: "text-red-500",
    subGroups: [
      {
        name: "Raw Material",
        total: 185000,
        transactions: [
          {
            date: "2026-03-02",
            voucher: "PUR/001",
            party: "Kumar Suppliers",
            amount: 85000,
          },
          {
            date: "2026-03-12",
            voucher: "PUR/002",
            party: "Suresh Metals",
            amount: 100000,
          },
        ],
      },
      {
        name: "Trading Goods",
        total: 100000,
        transactions: [
          {
            date: "2026-03-08",
            voucher: "PUR/003",
            party: "National Traders",
            amount: 60000,
          },
          {
            date: "2026-03-20",
            voucher: "PUR/004",
            party: "Wholesale Hub",
            amount: 40000,
          },
        ],
      },
    ],
  },
  {
    name: "Expenses",
    total: 145000,
    color: "text-yellow-600",
    subGroups: [
      {
        name: "Salary & Wages",
        total: 85000,
        transactions: [
          {
            date: "2026-03-31",
            voucher: "PAY/018",
            party: "Staff Payroll",
            amount: 85000,
          },
        ],
      },
      {
        name: "Office Expenses",
        total: 35000,
        transactions: [
          {
            date: "2026-03-03",
            voucher: "PAY/012",
            party: "Office Rent",
            amount: 25000,
          },
          {
            date: "2026-03-10",
            voucher: "PAY/015",
            party: "Electricity Board",
            amount: 4200,
          },
          {
            date: "2026-03-14",
            voucher: "PAY/016",
            party: "Internet Provider",
            amount: 5800,
          },
        ],
      },
      {
        name: "Travel & Conveyance",
        total: 25000,
        transactions: [
          {
            date: "2026-03-06",
            voucher: "PAY/013",
            party: "Cab Services",
            amount: 12000,
          },
          {
            date: "2026-03-19",
            voucher: "PAY/017",
            party: "Rail Tickets",
            amount: 13000,
          },
        ],
      },
    ],
  },
  {
    name: "Assets",
    total: 520000,
    color: "text-blue-500",
    subGroups: [
      {
        name: "Fixed Assets",
        total: 450000,
        transactions: [
          {
            date: "2026-01-10",
            voucher: "AST/001",
            party: "Dell India",
            amount: 85000,
          },
          {
            date: "2026-02-05",
            voucher: "AST/002",
            party: "Voltas AC",
            amount: 65000,
          },
          {
            date: "2026-02-20",
            voucher: "AST/003",
            party: "HP Printer",
            amount: 45000,
          },
          {
            date: "2026-03-01",
            voucher: "AST/004",
            party: "Land Purchase",
            amount: 255000,
          },
        ],
      },
      {
        name: "Current Assets",
        total: 70000,
        transactions: [
          {
            date: "2026-03-31",
            voucher: "CA/001",
            party: "Closing Stock",
            amount: 70000,
          },
        ],
      },
    ],
  },
];

export default function DrillDownExplorer() {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const toggleGroup = (name: string) =>
    setExpandedGroup((prev) => (prev === name ? null : name));
  const toggleSub = (key: string) =>
    setExpandedSub((prev) => (prev === key ? null : key));

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Drill-Down Explorer
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Expand ledger groups to view sub-groups and transactions
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {DATA.map((g) => (
          <Card key={g.name}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{g.name}</p>
              <p className={`text-xl font-bold ${g.color}`}>
                ₹{(g.total / 1000).toFixed(0)}K
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Ledger Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {DATA.map((group) => (
            <div key={group.name}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-2.5 hover:bg-muted/20 border-b border-border transition-colors"
                onClick={() => toggleGroup(group.name)}
                data-ocid="drilldown.row"
              >
                <div className="flex items-center gap-2">
                  {expandedGroup === group.name ? (
                    <ChevronDown className="w-4 h-4 text-teal-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-semibold text-foreground">
                    {group.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {group.subGroups.length} sub-groups
                  </Badge>
                </div>
                <span className={`text-xs font-bold ${group.color}`}>
                  ₹{group.total.toLocaleString()}
                </span>
              </button>

              {expandedGroup === group.name &&
                group.subGroups.map((sub) => {
                  const subKey = `${group.name}.${sub.name}`;
                  return (
                    <div key={sub.name}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-8 py-2 hover:bg-muted/10 border-b border-border/50 bg-muted/5 transition-colors"
                        onClick={() => toggleSub(subKey)}
                        data-ocid="drilldown.row"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSub === subKey ? (
                            <ChevronDown className="w-3 h-3 text-teal-500" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span className="text-xs text-foreground">
                            {sub.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {sub.transactions.length} txns
                          </Badge>
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          ₹{sub.total.toLocaleString()}
                        </span>
                      </button>

                      {expandedSub === subKey && (
                        <div className="bg-muted/10">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-muted/20">
                                <th className="px-10 py-1.5 text-left font-medium text-muted-foreground">
                                  Date
                                </th>
                                <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                                  Voucher
                                </th>
                                <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                                  Party
                                </th>
                                <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">
                                  Amount (₹)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {sub.transactions.map((t, ti) => (
                                <tr
                                  key={t.voucher}
                                  className="border-b border-border/30"
                                  data-ocid={`drilldown.item.${ti + 1}`}
                                >
                                  <td className="px-10 py-1.5 text-muted-foreground">
                                    {t.date}
                                  </td>
                                  <td className="px-3 py-1.5 font-mono text-teal-500">
                                    {t.voucher}
                                  </td>
                                  <td className="px-3 py-1.5 text-foreground">
                                    {t.party}
                                  </td>
                                  <td className="px-3 py-1.5 text-right font-medium text-foreground">
                                    {t.amount.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
