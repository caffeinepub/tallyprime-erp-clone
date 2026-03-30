# HisabKitab Pro — Phase 23

## Current State
Full ERP with 22 phases: accounting, GST, inventory, payroll, banking, fixed assets, cost centres, multi-currency, RBAC, data management, analytics, audit trail, advanced reporting, notifications, printing/export, integrations, AI tools, budgeting, multi-company, project costing, customer/vendor portals, purchase orders, sales orders. Desktop-first, Tally-like interface.

## Requested Changes (Diff)

### Add
- **e-Way Bill module** (new sidebar section under GST/Compliance):
  - e-Way Bill generation form (supplier/recipient GSTIN, place of supply, transport mode, vehicle number, distance, item details)
  - e-Way Bill list view with status (Active, Cancelled, Expired)
  - Cancel e-Way Bill screen
  - Print/Download e-Way Bill
- **GST E-Invoice module** (under same Compliance section):
  - E-Invoice generation from Sales Voucher (IRN, QR Code display)
  - E-Invoice list with IRN, status (Generated, Cancelled)
  - Cancel E-Invoice screen
  - Print E-Invoice with QR
- **CRM module** (new sidebar section):
  - Lead Master (name, contact, source, status: New/Follow-up/Won/Lost)
  - Lead List with filters
  - Follow-up reminders
  - Customer conversion (Lead → Customer Master)
- **Mobile & Tablet Responsive Layout** (ONLY mobile/tablet breakpoints — desktop unchanged):
  - Collapsible hamburger sidebar on mobile/tablet (hidden by default, slide-in on tap)
  - Top navbar with hamburger icon on mobile/tablet
  - Card-based layouts replacing dense tables on small screens
  - Touch-friendly tap targets (min 44px)
  - Forms stack vertically on mobile
  - Sidebar overlay closes on outside tap
  - All existing desktop styles preserved exactly — only add media queries for <1024px

### Modify
- Sidebar: add Compliance (e-Way Bill, E-Invoice) and CRM sections
- App layout: add responsive wrapper with hamburger for mobile/tablet only

### Remove
- Nothing — zero regression of existing features

## Implementation Plan
1. Add eWayBill component: generation form, list, cancel, print
2. Add EInvoice component: generation, IRN display, QR placeholder, list, cancel, print
3. Add CRM components: LeadMaster, LeadList, FollowUp, conversion flow
4. Add Compliance sidebar section with e-Way Bill and E-Invoice subsections
5. Add CRM sidebar section
6. Implement responsive layout: hamburger button + slide-in sidebar overlay for screens <1024px, using Tailwind responsive prefixes (md:, lg:) without touching desktop styles
7. Validate all existing routes and components still render correctly
