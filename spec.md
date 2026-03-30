# HisabKitab Pro

## Current State
Full ERP system with 21 phases deployed. All existing sidebar sections, components, and routes intact. Latest version is v21.0.

## Requested Changes (Diff)

### Add
- **Purchase Orders (PO) workflow** — new sidebar section "Purchase Orders" with:
  - PO Entry form (vendor, items, qty, rate, tax, terms)
  - PO List (pending, approved, received, cancelled statuses)
  - PO Receipt (receive goods against a PO, creates stock entry)
  - PO Reports (PO Register, Outstanding POs)
- **Sales Orders (SO) workflow** — new sidebar section "Sales Orders" with:
  - SO Entry form (customer, items, qty, rate, tax, delivery date)
  - SO List (pending, confirmed, dispatched, cancelled statuses)
  - SO Dispatch (dispatch goods against a SO)
  - SO Reports (SO Register, Outstanding SOs)
- New nav keys: `poEntry`, `poList`, `poReceipt`, `poRegister`, `soEntry`, `soList`, `soDispatch`, `soRegister`
- New components: `PurchaseOrderEntry.tsx`, `PurchaseOrderList.tsx`, `PurchaseOrderReceipt.tsx`, `PurchaseOrderRegister.tsx`, `SalesOrderEntry.tsx`, `SalesOrderList.tsx`, `SalesOrderDispatch.tsx`, `SalesOrderRegister.tsx`

### Modify
- `App.tsx` — add new nav items for Purchase Orders and Sales Orders sections, import and route new components; update version to v22.0

### Remove
- Nothing

## Implementation Plan
1. Create `PurchaseOrderEntry.tsx` — form with vendor selector, line items (item, qty, rate, GST), terms, expected delivery date; save to localStorage
2. Create `PurchaseOrderList.tsx` — list with status filter (Pending/Approved/Received/Cancelled), approve/cancel actions
3. Create `PurchaseOrderReceipt.tsx` — receive against a PO, marks PO as Received
4. Create `PurchaseOrderRegister.tsx` — tabular report of all POs with filters
5. Create `SalesOrderEntry.tsx` — form with customer selector, line items, delivery date; save to localStorage
6. Create `SalesOrderList.tsx` — list with status filter, confirm/cancel actions
7. Create `SalesOrderDispatch.tsx` — dispatch against an SO, marks SO as Dispatched
8. Create `SalesOrderRegister.tsx` — tabular report of all SOs with filters
9. Update `App.tsx` — add two new sidebar sections, import components, add routes, update version badge
