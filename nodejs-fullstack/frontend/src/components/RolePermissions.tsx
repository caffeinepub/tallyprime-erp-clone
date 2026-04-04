import { Lock } from "lucide-react";

const ROLES_TABLE = [
  {
    role: "Admin",
    color: "text-teal border-teal/40 bg-teal/10",
    modules: [
      "All Modules",
      "Masters",
      "Transactions",
      "GST Compliance",
      "Inventory",
      "Payroll",
      "Banking",
      "Fixed Assets",
      "Cost Centres",
      "Multi-Currency",
      "Reports",
      "User Management",
      "Roles & Permissions",
    ],
    description: "Full access to all modules, settings, and security",
  },
  {
    role: "Accountant",
    color: "text-blue-400 border-blue-400/30 bg-blue-500/10",
    modules: [
      "Masters",
      "Transactions",
      "GST Compliance",
      "Inventory",
      "Payroll",
      "Banking",
      "Fixed Assets",
      "Cost Centres",
      "Multi-Currency",
      "Reports",
    ],
    description: "Access to all operational modules except Security",
  },
  {
    role: "Auditor",
    color: "text-amber-400 border-amber-400/30 bg-amber-500/10",
    modules: [
      "Reports",
      "Trial Balance",
      "Day Book",
      "Balance Sheet",
      "P&L Account",
      "Cash Flow",
      "GSTR-1",
      "GSTR-3B",
    ],
    description: "Read-only access to financial reports and returns",
  },
  {
    role: "Viewer",
    color: "text-muted-foreground border-border bg-secondary/40",
    modules: [
      "Reports",
      "Trial Balance",
      "Day Book",
      "Balance Sheet",
      "P&L Account",
      "Cash Flow",
    ],
    description: "View-only access to core financial reports",
  },
];

const ALL_MODULES = [
  "Masters",
  "Transactions",
  "GST Compliance",
  "Inventory",
  "Inventory Reports",
  "Payroll",
  "Banking",
  "Fixed Assets",
  "Cost Centres",
  "Multi-Currency",
  "Reports",
  "User Management",
  "Roles & Permissions",
];

export default function RolePermissions() {
  return (
    <div
      data-ocid="role_permissions.panel"
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <Lock size={16} className="text-teal" />
        <h2 className="text-[14px] font-semibold text-foreground">
          Roles &amp; Permissions
        </h2>
        <span className="text-[11px] text-muted-foreground border border-border px-2 py-0.5">
          Read-only Reference
        </span>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Role Cards */}
        <div className="grid grid-cols-2 gap-4">
          {ROLES_TABLE.map((row) => (
            <div
              key={row.role}
              data-ocid="role_permissions.card"
              className="bg-card border border-border p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 text-[12px] font-semibold border ${
                    row.color
                  }`}
                >
                  {row.role}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">
                {row.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {row.modules.map((mod) => (
                  <span
                    key={mod}
                    className="inline-flex items-center px-2 py-0.5 text-[10px] bg-secondary/60 border border-border/60 text-muted-foreground"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Matrix */}
        <div className="bg-card border border-border">
          <div className="px-4 py-3 border-b border-border bg-secondary/20">
            <h3 className="text-[12px] font-semibold text-foreground uppercase tracking-wide">
              Access Matrix
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide min-w-[180px]">
                    Module
                  </th>
                  {ROLES_TABLE.map((r) => (
                    <th
                      key={r.role}
                      className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      <span
                        className={`inline-flex px-2 py-0.5 border text-[10px] ${
                          r.color
                        }`}
                      >
                        {r.role}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_MODULES.map((mod, idx) => (
                  <tr
                    key={mod}
                    data-ocid={`role_permissions.row.item.${idx + 1}`}
                    className="border-b border-border/60 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-2 font-medium text-foreground">
                      {mod}
                    </td>
                    {ROLES_TABLE.map((r) => {
                      const hasAccess =
                        r.modules.includes(mod) ||
                        r.modules.includes("All Modules");
                      return (
                        <td key={r.role} className="px-4 py-2 text-center">
                          {hasAccess ? (
                            <span
                              aria-label="Allowed"
                              className="inline-flex items-center justify-center w-5 h-5 bg-teal/15 border border-teal/30 text-teal"
                            >
                              ✓
                            </span>
                          ) : (
                            <span
                              aria-label="Not allowed"
                              className="inline-flex items-center justify-center w-5 h-5 bg-secondary/40 border border-border/50 text-muted-foreground/40 text-[10px]"
                            >
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-3 px-4 py-3 bg-teal/5 border border-teal/20 text-[11px] text-muted-foreground">
          <Lock size={12} className="text-teal mt-0.5 flex-shrink-0" />
          <span>
            Role permissions are system-defined and enforced at the navigation
            level. Admins can assign roles when creating or editing users in
            User Management.
          </span>
        </div>
      </div>
    </div>
  );
}
