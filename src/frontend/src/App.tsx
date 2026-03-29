import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  BookOpen,
  Building2,
  Database,
  FileText,
  Landmark,
  Layers,
  LayoutDashboard,
  LogOut,
  Moon,
  Receipt,
  Settings,
  Shield,
  Sun,
  TrendingUp,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Company } from "./backend.d";
import BalanceSheet from "./components/BalanceSheet";
import CashFlowStatement from "./components/CashFlowStatement";
import CompanySelection from "./components/CompanySelection";
import DayBook from "./components/DayBook";
import GSTR1Report from "./components/GSTR1Report";
import GSTR3BReport from "./components/GSTR3BReport";
import GSTSettings from "./components/GSTSettings";
import GSTVoucherEntry from "./components/GSTVoucherEntry";
import GatewayHome from "./components/GatewayHome";
import HSNMaster from "./components/HSNMaster";
import LedgerList from "./components/LedgerList";
import PLAccount from "./components/PLAccount";
import StockGroups from "./components/StockGroups";
import StockItems from "./components/StockItems";
import StockLedger from "./components/StockLedger";
import StockSummary from "./components/StockSummary";
import StockVoucherEntry from "./components/StockVoucherEntry";
import TaxLedgers from "./components/TaxLedgers";
import TrialBalance from "./components/TrialBalance";
import VoucherEntry from "./components/VoucherEntry";

type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }> | null;
  fkey: string | null;
  isHeader?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    key: "gateway",
    label: "Gateway of Tally",
    icon: LayoutDashboard,
    fkey: null,
  },
  { key: "gateway", label: "Dashboard", icon: LayoutDashboard, fkey: null },
  {
    key: "__header_masters",
    label: "Masters",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "ledgers", label: "Create Ledger", icon: Database, fkey: "F1" },
  { key: "ledgers", label: "Alter Ledger", icon: Layers, fkey: "F2" },
  { key: "ledgers", label: "Chart of Accounts", icon: FileText, fkey: "F3" },
  {
    key: "__header_transactions",
    label: "Transactions",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "voucherContra", label: "Contra", icon: Receipt, fkey: "F4" },
  { key: "voucherPayment", label: "Payment", icon: Receipt, fkey: "F5" },
  { key: "voucherReceipt", label: "Receipt", icon: Receipt, fkey: "F6" },
  { key: "voucher", label: "Journal", icon: Receipt, fkey: "F7" },
  { key: "voucherSales", label: "Sales", icon: Receipt, fkey: "F8" },
  { key: "voucherPurchase", label: "Purchase", icon: Receipt, fkey: "F9" },
  { key: "gstVoucher", label: "GST Sales/Purchase", icon: Receipt, fkey: null },
  {
    key: "__header_gst",
    label: "GST Compliance",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "hsnMaster", label: "HSN Master", icon: Shield, fkey: null },
  { key: "gstr1", label: "GSTR-1", icon: Shield, fkey: null },
  { key: "gstr3b", label: "GSTR-3B", icon: Shield, fkey: null },
  { key: "taxLedgers", label: "Tax Ledgers", icon: Shield, fkey: null },
  { key: "gstSettings", label: "GST Settings", icon: Shield, fkey: null },
  {
    key: "__header_inventory",
    label: "Inventory",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "stockGroups", label: "Stock Groups", icon: Layers, fkey: null },
  { key: "stockItems", label: "Stock Items", icon: Database, fkey: null },
  { key: "stockReceipt", label: "Stock Receipt", icon: Receipt, fkey: null },
  { key: "stockIssue", label: "Stock Issue", icon: Receipt, fkey: null },
  { key: "stockTransfer", label: "Stock Transfer", icon: Receipt, fkey: null },
  {
    key: "__header_inv_reports",
    label: "Inventory Reports",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "stockSummary", label: "Stock Summary", icon: BarChart3, fkey: null },
  { key: "stockLedger", label: "Stock Ledger", icon: BookOpen, fkey: null },
  {
    key: "__header_utilities",
    label: "Utilities",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "gateway", label: "Import", icon: null, fkey: null },
  { key: "gateway", label: "Banking", icon: Landmark, fkey: null },
  {
    key: "__header_reports",
    label: "Reports",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "balanceSheet", label: "Balance Sheet", icon: BarChart3, fkey: null },
  { key: "plAccount", label: "P&L A/c", icon: TrendingUp, fkey: null },
  { key: "cashFlow", label: "Cash Flow", icon: BarChart3, fkey: null },
  { key: "trialBalance", label: "Trial Balance", icon: BarChart3, fkey: null },
  { key: "dayBook", label: "Day Book", icon: BookOpen, fkey: null },
];

const VOUCHER_TYPE_MAP: Record<string, string> = {
  voucherContra: "Contra",
  voucherPayment: "Payment",
  voucherReceipt: "Receipt",
  voucher: "Journal",
  voucherSales: "Sales",
  voucherPurchase: "Purchase",
};

const VIEW_LABELS: Record<string, string> = {
  gateway: "Gateway of Tally",
  ledgers: "List of Ledgers",
  voucher: "Voucher Entry",
  voucherContra: "Contra Voucher",
  voucherPayment: "Payment Voucher",
  voucherReceipt: "Receipt Voucher",
  voucherSales: "Sales Voucher",
  voucherPurchase: "Purchase Voucher",
  trialBalance: "Trial Balance",
  dayBook: "Day Book",
  hsnMaster: "HSN / SAC Master",
  gstr1: "GSTR-1 Return",
  gstr3b: "GSTR-3B Return",
  taxLedgers: "Tax Ledger Balances",
  gstSettings: "GST Settings",
  gstVoucher: "GST Voucher Entry",
  balanceSheet: "Balance Sheet",
  plAccount: "Profit & Loss Account",
  cashFlow: "Cash Flow Statement",
  stockGroups: "Stock Groups",
  stockItems: "Stock Items",
  stockReceipt: "Stock Receipt",
  stockIssue: "Stock Issue",
  stockTransfer: "Stock Transfer",
  stockSummary: "Stock Summary",
  stockLedger: "Stock Ledger",
};

function ThemeToggle({
  theme,
  onToggle,
}: { theme: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      data-ocid="app.theme.toggle"
      onClick={onToggle}
      className="w-8 h-8 rounded-sm bg-secondary/50 border border-border/60 flex items-center justify-center hover:bg-secondary transition-colors"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun size={14} className="text-teal" />
      ) : (
        <Moon size={14} className="text-teal" />
      )}
    </button>
  );
}

function UserProfileDropdown({
  activeCompany,
  theme,
  onToggleTheme,
  onNavigate,
}: {
  activeCompany: Company | null;
  theme: string;
  onToggleTheme: () => void;
  onNavigate: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        data-ocid="app.user_profile.open_modal_button"
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center hover:bg-teal/30 transition-colors"
        title="User Profile"
      >
        <User size={14} className="text-teal" />
      </button>

      {open && (
        <div
          data-ocid="app.user_profile.popover"
          className="absolute right-0 top-10 w-64 bg-popover border border-border shadow-lg z-50"
        >
          {/* Avatar + info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center flex-shrink-0">
                <span className="text-[13px] font-bold text-teal">A</span>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-foreground">
                  Administrator
                </div>
                <div className="text-[11px] text-muted-foreground">
                  System Admin
                </div>
                {activeCompany && (
                  <div className="text-[10px] text-teal mt-0.5 truncate max-w-[160px]">
                    {activeCompany.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {/* Theme toggle row */}
            <div className="flex items-center justify-between px-3 py-2 hover:bg-secondary/60 transition-colors">
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Sun size={13} className="text-teal" />
                ) : (
                  <Moon size={13} className="text-teal" />
                )}
                <span className="text-[12px] text-foreground">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              </div>
              <button
                type="button"
                data-ocid="app.user_profile.theme.toggle"
                onClick={() => {
                  onToggleTheme();
                }}
                className="text-[10px] px-2 py-0.5 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 transition-colors rounded-sm"
              >
                Switch
              </button>
            </div>

            <div className="border-t border-border/60 my-1" />

            <button
              type="button"
              data-ocid="app.user_profile.settings.button"
              onClick={() => {
                onNavigate("gateway");
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-foreground hover:bg-secondary/60 transition-colors"
            >
              <Settings size={13} className="text-muted-foreground" />
              Settings
            </button>

            <button
              type="button"
              data-ocid="app.user_profile.signout.button"
              onClick={() => {
                onNavigate("companySelect");
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={13} />
              Sign Out / Change Company
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [view, setView] = useState<string>("companySelect");
  const [activeNav, setActiveNav] = useState<string>("gateway");
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("tally-theme") ?? "dark";
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("tally-theme", next);
      return next;
    });
  }, []);

  const navigate = useCallback((v: string) => {
    setView(v);
    setActiveNav(v);
  }, []);

  const handleSelectCompany = (c: Company) => {
    setActiveCompany(c);
    navigate("gateway");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!activeCompany) return;
      const key = e.key;
      if (key === "Escape") {
        if (view !== "gateway") navigate("gateway");
        return;
      }
      if (key === "F1") {
        e.preventDefault();
        navigate("ledgers");
      }
      if (key === "F4") {
        e.preventDefault();
        navigate("voucherContra");
      }
      if (key === "F5") {
        e.preventDefault();
        navigate("voucherPayment");
      }
      if (key === "F6") {
        e.preventDefault();
        navigate("voucherReceipt");
      }
      if (key === "F7") {
        e.preventDefault();
        navigate("voucher");
      }
      if (key === "F8") {
        e.preventDefault();
        navigate("voucherSales");
      }
      if (key === "F9") {
        e.preventDefault();
        navigate("voucherPurchase");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeCompany, view, navigate]);

  if (view === "companySelect") {
    return (
      <div className="h-full bg-background" data-theme={theme}>
        <CompanySelection onSelectCompany={handleSelectCompany} />
        <Toaster />
      </div>
    );
  }

  const renderMain = () => {
    if (!activeCompany) return null;
    if (view === "gateway")
      return <GatewayHome company={activeCompany} onNavigate={navigate} />;
    if (view === "ledgers") return <LedgerList company={activeCompany} />;
    if (view === "trialBalance")
      return <TrialBalance company={activeCompany} />;
    if (view === "dayBook") return <DayBook company={activeCompany} />;
    if (view === "hsnMaster") return <HSNMaster />;
    if (view === "taxLedgers") return <TaxLedgers company={activeCompany} />;
    if (view === "gstr1") return <GSTR1Report company={activeCompany} />;
    if (view === "gstr3b") return <GSTR3BReport company={activeCompany} />;
    if (view === "gstSettings") return <GSTSettings company={activeCompany} />;
    if (view === "gstVoucher")
      return <GSTVoucherEntry company={activeCompany} />;
    if (view === "balanceSheet")
      return <BalanceSheet company={activeCompany} />;
    if (view === "plAccount") return <PLAccount company={activeCompany} />;
    if (view === "cashFlow")
      return <CashFlowStatement company={activeCompany} />;
    // Phase 4: Inventory
    if (view === "stockGroups") return <StockGroups company={activeCompany} />;
    if (view === "stockItems") return <StockItems company={activeCompany} />;
    if (view === "stockReceipt")
      return (
        <StockVoucherEntry
          key="stockReceipt"
          company={activeCompany}
          defaultType="Receipt"
        />
      );
    if (view === "stockIssue")
      return (
        <StockVoucherEntry
          key="stockIssue"
          company={activeCompany}
          defaultType="Issue"
        />
      );
    if (view === "stockTransfer")
      return (
        <StockVoucherEntry
          key="stockTransfer"
          company={activeCompany}
          defaultType="Transfer"
        />
      );
    if (view === "stockSummary")
      return <StockSummary company={activeCompany} />;
    if (view === "stockLedger") return <StockLedger company={activeCompany} />;
    if (view.startsWith("voucher")) {
      const vType = VOUCHER_TYPE_MAP[view] || "Journal";
      return (
        <VoucherEntry key={view} company={activeCompany} defaultType={vType} />
      );
    }
    return <GatewayHome company={activeCompany} onNavigate={navigate} />;
  };

  return (
    <div
      className="h-full flex flex-col bg-background min-w-[1024px]"
      data-theme={theme}
    >
      {/* TOP BAR */}
      <header className="h-14 flex items-center px-4 gap-4 bg-topbar border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal flex items-center justify-center rounded-sm">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <span className="text-[15px] font-bold text-foreground tracking-tight">
            TallyPrime
          </span>
          <span className="text-[10px] text-muted-foreground font-mono ml-1">
            v4.0
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2 flex-1">
          <Building2 size={13} className="text-teal" />
          <span className="text-[12px] text-muted-foreground">Company:</span>
          <span className="text-[12px] font-semibold text-foreground">
            {activeCompany?.name}
          </span>
          {activeCompany && (
            <span className="text-[10px] text-muted-foreground">
              (FY {activeCompany.financialYearStart})
            </span>
          )}
        </div>

        <div className="text-[11px] text-muted-foreground border border-border/60 px-2 py-1 bg-secondary/30">
          {VIEW_LABELS[view] || view}
        </div>

        <button
          type="button"
          data-ocid="app.company.button"
          onClick={() => navigate("companySelect")}
          className="text-[11px] font-medium px-3 py-1 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 transition-colors"
        >
          F3: Company
        </button>

        <ThemeToggle theme={theme} onToggle={toggleTheme} />

        <UserProfileDropdown
          activeCompany={activeCompany}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigate={navigate}
        />
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col overflow-y-auto">
          <div className="px-3 py-2 border-b border-sidebar-border bg-sidebar">
            <div className="text-[10px] text-sidebar-muted uppercase tracking-wide">
              Current Period
            </div>
            <div className="text-[11px] text-sidebar-foreground font-medium mt-0.5">
              {activeCompany?.financialYearStart} –{" "}
              {activeCompany?.financialYearEnd}
            </div>
          </div>

          <nav className="flex-1 py-2">
            {NAV_ITEMS.map((item, i) => {
              if (item.isHeader) {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static nav headers
                  <div key={i} className="tally-section-header">
                    {item.label}
                  </div>
                );
              }
              if (item.key.startsWith("__")) return null;
              const Icon = item.icon;
              const isActive = activeNav === item.key;
              return (
                <button
                  type="button"
                  // biome-ignore lint/suspicious/noArrayIndexKey: static nav items
                  key={i}
                  data-ocid={`nav.${item.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}.link`}
                  className={`tally-menu-item w-full ${isActive ? "active" : ""}`}
                  onClick={() => navigate(item.key)}
                >
                  {Icon && <Icon size={12} className="flex-shrink-0" />}
                  <span className="flex-1 truncate text-left">
                    {item.label}
                  </span>
                  {item.fkey && (
                    <span className="tally-key-badge">{item.fkey}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Command Strip */}
          <div className="h-9 flex items-center gap-1 px-3 border-b border-border bg-card flex-shrink-0">
            {["G: Go To", "G: Print", "E: Export", "M: E-Mail", "H: Help"].map(
              (label) => (
                <button type="button" key={label} className="cmd-btn">
                  {label}
                </button>
              ),
            )}
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground font-mono">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Content Area */}
          <main className="flex-1 overflow-hidden relative">
            {renderMain()}
          </main>

          {/* BOTTOM STATUS BAR */}
          <footer className="h-8 flex items-center px-4 gap-6 border-t border-border bg-secondary/30 flex-shrink-0">
            <span className="text-[10px] font-mono text-muted-foreground">
              Ver. 4.0
            </span>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              {[
                { key: "F1", label: "Help" },
                { key: "F2", label: "Date" },
                { key: "F3", label: "Company" },
                { key: "F7", label: "Journal" },
                { key: "ESC", label: "Back" },
              ].map((s) => (
                <span key={s.key}>
                  <span className="tally-key-badge mr-1">{s.key}</span>
                  {s.label}
                </span>
              ))}
            </div>
            <div className="flex-1" />
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              © {new Date().getFullYear()}. Built with ❤ using caffeine.ai
            </a>
          </footer>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
