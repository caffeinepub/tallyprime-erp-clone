# HisabKitab Pro — Phase 24

## Current State
Fully functional ERP with 23 phases including accounting, GST, inventory, payroll, banking, fixed assets, cost centres, multi-currency, RBAC, data management, analytics, audit trail, advanced reporting, notifications, printing/export, integrations, AI tools, voice entry, WhatsApp, budgeting, multi-company consolidation, project costing, customer/vendor portals, purchase/sales orders, e-Way Bill, E-Invoice, CRM, mobile/tablet responsiveness.

## Requested Changes (Diff)

### Add
- GST Filing Automation (new sidebar section): Filing Dashboard with due dates/calendar, GSTR-1 Filing (review + mark filed + history), GSTR-3B Filing (review liability + payment challan), Filing History Register
- POS - Point of Sale (new sidebar section): POS Terminal (product search, cart, discounts, cash/card/UPI payment, receipt print), POS Sessions (open/close + summary), POS Sales Register
- Multi-Branch (new sidebar section): Branch Master (create/edit with address, GST, manager), Branch Transfer (inter-branch stock/fund), Branch-wise Reports (P&L + Stock)
- Service Management (new sidebar section): Service Master (define services with rate/HSN/tax), Service Orders (job cards), Service Tickets (open/in-progress/completed), Service Register

### Modify
- App.tsx: add imports, 4 new sidebar sections with nav items, VIEW_LABELS entries, render cases

### Remove
- Nothing

## Implementation Plan
1. Create 14 new component files for the 4 new sections
2. Update App.tsx with all wiring (imports, nav, labels, renders)
3. Validate and build
