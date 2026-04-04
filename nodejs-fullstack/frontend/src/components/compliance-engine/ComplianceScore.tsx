import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";

interface CategoryScore {
  label: string;
  score: number;
  maxScore: number;
  tips: string;
}

const CATEGORIES: CategoryScore[] = [
  {
    label: "Ledgers with GSTIN",
    score: 24,
    maxScore: 30,
    tips: "Fill GSTIN for all registered traders in ledger master.",
  },
  {
    label: "Stock Items with HSN Codes",
    score: 18,
    maxScore: 25,
    tips: "Assign HSN codes to all stock items, especially those above ₹50k.",
  },
  {
    label: "Vouchers with Narrations",
    score: 14,
    maxScore: 20,
    tips: "Use AI Narration or manually enter narration for all vouchers.",
  },
  {
    label: "Filed Returns",
    score: 15,
    maxScore: 25,
    tips: "File GSTR-1 and GSTR-3B on time every month.",
  },
];

export default function ComplianceScore() {
  const totalScore = CATEGORIES.reduce((s, c) => s + c.score, 0);
  const maxTotal = CATEGORIES.reduce((s, c) => s + c.maxScore, 0);
  const pct = Math.round((totalScore / maxTotal) * 100);
  const grade =
    pct >= 90
      ? "A+"
      : pct >= 75
        ? "A"
        : pct >= 60
          ? "B"
          : pct >= 45
            ? "C"
            : "D";
  const gradeColor =
    pct >= 75
      ? "text-green-400"
      : pct >= 50
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Target size={16} className="text-teal" />
          Compliance Score
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Overall GST and accounting compliance health
        </p>
      </div>

      {/* Overall */}
      <div className="border border-border rounded p-5 text-center bg-card/40">
        <div className={`text-5xl font-bold ${gradeColor} mb-1`}>{pct}%</div>
        <div className={`text-xl font-bold ${gradeColor} mb-2`}>
          Grade: {grade}
        </div>
        <Progress value={pct} className="h-3 mb-2" />
        <div className="text-xs text-muted-foreground">
          {totalScore} / {maxTotal} points
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const catPct = Math.round((cat.score / cat.maxScore) * 100);
          const catColor =
            catPct >= 75
              ? "text-green-400"
              : catPct >= 50
                ? "text-yellow-400"
                : "text-red-400";
          return (
            <div
              key={cat.label}
              className="border border-border rounded p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {cat.label}
                </span>
                <span className={`text-xs font-bold ${catColor}`}>
                  {cat.score}/{cat.maxScore}
                </span>
              </div>
              <Progress value={catPct} className="h-2" />
              {catPct < 100 && (
                <div className="text-[10px] text-muted-foreground flex items-start gap-1">
                  <TrendingUp size={9} className="mt-0.5 flex-shrink-0" />
                  {cat.tips}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
