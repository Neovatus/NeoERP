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

## 4. Styles and components that matter for NeoERP (read 2026-11-23)

**Spacing:** 8 dp scale (space100 = 8 dp); layouts use 8 dp vertical padding, 8 dp gaps, 24 dp horizontal margins; padding and gaps before margins; no margins on child elements.
**Typography:** 30 styles (15 baseline + 15 emphasized), tokens for font, line height, size, tracking, weight; line height adapts to script height (relevant for Urdu later).
**Shape:** corner radius scale up to 20 / 32 / 48 dp ("increased" steps), full rounding as its own token; shapes used sparingly.
**Elevation:** levels as tokens, shadows only where needed; hover raises one level, consistently.
**Motion:** emphasized 500 ms (enter 400, exit 200); standard 300 ms (enter 250, exit 200); exits shorter than enters; standard easing is the fallback on iOS and web.
**Buttons:** one high-emphasis button per area; filled for the final or unblocking action; outlined for important secondary and "change your mind"; text for non-essential; icon buttons for optional actions; extended FAB best on large screens.
**Navigation:** compact uses a bottom navigation bar; medium and expanded a rail (3–7 items, collapsed rail never hidden; expanded rail standard or modal from a menu icon); **a navigation drawer for 5+ destinations or more than one level** (standard on expanded and larger, modal on compact and medium); never two navigation components at once.
**Side sheets:** supplementary, right edge (left in RTL), inset 16 dp at most; standard on medium/expanded, modal on compact; resizable.
**Bottom sheets:** mobile only for modal; full width on compact, max width on larger, swap to a side sheet on desktop; single-pointer alternative to drag.
**Dialogs:** sparingly, at most two actions, clear headline (no "Are you sure?"), single action only for acknowledgement; low priority → snackbar.
**Text fields:** label always visible; one variant per section; required = asterisk explained once; error text says how to fix.
**Toolbars:** page actions; not shown together with a bottom navigation bar; ≥16 dp end padding; 48×48 targets.
**App bars:** 1–2 actions, primary alters or exits the page (Save, Edit); many actions → toolbar, avoid overflow menus.
**Menus:** temporary actions; unavailable items disabled, not removed; groups by gap or divider.
**Tabs:** related, not sequential content; equal sections across the width; no mixing icon-only with text.
**Search:** search bar for one view, search app bar when search is global, icon button when secondary.
**Snackbar:** one at a time, ≤2 lines on compact, no icons or inline links, one text button.
**Date pickers:** full-screen modal on compact, field drop-down on medium/expanded; input mode for distant dates (birth dates).
**Segmented buttons:** ≤5 segments, single-select to switch views or sort; more choices → chips.


## 5. NeoERP design system vs Material 3 (styles and components)

Read 2026-11-23 (read-only comparison). Paths are relative to `NeoERP-App/docs/design/`: **T** = `design-system/neoerp-tokens.json`, **UX** = `ux-principles.md`, **SS** = `screen-standard.md`, **BB** = `specs/building-blocks.md`, **AP** = `specs/apple-platform-look.md`. Guardrails for every recommendation: our tokens and look stay authoritative (T wins); iOS keeps system defaults (AP); desktop is keyboard-first (UX §19); M3 is adopted only where it fixes a real gap or a QA finding. "Top 5" marks the five most valuable adoptions.

| Topic | Material 3 | NeoERP today (file:line) | Same / Different / Missing | Recommendation |
|---|---|---|---|---|
| Spacing | 8 dp scale; 8 dp gaps, 24 dp margins; padding and gaps before margins; no margins on children | 5-step scale 8/12/16/20/24 with compact (6..20) and cozy (10..28) sets: T:80-110. "One page inset, only the shell pads": SS:34. No negative margins under a title: SS:327 | Same (intent) | Keep T. Adopt only the written rule "padding and gaps before margins" as one line in SS §5 if not already implied. No token change. |
| Typography | 30 styles (15 baseline + 15 emphasized); line height adapts to script height | 14 named styles, Inter Tight / JetBrains Mono, sizes 10.5 to 28: T:64-78. Dense body 13.5/20 | Different | Keep T. Take only the Urdu idea: when Urdu or another tall script ships, add per-language line-height overrides (a language token), not a new scale. Defer until the Pakistan market group starts. |
| Shape | Radius scale up to 20/32/48 plus full; shapes used sparingly | sm 6, md 10, lg 14, xl 18, pill 999: T:112-117. Toast uses md, modal xl: BB:529 | Same | No change. Do not adopt M3's larger steps (wrong density for an ERP). |
| Elevation | Tonal levels as tokens; shadows only where needed; hover raises one level | 3 levels, resting / raised-hover / modal-toast-drawer: T:143-146, portable form T:228-232. Hover = `bgHover` fill, no ripple: BB:9-14 | Same | No change. Note the two shadow forms disagree slightly (see contradictions). |
| Motion | Emphasized 500 ms (enter 400, exit 200); standard 300 ms; exits shorter than enters; standard easing fallback on iOS/web | 80/120/150/180/220/400 ms plus one easeOut curve: T:210-218. Toast enters 180, leaves 120: BB:543-545. Reduced motion handled in toast, sticky bar, skeleton: UX:259, SS:229 | Same (shorter, ERP-appropriate) | Keep T. Adopt only the principle "exits shorter than enters" as a written rule (toast already follows it) and check dialog and drawer exits against it. |
| Buttons / actions | One high-emphasis button per area; filled / outlined / text / icon; extended FAB on large screens | Primary, Secondary, Ghost, Danger; sm 30 / md 40 / lg 48: T:120-122; one primary in the footer: SS:241-262; one home per action: SS:225; no FAB | Same (no FAB) | Top 5: write "one primary per area" as an explicit rule and add it to `BuildingBlockChecksTest` (today it only limits side-panel footers to 3 buttons: BB:479). No FAB. |
| Navigation | Bottom bar (compact), rail (medium+), drawer for 5+ destinations or more than one level; never two navigation parts at once | Drawer below 1024, rail 1024-1279, sidebar from 1280: AP:30; rail tokens T:128-134; expandable module entry with Up/Down/Left/Right/Home/End: SS:306-311; phone bottom bar for self-service only (below 600): AP:36 | Same | No change. Our keyboard model on the module tree is stronger than M3's. Keep "never two nav parts at once" as a check in the shell tests. |
| Side sheets | Supplementary, right edge, resizable; standard on medium+, modal on compact | `NeoSidePanel` on the right, full screen below 600, footer with form buttons only, record actions in a head menu: SS:283, BB:455-461 | Same (not resizable) | Optional: allow resizing the panel width on desktop only if QA shows long forms cramped. Otherwise no change. |
| Bottom sheets | Mobile modal only; swap to side sheet on desktop; single-pointer alternative to drag | `NeoPhoneSheet`, `NeoSelectSheet`: phone sheet below 600 for pickers: BB:345; becomes popover or dialog at 600+: AP:38 | Same | No change. Check that every phone sheet has a close button and not only drag (a11y item for the QA list). |
| Dialogs | Sparingly; at most two actions; clear headline, no "Are you sure?"; acknowledgement has one action; low priority goes to snackbar | One row, end-aligned, Cancel first, stacks at large text: BB:447-450; caution in proportion to risk, no confirmation for undoable changes, Undo instead: UX:159-164; reason gate for changes: UX:63 | Same (stricter on risk) | Top 5: adopt the headline rule for confirmations ("Reverse journal", never "Are you sure?"); UX:164 only names the button. Add it to the dialog copy checks. |
| Text fields | Label always visible; one variant per section; required = asterisk explained once; error text says how to fix | Label above (13/500), one 1 px border, hint below, error replaces hint, never the floating label: SS:160-163; errors only when useful: SS:181-183; focus rule BB:140-145, T:225-226 | Same | No change to look. Adopt "error says how to fix" as a copy check, and decide the required-marker rule (today unspecified; see Missing below). |
| Toolbars / footer | Toolbar for page actions; end padding at least 16 dp; 48 dp targets; not with a bottom nav bar | Sticky footer: Cancel/Back left, primary right, one row at every width, fold order into ⋯: SS:241-262, UX:269; list toolbar at field height: SS:116-118; touch floor 44: T:110 | Same | No change. 44 (iOS) is the floor, not 48: keep. |
| App bar / page head | 1-2 actions; primary alters or exits the page (Save, Edit); many actions go to a toolbar, avoid overflow menus | `NeoPageHeader` title, crumbs, actions; sticky page bar by page type with main action and ⋯: SS:200-224; page head context line: SS:323-338 | Same | No change. Our ⋯ overflow is deliberate (phone width); keep. |
| Menus | Temporary actions; unavailable items disabled, not removed; groups by gap or divider | `NeoOptionMenu`: control width, 1 px border, check on chosen: SS:171-174; disabled entry keeps its reason as its words: BB:459; items you may not see are hidden, not disabled: UX:73 | Different (permissions) | Top 5: adopt M3's "disabled, not removed" for actions that are unavailable because of state (not permission), always with the reason as tooltip. Permission-denied stays hidden (UX §6). Write the split as one rule. |
| Tabs | Related, not sequential content; equal sections across the width; no mixing icon-only with text | Tabs use `neoInteractive`: BB:11; zero-count tabs hidden unless selected: UX:185; tab track `bg/soft`: T:6 | Same | No change. Add the "no icon-only mixed with text" rule only if a mixed set appears in QA. |
| Search | Search bar for one view; search app bar when global; icon button when secondary | Table toolbar search filters rows: BB:355; global search in the top bar, phone icon opens field across the bar, Esc or back closes and returns focus: BB:127-129; find anything two ways: UX:126 | Same | No change. |
| Snackbar / toasts | One at a time; two lines on compact; no icons or inline links; one text button | Up to 3 stacked, kind badges, up to two text actions, 5/8 s timing, errors persist, pause on hover or focus: BB:509-568, UX:249-261, T:177-197 | Different | Keep ours (errors and Undo need more than a snackbar). Top 5 (implementation): the toast gap list in BB:550-566 (11 items, e.g. error never auto-dismisses, Esc closes, liveRegion Assertive) is still "must change"; ship it. M3 itself adds nothing here. |
| Date pickers | Full-screen modal on compact; field drop-down on medium/expanded; input mode for distant dates | `NeoDateField`: typed first (company format, ISO, digits), calendar button opens picker: SS:171-176; touch gets number keyboard with Done: UX:284; iOS system date UI is not used | Same (typing first suits keyboard-first) | Check the picker on a phone against the M3 compact pattern (full screen) in QA; on iOS prefer the system pickers per AP. No change to the typed-first rule. |
| Segmented buttons | At most 5 segments; single-select to switch views or sort; more choices go to chips | Segmented control for 2-4 options, one row on a phone: BB:333-335; module On/Off and mode switches: UX:57 | Same | Top 5: add the hard cap of 5 and "more than 5 becomes a dropdown" (BB:333 says 2-4 but no check enforces it). Cheap, testable rule. |

### Where M3 has something we lack (Missing)

- Required-field marker: no rule in SS §8 or UX; M3 says asterisk, explained once. Needed for long forms (agreements, enrollment).
- Written exit-shorter-than-enter motion rule (only implicit in toast values).
- Resizable side panel (low priority).
- Language-aware line height for Urdu (defer to Pakistan market start).

### Top 5 adoptions (ranked)

1. **Disabled, not removed, for state-unavailable actions** (menus) with the reason shown; permission-denied stays hidden (UX §6).
2. **One primary action per area, enforced by a check** (buttons), not only documented.
3. **Dialog headline rule, no "Are you sure?"** (dialogs), in the copy checks.
4. **Segmented cap of 5, then dropdown** (segmented buttons), with a test.
5. **Required-field marker, explained once, plus "error says how to fix"** (text fields); closes a Missing rule and serves QA copy findings.

(The toast "must change" list in BB:550-566 is already decided work, not an M3 adoption, so it is not ranked.)

### Places where our own docs contradict each other

1. **Field focus.** T:225-226 says focus colour `#737373` / dark `#8C8C8C` and "no halo or outline". BB:140-145 says `#525252` / dark `#A3A3A3` with a 3 px soft halo (`focus/ringSoft`, not in T). SS:37 also says "with the soft halo". BB:12 says a "1px accent focus ring", T:223 says 2 px.
2. **Control heights and density default.** T root `button/md` 40 and `field` 44 (T:121,123, "regular"); SS:116-118 says field 36, header actions 32, "density defaults to compact" (compact is T:94, 32/36).
3. **Breakpoints.** T:203-208 declares phone 480, mobile 720, tablet 1024, desktop 1280 ("declared, not yet queried"), but the docs use 600 (SS:236,283; BB:345; AP:36), 440 (SS:221,293), 380 (SS:72-75), 480 `contentSm` (BB:498), and 1280 is actually queried for the sidebar (AP:30).
4. **Elevation.** T:144 level 1 is two layers at 0.04 + 0.02 opacity, blur 2; T:230 portable form is blur 3, opacity 0.06. T says the latter is the "portable form", but they do not render the same.
5. **Footer alignment.** T:199 and BB:447 say dialog, sheet and panel footers are right-aligned with Cancel first; SS:241 (sticky footer) says Cancel/Back on the left, primary on the right.
6. **Apple look.** AP:3 says DECIDED: system defaults only, "we do not build our own glass anywhere"; AP sections 2, 5, 9 and 12 still specify Compose-drawn glass surfaces, tokens and a build slice.
