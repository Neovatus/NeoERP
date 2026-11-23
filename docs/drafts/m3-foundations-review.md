# Material 3 Foundations vs NeoERP app layout (review, 2026-11-23)

Draft research note for ADR-027. Source: m3.material.io Foundations, read in Jabran's browser (layout: overview, parts of layout, adaptive design, scaffold overview/panes/rails, grids, spacing, density, breakpoints overview/compact/medium/expanded/large-xl, canonical examples overview/list-detail/supporting pane, RTL; plus desktop, inputs, design tokens, states, usability, building for all). App code: `NeoERP-App` `phase/4` (2026-11-23).

## 1. What Material 3 prescribes

**Breakpoints** (formerly window size classes, Android and web):

| Breakpoint | Width (dp) | Panes (recommended) | Navigation | Margins / spacer |
|---|---|---|---|---|
| Compact | < 600 | 1 | navigation bar or modal expanded rail, near the bottom | 16 |
| Medium | 600–839 | 1 (2 only for low-density content, 50/50) | rail (1 pane) or bar (2 panes) | 24 / 24 |
| Expanded | 840–1199 | 2 (1 for dense content) | collapsed or expanded rail | 24 / 24 |
| Large | 1200–1599 | 2 | rail, collapsed or expanded | 24 / 24 |
| Extra-large | ≥ 1600 | 2 (3 with a standard side sheet) | expanded rail | 24 / 24 |

Height classes (Android): compact < 480, medium 480–899, expanded ≥ 900; "rarely needed", but used when height is small (phones in landscape).

**Scaffold:** every layout is bars (app bar, navigation bar), rails (perimeter: navigation rail, toolbars, FAB, companion rail) and 1–3 panes. Panes are fixed or flexible (at least one flexible), permanent or temporary. Fixed pane: 360 dp (expanded), 412 dp (large/xl); side sheet max 400 dp. Split-pane keeps the spacer visually centred (the navigation shrinks only the first pane).

**Canonical layouts:** list-detail (1 pane < 840, 2 panes ≥ 840; back button only single-pane, selected state only two-pane), supporting pane (below the main pane on compact/medium, a bottom sheet on compact; a 360 dp side pane on expanded), feed; plus layering ("levitate") for focused tasks.

**Across breakpoints, ask:** what to reveal, divide, resize, reposition, swap (only functionally equivalent components: bar ↔ rail, bottom sheet ↔ menu, full-screen dialog ↔ dialog).

**Grids and rulers:** columns grow with width; rulers (bar/safety, title, content) align content; Compose "Rulers" implement it.

**Density:** data-heavy views may be denser; density never changes automatically by breakpoint or orientation, only by the user; targets stay ≥ 48×48.

**Desktop:** not a stretched phone; denser layouts, in-app multitasking (panels, multi-window), keyboard, mouse and trackpad first-class.

**Other foundations:** tokens instead of hard-coded values (reference → system → component); states (enabled, disabled, hover, focus, pressed, dragged) applied consistently; RTL mirroring with leading/trailing naming (relevant for Urdu later); 40–60 characters per line.

## 2. What NeoERP does today

| Topic | NeoERP | Material 3 | Gap |
|---|---|---|---|
| Breakpoints | own tokens `NeoBreakpointTokens` 600 / 720 / 1024 / 1280 (+1440) | 600 / 840 / 1200 / 1600 | different numbers; we have no 840 or 1600 band |
| Height | none | compact < 480 | **phone landscape (375–402 pt high) is exactly compact height**; QA fixed it screen by screen |
| Library | no `material3-adaptive` (Compose Material3 1.10.0-alpha05 only) | `currentWindowAdaptiveInfo()` / `WindowSizeClass` | we compute classes by hand |
| Width checks | ~306 `BoxWithConstraints` / `maxWidth` checks; 24 files with literal `600.dp`…`1440.dp` | one size class passed down as state | scattered logic, hard to keep consistent |
| Navigation | own shell: hamburger < 1024, mini rail 1024–1279, full sidebar ≥ 1280 | bar < 600, rail ≥ 600, expanded rail ≥ 1200 | similar idea; ERP module tree needs our sidebar |
| Panes | own pages + `NeoSidePanel` (full screen < 600) | list-detail, supporting pane, fixed 360/412, side sheet ≤ 400 | no shared pane scaffold; widths chosen per screen |
| Margins | per screen-standard.md | 16 / 24 / 24 | check against tokens |
| Density | ERP tables, desktop | user-controlled, never automatic | matches our "personal settings later" backlog |
| Tokens | `neoerp-tokens.json` authoritative | token tiers | same principle; keep ours |
| Look | our tokens + iOS system defaults (`apple-platform-look.md`) | M3 Expressive look | **keep ours**; M3 look conflicts with the iOS rule |

## 3. Recommendation (for ADR-027, after Phase 4)

1. **Adopt the mechanics, keep the look.** Use M3 breakpoints as the single source for layout decisions, through `org.jetbrains.compose.material3.adaptive:adaptive` (`WindowSizeClass`, including height). Keep NeoERP tokens, building blocks and iOS system defaults.
2. **Use compact height (< 480) for the short-screen rules** (page head scrolls away, one-row footer, sheets) in one place, instead of per screen.
3. **Breakpoint numbers:** recommend moving to 600 / 840 / 1200 / 1600 and keeping 720 and 1024 only where a table needs them, named as component widths, not page breakpoints. The 840 band matches iPad landscape and phone landscape better than 720/1024.
4. **Panes:** adopt list-detail for list → document screens (journals, invoices, bills) and supporting pane for side panels, with M3 widths (360 / 412, side sheet ≤ 400). Check that the JetBrains port has `ListDetailPaneScaffold` / `SupportingPaneScaffold` on all targets; if not, build our own on the size classes.
5. **Navigation:** keep the ERP sidebar, but map its states to the M3 bands (collapsed rail from 600 or 840, expanded from 1200); bottom navigation bar on compact only if the module list fits.
6. **Spike first** (one lane): library on iOS, desktop, Android, wasm; the shell plus one list-detail screen; count which of the ~306 checks it removes. Then ux-principles.md, screen-standard.md and the QA sizes are updated to the decided breakpoints.
