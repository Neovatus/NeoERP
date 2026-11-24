# Independent Material 3 review — 2026-11-23

Review only; no implementation or commits. Codex owns this report only. App baseline: `phase/4`, `430bc5ab6297039e1dbcd8c3adfe896580039dab`, clean at pickup. Recommendations are pending product approval. Shared checkpoint/index changes are left to the integration lead under the read-only scope. No credential/session files opened; the explicitly requested design-token JSON was inspected.

## Independent findings (written before opening the existing draft)

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

Google pages were checked on 2026-11-23. Many individual guideline URLs returned only a JavaScript shell; the recommendations below distinguish verified accessible guidance from proposed NeoERP contracts. This is not a claim of exhaustive clause-by-clause verification of inaccessible pages.

| Area | Comparison / recommendation |
|---|---|
| Scaffold, panes, canonical layouts | Define ownership of insets, navigation, content and overlays once. Existing single shell padding and stable page tree are sound. Add explicit pane/back/focus behavior, keeping local fit. |
| Grids and spacing | Retain Neo spacing and density scales; document margins, gutters and pane minima by role. Do not force ERP tables onto a decorative column grid or round every existing spacing token to a Material increment. Exact current M3 grid/spacing clauses could not be independently retrieved. |
| Typography | Keep semantic roles and fonts; resolve casing conflict. Verify large-text wrapping and numeric alignment. |
| Shape and elevation | Keep Neo radii and shadows. Use consistent semantic surface hierarchy. Google's [surface roles](https://m3.material.io/styles/color/the-color-system/key-colors-tones) support remapping; adopting its exact values is unnecessary. Shape specifications were not fully retrievable. |
| Motion | Preserve Neo timings and reduced-motion behavior. Current [M3 motion](https://m3.material.io/styles/motion) includes spatial/effects springs; that is not a mandate to replace ERP tweens with expressive bounce. Avoid motion that delays keyboard work. |
| Buttons | Preserve one clear primary action and compact desktop density. Don't stretch desktop controls across a whole pane ([desktop guidance](https://m3.material.io/foundations/desktop/components)). Verify focus and accessible hit areas separately from visual bounds. |
| Navigation rail/drawer/bar | Keep the destination tree stable. Rail/bar selection should reflect destination structure and usable space; a deep ERP hierarchy need not become bottom navigation. M3 desktop suggests rail from medium width, but NeoERP's content constraints justify retaining existing switching until measured. |
| Side and bottom sheets | Preserve record-editor side panels and phone choice sheets. Prefer desktop context menus, adjacent tool panes or dialogs according to task ([desktop guidance](https://m3.material.io/foundations/desktop/components)). |
| Dialogs | Keep NeoDialogSheet/Confirm/ReasonGate and proportional confirmation. Proposed contract checks: initial focus, trapped modal focus, Escape policy, dirty-form dismissal, focus return. Individual M3 guideline text unavailable. |
| Text fields | Keep persistent meaning, inline validation, company-format parsing and keyboard entry. Proposed checks: accessible labels, error association, focus visibility, next-field behavior; do not infer M3 requires Neo to use its filled/outlined appearance. |
| Toolbars and app bars | Distinguish current-page identity/navigation from frequent work actions; preserve company context and shorter-height scrolling. See [app bars](https://m3.material.io/components/app-bars/). |
| Menus | Keep growing entity selection searchable; menus serve actions or short choices. Proposed checks: arrow keys, keyboard opening, Escape and focus return. Individual guidelines unavailable. |
| Tabs | Keep related content switching distinct from global navigation and form choices; use NeoTabs semantics already referenced in building-blocks:443. Individual guidelines unavailable. |
| Search | Retain global Ctrl/⌘K and scoped table search as different functions (`building-blocks.md:356`). Proposed checks: clear scope, empty result, dismissal and focus restoration. Individual guidelines unavailable. |
| Snackbar | Existing Neo toast is intentionally richer. Google's [snackbar overview](https://m3.material.io/components/snackbar/overview) supports non-interrupting status with temporary or persistent duration. Keep inline form failures, focus-paused timing and alternate Undo access (UX:258–260); don't replace all feedback with snackbar. |
| Date pickers | Preserve typed dates and company format. Google distinguishes docked, modal and manual-input variants ([date pickers](https://m3.material.io/components/date-pickers/)); retain keyboard-first entry and adapt presentation rather than domain parsing. |
| Segmented buttons | Neo's 2–4 immediate view choices (`building-blocks.md:332`) is a useful narrow contract. Keep business changes requiring Save outside instant view switches. Current individual M3 guideline text unavailable; no numeric compliance claim. |

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

Compared with `docs/drafts/m3-foundations-review.md`. Its browser-based research has broader direct access to M3 than this review's text retrieval; its unverified numeric claims are not silently promoted to independently verified facts here.

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
7. **Keep the existing segmented contract of 2–4.** A claimed Material maximum of five does not justify broadening it. The draft also alternates between chips and dropdown as the overflow replacement; choose by selection semantics and fit.
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

Brief: unclear or missing — none; inaccessible M3 guideline text limits direct verification as disclosed above.
