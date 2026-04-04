# HisabKitab Pro - Node.js + MySQL Backend v3.0

Complete Node.js backend with 200+ features mirroring the Motoko/ICP backend.
**Live Caffeine app is 100% untouched.**

## Quick Setup
```bash
npm install
cp .env.example .env      # Fill in your MySQL credentials
npm run migrate           # Creates all 55+ tables
npm run seed              # Admin user + default data
npm run dev               # Start on port 3001
```

**Login:** admin / admin123
**Health:** http://localhost:3001/api/health

## 42 Modules Included
auth, users, companies, ledger-groups, ledgers, vouchers, hsn-codes, gst,
reports (balance-sheet, trial-balance, P&L, day-book, cash-flow, ratios, ledger-account, outstanding),
stock-groups, stock-items (summary, ledger, movement), stock-vouchers,
employees, payroll (salary-structure, vouchers, register, salary-slip),
hr (attendance, leaves), banking (accounts, transactions, BRS, reconciliation),
cheques, fixed-assets (depreciation, maintenance, AMC), cost-centres, currencies,
customers (with aging), vendors, budgets (vs-actual), orders (purchase/sales),
projects (costs, revenues, P&L), crm, pos, branches, service, subscriptions,
compliance (eway-bills, einvoices, gst-filing), multi-company (balance-sheet, P&L),
notifications (smart-alerts), rules, event-ledger (time-travel, undo),
maker-checker, collaboration (comments, tasks), ecommerce, whatsapp,
customization (fields, config, workflows), tally-import, analytics,
settings (premium-features, invoice-templates, contact-queries),
data-management, ai-tools, utilities, audit-log

*HisabKitab Pro - independently developed, not affiliated with Tally Solutions.*
