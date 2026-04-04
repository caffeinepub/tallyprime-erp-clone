import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PP_KEY = "hkp_password_policy";

interface Policy {
  minLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
}

const DEFAULT_POLICY: Policy = {
  minLength: 8,
  requireUppercase: false,
  requireNumbers: true,
  requireSpecialChars: false,
  expiryDays: 0,
};

function loadPolicy(): Policy {
  try {
    const raw = localStorage.getItem(PP_KEY);
    if (raw) return JSON.parse(raw) as Policy;
  } catch {
    /* ignore */
  }
  return DEFAULT_POLICY;
}

export default function PasswordPolicy() {
  const [policy, setPolicy] = useState<Policy>(loadPolicy);

  const update = <K extends keyof Policy>(key: K, value: Policy[K]) => {
    setPolicy((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(PP_KEY, JSON.stringify(policy));
    toast.success("Password policy saved!");
  };

  const expiryLabel =
    policy.expiryDays === 0 ? "Never" : `${policy.expiryDays} days`;

  const summary = [
    `Min ${policy.minLength} chars`,
    policy.requireUppercase && "uppercase",
    policy.requireNumbers && "numbers",
    policy.requireSpecialChars && "special chars",
    policy.expiryDays > 0 ? `expires every ${policy.expiryDays}d` : "no expiry",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Lock size={16} className="text-teal" />
            Password Policy
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure password strength requirements for all users
          </p>
        </div>
        <Button
          size="sm"
          className="text-xs h-7"
          onClick={handleSave}
          data-ocid="pwd_policy.save_button"
        >
          Save Policy
        </Button>
      </div>

      <div className="border border-teal/20 rounded p-3 bg-teal/5">
        <div className="text-[10px] text-teal font-mono">{summary}</div>
        <div className="text-[9px] text-muted-foreground mt-0.5">
          Current active policy summary
        </div>
      </div>

      <div
        className="border border-border rounded p-4 space-y-5 max-w-lg"
        data-ocid="pwd_policy.panel"
      >
        <div className="space-y-2">
          <Label className="text-xs">
            Minimum Length:{" "}
            <span className="text-teal font-bold">{policy.minLength}</span>{" "}
            characters
          </Label>
          <Slider
            min={6}
            max={20}
            step={1}
            value={[policy.minLength]}
            onValueChange={([v]) => update("minLength", v)}
            className="w-64"
            data-ocid="pwd_policy.min_length.toggle"
          />
          <div className="text-[10px] text-muted-foreground">
            Range: 6 – 20 characters
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              key: "requireUppercase" as const,
              label: "Require Uppercase Letters (A–Z)",
              desc: "Password must contain at least one uppercase character",
            },
            {
              key: "requireNumbers" as const,
              label: "Require Numbers (0–9)",
              desc: "Password must contain at least one digit",
            },
            {
              key: "requireSpecialChars" as const,
              label: "Require Special Characters (!@#$...)",
              desc: "Password must contain at least one special character",
            },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-foreground">
                  {label}
                </div>
                <div className="text-[10px] text-muted-foreground">{desc}</div>
              </div>
              <Switch
                checked={policy[key]}
                onCheckedChange={(v) => update(key, v)}
                data-ocid={`pwd_policy.${key}.switch`}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-xs">
            Password Expiry:{" "}
            <span className="text-teal font-bold">{expiryLabel}</span>
          </Label>
          <div className="flex gap-2 flex-wrap">
            {[0, 30, 60, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => update("expiryDays", d)}
                data-ocid={`pwd_policy.expiry_${d}.toggle`}
                className={`text-[10px] px-3 py-1 rounded border transition-colors ${
                  policy.expiryDays === d
                    ? "bg-teal/20 border-teal/50 text-teal"
                    : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {d === 0 ? "Never" : `${d} days`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
