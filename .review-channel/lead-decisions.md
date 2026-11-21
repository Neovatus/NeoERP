# Lead decisions — new-Mac lead (rule: claims.md "New-Mac lead rules", Jabran 2026-11-21)

One entry per open decision where the lead has a recommendation. Fable 5.2 (high effort, fresh, given the entry and
its sources only) writes the verdict. APPROVE → the lead acts. REJECT or OPEN → Jabran. Critical → Jabran directly.

Entry format:

```
## D-<n> <short title> — <date>
Question:
Options:
Pick:
Why:
Sources: <files:lines>
Fable 5.2 (high): APPROVE | REJECT | OPEN — <reason>
Status: acted <sha> | to Jabran | Jabran: <answer>
```


## D-1 UX-1: keyboard vs screen-standard §8 — 2026-11-21
Question: §8 says the keyboard "needs nothing more"; §25 (from G32, SE 1, SE 3) says the footer gives way and the focused field scrolls into view when the keyboard is up.
Options: (a) §25 wins, §8 points to §25; (b) keep §8, drop the give-way rule.
Pick: (a), plus a code row (fix list) so scroll insets include the keyboard.
Why: QA shows fields hidden under the keyboard and footer on iOS (G32, SE 1, SE 3); §8's statement is disproved on a real device. Docs follow evidence; the code gap becomes a tracked row instead of a silent mismatch.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): pending
Status: pending

## D-2 UX-1: needed-line and totals in the footer — 2026-11-21
Question: §25 moves the needed-line and totals out of the pinned footer; §8 keeps the needed-line `above` the footer and the journal balance pinned.
Options: (a) move them always; (b) move them only on short heights (when the room rule fails); (c) never.
Pick: (b). A tap on the disabled primary scrolls to the needed-line.
Why: On tall screens the pinned balance is the live feedback while typing lines (losing it costs every user); on short heights the pinned parts are what hid the fields. Scoping to the failing case keeps both.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): pending
Status: pending

## D-3 UX-1: wizard footer second row — 2026-11-21
Question: building-blocks:126 lets a wizard footer put the primary on a second row; §25 requires a one-row footer.
Options: (a) one row, Cancel folds under ⋯/More; (b) allow two rows for wizards.
Pick: (a), and building-blocks:126 is amended.
Why: building-blocks already contradicts screen-standard §8 ("never stacked full-width buttons"); a second row is exactly the height lost at 375–402 pt (SIZE, SE 3).
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): pending
Status: pending

## D-4 UX-1: which text may end in "…" — 2026-11-21
Question: building-blocks lets table headings (:118), the last breadcrumb (:110), card-line labels (:115) and any cell after two lines (:117) end in "…"; §25 lists what may and may not be cut, and review finding 4 shows a cut account name losing the distinguishing word ("…høy sats").
Options: (a) one list in §25, other rules aligned to it: never cut amounts, codes and numbers (e.g. "JV-…"), account names (wrap, or always with the account number), dialog/button labels, date-format placeholders; may cut: free-text names and descriptions in lists, the last breadcrumb, card-line labels, search placeholders while a visible label exists; a table switches to tight grid/cards before a heading would be cut; (b) leave each component's own rule.
Pick: (a).
Why: One list removes the contradictions; the evidence (Trial balance, SE 7 search placeholders, LT) shows where cutting lost meaning; the existing tight-grid → cards trigger already gives tables a way out without cutting headings.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): pending
Status: pending

## D-5 UX-1: §16 main action reachable — 2026-11-21
Question: §16 keeps the main action reachable while scrolling; §25 lets the footer give way while the keyboard is up on a short screen.
Options: (a) narrow exception in §16: only while the keyboard is up on a short height; Done/Return brings the footer back; (b) no exception.
Pick: (a).
Why: Without the exception the two rules cannot both hold at 375–402 pt with the keyboard up; the exception is bounded and the action is one key away.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): pending
Status: pending

## D-6 UX-1: button labels wrap — 2026-11-21
Question: screen-standard §4 says button labels never wrap; §25 lets buttons wrap their label to two lines at Larger Text.
Options: (a) §4 holds at default sizes; two-line wrap only at accessibility sizes; a footer button that would wrap moves into More first; at the largest sizes dialog actions may stack (as iOS alerts do); (b) §25 everywhere; (c) never wrap, truncate.
Pick: (a).
Why: Keeps today's look at normal sizes, follows G37/LT evidence (cut dialog buttons) at accessibility sizes, and matches the platform's own alert behaviour.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): pending
Status: pending

## D-7 UX-1: room left for the form — 2026-11-21
Question: The builder wrote "at least half the visible height is left to the form"; two QA findings (SE 1 ≈ 61 %, G37 step 3 ≈ 53 % left) would pass it.
Options: (a) at least half; (b) pinned parts (top bar, pinned head, footer) take at most a third of the visible height, keyboard counted, measured on height not width; (c) a fixed pt figure.
Pick: (b), and the same figure is the trigger for the short-height rules (review finding 1).
Why: A rule both failing screens pass is no rule; one third is reachable (375 pt: top bar ~64 + one-row footer ~64 leaves ~66 %); measuring height fixes that 667×375 and 874×402 get tablet layouts by width.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): pending
Status: pending

## D-8 UX-1: rig review sizes — 2026-11-21
Question: The rig row becomes the QA sizes 375×667, 667×375, 874×402, 744, 1032, 1376, 1440, dropping 1280, 1024, 768, 390.
Options: (a) accept; (b) keep 1280 too.
Pick: (a).
Why: Jabran named these sizes (2026-11-21); 1032 shows the rail band and 1376 the full sidebar; the 20 dp screenshot sweep covers 1280 exactly.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): pending
Status: pending

## D-9 UX-1: icons at Larger Text — 2026-11-21
Question: Sialkot Larger Text: icons did not scale with text. Builder kept the 44 pt touch floor and fixed icons.
Options: (a) icons beside text scale with the text up to a cap (1.5×); standalone icon buttons keep size with the 44 pt floor; (b) all icons fixed; (c) all icons scale.
Pick: (a).
Why: Platform look (apple-platform-look.md, SF Symbols follow Dynamic Type) argues for scaling icons that belong to a text line; a cap keeps rows from blowing up; standalone buttons already meet the touch floor.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): pending
Status: pending
