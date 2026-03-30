# HisabKitab Pro — Phase 33

## Current State
Phase 32 is live with 84+ components covering all ERP features through Smart Compliance Engine, Rule Engine, Advanced Security, Collaboration, Event Ledger (basic), and Doc Intelligence. Backend is persistent Motoko actor.

## Requested Changes (Diff)

### Add
- **Event Ledger Deep Enhancements**: Time-Travel Report (pick any date → rebuild Trial Balance from events), Undo/Redo Stack (visual panel with bulk undo/redo), Diff Viewer (compare two snapshots side-by-side with delta highlights)
- **Tally Import** (new sidebar section): 4-step import wizard (upload XML/CSV → field mapping → preview with error rows → import with summary), Migration History table, Sample XML/CSV download
- **Customization Engine** (new sidebar section): JSON Config Editor (save/reset/export/import), 3 Config Templates (Minimal/Full/GST-Only), Workflow Builder (trigger + multi-step actions + enable/disable), Custom Fields manager (Voucher/Ledger/Customer/Vendor)

### Modify
- Sidebar: Add "Tally Import" and "Customization Engine" sections
- Event Ledger section: add Time-Travel Report, Undo Stack, Diff Viewer tabs

### Remove
- Nothing

## Implementation Plan
1. Create TimeTravelReport.tsx component in event-ledger folder
2. Create UndoRedoStack.tsx component in event-ledger folder  
3. Create DiffViewer.tsx component in event-ledger folder
4. Create TallyImport folder with ImportWizard.tsx, MigrationHistory.tsx
5. Create CustomizationEngine folder with JSONConfigEditor.tsx, WorkflowBuilder.tsx, CustomFields.tsx
6. Wire all new components into App.tsx sidebar and routing
