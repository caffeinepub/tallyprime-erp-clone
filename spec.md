# HisabKitab Pro — v43 UI/UX & Shortcut Overhaul

## Current State

Version 42.0 is live with 200+ features across 39 phases. The app uses:
- Poppins font at 10px base (body font-size: 1.3rem)
- OKLCH color tokens (dark/light themes)
- Command strip with Alt+D, Alt+H, Alt+P, Alt+X, Alt+M shortcuts
- F4–F9 voucher shortcuts, F1 for ledgers
- `hk-key-badge`, `hk-menu-item`, `cmd-btn` CSS classes
- teal accent color (#60% 0.12 195 OKLCH)
- Dashboard (GatewayHome) with 5 tile cards in a grid
- Status bar at bottom with Ver. 42.0 and disclaimer
- Sidebar 15vw width on desktop with collapsible sections
- Version shown as 42.0

## Requested Changes (Diff)

### Add
- Better font readability: increase font sizes for headings (14–16px), body (12–13px), sidebar labels (11–12px) — while keeping Poppins as primary font
- Improved dashboard (GatewayHome): richer tile cards with gradient accent bars, better spacing, sub-action chips visible inside each tile, modern card borders, financial summary row at top
- Secondary font option: Import Inter as fallback alongside Poppins for a more refined look
- Dashboard shows a top "vitals row" with quick stats: Today's Entries, Pending Approvals, Alerts count, Company name badge
- Function key shortcuts redesigned: F4–F9 stay for voucher types, but add Ctrl+B=Balance Sheet, Ctrl+T=Trial Balance, Ctrl+D=Day Book, Ctrl+G=GSTR-1, Ctrl+I=Inventory Summary — these don't conflict with browser (Ctrl+B is bold in editors but not in ERP context without text focus)
- More user-friendly shortcut keys (browser-safe): remove the raw F-key display from the command strip; show them in a styled shortcut bar instead
- Improved command strip: show shortcut chips with icon + key label, nicer styling, not cluttered
- Dashboard tiles: each tile now has 3–4 sub-action clickable chips inside so users can jump directly to sub-screens
- Color palette upgrade: replace pure teal with a more sophisticated indigo-teal dual-accent. Primary actions use indigo (#4F46E5-like in OKLCH), secondary accents use teal. This differentiates more from Tally (which uses blue-gray).
- Version bump to 43.0 in status bar

### Modify
- `index.css`: Upgrade font sizes. body: 1.3rem stays but add explicit `.text-body` class at 12px, section headers at 10.5px, sidebar nav items at 11.5px
- `index.css`: Update OKLCH primary color tokens to a richer indigo-based palette instead of pure teal-blue, while keeping teal as accent
- `GatewayHome.tsx`: Redesign dashboard tiles — richer cards with color-coded top border bars, clickable sub-action chips, vitals row at top, Quick Navigation section enhanced
- `App.tsx`: Update command strip buttons to use icon+label chips. Update help modal shortcut table to show new shortcuts. Update keyboard handler to add Ctrl+B, Ctrl+T, Ctrl+D, Ctrl+G, Ctrl+I shortcuts. Keep all F-key shortcuts working. Update version to 43.0.
- `App.tsx`: Sidebar section headers — add colored left dot indicator per section category (Masters=blue, Transactions=green, Reports=amber, etc.)
- `App.tsx`: Sidebar nav items — increase text size to 11.5px from 12px class, add hover transition with subtle background
- `index.css`: `.hk-menu-item` text size increase, `.hk-section-header` slight size up
- `index.css`: `.hk-key-badge` — more modern pill style, better contrast
- `index.css`: `.cmd-btn` — add icon support, slightly taller, better border styling

### Remove
- Nothing removed — all existing features and functionality preserved exactly

## Implementation Plan

1. **index.css**: 
   - Import Inter font alongside Poppins as fallback
   - Update OKLCH primary color in dark/light themes to indigo-teal (primary: 55% 0.20 265 — deep indigo-blue, teal stays as accent)
   - Increase sidebar text sizes in `.hk-menu-item` to text-[11.5px], `.hk-section-header` to text-[10.5px]
   - Upgrade `.hk-key-badge` to more modern rounded-full pill with better contrast
   - Upgrade `.cmd-btn` to taller (py-2), slightly more padded, cleaner border
   - Add `.hk-stat-card` utility class for vitals row cards
   - Add `.hk-tile-chip` utility class for dashboard tile sub-action chips

2. **GatewayHome.tsx**: Full redesign:
   - Add vitals row at top: 4 stat cards (Today's Entries count, Pending Alerts, Open Sales Orders placeholder, Company GST status)
   - Each main tile card: colored top accent border (2px), larger icon, bold title, shortcut badge, then sub-action chips row at bottom that navigate to sub-screens
   - Make tiles 4-column on xl screens, 3-column on lg, 2-column on md, 1-column on mobile
   - Quick Navigation section: show as horizontal scrollable chip row instead of grid
   - Overall more spacious, professional, eye-catching

3. **App.tsx**:
   - Command strip: replace text-only buttons with icon+label chips (use Lucide icons: LayoutDashboard for Alt+D, HelpCircle for Alt+H, Printer for Alt+P, Download for Alt+X, Mail for Alt+M)
   - Add keyboard handlers for Ctrl+B (Balance Sheet), Ctrl+T (Trial Balance), Ctrl+D (Day Book), Ctrl+G (GSTR-1), Ctrl+I (Stock Summary) — only when not typing and activeCompany exists
   - Update Help modal shortcut table to include new shortcuts
   - Update status bar version to 43.0
   - Sidebar nav items: add subtle category color dot before section headers (optional)

4. No backend changes needed. No component imports change. No routes change. No existing logic touched.