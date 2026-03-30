# HisabKitab Pro — Phase 36

## Current State
v35.0 live with HR & Attendance, Asset Maintenance, Subscription & Recurring Billing, and all prior 35 phases intact.

## Requested Changes (Diff)

### Add
- **Advanced Banking** sidebar section:
  - Bank Statement Import (CSV upload, column mapping, preview, import)
  - Auto-Reconciliation (match imported transactions vs vouchers, manual match, unmatched list)
  - UPI Collection Tracker (UPI payments log, reconcile status)
  - Outstanding Cheque Register (issued/deposited cheques, clearance tracking)
  - Bank Reconciliation Statement (BRS report — book balance vs bank balance)
- **Advanced Analytics** sidebar section (drill-down):
  - Analytics Dashboard (KPI cards, revenue/expense trend charts)
  - Drill-Down Explorer (click ledger group → sub-group → individual vouchers)
  - Cash Flow Forecast (30/60/90-day projection with trend line)
  - Expense Breakdown (category-wise pie/bar)
  - Profit & Loss Trend (monthly P&L comparison chart)

### Modify
- Sidebar: add "Advanced Banking" and "Advanced Analytics" sections

### Remove
- Nothing

## Implementation Plan
1. Add AdvancedBanking component (5 sub-screens: Import, Reconciliation, UPI Tracker, Cheque Register, BRS)
2. Add AdvancedAnalytics component (5 sub-screens: Dashboard, Drill-Down, Cash Flow Forecast, Expense Breakdown, P&L Trend)
3. Wire both into sidebar under new sections
4. All data stored in localStorage; no backend changes needed
5. Charts use inline SVG / simple canvas — no new chart library imports
