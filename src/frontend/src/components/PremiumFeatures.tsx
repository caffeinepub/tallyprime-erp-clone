import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Activity,
  BarChart2,
  BarChart3,
  Bot,
  Building2,
  Clock,
  Code,
  CreditCard,
  Database,
  FileCheck,
  Globe,
  Lightbulb,
  Lock,
  MessageCircle,
  MessageSquare,
  PieChart,
  RefreshCw,
  Settings,
  Shield,
  Smartphone,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";

const PREMIUM_STORAGE_KEY = "hkp_premium_features";

export interface PremiumFeatureState {
  aiTools: boolean;
  whatsappAutomation: boolean;
  docIntelligence: boolean;
  ecommerce: boolean;
  eventLedger: boolean;
  smartCompliance: boolean;
  customizationEngine: boolean;
  tallyImport: boolean;
  advancedAnalytics: boolean;
  subscriptionBilling: boolean;
  assetMaintenance: boolean;
  projectCosting: boolean;
  multiBranch: boolean;
  crm: boolean;
  advancedMobile: boolean;
  // Phase 39: 10 Advanced Premium Features
  aiSmartInsights: boolean;
  predictiveCashFlow: boolean;
  autoBankSync: boolean;
  documentVault: boolean;
  advancedPOSAnalytics: boolean;
  multiCurrencyInvoicing: boolean;
  automatedTaxFiling: boolean;
  employeeSelfService: boolean;
  customerWhatsAppBot: boolean;
  businessIntelligence: boolean;
}

const DEFAULT_STATE: PremiumFeatureState = {
  aiTools: true,
  whatsappAutomation: true,
  docIntelligence: true,
  ecommerce: true,
  eventLedger: true,
  smartCompliance: true,
  customizationEngine: true,
  tallyImport: true,
  advancedAnalytics: true,
  subscriptionBilling: true,
  assetMaintenance: true,
  projectCosting: true,
  multiBranch: true,
  crm: true,
  advancedMobile: true,
  // Phase 39 defaults
  aiSmartInsights: true,
  predictiveCashFlow: true,
  autoBankSync: true,
  documentVault: true,
  advancedPOSAnalytics: true,
  multiCurrencyInvoicing: true,
  automatedTaxFiling: true,
  employeeSelfService: true,
  customerWhatsAppBot: true,
  businessIntelligence: true,
};

export function loadPremiumFeatures(): PremiumFeatureState {
  try {
    const raw = localStorage.getItem(PREMIUM_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function savePremiumFeatures(state: PremiumFeatureState) {
  try {
    localStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("premiumFeaturesChanged"));
  } catch {}
}

const CORE_FEATURES: {
  key: keyof PremiumFeatureState;
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
}[] = [
  {
    key: "aiTools",
    label: "AI Tools",
    description:
      "Voice Entry, AI Narration, Anomaly Detector powered by OpenAI",
    icon: Bot,
    iconColor: "text-violet-400",
  },
  {
    key: "whatsappAutomation",
    label: "WhatsApp Automation",
    description:
      "Bulk messaging, scheduled queue, delivery logs via WhatsApp Business API",
    icon: MessageCircle,
    iconColor: "text-green-400",
  },
  {
    key: "docIntelligence",
    label: "Document Intelligence (OCR)",
    description:
      "Scan invoices, auto-extract GST/vendor/amount, attach documents",
    icon: Database,
    iconColor: "text-blue-400",
  },
  {
    key: "ecommerce",
    label: "E-Commerce Integration",
    description:
      "Import Shopify/Amazon orders, auto sales entry, inventory sync",
    icon: Globe,
    iconColor: "text-orange-400",
  },
  {
    key: "eventLedger",
    label: "Event Ledger (Time Travel)",
    description:
      "Event-sourced accounting, time-travel reports, undo/redo stack",
    icon: Clock,
    iconColor: "text-pink-400",
  },
  {
    key: "smartCompliance",
    label: "Smart Compliance Engine",
    description:
      "Auto GST error detection, filing alerts, compliance score tracker",
    icon: Shield,
    iconColor: "text-teal",
  },
  {
    key: "customizationEngine",
    label: "Customization Engine",
    description: "JSON config editor, workflow builder, custom fields manager",
    icon: Code,
    iconColor: "text-indigo-400",
  },
  {
    key: "tallyImport",
    label: "Tally Import",
    description: "4-step import wizard for Tally ERP 9 XML/CSV data migration",
    icon: Database,
    iconColor: "text-cyan-400",
  },
  {
    key: "advancedAnalytics",
    label: "Advanced Analytics",
    description:
      "Drill-down explorer, cash flow forecast, expense breakdown, P&L trend",
    icon: BarChart2,
    iconColor: "text-amber-400",
  },
  {
    key: "subscriptionBilling",
    label: "Subscription & Recurring Billing",
    description: "Recurring templates, subscription register, renewal alerts",
    icon: RefreshCw,
    iconColor: "text-emerald-400",
  },
  {
    key: "assetMaintenance",
    label: "Asset Maintenance",
    description:
      "Maintenance schedules, AMC/warranty tracker, maintenance logs",
    icon: Wrench,
    iconColor: "text-yellow-400",
  },
  {
    key: "projectCosting",
    label: "Project Costing",
    description:
      "Project dashboard, cost ledger, budget vs actual, project P&L",
    icon: Activity,
    iconColor: "text-blue-300",
  },
  {
    key: "multiBranch",
    label: "Multi-Branch Management",
    description:
      "Branch master, inter-branch transfers, branch-wise P&L reports",
    icon: Building2,
    iconColor: "text-purple-400",
  },
  {
    key: "crm",
    label: "CRM (Customer Relationship)",
    description:
      "Lead management, follow-up reminders, convert leads to customers",
    icon: Users,
    iconColor: "text-rose-400",
  },
  {
    key: "advancedMobile",
    label: "Advanced Mobile Features",
    description:
      "Barcode scanner, mobile approvals, mobile reports, FAB voucher wheel",
    icon: Smartphone,
    iconColor: "text-sky-400",
  },
];

const ADVANCED_FEATURES: {
  key: keyof PremiumFeatureState;
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
}[] = [
  {
    key: "aiSmartInsights",
    label: "AI Smart Insights",
    description:
      "Predictive revenue trends, expense anomaly alerts, AI-powered business recommendations",
    icon: Lightbulb,
    iconColor: "text-yellow-400",
  },
  {
    key: "predictiveCashFlow",
    label: "Predictive Cash Flow",
    description:
      "ML-based 90-day cash flow forecast with risk indicators and scenario planning",
    icon: TrendingUp,
    iconColor: "text-green-400",
  },
  {
    key: "autoBankSync",
    label: "Auto Bank Sync",
    description:
      "Automatic bank statement fetch and reconciliation (premium tier integration)",
    icon: RefreshCw,
    iconColor: "text-blue-400",
  },
  {
    key: "documentVault",
    label: "Document Vault",
    description:
      "Encrypted cloud document storage with version history and access control",
    icon: Lock,
    iconColor: "text-violet-400",
  },
  {
    key: "advancedPOSAnalytics",
    label: "Advanced POS Analytics",
    description:
      "Real-time POS sales heatmap, product performance reports, shift analytics",
    icon: PieChart,
    iconColor: "text-orange-400",
  },
  {
    key: "multiCurrencyInvoicing",
    label: "Multi-Currency Invoicing",
    description:
      "Auto forex rates, multi-currency PDF invoices, gain/loss tracking",
    icon: Globe,
    iconColor: "text-teal",
  },
  {
    key: "automatedTaxFiling",
    label: "Automated Tax Filing",
    description:
      "One-click GSTR-1/3B filing with pre-validation and error resolution",
    icon: FileCheck,
    iconColor: "text-emerald-400",
  },
  {
    key: "employeeSelfService",
    label: "Employee Self-Service Portal",
    description:
      "Employees view payslips, apply for leave, update profile independently",
    icon: UserCheck,
    iconColor: "text-pink-400",
  },
  {
    key: "customerWhatsAppBot",
    label: "Customer WhatsApp Bot",
    description: "Auto-reply to customer balance/invoice queries via WhatsApp",
    icon: MessageSquare,
    iconColor: "text-green-500",
  },
  {
    key: "businessIntelligence",
    label: "Business Intelligence Reports",
    description:
      "Executive dashboard with KPI scorecards, trend analysis, board-ready reports",
    icon: BarChart3,
    iconColor: "text-amber-400",
  },
];

export default function PremiumFeatures() {
  const [features, setFeatures] = useState<PremiumFeatureState>(() =>
    loadPremiumFeatures(),
  );

  const totalFeatures = CORE_FEATURES.length + ADVANCED_FEATURES.length;
  const enabledCount = Object.values(features).filter(Boolean).length;

  const toggle = (key: keyof PremiumFeatureState) => {
    setFeatures((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      savePremiumFeatures(next);
      return next;
    });
  };

  const enableAll = () => {
    const next = Object.fromEntries(
      Object.keys(features).map((k) => [k, true]),
    ) as unknown as PremiumFeatureState;
    setFeatures(next);
    savePremiumFeatures(next);
  };

  const disableAll = () => {
    const next = Object.fromEntries(
      Object.keys(features).map((k) => [k, false]),
    ) as unknown as PremiumFeatureState;
    setFeatures(next);
    savePremiumFeatures(next);
  };

  const renderFeatureCard = (
    {
      key,
      label,
      description,
      icon: Icon,
      iconColor,
    }: (typeof CORE_FEATURES)[0],
    idx: number,
    badgeVariant: "core" | "advanced",
  ) => (
    <div
      key={key}
      className={`bg-card border rounded-sm p-3 flex flex-col gap-2 transition-all ${
        features[key] ? "border-teal/30 shadow-sm" : "border-border opacity-60"
      }`}
      data-ocid={`premium.item.${idx + 1}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
              features[key] ? "bg-teal/10" : "bg-secondary"
            }`}
          >
            <Icon
              size={14}
              className={features[key] ? iconColor : "text-muted-foreground"}
            />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-foreground leading-tight">
              {label}
            </div>
            <Badge
              className={`text-[9px] mt-0.5 px-1 py-0 border ${
                badgeVariant === "advanced"
                  ? "bg-purple-500/15 text-purple-600 border-purple-500/30"
                  : "bg-amber-500/15 text-amber-600 border-amber-500/30"
              }`}
            >
              {badgeVariant === "advanced" ? "ADVANCED" : "PREMIUM"}
            </Badge>
          </div>
        </div>
        <Switch
          checked={features[key]}
          onCheckedChange={() => toggle(key)}
          data-ocid={`premium.${key}.switch`}
          className="flex-shrink-0 mt-0.5"
        />
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div
        className={`text-[10px] font-medium ${
          features[key] ? "text-teal" : "text-muted-foreground"
        }`}
      >
        {features[key] ? "● Visible in sidebar" : "○ Hidden from sidebar"}
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-foreground">
            Premium Features
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Show or hide advanced feature sections from the sidebar.
            Admin-controlled.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-teal/20 text-teal border-teal/40 text-[11px] font-semibold">
            {enabledCount} / {totalFeatures} enabled
          </Badge>
          <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-[10px]">
            15 Core + 10 Advanced
          </Badge>
          <button
            type="button"
            onClick={enableAll}
            className="text-[11px] px-3 py-1.5 bg-teal/20 border border-teal/40 text-teal hover:bg-teal/30 transition-colors rounded-sm"
            data-ocid="premium.enable_all.button"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={disableAll}
            className="text-[11px] px-3 py-1.5 bg-secondary border border-border text-muted-foreground hover:bg-secondary/80 transition-colors rounded-sm"
            data-ocid="premium.disable_all.button"
          >
            Disable All
          </button>
        </div>
      </div>

      {/* Core Premium Features */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2">
            Core Premium Features (15)
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          data-ocid="premium.list"
        >
          {CORE_FEATURES.map((f, idx) => renderFeatureCard(f, idx, "core"))}
        </div>
      </div>

      {/* Advanced Premium Features */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-500 px-2">
            Advanced Premium Features (10)
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ADVANCED_FEATURES.map((f, idx) =>
            renderFeatureCard(f, CORE_FEATURES.length + idx, "advanced"),
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-secondary/40 border border-border rounded-sm text-[10px] text-muted-foreground">
        <Settings size={11} className="inline mr-1" />
        Changes take effect immediately. Non-admin users are affected by these
        settings but cannot modify them. All underlying data for hidden features
        is preserved — re-enabling a feature restores full access.
      </div>
    </div>
  );
}
