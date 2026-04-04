import { Calculator } from "lucide-react";
import { useState } from "react";

interface ITInputs {
  grossSalary: number;
  hraExemption: number;
  sec80C: number;
  sec80D: number;
  sec80G: number;
  otherIncome: number;
  regime: "old" | "new";
}

const TAX_SLABS_OLD = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250000, to: 500000, rate: 5 },
  { from: 500000, to: 1000000, rate: 20 },
  { from: 1000000, to: Number.POSITIVE_INFINITY, rate: 30 },
];

const TAX_SLABS_NEW = [
  { from: 0, to: 300000, rate: 0 },
  { from: 300000, to: 600000, rate: 5 },
  { from: 600000, to: 900000, rate: 10 },
  { from: 900000, to: 1200000, rate: 15 },
  { from: 1200000, to: 1500000, rate: 20 },
  { from: 1500000, to: Number.POSITIVE_INFINITY, rate: 30 },
];

function computeTax(income: number, slabs: typeof TAX_SLABS_OLD) {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.from) break;
    const taxable = Math.min(income, slab.to) - slab.from;
    tax += (taxable * slab.rate) / 100;
  }
  return tax;
}

export default function IncomeTaxComputation() {
  const [inputs, setInputs] = useState<ITInputs>({
    grossSalary: 1200000,
    hraExemption: 120000,
    sec80C: 150000,
    sec80D: 25000,
    sec80G: 10000,
    otherIncome: 50000,
    regime: "old",
  });

  const set = (key: keyof ITInputs, val: string | number) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const grossTotal = inputs.grossSalary + inputs.otherIncome;
  const stdDeduction = inputs.regime === "old" ? 50000 : 50000;

  const totalDeductions =
    inputs.regime === "old"
      ? inputs.hraExemption +
        stdDeduction +
        Math.min(inputs.sec80C, 150000) +
        Math.min(inputs.sec80D, 25000) +
        inputs.sec80G
      : stdDeduction;

  const taxableIncome = Math.max(0, grossTotal - totalDeductions);
  const slabs = inputs.regime === "old" ? TAX_SLABS_OLD : TAX_SLABS_NEW;
  const baseTax = computeTax(taxableIncome, slabs);
  const surcharge = taxableIncome > 5000000 ? baseTax * 0.1 : 0;
  const cess = (baseTax + surcharge) * 0.04;
  const totalTax = baseTax + surcharge + cess;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={16} className="text-teal" />
        <h2 className="text-sm font-bold text-foreground">
          Income Tax Computation
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Regime Toggle */}
          <div className="bg-card border border-border rounded-sm p-3">
            <div className="text-[11px] font-semibold text-foreground mb-2">
              Tax Regime
            </div>
            <div className="flex gap-2">
              {(["old", "new"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set("regime", r)}
                  className={`flex-1 text-[11px] py-2 rounded-sm border transition-colors ${
                    inputs.regime === r
                      ? "bg-teal/20 border-teal/40 text-teal font-medium"
                      : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
                  }`}
                  data-ocid={`it.${r}_regime.toggle`}
                >
                  {r === "old" ? "Old Regime" : "New Regime"}
                </button>
              ))}
            </div>
          </div>

          {/* Income Inputs */}
          <div className="bg-card border border-border rounded-sm p-3 space-y-3">
            <div className="text-[11px] font-semibold text-foreground">
              Income Details
            </div>
            {[
              { key: "grossSalary" as const, label: "Gross Salary" },
              { key: "otherIncome" as const, label: "Other Income" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label
                  htmlFor={`it-${key}`}
                  className="text-[10px] text-muted-foreground"
                >
                  {label}
                </label>
                <input
                  id={`it-${key}`}
                  type="number"
                  value={inputs[key] as number}
                  onChange={(e) => set(key, Number(e.target.value))}
                  className="w-full h-8 mt-1 bg-secondary/50 border border-border rounded-sm px-2 text-[11px] text-foreground outline-none focus:border-teal/50"
                  data-ocid={`it.${key}.input`}
                />
              </div>
            ))}
          </div>

          {/* Deductions */}
          {inputs.regime === "old" && (
            <div className="bg-card border border-border rounded-sm p-3 space-y-3">
              <div className="text-[11px] font-semibold text-foreground">
                Deductions (Old Regime)
              </div>
              {[
                { key: "hraExemption" as const, label: "HRA Exemption" },
                { key: "sec80C" as const, label: "80C (Max ₹1.5L)" },
                { key: "sec80D" as const, label: "80D – Medical Insurance" },
                { key: "sec80G" as const, label: "80G – Donations" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label
                    htmlFor={`it-${key}`}
                    className="text-[10px] text-muted-foreground"
                  >
                    {label}
                  </label>
                  <input
                    id={`it-${key}`}
                    type="number"
                    value={inputs[key] as number}
                    onChange={(e) => set(key, Number(e.target.value))}
                    className="w-full h-8 mt-1 bg-secondary/50 border border-border rounded-sm px-2 text-[11px] text-foreground outline-none focus:border-teal/50"
                    data-ocid={`it.${key}.input`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Result */}
        <div className="space-y-3">
          <div className="bg-card border border-teal/30 rounded-sm p-4">
            <div className="text-[11px] font-semibold text-foreground mb-3">
              Tax Summary ({inputs.regime === "old" ? "Old" : "New"} Regime)
            </div>
            <div className="space-y-2">
              {[
                { label: "Gross Total Income", value: grossTotal },
                {
                  label: "Standard Deduction",
                  value: stdDeduction,
                  subtract: true,
                },
                ...(inputs.regime === "old"
                  ? [
                      {
                        label: "HRA Exemption",
                        value: inputs.hraExemption,
                        subtract: true,
                      },
                      {
                        label: "80C Deduction",
                        value: Math.min(inputs.sec80C, 150000),
                        subtract: true,
                      },
                      {
                        label: "80D Deduction",
                        value: Math.min(inputs.sec80D, 25000),
                        subtract: true,
                      },
                      {
                        label: "80G Donation",
                        value: inputs.sec80G,
                        subtract: true,
                      },
                    ]
                  : []),
                {
                  label: "Taxable Income",
                  value: taxableIncome,
                  highlight: true,
                },
              ].map(({ label, value, subtract, highlight }) => (
                <div
                  key={label}
                  className={`flex justify-between text-[11px] py-1 ${
                    highlight
                      ? "border-t border-border mt-2 pt-2 font-semibold"
                      : ""
                  }`}
                >
                  <span
                    className={
                      highlight ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {label}
                  </span>
                  <span
                    className={`font-mono ${
                      highlight
                        ? "text-foreground"
                        : subtract
                          ? "text-red-500"
                          : "text-foreground"
                    }`}
                  >
                    {subtract ? "- " : ""}
                    {fmt(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-teal/30 rounded-sm p-4">
            <div className="text-[11px] font-semibold text-foreground mb-3">
              Tax Computation
            </div>
            <div className="space-y-2">
              {[
                { label: "Tax on Taxable Income", value: baseTax },
                ...(surcharge > 0
                  ? [{ label: "Surcharge (10%)", value: surcharge }]
                  : []),
                { label: "Health & Education Cess (4%)", value: cess },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono">{fmt(value)}</span>
                </div>
              ))}
              <div className="border-t border-teal/30 pt-2 mt-2 flex justify-between">
                <span className="text-sm font-bold text-foreground">
                  Total Tax Liability
                </span>
                <span className="text-sm font-bold text-teal font-mono">
                  {fmt(totalTax)}
                </span>
              </div>
            </div>
          </div>

          {/* Slab Breakup */}
          <div className="bg-card border border-border rounded-sm p-3">
            <div className="text-[11px] font-semibold text-foreground mb-2">
              Tax Slabs Applied
            </div>
            {slabs.map((slab) => {
              if (taxableIncome <= slab.from) return null;
              const taxable = Math.min(taxableIncome, slab.to) - slab.from;
              const tax = (taxable * slab.rate) / 100;
              return (
                <div
                  key={`${slab.from}-${slab.to}`}
                  className="flex justify-between text-[11px] py-0.5"
                >
                  <span className="text-muted-foreground">
                    ₹{(slab.from / 100000).toFixed(slab.from === 0 ? 0 : 1)}L –
                    {slab.to === Number.POSITIVE_INFINITY
                      ? "Above"
                      : `₹${(slab.to / 100000).toFixed(1)}L`}
                    @ {slab.rate}%
                  </span>
                  <span className="font-mono text-foreground">{fmt(tax)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
