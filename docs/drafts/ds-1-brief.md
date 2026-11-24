# DS-1 brief: Material 3 layout mechanics, NeoERP look (DRAFT)

**Status: DRAFT, not approved. No lead starts this until Jabran says go.** When approved, it moves to
`NeoERP-App/docs/agents/ds-1/brief.md` and gets a line in `.review-channel/claims.md`.

Written 2026-11-24 from the Material 3 review. Code references are App `origin/phase/4` d1d7f9d1. Paths are relative to
`NeoERP-App/`; `…/app/` means `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`.

## Read first
- [docs/PRINCIPLES.md](../PRINCIPLES.md), then App `.claude/CLAUDE.md` and `ARCHITECTURE.md`.
- The synthesis: [docs/reviews/material-3/2026-11-23/synthesis.md](../reviews/material-3/2026-11-23/synthesis.md) (verified
  findings C1–C8, the sizes for all platforms, the plan). Background: the two Codex reviews in the same folder and
  [docs/drafts/m3-foundations-review.md](m3-foundations-review.md).
- Design docs: `docs/design/ux-principles.md` (§21, §25), `docs/design/screen-standard.md` (§1, §8, §9),
  `docs/design/specs/building-blocks.md`, `docs/design/design-system/neoerp-tokens.json` (authoritative for values).

## Fixed for the whole lane
- **Look stays ours.** Tokens, fonts, radii, shadows, motion and the ERP sidebar do not change, except where a step below says so.
  iOS keeps system defaults; desktop stays keyboard-first. No Material components are swapped in.
- **Components keep measuring their own space** (`BoxWithConstraints`, the `content*` thresholds). Reducing the number of
  width checks is not a goal.
- **App repo only.** No backend changes.
- **Rules.**
  - Never `--no-verify`, no force push.
  - No AI attribution in commits, PRs or comments.
  - Never open, print or grep `.env`, `.local-secrets`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`,
    `~/.aws` or keys.
  - No GitHub workflows.
  - Gradle only through `scripts/gradle-job.sh`.

## Lane setup
- **Base:** App `phase/4`, after `phase/4-ds1-stale-docs` (733082b3, docs only) has merged.
- **Lane branch:** `phase/4-ds1`, in its own worktree under `NeoERP-worktrees/`.
- **Builder:** Opus at default effort. Steps run in order: a → b → **stop** → c.
- **Tests:** the builder runs targeted tests per step. One full App gate at the end of the lane (≤3 related slices per merge
  batch).
- **Review:** tier 1, one fresh Opus reviewer after the whole lane. That reviewer is not the builder and not the lead who built it.
  No money or security code is touched. If a step does reach books, auth or isolation code, stop and ask, because it becomes
  tier 2.
- **Docs:** each step lists the docs it changes. `lane-ready` lists user-guide and developer pages changed, or "none: reason".

---

## Step a: code fixes for rules already approved

**Why:** the docs were fixed on `phase/4-ds1-stale-docs`; the code still differs on these three.

**a1. Section labels in sentence case** (C5; UX §21, settled by Jabran 2026-10-27..29; `docs/i18n/style-guide.md` §2)
- Remove the uppercasing:
  - `NeoText.kt`: `isUppercase` for `Overline` / `OverlineXs`;
  - `…/app/designsystem/tokens/NeoTypographyTokens.kt:197`: `String.asOverline()`. Delete it, or make it return the text
    unchanged and deprecate it.
  - Update the 15 call sites: sidebar, login, reason gate, Accounts labels.
- Tokens: drop `"textCase": "uppercase"` from `overline` and `overline-xs` in `neoerp-tokens.json:76–77`. Update the rig's
  `styles.css` overline classes and `docs/design/neoerp-design-system-architecture.md:97–98` to match.
- Check the strings themselves: each label source must already be in sentence case in en/nb/sv/da. Fix any that were written
  in capitals.
- **Tests:**
  - a check in `BuildingBlockChecksTest` (or next to it) that no text role uppercases;
  - the screenshot tests that show overlines are re-recorded, and the diff shows case changes only.

**a2. Remove the old KPI helper** (C4; screen-standard §1 "Stats never stack one per row")
- Delete `statColumns` in `…/app/designsystem/tokens/NeoBreakpointTokens.kt`; it has no callers.
- Keep `NeoStatRow` as the one shared stat row. Fix the KDoc in `NeoStatCard.kt` if it still mentions the helper.
- Leave the v1 Payroll/Reports screens alone; HR v2 replaces them.

**a3. Boundary tests at the menu switches** (C6/C7)
- The shell gives a drawer below 1024, the mini rail from 1024, and the full sidebar from 1280 when the content fits
  (`…/app/ui/shell/NeoEnterpriseShell.kt:316–319`).
- Add tests at 1023 / 1024 / 1025 and 1279 / 1280 / 1281, with the sidebar collapsed and expanded.
- Rename or document `isTabletOrBelow` (≤) where its users mean something else. Do not change its behaviour in this step.

**Done when:**
- labels read in sentence case on every screen;
- `statColumns` is gone;
- the boundary tests pass;
- the token JSON is valid.

---

## Step b: one shared description of the window

**Why:** today `NeoViewportProvider` (`…/app/designsystem/NeoViewport.kt:89–103`) gives width only, and short screens are
found only by UX §25's measured rule. One code base runs on iOS, Android and desktop, and every platform can give the app a
window of any size.

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
  `LocalNeoViewportWidth`.
- **Library check first:**
  - see whether `org.jetbrains.compose.material3.adaptive` works on Android, iOS and JVM at our Compose version (material3
    1.10.0-alpha05);
  - use it only if it does, and only for the measurement;
  - the class names and the numbers stay ours either way;
  - write down what you found in the hand-back.

**b2. Use it in the shell and page frame only**
- `NeoEnterpriseShell` menu mode and `neoPagePadding` read the class instead of raw breakpoint comparisons. Same behaviour,
  same boundaries: step a's tests must still pass unchanged.
- Height class compact adds to UX §25: it never switches the short-height rules off. A window under 480 tall counts as short
  even when the measurement has not run yet. Keep the keyboard separate from the window size.

**b3. Test sizes for every platform**
- Add these to `ScreenSizes.Device` / the test frames:

  | Platform | Sizes |
  |---|---|
  | Android | phone 360×800 and 800×360; foldable 840×700; tablet 1280×800 |
  | Desktop | half screen 683×768; 1280×720; 1920×1080 |
  | iPad 11" | 820, 834, 1180, 1194, 1210 wide |

- Add a height sweep at 1024 wide, 360 → 1000 in 40 dp steps.
- **Tests:**
  - every rig size (screen-standard §9) and every size above maps to the expected width and height class;
  - boundaries at 599/600, 1023/1024, 1279/1280, 479/480, 899/900;
  - resizing across a boundary keeps typed text, scroll position and an open editor or side panel.
- **Docs:** screen-standard §9 gets the new size rows. The tokens JSON gets the class table (descriptions only, same numbers).

**Done when:**
- the shell behaves exactly as before at every old size;
- the new class is available to pages;
- all size tests pass;
- 1920 shows the 1200 content cap working.

### STOP after step b
The builder hands back. The lead checks the step b screenshots, including 1920 and the short heights. Then the lead brings
Jabran the step c questions below, as one-line choices with a recommendation for each. Step c starts only after his answers.

---

## Step c: list-detail and side-panel layouts, with focus rules (pilot: Journals)

**Why:** M3's canonical layouts give names and rules for what NeoERP screens already do by hand. One pilot proves them before
any other screen changes.

**Questions for Jabran at the stop** (draft recommendations in brackets):
1. **Journals at medium and expanded width:**
   - list and detail side by side, or one at a time? [one at a time below 1280; side by side from 1280 when the list keeps
     its minimum width]
2. **Narrow window, detail open:**
   - Back returns to the list with the same row selected and the same scroll? [yes]
3. **The window grows while a detail is open:**
   - show both panes with that row selected, or stay on the detail? [both]
   - **And when it shrinks:** keep the detail? [keep the detail]
4. **Side panels (editors beside a page):**
   - fixed width, or resizable by the person, with the width remembered? [fixed token widths now; resizing later if asked]
5. **Modal focus:**
   - focus moves into the dialog or sheet, stays inside, Escape closes (unless there are unsaved changes, then confirm), and
     focus returns to the button that opened it? [yes, for every modal]

**c1. Contracts in the docs**
- building-blocks gets "List-detail" and "Supporting pane" sections with the answers above: which pane is primary, Back,
  selection, kept state, focus.
- Also add "Modal focus" covering focus in, focus trapped, Escape, and focus returned to the trigger. Include sheets that can
  be sized without dragging (buttons or keys).

**c2. Pilot on Journals**
- Files: `…/app/features/accounts/presentation/journals/list/JournalsListScreen.kt` and
  `…/journals/detail/JournalDetailScreen.kt`, with their state in `…/journals/state/`.
- Layout and navigation only. No change to journal data, posting, approval or amounts.

**c3. Modal focus in the shared components**
- Apply the focus contract to `NeoDialog` variants, `NeoReasonGate` and `NeoSidePanel` (modal use) where it is missing.

**Tests:**
- `JournalsListScreenTest` / `JournalDetailScreenTest`:
  - Back returns to the same row;
  - selection survives a resize both ways;
  - detail scroll is kept.
- Screenshot tests at the step b sizes.
- A focus test per shared modal: open, Tab stays inside, Escape, focus back on the trigger.

**Done when:**
- Journals follows the approved answers at every size;
- the modal focus tests pass;
- no other screen changes.

---

## Hand-back (each step and at the end)
- **Keep it short:** what changed (paths), tests run with commit, counts and "BUILD SUCCESSFUL", and open questions.
- End with one line: **"Brief: unclear or missing — …"** (or "none").
- At the end of the lane, write `lane-ready-ds1.md`. It lists:
  - the range;
  - the reviews;
  - the full gate;
  - the screenshots to look at (1920, short heights, Journals);
  - the docs pages changed.

## Not in DS-1 (later, DS-2)
- tabular figures for amounts;
- required-field marker and fix-it error text;
- dialog headlines that name the action;
- disabled menu items with a reason;
- one filled primary per area, enforced in `BuildingBlockChecksTest`.
