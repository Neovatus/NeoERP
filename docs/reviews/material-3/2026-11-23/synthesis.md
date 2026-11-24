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
| C1 | Footer information size | tokens.json:201 `footerInfo/maxShare` 0.25, overflow scrolls inside the footer; used in `NeoStickyFooter.kt:90` | ux-principles.md:267–270, one third of the visible height, then the info moves into the form; `NeoShortHeight.kt:107` | **Both algorithms are live in code**, so this is more than stale metadata. |
| C2 | Footer button alignment | tokens.json:199, page and side-panel footers right-aligned | screen-standard.md:240–244, Cancel/Back left and the primary right | Narrow the token's scope. |
| C3 | Field focus | tokens.json:225–226, #737373/#8C8C8C, no halo | building-blocks.md:142–143 #525252/#A3A3A3 with a halo; screen-standard.md:37 also has a halo | **Already decided in code:** 706d1895 (2026-10-24) removed the halo; `NeoFieldBorder.kt:16` 1 px, colour only; `NeoColorTokens.kt:155,252` = token values. Only the docs and KDocs are stale: building-blocks.md:142–143, screen-standard.md:37, `NeoSearchInput.kt:38`, `NeoForm.kt:95`. |
| C4 | KPI columns | screen-standard.md:33–34, never one per row | `NeoBreakpointTokens.kt:49–53` `statColumns` gives 1 at ≤720 | The helper has no real callers (only a KDoc in NeoStatCard.kt:28). Fix or delete it. |
| C5 | Overline casing | ux-principles.md:199, sentence case | tokens.json:76–77 `textCase: uppercase` | Also check the consumers (table headers, sidebar). |
| C6 | Boundary at exactly 1024 | `NeoBreakpointTokens.kt:19,43`, at or below | `NeoEnterpriseShell.kt:317`, `<` | Matters on a real device: an older iPad Pro 12.9 in portrait is exactly 1024 wide. The code gives the rail (same as the iPad Pro 13 at 1032), so the token doc changes to "below 1024". Use half-open ranges, with boundary tests. |
| C7 | Desktop 1280 "not yet queried" | tokens.json:207 | `NeoEnterpriseShell.kt:318` queries it | Stale metadata. |
| C8 | Apple summary | apple-platform-look.md:3–9, solid UI | same file :12, :21–26, app slice and glass | The header wins. Mark the rest as history. |

Dropped from the draft: "control heights" (density sets can coexist). Not yet proven: the elevation level-1 mismatch, which needs a rendered comparison.

## Decisions for Jabran (before DS-1a starts)
Settled already, nothing to decide:
- **Field focus (C3).** No halo, since 706d1895; DS-1a only fixes the stale docs and KDocs.

Open:
1. **C1 footer:** one algorithm. Recommendation: **the one-third rule (UX §25)**. Remove `footerInfo/maxShare` and the 0.25 cap.
2. **C4 KPI:** recommendation: 3 tiles stay in one row and 4 go 2×2 at every width (screen-standard wins). Fix `statColumns`.
3. **C5 casing:** recommendation: sentence case everywhere, so drop `uppercase` from the tokens.
4. **Window classes. Apple sizes change the answer.** M3's width numbers come from Android. Our checked sizes (screen-standard §9) fall on them like this:

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

**Recommendation:**
- Adopt the M3 height class (compact <480, medium <900, expanded ≥900) and the class *vocabulary*.
- **Keep our width switches** (600 / 720 / 1024 / 1280), set by our measured device list. Don't adopt 840 / 1200 / 1600.
- DS-1b tests the classes at our rig sizes plus the iPad 11" widths (820, 834, 1180, 1194, 1210) and a few Split View widths.

## DS-1 plan (App only; one repo per builder)
- **DS-1a: contract reconciliation** (Sonnet; mostly docs and tokens, plus small code changes):
  - C1–C8, once the decisions above are made (C3: docs and KDocs only);
  - a "Deviations from M3" section in screen-standard covering density/44, footer wrap, toast timing and the disabled primary.
  - **Acceptance:**
    - boundary tests at 1023/1024/1025 and 1279/1280/1281;
    - a test that `statColumns` never returns 1 (or the helper is deleted);
    - `NeoStickyFooter` uses only the one-third rule;
    - the short-landscape footer check from UX §25.
- **DS-1b: window-class spike** (Opus):
  - Check `org.jetbrains.compose.material3.adaptive` on Android, iOS and JVM. If it isn't usable on all three, write our own `NeoWindowClass` (width and height) in `NeoViewport.kt`.
  - Use it only in the shell and in one pilot flow.
  - **Acceptance:**
    - tests just below, at and just above our switches (600 / 720 / 1024 / 1280) and the heights 480 / 900;
    - every rig size from screen-standard §9 plus 820, 834, 1180, 1194 and 1210 maps to the expected class;
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
