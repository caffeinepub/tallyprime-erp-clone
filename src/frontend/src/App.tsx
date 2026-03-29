import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Database,
  DollarSign,
  FileText,
  Landmark,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageCircle,
  Mic,
  Moon,
  PieChart,
  Receipt,
  Settings,
  Shield,
  Sun,
  Target,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Company } from "./backend.d";
import AIAnomalyDetector from "./components/AIAnomalyDetector";
import AISettings from "./components/AISettings";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AssetRegister from "./components/AssetRegister";
import AuditTrail from "./components/AuditTrail";
import BalanceSheet from "./components/BalanceSheet";
import BankAccounts from "./components/BankAccounts";
import BankReconciliation from "./components/BankReconciliation";
import BankStatement from "./components/BankStatement";
import BankingAPIConfig from "./components/BankingAPIConfig";
import BudgetMaster from "./components/BudgetMaster";
import BudgetVsActual from "./components/BudgetVsActual";
import CashFlowStatement from "./components/CashFlowStatement";
import ChequeManagement from "./components/ChequeManagement";
import ChequeRegister from "./components/ChequeRegister";
import CompanySelection from "./components/CompanySelection";
import ConsolidatedReports from "./components/ConsolidatedReports";
import CostCentreMaster from "./components/CostCentreMaster";
import CostCentreSummary from "./components/CostCentreSummary";
import CurrencyMaster from "./components/CurrencyMaster";
import CustomerLedger from "./components/CustomerLedger";
import CustomerMaster from "./components/CustomerMaster";
import DataManagement from "./components/DataManagement";
import DayBook from "./components/DayBook";
import EmployeeMaster from "./components/EmployeeMaster";
import ExchangeRates from "./components/ExchangeRates";
import ExportCenter from "./components/ExportCenter";
import FixedAssetMaster from "./components/FixedAssetMaster";
import ForecastingDashboard from "./components/ForecastingDashboard";
import GSTR1Report from "./components/GSTR1Report";
import GSTR3BReport from "./components/GSTR3BReport";
import GSTSettings from "./components/GSTSettings";
import GSTVoucherEntry from "./components/GSTVoucherEntry";
import GatewayHome from "./components/GatewayHome";
import HSNMaster from "./components/HSNMaster";
import InvoiceDispatch from "./components/InvoiceDispatch";
import InvoiceTemplates from "./components/InvoiceTemplates";
import LedgerList from "./components/LedgerList";
import LoginScreen from "./components/LoginScreen";
import NotificationCenter from "./components/NotificationCenter";
import PLAccount from "./components/PLAccount";
import PaySlip from "./components/PaySlip";
import PaymentGatewayConfig from "./components/PaymentGatewayConfig";
import PayrollRegister from "./components/PayrollRegister";
import PayrollVoucherEntry from "./components/PayrollVoucherEntry";
import ProjectCostLedger from "./components/ProjectCostLedger";
import ProjectDashboard from "./components/ProjectDashboard";
import ProjectMaster from "./components/ProjectMaster";
import ProjectPL from "./components/ProjectPL";
import ReportBuilder from "./components/ReportBuilder";
import RolePermissions from "./components/RolePermissions";
import SalaryStructureSetup from "./components/SalaryStructureSetup";
import ScheduledReports from "./components/ScheduledReports";
import StockGroups from "./components/StockGroups";
import StockItems from "./components/StockItems";
import StockLedger from "./components/StockLedger";
import StockSummary from "./components/StockSummary";
import StockVoucherEntry from "./components/StockVoucherEntry";
import TaxLedgers from "./components/TaxLedgers";
import TrialBalance from "./components/TrialBalance";
import UserManagement from "./components/UserManagement";
import VendorLedger from "./components/VendorLedger";
import VendorMaster from "./components/VendorMaster";
import VoiceVoucherEntry from "./components/VoiceVoucherEntry";
import VoucherEntry from "./components/VoucherEntry";
import WhatsAppConfig from "./components/WhatsAppConfig";
import type { AppUser } from "./types/rbac";
import { logAuditEvent } from "./utils/auditLog";

type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }> | null;
  fkey: string | null;
  isHeader?: boolean;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    key: "gateway",
    label: "Gateway of HisabKitab",
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
    key: "__header_payroll",
    label: "Payroll",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "employeeMaster", label: "Employee Master", icon: Users, fkey: null },
  {
    key: "salaryStructure",
    label: "Salary Structure",
    icon: FileText,
    fkey: null,
  },
  {
    key: "payrollVoucher",
    label: "Process Payroll",
    icon: Receipt,
    fkey: null,
  },
  {
    key: "__header_payroll_reports",
    label: "Payroll Reports",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "payrollRegister",
    label: "Payroll Register",
    icon: BarChart3,
    fkey: null,
  },
  { key: "paySlip", label: "Pay Slip", icon: FileText, fkey: null },
  {
    key: "__header_banking",
    label: "Banking",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "bankAccounts", label: "Bank Accounts", icon: Landmark, fkey: null },
  {
    key: "issueReceiveCheque",
    label: "Cheque Entry",
    icon: Receipt,
    fkey: null,
  },
  {
    key: "chequeRegister",
    label: "Cheque Register",
    icon: FileText,
    fkey: null,
  },
  {
    key: "__header_bank_reports",
    label: "Bank Reports",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "bankReconciliation",
    label: "Bank Reconciliation",
    icon: BarChart3,
    fkey: null,
  },
  { key: "bankStatement", label: "Bank Statement", icon: BookOpen, fkey: null },
  // Phase 7: Fixed Assets
  {
    key: "__header_fixedassets",
    label: "Fixed Assets",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "fixedAssetMaster",
    label: "Asset Master",
    icon: Building2,
    fkey: null,
  },
  { key: "assetRegister", label: "Asset Register", icon: FileText, fkey: null },
  // Phase 7: Cost Centres
  {
    key: "__header_costcentres",
    label: "Cost Centres",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "costCentreMaster", label: "Cost Centres", icon: Layers, fkey: null },
  {
    key: "costCentreSummary",
    label: "Cost Centre Summary",
    icon: BarChart3,
    fkey: null,
  },
  // Phase 7: Multi-Currency
  {
    key: "__header_multicurrency",
    label: "Multi-Currency",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "currencyMaster",
    label: "Currency Master",
    icon: DollarSign,
    fkey: null,
  },
  {
    key: "exchangeRates",
    label: "Exchange Rates",
    icon: TrendingUp,
    fkey: null,
  },
  {
    key: "__header_utilities",
    label: "Utilities",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "gateway", label: "Import", icon: null, fkey: null },
  // Phase 10: Analytics
  {
    key: "__header_analytics",
    label: "Analytics",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "analyticsDashboard",
    label: "Business Insights",
    icon: BarChart3,
    fkey: null,
  },
  // Phase 11: Advanced Reporting
  {
    key: "__header_adv_reports",
    label: "Advanced Reporting",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "reportBuilder",
    label: "Report Builder",
    icon: BarChart3,
    fkey: null,
  },
  {
    key: "scheduledReports",
    label: "Scheduled Reports",
    icon: FileText,
    fkey: null,
  },
  // Phase 11: Notifications
  {
    key: "__header_notifications",
    label: "Notifications",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "notifications",
    label: "Notification Center",
    icon: Bell,
    fkey: null,
  },
  // Phase 13: AI Tools
  {
    key: "__header_ai_tools",
    label: "AI Tools",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "aiSettings", label: "AI Settings", icon: Settings, fkey: null },
  {
    key: "aiAnomalyDetector",
    label: "Anomaly Detector",
    icon: Shield,
    fkey: null,
  },
  { key: "voiceEntry", label: "Voice Entry", icon: Mic, fkey: null },
  // Phase 20: Budgeting
  {
    key: "__header_budgeting",
    label: "Budgeting & Forecasting",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "budgetMaster", label: "Budget Master", icon: Target, fkey: null },
  {
    key: "budgetVsActual",
    label: "Budget vs Actual",
    icon: BarChart3,
    fkey: null,
  },
  { key: "forecasting", label: "Forecasting", icon: TrendingUp, fkey: null },
  // Phase 20: Consolidation
  {
    key: "__header_consolidation",
    label: "Consolidation",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "consolidatedReports",
    label: "Consolidated Reports",
    icon: PieChart,
    fkey: null,
  },
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
  // Phase 8: Security (Admin only)
  {
    key: "__header_security",
    label: "Security",
    icon: null,
    fkey: null,
    isHeader: true,
    adminOnly: true,
  },
  {
    key: "userManagement",
    label: "User Management",
    icon: Shield,
    fkey: null,
    adminOnly: true,
  },
  {
    key: "rolePermissions",
    label: "Roles & Permissions",
    icon: Lock,
    fkey: null,
    adminOnly: true,
  },
  // Phase 9: Data Management
  {
    key: "__header_data_mgmt",
    label: "Data Management",
    icon: null,
    fkey: null,
    isHeader: true,
    adminOnly: true,
  },
  {
    key: "dataManagement",
    label: "Backup & Export",
    icon: Database,
    fkey: null,
    adminOnly: true,
  },
  // Phase 12: Printing & Export
  {
    key: "__header_print_export",
    label: "Printing & Export",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "exportCenter", label: "Export Center", icon: FileText, fkey: null },
  {
    key: "invoiceTemplates",
    label: "Invoice Templates",
    icon: FileText,
    fkey: null,
  },
  // Phase 12: Integrations
  {
    key: "__header_integrations",
    label: "Integrations",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "paymentGateways",
    label: "Payment Gateways",
    icon: DollarSign,
    fkey: null,
  },
  { key: "bankingAPIs", label: "Banking APIs", icon: Landmark, fkey: null },
  {
    key: "invoiceDispatch",
    label: "Email/SMS Dispatch",
    icon: Bell,
    fkey: null,
  },
  // Phase 13: WhatsApp
  {
    key: "whatsAppConfig",
    label: "WhatsApp Config",
    icon: MessageCircle,
    fkey: null,
  },
  // Phase 10: Audit Trail (Admin only)
  {
    key: "__header_audit",
    label: "Audit Trail",
    icon: null,
    fkey: null,
    isHeader: true,
    adminOnly: true,
  },
  {
    key: "auditTrail",
    label: "Activity Log",
    icon: FileText,
    fkey: null,
    adminOnly: true,
  },
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
  gateway: "Gateway of HisabKitab",
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
  employeeMaster: "Employee Master",
  salaryStructure: "Salary Structure",
  payrollVoucher: "Process Payroll",
  payrollRegister: "Payroll Register",
  paySlip: "Pay Slip",
  bankAccounts: "Bank Accounts",
  issueReceiveCheque: "Cheque Entry",
  chequeRegister: "Cheque Register",
  bankReconciliation: "Bank Reconciliation",
  bankStatement: "Bank Statement",
  // Phase 7
  fixedAssetMaster: "Fixed Asset Master",
  assetRegister: "Asset Register",
  costCentreMaster: "Cost Centres",
  costCentreSummary: "Cost Centre Summary",
  currencyMaster: "Currency Master",
  exchangeRates: "Exchange Rates",
  // Phase 8
  userManagement: "User Management",
  rolePermissions: "Roles & Permissions",
  // Phase 9
  dataManagement: "Data Management",
  // Phase 10
  analyticsDashboard: "Business Insights",
  auditTrail: "Audit Trail",
  // Phase 12
  exportCenter: "Export Center",
  invoiceTemplates: "Invoice Templates",
  paymentGateways: "Payment Gateways",
  bankingAPIs: "Banking API Config",
  invoiceDispatch: "Email/SMS Dispatch",
  // Phase 13
  aiSettings: "AI Settings",
  aiAnomalyDetector: "AI Anomaly Detector",
  voiceEntry: "Voice Entry",
  whatsAppConfig: "WhatsApp Config",
  // Phase 11
  reportBuilder: "Report Builder",
  scheduledReports: "Scheduled Reports",
  notifications: "Notification Center",
  // Phase 20
  budgetMaster: "Budget Master",
  budgetVsActual: "Budget vs Actual",
  forecasting: "Forecasting Dashboard",
  consolidatedReports: "Consolidated Reports",
  projectDashboard: "Project Dashboard",
  projectMaster: "Project Master",
  projectCostLedger: "Project Cost Ledger",
  projectPL: "Project P&L Report",
  customerMaster: "Customer Master",
  customerLedger: "Customer Ledger",
  vendorMaster: "Vendor Master",
  vendorLedger: "Vendor Ledger",
};

// Role-based allowed nav keys
const ROLE_ALLOWED_KEYS: Record<string, Set<string>> = {
  Admin: new Set(["*"]), // all
  Accountant: new Set([
    "gateway",
    "ledgers",
    "voucher",
    "voucherContra",
    "voucherPayment",
    "voucherReceipt",
    "voucherSales",
    "voucherPurchase",
    "gstVoucher",
    "hsnMaster",
    "gstr1",
    "gstr3b",
    "taxLedgers",
    "gstSettings",
    "stockGroups",
    "stockItems",
    "stockReceipt",
    "stockIssue",
    "stockTransfer",
    "stockSummary",
    "stockLedger",
    "employeeMaster",
    "salaryStructure",
    "payrollVoucher",
    "payrollRegister",
    "paySlip",
    "bankAccounts",
    "issueReceiveCheque",
    "chequeRegister",
    "bankReconciliation",
    "bankStatement",
    "fixedAssetMaster",
    "assetRegister",
    "costCentreMaster",
    "costCentreSummary",
    "currencyMaster",
    "exchangeRates",
    "balanceSheet",
    "plAccount",
    "cashFlow",
    "trialBalance",
    "dayBook",
    "analyticsDashboard",
    "reportBuilder",
    "scheduledReports",
    "notifications",
    "exportCenter",
    "invoiceTemplates",
    "aiSettings",
    "aiAnomalyDetector",
    "voiceEntry",
    "whatsAppConfig",
    "budgetMaster",
    "budgetVsActual",
    "forecasting",
    "consolidatedReports",
    "projectDashboard",
    "projectMaster",
    "projectCostLedger",
    "projectPL",
    "customerMaster",
    "customerLedger",
    "vendorMaster",
    "vendorLedger",
  ]),
  Auditor: new Set([
    "gateway",
    "trialBalance",
    "dayBook",
    "balanceSheet",
    "plAccount",
    "cashFlow",
    "gstr1",
    "gstr3b",
    "analyticsDashboard",
    "reportBuilder",
    "scheduledReports",
    "notifications",
    "exportCenter",
    "invoiceTemplates",
    "budgetVsActual",
    "forecasting",
    "consolidatedReports",
    "projectDashboard",
    "projectPL",
    "customerLedger",
    "vendorLedger",
  ]),
  Viewer: new Set([
    "gateway",
    "trialBalance",
    "dayBook",
    "balanceSheet",
    "plAccount",
    "cashFlow",
    "analyticsDashboard",
    "reportBuilder",
    "scheduledReports",
    "notifications",
    "exportCenter",
    "invoiceTemplates",
    "budgetVsActual",
    "forecasting",
    "consolidatedReports",
    "projectDashboard",
    "projectPL",
    "customerLedger",
    "vendorLedger",
  ]),
};

function isNavAllowed(key: string, role: string): boolean {
  const allowed = ROLE_ALLOWED_KEYS[role];
  if (!allowed) return false;
  if (allowed.has("*")) return true;
  return allowed.has(key);
}

function getFilteredNavItems(role: string): NavItem[] {
  if (role === "Admin") return NAV_ITEMS;

  const result: NavItem[] = [];
  let pendingHeader: NavItem | null = null;

  for (const item of NAV_ITEMS) {
    if (item.isHeader) {
      pendingHeader = item;
      continue;
    }
    if (item.key.startsWith("__")) continue;
    if (isNavAllowed(item.key, role)) {
      if (pendingHeader) {
        result.push(pendingHeader);
        pendingHeader = null;
      }
      result.push(item);
    }
  }
  return result;
}

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
  currentUser,
  onLogout,
}: {
  activeCompany: Company | null;
  theme: string;
  onToggleTheme: () => void;
  onNavigate: (v: string) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayName = currentUser?.username ?? "Administrator";
  const displayRole = currentUser?.role ?? "System Admin";
  const initial = displayName[0]?.toUpperCase() ?? "A";

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
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center flex-shrink-0">
                <span className="text-[13px] font-bold text-teal">
                  {initial}
                </span>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-foreground">
                  {displayName}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {displayRole}
                </div>
                {activeCompany && (
                  <div className="text-[10px] text-teal mt-0.5 truncate max-w-[160px]">
                    {activeCompany.name}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="py-1">
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
                onClick={onToggleTheme}
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
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-foreground hover:bg-secondary/60 transition-colors"
            >
              <Building2 size={13} className="text-muted-foreground" />
              Change Company
            </button>
            <button
              type="button"
              data-ocid="app.user_profile.logout.button"
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
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

  const handleLogout = useCallback(() => {
    logAuditEvent(
      currentUser?.username ?? "unknown",
      currentUser?.role ?? "unknown",
      "LOGOUT",
      "Auth",
      "User logged out",
    );
    setCurrentUser(null);
  }, [currentUser]);

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

  // Login gate
  if (!currentUser) {
    return (
      <div className="h-full bg-background" data-theme={theme}>
        <LoginScreen
          onLogin={(user) => {
            setCurrentUser(user);
            logAuditEvent(
              user.username,
              user.role,
              "LOGIN",
              "Auth",
              "User logged in",
            );
          }}
        />
        <Toaster />
      </div>
    );
  }

  if (view === "companySelect") {
    return (
      <div className="h-full bg-background" data-theme={theme}>
        <CompanySelection onSelectCompany={handleSelectCompany} />
        <Toaster />
      </div>
    );
  }

  const filteredNavItems = getFilteredNavItems(currentUser.role);

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
    // Phase 5: Payroll
    if (view === "employeeMaster")
      return <EmployeeMaster company={activeCompany} />;
    if (view === "salaryStructure")
      return <SalaryStructureSetup company={activeCompany} />;
    if (view === "payrollVoucher")
      return <PayrollVoucherEntry company={activeCompany} />;
    if (view === "payrollRegister")
      return <PayrollRegister company={activeCompany} />;
    if (view === "paySlip") return <PaySlip company={activeCompany} />;
    // Phase 6: Banking
    if (view === "bankAccounts")
      return <BankAccounts company={activeCompany} />;
    if (view === "issueReceiveCheque")
      return <ChequeManagement company={activeCompany} />;
    if (view === "chequeRegister")
      return <ChequeRegister company={activeCompany} />;
    if (view === "bankReconciliation")
      return <BankReconciliation company={activeCompany} />;
    if (view === "bankStatement")
      return <BankStatement company={activeCompany} />;
    // Phase 7: Fixed Assets
    if (view === "fixedAssetMaster")
      return <FixedAssetMaster company={activeCompany} />;
    if (view === "assetRegister")
      return <AssetRegister company={activeCompany} />;
    // Phase 7: Cost Centres
    if (view === "costCentreMaster")
      return <CostCentreMaster company={activeCompany} />;
    if (view === "costCentreSummary")
      return <CostCentreSummary company={activeCompany} />;
    // Phase 7: Multi-Currency
    if (view === "currencyMaster") return <CurrencyMaster />;
    if (view === "exchangeRates") return <ExchangeRates />;
    // Phase 8: Security
    if (view === "userManagement") return <UserManagement />;
    if (view === "rolePermissions") return <RolePermissions />;
    // Phase 9: Data Management
    if (view === "dataManagement") return <DataManagement />;
    // Phase 10: Analytics & Audit Trail
    if (view === "analyticsDashboard")
      return <AnalyticsDashboard company={activeCompany} />;
    if (view === "auditTrail") return <AuditTrail currentUser={currentUser} />;
    // Phase 11: Advanced Reporting & Notifications
    if (view === "reportBuilder") return <ReportBuilder />;
    if (view === "scheduledReports") return <ScheduledReports />;
    if (view === "notifications") return <NotificationCenter />;
    // Phase 12: Printing & Export
    if (view === "exportCenter") return <ExportCenter />;
    if (view === "invoiceTemplates") return <InvoiceTemplates />;
    // Phase 12: Integrations
    if (view === "paymentGateways") return <PaymentGatewayConfig />;
    if (view === "bankingAPIs") return <BankingAPIConfig />;
    if (view === "invoiceDispatch") return <InvoiceDispatch />;
    // Phase 13: AI Tools + WhatsApp
    if (view === "aiSettings") return <AISettings />;
    if (view === "aiAnomalyDetector")
      return <AIAnomalyDetector company={activeCompany} />;
    if (view === "voiceEntry")
      return <VoiceVoucherEntry company={activeCompany} />;
    if (view === "whatsAppConfig") return <WhatsAppConfig />;
    // Phase 20: Budgeting & Forecasting
    if (view === "budgetMaster")
      return <BudgetMaster company={activeCompany} />;
    if (view === "budgetVsActual")
      return <BudgetVsActual company={activeCompany} />;
    if (view === "forecasting")
      return <ForecastingDashboard company={activeCompany} />;
    if (view === "consolidatedReports")
      return <ConsolidatedReports currentCompany={activeCompany} />;
    // Phase 21
    if (view === "projectDashboard")
      return <ProjectDashboard company={activeCompany} />;
    if (view === "projectMaster")
      return <ProjectMaster company={activeCompany} />;
    if (view === "projectCostLedger")
      return <ProjectCostLedger company={activeCompany} />;
    if (view === "projectPL") return <ProjectPL company={activeCompany} />;
    if (view === "customerMaster")
      return <CustomerMaster company={activeCompany} />;
    if (view === "customerLedger")
      return <CustomerLedger company={activeCompany} />;
    if (view === "vendorMaster")
      return <VendorMaster company={activeCompany} />;
    if (view === "vendorLedger")
      return <VendorLedger company={activeCompany} />;
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
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="text-[15px] font-bold text-foreground tracking-tight">
            HisabKitab Pro
          </span>
          <span className="text-[10px] text-muted-foreground font-mono ml-1">
            v21.0
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
          currentUser={currentUser}
          onLogout={handleLogout}
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
            {filteredNavItems.map((item, i) => {
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
              Ver. 20.0
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
            {currentUser && (
              <span className="text-[10px] text-muted-foreground/60">
                Logged in as{" "}
                <span className="text-teal/70 font-medium">
                  {currentUser.username}
                </span>{" "}
                ({currentUser.role})
              </span>
            )}
          </footer>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
