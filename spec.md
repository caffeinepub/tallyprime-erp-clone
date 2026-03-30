# HisabKitab Pro — Phase 35: HR & Attendance

## Current State
Phases 1–34 complete. App has accounting, GST, inventory, payroll, banking, reports, fixed assets, cost centres, multi-currency, RBAC, analytics, audit trail, advanced reporting, notifications, integrations, AI tools, voice, WhatsApp, budgeting, multi-company, project costing, portals, purchase/sales orders, compliance, CRM, POS, multi-branch, service management, collaboration, event ledger, doc intelligence, smart compliance engine, customization engine, Tally import, advanced analytics with premium widgets, isolated company per user.

## Requested Changes (Diff)

### Add
- **HR & Attendance** new sidebar section with:
  - **Employee Master** — create/edit employees with name, employee code, department, designation, joining date, salary type (monthly/daily), basic salary, PAN, Aadhaar, bank account, contact info
  - **Attendance Register** — daily/monthly attendance view, mark Present/Absent/Half-Day/Leave per employee per date, bulk mark attendance
  - **Leave Management** — Leave types master (Casual, Sick, Earned, etc.), apply leave, approve/reject (admin/manager), leave balance per employee
  - **Salary Slip Generator** — generate salary slip for selected employee and month, auto-calculate gross from basic + allowances - deductions, show PF/ESI/TDS deductions, print-ready slip
  - **HR Dashboard** — headcount by department, attendance % chart, leave requests pending, salary disbursement status
- **Asset Maintenance** new sidebar section with:
  - **Maintenance Schedule** — create preventive/corrective maintenance tasks for assets with due dates, assigned technician
  - **Maintenance Log** — record completed maintenance with date, cost, notes
  - **AMC/Warranty Tracker** — track AMC/warranty expiry with alerts 30/60 days before expiry
- **Subscription & Recurring Billing** new sidebar section with:
  - **Recurring Invoice Templates** — create templates (customer, items, amount, frequency: monthly/quarterly/annual)
  - **Subscription Register** — list active subscriptions with next due date, status
  - **Renewal Alerts** — overdue and upcoming renewals with 7/30 day warnings

### Modify
- Sidebar: add HR & Attendance, Asset Maintenance, Subscription & Recurring Billing sections
- Payroll section: link to HR Employee Master for employee data

### Remove
- Nothing removed

## Implementation Plan
1. Add HREmployee type and attendance/leave/salary data structures in frontend state (localStorage)
2. Build EmployeeMaster CRUD component
3. Build AttendanceRegister component with monthly grid view
4. Build LeaveManagement component (types, apply, approve)
5. Build SalarySlipGenerator with print layout
6. Build HRDashboard with summary cards and charts
7. Build AssetMaintenance screens (Schedule, Log, AMC Tracker)
8. Build SubscriptionBilling screens (Templates, Register, Renewal Alerts)
9. Wire all new sections into sidebar
10. Validate and deploy
