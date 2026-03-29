# HisabKitab Pro — Phase 20

## Current State
Full ERP with 13+ phases: accounting, GST, inventory, payroll, banking, fixed assets, cost centres, multi-currency, RBAC, data management, analytics, audit trail, advanced reporting, notifications, printing/export, integrations, AI tools, voice entry, WhatsApp config. Backend is persistent Motoko actor. Frontend is React + Tailwind + TypeScript. v13.0 displayed in header.

## Requested Changes (Diff)

### Add
1. **Budget Master** — Create/edit annual budgets per ledger/ledger group. Fields: budget name, financial year, ledger, allocated amount, period (monthly/quarterly/annual). Stored in localStorage under `hkp-budgets`. Admin and Accountant access.
2. **Budget vs Actual Report** — Compare budget allocations against actual voucher totals from localStorage. Shows: Ledger, Budgeted Amount, Actual Amount, Variance (₹), Variance %, color-coded (green=under, red=over). Export to CSV.
3. **Forecasting Dashboard** — Simple linear projection based on last 3 months of actual data. Shows monthly trend chart (bar), projected next-quarter figures, best/worst case estimates. Uses localStorage voucher data.
4. **Multi-Company Consolidation** — Select 2+ companies from localStorage, generate consolidated Balance Sheet and P&L by summing matching ledger groups. Intercompany flag (mark ledgers as intercompany to exclude from consolidation). Export to CSV.
- New sidebar section: **Budgeting & Forecasting** with Budget Master, Budget vs Actual, Forecasting.
- New sidebar section: **Consolidation** with Consolidated Reports.

### Modify
- `App.tsx`: Add 4 new nav items + 2 section headers, render the 4 new components, update version to v20.0, add keys to ROLE_ALLOWED_KEYS for Admin and Accountant, add VIEW_LABELS entries.

### Remove
- Nothing. All existing features preserved.

## Implementation Plan
1. Create `BudgetMaster.tsx` — form to create/list budgets (localStorage).
2. Create `BudgetVsActual.tsx` — table comparing budget vs actual with variance, CSV export.
3. Create `ForecastingDashboard.tsx` — trend bars + projected figures from actual data.
4. Create `ConsolidatedReports.tsx` — multi-company selector + consolidated BS/PL tabs + CSV export.
5. Update `App.tsx` — imports, NAV_ITEMS, VIEW_LABELS, ROLE_ALLOWED_KEYS, renderMain(), version bump to v20.0.
