import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Command,
  FileText,
  Keyboard,
  Shield,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "F1", desc: "Create Ledger — opens the ledger creation form" },
  { key: "F2", desc: "Display Ledger — view existing ledger list" },
  { key: "F3", desc: "Create Company / Select Company — company management" },
  { key: "F4", desc: "Contra Voucher — cash/bank contra entries" },
  { key: "F5", desc: "Payment Voucher — record outgoing payments" },
  { key: "F6", desc: "Receipt Voucher — record incoming receipts" },
  { key: "F7", desc: "Journal Voucher — general journal adjustments" },
  { key: "F8", desc: "Sales Voucher — create sales entries" },
  { key: "F9", desc: "Purchase Voucher — record purchases" },
  { key: "F10", desc: "GST Invoice Entry — GST-compliant sales/purchase" },
  { key: "Alt+C", desc: "Create action — trigger creation in any module" },
  { key: "Alt+Z", desc: "Alter Company — modify current company settings" },
  { key: "Ctrl+N", desc: "New Company — create a new company" },
  { key: "G", desc: "Go To — opens screen navigator (search any module)" },
  { key: "E", desc: "Export — opens Export Center for reports" },
  { key: "M", desc: "E-Mail — opens Email/SMS Dispatch" },
  { key: "H", desc: "Help — shows keyboard shortcuts reference" },
  { key: "Escape", desc: "Close modal / Go back to Gateway" },
  { key: "↑ ↓", desc: "Arrow keys — navigate lists and menus" },
];

const NAV_SECTIONS = [
  {
    title: "Gateway / Dashboard",
    desc: "Home screen with KPIs: revenue, expenses, outstanding receivables/payables, and quick access to all modules.",
  },
  {
    title: "Masters — Ledger",
    desc: "Create and manage Chart of Accounts. Supports ledger groups, GST applicability, opening balances.",
  },
  {
    title: "Masters — Tax, HSN, Cost Centre, Currency",
    desc: "Configure tax rates, HSN/SAC codes for GST, cost centre allocation, multi-currency rates.",
  },
  {
    title: "Vouchers (6 types)",
    desc: "Contra (F4), Payment (F5), Receipt (F6), Journal (F7), Sales (F8), Purchase (F9). Full double-entry accounting.",
  },
  {
    title: "GST Invoice Entry",
    desc: "GST-compliant voucher with GSTIN, HSN, tax breakup (CGST/SGST/IGST). Auto-populates GSTR-1.",
  },
  {
    title: "Reports — Balance Sheet, P&L, Trial Balance",
    desc: "Standard financial statements computed from posted vouchers. Export to CSV/PDF.",
  },
  {
    title: "Reports — Day Book, Cash Flow, GSTR-1, GSTR-3B",
    desc: "Day Book shows all transactions by date. GSTR-1/3B auto-populated from GST vouchers.",
  },
  {
    title: "Inventory",
    desc: "Stock Groups, Stock Items, Stock Vouchers (Receipt/Issue/Transfer), Stock Summary & Ledger.",
  },
  {
    title: "Payroll",
    desc: "Employee Master, Salary Structure, Payroll Voucher processing, Payroll Register, Pay Slip generation.",
  },
  {
    title: "Banking",
    desc: "Bank Accounts, Bank Statement import, Reconciliation, Cheque Management & Register.",
  },
  {
    title: "Fixed Assets",
    desc: "Asset Master with depreciation schedules, Asset Register showing book value & WDV.",
  },
  {
    title: "Cost Centres",
    desc: "Allocate expenses/income to departments or projects. Cost Centre Summary report.",
  },
  {
    title: "Multi-Currency",
    desc: "Currency Master, Exchange Rate management. Foreign currency vouchers with forex gain/loss.",
  },
  {
    title: "Security",
    desc: "Role Permissions (Admin/Accountant/Auditor/Viewer), User Management, Maker-Checker workflow, Field Permissions, Password Policy.",
  },
  {
    title: "Data Management",
    desc: "Backup & Export (JSON/CSV), Import/Restore, Data Validation, Auto Backup, Backup History.",
  },
  {
    title: "Analytics & Audit",
    desc: "Business Insights dashboard with charts. Audit Trail logs all actions with timestamps.",
  },
  {
    title: "Advanced Reporting",
    desc: "Report Builder for custom reports, Scheduled Reports with email delivery.",
  },
  {
    title: "Notifications",
    desc: "Notification Center for system alerts, due dates, and reminders.",
  },
  {
    title: "Export Center & Invoice Templates",
    desc: "Export any report to CSV/PDF. Three invoice templates: Classic, Modern, Minimal.",
  },
  {
    title: "Integrations",
    desc: "Payment Gateway config, Banking API, Email/SMS Dispatch, WhatsApp Business API.",
  },
  {
    title: "AI Tools",
    desc: "AI Settings (OpenAI key), Anomaly Detector, Voice Entry (Hindi/Hinglish), AI Narration.",
  },
  {
    title: "Budgeting & Forecasting",
    desc: "Budget Master, Budget vs Actual with variance analysis, Forecasting Dashboard.",
  },
  {
    title: "Multi-Company",
    desc: "Manage multiple companies. Consolidated Balance Sheet and P&L across entities.",
  },
  {
    title: "Project Costing",
    desc: "Project Master, Cost Ledger allocation, Project P&L with margin analysis.",
  },
  {
    title: "Customer Portal",
    desc: "Customer Master, Customer Ledger with 5-bucket aging analysis (Current to 90+ days).",
  },
  {
    title: "Vendor Portal",
    desc: "Vendor Master (with GSTIN), Vendor Ledger with payables aging report.",
  },
  {
    title: "Purchase Orders",
    desc: "Create PO, PO List, PO Receipt (GRN), PO Register.",
  },
  {
    title: "Sales Orders",
    desc: "Create SO, SO List, SO Dispatch, SO Register.",
  },
  {
    title: "Compliance",
    desc: "e-Way Bill generation & register, GST E-Invoice with IRN generation.",
  },
  {
    title: "GST Filing Automation",
    desc: "Filing Dashboard with due-date alerts, GSTR-1 & GSTR-3B filing screens, Filing History.",
  },
  {
    title: "CRM",
    desc: "Lead Master, Lead List with status tracking, Follow-up Reminders, Convert to Customer.",
  },
  {
    title: "POS Terminal",
    desc: "Point-of-Sale billing with cart, discount, Cash/Card/UPI modes, session management.",
  },
  {
    title: "Multi-Branch",
    desc: "Branch Master, inter-branch Stock/Fund transfers, Branch-wise P&L & Stock Reports.",
  },
  {
    title: "Service Management",
    desc: "Service Master, Service Orders (job cards), Service Tickets (Kanban), Service Register.",
  },
  {
    title: "Collaboration",
    desc: "Voucher Comments, Voucher Tasks — assign work to team members, track progress.",
  },
  {
    title: "Compliance Engine (Phase 32)",
    desc: "Smart GST Error Detector, Filing Alerts Dashboard, Compliance Score — proactive compliance management.",
  },
  {
    title: "Event Ledger",
    desc: "Event-sourced accounting — full event log, time-travel replay, undo engine, snapshot manager.",
  },
  {
    title: "Doc Intelligence",
    desc: "OCR document upload, auto-extract GST/vendor/amount, structured entry creation.",
  },
  {
    title: "Offline & Sync",
    desc: "IndexedDB offline queue, sync when online, Sync History.",
  },
  {
    title: "Appearance",
    desc: "Theme Customizer (8 color themes), My Profile, Custom Keyboard Shortcuts per user.",
  },
];

const GST_ITEMS = [
  {
    title: "GSTR-1",
    desc: "Monthly outward supply return. Auto-populated from Sales & GST vouchers. Due on 11th of next month.",
  },
  {
    title: "GSTR-3B",
    desc: "Monthly summary return with tax payment. Due on 20th of next month.",
  },
  {
    title: "GSTR-9",
    desc: "Annual return. Due by 31st December after financial year end.",
  },
  {
    title: "e-Way Bill",
    desc: "Generate e-Way Bill for goods movement > ₹50,000. Includes transporter details, vehicle number.",
  },
  {
    title: "GST E-Invoice",
    desc: "Generate IRN (Invoice Reference Number) for B2B invoices. Includes QR code placeholder.",
  },
  {
    title: "Smart Compliance Engine",
    desc: "Auto-detects GST errors: missing GSTIN, invalid HSN, wrong tax rate, duplicate invoice numbers. Shows compliance score.",
  },
  {
    title: "Filing Alerts",
    desc: "Color-coded due date alerts: Red (<3 days), Yellow (3–7 days), Green (>7 days). Mark as Filed per return.",
  },
];

const AI_ITEMS = [
  {
    title: "AI Settings",
    desc: "Enter your OpenAI API key (stored only in browser localStorage — never in code or server).",
  },
  {
    title: "AI Narration",
    desc: "Click ✨ AI Narration in any Voucher Entry to auto-generate professional narration text.",
  },
  {
    title: "Anomaly Detector",
    desc: "Scans vouchers for: duplicate entries, unusually large round numbers (>₹1L), high-frequency days. Each flag has an AI Explain button.",
  },
  {
    title: "Voice Entry",
    desc: 'Click mic icon, speak "Paid ₹5000 to Ram via cash" in English or Hindi — auto-creates voucher form.',
  },
  {
    title: "Explain with AI",
    desc: "On Balance Sheet, P&L, Trial Balance — click Explain with AI to get plain-language insights from GPT.",
  },
  {
    title: "Doc Intelligence (OCR)",
    desc: "Upload an invoice image — OCR extracts vendor, amount, date, GST details automatically.",
  },
];

function GuideCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-3 border border-border rounded bg-card/50 space-y-1">
      <div className="text-xs font-semibold text-foreground">{title}</div>
      <div className="text-[11px] text-muted-foreground leading-relaxed">
        {desc}
      </div>
    </div>
  );
}

export default function QuickGuideModal({ open, onClose }: Props) {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const q = search.toLowerCase();

  const filteredShortcuts = SHORTCUTS.filter(
    (s) => s.key.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q),
  );
  const filteredNav = NAV_SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q),
  );
  const filteredGST = GST_ITEMS.filter(
    (s) =>
      s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q),
  );
  const filteredAI = AI_ITEMS.filter(
    (s) =>
      s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q),
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      data-ocid="quick_guide.modal"
    >
      <div
        className="w-full max-w-3xl bg-card border border-border rounded-lg shadow-2xl flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-teal" />
            <span className="text-sm font-bold text-foreground">
              Quick Guide — HisabKitab Pro
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guide..."
              className="h-7 text-xs w-48"
              data-ocid="quick_guide.search_input"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-7 w-7 p-0"
              data-ocid="quick_guide.close_button"
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="getting-started"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-4 mt-3 h-8 flex-shrink-0">
            <TabsTrigger value="getting-started" className="text-[10px]">
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="text-[10px]">
              <Keyboard size={10} className="mr-1" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="navigation" className="text-[10px]">
              <Command size={10} className="mr-1" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="gst" className="text-[10px]">
              <Shield size={10} className="mr-1" />
              GST
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-[10px]">
              <Zap size={10} className="mr-1" />
              AI & Voice
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-4 pb-4">
            <TabsContent value="getting-started" className="mt-3 space-y-3">
              <GuideCard
                title="What is HisabKitab Pro?"
                desc="A production-grade ERP system for Indian businesses — inspired by Tally Prime. Covers double-entry accounting, GST compliance, inventory, payroll, banking, CRM, POS, and 30+ integrated modules."
              />
              <GuideCard
                title="How to Login"
                desc="Use username: admin and password: admin123 for the default admin account. Or create users in Security → User Management. Login supports backend auth with localStorage fallback."
              />
              <GuideCard
                title="How to Create a Company"
                desc="After login, you'll see Company Selection. Click Create New Company, fill in company name, financial year dates, GSTIN. Press F3 anytime to switch companies."
              />
              <GuideCard
                title="Basic Workflow"
                desc="1. Create ledgers (F1) → 2. Enter vouchers (F4–F9) → 3. View reports (Balance Sheet, P&L, Trial Balance) → 4. File GST returns (GSTR-1 on 11th, GSTR-3B on 20th)."
              />
              <GuideCard
                title="Keyboard-First Design"
                desc="HisabKitab Pro is designed for keyboard efficiency. Use F-keys for modules, G to navigate anywhere, H for help. All keyboard shortcuts work when not in an input field."
              />
              <GuideCard
                title="Roles & Access"
                desc="Admin: full access. Accountant: all accounting modules. Auditor: read-only reports. Viewer: limited dashboard access. Admin manages users in Security → User Management."
              />
            </TabsContent>

            <TabsContent value="shortcuts" className="mt-3">
              {filteredShortcuts.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No shortcuts match your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredShortcuts.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-start gap-3 p-2 border border-border rounded bg-card/40"
                    >
                      <Badge className="text-[9px] px-1.5 py-0.5 bg-teal/20 text-teal border-teal/40 font-mono flex-shrink-0">
                        {s.key}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {s.desc}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="navigation" className="mt-3 space-y-2">
              {filteredNav.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No sections match your search.
                </div>
              ) : (
                filteredNav.map((s) => (
                  <GuideCard key={s.title} title={s.title} desc={s.desc} />
                ))
              )}
            </TabsContent>

            <TabsContent value="gst" className="mt-3 space-y-2">
              {filteredGST.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No GST items match your search.
                </div>
              ) : (
                filteredGST.map((s) => (
                  <GuideCard key={s.title} title={s.title} desc={s.desc} />
                ))
              )}
            </TabsContent>

            <TabsContent value="ai" className="mt-3 space-y-2">
              {filteredAI.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No AI items match your search.
                </div>
              ) : (
                filteredAI.map((s) => (
                  <GuideCard key={s.title} title={s.title} desc={s.desc} />
                ))
              )}
              <div className="p-3 border border-yellow-500/30 rounded bg-yellow-500/5 text-[11px] text-yellow-400">
                <FileText size={10} className="inline mr-1" />
                AI features require your OpenAI API key. Go to AI Tools → AI
                Settings after login to configure.
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
