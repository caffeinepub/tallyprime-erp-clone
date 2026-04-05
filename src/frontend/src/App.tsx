import { Toaster } from "@/components/ui/sonner";
import {
  AlertCircle,
  BarChart2,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Camera,
  CheckSquare,
  ChevronDown,
  ClipboardEdit,
  ClipboardList,
  Clock,
  Code,
  Database,
  DollarSign,
  Download,
  FileText,
  GitBranch,
  GitCompare,
  HelpCircle,
  History,
  Keyboard,
  Landmark,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  Moon,
  PieChart,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  ScanLine,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sun,
  Target,
  TrendingUp,
  Truck,
  Undo2,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Company } from "./backend.d";
import AIAnomalyDetector from "./components/AIAnomalyDetector";
import AISettings from "./components/AISettings";
import AdvancedAnalyticsDashboard from "./components/AdvancedAnalyticsDashboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AssetRegister from "./components/AssetRegister";
import AuditTrail from "./components/AuditTrail";
// Phase 25: Backup, Offline, Theme, Profile
import AutoBackup from "./components/AutoBackup";
import BackupHistory from "./components/BackupHistory";
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
import CompanyBranding from "./components/CompanyBranding";
import CompanySelection from "./components/CompanySelection";
import ConsolidatedReports from "./components/ConsolidatedReports";
// Phase 32: New components
import ContactQueries from "./components/ContactQueries";
import CostCentreMaster from "./components/CostCentreMaster";
import CostCentreSummary from "./components/CostCentreSummary";
import CurrencyMaster from "./components/CurrencyMaster";
import CustomShortcuts, { loadShortcuts } from "./components/CustomShortcuts";
import CustomerLedger from "./components/CustomerLedger";
import CustomerMaster from "./components/CustomerMaster";
import DataManagement from "./components/DataManagement";
import DayBook from "./components/DayBook";
import EmployeeMaster from "./components/EmployeeMaster";
import ExchangeRates from "./components/ExchangeRates";
import ExportCenter from "./components/ExportCenter";
import FeatureSettings from "./components/FeatureSettings";
import FixedAssetMaster from "./components/FixedAssetMaster";
import ForecastingDashboard from "./components/ForecastingDashboard";
import GSTR1Report from "./components/GSTR1Report";
import GSTR3BReport from "./components/GSTR3BReport";
import GSTSettings from "./components/GSTSettings";
import GSTVoucherEntry from "./components/GSTVoucherEntry";
import GatewayHome from "./components/GatewayHome";
// Phase 38: New components
import GlobalSearch from "./components/GlobalSearch";
import HSNMaster from "./components/HSNMaster";
// Phase 40: New components
import InvoiceCustomizer from "./components/InvoiceCustomizer";
import InvoiceDispatch from "./components/InvoiceDispatch";
import InvoiceTemplates from "./components/InvoiceTemplates";
import LedgerList from "./components/LedgerList";
import LoginScreen from "./components/LoginScreen";
import MakerChecker from "./components/MakerChecker";
import NotificationCenter from "./components/NotificationCenter";
import PLAccount from "./components/PLAccount";
import PaySlip from "./components/PaySlip";
import PaymentGatewayConfig from "./components/PaymentGatewayConfig";
import PayrollRegister from "./components/PayrollRegister";
import PayrollVoucherEntry from "./components/PayrollVoucherEntry";
import PremiumFeatures, {
  loadPremiumFeatures,
} from "./components/PremiumFeatures";
import type { PremiumFeatureState } from "./components/PremiumFeatures";
import ProjectCostLedger from "./components/ProjectCostLedger";
import ProjectDashboard from "./components/ProjectDashboard";
import ProjectMaster from "./components/ProjectMaster";
import ProjectPL from "./components/ProjectPL";
import PurchaseOrderEntry from "./components/PurchaseOrderEntry";
import PurchaseOrderList from "./components/PurchaseOrderList";
import PurchaseOrderReceipt from "./components/PurchaseOrderReceipt";
import PurchaseOrderRegister from "./components/PurchaseOrderRegister";
import RemoteDatabaseConfig from "./components/RemoteDatabaseConfig";
import ReportBuilder from "./components/ReportBuilder";
import RolePermissions from "./components/RolePermissions";
import RuleEngine from "./components/RuleEngine";
import SalaryStructureSetup from "./components/SalaryStructureSetup";
import SalesOrderDispatch from "./components/SalesOrderDispatch";
import SalesOrderEntry from "./components/SalesOrderEntry";
import SalesOrderList from "./components/SalesOrderList";
import SalesOrderRegister from "./components/SalesOrderRegister";
import ScheduledReports from "./components/ScheduledReports";
import ShareCompany from "./components/ShareCompany";
import SmartAlerts from "./components/SmartAlerts";
import StockGroups from "./components/StockGroups";
import StockItems from "./components/StockItems";
import StockLedger from "./components/StockLedger";
import StockSummary from "./components/StockSummary";
import StockVoucherEntry from "./components/StockVoucherEntry";
import TaxLedgers from "./components/TaxLedgers";
import ThemeCustomizer from "./components/ThemeCustomizer";
import TrialBalance from "./components/TrialBalance";
import UserManagement from "./components/UserManagement";
import UserProfile from "./components/UserProfile";
import VendorLedger from "./components/VendorLedger";
import VendorMaster from "./components/VendorMaster";
import VoiceVoucherEntry from "./components/VoiceVoucherEntry";
import VoucherEntry from "./components/VoucherEntry";
import WhatsAppConfig from "./components/WhatsAppConfig";

// Sidebar hover tooltip descriptions (outside component for stability)
const SIDEBAR_DESCRIPTIONS: Record<string, string> = {
  ledgers:
    "Create and manage ledger accounts grouped by account type (Assets, Liabilities, Income, Expense). Each ledger tracks its balance.",
  voucher: "Journal Entry (F7): Record adjustment entries between accounts.",
  voucherSales:
    "Sales Entry (F8): Record sales transactions. Links to customer ledger and inventory.",
  voucherPurchase:
    "Purchase Entry (F9): Record purchases from vendors with GST auto-calculation.",
  voucherPayment:
    "Payment Entry (F5): Record outgoing payments to vendors or expenses.",
  voucherReceipt:
    "Receipt Entry (F6): Record incoming payments from customers.",
  voucherContra:
    "Contra Entry (F4): Record bank-to-cash or cash-to-bank transfers.",
  balanceSheet:
    "Balance Sheet: Shows Assets vs Liabilities + Equity as of today. Drill down for details.",
  plAccount:
    "Profit & Loss Account: Income minus Expenses = Net Profit/Loss for the period.",
  trialBalance:
    "Trial Balance: All ledger closing balances. Debit total must equal Credit total.",
  dayBook:
    "Day Book: Chronological record of all vouchers entered for any selected date.",
  gstr1:
    "GSTR-1: Outward supplies report. Submit to GST portal by 11th of every month.",
  gstr3b: "GSTR-3B: Summary GST return. Submit by 20th of every month.",
  gstVoucher:
    "GST Voucher: Record sales/purchase with automatic GST calculation (CGST, SGST, IGST).",
  hsnMaster:
    "HSN/SAC Master: Manage Harmonized System of Nomenclature codes and their GST rates.",
  gstSettings:
    "GST Settings: Configure your company GST registration type, state code, and GSTIN.",
  stockGroups:
    "Stock Groups: Categorize your inventory items into logical groups for reporting.",
  stockItems:
    "Stock Items: Create and manage individual inventory products with opening stock.",
  stockSummary:
    "Stock Summary: View current stock levels, opening and closing balances for all items.",
  stockLedger:
    "Stock Ledger: Detailed movement history (in/out) for any stock item.",
  employeeMaster:
    "Employee Master: Manage employee records including PAN, bank details and department.",
  payrollVoucher:
    "Process Payroll: Generate salary vouchers with HRA, PF, ESI and TDS calculations.",
  bankAccounts:
    "Bank Accounts: Link your company bank accounts to ledgers for reconciliation.",
  bankReconciliation:
    "Bank Reconciliation: Match your books with bank statement to find differences.",
  fixedAssetMaster:
    "Fixed Assets: Track company assets with depreciation calculation and disposal.",
  costCentreMaster:
    "Cost Centres: Allocate expenses to departments or projects for analysis.",
  userManagement:
    "User Management: Create and manage user accounts with role-based permissions.",
  aiSettings:
    "AI Settings: Configure OpenAI and Gemini API keys for AI-powered narration, anomaly detection and report explanations.",
  invoiceTemplates:
    "Invoice Templates: Choose from Classic, Modern, or GST-Compliant invoice templates for printing.",
  invoiceCustomizer:
    "Invoice Customizer: Upload company logo, signature, set accent color, toggle fields, and preview live.",
  companyBranding:
    "Company Branding: Upload your company logo and set brand colors used across the app and invoices.",
  shareCompany:
    "Share Company: Share your company data via encoded link, QR code, or download as PDF report.",
  remoteDatabase:
    "Remote Database Bridge: Connect to your remote MySQL or SQLite database via HTTP bridge for data sync.",
  eventTimeline:
    "Event Timeline: Visual timeline of all accounting events. Click any event to see full details.",
  eventLog:
    "Event Log: Complete log of all system events with filtering, undo, and export capabilities.",
  documentUpload:
    "OCR Invoice Scanner: Upload an invoice image and extract data automatically using AI.",
  analyticsDashboard:
    "Business Insights: KPI dashboard with revenue trends, top customers, and financial metrics.",
  advancedAnalytics:
    "Premium Dashboard: Drag-and-drop analytics widgets including gauges, sparklines, and alerts.",
  smartAlerts:
    "Smart Alerts: Get notified about low stock, overdue payments, GST deadlines and cash flow risks.",
  ruleEngine:
    "Rule Engine: Define automation rules like auto-apply GST, approval thresholds, recurring entries.",
  makerChecker:
    "Maker-Checker: Approval workflow for vouchers — maker creates, checker approves or rejects.",
  budgetMaster:
    "Budget Master: Set annual budgets for ledger groups and monitor actual vs planned spending.",
  hrDashboard:
    "HR Dashboard: Overview of employee strength, attendance summary, leaves and payroll.",
  posTerminal:
    "POS Terminal: Retail billing with product search, cart, discount and payment modes.",
  branchMaster:
    "Branch Master: Create and manage multiple business branches with separate GSTINs.",
  "compliance-engine":
    "Compliance Engine: Automated GST error detection, filing alerts, and compliance scoring.",
  leadMaster:
    "CRM Lead: Create and track sales leads with source, status, and follow-up date.",
  projectDashboard:
    "Project Costing: Track project-wise income, expenses and profitability in real time.",
  customerMaster:
    "Customer Master: Manage customer accounts with GST details and contact information.",
  vendorMaster:
    "Vendor Master: Manage vendor accounts with GSTIN, payment terms and contact info.",
  poEntry:
    "Create Purchase Order: Raise a PO to a vendor with items, rates and delivery date.",
  soEntry:
    "Create Sales Order: Record a sales order from a customer before billing.",
  whatsAppConfig:
    "WhatsApp Config: Set up WhatsApp Business API to send invoices and reminders to customers.",
  dataManagement:
    "Backup & Export: Download all company data as JSON/CSV for offline backup or migration.",
  exportCenter: "Export Center: Export any report to PDF, Excel or CSV format.",
  offlineSync:
    "Offline Queue: View data entered offline that is waiting to sync to the cloud backend.",
  themeCustomizer:
    "Theme Customizer: Switch between 8 color themes to personalize the app look.",
  customShortcuts:
    "My Shortcuts: Define personal keyboard shortcuts that only work for your login.",
  bankStatementImport:
    "Bank Statement Import: Upload bank CSV and auto-match transactions for reconciliation.",
  drillDownExplorer:
    "Drill-Down Explorer: Click any account to see individual transactions behind the balance.",
  cashFlowForecast:
    "Cash Flow Forecast: Predict 30/60/90 day cash position based on current trends.",
  auditLogViewer:
    "Audit Log Viewer: Immutable, tamper-proof log of all data changes with timestamps.",
  gstFilingDashboard:
    "GST Filing Dashboard: Track due dates and filing status for GSTR-1, 3B and GSTR-9.",
  jsonConfigEditor:
    "Customization Engine: Edit the app configuration in JSON to customize workflows and fields.",
  timeTravelReport:
    "Time Travel Report: Rebuild the Trial Balance for any past date from accounting events.",
  importWizard:
    "Tally Import Wizard: Migrate data from Tally ERP 9 XML or CSV export files.",
  "mobile-barcode-scan":
    "Barcode Scanner: Use your device camera to scan product barcodes for POS billing.",
  "ecommerce-dashboard":
    "E-Commerce Dashboard: View online order KPIs, revenue and fulfillment metrics.",
};
import CashFlowForecast from "./components/advanced-analytics/CashFlowForecast";
// Phase 36: Advanced Analytics Drill-Down
import DrillDownExplorer from "./components/advanced-analytics/DrillDownExplorer";
import ExpenseBreakdown from "./components/advanced-analytics/ExpenseBreakdown";
import PLTrend from "./components/advanced-analytics/PLTrend";
import AutoReconciliation from "./components/advanced-banking/AutoReconciliation";
import BRSReport from "./components/advanced-banking/BRSReport";
import BRSSmartMatch from "./components/advanced-banking/BRSSmartMatch";
import BankAnalytics from "./components/advanced-banking/BankAnalytics";
// Phase 36: Advanced Banking
import BankStatementImport from "./components/advanced-banking/BankStatementImport";
import ChequeRegisterAdv from "./components/advanced-banking/ChequeRegisterAdv";
import UPITracker from "./components/advanced-banking/UPITracker";
import AMCTracker from "./components/asset-maintenance/AMCTracker";
import MaintenanceLog from "./components/asset-maintenance/MaintenanceLog";
// Phase 35: Asset Maintenance
import MaintenanceSchedule from "./components/asset-maintenance/MaintenanceSchedule";
import AuditLogViewer from "./components/audit-compliance/AuditLogViewer";
import ComplianceChecklist from "./components/audit-compliance/ComplianceChecklist";
import IncomeTaxComputation from "./components/audit-compliance/IncomeTaxComputation";
import TDSManagement from "./components/audit-compliance/TDSManagement";
import BranchMaster from "./components/branches/BranchMaster";
import BranchReports from "./components/branches/BranchReports";
import BranchTransfer from "./components/branches/BranchTransfer";
import CollaborationDashboard from "./components/collaboration/CollaborationDashboard";
import VoucherComments from "./components/collaboration/VoucherComments";
import VoucherTasks from "./components/collaboration/VoucherTasks";
import ComplianceEngineDashboard from "./components/compliance-engine/ComplianceEngineDashboard";
import ComplianceScore from "./components/compliance-engine/ComplianceScore";
import FilingAlertsDashboard from "./components/compliance-engine/FilingAlertsDashboard";
import GSTErrorDetector from "./components/compliance-engine/GSTErrorDetector";
import EInvoiceForm from "./components/compliance/EInvoiceForm";
import EInvoiceList from "./components/compliance/EInvoiceList";
// Phase 23: Compliance
import EWayBillForm from "./components/compliance/EWayBillForm";
import EWayBillList from "./components/compliance/EWayBillList";
import FollowUpReminders from "./components/crm/FollowUpReminders";
import LeadList from "./components/crm/LeadList";
// Phase 23: CRM
import LeadMaster from "./components/crm/LeadMaster";
import CustomFields from "./components/customization/CustomFields";
// Phase 33: Customization Engine
import JSONConfigEditor from "./components/customization/JSONConfigEditor";
import WorkflowBuilder from "./components/customization/WorkflowBuilder";
// Phase 31: Doc Intelligence
import DocumentRegister from "./components/doc-intelligence/DocumentRegister";
import DocumentUpload from "./components/doc-intelligence/DocumentUpload";
import StructuredEntry from "./components/doc-intelligence/StructuredEntry";
import AutoSalesEntry from "./components/ecommerce/AutoSalesEntry";
// Phase 37: E-Commerce Integration
import ECommerceDashboard from "./components/ecommerce/ECommerceDashboard";
import InventorySync from "./components/ecommerce/InventorySync";
import OrderImport from "./components/ecommerce/OrderImport";
import OrderProfitability from "./components/ecommerce/OrderProfitability";
import DiffViewer from "./components/event-ledger/DiffViewer";
// Phase 31: Event Ledger
import EventLog from "./components/event-ledger/EventLog";
import EventReplay from "./components/event-ledger/EventReplay";
import EventTimeline from "./components/event-ledger/EventTimeline";
import SnapshotManager from "./components/event-ledger/SnapshotManager";
// Phase 33: Event Ledger Deep Enhancements
import TimeTravelReport from "./components/event-ledger/TimeTravelReport";
import UndoEngine from "./components/event-ledger/UndoEngine";
import UndoRedoStack from "./components/event-ledger/UndoRedoStack";
// Phase 24: GST Filing
import GSTFilingDashboard from "./components/gst-filing/GSTFilingDashboard";
import GSTFilingHistory from "./components/gst-filing/GSTFilingHistory";
import GSTR1Filing from "./components/gst-filing/GSTR1Filing";
import GSTR3BFiling from "./components/gst-filing/GSTR3BFiling";
import AttendanceRegister from "./components/hr/AttendanceRegister";
// Phase 35: HR & Attendance
import HRDashboard from "./components/hr/HRDashboard";
import HREmployeeMaster from "./components/hr/HREmployeeMaster";
import LeaveManagement from "./components/hr/LeaveManagement";
import SalarySlip from "./components/hr/SalarySlip";
// Phase 37: Advanced Mobile
import BarcodeScanner from "./components/mobile/BarcodeScanner";
import MobileApprovals from "./components/mobile/MobileApprovals";
import MobileReports from "./components/mobile/MobileReports";
import OfflineSync from "./components/offline/OfflineSync";
import SyncHistory from "./components/offline/SyncHistory";
// Phase 24: POS
import POSRegister from "./components/pos/POSRegister";
import POSSessions from "./components/pos/POSSessions";
import POSTerminal from "./components/pos/POSTerminal";
import FieldPermissions from "./components/security/FieldPermissions";
import PasswordPolicy from "./components/security/PasswordPolicy";
// Phase 24: Service Management
import ServiceMaster from "./components/service/ServiceMaster";
import ServiceOrders from "./components/service/ServiceOrders";
import ServiceRegister from "./components/service/ServiceRegister";
import ServiceTickets from "./components/service/ServiceTickets";
// Phase 35: Subscriptions
import RecurringTemplates from "./components/subscriptions/RecurringTemplates";
import RenewalAlerts from "./components/subscriptions/RenewalAlerts";
import SubscriptionRegister from "./components/subscriptions/SubscriptionRegister";
// Phase 33: Tally Import
import ImportWizard from "./components/tally-import/ImportWizard";
import MigrationHistory from "./components/tally-import/MigrationHistory";
import BulkSend from "./components/whatsapp-automation/BulkSend";
import DeliveryLog from "./components/whatsapp-automation/DeliveryLog";
import LedgerSummaryWhatsApp from "./components/whatsapp-automation/LedgerSummaryWhatsApp";
import ScheduledQueue from "./components/whatsapp-automation/ScheduledQueue";
// Phase 37: WhatsApp Automation
import WhatsAppDashboard from "./components/whatsapp-automation/WhatsAppDashboard";
import { loadSavedTheme } from "./lib/themeManager";
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
    label: "Dashboard",
    icon: LayoutDashboard,
    fkey: null,
  },
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
  { key: "voucherSales", label: "Sales", icon: ShoppingCart, fkey: "F8" },
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
    key: "featureSettings",
    label: "Feature Settings",
    icon: Settings,
    fkey: null,
  },
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
  // Phase 34: Advanced Analytics
  {
    key: "__header_adv_analytics",
    label: "Advanced Analytics",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "advancedAnalytics",
    label: "Premium Dashboard",
    icon: TrendingUp,
    fkey: null,
  },
  {
    key: "drillDownExplorer",
    label: "Drill-Down Explorer",
    icon: Search,
    fkey: null,
  },
  {
    key: "cashFlowForecast",
    label: "Cash Flow Forecast",
    icon: TrendingUp,
    fkey: null,
  },
  {
    key: "expenseBreakdown",
    label: "Expense Breakdown",
    icon: PieChart,
    fkey: null,
  },
  { key: "plTrend", label: "P&L Trend", icon: BarChart2, fkey: null },
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
  // Phase 21: Project Costing
  {
    key: "__header_project",
    label: "Project Costing",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "projectDashboard",
    label: "Project Dashboard",
    icon: BarChart3,
    fkey: null,
  },
  {
    key: "projectMaster",
    label: "Project Master",
    icon: Briefcase,
    fkey: null,
  },
  {
    key: "projectCostLedger",
    label: "Cost Ledger",
    icon: BookOpen,
    fkey: null,
  },
  { key: "projectPL", label: "Project P&L", icon: TrendingUp, fkey: null },
  {
    key: "__header_customer_portal",
    label: "Customer Portal",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "customerMaster",
    label: "Customer Master",
    icon: UserCheck,
    fkey: null,
  },
  {
    key: "customerLedger",
    label: "Customer Ledger",
    icon: BookOpen,
    fkey: null,
  },
  {
    key: "__header_vendor_portal",
    label: "Vendor Portal",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "vendorMaster", label: "Vendor Master", icon: Users, fkey: null },
  { key: "vendorLedger", label: "Vendor Ledger", icon: BookOpen, fkey: null },
  // Phase 22: Purchase Orders
  {
    key: "__header_purchase_orders",
    label: "Purchase Orders",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "poEntry", label: "Create PO", icon: ShoppingCart, fkey: null },
  { key: "poList", label: "PO List", icon: ClipboardList, fkey: null },
  { key: "poReceipt", label: "PO Receipt", icon: Receipt, fkey: null },
  { key: "poRegister", label: "PO Register", icon: BarChart3, fkey: null },
  // Phase 22: Sales Orders
  {
    key: "__header_sales_orders",
    label: "Sales Orders",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "soEntry", label: "Create SO", icon: ShoppingCart, fkey: null },
  { key: "soList", label: "SO List", icon: ClipboardList, fkey: null },
  { key: "soDispatch", label: "SO Dispatch", icon: Truck, fkey: null },
  { key: "soRegister", label: "SO Register", icon: BarChart3, fkey: null },
  // Phase 23: Compliance
  {
    key: "__header_compliance",
    label: "Compliance",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "ewayBillForm",
    label: "Generate e-Way Bill",
    icon: Truck,
    fkey: null,
  },
  {
    key: "ewayBillList",
    label: "e-Way Bill Register",
    icon: ClipboardList,
    fkey: null,
  },
  {
    key: "eInvoiceForm",
    label: "Generate E-Invoice",
    icon: QrCode,
    fkey: null,
  },
  {
    key: "eInvoiceList",
    label: "E-Invoice Register",
    icon: FileText,
    fkey: null,
  },
  // Phase 23: CRM
  {
    key: "__header_crm",
    label: "CRM",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "leadMaster", label: "Create Lead", icon: UserPlus, fkey: null },
  { key: "leadList", label: "Lead List", icon: Users, fkey: null },
  {
    key: "followUpReminders",
    label: "Follow-up Reminders",
    icon: Bell,
    fkey: null,
  },
  // Phase 24: GST Filing Automation
  {
    key: "__header_gst_filing",
    label: "GST Filing",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "gstFilingDashboard",
    label: "Filing Dashboard",
    icon: Shield,
    fkey: null,
  },
  { key: "gstr1Filing", label: "GSTR-1 Filing", icon: FileText, fkey: null },
  { key: "gstr3bFiling", label: "GSTR-3B Filing", icon: FileText, fkey: null },
  {
    key: "gstFilingHistory",
    label: "Filing History",
    icon: BookOpen,
    fkey: null,
  },
  // Phase 24: POS
  {
    key: "__header_pos",
    label: "Point of Sale",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "posTerminal", label: "POS Terminal", icon: ShoppingCart, fkey: null },
  { key: "posSessions", label: "POS Sessions", icon: Receipt, fkey: null },
  { key: "posRegister", label: "POS Register", icon: BarChart3, fkey: null },
  // Phase 24: Multi-Branch
  {
    key: "__header_branches",
    label: "Multi-Branch",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "branchMaster", label: "Branch Master", icon: Building2, fkey: null },
  { key: "branchTransfer", label: "Branch Transfer", icon: Truck, fkey: null },
  {
    key: "branchReports",
    label: "Branch Reports",
    icon: BarChart3,
    fkey: null,
  },
  // Phase 24: Service Management
  {
    key: "__header_service",
    label: "Service Management",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "serviceMaster", label: "Service Master", icon: Layers, fkey: null },
  {
    key: "serviceOrders",
    label: "Service Orders",
    icon: ClipboardList,
    fkey: null,
  },
  { key: "serviceTickets", label: "Service Tickets", icon: Target, fkey: null },
  {
    key: "serviceRegister",
    label: "Service Register",
    icon: BarChart3,
    fkey: null,
  },
  // Phase 29: Collaboration
  {
    key: "__header_collab",
    label: "Collaboration",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "collabDashboard",
    label: "Dashboard",
    icon: MessageSquare,
    fkey: null,
  },
  {
    key: "voucherComments",
    label: "Entry Comments",
    icon: MessageSquare,
    fkey: null,
  },
  {
    key: "voucherTasks",
    label: "Entry Tasks",
    icon: MessageSquare,
    fkey: null,
  },
  // Phase 31: Event Ledger
  {
    key: "__header_eventledger",
    label: "Event Ledger",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "eventLog", label: "Event Log", icon: History, fkey: null },
  { key: "eventReplay", label: "Event Replay", icon: RefreshCw, fkey: null },
  { key: "undoEngine", label: "Undo Engine", icon: Undo2, fkey: null },
  {
    key: "eventTimeline",
    label: "Event Timeline",
    icon: GitBranch,
    fkey: null,
  },
  { key: "snapshotManager", label: "Snapshots", icon: Camera, fkey: null },
  // Phase 33: Event Ledger Deep Enhancements
  {
    key: "timeTravelReport",
    label: "Time-Travel Report",
    icon: Clock,
    fkey: null,
  },
  { key: "undoRedoStack", label: "Undo/Redo Stack", icon: Undo2, fkey: null },
  { key: "diffViewer", label: "Diff Viewer", icon: GitCompare, fkey: null },
  // Phase 31: Doc Intelligence
  {
    key: "__header_docintel",
    label: "Doc Intelligence",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "documentUpload", label: "Scan Document", icon: ScanLine, fkey: null },
  {
    key: "documentRegister",
    label: "Document Register",
    icon: FileText,
    fkey: null,
  },
  {
    key: "structuredEntry",
    label: "Structured Entry",
    icon: ClipboardEdit,
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
  {
    key: "field-permissions",
    label: "Field Permissions",
    icon: Shield,
    fkey: null,
    adminOnly: true,
  },
  {
    key: "password-policy",
    label: "Password Policy",
    icon: Lock,
    fkey: null,
    adminOnly: true,
  },
  {
    key: "contact-queries",
    label: "Contact Queries",
    icon: MessageSquare,
    fkey: null,
    adminOnly: true,
  },
  {
    key: "premiumFeatures",
    label: "Premium Features",
    icon: Settings,
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
  // Phase 40: Invoice Customizer
  {
    key: "invoiceCustomizer",
    label: "Invoice Customizer",
    icon: Settings,
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
  // Phase 40: Company Branding, Share, Remote DB
  {
    key: "companyBranding",
    label: "Company Branding",
    icon: Upload,
    fkey: null,
  },
  {
    key: "shareCompany",
    label: "Share Company",
    icon: QrCode,
    fkey: null,
  },
  {
    key: "remoteDatabase",
    label: "Remote Database",
    icon: Database,
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
  // Phase 25: Offline & Sync
  {
    key: "__header_offline",
    label: "Offline & Sync",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "offlineSync", label: "Offline Queue", icon: Database, fkey: null },
  { key: "syncHistory", label: "Sync History", icon: FileText, fkey: null },
  // Phase 25: Appearance
  {
    key: "__header_appearance",
    label: "Appearance",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "themeCustomizer",
    label: "Theme Customizer",
    icon: Settings,
    fkey: null,
  },
  {
    key: "customShortcuts",
    label: "My Shortcuts",
    icon: Keyboard,
    fkey: null,
  },
  // Phase 25: Data Management additions
  {
    key: "backupHistory",
    label: "Backup History",
    icon: Database,
    fkey: null,
    adminOnly: true,
  },
  {
    key: "autoBackup",
    label: "Auto Backup Settings",
    icon: Settings,
    fkey: null,
    adminOnly: true,
  },
  // Phase 25: User Profile
  {
    key: "__header_profile",
    label: "My Account",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "userProfile", label: "My Profile", icon: User, fkey: null },
  // Phase 26: Smart Alerts
  {
    key: "__header_smart_alerts",
    label: "Smart Alerts",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "smartAlerts", label: "Alert Dashboard", icon: Bell, fkey: null },
  // Phase 26: Rule Engine
  {
    key: "__header_rule_engine",
    label: "Rule Engine",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "ruleEngine", label: "Automation Rules", icon: Settings, fkey: null },
  // Phase 26: Maker-Checker
  {
    key: "__header_maker_checker",
    label: "Maker-Checker",
    icon: null,
    fkey: null,
    isHeader: true,
    adminOnly: true,
  },
  {
    key: "makerChecker",
    label: "Pending Approvals",
    icon: UserCheck,
    fkey: null,
    adminOnly: true,
  },
  // Phase 32: Compliance Engine
  {
    key: "__header_compliance_engine",
    label: "Compliance Engine",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "compliance-engine", label: "CE Dashboard", icon: Shield, fkey: null },
  {
    key: "gst-error-detector",
    label: "GST Error Detector",
    icon: AlertCircle,
    fkey: null,
  },
  { key: "filing-alerts", label: "Filing Alerts", icon: Bell, fkey: null },
  {
    key: "compliance-score",
    label: "Compliance Score",
    icon: Target,
    fkey: null,
  },
  // Phase 33: Tally Import
  {
    key: "__header_tallyimport",
    label: "Tally Import",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "importWizard", label: "Import Wizard", icon: Upload, fkey: null },
  {
    key: "migrationHistory",
    label: "Migration History",
    icon: History,
    fkey: null,
  },
  // Phase 33: Customization Engine
  {
    key: "__header_customization",
    label: "Customization",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "jsonConfigEditor",
    label: "JSON Config Editor",
    icon: Code,
    fkey: null,
  },
  {
    key: "workflowBuilder",
    label: "Workflow Builder",
    icon: GitBranch,
    fkey: null,
  },
  { key: "customFields", label: "Custom Fields", icon: Settings, fkey: null },
  // Phase 35: HR & Attendance
  {
    key: "__header_hr",
    label: "HR & Attendance",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  { key: "hrDashboard", label: "HR Dashboard", icon: Users, fkey: null },
  { key: "hrEmployees", label: "Employee Master", icon: UserPlus, fkey: null },
  {
    key: "hrAttendance",
    label: "Attendance Register",
    icon: Calendar,
    fkey: null,
  },
  {
    key: "hrLeaves",
    label: "Leave Management",
    icon: ClipboardList,
    fkey: null,
  },
  { key: "hrSalarySlip", label: "Salary Slip", icon: FileText, fkey: null },
  // Phase 35: Asset Maintenance
  {
    key: "__header_asset_maint",
    label: "Asset Maintenance",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "maintenanceSchedule",
    label: "Maintenance Schedule",
    icon: ClipboardEdit,
    fkey: null,
  },
  {
    key: "maintenanceLog",
    label: "Maintenance Log",
    icon: ClipboardList,
    fkey: null,
  },
  {
    key: "amcTracker",
    label: "AMC / Warranty Tracker",
    icon: Shield,
    fkey: null,
  },
  // Phase 36: Advanced Banking
  {
    key: "__header_adv_banking",
    label: "Advanced Banking",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "bankStatementImport",
    label: "Statement Import",
    icon: Upload,
    fkey: null,
  },
  {
    key: "autoReconciliation",
    label: "Auto Reconciliation",
    icon: RefreshCw,
    fkey: null,
  },
  { key: "upiTracker", label: "UPI Tracker", icon: Smartphone, fkey: null },
  {
    key: "chequeRegisterAdv",
    label: "Cheque Register",
    icon: FileText,
    fkey: null,
  },
  { key: "brsReport", label: "BRS Report", icon: BarChart2, fkey: null },
  // Phase 38: Advanced Banking additions
  {
    key: "bankAnalytics",
    label: "Bank Analytics",
    icon: BarChart2,
    fkey: null,
  },
  {
    key: "brsSmartMatch",
    label: "BRS Smart Match",
    icon: RefreshCw,
    fkey: null,
  },
  // Phase 35: Subscriptions
  {
    key: "__header_subscriptions",
    label: "Subscription Billing",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "recurringTemplates",
    label: "Recurring Templates",
    icon: RefreshCw,
    fkey: null,
  },
  {
    key: "subscriptionRegister",
    label: "Subscription Register",
    icon: Receipt,
    fkey: null,
  },
  { key: "renewalAlerts", label: "Renewal Alerts", icon: Bell, fkey: null },
  // Phase 37: E-Commerce
  {
    key: "__header_ecommerce",
    label: "E-Commerce",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "ecommerce-dashboard",
    label: "Dashboard",
    icon: ShoppingBag,
    fkey: null,
  },
  {
    key: "ecommerce-order-import",
    label: "Order Import",
    icon: Upload,
    fkey: null,
  },
  {
    key: "ecommerce-auto-sales",
    label: "Auto Sales Entry",
    icon: ShoppingCart,
    fkey: null,
  },
  {
    key: "ecommerce-inventory-sync",
    label: "Inventory Sync",
    icon: RefreshCw,
    fkey: null,
  },
  {
    key: "ecommerce-profitability",
    label: "Profitability Report",
    icon: TrendingUp,
    fkey: null,
  },
  // Phase 37: WhatsApp Automation
  {
    key: "__header_wa_automation",
    label: "WhatsApp Automation",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "whatsapp-dashboard",
    label: "WA Dashboard",
    icon: MessageCircle,
    fkey: null,
  },
  {
    key: "whatsapp-bulk-send",
    label: "Bulk Send",
    icon: MessageSquare,
    fkey: null,
  },
  {
    key: "whatsapp-ledger-send",
    label: "Ledger Summary",
    icon: BookOpen,
    fkey: null,
  },
  {
    key: "whatsapp-scheduled",
    label: "Scheduled Queue",
    icon: Clock,
    fkey: null,
  },
  {
    key: "whatsapp-delivery-log",
    label: "Delivery Log",
    icon: History,
    fkey: null,
  },
  // Phase 37: Advanced Mobile
  {
    key: "__header_adv_mobile",
    label: "Advanced Mobile",
    icon: null,
    fkey: null,
    isHeader: true,
  },
  {
    key: "mobile-barcode-scan",
    label: "Barcode Scanner",
    icon: QrCode,
    fkey: null,
  },
  {
    key: "mobile-approvals",
    label: "Mobile Approvals",
    icon: UserCheck,
    fkey: null,
  },
  {
    key: "mobile-reports",
    label: "Mobile Reports",
    icon: BarChart2,
    fkey: null,
  },
  // Phase 38: Audit & Compliance
  {
    key: "__header_audit_compliance",
    label: "Audit & Compliance",
    icon: null,
    fkey: null,
    isHeader: true,
    adminOnly: true,
  },
  {
    key: "auditLogViewer",
    label: "Audit Log Viewer",
    icon: Shield,
    fkey: null,
    adminOnly: true,
  },
  {
    key: "tdsManagement",
    label: "TDS Management",
    icon: FileText,
    fkey: null,
    adminOnly: true,
  },
  {
    key: "incomeTaxComputation",
    label: "Income Tax Computation",
    icon: Calculator,
    fkey: null,
    adminOnly: true,
  },
  {
    key: "complianceChecklist",
    label: "Compliance Checklist",
    icon: CheckSquare,
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
  gateway: "Dashboard",
  ledgers: "List of Ledgers",
  voucher: "Journal Entry",
  voucherContra: "Contra Entry",
  voucherPayment: "Payment Entry",
  voucherReceipt: "Receipt Entry",
  voucherSales: "Sales Entry",
  voucherPurchase: "Purchase Entry",
  trialBalance: "Trial Balance",
  dayBook: "Day Book",
  hsnMaster: "HSN / SAC Master",
  gstr1: "GSTR-1 Return",
  gstr3b: "GSTR-3B Return",
  taxLedgers: "Tax Ledger Balances",
  gstSettings: "GST Settings",
  gstVoucher: "GST Entry",
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
  fixedAssetMaster: "Fixed Asset Master",
  assetRegister: "Asset Register",
  costCentreMaster: "Cost Centres",
  costCentreSummary: "Cost Centre Summary",
  currencyMaster: "Currency Master",
  exchangeRates: "Exchange Rates",
  userManagement: "User Management",
  rolePermissions: "Roles & Permissions",
  dataManagement: "Data Management",
  analyticsDashboard: "Business Insights",
  advancedAnalytics: "Premium Dashboard",
  auditTrail: "Audit Trail",
  exportCenter: "Export Center",
  invoiceTemplates: "Invoice Templates",
  paymentGateways: "Payment Gateways",
  bankingAPIs: "Banking API Config",
  invoiceDispatch: "Email/SMS Dispatch",
  aiSettings: "AI Settings",
  aiAnomalyDetector: "AI Anomaly Detector",
  voiceEntry: "Voice Entry",
  whatsAppConfig: "WhatsApp Config",
  reportBuilder: "Report Builder",
  scheduledReports: "Scheduled Reports",
  notifications: "Notification Center",
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
  poEntry: "Create Purchase Order",
  poList: "Purchase Order List",
  poReceipt: "PO Receipt",
  poRegister: "PO Register",
  soEntry: "Create Sales Order",
  soList: "Sales Order List",
  soDispatch: "SO Dispatch",
  soRegister: "SO Register",
  // Phase 23
  ewayBillForm: "Generate e-Way Bill",
  ewayBillList: "e-Way Bill Register",
  eInvoiceForm: "Generate E-Invoice",
  eInvoiceList: "E-Invoice Register",
  leadMaster: "Create Lead",
  leadList: "Lead List",
  followUpReminders: "Follow-up Reminders",
  // Phase 24
  gstFilingDashboard: "GST Filing Dashboard",
  gstr1Filing: "GSTR-1 Filing",
  gstr3bFiling: "GSTR-3B Filing",
  gstFilingHistory: "GST Filing History",
  posTerminal: "POS Terminal",
  posSessions: "POS Sessions",
  posRegister: "POS Sales Register",
  branchMaster: "Branch Master",
  branchTransfer: "Branch Transfer",
  branchReports: "Branch Reports",
  serviceMaster: "Service Master",
  serviceOrders: "Service Orders",
  serviceTickets: "Service Tickets",
  serviceRegister: "Service Register",
  // Phase 25
  offlineSync: "Offline Queue",
  syncHistory: "Sync History",
  themeCustomizer: "Theme Customizer",
  customShortcuts: "My Custom Shortcuts",
  backupHistory: "Backup History",
  autoBackup: "Auto Backup Settings",
  userProfile: "My Profile",
  // Phase 26
  smartAlerts: "Smart Alerts Dashboard",
  ruleEngine: "Rule Engine",
  makerChecker: "Maker-Checker Approvals",
  "compliance-engine": "Compliance Engine Dashboard",
  "gst-error-detector": "GST Error Detector",
  "filing-alerts": "Filing Alerts Dashboard",
  "compliance-score": "Compliance Score",
  "field-permissions": "Field-Level Permissions",
  "password-policy": "Password Policy",
  "contact-queries": "Contact Queries",
  // Phase 37: E-Commerce
  "ecommerce-dashboard": "E-Commerce Dashboard",
  "ecommerce-order-import": "Order Import",
  "ecommerce-auto-sales": "Auto Sales Entry",
  "ecommerce-inventory-sync": "Inventory Sync",
  "ecommerce-profitability": "Order Profitability Report",
  // Phase 37: WhatsApp Automation
  "whatsapp-dashboard": "WhatsApp Dashboard",
  "whatsapp-bulk-send": "Bulk Send",
  "whatsapp-ledger-send": "Ledger Summary Send",
  "whatsapp-scheduled": "Scheduled Queue",
  "whatsapp-delivery-log": "Delivery Log",
  // Phase 37: Advanced Mobile
  "mobile-barcode-scan": "Barcode Scanner",
  "mobile-approvals": "Mobile Approvals",
  "mobile-reports": "Mobile Reports",
  // Phase 38
  bankAnalytics: "Bank Analytics",
  brsSmartMatch: "BRS Smart Match",
  auditLogViewer: "Audit Log Viewer",
  tdsManagement: "TDS Management",
  incomeTaxComputation: "Income Tax Computation",
  complianceChecklist: "Compliance Checklist",
  premiumFeatures: "Premium Features",
  // Phase 40
  invoiceCustomizer: "Invoice Customizer",
  companyBranding: "Company Branding",
  shareCompany: "Share Company",
  remoteDatabase: "Remote Database Bridge",
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
    "poEntry",
    "poList",
    "poReceipt",
    "poRegister",
    "soEntry",
    "soList",
    "soDispatch",
    "soRegister",
    "ewayBillForm",
    "ewayBillList",
    "eInvoiceForm",
    "eInvoiceList",
    "leadMaster",
    "leadList",
    "followUpReminders",
    "smartAlerts",
    "ruleEngine",
    "customShortcuts",
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
    "poList",
    "poRegister",
    "soList",
    "soRegister",
    "ewayBillList",
    "eInvoiceList",
    "leadList",
    "smartAlerts",
    "customShortcuts",
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
    "leadList",
    "customShortcuts",
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
  profilePhoto,
}: {
  activeCompany: Company | null;
  theme: string;
  onToggleTheme: () => void;
  onNavigate: (v: string) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  profilePhoto?: string | null;
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
        className="w-8 h-8 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center hover:bg-teal/30 transition-colors overflow-hidden"
        title="User Profile"
      >
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={14} className="text-teal" />
        )}
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
              data-ocid="app.user_profile.my_profile.button"
              onClick={() => {
                onNavigate("userProfile");
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-foreground hover:bg-secondary/60 transition-colors"
            >
              <User size={13} className="text-muted-foreground" />
              My Profile
            </button>
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

function MobileFAB({ onNavigate }: { onNavigate: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCameraBill = () => {
    cameraInputRef.current?.click();
    setOpen(false);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store captured image and navigate to document upload for OCR
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target?.result as string;
        localStorage.setItem("hk_camera_bill_capture", b64);
        onNavigate("documentUpload");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-50">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
      />
      {open && (
        <div className="flex flex-col gap-2 mb-2">
          {[
            { label: "New Sales", view: "voucherSales" },
            { label: "New Purchase", view: "voucherPurchase" },
            { label: "New Journal", view: "voucher" },
          ].map(({ label, view }) => (
            <button
              key={view}
              type="button"
              onClick={() => {
                onNavigate(view);
                setOpen(false);
              }}
              data-ocid={`fab.${view}.button`}
              className="bg-card border border-border text-foreground text-xs px-3 py-2 rounded-full shadow-lg hover:bg-secondary transition-colors whitespace-nowrap"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCameraBill}
            data-ocid="fab.camera_bill.button"
            className="bg-card border border-teal/40 text-teal text-xs px-3 py-2 rounded-full shadow-lg hover:bg-teal/10 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Camera size={12} /> Camera Bill
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-ocid="mobile.fab.button"
        aria-label="Quick actions"
        className="w-12 h-12 rounded-full bg-teal text-primary-foreground shadow-xl flex items-center justify-center text-xl font-bold hover:opacity-90 transition-opacity"
      >
        {open ? <X size={20} /> : <Plus size={20} />}
      </button>
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
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("hk_sidebar_collapsed") || "{}");
    } catch {
      return {};
    }
  });
  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("hk_sidebar_collapsed", JSON.stringify(next));
      return next;
    });
  };

  // Phase 40: Sidebar hover tooltip state
  const [hoveredNav, setHoveredNav] = useState<{
    key: string;
    label: string;
    x: number;
    y: number;
  } | null>(null);

  // Phase 38: Premium features state
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatureState>(
    () => loadPremiumFeatures(),
  );

  // Listen for premium feature changes
  useEffect(() => {
    const handler = () => setPremiumFeatures(loadPremiumFeatures());
    window.addEventListener("premiumFeaturesChanged", handler);
    return () => window.removeEventListener("premiumFeaturesChanged", handler);
  }, []);

  // Phase 26: GoTo/Help modals
  const [goToOpen, setGoToOpen] = useState(false);

  // Phase 39: Auto fullscreen on desktop for app-like feel
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  const [helpOpen, setHelpOpen] = useState(false);

  // Phase 25: online/offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() =>
    localStorage.getItem("hisabkitab_profile_photo"),
  );

  useEffect(() => {
    loadSavedTheme();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    const onStorage = () =>
      setProfilePhoto(localStorage.getItem("hisabkitab_profile_photo"));
    const onThemeChanged = () => loadSavedTheme();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("storage", onStorage);
    window.addEventListener("themeChanged", onThemeChanged);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("themeChanged", onThemeChanged);
    };
  }, []);

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
    setSidebarOpen(false); // close mobile sidebar on navigation
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
      const isTyping =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;
      const key = e.key;
      // GoTo/Help shortcuts work even without activeCompany (just need to not be typing)
      if (!isTyping && e.altKey) {
        if (key === "d" || key === "D") {
          e.preventDefault();
          setGoToOpen(true);
          return;
        }
        if (key === "h" || key === "H") {
          e.preventDefault();
          setHelpOpen(true);
          return;
        }
        if (key === "p" || key === "P") {
          e.preventDefault();
          window.print();
          return;
        }
        if (key === "x" || key === "X") {
          e.preventDefault();
          navigate("exportCenter");
          return;
        }
        if (key === "m" || key === "M") {
          e.preventDefault();
          navigate("invoiceDispatch");
          return;
        }
      }
      if (!activeCompany) return;
      if (key === "Escape") {
        setGoToOpen(false);
        setHelpOpen(false);
        if (view !== "gateway") navigate("gateway");
        return;
      }
      // Check user custom shortcuts
      const userShortcuts = loadShortcuts(currentUser?.username ?? "");
      for (const sc of userShortcuts) {
        const combo = sc.key.toLowerCase();
        const parts: string[] = [];
        if (e.ctrlKey) parts.push("ctrl");
        if (e.altKey) parts.push("alt");
        if (e.shiftKey) parts.push("shift");
        if (
          !["control", "alt", "shift", "meta"].includes(e.key.toLowerCase())
        ) {
          parts.push(
            e.key.toLowerCase().length === 1
              ? e.key.toLowerCase()
              : e.key.toLowerCase(),
          );
        }
        const pressed = parts.join("+");
        if (pressed === combo) {
          e.preventDefault();
          navigate(sc.screen);
          return;
        }
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
      // Ctrl+letter shortcuts (browser-safe, require activeCompany)
      if (e.ctrlKey && !e.altKey && !e.shiftKey && activeCompany) {
        if (key === "b" || key === "B") {
          e.preventDefault();
          navigate("balanceSheet");
          return;
        }
        if (key === "t" || key === "T") {
          e.preventDefault();
          navigate("trialBalance");
          return;
        }
        if (key === "d" || key === "D") {
          e.preventDefault();
          navigate("dayBook");
          return;
        }
        if (key === "g" || key === "G") {
          e.preventDefault();
          navigate("gstr1");
          return;
        }
        if (key === "i" || key === "I") {
          e.preventDefault();
          navigate("stockSummary");
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeCompany, view, navigate, currentUser]);

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
        {/* Phase 40: Sidebar tooltip portal */}
        {hoveredNav && SIDEBAR_DESCRIPTIONS[hoveredNav.key] && (
          <div
            className="fixed z-[9999] hidden lg:block max-w-xs bg-popover border border-border shadow-lg p-3 pointer-events-none"
            style={{
              left: hoveredNav.x,
              top: hoveredNav.y,
              transform: "translateY(-4px)",
            }}
          >
            <p className="text-[11px] font-semibold text-foreground mb-1">
              {hoveredNav.label}
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {SIDEBAR_DESCRIPTIONS[hoveredNav.key]}
            </p>
          </div>
        )}
        <Toaster />
      </div>
    );
  }

  if (view === "companySelect") {
    return (
      <div className="h-full bg-background" data-theme={theme}>
        <CompanySelection
          onSelectCompany={handleSelectCompany}
          currentUser={currentUser}
        />
        <Toaster />
      </div>
    );
  }

  const filteredNavItems = (() => {
    const base = getFilteredNavItems(currentUser.role);
    // Phase 38: Filter by premium features
    const PREMIUM_SECTION_MAP: Record<string, keyof PremiumFeatureState> = {
      __header_ai_tools: "aiTools",
      __header_wa_automation: "whatsappAutomation",
      __header_docintel: "docIntelligence",
      __header_ecommerce: "ecommerce",
      __header_eventledger: "eventLedger",
      __header_compliance_engine: "smartCompliance",
      __header_customization: "customizationEngine",
      __header_tallyimport: "tallyImport",
      __header_adv_analytics: "advancedAnalytics",
      __header_subscriptions: "subscriptionBilling",
      __header_asset_maint: "assetMaintenance",
      __header_project: "projectCosting",
      __header_branches: "multiBranch",
      __header_crm: "crm",
      __header_adv_mobile: "advancedMobile",
    };
    const result: typeof base = [];
    let skipUntilHeader = false;
    let _currentFeatureKey: keyof PremiumFeatureState | null = null;
    for (const item of base) {
      if (item.isHeader) {
        const featureKey = PREMIUM_SECTION_MAP[item.key];
        if (featureKey !== undefined) {
          if (!premiumFeatures[featureKey]) {
            skipUntilHeader = true;
            _currentFeatureKey = featureKey;
            continue;
          }
        }
        skipUntilHeader = false;
        _currentFeatureKey = null;
        result.push(item);
        continue;
      }
      if (skipUntilHeader) continue;
      result.push(item);
    }
    return result;
  })();

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
    if (view === "featureSettings")
      return <FeatureSettings company={activeCompany} />;
    if (view === "gstVoucher")
      return <GSTVoucherEntry company={activeCompany} />;
    if (view === "balanceSheet")
      return <BalanceSheet company={activeCompany} />;
    if (view === "plAccount") return <PLAccount company={activeCompany} />;
    if (view === "cashFlow")
      return <CashFlowStatement company={activeCompany} />;
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
    if (view === "employeeMaster")
      return <EmployeeMaster company={activeCompany} />;
    if (view === "salaryStructure")
      return <SalaryStructureSetup company={activeCompany} />;
    if (view === "payrollVoucher")
      return <PayrollVoucherEntry company={activeCompany} />;
    if (view === "payrollRegister")
      return <PayrollRegister company={activeCompany} />;
    if (view === "paySlip") return <PaySlip company={activeCompany} />;
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
    if (view === "fixedAssetMaster")
      return <FixedAssetMaster company={activeCompany} />;
    if (view === "assetRegister")
      return <AssetRegister company={activeCompany} />;
    if (view === "costCentreMaster")
      return <CostCentreMaster company={activeCompany} />;
    if (view === "costCentreSummary")
      return <CostCentreSummary company={activeCompany} />;
    if (view === "currencyMaster") return <CurrencyMaster />;
    if (view === "exchangeRates") return <ExchangeRates />;
    if (view === "userManagement") return <UserManagement />;
    if (view === "rolePermissions") return <RolePermissions />;
    if (view === "dataManagement") return <DataManagement />;
    if (view === "analyticsDashboard")
      return <AnalyticsDashboard company={activeCompany} />;
    if (view === "advancedAnalytics")
      return (
        <AdvancedAnalyticsDashboard
          currentUser={currentUser}
          activeCompany={activeCompany}
        />
      );
    if (view === "auditTrail") return <AuditTrail currentUser={currentUser} />;
    if (view === "reportBuilder") return <ReportBuilder />;
    if (view === "scheduledReports") return <ScheduledReports />;
    if (view === "notifications") return <NotificationCenter />;
    if (view === "exportCenter") return <ExportCenter />;
    if (view === "invoiceTemplates") return <InvoiceTemplates />;
    if (view === "paymentGateways") return <PaymentGatewayConfig />;
    if (view === "bankingAPIs") return <BankingAPIConfig />;
    if (view === "invoiceDispatch") return <InvoiceDispatch />;
    if (view === "aiSettings") return <AISettings />;
    if (view === "aiAnomalyDetector")
      return <AIAnomalyDetector company={activeCompany} />;
    if (view === "voiceEntry")
      return <VoiceVoucherEntry company={activeCompany} />;
    if (view === "whatsAppConfig") return <WhatsAppConfig />;
    if (view === "budgetMaster")
      return <BudgetMaster company={activeCompany} />;
    if (view === "budgetVsActual")
      return <BudgetVsActual company={activeCompany} />;
    if (view === "forecasting")
      return <ForecastingDashboard company={activeCompany} />;
    if (view === "consolidatedReports")
      return <ConsolidatedReports currentCompany={activeCompany} />;
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
    if (view === "poEntry")
      return <PurchaseOrderEntry company={activeCompany} />;
    if (view === "poList") return <PurchaseOrderList company={activeCompany} />;
    if (view === "poReceipt")
      return <PurchaseOrderReceipt company={activeCompany} />;
    if (view === "poRegister")
      return <PurchaseOrderRegister company={activeCompany} />;
    if (view === "soEntry") return <SalesOrderEntry company={activeCompany} />;
    if (view === "soList") return <SalesOrderList company={activeCompany} />;
    if (view === "soDispatch")
      return <SalesOrderDispatch company={activeCompany} />;
    if (view === "soRegister")
      return <SalesOrderRegister company={activeCompany} />;
    // Phase 23: Compliance
    if (view === "ewayBillForm") return <EWayBillForm />;
    if (view === "ewayBillList") return <EWayBillList />;
    if (view === "eInvoiceForm") return <EInvoiceForm />;
    if (view === "eInvoiceList") return <EInvoiceList />;
    // Phase 23: CRM
    if (view === "leadMaster") return <LeadMaster />;
    if (view === "leadList") return <LeadList />;
    if (view === "followUpReminders") return <FollowUpReminders />;
    // Phase 24: GST Filing
    if (view === "gstFilingDashboard")
      return <GSTFilingDashboard company={activeCompany} />;
    if (view === "gstr1Filing") return <GSTR1Filing company={activeCompany} />;
    if (view === "gstr3bFiling")
      return <GSTR3BFiling company={activeCompany} />;
    if (view === "gstFilingHistory") return <GSTFilingHistory />;
    // Phase 24: POS
    if (view === "posTerminal") return <POSTerminal company={activeCompany} />;
    if (view === "posSessions") return <POSSessions company={activeCompany} />;
    if (view === "posRegister") return <POSRegister />;
    // Phase 24: Multi-Branch
    if (view === "branchMaster") return <BranchMaster />;
    if (view === "branchTransfer") return <BranchTransfer />;
    if (view === "branchReports") return <BranchReports />;
    // Phase 24: Service Management
    if (view === "serviceMaster") return <ServiceMaster />;
    if (view === "serviceOrders") return <ServiceOrders />;
    if (view === "serviceTickets") return <ServiceTickets />;
    if (view === "serviceRegister") return <ServiceRegister />;
    // Phase 29: Collaboration
    if (view === "collabDashboard") return <CollaborationDashboard />;
    if (view === "voucherComments") return <VoucherComments />;
    if (view === "voucherTasks") return <VoucherTasks />;
    // Phase 31: Event Ledger
    if (view === "eventLog") return <EventLog />;
    if (view === "eventReplay") return <EventReplay />;
    if (view === "undoEngine") return <UndoEngine />;
    if (view === "eventTimeline") return <EventTimeline />;
    if (view === "snapshotManager") return <SnapshotManager />;
    // Phase 33: Event Ledger Deep Enhancements
    if (view === "timeTravelReport") return <TimeTravelReport />;
    if (view === "undoRedoStack") return <UndoRedoStack />;
    if (view === "diffViewer") return <DiffViewer />;
    // Phase 33: Tally Import
    if (view === "importWizard") return <ImportWizard />;
    if (view === "migrationHistory") return <MigrationHistory />;
    // Phase 33: Customization Engine
    if (view === "jsonConfigEditor") return <JSONConfigEditor />;
    if (view === "workflowBuilder") return <WorkflowBuilder />;
    if (view === "customFields") return <CustomFields />;
    // Phase 31: Doc Intelligence
    if (view === "documentUpload") return <DocumentUpload />;
    if (view === "documentRegister") return <DocumentRegister />;
    if (view === "structuredEntry") return <StructuredEntry />;
    // Phase 25: Backup, Offline, Theme, Profile
    if (view === "offlineSync") return <OfflineSync />;
    if (view === "syncHistory") return <SyncHistory />;
    if (view === "themeCustomizer") return <ThemeCustomizer />;
    if (view === "backupHistory") return <BackupHistory />;
    if (view === "autoBackup") return <AutoBackup />;
    if (view === "userProfile") return <UserProfile />;
    if (view === "customShortcuts")
      return <CustomShortcuts username={currentUser?.username ?? "admin"} />;
    // Phase 26
    if (view === "smartAlerts") return <SmartAlerts />;
    if (view === "ruleEngine") return <RuleEngine />;
    if (view === "makerChecker") return <MakerChecker />;
    // Phase 32: Compliance Engine
    if (view === "compliance-engine")
      return <ComplianceEngineDashboard onNavigate={navigate} />;
    if (view === "gst-error-detector") return <GSTErrorDetector />;
    if (view === "filing-alerts") return <FilingAlertsDashboard />;
    if (view === "compliance-score") return <ComplianceScore />;
    if (view === "field-permissions") return <FieldPermissions />;
    if (view === "password-policy") return <PasswordPolicy />;
    if (view === "contact-queries") return <ContactQueries />;
    // Phase 35: HR & Attendance
    if (view === "hrDashboard") return <HRDashboard />;
    if (view === "hrEmployees") return <HREmployeeMaster />;
    if (view === "hrAttendance") return <AttendanceRegister />;
    if (view === "hrLeaves") return <LeaveManagement />;
    if (view === "hrSalarySlip") return <SalarySlip />;
    // Phase 35: Asset Maintenance
    if (view === "maintenanceSchedule") return <MaintenanceSchedule />;
    if (view === "maintenanceLog") return <MaintenanceLog />;
    if (view === "amcTracker") return <AMCTracker />;
    // Phase 35: Subscriptions
    if (view === "recurringTemplates") return <RecurringTemplates />;
    if (view === "subscriptionRegister") return <SubscriptionRegister />;
    if (view === "renewalAlerts") return <RenewalAlerts />;
    // Phase 37: E-Commerce
    if (view === "ecommerce-dashboard")
      return <ECommerceDashboard onNavigate={navigate} />;
    if (view === "ecommerce-order-import") return <OrderImport />;
    if (view === "ecommerce-auto-sales") return <AutoSalesEntry />;
    if (view === "ecommerce-inventory-sync") return <InventorySync />;
    if (view === "ecommerce-profitability") return <OrderProfitability />;
    // Phase 37: WhatsApp Automation
    if (view === "whatsapp-dashboard") return <WhatsAppDashboard />;
    if (view === "whatsapp-bulk-send") return <BulkSend />;
    if (view === "whatsapp-ledger-send") return <LedgerSummaryWhatsApp />;
    if (view === "whatsapp-scheduled") return <ScheduledQueue />;
    if (view === "whatsapp-delivery-log") return <DeliveryLog />;
    // Phase 37: Advanced Mobile
    if (view === "mobile-barcode-scan") return <BarcodeScanner />;
    if (view === "mobile-approvals") return <MobileApprovals />;
    if (view === "mobile-reports") return <MobileReports />;
    // Phase 36: Advanced Banking
    if (view === "bankStatementImport") return <BankStatementImport />;
    if (view === "autoReconciliation") return <AutoReconciliation />;
    if (view === "upiTracker") return <UPITracker />;
    if (view === "chequeRegisterAdv") return <ChequeRegisterAdv />;
    if (view === "brsReport") return <BRSReport />;
    // Phase 36: Advanced Analytics Drill-Down
    if (view === "drillDownExplorer") return <DrillDownExplorer />;
    if (view === "cashFlowForecast") return <CashFlowForecast />;
    if (view === "expenseBreakdown") return <ExpenseBreakdown />;
    if (view === "plTrend") return <PLTrend />;
    // Phase 38: Advanced Banking additions
    if (view === "bankAnalytics") return <BankAnalytics />;
    if (view === "brsSmartMatch") return <BRSSmartMatch />;
    // Phase 38: Audit & Compliance
    if (view === "auditLogViewer") return <AuditLogViewer />;
    if (view === "tdsManagement") return <TDSManagement />;
    if (view === "incomeTaxComputation") return <IncomeTaxComputation />;
    if (view === "complianceChecklist") return <ComplianceChecklist />;
    // Phase 38: Premium Features
    if (view === "premiumFeatures") return <PremiumFeatures />;
    // Phase 40: New features
    if (view === "invoiceCustomizer") return <InvoiceCustomizer />;
    if (view === "companyBranding") return <CompanyBranding />;
    if (view === "shareCompany")
      return <ShareCompany company={activeCompany} />;
    if (view === "remoteDatabase") return <RemoteDatabaseConfig />;
    if (view.startsWith("voucher")) {
      const vType = VOUCHER_TYPE_MAP[view] || "Journal";
      return (
        <VoucherEntry key={view} company={activeCompany} defaultType={vType} />
      );
    }
    return <GatewayHome company={activeCompany} onNavigate={navigate} />;
  };

  // Sidebar content — shared between desktop and mobile overlay
  const sidebarContent = (
    <>
      <div className="px-3 py-2 border-b border-sidebar-border bg-sidebar">
        <div className="text-[10px] text-sidebar-muted uppercase tracking-wide">
          Current Period
        </div>
        <div className="text-[11px] text-sidebar-foreground font-medium mt-0.5">
          {activeCompany?.financialYearStart} –{" "}
          {activeCompany?.financialYearEnd}
        </div>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {(() => {
          let currentHeaderKey = "";
          return filteredNavItems.map((item, i) => {
            if (item.isHeader) {
              currentHeaderKey = item.key;
              const isCollapsed = collapsedSections[item.key] ?? false;
              return (
                <button
                  type="button"
                  key={`hdr_${item.label}`}
                  className="hk-section-header flex items-center gap-1.5 relative pl-3 cursor-pointer select-none hover:opacity-80 transition-opacity"
                  onClick={() => toggleSection(item.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      toggleSection(item.key);
                  }}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-teal/60 rounded-r-sm" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown
                    size={11}
                    className={`mr-2 text-muted-foreground transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                  />
                </button>
              );
            }
            if (item.key.startsWith("__")) return null;
            if (collapsedSections[currentHeaderKey]) return null;
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                type="button"
                key={`nav_${item.key}_${i}`}
                data-ocid={`nav.${item.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}.link`}
                className={`hk-menu-item w-full relative ${isActive ? "active border-l-2 border-teal" : "border-l-2 border-transparent"}`}
                onClick={() => navigate(item.key)}
                onMouseEnter={(e) => {
                  if (SIDEBAR_DESCRIPTIONS[item.key]) {
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    setHoveredNav({
                      key: item.key,
                      label: item.label,
                      x: rect.right + 8,
                      y: rect.top,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {Icon && (
                  <Icon
                    size={12}
                    className={`flex-shrink-0 ${isActive ? "text-teal" : ""}`}
                  />
                )}
                <span className="flex-1 truncate text-left">{item.label}</span>
                {item.fkey && <span className="hk-key-badge">{item.fkey}</span>}
              </button>
            );
          });
        })()}
      </nav>
    </>
  );

  return (
    <div className="h-full flex flex-col bg-background" data-theme={theme}>
      {/* TOP BAR */}
      <header className="h-14 flex items-center px-3 gap-2 bg-topbar border-b border-border flex-shrink-0">
        {/* Hamburger — mobile/tablet only */}
        <button
          type="button"
          data-ocid="app.sidebar.open_modal_button"
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-sm hover:bg-secondary/60 transition-colors flex-shrink-0"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} className="text-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal flex items-center justify-center rounded-sm flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="text-[15px] font-bold text-foreground tracking-tight hidden sm:inline">
            HisabKitab Pro
          </span>
          <span className="text-[15px] font-bold text-foreground tracking-tight sm:hidden">
            HKPro
          </span>
          <span className="text-[10px] text-muted-foreground font-mono ml-1">
            v42.0
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="hidden lg:flex items-center gap-2 flex-shrink-0 max-w-[220px]">
          <Building2 size={13} className="text-teal flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-semibold text-foreground truncate leading-tight max-w-[160px]">
              {activeCompany?.name ?? "No Company"}
            </span>
            {activeCompany && (
              <span className="text-[9px] text-muted-foreground leading-tight">
                FY: {activeCompany.financialYearStart} to{" "}
                {activeCompany.financialYearEnd}
              </span>
            )}
          </div>
        </div>

        {/* Phase 38: Global Search */}
        <GlobalSearch navItems={NAV_ITEMS} onNavigate={navigate} />

        <div className="flex-1" />

        <div className="hidden sm:block text-[11px] text-muted-foreground border border-border/60 px-2 py-1 bg-secondary/30 truncate max-w-[160px]">
          {VIEW_LABELS[view] || view}
        </div>

        <button
          type="button"
          data-ocid="app.company.button"
          onClick={() => navigate("companySelect")}
          className="hidden sm:block text-[11px] font-medium px-3 py-1 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 transition-colors flex-shrink-0"
        >
          F3: Company
        </button>

        <ThemeToggle theme={theme} onToggle={toggleTheme} />

        {/* Phase 25: Online/Offline indicator */}
        <div
          title={isOnline ? "Online" : "Offline"}
          className={`w-2.5 h-2.5 rounded-full border border-background flex-shrink-0 ${isOnline ? "bg-green-500" : "bg-red-500"}`}
        />
        {/* Phase 39: Mobile Search Icon */}
        <button
          type="button"
          onClick={() => setGoToOpen(true)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-sm hover:bg-secondary/60 transition-colors"
          title="Search"
          data-ocid="app.mobile_search.button"
          aria-label="Search"
        >
          <Search size={16} className="text-foreground" />
        </button>
        {/* Phase 38: Notification Bell with badge */}
        <button
          type="button"
          onClick={() => navigate("notifications")}
          className="relative w-8 h-8 flex items-center justify-center rounded-sm hover:bg-secondary/60 transition-colors"
          title="Notifications"
          data-ocid="app.notifications.button"
        >
          <Bell size={15} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-topbar" />
        </button>
        <UserProfileDropdown
          activeCompany={activeCompany}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigate={navigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          profilePhoto={profilePhoto}
        />
      </header>

      {/* Phase 38: Breadcrumb */}
      {activeCompany && view !== "gateway" && (
        <div className="hidden lg:flex h-7 items-center px-3 gap-1.5 border-b border-border/50 bg-secondary/20 flex-shrink-0">
          <span className="text-[10px] text-muted-foreground">
            HisabKitab Pro
          </span>
          <span className="text-[10px] text-muted-foreground">/</span>
          <span className="text-[10px] text-muted-foreground">
            {NAV_ITEMS.find(
              (n) => !n.isHeader && n.key === view && !n.key.startsWith("__"),
            )
              ? (() => {
                  let section = "";
                  for (const item of NAV_ITEMS) {
                    if (item.isHeader) section = item.label;
                    if (!item.isHeader && item.key === view) return section;
                  }
                  return "General";
                })()
              : "General"}
          </span>
          <span className="text-[10px] text-muted-foreground">/</span>
          <span className="text-[10px] font-medium text-foreground">
            {VIEW_LABELS[view] || view}
          </span>
        </div>
      )}

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay backdrop */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close menu"
            data-ocid="app.sidebar.modal"
            className="fixed inset-0 bg-black/60 z-40 lg:hidden cursor-default"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR — desktop: always visible; mobile: overlay slide-in */}
        <aside
          className={[
            "bg-sidebar border-r border-sidebar-border flex flex-col",
            // Desktop: static in layout
            "lg:relative desktop-sidebar lg:flex-shrink-0 lg:translate-x-0 lg:z-auto",
            // Mobile: fixed overlay
            "fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-200",
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          {/* Mobile sidebar header with close button */}
          <div className="lg:hidden flex items-center justify-between px-3 h-14 border-b border-sidebar-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-teal flex items-center justify-center rounded-sm">
                <span className="text-primary-foreground font-bold text-xs">
                  H
                </span>
              </div>
              <span className="text-[13px] font-bold text-foreground">
                HisabKitab Pro
              </span>
            </div>
            <button
              type="button"
              data-ocid="app.sidebar.close_button"
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-secondary/60 transition-colors"
            >
              <X size={16} className="text-foreground" />
            </button>
          </div>

          {sidebarContent}
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Command Strip — hidden on small screens */}
          <div className="hidden lg:flex h-9 items-center gap-1 px-3 border-b border-border bg-card flex-shrink-0">
            {(
              [
                {
                  label: "Go To",
                  shortcut: "Alt+D",
                  Icon: LayoutDashboard,
                  action: () => setGoToOpen(true),
                  ocid: "app.goto.button",
                },
                {
                  label: "Print",
                  shortcut: "Alt+P",
                  Icon: Printer,
                  action: () => window.print(),
                  ocid: "app.print.button",
                },
                {
                  label: "Export",
                  shortcut: "Alt+X",
                  Icon: Download,
                  action: () => navigate("exportCenter"),
                  ocid: "app.export.button",
                },
                {
                  label: "E-Mail",
                  shortcut: "Alt+M",
                  Icon: Mail,
                  action: () => navigate("invoiceDispatch"),
                  ocid: "app.email.button",
                },
                {
                  label: "Help",
                  shortcut: "Alt+H",
                  Icon: HelpCircle,
                  action: () => setHelpOpen(true),
                  ocid: "app.help.button",
                },
              ] as const
            ).map(({ label, shortcut, Icon, action, ocid }) => (
              <button
                type="button"
                key={label}
                className="cmd-btn"
                onClick={action}
                data-ocid={ocid}
              >
                <Icon size={11} />
                <span className="hidden sm:inline">{label}</span>
                <span className="hk-key-badge ml-1">{shortcut}</span>
              </button>
            ))}
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
          <main className="flex-1 overflow-auto relative pb-16 lg:pb-0">
            {renderMain()}
          </main>

          {/* BOTTOM STATUS BAR */}
          <footer className="h-8 flex items-center px-4 gap-6 border-t border-border bg-secondary/30 flex-shrink-0">
            <span className="text-[10px] font-mono text-muted-foreground">
              Ver. 43.0
            </span>
            <div className="hidden md:flex items-center gap-4 text-[10px] text-muted-foreground">
              {[
                { key: "Alt+H", label: "Help" },
                { key: "F2", label: "Date" },
                { key: "F3", label: "Company" },
                { key: "F7", label: "Journal" },
                { key: "ESC", label: "Back" },
              ].map((s) => (
                <span key={s.key}>
                  <span className="hk-key-badge mr-1">{s.key}</span>
                  {s.label}
                </span>
              ))}
            </div>
            <div className="flex-1" />
            <span className="text-[9px] text-muted-foreground/50 italic hidden md:block">
              This project is independently developed and not affiliated with
              Tally Solutions.
            </span>
            <div className="flex-1" />
            {currentUser && (
              <span className="text-[10px] text-muted-foreground/60">
                <span className="hidden sm:inline">Logged in as </span>
                <span className="text-teal/70 font-medium">
                  {currentUser.username}
                </span>{" "}
                <span className="hidden sm:inline">({currentUser.role})</span>
              </span>
            )}
          </footer>
        </div>
      </div>

      {/* GoTo Modal */}
      {goToOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center pt-24"
          onClick={() => setGoToOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setGoToOpen(false);
          }}
          aria-modal="true"
          data-ocid="app.goto.modal"
        >
          <div
            className="w-full max-w-md bg-card border border-border shadow-xl rounded"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="p-3 border-b border-border">
              <div className="text-xs text-muted-foreground mb-2 font-mono">
                Alt+D: Go To — type to search
              </div>
              <input
                type="text"
                className="w-full bg-secondary/50 border border-border rounded px-3 py-2 text-sm text-foreground outline-none focus:border-teal/60"
                placeholder="Search screens..."
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  const list = document.getElementById("goto-results");
                  if (!list) return;
                  for (const btn of Array.from(
                    list.querySelectorAll("button[data-key]"),
                  )) {
                    const label =
                      (btn as HTMLButtonElement).textContent?.toLowerCase() ??
                      "";
                    (btn as HTMLElement).style.display = label.includes(q)
                      ? ""
                      : "none";
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setGoToOpen(false);
                }}
                data-ocid="app.goto.search_input"
              />
            </div>
            <div id="goto-results" className="max-h-64 overflow-y-auto py-1">
              {NAV_ITEMS.filter(
                (n) => !n.isHeader && !n.key.startsWith("__"),
              ).map((item, i) => (
                <button
                  type="button"
                  // biome-ignore lint/suspicious/noArrayIndexKey: nav list
                  key={i}
                  data-key={item.key}
                  className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-teal/10 flex items-center gap-2"
                  onClick={() => {
                    navigate(item.key);
                    setGoToOpen(false);
                  }}
                >
                  {item.icon && (
                    <item.icon
                      size={11}
                      className="text-muted-foreground flex-shrink-0"
                    />
                  )}
                  {item.label}
                  {item.fkey && (
                    <span className="ml-auto hk-key-badge">{item.fkey}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {helpOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          onClick={() => setHelpOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setHelpOpen(false);
          }}
          aria-modal="true"
          data-ocid="app.help.modal"
        >
          <div
            className="w-full max-w-lg bg-card border border-border shadow-xl rounded"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                Keyboard Shortcuts — HisabKitab Pro
              </span>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
                data-ocid="app.help.close_button"
              >
                ✕
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {[
                ["F1", "Create Ledger"],
                ["F4", "Contra Entry"],
                ["F5", "Payment Entry"],
                ["F6", "Receipt Entry"],
                ["F7", "Journal Entry"],
                ["F8", "Sales Entry"],
                ["F9", "Purchase Entry"],
                ["ESC", "Go Back / Close"],
                ["Alt+D", "Go To / Dashboard"],
                ["Alt+P", "Print current view"],
                ["Alt+X", "Export Center"],
                ["Alt+M", "Email / Dispatch"],
                ["Alt+H", "Help (this screen)"],
                ["Alt+C", "Create (action)"],
                ["F3", "Company Select"],
                ["Alt+Z", "Alter Company"],
                ["Ctrl+B", "Balance Sheet"],
                ["Ctrl+T", "Trial Balance"],
                ["Ctrl+D", "Day Book"],
                ["Ctrl+G", "GSTR-1 Report"],
                ["Ctrl+I", "Inventory Summary"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="hk-key-badge text-[10px] min-w-[40px] text-center">
                    {key}
                  </span>
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4 text-[10px] text-muted-foreground border-t border-border pt-3">
              Shortcuts are disabled when cursor is inside an input, textarea,
              or select field.
            </div>
          </div>
        </div>
      )}
      {/* Sidebar tooltip portal — authenticated app */}
      {hoveredNav && SIDEBAR_DESCRIPTIONS[hoveredNav.key] && (
        <div
          className="fixed z-[9999] hidden lg:block max-w-xs bg-popover border border-border shadow-lg p-3 pointer-events-none"
          style={{
            left: hoveredNav.x,
            top: hoveredNav.y,
            transform: "translateY(-4px)",
          }}
        >
          <p className="text-[11px] font-semibold text-foreground mb-1">
            {hoveredNav.label}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {SIDEBAR_DESCRIPTIONS[hoveredNav.key]}
          </p>
        </div>
      )}
      <Toaster />
      {/* Phase 32: Mobile Bottom Nav */}
      {currentUser && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around h-16 px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          {[
            { icon: LayoutDashboard, label: "Dashboard", key: "gateway" },
            { icon: Receipt, label: "Entries", key: "voucher" },
            { icon: BarChart3, label: "Reports", key: "balanceSheet" },
            { icon: Bell, label: "Alerts", key: "smartAlerts" },
          ].map(({ icon: Icon, label, key: k }) => (
            <button
              key={k}
              type="button"
              onClick={() => navigate(k)}
              data-ocid={`mobile_nav.${k}.link`}
              className={`flex flex-col items-center gap-1 flex-1 pb-1 pt-2 transition-colors ${activeNav === k ? "text-teal" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            data-ocid="mobile_nav.menu.button"
            className="flex flex-col items-center gap-1 flex-1 pb-1 pt-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu size={22} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </nav>
      )}
      {/* Phase 32: Mobile FAB */}
      {currentUser && activeCompany && <MobileFAB onNavigate={navigate} />}
    </div>
  );
}
