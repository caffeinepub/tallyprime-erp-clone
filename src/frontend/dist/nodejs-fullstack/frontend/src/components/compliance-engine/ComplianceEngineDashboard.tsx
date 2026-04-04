import { AlertCircle, ArrowRight, Bell, Shield, Target } from "lucide-react";

interface Props {
  onNavigate?: (view: string) => void;
}

export default function ComplianceEngineDashboard({ onNavigate }: Props) {
  const cards = [
    {
      icon: AlertCircle,
      iconColor: "text-red-400",
      title: "GST Error Detector",
      description:
        "Auto-scan for missing GSTIN, invalid HSN, wrong tax rates, and duplicate invoice numbers.",
      view: "gst-error-detector",
      stat: "7 Issues Found",
      statColor: "text-red-400",
    },
    {
      icon: Bell,
      iconColor: "text-yellow-400",
      title: "Filing Alerts",
      description:
        "Track GSTR-1 (11th), GSTR-3B (20th), GSTR-9 (Dec 31st), TDS (7th), Advance Tax due dates.",
      view: "filing-alerts",
      stat: "3 Due Soon",
      statColor: "text-yellow-400",
    },
    {
      icon: Target,
      iconColor: "text-teal",
      title: "Compliance Score",
      description:
        "Overall compliance health score based on GSTIN completeness, HSN codes, narrations, and filed returns.",
      view: "compliance-score",
      stat: "71% — Grade B",
      statColor: "text-teal",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Shield size={16} className="text-teal" />
          Compliance Engine Dashboard
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Smart compliance monitoring — proactively detect GST errors and track
          filing deadlines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.view}
              className="border border-border rounded p-4 space-y-3 bg-card/40 hover:border-teal/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon size={18} className={card.iconColor} />
                <span className="text-sm font-semibold text-foreground">
                  {card.title}
                </span>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {card.description}
              </div>
              <div className={`text-xs font-bold ${card.statColor}`}>
                {card.stat}
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate(card.view)}
                  data-ocid={`ce_dashboard.${card.view}.button`}
                  className="flex items-center gap-1 text-[11px] text-teal hover:underline"
                >
                  Open <ArrowRight size={10} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="border border-teal/20 rounded p-4 bg-teal/5">
        <div className="text-xs font-semibold text-teal mb-1">
          What is the Compliance Engine?
        </div>
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          The Smart Compliance Engine proactively monitors your accounting data
          for GST compliance issues. Unlike Tally's static reports, it
          automatically flags errors before you file — saving you from
          penalties, notices, and rejected returns. Run a scan anytime from GST
          Error Detector.
        </div>
      </div>
    </div>
  );
}
