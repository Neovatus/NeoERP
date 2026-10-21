# NeoERP — design principles (settled)

Index of everything settled for design, as of 2026-10-20. Written by Cowork · ERP reviewer for the Code · ERP lead. **The linked files are the source of truth**; this page only lists what is decided and where it lives. The ERP lead owns every shared file below.

## A. How a design is made (process)

1. **Design first, then build.** No build starts until the module's contract **and** its rig are approved (design gate, playbook §2). Jabran approves rigs.
2. **The Screen Rig is the design** (`NeoERP-App/docs/design/screen-rig/app.html`). It wins over older notes; the design system (`NeoERP-App/docs/design/design-system/`, tokens in `neoerp-tokens.json`) sets type, colour, spacing and icons, matched by measurement (screen-standard §1). The domain model is `docs/domain/RULES.md`.
3. **Every state is drawn:** empty, loading, error, no access, module off, read-only, offline, filters-found-nothing, at **1440 · 1280 · 1024 · 768 · 390** (screen-standard §9).
4. **v2 replaces v1** (Jabran, 2026-10-09): old screens and calls are not patched; each is deleted in the checkpoint that builds its replacement.
5. **The company's Org country decides** formats, packs and labels in every module; nobody is asked again (`target-countries.md`). Countries without a pack show "coming", never another country's rules.
6. **Domain-correct, not just pretty:** if a local practitioner (NO, SE, DK, FI, IS, PK) would reject it, the lead rejects it first.

## B. Interaction (`NeoERP-App/docs/design/ux-principles.md`, Jabran 2026-09-26)

1. One concept, one pattern: the same thing is shown and chosen the same way everywhere; lift, don't redraw.
2. Detail sits under its parent and appears only when it matters.
3. Defaults are visible; only departures are stored and summarised.
4. Creating is a form with one save; changing something in force is a named action with a reason gate. Never a silent toggle save. *Exception:* module, feature and branch settings may use an inline control that only opens the gate (ux §4).
5. Every change says why (reason, plus a reference where paperwork exists); shown in history and audit.
6. Permissions decide what is shown: no view → hidden; view only → same screen read-only at full contrast; change → actions. Never offer what the backend refuses. *Exception:* read-only module and feature rows show status pills (ux §6).
7. Say what happened, in words; errors say what to do, never a code.
8. State is never lost (resize, failed save, dismissed dialog).
9. Sentence case, plain words, the company's words; no internal codes.
10. Tokens only.
11. Work comes to you: each person's home shows what waits for them (approvals, tasks, due items, problems).
12. Find anything two ways: by structure (same menu order everywhere) and by one global search (Ctrl/⌘ K).
13. You always know where you are: title, breadcrumb, highlighted menu item; search, filters, main action and Back in the same place on every screen; related records one click away both ways.
14. Fewest steps: frequent tasks at most 3 clicks from the module home; remembered filters and recents; bulk actions and shortcuts; no dead ends.
15. Recognise, don't remember: names next to codes, key facts on top, reasons next to anything disabled.
16. The main task first; the rest folds away: main job and action visible without scrolling at every width; secondary detail in collapsible sections (closed by default, with a one-line summary, remembered per person); main action stays reachable.
17. The context is always visible: company, branch, period and currency shown; switching is deliberate; writes show the target company by the main action.
18. Caution in proportion to risk: reversible → Undo, no dialog; risky → confirm once; irreversible → designed out (posted money is reversed with a reason, never deleted).
19. Keyboard-first data entry: tab order, Enter to advance and save, shortcuts, paste rows from a spreadsheet.
20. Accessible by default: keyboard-only and screen-reader use, WCAG 2.2 AA contrast, never colour alone, text to 200 %.
(Fast feedback with background jobs is part of 14; help in place from the glossary is part of 15.)
- **Top tasks check:** each module spec lists its 5–10 most frequent tasks with click counts; part of every rig review.

## C. Layout and resizing (`NeoERP-App/docs/design/screen-standard.md`)

- Resizing is continuous and monotonic; layout changes once, where content stops fitting, measured on the component's own width; resizing never loses state.
- Each size looks right for its size (header, stats, toolbar, table → tight table → cards, row actions; table in §3).
- Space goes to content: never clip or wrap controls; every column has a `minWidth`; below the tight minimum a record table becomes cards. No sideways scroll of the page or a record table; only matrix grids (permission, compare, time/month grids) may scroll inside their card, row labels pinned (§4).
- No hard-coded dp/sp; type roles, motion and icons from the design system.
- Controls in a row share a height; compact density.
- List screens and forms/wizards built from the standard components (§7–8); record forms in `NeoSidePanel`.
- Rig review at 1440 · 1280 · 1024 · 768 · 390; screenshot tests at 1440 and 390 plus a 320–1440 width sweep (§9).

## D. Shared building blocks (`NeoERP-App/docs/design/specs/building-blocks.md`)

- **Which component to use:** `neoInteractive`, `NeoListRow`, `NeoDataTable`, `NeoSectionCard`, `NeoEntityStatus`, `NeoOnOffPill`, `NeoQuoteBlock`, `NeoReasonGateDialog`, `NeoLoadError`, dialogs, chips, type roles. A module never builds its own.
- **Page states:** `NeoSpotState` (cause table: offline, broken, unavailable, denied, module off, not found), `NeoSkeleton` (no spinners), `NeoOfflineStrip` (keep shown data, pause writes), business refusals as an inline warn notice with fixed copy, never server text. Code reference: Org People (`CompanyPeopleTab.kt`, `CompanyListUi.kt`).
- **Choosing from a list:** company data or growing → `NeoSearchSelect`; known number or name → searchable; instant view switch → segmented buttons; fixed short set → plain dropdown; several → `NeoMultiSelect`. Full spec `list-controls.md` (LC-1…LC-36).
- **Numbers and money:** `NeoMoney` / `NeoPercent` in the company format; ambiguous typing ("1.250" in Nordic) refused, never guessed; API carries plain decimals.
- **Dates:** one parser, company format of the company being edited plus ISO and digit-only forms, years 1900–2099, refused with "Use {format}…"; API carries ISO; `NeoDateField`.
- **Screen text and languages** (2026-10-15, C3): all copy in string resources, keys `<module>_<area>_<name>`, ViewModels hold no display text, English first then nb/sv, then da/fi/is.
- **Bank details changes** (7 rules): structured fields with checksum; a change is a request approved by a second person (Owner's own only when no one else can); approver sees old → new and ticks "I confirmed…"; 30-day flag on payments; re-auth and notice for self-service; masked with audited 30 s reveal; dated history. Applies to new records too.
- **HR and Payroll components** (ERP-1): date range, time field, month calendar, time grid, stepper, variance table, file download, tabs, phone tab bar and sheet, approval card; each with its own spec file.
- **Module and feature rows:** `specs/module-rows.md` (MR-1, MR-2).

## E. Rig ownership (protocol §7)

- Each module lead edits only its own `data-file` blocks in `app.html`.
- The ERP lead owns the rig root (shell, routes, `tweaks-panel.jsx`) and the shared-area screens (Org, People/IAM, Roles, Activity).
- Shared specs change only through the ERP lead, followed by an FYI to every inbox.

## F. Found while writing this — resolved (ERP lead, 2026-10-20)

1. **Dates:** screen-standard §8 now points to building-blocks "Typing dates" (company format of the company being edited, plus ISO and digit-only forms). Resolved.
2. **Sideways scroll:** no sideways scroll of the page or of a record table (cards below the tight minimum); **only matrix grids**, where columns are the data, may scroll inside their own card with `NeoTableScroll`, row labels pinned. screen-standard §4 and building-blocks "Tables" now say the same. Resolved.
3. **Required widths:** rig review at **1440 · 1280 · 1024 · 768 · 390**; screenshot tests at 1440 and 390 plus the 320–1440 sweep. In screen-standard §9 and playbook §2. Resolved.
4. Also fixed: §A.2 named the removed `NeoERP-Design` folder; it now names the design system in `NeoERP-App/docs/design/design-system/` and `docs/domain/RULES.md`.
