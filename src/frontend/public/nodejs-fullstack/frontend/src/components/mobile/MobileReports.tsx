import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const REPORTS = [
  {
    key: "pl",
    label: "P&L Summary",
    value: "₹2,34,500",
    subtitle: "Net Profit — Mar 2026",
    detail: [
      { label: "Revenue", value: "₹8,50,000", pct: 100 },
      { label: "COGS", value: "₹4,20,000", pct: 49 },
      { label: "Expenses", value: "₹1,95,500", pct: 23 },
      { label: "Net Profit", value: "₹2,34,500", pct: 28 },
    ],
  },
  {
    key: "cash",
    label: "Cash Position",
    value: "₹1,12,800",
    subtitle: "Available Cash — Today",
    detail: [
      { label: "Opening", value: "₹95,000", pct: 84 },
      { label: "Inflow", value: "₹85,000", pct: 75 },
      { label: "Outflow", value: "₹67,200", pct: 60 },
      { label: "Balance", value: "₹1,12,800", pct: 100 },
    ],
  },
  {
    key: "gst",
    label: "GST Due",
    value: "₹38,250",
    subtitle: "GSTR-3B Due — 20 Apr",
    detail: [
      { label: "Output CGST", value: "₹12,500", pct: 33 },
      { label: "Output SGST", value: "₹12,500", pct: 33 },
      { label: "Input Credit", value: "₹-13,250", pct: 35 },
      { label: "Net Payable", value: "₹38,250", pct: 100 },
    ],
  },
  {
    key: "customers",
    label: "Top 5 Customers",
    value: "₹4,85,000",
    subtitle: "Total from Top 5",
    detail: [
      { label: "Meera Textiles", value: "₹1,80,000", pct: 37 },
      { label: "Star Electronics", value: "₹95,000", pct: 20 },
      { label: "Patel Stores", value: "₹87,000", pct: 18 },
      { label: "Om Traders", value: "₹75,000", pct: 15 },
      { label: "Sunrise Retail", value: "₹48,000", pct: 10 },
    ],
  },
];

export default function MobileReports() {
  return (
    <div className="p-4 space-y-4" data-ocid="mobile.reports.section">
      <h2 className="text-sm font-bold text-foreground">Mobile Reports</h2>
      <Tabs defaultValue="pl">
        <TabsList className="h-8 grid grid-cols-4 w-full">
          {REPORTS.map((r) => (
            <TabsTrigger
              key={r.key}
              value={r.key}
              className="text-[10px] px-1"
              data-ocid={`mobile.reports.${r.key}.tab`}
            >
              {r.label.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>
        {REPORTS.map((r) => (
          <TabsContent key={r.key} value={r.key} className="mt-3">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-xs text-muted-foreground">
                  {r.label}
                </CardTitle>
                <div className="text-2xl font-bold text-foreground">
                  {r.value}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {r.subtitle}
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {r.detail.map((d) => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs">{d.label}</span>
                      <span className="text-xs font-semibold">{d.value}</span>
                    </div>
                    <div className="bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-teal"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
