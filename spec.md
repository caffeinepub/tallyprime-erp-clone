# TallyPrime ERP Clone

## Current State
Phases 1-3 are live. The app has:
- Company management
- Ledger groups & ledgers (double-entry accounting)
- 6 voucher types with balanced entry validation
- GST compliance: HSN Master, GST Settings (37 states), GST Voucher Entry, GSTR-1, GSTR-3B, Tax Ledger Balances
- Financial Reports: Balance Sheet, P&L Account, Cash Flow Statement
- Dark/light theme toggle, User profile dropdown

## Requested Changes (Diff)

### Add
- **StockGroup** type: id, name, parentGroupId (optional), unit of measure
- **StockItem** type: id, companyId, name, stockGroupId, unit, openingQty, openingRate, openingValue, gstRate, hsnCode
- **StockVoucher** type: id, companyId, voucherType (Receipt/Issue/Transfer), voucherNumber, date, narration, entries[]
- **StockVoucherEntry**: stockItemId, qty, rate, amount, warehouseFrom (optional), warehouseTo (optional)
- Backend CRUD: createStockGroup, getAllStockGroups, createStockItem, updateStockItem, getAllStockItems, createStockVoucher, getAllStockVouchers
- Backend reports: getStockSummary (per item: opening qty/val, in-qty/val, out-qty/val, closing qty/val), getStockLedger (movement history for an item)
- Frontend: StockGroups component, StockItems component, StockVoucherEntry component, StockSummary report, StockLedger report
- Sidebar section "Inventory" with: Stock Groups, Stock Items, Stock Receipt, Stock Issue, Stock Transfer, Stock Summary, Stock Ledger

### Modify
- App.tsx: add Inventory nav section and route handlers for new inventory views
- Version bump to v4.0 in header and footer

### Remove
- Nothing removed

## Implementation Plan
1. Add Motoko types and functions for StockGroup, StockItem, StockVoucher
2. Update backend.d.ts with new interfaces and method signatures
3. Create StockGroups.tsx component (CRUD for stock groups)
4. Create StockItems.tsx component (CRUD for stock items with HSN/GST linkage)
5. Create StockVoucherEntry.tsx component (Receipt/Issue/Transfer entry)
6. Create StockSummary.tsx report (opening + in - out = closing per item)
7. Create StockLedger.tsx report (movement detail per item with dates)
8. Update App.tsx with Inventory nav section and routing
