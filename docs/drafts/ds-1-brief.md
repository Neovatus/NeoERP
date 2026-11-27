# DS-1 brief: Material 3 layout mechanics, NeoERP look (DRAFT)

**Status: DRAFT, not approved to start.** Refreshed 2026-11-27 against b81a6183 (App `core/design-system/feature`). When
approved, it moves to `NeoERP-App/docs/agents/ds-1/brief.md` (split per flow) and gets a line in `.review-channel/claims.md`.

**The App module split may land first.** ADR-028 M0–M2 is planned for a quiet window before these flows. If it lands, the
design-system paths below move into the `:designsystem` module (same package names); re-check every path before starting.

Original written 2026-11-24 from the Material 3 review; code references are now App `core/design-system/feature` b81a6183.
Paths are relative to `NeoERP-App/`; `…/app/` means `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`.

## Read first
- [docs/PRINCIPLES.md](../PRINCIPLES.md), then App `.claude/CLAUDE.md` and `ARCHITECTURE.md`.
- The synthesis: [docs/reviews/material-3/2026-11-23/synthesis.md](../reviews/material-3/2026-11-23/synthesis.md) (verified
  findings C1–C8, the sizes for all platforms, the plan). Background: the two Codex reviews in the same folder and
  [docs/drafts/m3-foundations-review.md](m3-foundations-review.md).
- Design docs: `docs/design/ux-principles.md` (§21, §25), `docs/design/screen-standard.md` (§1, §8, §9),
  `docs/design/specs/building-blocks.md`, `docs/design/design-system/neoerp-tokens.json` (authoritative for values).

## Fixed for both flows
- **Look stays ours.** Tokens, fonts, radii, shadows, motion and the ERP sidebar do not change. iOS keeps system defaults;
  desktop stays keyboard-first. No Material components are swapped in.
- **Components keep measuring their own space** (`BoxWithConstraints`, the `content*` thresholds). Reducing the number of
  width checks is not a goal. A new window-width read in `features/` fails `WidthReadRuleTest`
  (`composeApp/src/jvmTest/.../buildrules/WidthReadRuleTest.kt`, `width-read-baseline.tsv`); the class belongs to the shell and
  the design system.
- **App repo only.** No backend changes.
- **Rules.**
  - Never `--no-verify`, no force push.
  - No AI attribution in commits, PRs or comments.
  - Never open, print or grep `.env`, `.local-secrets`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`,
    `~/.aws` or keys.
  - No GitHub workflows.
  - Gradle only through `scripts/gradle-job.sh`.

## Flow setup (current model: D-93, D-95, D-97, D-100)
- **Two flows, in order:** `core/design-system/window-class` (step b), then `core/design-system/layouts-focus` (step c).
  Step a has nothing left to do (see below), so there is no separate step-a flow.
- **Base:** each flow is cut from `core/design-system/feature` if that has not reached `main` when the flow starts, else from
  `main` (D-95; the same rule the spreading flow 2 used). Each gets a **draft PR** into its base (D-93) and its own worktree under
  `NeoERP-worktrees/`.
- **Stages per flow (D-97, D-100):** builder (Opus, default effort) → one fresh reviewer (not the builder; Opus, high for
  anything touching security) → fix by the builder that knows the code → simulator/emulator check. App only, so no backend
  stage. A **done list** per flow (D-87) with fresh evidence for every row, including rows inherited from earlier flows.
- **Tests:** the builder runs targeted tests per stage. The whole suite and gate files are Jabran's yes, asked once at the end
  of each flow.
- **Between the flows:** the lead decides the step c questions by the D-102 order of sources and records each decision with its
  sources in the flow's `decisions.md` (see step c). A Fable check only if the sources disagree or do not settle it.
- **Merge:** the integration lead merges after Jabran's gate answer. No money or security code is touched; if a stage does reach
  books, auth or isolation code, stop and ask.
- **Docs:** each stage lists the docs it changes. `lane-ready` lists user-guide and developer pages changed, or "none: reason".

---

## Step a: code fixes for rules already approved: ALREADY DONE (checked at b81a6183)

All three items landed in App commit **998b8e69** ("design system: sentence case everywhere, half-open breakpoint ranges,
unused helpers removed", lane `core/design-system/contracts`; review `docs/agents/core-design-system/contracts-review.md`, R3).
Checked in the code:

- **a1 sentence case: already done (998b8e69).** `NeoText.kt` has no `isUppercase`; `asOverline()` has no reference in any
  source set; `neoerp-tokens.json:76–77` has no `textCase` (the descriptions now say sentence case); the
  `SentenceCaseRuleTest` build rule (`…/jvmTest/…/buildrules/SentenceCaseRuleTest.kt`, ec5faee1) fails any new uppercasing.
  **Keep (small, optional):** the rig page `docs/design/design-system/styles.css:521,523` (`.ent-sub-hd`, `.ent-tag`) still has
  `text-transform:uppercase`. Fix when a flow next touches the rig CSS; it is not a code gap.
- **a2 `statColumns`: already done (998b8e69).** No reference remains in `composeApp/src` (only historic review and brief
  files name it). `isTabletOrBelow`, `isPhone` and `isMobileOrBelow` were deleted with it.
- **a3 boundary tests: already done (998b8e69).** `MenuModeBoundaryTest` (`composeApp/src/jvmTest/…/ui/shell/`) covers
  1023/1024/1025 and 1279/1280/1281; `NeoBreakpointBoundaryTest` (`…/jvmTest/…/designsystem/tokens/`) covers 480, 600, 720.
  `NeoBreakpointTokens.kt` now says every range is half-open (`isBelowMobile`, `isBelowPhone`). The menu mode is
  `menuMode(...)` at `…/app/ui/shell/NeoEnterpriseShell.kt:311–320`.

Nothing from step a stays open except the optional rig CSS line above.

---

## Step b (flow `core/design-system/window-class`): one shared description of the window

**Why:** today `NeoViewportProvider` (`…/app/designsystem/NeoViewport.kt:90–109`) gives width only
(`LocalNeoViewportWidth`, line 29), and short screens are found only by UX §25's measured rule. One code base runs on iOS,
Android and desktop, and every platform can give the app a window of any size.

**Overlap with small-phone (already on `core/design-system/feature`): reuse, do not duplicate.**
- The short-height rules already exist: `NeoShortHeightState` in `…/app/designsystem/components/NeoShortHeight.kt:84–111`
  (`active`, `keyboardUp`, the one-third test in `evaluate()` at line 105), published as `LocalNeoShortHeight` (line 116) by
  `NeoPageFrame` (line 125). They are measured on pinned parts versus visible height, not on window height.
- Step b adds the **window** height class beside that. It must not replace or re-derive `NeoShortHeightState`. Rule from the
  review: height class compact only makes the short-height rules start from "on" before the first measurement has run; it never
  switches them off, and the keyboard stays a separate input.
- `neoPagePadding()` (`NeoViewport.kt:121`) follows the continuous window width, not classes (KDoc at lines 111–119,
  `screen-standard.md:50`). Leave that behaviour alone; step b only needs the shell to read the class.

**b1. `NeoWindowClass`** in `…/app/designsystem/`
- **Width,** our numbers with names, half-open ranges:

  | Name | Width |
  |---|---|
  | compact | < 600 |
  | medium | 600 – < 1024 |
  | expanded | 1024 – < 1280 |
  | large | ≥ 1280 |

- **Height,** M3's numbers:

  | Name | Height |
  |---|---|
  | compact | < 480 |
  | medium | 480 – < 900 |
  | expanded | ≥ 900 |

- Both are measured from the app window in dp, never from a device name, and given through a composition local next to
  `LocalNeoViewportWidth` (provided by `NeoViewportProvider`). The numbers come from the existing breakpoint tokens where one
  exists (`tablet` 1024, `desktop` 1280, `phone` 480); 600 is new as a name (`NeoBreakpointBoundaryTest` already tests 600).
- **Library check first:**
  - see whether `org.jetbrains.compose.material3.adaptive` works on Android, iOS and JVM at our Compose version (material3
    1.10.0-alpha05);
  - use it only if it does, and only for the measurement;
  - the class names and the numbers stay ours either way;
  - write down what you found in the hand-back.

**b2. Use it in the shell only**
- `NeoEnterpriseShell`'s `menuMode(...)` (`…/app/ui/shell/NeoEnterpriseShell.kt:311`, called at line 129) reads the class
  instead of raw `breakpoints.tablet` / `desktop` comparisons. Same behaviour, same boundaries: `MenuModeBoundaryTest` must pass
  unchanged. Keep the extra "fewer than `shellMinContent` (900) left beside the full menu" and "collapsed" conditions.
- `neoPagePadding` stays as it is (continuous). It is listed in the old brief only to confirm it is not touched.
- Compact height adds to UX §25 as above.

**b3. Test sizes for every platform**
- `ScreenSizes.Device` (`…/jvmTest/…/testing/screens/ScreenSizes.kt:106–118`) already has 1920×1080 (`DesktopWide`), 1280×800,
  1024×700 and the phone and tablet sizes; `QaSize` (line 277) has the rig sizes. Add only what is missing:

  | Platform | Sizes | Already there |
  |---|---|---|
  | Android | phone 360×800 and 800×360; foldable 840×700; tablet 1280×800 | 1280×800 (`Laptop`); 360×640 (`PhoneCompact`) |
  | Desktop | half screen 683×768; 1280×720; 1920×1080 | 1920×1080 (`DesktopWide`) |
  | iPad 11" | 820, 834, 1180, 1194, 1210 wide | 820 (`Tablet`), 1180 (`TabletLandscape`) |

- Add a height sweep at 1024 wide, 360 → 1000 in 40 dp steps.
- **Tests:**
  - every rig size (screen-standard §9) and every size above maps to the expected width and height class;
  - boundaries at 599/600, 1023/1024, 1279/1280, 479/480, 899/900;
  - resizing across a boundary keeps typed text, scroll position and an open editor or side panel (android-state's
    "keep an open picker across a width-class change", 0cae7459, is the existing pattern to follow).
- **Docs:** screen-standard §9 (`docs/design/screen-standard.md:373`) gets the new size rows. The tokens JSON gets the class
  table (descriptions only, same numbers).

**Done when:**
- the shell behaves exactly as before at every old size;
- the new class is available to pages;
- all size tests pass;
- 1920 shows the 1200 content cap working.

### Between the flows
The window-class flow ends with its review, fixes and simulator/emulator check. The lead then decides the step c questions
below by the D-102 order and starts `layouts-focus`. Jabran is asked only if the decision touches product scope or something he
approved.

---

## Step c (flow `core/design-system/layouts-focus`): list-detail and side-panel layouts, with focus rules (pilot: Journals)

**Why:** M3's canonical layouts give names and rules for what NeoERP screens already do by hand. One pilot proves them before
any other screen changes.

**Questions for the lead** (D-102 order: industry standard → rules and regulation (WCAG 2.2, EN 301 549, the EU Accessibility
Act) → our principles and approved designs; each decision recorded with its sources in the flow's `decisions.md`). Draft
recommendations in brackets, each with the standard that supports it:
1. **Journals at medium and expanded width:**
   - list and detail side by side, or one at a time? [one at a time below 1280; side by side from 1280 when the list keeps
     its minimum width]
   - *Supports:* M3 canonical list-detail layout (two panes only from the expanded window class, one pane below); our own
     width numbers stay (synthesis: M3's 840 cuts through iPad 11" sizes).
2. **Narrow window, detail open:**
   - Back returns to the list with the same row selected and the same scroll? [yes]
   - *Supports:* M3 list-detail (single-pane navigation keeps the list state); Apple HIG navigation (Back returns to where the
     person was); WCAG 3.2.3 consistent navigation.
3. **The window grows while a detail is open:**
   - show both panes with that row selected, or stay on the detail? [both]
   - **And when it shrinks:** keep the detail? [keep the detail]
   - *Supports:* M3 adaptive guidance (state survives a window-class change; the pane in use stays primary); Apple HIG
     (Split View / Stage Manager resizing must not lose the person's place).
4. **Side panels (editors beside a page):**
   - fixed width, or resizable by the person, with the width remembered? [fixed token widths now; resizing later if asked]
   - *Supports:* M3 supporting pane (fixed pane widths, 360/412 as candidates only); WCAG 2.5.7 (any drag-to-resize needs a
     non-drag alternative, so resizing waits until that is built).
5. **Modal focus:**
   - focus moves into the dialog or sheet, stays inside, Escape closes (unless there are unsaved changes, then confirm), and
     focus returns to the button that opened it? [yes, for every modal]
   - *Supports:* WCAG 2.4.3 focus order and 2.1.2 no keyboard trap (Escape always leaves); WCAG 2.4.11 focus not obscured;
     WAI-ARIA dialog (modal) practice; M3 dialogs and Apple HIG sheets; EN 301 549 clause 9 (web) and 11 (software) inherit these.

Where the sources disagree or do not settle a question, one Fable check decides (D-102).

**c1. Contracts in the docs**
- `docs/design/specs/building-blocks.md` has no "List-detail", "Supporting pane" or "Modal focus" section yet (checked at
  b81a6183). Add them with the decided answers: which pane is primary, Back, selection, kept state, focus.
- "Modal focus" covers focus in, focus trapped, Escape, and focus returned to the trigger. Include sheets that can be sized
  without dragging (buttons or keys).
- `docs/design/screen-standard.md` already has "Deviations from Material 3" (line 358); add the choices that differ from M3 there.

**c2. Pilot on Journals**
- Files: `…/app/features/accounts/presentation/journals/list/JournalsListScreen.kt` and
  `…/journals/detail/JournalDetailScreen.kt`, with their state in `…/journals/state/`.
- Layout and navigation only. No change to journal data, posting, approval or amounts.

**c3. Modal focus in the shared components**
- Apply the focus contract to `NeoDialog` variants (`…/app/designsystem/components/NeoDialog.kt`), `NeoReasonGate.kt` and
  `NeoSidePanel.kt` (modal use) where it is missing. At b81a6183 `NeoDialog.kt` has no focus handling beyond the keyboard note at
  line 132, and `NeoSidePanel.kt` only clears focus on a tap (line 119, 163), so expect work in all three.

**Tests:**
- `JournalsListScreenTest` / `JournalDetailScreenTest`:
  - Back returns to the same row;
  - selection survives a resize both ways;
  - detail scroll is kept.
- Screenshot tests at the step b sizes.
- A focus test per shared modal: open, Tab stays inside, Escape, focus back on the trigger.

**Done when:**
- Journals follows the decided answers at every size;
- the modal focus tests pass;
- no other screen changes.

---

## Footer (decided, no work left in this brief)
Jabran 2026-11-24 (backlog "DS-1-DOCS follow-ups", `docs/backlog.md:449`): the industry standard. **One end-aligned group,
Cancel then the primary, totals left.** `screen-standard.md` §8 (line 257) and the tokens already say so, and the code
already does it (`NeoStickyFooter.kt:128–148`, `Alignment.End`). Any new footer or dialog action row in these flows follows it;
the old "Cancel left, primary right" wording is gone.

## Hand-back (each stage and at the end)
- **Keep it short:** what changed (paths), tests run with commit, counts and "BUILD SUCCESSFUL", and open questions.
- End with one line: **"Brief: unclear or missing — …"** (or "none").
- At the end of each flow, write `lane-ready-<flow>.md`. It lists:
  - the range;
  - the review;
  - the full gate (once Jabran says yes);
  - the screenshots to look at (1920, short heights, Journals for the second flow);
  - the docs pages changed.

## Not in DS-1 (later, DS-2)
- tabular figures for amounts;
- required-field marker and fix-it error text;
- dialog headlines that name the action;
- disabled menu items with a reason;
- one filled primary per area, enforced in `BuildingBlockChecksTest`.
