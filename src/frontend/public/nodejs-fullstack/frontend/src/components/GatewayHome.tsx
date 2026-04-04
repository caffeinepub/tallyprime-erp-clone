import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  CheckSquare,
  CreditCard,
  Database,
  DollarSign,
  FileText,
  Globe,
  Landmark,
  Layers,
  PieChart,
  Receipt,
  Shield,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type { Company } from "../backend.d";

interface Props {
  company: Company;
  onNavigate: (view: string) => void;
}

const TILES = [
  {
    id: "masters",
    label: "Masters",
    icon: Database,
    shortcut: "F1",
    accentClass: "from-indigo-500/80 to-violet-500/80",
    dotColor: "bg-indigo-400",
    iconColor: "text-indigo-400",
    bgGlow: "hover:shadow-indigo-500/10",
    chips: [
      { label: "Create Ledger", view: "ledgers" },
      { label: "Alter Ledger", view: "ledgers" },
      { label: "Chart of Accounts", view: "ledgers" },
      { label: "HSN Master", view: "hsnMaster" },
      { label: "Cost Centres", view: "costCentreMaster" },
    ],
  },
  {
    id: "entries",
    label: "Transactions (Entries)",
    icon: Receipt,
    shortcut: "F4–F9",
    accentClass: "from-emerald-500/80 to-green-500/80",
    dotColor: "bg-emerald-400",
    iconColor: "text-emerald-400",
    bgGlow: "hover:shadow-emerald-500/10",
    chips: [
      { label: "Sales Entry", view: "voucherSales" },
      { label: "Purchase Entry", view: "voucherPurchase" },
      { label: "Payment Entry", view: "voucherPayment" },
      { label: "Receipt Entry", view: "voucherReceipt" },
      { label: "Journal Entry", view: "voucher" },
    ],
  },
  {
    id: "gst",
    label: "GST Compliance",
    icon: Shield,
    shortcut: "Ctrl+G",
    accentClass: "from-teal-500/80 to-cyan-500/80",
    dotColor: "bg-teal-400",
    iconColor: "text-teal-400",
    bgGlow: "hover:shadow-teal-500/10",
    chips: [
      { label: "GSTR-1", view: "gstr1" },
      { label: "GSTR-3B", view: "gstr3b" },
      { label: "GST Filing", view: "gstFiling" },
      { label: "e-Way Bill", view: "ewayBill" },
      { label: "E-Invoice", view: "einvoice" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    shortcut: "Ctrl+T",
    accentClass: "from-amber-500/80 to-orange-500/80",
    dotColor: "bg-amber-400",
    iconColor: "text-amber-400",
    bgGlow: "hover:shadow-amber-500/10",
    chips: [
      { label: "Trial Balance", view: "trialBalance" },
      { label: "Balance Sheet", view: "balanceSheet" },
      { label: "P&L A/c", view: "profitLoss" },
      { label: "Day Book", view: "dayBook" },
      { label: "Cash Flow", view: "cashFlow" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Layers,
    shortcut: "Ctrl+I",
    accentClass: "from-violet-500/80 to-purple-500/80",
    dotColor: "bg-violet-400",
    iconColor: "text-violet-400",
    bgGlow: "hover:shadow-violet-500/10",
    chips: [
      { label: "Stock Items", view: "stockItems" },
      { label: "Stock Summary", view: "stockSummary" },
      { label: "Stock Ledger", view: "stockMovement" },
      { label: "POS Terminal", view: "posTerminal" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Insights",
    icon: TrendingUp,
    shortcut: "Ctrl+B",
    accentClass: "from-rose-500/80 to-pink-500/80",
    dotColor: "bg-rose-400",
    iconColor: "text-rose-400",
    bgGlow: "hover:shadow-rose-500/10",
    chips: [
      { label: "Business Insights", view: "analyticsDashboard" },
      { label: "Premium Dashboard", view: "advancedAnalytics" },
      { label: "Cash Flow Forecast", view: "cashFlowForecast" },
      { label: "Smart Alerts", view: "smartAlerts" },
    ],
  },
];

const QUICK_NAV = [
  { label: "HR & People", view: "hrDashboard", icon: Users },
  { label: "Payroll", view: "payrollRegister", icon: DollarSign },
  { label: "Banking", view: "bankReconciliation", icon: Landmark },
  { label: "Fixed Assets", view: "fixedAssetMaster", icon: Building2 },
  { label: "CRM", view: "crmLeads", icon: Target },
  { label: "Compliance", view: "complianceDashboard", icon: CheckSquare },
  { label: "Budgeting", view: "budgetMaster", icon: Calculator },
  { label: "Projects", view: "projectDashboard", icon: Briefcase },
  { label: "E-Commerce", view: "ecommerceDashboard", icon: Globe },
  { label: "Service Mgmt", view: "serviceOrders", icon: Zap },
  { label: "Subscriptions", view: "recurringTemplates", icon: CreditCard },
  { label: "Multi-Branch", view: "branchMaster", icon: Star },
];

const MOBILE_QUICK = [
  {
    label: "New Entry",
    view: "voucher",
    icon: FileText,
    color: "bg-emerald-500/15 text-emerald-400",
  },
  {
    label: "Sales",
    view: "voucherSales",
    icon: ShoppingCart,
    color: "bg-indigo-500/15 text-indigo-400",
  },
  {
    label: "Reports",
    view: "trialBalance",
    icon: BarChart3,
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    label: "GST",
    view: "gstr1",
    icon: Shield,
    color: "bg-teal-500/15 text-teal-400",
  },
  {
    label: "Inventory",
    view: "stockSummary",
    icon: Layers,
    color: "bg-violet-500/15 text-violet-400",
  },
  {
    label: "Banking",
    view: "bankReconciliation",
    icon: Landmark,
    color: "bg-blue-500/15 text-blue-400",
  },
  {
    label: "Analytics",
    view: "analyticsDashboard",
    icon: PieChart,
    color: "bg-rose-500/15 text-rose-400",
  },
  {
    label: "Alerts",
    view: "smartAlerts",
    icon: AlertCircle,
    color: "bg-red-500/15 text-red-400",
  },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function GatewayHome({ company, onNavigate }: Props) {
  const username =
    localStorage.getItem("hisabkitab_last_user") ||
    localStorage.getItem("hk_username") ||
    "Admin";

  const fyStart = company.financialYearStart
    ? new Date(company.financialYearStart).getFullYear()
    : "";
  const fyEnd = company.financialYearEnd
    ? new Date(company.financialYearEnd).getFullYear()
    : "";

  return (
    <div className="p-3 md:p-5 h-full overflow-auto">
      {/* ── Vitals Row ────────────────────────────────────────────── */}
      <div className="mb-5">
        {/* Welcome line */}
        <div className="text-[11px] text-muted-foreground mb-1 font-medium">
          {getGreeting()},{" "}
          <span className="text-primary font-semibold capitalize">
            {username}
          </span>
        </div>

        {/* Company heading + details row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
          <div>
            <h2 className="hk-heading text-foreground flex items-center gap-2">
              <Building2 size={16} className="text-primary flex-shrink-0" />
              {company.name}
            </h2>
            <p className="hk-caption mt-0.5">
              FY {fyStart}–{fyEnd}
              {company.gstin && (
                <>
                  {" "}
                  &nbsp;·&nbsp;{" "}
                  <span className="font-mono text-[10.5px]">
                    {company.gstin}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Stat pills row */}
          <div className="flex flex-wrap gap-2 items-center">
            {[
              {
                icon: Receipt,
                label: "Entries",
                view: "voucher",
                color: "text-emerald-400",
              },
              {
                icon: TrendingUp,
                label: "P&L",
                view: "profitLoss",
                color: "text-amber-400",
              },
              {
                icon: Shield,
                label: "GST",
                view: "gstr1",
                color: "text-teal-400",
              },
              {
                icon: Layers,
                label: "Stock",
                view: "stockSummary",
                color: "text-violet-400",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.view}
                  type="button"
                  onClick={() => onNavigate(s.view)}
                  data-ocid={`gateway.vitals.${s.label.toLowerCase()}.button`}
                  className="hk-stat-card flex-row gap-2 items-center py-2 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <Icon size={13} className={s.color} />
                  <span className="text-[11px] font-medium text-foreground">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile Quick Actions (lg:hidden) ────────────────────── */}
      <div className="lg:hidden mb-5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Quick Actions
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MOBILE_QUICK.map((action) => {
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${action.color}`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-[9.5px] font-semibold text-foreground text-center leading-tight px-1">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Tiles Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.id}
              data-ocid={`gateway.${tile.id}.card`}
              className={`bg-card border border-border rounded-md overflow-hidden group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${tile.bgGlow} hover:border-border/80 cursor-pointer`}
            >
              {/* Colored accent bar */}
              <div
                className={`h-[4px] w-full bg-gradient-to-r ${tile.accentClass} group-hover:opacity-100 opacity-90 transition-opacity`}
              />

              {/* Header row */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border/50">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-secondary/60">
                  <Icon size={14} className={tile.iconColor} />
                </div>
                <span className="hk-subheading text-foreground flex-1">
                  {tile.label}
                </span>
                <span className="hk-key-badge flex-shrink-0">
                  {tile.shortcut}
                </span>
              </div>

              {/* Chips */}
              <div className="px-4 py-3 flex flex-wrap gap-1.5">
                {tile.chips.map((chip) => (
                  <button
                    type="button"
                    key={`${tile.id}-${chip.label}`}
                    onClick={() => onNavigate(chip.view)}
                    data-ocid={`gateway.${tile.id}.${chip.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}.button`}
                    className="hk-tile-chip"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${tile.dotColor} opacity-70 flex-shrink-0`}
                    />
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Navigation ─────────────────────────────────────── */}
      <div className="mt-5">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-2">
          <Zap size={11} className="text-primary" />
          Quick Navigation
        </div>
        <div
          className="flex flex-nowrap gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {QUICK_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.view}
                onClick={() => onNavigate(item.view)}
                data-ocid={`gateway.quicknav.${item.view}.button`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:border-primary/40 hover:bg-secondary/60 transition-all rounded-sm flex-shrink-0 text-[11px] text-muted-foreground hover:text-foreground whitespace-nowrap"
              >
                <Icon size={11} className="text-primary opacity-70" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop-only additional shortcuts info ───────────────── */}
      <div className="hidden lg:flex mt-4 items-center gap-4 text-[10px] text-muted-foreground/60 border-t border-border/30 pt-3">
        <span className="font-medium text-muted-foreground/80">
          Quick keys:
        </span>
        {[
          ["Ctrl+B", "Balance Sheet"],
          ["Ctrl+T", "Trial Balance"],
          ["Ctrl+D", "Day Book"],
          ["Ctrl+G", "GSTR-1"],
          ["Ctrl+I", "Inventory"],
          ["Alt+D", "Go To"],
          ["F8", "Sales Entry"],
          ["F9", "Purchase"],
        ].map(([key, desc]) => (
          <span key={key} className="flex items-center gap-1">
            <span className="hk-key-badge opacity-70">{key}</span>
            <span>{desc}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
