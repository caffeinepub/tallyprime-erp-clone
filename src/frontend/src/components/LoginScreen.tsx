import {
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  User,
} from "lucide-react";
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
      className="min-h-screen flex"
      style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px" }}
    >
      <style>{`
        @keyframes hkp-fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hkp-fadein { animation: hkp-fadeIn 0.55s ease both; }
        .hkp-fadein-delay { animation: hkp-fadeIn 0.55s ease 0.15s both; }
        .hkp-panel-left {
          background: linear-gradient(145deg, oklch(22% 0.06 215) 0%, oklch(16% 0.04 210) 60%, oklch(12% 0.03 205) 100%);
        }
        .hkp-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          font-size: 1.3rem;
          font-family: 'Poppins', sans-serif;
          background: oklch(var(--input));
          border: 1px solid oklch(var(--border));
          color: oklch(var(--foreground));
          border-radius: 4px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .hkp-input:focus {
          border-color: oklch(var(--teal));
          box-shadow: 0 0 0 3px oklch(var(--teal) / 0.15);
        }
        .hkp-input::placeholder { color: oklch(var(--muted-foreground) / 0.5); }
        .hkp-btn {
          width: 100%;
          padding: 11px 16px;
          background: oklch(var(--teal));
          color: oklch(var(--primary-foreground));
          font-size: 1.3rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.2s, opacity 0.2s;
          letter-spacing: 0.03em;
        }
        .hkp-btn:hover:not(:disabled) { background: oklch(65% 0.14 195); }
        .hkp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .hkp-geo-1 {
          position: absolute; bottom: 40px; left: -30px;
          width: 180px; height: 180px;
          border: 1px solid oklch(60% 0.12 195 / 0.12);
          border-radius: 50%;
        }
        .hkp-geo-2 {
          position: absolute; top: 60px; right: -50px;
          width: 240px; height: 240px;
          border: 1px solid oklch(60% 0.12 195 / 0.08);
          border-radius: 50%;
        }
        .hkp-geo-3 {
          position: absolute; top: 30%; left: 20px;
          width: 60px; height: 60px;
          background: oklch(60% 0.12 195 / 0.06);
          transform: rotate(45deg);
        }
        .hkp-geo-4 {
          position: absolute; bottom: 120px; right: 30px;
          width: 30px; height: 30px;
          background: oklch(60% 0.12 195 / 0.1);
          border-radius: 50%;
        }
      `}</style>

      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex hkp-panel-left flex-col items-center justify-center relative overflow-hidden"
        style={{ width: "40%" }}
      >
        {/* Geometric decorations */}
        <div className="hkp-geo-1" />
        <div className="hkp-geo-2" />
        <div className="hkp-geo-3" />
        <div className="hkp-geo-4" />

        <div className="relative z-10 flex flex-col items-center text-center px-12 hkp-fadein">
          {/* Logo */}
          <div
            style={{
              width: 72,
              height: 72,
              background: "oklch(60% 0.12 195)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              boxShadow: "0 8px 32px oklch(60% 0.12 195 / 0.35)",
            }}
          >
            <span
              style={{
                color: "oklch(15% 0.02 220)",
                fontWeight: 800,
                fontSize: "3.2rem",
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              H
            </span>
          </div>

          {/* Wordmark */}
          <h1
            style={{
              color: "oklch(95% 0.01 210)",
              fontWeight: 700,
              fontSize: "2.4rem",
              letterSpacing: "-0.02em",
              marginBottom: 6,
              lineHeight: 1.2,
            }}
          >
            HisabKitab Pro
          </h1>
          <p
            style={{
              color: "oklch(60% 0.12 195)",
              fontSize: "1.1rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 32,
            }}
          >
            Enterprise Accounting System
          </p>

          {/* Feature bullets */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              maxWidth: 280,
            }}
          >
            {[
              "Double-Entry Accounting",
              "GST Compliance & Filing",
              "Multi-Company Management",
            ].map((feat) => (
              <div
                key={feat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "oklch(80% 0.02 210)",
                  fontSize: "1.25rem",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "oklch(60% 0.12 195 / 0.2)",
                    border: "1px solid oklch(60% 0.12 195 / 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="oklch(65% 0.14 195)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {feat}
              </div>
            ))}
          </div>

          {/* Version badge */}
          <div
            style={{
              marginTop: 40,
              padding: "4px 14px",
              background: "oklch(60% 0.12 195 / 0.12)",
              border: "1px solid oklch(60% 0.12 195 / 0.25)",
              borderRadius: 20,
              color: "oklch(60% 0.12 195)",
              fontSize: "1.05rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            v30.0
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-10"
        style={{ background: "oklch(var(--background))" }}
      >
        {/* Mobile logo — only visible on small screens */}
        <div className="flex lg:hidden flex-col items-center mb-8 hkp-fadein">
          <div
            style={{
              width: 56,
              height: 56,
              background: "oklch(var(--teal))",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              boxShadow: "0 4px 16px oklch(60% 0.12 195 / 0.3)",
            }}
          >
            <span
              style={{
                color: "oklch(15% 0.02 220)",
                fontWeight: 800,
                fontSize: "2.4rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              H
            </span>
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "oklch(var(--foreground))",
              letterSpacing: "-0.01em",
            }}
          >
            HisabKitab Pro
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "oklch(var(--muted-foreground))",
              marginTop: 2,
            }}
          >
            Enterprise Accounting System
          </p>
        </div>

        {/* Card */}
        <div
          className="hkp-fadein-delay w-full"
          style={{
            maxWidth: 400,
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
            borderRadius: 8,
            boxShadow:
              "0 4px 6px -1px oklch(0% 0 0 / 0.15), 0 10px 40px -8px oklch(0% 0 0 / 0.2)",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: "18px 24px 16px",
              borderBottom: "1px solid oklch(var(--border))",
              background: "oklch(var(--secondary) / 0.4)",
            }}
          >
            <h2
              style={{
                fontSize: "1.9rem",
                fontWeight: 700,
                color: "oklch(var(--foreground))",
                marginBottom: 2,
                letterSpacing: "-0.01em",
              }}
            >
              Welcome Back
            </h2>
            <p
              style={{
                fontSize: "1.15rem",
                color: "oklch(var(--muted-foreground))",
              }}
            >
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Username */}
            <div>
              <label
                htmlFor="login-username"
                style={{
                  display: "block",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  color: "oklch(var(--muted-foreground))",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Username
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={14}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "oklch(var(--muted-foreground))",
                  }}
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
                  className="hkp-input"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: "block",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  color: "oklch(var(--muted-foreground))",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={14}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "oklch(var(--muted-foreground))",
                  }}
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
                  className="hkp-input"
                  style={{ paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  style={{
                    position: "absolute",
                    right: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "oklch(var(--muted-foreground))",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                data-ocid="login.error_state"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 12px",
                  background: "oklch(var(--destructive) / 0.1)",
                  border: "1px solid oklch(var(--destructive) / 0.3)",
                  borderRadius: 4,
                  color: "oklch(var(--destructive))",
                  fontSize: "1.15rem",
                }}
              >
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              data-ocid="login.submit_button"
              disabled={loading || isFetching || !username || !password}
              className="hkp-btn"
            >
              {loading ? (
                <>
                  <span
                    data-ocid="login.loading_state"
                    style={{
                      width: 14,
                      height: 14,
                      border: "2px solid oklch(15% 0.02 220 / 0.3)",
                      borderTopColor: "oklch(15% 0.02 220)",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Verifying...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight size={15} />
                </>
              )}
            </button>

            {/* Keyboard hint */}
            <div
              style={{
                textAlign: "center",
                fontSize: "1.05rem",
                color: "oklch(var(--muted-foreground) / 0.5)",
                letterSpacing: "0.05em",
              }}
            >
              Tab · Enter · Esc
            </div>
          </form>

          {/* Footer hint */}
          <div
            style={{
              padding: "12px 24px",
              borderTop: "1px solid oklch(var(--border) / 0.5)",
              textAlign: "center",
              fontSize: "1.1rem",
              color: "oklch(var(--muted-foreground) / 0.6)",
            }}
          >
            Default:{" "}
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(var(--teal) / 0.8)",
              }}
            >
              admin
            </span>
            {" / "}
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "oklch(var(--teal) / 0.8)",
              }}
            >
              admin123
            </span>
          </div>
        </div>

        {/* Bottom note */}
        <p
          style={{
            marginTop: 20,
            fontSize: "1.05rem",
            color: "oklch(var(--muted-foreground) / 0.35)",
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} HisabKitab Pro · Enterprise ERP
        </p>
      </div>
    </div>
  );
}
