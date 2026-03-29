import {
  BarChart3,
  BookOpen,
  Database,
  FileText,
  Layers,
  Receipt,
  Settings,
  Shield,
} from "lucide-react";
import type { Company } from "../backend.d";

interface Props {
  company: Company;
  onNavigate: (view: string) => void;
}

const tiles = [
  {
    id: "masters",
    label: "Masters",
    icon: Database,
    shortcut: "F1",
    color: "text-blue-400",
    items: ["Ledgers", "Groups", "HSN / SAC Codes"],
    view: "ledgers",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: Receipt,
    shortcut: "F4",
    color: "text-green-400",
    items: [
      "Payment",
      "Receipt",
      "Journal",
      "Contra",
      "Sales",
      "Purchase",
      "GST Sales/Purchase",
    ],
    view: "voucher",
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    shortcut: "F5",
    color: "text-amber-400",
    items: ["Trial Balance", "Day Book", "Balance Sheet", "P&L A/c"],
    view: "trialBalance",
  },
  {
    id: "gstCompliance",
    label: "GST Compliance",
    icon: Shield,
    shortcut: "F6",
    color: "text-teal",
    items: ["HSN Master", "GSTR-1", "GSTR-3B", "Tax Ledgers", "GST Settings"],
    view: "hsnMaster",
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: Settings,
    shortcut: "F7",
    color: "text-purple-400",
    items: ["Import Data", "Banking"],
    view: "gateway",
  },
];

export default function GatewayHome({ company, onNavigate }: Props) {
  return (
    <div className="p-6 h-full overflow-auto">
      {/* Company Header */}
      <div className="mb-6">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
          Gateway of HisabKitab
        </div>
        <h2 className="text-[20px] font-bold text-foreground">
          {company.name}
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          FY: {company.financialYearStart} to {company.financialYearEnd}
          {company.gstin && ` | GSTIN: ${company.gstin}`}
        </p>
      </div>

      {/* Main Tiles */}
      <div className="grid grid-cols-3 gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              type="button"
              key={tile.id}
              data-ocid={`gateway.${tile.id}.card`}
              className="bg-card border border-border hover:border-teal/50 cursor-pointer group transition-all text-left"
              onClick={() => onNavigate(tile.view)}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-secondary/30">
                <Icon size={16} className={tile.color} />
                <span className="text-[13px] font-semibold text-foreground">
                  {tile.label}
                </span>
                <span className="ml-auto tally-key-badge">{tile.shortcut}</span>
              </div>
              <div className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  {tile.items.map((item) => (
                    <div
                      key={item}
                      className="text-[12px] text-muted-foreground flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-border inline-block" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Quick Navigation
        </div>
        <div className="grid grid-cols-6 gap-2">
          {[
            { label: "Day Book", view: "dayBook", icon: BookOpen, key: "F7" },
            {
              label: "Trial Balance",
              view: "trialBalance",
              icon: BarChart3,
              key: "F8",
            },
            {
              label: "Voucher Entry",
              view: "voucher",
              icon: FileText,
              key: "F9",
            },
            { label: "Ledgers", view: "ledgers", icon: Layers, key: "F1" },
            { label: "GSTR-1", view: "gstr1", icon: Shield, key: "G1" },
            { label: "GSTR-3B", view: "gstr3b", icon: Shield, key: "G3" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.view}
                data-ocid={`gateway.${item.view}.button`}
                onClick={() => onNavigate(item.view)}
                className="flex flex-col items-center gap-1.5 p-3 bg-card border border-border hover:border-teal/50 hover:bg-secondary/50 transition-all"
              >
                <Icon size={18} className="text-teal" />
                <span className="text-[11px] text-foreground font-medium">
                  {item.label}
                </span>
                <span className="tally-key-badge">{item.key}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
