# Material 3 review — browser-verified edition — 2026-11-23

New edition requested by Jabran; the original [independent-review.md](independent-review.md) is preserved unchanged. Browser verification uses rendered M3 pages, not search snippets. Local findings were originally written before the draft was opened; this follow-up is not a second blind review.

Review only; no implementation or commits. Codex owns this report only. App baseline: `phase/4`, `430bc5ab6297039e1dbcd8c3adfe896580039dab`, clean at pickup. Recommendations are pending product approval. Shared checkpoint/index changes are left to the integration lead under the read-only scope. No credential/session files opened; the explicitly requested design-token JSON was inspected.

## Local findings carried forward from the independent review

Keep NeoERP's appearance and tokens. Adopt a clearer adaptive layout vocabulary, not wholesale Material components. Preserve desktop keyboard entry and iOS system-owned defaults. Apple platform spec lines 3–9 already makes that decision; its historical glass proposals are not current requirements.

Paths below are relative to `NeoERP-App/`. Line references identify the inspected working snapshot, not a future revision.

### Verified internal contradictions and stale contracts

| Rank | Finding | First side | Conflicting side | Consequence / recommended disposition |
|---|---|---|---|---|
| 1 | Footer information has two algorithms | `docs/design/design-system/neoerp-tokens.json:201`: cap at 25% of window, excess scrolls inside footer | `docs/design/ux-principles.md:267–270`: measure all pinned content against one third of visible height, then move information into form | Different measurements AND different behavior. Reconcile metadata with newer UX rule; do not merely change .25 to .33. Runtime failure is not established here. |
| 2 | KPI layout conflicts | `docs/design/screen-standard.md:33–34`: never one per row; three remain together, four become 2×2 | `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/designsystem/tokens/NeoBreakpointTokens.kt:21–22,49–53`: one column at ≤720 | A caller of statColumns gets a forbidden layout. Audit callers before changing helper; don't infer every screen uses it. |
| 3 | Section casing conflicts | `docs/design/ux-principles.md:199`: sentence-case labels/overlines, no uppercase section overlines | `docs/design/design-system/neoerp-tokens.json:76–77`: uppercase overline and sidebar section label | Token consumers can recreate prohibited casing. Reconcile semantic role metadata. |
| 4 | Exact shell boundary conflicts | `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/designsystem/tokens/NeoBreakpointTokens.kt:19–20,43`: at or below 1024 | `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/ui/shell/NeoEnterpriseShell.kt:317`: below 1024 | At exactly 1024 shell selects rail, while token contract says drawer. Specify half-open ranges and test boundaries. |
| 5 | Desktop breakpoint falsely called unused | `docs/design/design-system/neoerp-tokens.json:207`: declared, not yet queried | `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/ui/shell/NeoEnterpriseShell.kt:318`: queries desktop; `docs/design/screen-standard.md:361` describes it | Stale metadata, not a runtime defect. |
| 6 | Apple summary retains superseded work | `docs/design/specs/apple-platform-look.md:3–9`: solid shared UI, no app slice | Same file `:12` says one app slice; `:21–26` describes glass navigation | Header wins. Clarify historical text; do not implement glass. |

Not contradictions: 600 for a choice sheet versus 480 for phone spacing; 44 touch targets versus dense pointer controls; custom glass in explicitly superseded sections; component-specific thresholds versus window thresholds. Different responsibilities legitimately need different numbers.

### Top five Material rules worth adopting

1. **Separate window classification from pane/content fit.** Use a shared window description for shell planning and retain component measurements for tables and forms. This avoids confusing an 840-wide window with an 840-wide content pane. Google's [window classes](https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes) are planning categories, not a replacement for measured fit.
2. **Name canonical layouts and preserve their state across adaptations.** Map record browsing to list-detail, editing with reference context to supporting-pane, and dashboards to feed. Specify which pane is primary and how Back restores the other. These are Google's [three canonical layouts](https://m3.material.io/foundations/layout/canonical-examples/overview). NeoERP already preserves the shell page's composition position; build on that.
3. **Choose transient surfaces for the input context.** Desktop secondary tools work alongside content; decisions belong near attention; contextual actions belong near their origin. Avoid forcing phone bottom sheets onto desktop. This follows [M3 desktop component guidance](https://m3.material.io/foundations/desktop/components). Keep keyboard invocation, Escape, focus containment for modals, and focus return explicit in Neo contracts.
4. **Separate navigation/context from frequent page actions.** Keep app bars focused and place work actions in a toolbar; reduce vertical chrome in short windows. [M3 app bars](https://m3.material.io/components/app-bars/) makes this distinction. NeoERP's context/company visibility and main-action access remain mandatory.
5. **Use readable semantic typography and tabular figures for changing amounts.** Preserve Inter Tight and existing roles, check line-height and scaling, and align numeric columns with tabular digits. [M3 typography](https://m3.material.io/styles/typography/applying-type) supports this without requiring Google's font sizes.

### Window size class decision

**Adopt the vocabulary and classification; do not replace all existing breakpoints.** Proposed window ranges: compact <600, medium 600–<840, expanded 840–<1200, large 1200–<1600, extra-large ≥1600 dp. Height: compact <480, medium 480–<900, expanded ≥900 dp. These are the current [Google window class bounds](https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes).

Use available application-window dimensions, not hardware device names. Implement shared KMP semantics only after checking library support on each target; this report does not prescribe an Android-only API for iOS/JVM.

Treat width classes as shell/pane candidates, subject to minimum usable content width, user menu preference and task. Keep existing 1024/1280 navigation behavior until a rig demonstrates the proposed replacement. Neither 1200 nor 1600 automatically justifies an additional pane. Never substitute global classes for local `maxWidth` checks.

Adopt compact height as a baseline signal **in addition to** UX §25's measured pinned-content/visible-height rule. A tall window with a keyboard or large text can still be constrained. Keep the raw dimensions and the effective visible region distinct; don't conflate keyboard occlusion with physical window resize.

Code evidence: `NeoViewport.kt:97–103` currently supplies width only. `NeoEnterpriseShell.kt:129,150–152,317–319` selects navigation using window width, collapsed preference and remaining content while preserving the page position. `NeoForm.kt:490–493` measures the room for two columns. `NeoDataTable.kt:161–167`, `NeoFiltersFold.kt:45–46`, and `NeoWizardStepper.kt:84–88` use local constraints. These checks are a strength, not bulk replacement targets. (All code paths under `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`; viewport under `designsystem`, shell under `ui/shell`, components under `designsystem/components`.)

### Foundations, styles and component disposition

Rendered guideline text was read in the browser on 2026-11-23. The table below replaces the original edition's inaccessible-page placeholders. “Keep” and “adopt” are NeoERP recommendations, not implementation approval. Sources are linked per row. This pass reads guidelines, not every component's separate specs/accessibility tab, and does not verify app behavior at runtime.

| Area and verified Google source | Verified guidance and NeoERP disposition |
|---|---|
| [Layout overview](https://m3.material.io/foundations/layout/layout-overview/overview), [parts of layout](https://m3.material.io/foundations/layout/layout-overview/parts-of-layout) | Current design terminology is **breakpoints**, renamed from window size classes in May 2026. The scaffold distinguishes bars, perimeter rails and content panes. Apply that ownership vocabulary to NeoEnterpriseShell; preserve one page inset and its stable composition tree. This does not establish that all local constraints should disappear. |
| [Panes](https://m3.material.io/foundations/layout/scaffold/panes) | One to three visible panes, at least one flexible. Single pane is allowed at any width. Recommended counts are 1 compact/medium and 2 expanded/large/extra-large, with alternatives based on task. 360/412 are recommended snap widths; 400 is a default side-sheet maximum, not a universal ERP form limit. Most resizable panes retain user width/collapse preferences across reopening and breakpoint changes; temporary supporting panes may reset. Modal focus enters the pane and returns to its trigger; nonmodal panes allow focus to cross. Adopt these explicit state/focus contracts. |
| [Canonical overview](https://m3.material.io/foundations/layout/canonical-examples/overview), [list-detail](https://m3.material.io/foundations/layout/canonical-examples/list-detail), [supporting pane](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane) | Medium list-detail can have two panes; dense work favors one. Back belongs in single-pane detail; selection marks the visible item in two-pane browsing. Preserve detail scroll/state; shrinking usually retains detail, with selection-workflow exceptions. Supporting content is meaningful only beside its primary task, unlike parent-child list-detail. Adopt per-flow mappings and return behavior, not one universal layout. |
| [Grids](https://m3.material.io/foundations/layout/grids-spacing/grids), [layout spacing](https://m3.material.io/foundations/layout/grids-spacing/spacing), [spacing system](https://m3.material.io/styles/spacing/overview) | Grids and alignment rulers organize scaffold regions; spacing groups content and establishes hierarchy. Spacing uses an extensible 8dp baseline. Prefer parent padding/gaps before child margins. **8dp padding/gaps and 24dp margins are illustrated for search, not prescribed universally.** Keep Neo's scale and density values. No fixed universal column count or forced token rounding follows from these pages. |
| [Density](https://m3.material.io/foundations/layout/grids-spacing/density) | Information density and shrinking components are distinct. M3 favors opt-in scaling, no automatic density changes at breakpoints/orientation, and default targets of at least 48×48. This differs from Neo compact-by-default and 44 touch floor; see the explicit deviation below. Keep current values in this review. |
| [Shape](https://m3.material.io/styles/shape/overview-principles) | Expressive adds abstract shapes, morphing, and 20/32/48 radius steps; abstract shapes should not undermine clarity. Keep Neo radii and solid content. These additions do not establish a usability defect in Neo's appearance. |
| [Typography](https://m3.material.io/styles/typography/applying-type), [surface roles](https://m3.material.io/styles/color/the-color-system/key-colors-tones), [motion](https://m3.material.io/styles/motion) | Retain original review's verified findings: semantic type and tabular figures help ERP work; surface mapping is customizable; current motion includes spatial/effects springs. These sources were retrieved in the first pass, not newly audited across every tab here. Keep Neo fonts, shadows, durations and reduced-motion support. |
| [Buttons](https://m3.material.io/components/buttons/guidelines) | Filled emphasis is ideally limited to one page action; labels are brief, sentence case, visible and unwrapped. Do not stretch controls excessively on desktop. Preserve element order across adaptation for keyboard/screen-reader continuity. Neo's large-text and footer-primary wrapping exceptions intentionally differ; retain them rather than clipping translated actions. |
| [Rail](https://m3.material.io/components/navigation-rail/guidelines), [drawer](https://m3.material.io/components/navigation-drawer/guidelines), [bar](https://m3.material.io/components/navigation-bar/guidelines) | Bars serve 3–5 top-level destinations on mobile/tablet; medium can use bar or rail depending on space. Rails support collapsed/expanded modes; expanded modal mode suits dense content/many destinations. Drawer guidance is now baseline: Expressive recommends expanded rail instead. The drawer page explicitly permits rail plus modal drawer in medium/expanded, qualifying its general single-primary-navigation recommendation. Keep Neo's ERP tree; do not require bottom navigation for every narrow desktop window. |
| [Side sheets](https://m3.material.io/components/side-sheets/guidelines) | Standard sheets coexist with main content; modal sheets block it. Resize to layout needs, allow independent vertical scrolling, provide close affordance and mirror position for RTL. A layout-resizable sheet does **not** by itself require a user-operated resize handle. Keep form panels; define their modality and focus behavior. |
| [Bottom sheets](https://m3.material.io/components/bottom-sheets/guidelines) | Modal bottom sheets target mobile; larger layouts can swap to side sheets. The page specifies initial modal exposure capped at half-height, then expansion; full-screen sheets need close affordance. Preset heights must be operable without dragging. Adopt a visible/keyboard-operable alternative to drag; treat half-height as a pattern to validate for choice lists, not a mandate for every record form. |
| [Dialogs](https://m3.material.io/components/dialogs/guidelines) | Use for consequential interruption; precise title, normally at most two actions, trailing confirmation. Stacked confirmation precedes dismissal. Full-screen guidance includes inline field errors, dirty-dismiss confirmation and a distinct recommendation not to disable its confirming action. Neo's disabled-primary/needed-line and inline-save-failure policies deliberately take precedence; do not import an inconsistent mixture of basic and full-screen rules. |
| [Text fields](https://m3.material.io/components/text-fields/guidelines) | Adjacent labels are explicitly supported—floating labels are not mandatory. Required fields use an explained asterisk; errors explain correction and replace helper text; long error text may wrap. Read-only fields retain normal styling and identify read-only status. Bound field width on large screens. Adopt marker/error/label contracts while preserving Neo geometry and company parsing. |
| [Toolbars](https://m3.material.io/components/toolbars/guidelines), [app bars](https://m3.material.io/components/app-bars/) | Toolbar guidance allows overflow menus and emphasizes one action. The no-toolbar-plus-navigation-bar rule concerns competing bottom surfaces, not every top table toolbar. Desktop/web guidance permits docked-toolbar adaptations. Keep Neo's top toolbar and footer distinctions; app-bar findings from the first pass stand. |
| [Menus](https://m3.material.io/components/menus/guidelines) | State-unavailable items remain disabled; reposition menus to avoid clipping; avoid nested independent controls that break keyboard/screen-reader interaction. Dense desktop menus may open instantly. Keep permission-denied visibility governed by Neo, show reasons for state unavailability, and preserve searchable growing lists. |
| [Tabs](https://m3.material.io/components/tabs/guidelines) | Related content, not sequential steps; consistent icon/text treatment. Fixed and scrollable variants have different sizing. Responsive fixed groups may be bounded and aligned within a body region; scrollable labels determine width. Do not turn the page's introductory equal-width description into a universal full-window rule. |
| [Search](https://m3.material.io/components/search/guidelines) | Search scope determines entry point; focused results are generally full-screen compact and docked at larger sizes. Keep search in its content pane. Back dismisses focused search; submitted query remains visible. Keep Ctrl/⌘K plus local table search and explicit focus return. |
| [Snackbar](https://m3.material.io/components/snackbar/guidelines) | One at a time, one process action, optional close; actionable snackbars persist until acted on/dismissed. Web auto-dismiss needs alternate accessible feedback. Never obscure focused controls. Neo's stacked richer toasts and timed actions are a deliberate divergence, not full compliance; alternate Undo and paused timers help but do not equal the M3 persistence rule. |
| [Date pickers](https://m3.material.io/components/date-pickers/guidelines) | Compact full-screen modal is recommended; docked input/calendar fits larger windows. Distant dates should use input or docked selection, not calendar paging. Plain hinted input is explicitly allowed. Keep typed-first dates and company parsing; no mandate to replace every Compose picker with native iOS UI. |
| [Segmented buttons](https://m3.material.io/components/segmented-buttons/guidelines) | Baseline allows 2–5, single or multiple selection, consistent label types and no wrapped segments; more options may use chips. Expressive now recommends connected button groups instead. Neo's 2–4 contract remains sensible; neither raising its limit nor adopting shape-morphing groups is required. |

### Newly verified deviations and implications

These are differences from Google, **not additional internal contradictions**:

- **Default density/targets:** `NeoERP-App/docs/design/screen-standard.md:117–121` specifies compact 36-high fields and compact default; `design-system/neoerp-tokens.json:110,141` specifies 44 touch targets. M3 density/text-field guidance recommends opt-in shrinking and 48 defaults. Keep Neo tokens as instructed, explicitly document the platform/input exception, and separately validate touch hit areas, spacing and keyboard usability. This is not proof of a WCAG failure, nor a reason to inflate desktop controls automatically.
- **Wrapping:** `ux-principles.md:269,275` permits footer-primary wrapping and accessible-size wrapping. M3 button guidance says single-line labels. Preserve Neo's accessibility/translation exceptions and test the resulting target/focus order.
- **Toast timing:** `ux-principles.md:258–260` allows action toasts to expire after at least eight seconds with pause and alternate Undo. M3 actionable snackbars persist. Recommend reviewing time-sensitive actions and alternate feedback, retaining Neo's toast system; do not claim all timed-action requirements are equivalent.
- **Primary availability:** Neo's needed-line and disabled-primary contract (`ux-principles.md:270`) differs from M3 full-screen dialog confirmation guidance. Preserve the ERP validation model and make its explanation reachable; do not change save eligibility based solely on component guidance.

### Ranked fixes (proposals, not approval)

1. Reconcile footer metadata with UX §25; acceptance: short landscape, keyboard and large-text cases retain usable form space and primary-action access.
2. Reconcile KPI helper contract and actual callers; acceptance: approved 3/4-tile behavior at narrow widths and enlarged labels.
3. Correct casing tokens and stale breakpoint/Apple summaries; acceptance: every conflicting reference above resolves to one explicit policy.
4. Add shared width/height classification without replacing local fit. Test immediately below/at/above 600, 840, 1200, 1600 and height 480/900; also existing 720/1024/1280 switches. Include resizing with typed fields, scroll and open editor state preserved.
5. Specify list-detail/supporting-pane contracts, focus and Back behavior, then pilot one ERP flow before generalizing.
6. Review shared dialog/sheet/menu/date/search keyboard contracts and tall/short-window behavior; test focus return and unavailable actions.
7. Verify typography, tabular figures, semantic surface mapping and reduced motion while preserving Neo tokens. No visual rebrand.

No build or simulator run was necessary for this static review; runtime accessibility, visual fit and actual behavior remain validation work for an approved fix lane.

## Comparison with the existing draft (read only after independent findings were saved)

Compared with `docs/drafts/m3-foundations-review.md`. The browser follow-up now independently verifies the component and foundation details listed above; this section preserves the original independent comparison and adds the corrections below.

### Agree

- Adopt mechanics selectively, keep NeoERP tokens, iOS system defaults and desktop keyboard priority.
- Shared pane contracts, a cross-platform spike and explicit height handling are useful.
- Keep ERP navigation hierarchy and typed-first dates; don't force Material snackbar restrictions onto Neo toasts.
- Dialog headlines naming the action, state-unavailable actions retaining explanations, clear required-field markers and one primary per area are useful contract improvements. Permission visibility remains governed by Neo's policy, not a menu guideline.
- The desktop breakpoint's “not queried” description is stale, independently confirmed above.

### Draft findings independently checked after comparison

**Additional verified contradiction — field focus (high priority for contract cleanup).** `NeoERP-App/docs/design/design-system/neoerp-tokens.json:225–226` specifies #737373/#8C8C8C and no halo. `NeoERP-App/docs/design/specs/building-blocks.md:142–143` specifies #525252/#A3A3A3 plus soft halo; `NeoERP-App/docs/design/screen-standard.md:37` also requires halo. This is a real conflict, not an M3 preference. Resolve with the design owner before implementation; add it to fix rank 3, ahead of cosmetic metadata. The building-blocks section is labelled Draft, but screen-standard independently adopts the halo, so the conflict is not confined to unadopted prose.

**Additional verified contradiction — footer scope/alignment.** `NeoERP-App/docs/design/design-system/neoerp-tokens.json:199` explicitly includes page and side-panel footers under one right-aligned rule; `NeoERP-App/docs/design/screen-standard.md:240–244` puts Cancel/Back left and primary right for forms/editors/wizards. `building-blocks.md:449–451` is scoped to dialogs, so that paragraph alone is not a contradiction. Narrow token metadata to its actual component scope; add this to fix rank 1.

### Disagree or qualify

1. **“Height: none” is too broad.** There is no height class in NeoViewport, but UX §25 already specifies shared measured height adaptation and names shared components. Compact height must supplement that algorithm, not replace it.
2. **One global class should not replace the reported ~306 width checks.** I did not reproduce that count. Local measurements serve legitimate content-fit decisions; a reduction in count is not a success criterion. Audit literal thresholds separately from constraints APIs.
3. **Do not adopt 360/412 pane widths or ≤400 side panels unconditionally.** ERP forms and line editors need measured usable space. These are candidate layouts requiring validation, not universal caps.
4. **Different breakpoint numbers are not themselves contradictions.** Window, sheet, local toolbar and content thresholds have different jobs. The exact 1024 boundary and stale 1280 metadata are concrete conflicts.
5. **Root regular heights versus compact heights are not inherently contradictory.** `screen-standard.md:117–118` explicitly identifies compact controls. Different named density sets can coexist; prove wrong selection at a consumer before reporting a runtime bug.
6. **Historical Apple glass sections are explicitly superseded.** Flag stale summaries, not the reference-only proposal as a live demand. System defaults does not require converting every Compose date picker to a native picker.
7. **Keep the existing segmented contract of 2–4.** The now-verified baseline Material maximum of five does not justify broadening it. The draft also alternates between chips and dropdown as the overflow replacement; choose by selection semantics and fit.
8. **Motion research needs a version distinction.** The current M3 page describes physics-based spatial/effects springs; the draft's fixed emphasized/standard duration summary is not the complete current guidance. Neither requires changing Neo's motion.
9. **Elevation mismatch needs a qualified label.** A portable single shadow and two-layer CSS shadow need not be numerically identical. The JSON's “web rendering of these” wording merits clarification, but visual inequivalence or a defect needs a rendered comparison; I did not perform one.
10. **Do not ship a documented toast “must change” list without checking current code.** The draft describes implementation debt; this review did not establish that every listed item is still missing.

### Findings the draft missed

- Uppercase overline tokens versus explicit sentence-case policy.
- KPI helper's single-column prescription versus the standing no-single-column exception.
- Exact 1024 inclusive/exclusive boundary mismatch.
- Footer information's old 25%-and-inner-scroll algorithm versus the newer pinned-content/visible-height-and-unpin algorithm.
- Why compact-height classification alone misses tall windows constrained by keyboard or enlarged text.

### Completion checkpoint

Independent findings were saved first; draft comparison and the two newly verified contradictions were appended afterwards. Static source verification completed; no product files, shared plans or project index changed, no commits, no runtime tests. Only this requested report was written. Next action belongs to the integration/design lead: decide the conflicting contracts and approve a scoped fix lane, preserving the existing tokens/look except explicitly approved reconciliation. This review does not authorize implementation.

Brief: unclear or missing — none. Browser follow-up limits and completion are recorded below.

## Browser follow-up: revised priorities and draft comparison

The original top five remain the recommended architecture direction. Browser evidence sharpens their acceptance criteria: preserve pane selection/scroll and user sizing preference; restore focus after modal dismissal; preserve action order across resizing; keep one emphasized toolbar action; keep typography readable without erasing Neo's wrapping exceptions.

**Revised fix order:** (1) reconcile footer sizing and alignment contracts; (2) reconcile field-focus rules; (3) reconcile KPI/casing/boundary metadata; (4) specify modal focus return, keyboard-operable sheet sizing and unobscured feedback; (5) document density, wrapping and toast deviations and validate them on touch/keyboard; (6) introduce shared window/height classification and pilot canonical panes; (7) refine required-field/error copy and semantic typography. All remain proposals; no app changes are authorized.

**Additional agreement with draft:** explained required-field markers, precise dialog titles, state-unavailable menu actions, baseline 2–5 segment bounds, parent-owned spacing and non-drag sheet operation are now verified directly.

**Additional corrections to draft:**

1. Current Expressive guidance de-emphasizes both navigation drawers and segmented buttons in favor of expanded rails and connected groups. The baseline pages still document them; label versions rather than treating every page as one uniform current component prescription.
2. The draft's fixed spacing summary overgeneralizes a search example; M3 explicitly permits extension and contextual values.
3. Its universal ban on two navigation components misses the documented modal-drawer-plus-rail exception. Its “rail from medium” shorthand misses the navigation-bar page's medium option.
4. Its “same” density assessment misses Neo's compact default/44 floor versus M3's opt-in/48 guidance. Preserving Neo is a deliberate exception, not numerical compliance.
5. “Resizable side sheet” does not prove a mandatory draggable user resize control. Distinguish layout sizing from pane-resize interaction.
6. “Equal sections across the width” omits bounded responsive fixed-tab groups and scrollable tabs.
7. Snackbar action persistence and web alternate-feedback requirements deserve attention even when Neo keeps its richer toast component.
8. M3 explicitly supports adjacent labels, plain date inputs, and instant-opening dense desktop menus. These reinforce Neo's existing approach rather than require visual replacement.

## Follow-up completion and evidence limits

This new file is the only write in the follow-up. The original report and application source remain unchanged; App HEAD remains `430bc5ab6297039e1dbcd8c3adfe896580039dab`. No commits, builds, simulator runs, credential/session reads, or external writes. The browser read the rendered guideline pages linked above, including layout overview/parts, grids/spacing/density, pane rules, canonical overview/list-detail/supporting-pane, shape overview, and all previously unavailable individual component guideline pages. Typography, motion, color/elevation interpretation and Android height-class bounds retain the first pass's evidence; this is not a new audit of every style/spec/accessibility tab or all five individual breakpoint detail pages. Runtime fit, accessibility behavior and KMP library compatibility remain untested.

Checkpoint: browser verification and report revision complete. Next action: integration/design lead decides the conflicting contracts and any intentional M3 deviations before approving implementation. Shared plans/index were not edited under the report-only authorization.
