# Material 3 review: synthesis and DS-1 plan (2026-11-24)

Inputs: the lead's draft `docs/drafts/m3-foundations-review.md`, and Codex's `independent-review.md` and `browser-verified-review.md` in this folder. App baseline: `phase/4` 430bc5ab. The lead re-checked every contradiction below against that commit. Paths are relative to `NeoERP-App/`.

## Verdict
Both reviews agree on the direction: **adopt the M3 mechanics, keep the NeoERP look.**
- Add one shared width and height window class.
- Name the canonical layouts (list-detail, supporting pane, feed).
- Write down focus and Back contracts.
- Keep our tokens, our ERP sidebar, typed-first dates and our toasts.
- Local `maxWidth` checks stay. They measure content fit, which a window class can't. A smaller count of those checks is not a goal.

Codex's corrections to the draft are accepted:
- Compact height adds to UX §25's one-third rule; it doesn't replace it.
- 360/412/400 pane widths are candidates, not caps.
- Segmented buttons stay 2–4.
- Our density (compact by default, 44 touch) and our wrap and toast rules differ from M3 on purpose. They are written down as deviations, not fixed.
- Motion: current M3 uses springs. Our durations stay.

## Verified contradictions (all re-checked by the lead)
| # | Conflict | Side A | Side B | Note |
|---|---|---|---|---|
| C1 | Footer information size | tokens.json:201 `footerInfo/maxShare` 0.25, overflow scrolls inside the footer (`NeoStickyFooter.kt:90,142,152`; G32, 2026-11-19) | ux-principles.md:267–270, one third of the visible height, then the info moves into the form (`NeoShortHeight.kt:107`, R03) | **Layers, not a code conflict.** Both came from the short/landscape QA findings. The one-third rule decides first. The 25 % cap is the fallback when the rule is not active, or the footer has no page frame or slot (dialogs, side panels). The docs describe each as "the rule": write both, in that order. |
| C2 | Footer button alignment | tokens.json:199, page and side-panel footers right-aligned | screen-standard.md:240–244, Cancel/Back left and the primary right | Narrow the token's scope. |
| C3 | Field focus | tokens.json:225–226, #737373/#8C8C8C, no halo | building-blocks.md:142–143 #525252/#A3A3A3 with a halo; screen-standard.md:37 also has a halo | **Already decided in code:** 706d1895 (2026-10-24) removed the halo; `NeoFieldBorder.kt:16` 1 px, colour only; `NeoColorTokens.kt:155,252` = token values. Only the docs and KDocs are stale: building-blocks.md:142–143, screen-standard.md:37, `NeoSearchInput.kt:38`, `NeoForm.kt:95`. |
| C4 | KPI columns | screen-standard.md:33–34, never one per row | `NeoBreakpointTokens.kt:49–53` `statColumns` gives 1 at ≤720 | The helper has no real callers (only a KDoc in NeoStatCard.kt:28). Fix or delete it. |
| C5 | Overline casing | ux-principles.md:199, sentence case | tokens.json:76–77 `textCase: uppercase` | Also check the consumers (table headers, sidebar). |
| C6 | Boundary at exactly 1024 | `NeoBreakpointTokens.kt:19,43`, at or below | `NeoEnterpriseShell.kt:317`, `<` | Matters on a real device: an older iPad Pro 12.9 in portrait is exactly 1024 wide. The code gives the rail (same as the iPad Pro 13 at 1032), so the token doc changes to "below 1024". Use half-open ranges, with boundary tests. |
| C7 | Desktop 1280 "not yet queried" | tokens.json:207 | `NeoEnterpriseShell.kt:318` queries it | Stale metadata. |
| C8 | Apple summary | apple-platform-look.md:3–9, solid UI | same file :12, :21–26, app slice and glass | The header wins. Mark the rest as history. |

Dropped from the draft: "control heights" (density sets can coexist). Not yet proven: the elevation level-1 mismatch, which needs a rendered comparison.

## Decisions (re-checked against origin/phase/4 d1d7f9d1, 2026-11-24)
Closed (the code or an approved doc already decides); the stale docs are fixed on App branch `phase/4-ds1-stale-docs`:
- **C3 field focus:** no halo (706d1895). Fixed: screen-standard, building-blocks (colours and contrast now 4.7/4.0 light, 5.9/4.5 dark), list-controls, notes/auth, rig `styles.css`, harness comment, three KDocs.
- **C1 footer:** two layers (one-third rule first, 25 % fallback). Written into UX §25 and the token description.
- **C2 footer alignment:** the token description is scoped to dialogs; form footers follow screen-standard §8.
- **C4 KPI:** never one per row (screen-standard §1); `NeoStatRow` already keeps one row and goes compact (Companies 2 tiles, Platform staff 3). `statColumns` has no callers; marked stale, **DS-1a deletes it**. The old Payroll/Reports screens stack one per row but are v1 modules that HR v2 replaces.
- **C6/C7 breakpoints:** descriptions now say "below 1024 the drawer, exactly 1024 the mini rail" and "full sidebar from 1280". **DS-1a adds the boundary tests.**
- **C8 Apple:** the build-order line is marked as history.

Closed by an approved rule, **code still differs (DS-1a, code change):**
- **C5 casing:** UX §21 (settled by Jabran 2026-10-27..29) and the i18n style guide §2 say sentence case everywhere, column headers included. The code still uppercases: `NeoText` Overline roles and `String.asOverline()` (15 uses: sidebar, login, reason gate, Accounts labels), and tokens.json:76–77 plus design-system-architecture.md:97–98. DS-1a removes the uppercasing and the `textCase` tokens together.

Still open for Jabran:
- **Window classes. Apple sizes change the answer.** M3's width numbers come from Android. Our checked sizes (screen-standard §9) fall on them like this:

| Device (rig size) | Width | M3 width class | M3 height class | Our switch today |
|---|---|---|---|---|
| iPhone SE / Pro portrait | 375–440 | compact | medium | phone ≤480 |
| iPhone SE landscape | 667×375 | medium | **compact** | "small tablet" by width (UX §25) |
| iPhone Pro landscape | 874×402 | expanded | **compact** | "tablet" by width |
| iPad mini portrait | 744 | medium | expanded | above 720: tables as tables |
| iPad Air / Pro 11 portrait | 820–834 | medium (**just under 840**) | expanded | drawer |
| iPad Pro 12.9 (older) portrait | 1024 | expanded | expanded | the C6 edge |
| iPad Pro 13 portrait | 1032 | expanded | expanded | mini rail |
| iPad Air / Pro 11 landscape | 1180–1210 | **either side of 1200** | medium | mini rail |
| iPad Pro 13 landscape | 1376 | large | expanded | full sidebar |
| Desktop | 1440 | large | — | full sidebar |

The M3 **height** class fits Apple well: every iPhone in landscape is under 480 tall, and no iPad is. That gives width-independent detection of the case UX §25 describes. The M3 **width** numbers fit badly: 840 and 1200 cut straight through the iPad 11" sizes, so the same model would change layout between generations or between portrait and landscape. iOS has only two width classes itself (compact/regular), and in Split View and Stage Manager the window has any width.

**All platforms (one code base).** Every target can give the app a window of any size, so a device name never decides a layout:
- **Desktop:** the window resizes down to 320×480 (`NeoDesktopHost.kt:58`); half-screen snaps give roughly 683–960 wide; monitors run 1280–2560+.
- **Android:** the manifest allows resizing, so split screen, freeform, foldables (inner screen about 700–880 wide) and Chromebooks all count; phones are 360–412 wide, tablets about 800 portrait and 1280 landscape.
- **iOS:** the sizes in the table above, plus iPad Split View and Stage Manager (any width).

Our switches already follow the content rather than the device: 720 is where a table stops fitting, and the full sidebar needs `sidebar` 260 + `shellMinContent` 900 (`NeoEnterpriseShell.kt:318` checks this as well as 1280). Page content stops at `maxContentWidth` 1200.

**Recommendation:**
1. **Width:** keep our numbers and give them M3-style names in one place (`NeoWindowClass`): compact <600, medium 600–<1024, expanded 1024–<1280, large ≥1280. All ranges are half-open. Don't adopt 840 / 1200 / 1600: they come from Android device groups and cut through iPads, foldables and half-screen desktop windows.
2. **Height:** adopt M3's height classes: compact <480, medium 480–<900, expanded ≥900. Below 480 catches every phone in landscape (iOS and Android), short desktop windows and split screens. It adds to UX §25's one-third rule; it doesn't replace it.
3. **Components keep measuring their own space** (`BoxWithConstraints`, the `content*` thresholds). The window class is for the shell and page layout only.
4. **Test sizes:** add one row per platform to screen-standard §9. Rig widths stay as they are; the screenshot sweep (320–1440) and boundary tests add:
   - Android 360×800 / 800×360, a foldable at 840×700, a tablet at 1280×800;
   - desktop 683×768 (half screen), 1280×720 and 1920×1080;
   - one height sweep at 1024 wide (360–1000).
5. **Wider than 1440** is untested today: check 1920 so the 1200 content cap and the table widths behave.

## DS-1 plan (App only; one repo per builder)
- **DS-1a: contract reconciliation** (Sonnet; mostly docs and tokens, plus small code changes):
  - code part only (the docs went in `phase/4-ds1-stale-docs`): delete `statColumns`; C5 casing in code and tokens; half-open breakpoint helpers with boundary tests;
  - a "Deviations from M3" section in screen-standard covering density/44, footer wrap, toast timing and the disabled primary.
  - **Acceptance:**
    - boundary tests at 1023/1024/1025 and 1279/1280/1281;
    - a test that `statColumns` never returns 1 (or the helper is deleted);
    - the token description and UX §25 name both footer layers;
    - the short-landscape footer check from UX §25.
- **DS-1b: window-class spike** (Opus):
  - Check `org.jetbrains.compose.material3.adaptive` on Android, iOS and JVM. If it isn't usable on all three, write our own `NeoWindowClass` (width and height) in `NeoViewport.kt`.
  - Use it only in the shell and in one pilot flow.
  - **Acceptance:**
    - tests just below, at and just above our switches (600 / 720 / 1024 / 1280) and the heights 480 / 900;
    - every size in point 4 above, plus the rig sizes and the iPad 11" widths (820, 834, 1180, 1194, 1210), maps to the expected class;
    - state is kept on resize (typed fields, scroll, open editor).
- **DS-1c: canonical layouts and focus contracts** (Opus, after DS-1b):
  - list-detail and supporting-pane contracts covering the primary pane, Back, selection and kept state;
  - for modals: focus in, focus trapped, Escape, focus returned to the trigger;
  - sheets can be sized without dragging;
  - pilot one ERP flow (suggestion: Journals list → detail).
- **Later (DS-2):**
  - tabular figures for amounts;
  - required-field marker and fix-it error text;
  - dialog headlines name the action;
  - disabled menu items show a reason;
  - one filled primary per area, enforced in BuildingBlockChecksTest.
