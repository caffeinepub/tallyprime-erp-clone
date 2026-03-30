# HisabKitab Pro — Phase 26

## Current State
Phase 25 deployed. App has: full ERP suite (Phases 1-25), keyboard shortcuts for F1-F9/Esc, command strip buttons (G: Go To, G: Print, E: Export, M: E-Mail, H: Help) that are rendered but NOT wired to any actions, theme saved in localStorage via themeManager, profile data saved in localStorage only, no Smart Alerts System, no Rule Engine, no Maker-Checker workflow.

## Requested Changes (Diff)

### Add
- **Smart Alerts System** (new sidebar section): Dashboard showing live alerts — low stock (items below threshold), overdue receivables/payables, cash flow risk, GST filing deadlines. Alert configuration screen to set thresholds. Alert history.
- **Rule Engine** (new sidebar section): Define automation rules — auto GST rate by ledger/HSN, approval threshold trigger (vouchers > ₹X need approval), recurring entry scheduler. Rule list with enable/disable toggle.
- **Maker-Checker Workflow** (new sidebar section, Admin only): Pending Approvals queue, approve/reject actions, approval history log. Voucher entry creates a "pending" voucher when logged-in user lacks final-post permission.
- **Working command strip keyboard shortcuts**: G key → Go To modal (navigation search overlay), P key → window.print(), E key → navigate to exportCenter, M key → navigate to invoiceDispatch, H key → Help modal. Also make command strip buttons clickable with onClick handlers.
- **Profile data persisted to backend**: saveUserProfile / loadUserProfile functions added to backend calls (store in localStorage + backend actor if API exists; if not, use localStorage with a backend key-value store pattern). For now, profile is already in localStorage — ensure it loads correctly on mount and syncs across sessions.
- **Theme color properly applied on load**: Ensure `loadSavedTheme()` AND `applyTheme()` run on app mount so theme persists across page refreshes.

### Modify
- App.tsx: Add keyboard event listeners for G/P/E/M/H keys (only when not focused on input/textarea). Make command strip buttons clickable. Add new sidebar nav sections for Smart Alerts, Rule Engine, Maker-Checker. Ensure loadSavedTheme called in useEffect on mount.
- Add new nav keys to VIEW_LABELS and ROLE_ALLOWED_KEYS.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/components/SmartAlerts.tsx` — alerts dashboard with 4 categories, config, and history. Uses localStorage for rules/thresholds and simulated data from existing stock/ledger patterns.
2. Create `src/frontend/src/components/RuleEngine.tsx` — rule definition UI with rule types (GST auto-apply, approval threshold, recurring entry). Rules stored in localStorage.
3. Create `src/frontend/src/components/MakerChecker.tsx` — pending approvals queue, approve/reject workflow. Pending vouchers stored in localStorage with status field.
4. In `App.tsx`:
   - Add keyboard handler for G/P/E/M/H keys (checking activeElement is not input/textarea/select)
   - Add `GoToModal` component — searchable list of all NAV_ITEMS, press Enter to navigate
   - Add `HelpModal` component — keyboard shortcuts reference
   - Wire command strip buttons to onClick handlers
   - Add new sidebar items: smartAlerts, ruleEngine, makerChecker (makerChecker adminOnly)
   - Update VIEW_LABELS and ROLE_ALLOWED_KEYS
   - Ensure `loadSavedTheme()` called in useEffect
5. Ensure renderMain() handles new view keys.
