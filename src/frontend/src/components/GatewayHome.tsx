import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Database,
  FileText,
  Layers,
  Receipt,
  Settings,
  Shield,
  TrendingUp,
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
    bg: "bg-blue-500/10",
    items: ["Ledgers", "Groups", "HSN / SAC Codes"],
    view: "ledgers",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: Receipt,
    shortcut: "F4",
    color: "text-green-400",
    bg: "bg-green-500/10",
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
    bg: "bg-amber-500/10",
    items: ["Trial Balance", "Day Book", "Balance Sheet", "P&L A/c"],
    view: "trialBalance",
  },
  {
    id: "gstCompliance",
    label: "GST Compliance",
    icon: Shield,
    shortcut: "F6",
    color: "text-teal",
    bg: "bg-teal/10",
    items: ["HSN Master", "GSTR-1", "GSTR-3B", "Tax Ledgers", "GST Settings"],
    view: "hsnMaster",
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: Settings,
    shortcut: "F7",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    items: ["Import Data", "Banking"],
    view: "gateway",
  },
];

const mobileQuickActions = [
  {
    label: "New Voucher",
    icon: FileText,
    view: "voucher",
    color: "bg-teal/20 text-teal",
  },
  {
    label: "Reports",
    icon: BarChart3,
    view: "trialBalance",
    color: "bg-amber-500/20 text-amber-500",
  },
  {
    label: "GST",
    icon: Shield,
    view: "hsnMaster",
    color: "bg-green-500/20 text-green-500",
  },
  {
    label: "Alerts",
    icon: AlertCircle,
    view: "smartAlerts",
    color: "bg-red-500/20 text-red-400",
  },
];

export default function GatewayHome({ company, onNavigate }: Props) {
  return (
    <div className="p-3 md:p-6 h-full overflow-auto">
      {/* Company Header */}
      <div className="mb-4 md:mb-6">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
          Gateway of HisabKitab
        </div>
        <h2 className="text-[18px] md:text-[20px] font-bold text-foreground leading-tight">
          {company.name}
        </h2>
        <p className="text-[11px] md:text-[12px] text-muted-foreground mt-0.5">
          FY: {company.financialYearStart} to {company.financialYearEnd}
          {company.gstin && ` | GSTIN: ${company.gstin}`}
        </p>
      </div>

      {/* Mobile Quick Actions — lg:hidden */}
      <div className="lg:hidden mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Quick Actions
        </div>
        <div className="grid grid-cols-4 gap-2">
          {mobileQuickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.view}
                type="button"
                onClick={() => onNavigate(action.view)}
                data-ocid={`gateway.mobile_quick.${action.view}.button`}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md active:scale-95 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-semibold text-foreground text-center leading-tight">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              type="button"
              key={tile.id}
              data-ocid={`gateway.${tile.id}.card`}
              className="bg-card border border-border hover:border-teal/50 cursor-pointer group transition-all text-left rounded-sm hover:shadow-md"
              onClick={() => onNavigate(tile.view)}
            >
              <div
                className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 border-b border-border/60 ${tile.bg}`}
              >
                <Icon size={16} className={tile.color} />
                <span className="text-[13px] md:text-[14px] font-semibold text-foreground">
                  {tile.label}
                </span>
                <span className="ml-auto tally-key-badge hidden sm:inline-flex">
                  {tile.shortcut}
                </span>
              </div>
              <div className="px-3 md:px-4 py-2.5 md:py-3">
                <div className="flex flex-col gap-1">
                  {tile.items.map((item) => (
                    <div
                      key={item}
                      className="text-[11px] md:text-[12px] text-muted-foreground flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-border inline-block flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Navigation */}
      <div className="mt-4 md:mt-6">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 md:mb-3">
          Quick Navigation
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
            { label: "GSTR-3B", view: "gstr3b", icon: TrendingUp, key: "G3" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.view}
                data-ocid={`gateway.${item.view}.button`}
                onClick={() => onNavigate(item.view)}
                className="flex flex-col items-center gap-1 md:gap-1.5 p-2 md:p-3 bg-card border border-border hover:border-teal/50 hover:bg-secondary/50 transition-all rounded-sm"
              >
                <Icon size={16} className="text-teal" />
                <span className="text-[10px] md:text-[11px] text-foreground font-medium text-center leading-tight">
                  {item.label}
                </span>
                <span className="tally-key-badge hidden sm:inline-flex">
                  {item.key}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
