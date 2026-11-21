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
Fable 5.2 (high): APPROVE — §8's sentence (screen-standard.md:244) is disproved on builds that already had the G32 fix (10ef469d; QA G32 "partly fixed", SE 1, SE 3), so §8 points to §25. Word the code row as the outcome (the focused field is in view when the keyboard opens, in every editor), not "insets include the keyboard": the root is already padded by safeDrawing (NeoSafeArea.kt:40, MainViewController.kt:19-22), so the cause is still to be found.
Status: approved (Fable); goes into the UX-1 fix round with Fable's conditions.

## D-2 UX-1: needed-line and totals in the footer — 2026-11-21
Question: §25 moves the needed-line and totals out of the pinned footer; §8 keeps the needed-line `above` the footer and the journal balance pinned.
Options: (a) move them always; (b) move them only on short heights (when the room rule fails); (c) never.
Pick: (b). A tap on the disabled primary scrolls to the needed-line.
Why: On tall screens the pinned balance is the live feedback while typing lines (losing it costs every user); on short heights the pinned parts are what hid the fields. Scoping to the failing case keeps both.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): APPROVE — (b) is the smallest change to the 2026-11-13 footer rule (screen-standard.md:231-236) that still gives the one-row footer the brief asks for, and the code already drops these lines while the keyboard is up (NeoStickyFooter.kt:104-111). Conditions: "short" is the D-7 trigger (it also fires on phones in portrait: 64 + about 240 pt journal footer), the scroll-to-line on the disabled primary works by keyboard and screen reader (ux §20), and the change is written as a dated amendment and named to Jabran, since the rule is his.
Status: approved (Fable); goes into the UX-1 fix round as a dated amendment to a Jabran rule, named to Jabran. **Jabran 2026-11-21: confirmed.** The "for his confirmation" marker is removed in the UX-1 round-3 wording fixes.

## D-3 UX-1: wizard footer second row — 2026-11-21
Question: building-blocks:126 lets a wizard footer put the primary on a second row; §25 requires a one-row footer.
Options: (a) one row, Cancel folds under ⋯/More; (b) allow two rows for wizards.
Pick: (a), and building-blocks:126 is amended.
Why: building-blocks already contradicts screen-standard §8 ("never stacked full-width buttons"); a second row is exactly the height lost at 375–402 pt (SIZE, SE 3).
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): APPROVE — one row is what the brief sets and what §8 already says twice (screen-standard.md:179, :237); building-blocks.md:126 is the outlier and is amended. Keep its rule that the primary's label is never what gives way: the order becomes further actions under ⋯, Back as its arrow, then Cancel under ⋯.
Status: approved (Fable); goes into the UX-1 fix round with Fable's conditions.

## D-4 UX-1: which text may end in "…" — 2026-11-21
Question: building-blocks lets table headings (:118), the last breadcrumb (:110), card-line labels (:115) and any cell after two lines (:117) end in "…"; §25 lists what may and may not be cut, and review finding 4 shows a cut account name losing the distinguishing word ("…høy sats").
Options: (a) one list in §25, other rules aligned to it: never cut amounts, codes and numbers (e.g. "JV-…"), account names (wrap, or always with the account number), dialog/button labels, date-format placeholders; may cut: free-text names and descriptions in lists, the last breadcrumb, card-line labels, search placeholders while a visible label exists; a table switches to tight grid/cards before a heading would be cut; (b) leave each component's own rule.
Pick: (a).
Why: One list removes the contradictions; the evidence (Trial balance, SE 7 search placeholders, LT) shows where cutting lost meaning; the existing tight-grid → cards trigger already gives tables a way out without cutting headings.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): APPROVE — one list in §25 with building-blocks.md:110-118 aligned to it is right, and the tight grid → cards exit already exists (:118). Two conditions: the list keeps dates, status words and toast text as never cut (G37 step 7, LT toast; ux-principles.md:275), and "or always with the account number" covers pickers and lists only, while reports wrap account names in full; otherwise the Trial balance cut (SIZES.md, 1032: "sats" lost) stays allowed.
Status: approved (Fable); goes into the UX-1 fix round with Fable's conditions.

## D-5 UX-1: §16 main action reachable — 2026-11-21
Question: §16 keeps the main action reachable while scrolling; §25 lets the footer give way while the keyboard is up on a short screen.
Options: (a) narrow exception in §16: only while the keyboard is up on a short height; Done/Return brings the footer back; (b) no exception.
Pick: (a).
Why: Without the exception the two rules cannot both hold at 375–402 pt with the keyboard up; the exception is bounded and the action is one key away.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): APPROVE — at 667×375 with the keyboard up about 160 pt is left (SE 3: 145 pt head + 14 pt strip); the top bar (64) and a one-row footer (76) leave less than one 44 pt field, so §16 and the focused-field rule cannot both hold and (b) cannot be built. §16 is Jabran's (ux-principles.md:120, :151): write it as a dated amendment and name it to him; the trigger is the one from D-7.
Status: approved (Fable); goes into the UX-1 fix round as a dated amendment to a Jabran rule, named to Jabran. **Jabran 2026-11-21: confirmed.** The "for his confirmation" marker is removed in the UX-1 round-3 wording fixes.

## D-6 UX-1: button labels wrap — 2026-11-21
Question: screen-standard §4 says button labels never wrap; §25 lets buttons wrap their label to two lines at Larger Text.
Options: (a) §4 holds at default sizes; two-line wrap only at accessibility sizes; a footer button that would wrap moves into More first; at the largest sizes dialog actions may stack (as iOS alerts do); (b) §25 everywhere; (c) never wrap, truncate.
Pick: (a).
Why: Keeps today's look at normal sizes, follows G37/LT evidence (cut dialog buttons) at accessibility sizes, and matches the platform's own alert behaviour.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): APPROVE — keeps screen-standard.md:85 at default sizes and fixes the cut dialog button (G37 step 4). Make the triggers explicit: the primary never moves into More (secondary actions fold first, then the primary wraps), and dialog actions stack whenever they do not fit on one row; also correct §25's "about three times" (ux-principles.md:272), since the app caps text at 2× (NeoPlatformFontScale.kt:17, ux §20 at :172).
Status: approved (Fable); goes into the UX-1 fix round with Fable's conditions.

## D-7 UX-1: room left for the form — 2026-11-21
Question: The builder wrote "at least half the visible height is left to the form"; two QA findings (SE 1 ≈ 61 %, G37 step 3 ≈ 53 % left) would pass it.
Options: (a) at least half; (b) pinned parts (top bar, pinned head, footer) take at most a third of the visible height, keyboard counted, measured on height not width; (c) a fixed pt figure.
Pick: (b), and the same figure is the trigger for the short-height rules (review finding 1).
Why: A rule both failing screens pass is no rule; one third is reachable (375 pt: top bar ~64 + one-row footer ~64 leaves ~66 %); measuring height fixes that 667×375 and 874×402 get tablet layouts by width.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): REJECT — measuring height with the keyboard counted is right, but "at most a third" cannot be met at the sizes it is written for: top bar 64/60 (NeoSmartTopBar.kt:113-116) plus a one-row footer of 76 (44 touch floor + 2×16, NeoStickyFooter.kt:100) is 140 of 375 (37 %) and 136 of 402 (34 %), the entry's own 64 + 64 is 34 %, and with the keyboard up the top bar alone, which §17 keeps pinned (ux-principles.md:157), is over a third. Change: one third is the trigger only, and the rule is what may stay pinned once it fires: the top bar and a one-row footer with the keyboard down, the top bar only with it up (SE 1 and G37 step 3 both trigger it).
Status: to Jabran (Fable REJECT). Lead agrees with Fable's change: one third is the trigger for the short-height rules, not a floor; once it fires, only the top bar and a one-row footer stay pinned with the keyboard down, the top bar only with it up. Builder writes this version marked pending Jabran. **Jabran 2026-11-21: agreed (Fable's version), because on small screens the content would otherwise not be visible.** The "(pending Jabran)" marker is removed when the UX-1 review files are committed.

## D-8 UX-1: rig review sizes — 2026-11-21
Question: The rig row becomes the QA sizes 375×667, 667×375, 874×402, 744, 1032, 1376, 1440, dropping 1280, 1024, 768, 390.
Options: (a) accept; (b) keep 1280 too.
Pick: (a).
Why: Jabran named these sizes (2026-11-21); 1032 shows the rail band and 1376 the full sidebar; the 20 dp screenshot sweep covers 1280 exactly.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): APPROVE — the six QA sizes are Jabran's (WORKFLOW.md:313-315) plus 1440 from the brief, the replaced list was the lead's own (screen-standard.md:325), 1032 is the rail and 1376 the full sidebar (NeoBreakpointTokens.kt:20-26), and the 20 dp sweep lands on 1280 (screen-standard.md:352). Dropping 1024 loses nothing: the drawer layout is still reviewed at 744.
Status: approved (Fable); goes into the UX-1 fix round with Fable's conditions.

## D-9 UX-1: icons at Larger Text — 2026-11-21
Question: Sialkot Larger Text: icons did not scale with text. Builder kept the 44 pt touch floor and fixed icons.
Options: (a) icons beside text scale with the text up to a cap (1.5×); standalone icon buttons keep size with the 44 pt floor; (b) all icons fixed; (c) all icons scale.
Pick: (a).
Why: Platform look (apple-platform-look.md, SF Symbols follow Dynamic Type) argues for scaling icons that belong to a text line; a cap keeps rows from blowing up; standalone buttons already meet the touch floor.
Sources: App `phase/4-b2-ux1` at 77982304: `docs/design/ux-principles.md` §16, §20, §25 (lines 260-285); `docs/design/screen-standard.md` §4 (:85), §8 (:236, :244), back link (:185), §9 (:325-334); `docs/design/specs/building-blocks.md` (:110, :115, :117, :118, :126); QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/` (SIZES.md, SIZES-iphone-se.md, larger-text.md, G37-larger-text.md, G05-G17-G26-G31-G32-G33-input.md); code `composeApp/.../NeoBreakpointTokens`, `NeoInputKind.kt`.
Fable 5.2 (high): APPROVE — (a) is sound: icons in a text line grow with it up to 1.5× (16 → 24) while text itself caps at 2× (NeoPlatformFontScale.kt:17), and bar icons stay fixed. Correct the reason: apple-platform-look.md says nothing about SF Symbols and its sections 2–7 are not adopted (:3-8), so ground it in ux §20; and state that most icons QA named (bell, search, ⋯, ×; larger-text.md "Page") are standalone and stay as they are by decision.
Status: approved (Fable); goes into the UX-1 fix round with Fable's conditions.

## D-10 UX-1: a primary button that does not fit at the default size — 2026-11-21
Question: After D-6, screen-standard §4 forbids a wrapped button label at the default sizes, and ux §25 forbids cutting the primary or moving it into More. When the primary alone does not fit (QA SE 8: "Submit for appro…" at the default size on iPhone SE portrait), no rule allows any way out.
Options: (a) one fold order at every size: further actions under ⋯, Back as its arrow, Cancel under ⋯, and the primary's label wraps to two lines only as the last step (also at default sizes); (b) keep §4 (no wrap at default sizes) and require shorter labels: a primary label that does not fit at 375 pt on its own is a copy defect to fix in the strings; (c) allow the primary to drop to an icon plus label on a second row.
Pick: (a), plus (b) as guidance: write labels that fit at 375 pt, and the wrap is the safety net, not the design.
Why: (a) gives every size the same predictable order and never hides or cuts the main action (ux §16, §25); a two-line primary is rare and readable, while "Submit for appro…" loses meaning. (b) alone cannot hold for nb/sv/da strings, which run longer than English (I18N, four languages); (c) breaks the one-row footer rule (D-3).
Sources: App `phase/4-b2-ux1` at 7e263196: `docs/design/screen-standard.md` §4 (:85-92), §8 footer; `docs/design/ux-principles.md` §16, §25; `docs/design/specs/building-blocks.md` footer and dialog actions; QA evidence `git show 76968648:docs/agents/ux1/qa-evidence/SIZES-iphone-se.md` (SE 8); `NeoERP-App/i18n/` (string lengths per language); D-3 and D-6 above.
Fable 5.2 (high): APPROVE — the gap is real, though SE 8 is not it (three buttons shared the row, BillEditorScreen.kt:372-374; the primary fits once Cancel and Save draft fold): a wizard primary such as sv "Skapa och skicka in verifikationer" (values-sv/strings_accounts_ob_import.xml:48; nb/sv/da action labels run 13 to 21 % longer than en) cannot fit beside ⋯ and the Back arrow at 375 pt, and two 13.5/20 lines fit inside the 44 pt touch height, so the wrap adds no footer height. Conditions: at the default sizes only the footer primary wraps, and only after every fold (all other buttons keep one line); correct the SE 8 wording; mark the §4 change "for Jabran's confirmation", since §4 was agreed with him (screen-standard.md:3-4). Not critical.
Status: approved (Fable) with its conditions; goes into the UX-1 round-3 wording fixes; the §4 change is marked for Jabran's confirmation. **Jabran 2026-11-21: confirmed as a trial; checked in the QA size tests (long nb/sv/da labels at 375 pt).** If a footer primary still does not fit on two lines there, the lead's proposal is a shorter label (string fix), not folding the primary into ⋯ (ux §16); Jabran to confirm when the test shows it.

## D-11 App Lane 0: feature-to-feature imports over the 40-line stop — 2026-11-21
Question: The rule "features never import from other features" (`NeoERP-App/.claude/CLAUDE.md:64`) has 289 import lines in 31 feature pairs today (largest: organization→entitlement 63, platform→people 40, organization→agreement 34, organization→people 29). A per-line baseline would freeze 289 lines, over the brief's 40-line stop.
Options: (a) per-pair ratchet: one baseline line per existing pair with its line count (`organization->entitlement|63`, 31 lines); a new pair fails, a count above its frozen number fails, counts may only go down, a stale line fails; the rule stays as written; (b) declare the composition pairs (organization composing entitlement/agreement/people/roles/audit; platform→people) allowed and freeze the rest; (c) freeze 289 lines per import.
Pick: (a). Whether composition pairs should become allowed (b) is an architecture change for Jabran later (e.g. moving shared pieces into `core/` or a composition module), and goes to the backlog as a question, not into this gate.
Why: (a) fits the 40-line stop (31 lines), stops new coupling at once, keeps the documented rule unchanged and only shrinks; (b) changes an architecture rule, which per WORKFLOW is the lead's proposal for Jabran to approve, not a gate-lane call; (c) is noise that reviewers cannot check.
Sources: App `phase/4-b2-lane0-app` at 48e72d5b: `docs/agents/lane0-gates/builder-report.md:24,44-48`; `.claude/CLAUDE.md:64-70`; `ARCHITECTURE.md:47,110`; the brief `docs/agents/lane0-gates/brief-app.md` item 4; `composeApp/src/commonMain/kotlin/**/features/**` imports.
Fable 5.2 (high): APPROVE — my count confirms 289 import lines, in 30 pairs (not 31), plus 24 fully qualified lines; (a) stops growth and leaves `.claude/CLAUDE.md:64` as written. Conditions: count fully qualified references with the imports, since two pairs exist only that way (accounts→entitlement 9, e.g. `JournalWording.kt:442`; platform→entitlement 1), giving 32 baseline lines; a count below its frozen number must fail as stale, so no headroom builds up; verify.md states the frozen total; the composition question (b) goes to the backlog for Jabran. Not critical: no rule text changes.
Status: approved (Fable) with its conditions; goes into the App Lane 0 builder round.

## D-12 App Lane 0: scope of the toDouble()/toFloat() refusal — 2026-11-21
Question: The brief refuses `toDouble()`, `toFloat()` "on user text outside NeoFormat/NeoNumericInput in features/**". The builder refuses them only on text or money receivers (string literals, String function results, names with a text word or a money word), always refuses `toDoubleOrNull`, `toFloatOrNull`, `toBigDecimal*`, `String.format`, `"…".format(`, `DecimalFormat`, `java.text`, and does not refuse `toIntOrNull`/`toLongOrNull`. Refusing every call would freeze 7 layout `Int.toFloat()` lines.
Options: (a) accept the builder's receiver-based scope; (b) refuse every `toDouble()`/`toFloat()` in `features/**` and freeze the 7 layout lines; (c) (a) plus refuse any `toDouble()`/`toFloat()` whose result reaches a money-named value.
Pick: (a).
Why: it matches the brief's "on user text" and L24 (no money parse outside NeoFormat), catches the R12 class of fault (typed text parsed to Double), and avoids freezing harmless layout maths; the always-refused list closes the common bypasses. (c) needs data-flow analysis a scan test cannot do reliably.
Sources: App `phase/4-b2-lane0-app` at 48e72d5b: `docs/agents/lane0-gates/builder-report.md` "Decisions the brief left open"; `composeApp/src/jvmTest/**/buildrules/**` (BuildRules.moneyWords); `docs/operations/verify.md`; workspace `docs/lessons.md` L03, L24; fix-list R12.
Fable 5.2 (high): APPROVE — (a) over (b) and (c): `features/**` holds 7 `toFloat()` lines, all layout, and no `toDouble()` at all. Conditions: refuse every `toDouble()` (0 lines frozen; layout needs only Float), which closes the name gap (`value.toDouble()`, `it.toDouble()`, `parts[0].toDouble()` pass today); refuse `toLong()`/`toLongOrNull()` on text receivers too, since money is Long minor units and that is the real hand-parse path (`MockA3Fixtures.kt:90` `text.replace(".", "").toLong()` passes today; my simulation freezes 2 lines, one a false hit at `OpeningImportPageScreen.kt:158`), or log it as a fix-lane row. Money guardrail, but within the brief's wording and only tightened: not critical.
Status: approved (Fable) with its conditions; goes into the App Lane 0 builder round.
