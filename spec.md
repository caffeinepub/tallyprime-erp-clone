# HisabKitab Pro — Phase 21

## Current State
Fully functional ERP with 20 phases: accounting, GST, inventory, payroll, banking, fixed assets, cost centres, multi-currency, RBAC, data management, analytics, audit trail, advanced reporting, notifications, printing/export, integrations, AI tools, voice entry, WhatsApp outbound, budgeting/forecasting, multi-company consolidation.

## Requested Changes (Diff)

### Add
- **Project Costing** (new sidebar section)
  - Project Master: create/manage projects with budget, client, dates, status
  - Project Cost Ledger: assign vouchers/expenses to projects
  - Project P&L Report: revenue vs cost per project, profit margin
  - Project Dashboard: summary cards, progress bars, status overview
- **Customer Portal** (new sidebar section)
  - Customer Master: manage customers with contact, credit limit, outstanding balance
  - Customer Ledger View: ledger statement per customer
  - Outstanding Receivables: aging analysis (0-30, 31-60, 61-90, 90+ days)
  - Customer Statement: printable statement with transactions
- **Vendor Portal** (new sidebar section)
  - Vendor Master: manage vendors with contact, credit terms, outstanding balance
  - Vendor Ledger View: ledger statement per vendor
  - Outstanding Payables: aging analysis
  - Vendor Statement: printable statement

### Modify
- App.tsx: add new nav sections (Project Costing, Customer Portal, Vendor Portal), new view keys, imports, RBAC keys
- Version bump to v21.0

### Remove
- Nothing

## Implementation Plan
1. Create ProjectMaster.tsx — project CRUD with budget, client, dates, status
2. Create ProjectCostLedger.tsx — assign/view costs per project
3. Create ProjectPL.tsx — project-wise P&L report
4. Create ProjectDashboard.tsx — project summary dashboard
5. Create CustomerMaster.tsx — customer CRUD with outstanding tracking
6. Create CustomerLedger.tsx — ledger per customer with aging
7. Create VendorMaster.tsx — vendor CRUD with outstanding tracking
8. Create VendorLedger.tsx — ledger per vendor with aging
9. Update App.tsx — add nav items, routes, imports, RBAC
