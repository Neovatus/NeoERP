# layouts-focus: lead decisions on the step c questions (D-102, 2026-11-27)

Decided by: industry standard → rules and regulation → principles / approved designs. Goes into the flow's `decisions.md` when the flow starts.

| # | Question (ds-1-brief step c) | Decision | Sources |
|---|---|---|---|
| LF-1 | Journals at medium/expanded width | One pane at a time below 1280; list and detail side by side from 1280 when the list keeps its minimum width beside the menu. | M3 canonical list-detail (two panes only when both fit; our widths per WC/NeoWindowClass, not 840); Apple HIG split view (collapses to a stack in compact); screen-standard §1 |
| LF-2 | Narrow window, detail open: Back | Back returns to the list with the same row selected and the same scroll position. | M3 list-detail (selection kept); Apple HIG navigation (back restores the previous state); WCAG 2.2 2.4.3 focus order (focus goes back to the row) |
| LF-3 | Window grows / shrinks with a detail open | Grows: both panes, that row selected. Shrinks: keep the detail (Back goes to the list). | M3 list-detail adaptive behaviour (preserve the focused pane); Apple HIG split view collapse (shows the secondary/detail) |
| LF-4 | Side panels: fixed or resizable | Fixed token widths now; resizing later only if asked, and then with a non-drag way to resize. Below 600 the side panel is full screen (WC-4, tested here). | M3 supporting pane (fixed widths); WCAG 2.2 2.5.7 dragging movements; EN 301 549 9.2.5.7 / 11.5.2.x (software) |
| LF-5 | Modal focus | Every modal: focus moves in, stays inside, Escape closes (if unsaved changes: confirm first; the same confirm on Cancel, Back and closing a form with changes, backlog f34ac6b placement), focus returns to the trigger. Sheets can be sized with buttons or keys, not only by dragging. | WAI-ARIA APG dialog (modal) pattern; WCAG 2.2 2.4.3, 2.1.2 (no keyboard trap: Escape always gets out), 2.4.11 focus not obscured, 2.5.7; Apple HIG sheets / Material 3 dialogs |
| LF-6 | Wide screens ≥1920 (moved here by WC-1) | Lists and tables use the full width; forms and detail pages cap at ~1200–1440 and centre; tested at 1920 and 2560. | D-85 item 3 (Jabran-approved) |

**When:** after #16 (spreading) lands on `main`. #16 changes the Journals routes and state, `NeoDialog`, `NeoReasonGate` and `NeoSmartContentArea`, so building this flow earlier would conflict. Cut from `main` (or `core/design-system/feature` if that has not landed yet).
