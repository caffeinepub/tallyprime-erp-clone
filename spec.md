# HisabKitab Pro — Phase 40

## Current State
- Full ERP with 39 phases, 200+ features
- Event Timeline exists but clicking items does nothing (no click handler / detail view)
- Sidebar items have no hover tooltips/descriptions
- InvoiceTemplates is basic (3 templates, no logo/signature/color customization)
- AISettings only supports OpenAI key; no Gemini API key option
- OpenAI API error handling shows raw error including "rate limit exceeded" without user-friendly handling
- No company branding (custom logo upload) feature
- No share company option (link share or QR code)
- No PDF export of company data
- No mobile camera quick-add bill option
- No remote MySQL/SQLite connection option (HTTP outcall bridge)
- Some UI text readability issues on desktop (not mobile)

## Requested Changes (Diff)

### Add
1. **Event Timeline click interaction** — clicking a timeline event opens a detail panel/modal showing full event info, related entries, and action buttons (view, replay, undo)
2. **Sidebar hover tooltips** — hovering any sidebar menu item shows a floating description box with manual guide for that feature; disappears on mouse leave
3. **Invoice Customization (Advanced)** — new full-featured InvoiceCustomizer component:
   - Upload company logo or use default HK logo
   - Upload signature image
   - Pick invoice accent color
   - Header/footer text customization
   - Paper size (A4/Letter)
   - Show/hide fields toggle (GSTIN, PAN, bank details, etc.)
4. **Company Branding** — new CompanyBranding component under Integrations/Appearance:
   - Upload custom company logo
   - Preview how it looks in header
   - Stored in localStorage as base64
5. **Gemini API Key** — add Gemini API key field to AISettings alongside OpenAI
   - Store as `hisabkitab_gemini_key` in localStorage
   - Add `callGemini()` utility function
6. **OpenAI error fix** — improve error handling: detect rate limit / quota exceeded errors and show clear message "Your OpenAI quota is exceeded. Please check your plan at platform.openai.com"; also add model fallback from gpt-3.5-turbo to gpt-4o-mini
7. **Share Company** — new ShareCompany component:
   - Generate shareable link with encoded company data
   - QR code display (using qrcode generation via canvas)
   - Download company data as PDF (using window.print / CSS print)
8. **Mobile Camera Bill** — floating camera button on mobile that opens device camera to photograph a bill, then creates a new voucher entry with the image attached (OCR optional via Gemini)
9. **Remote MySQL/SQLite HTTP Bridge** — new RemoteDatabaseConfig component under Integrations:
   - User fills in: host, port, database name, username, password, type (MySQL/SQLite)
   - App makes HTTP outcall via a proxy endpoint concept (direct fetch to user's server)
   - Test connection button, sync status display, last sync time
   - Explanation that user must host a simple REST bridge on their server
10. **UI text readability** — ensure labels, headings, table headers in desktop view have proper contrast (text-foreground not text-muted-foreground for primary labels)

### Modify
- `EventTimeline.tsx` — add onClick on each event card to open detail drawer/modal
- `AISettings.tsx` — add Gemini key section, fix OpenAI error messages
- `InvoiceTemplates.tsx` — rename/extend to show link to new InvoiceCustomizer
- `openai.ts` — improve error handling, model update
- `App.tsx` — add new nav items, import new components, add hover tooltip logic to sidebar

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/utils/gemini.ts` — Gemini API call utility
2. Update `src/frontend/src/utils/openai.ts` — better error handling, model update to gpt-4o-mini
3. Update `EventTimeline.tsx` — add click-to-detail-modal on events
4. Update `AISettings.tsx` — add Gemini key section
5. Create `src/frontend/src/components/InvoiceCustomizer.tsx` — advanced invoice customization
6. Create `src/frontend/src/components/CompanyBranding.tsx` — company logo branding
7. Create `src/frontend/src/components/ShareCompany.tsx` — share via link/QR/PDF
8. Create `src/frontend/src/components/RemoteDatabaseConfig.tsx` — MySQL/SQLite HTTP bridge config
9. Update `App.tsx` — add tooltip system to sidebar, new nav items, new imports, Mobile camera bill FAB enhancement
