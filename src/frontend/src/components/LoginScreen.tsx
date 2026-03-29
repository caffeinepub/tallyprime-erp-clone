import { AlertCircle, Eye, EyeOff, Lock, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import type { AppUser } from "../types/rbac";
import { hashPassword } from "../types/rbac";

interface Props {
  onLogin: (user: AppUser) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const { actor, isFetching } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rbacActor = actor as any;
    if (!username.trim() || !password.trim()) return;
    setError("");
    setLoading(true);
    try {
      const hash = await hashPassword(password);
      let user: AppUser | null = null;

      // Try backend auth first
      if (rbacActor) {
        try {
          user = await rbacActor.verifyUser(username.trim(), hash);
        } catch {
          // Backend unavailable — fall through to local auth
        }
      }

      // Local fallback: check against localStorage users + hardcoded admin
      if (!user) {
        const localUsers: AppUser[] = JSON.parse(
          localStorage.getItem("hkp_users") || "[]",
        );
        const found = localUsers.find(
          (u) =>
            u.username === username.trim() &&
            (u as unknown as Record<string, string>).passwordHash === hash &&
            u.isActive,
        );
        if (found) {
          user = found;
        } else if (
          username.trim() === "admin" &&
          hash ===
            "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"
        ) {
          user = {
            id: BigInt(1),
            username: "admin",
            role: "Admin",
            companyId: null,
            isActive: true,
          };
        }
      }

      if (user) {
        onLogin(user as AppUser);
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      data-ocid="login.page"
      className="min-h-screen bg-background flex items-center justify-center"
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal rounded-sm mb-4 shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">
              H
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            HisabKitab Pro
          </h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Enterprise Accounting System · v8.0
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border shadow-xl">
          <div className="px-6 py-4 border-b border-border bg-secondary/20">
            <h2 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
              User Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide"
              >
                Username
              </label>
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  ref={usernameRef}
                  id="login-username"
                  data-ocid="login.input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter username"
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="login-password"
                  data-ocid="login.input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2 text-[13px] bg-input border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                data-ocid="login.error_state"
                className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 text-destructive text-[12px]"
              >
                <AlertCircle size={13} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              data-ocid="login.submit_button"
              disabled={loading || isFetching || !username || !password}
              className="w-full py-2.5 bg-teal text-primary-foreground text-[13px] font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span
                    data-ocid="login.loading_state"
                    className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                  />
                  Verifying...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="px-6 pb-5">
            <div className="text-center text-[11px] text-muted-foreground/60 border-t border-border/50 pt-4">
              Default credentials:{" "}
              <span className="font-mono text-teal/70">admin</span> /{" "}
              <span className="font-mono text-teal/70">admin123</span>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="text-center mt-4 text-[10px] text-muted-foreground/40">
          Tab to navigate · Enter to submit
        </div>
      </div>
    </div>
  );
}
