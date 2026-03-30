# HisabKitab Pro — Phase 29

## Current State
Full-featured ERP with 28 phases. App.tsx has a desktop sidebar fixed at `lg:w-60` (240px). All features from Phases 1–28 intact.

## Requested Changes (Diff)

### Add
- **Collaboration Module** (new sidebar section): Comments and Tasks on vouchers
  - Voucher Comments: Add/view threaded comments on any voucher, with timestamp and author
  - Voucher Tasks: Create tasks tied to vouchers (assignee, due date, priority, status)
  - Collaboration Dashboard: Overview of open tasks, recent comments, and activity feed
- Desktop sidebar width changed to 15vw (15% of screen width) using inline style

### Modify
- Sidebar `<aside>` element: add `style={{ width: undefined }}` overridden with CSS/inline to set `15vw` on `lg` breakpoint
- Footer version bump: Ver. 28.0 → Ver. 29.0
- Add "Collaboration" section to sidebar nav

### Remove
- Nothing removed

## Implementation Plan
1. Change sidebar desktop width from `lg:w-60` to inline style `minWidth:'15vw', width:'15vw'` on desktop (use a wrapper or conditional style with window width check, or use CSS class override in index.css)
2. Create `src/frontend/src/components/collaboration/CollaborationDashboard.tsx` — shows open tasks and recent comments
3. Create `src/frontend/src/components/collaboration/VoucherComments.tsx` — comment thread per voucher number
4. Create `src/frontend/src/components/collaboration/VoucherTasks.tsx` — task list with create/edit/status update
5. Wire new components into App.tsx sidebar nav (Collaboration section) and renderMain()
6. Bump version to 29.0 in footer
