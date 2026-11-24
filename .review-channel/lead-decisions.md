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

## D-13 ISO-R1: is the tenant binder switched on in any service in R1? — 2026-11-21
Question: ADR-026 R1 builds the shared `TenantTransactionBinder`, its repository aspect, and binds in the shared InboxProcessor and DomainEventWriter. The ADR does not say whether R1 switches it on anywhere. The aspect opens a transaction around non-transactional tenant calls and refuses a second company per transaction, so switching it on in Accounts changes behaviour the full accounts suite must prove.
Options: (a) one switch `neoerp.tenant.binder.enabled` (default false) turns on the binder bean and aspect; InboxProcessor/DomainEventWriter bind through it when present; R1 leaves it OFF in accounts, hr and payroll; Accounts turns it on in R2+R3 with the fixture role switch; HR v2/Payroll v2 in their first slice; the shared RuntimeRoleCheck reports "RLS tables present but binder off" (fail-closed: under RLS an unbound call errors); hr/payroll get owner/app/backup roles in initdb and role tests, but keep connecting as `neoerp` until R4. (b) switch it on in Accounts in R1 already (no RLS yet), so R2+R3 is smaller. (c) no switch: always on wherever the library is present.
Pick: (a).
Why: R1 adds no table policies, so turning the binder on now changes Accounts' transaction behaviour without any isolation gain, and only the full accounts suite at R2+R3 (D8: same merge as the RLS migration) can prove it; (a) keeps R1 behaviour-neutral and reviewable, and the RuntimeRoleCheck line stops the switch being forgotten once policies exist. (c) would change every service that pulls in the library at once.
Sources: BE `phase/4-b2-iso-r1` (builder's work in progress); accepted ADR-026 §4 rows R1, R2+R3, R4 and D8, D10 (`docs/agents/iso-r1/adr-026-accepted.md` on that branch); `services/accounts-service/.../RuntimeRoleCheck.kt`.
Fable 5.2 (high): APPROVE — (a), not critical, with one condition: "RLS tables present but binder off" must be a `problems()` entry that refuses start-up (`RuntimeRoleCheck.kt:38,72-73`), in every profile if possible, not a log line. The switch opens no leak (R1 enables no policy, `brief.md:10-11`; a superuser or owner skips RLS whether the binder is on or off, `application-local.properties:12`), but "an unbound call errors" holds only for company-only tables with a row: tables with a system or platform policy return 0 rows (ADR M4), and the inbox mark changes 0 rows, logs "claim lost" at INFO and retries for ever (`InboxProcessor.kt:109-117`), so jobs would stop silently. (b) would break the multi-company paths that R2+R3 reshapes (ADR §1.3, D4); (c) reaches six services through `neoerp-security`.
Status: approved (Fable) with its condition: "RLS tables present but binder off" refuses start-up as a RuntimeRoleCheck problem, not a log line; sent to the R1 builder.

## D-14 ISO-R1: a named savepoint exception to ADR-026 M3 — 2026-11-21
Question: Accepted ADR-026 M3 says main code uses no savepoints (a savepoint rolled back after a `SET LOCAL` would drop the company setting while the marker says bound). The R1 builder found `shared/domain-events/.../ConsumerPoller.kt:62-71` creates savepoints in the poller's recovery transaction (per-row inbox receive).
Options: (a) ban savepoints in accounts, hr, payroll, shared tenant-security and domain-events, with ConsumerPoller as the one named exception: its polling transaction carries no company bind; R4 must make the inbox system-job bind at the start of the polling transaction, before the first savepoint (recorded as an R4 item); a bind after a rolled-back savepoint fails closed (rows not acked, retried); user-service (InviteAcceptJdbcAdapter) is not an RLS service, so outside the ban. (b) rewrite ConsumerPoller without savepoints now (per-row transactions). (c) no exception: the ban test fails until (b) is done.
Pick: (a), judged in the R1 security review with the code in front of the reviewer.
Why: R1 binds nothing in the poller yet, so the savepoints carry no risk today; rewriting the shared consumer's recovery in a binder lane widens it; the exception is named, tested and tied to the step (R4) where it would start to matter. Note: "fail closed" must be checked against D-13's finding that unbound calls on system-policy tables return 0 rows rather than error.
Sources: BE `phase/4-b2-iso-r1` (`shared/domain-events/src/main/kotlin/**/ConsumerPoller.kt:62-71`, the builder's savepoint ban test); accepted ADR-026 M3, R4 (`docs/agents/iso-r1/adr-026-accepted.md`); D-13 above.
Fable 5.2 (high): APPROVE with three conditions (ISO-R1 security review, `docs/agents/iso-r1/review-2-fable-security.md` on BE `phase/4-b2-iso-r1`): R4 binds first inside `ConsumerPoller` itself, before its first savepoint; a poison-row test; and the exception stays as narrow as the review states.
Status: approved with conditions; conditions go into the ISO-R1 fix round and the R4 brief.

## D-15 FIX-BE small decisions (lead, 2026-11-21)
R04: cause is a stale saved report filter on one device (report endpoints 404 for an id not in the company, `ReportReadModel` 111/539/619-640/683; filters carry across tabs since G24); App fix (drop saved filter and fiscal year on a report 404, reload) in an App lane; no BE change. R07 (builder D1): App picks 2960 for accrued expenses; no pack role in this lane. R30b (builder D6): CHECK NOT VALID accepted, but not V75 (reserved for AL S5); next free accounts version, reservation named. Small and reversible: lead decision (Jabran's rule).
Status: acted (sent to the FIX-BE builder)

## D-16 FIX-BE R10/R09 branch wording and trial balance rows — 2026-11-21
Question: Equity accounts take no branch tag (A1 C-13), so in the branch trial balance they fall in OUTSIDE_FILTER "Other branches and lines without a branch" (kept so the TB balances, A2 C-3); QA read that as a bug (R10), and the SIE import says "Every line gets this branch" while 2081 gets none (R09).
Options: (a) App wording "Lines on accounts that take a branch get this branch"; BE splits OUTSIDE_FILTER into OTHER_BRANCHES and NO_BRANCH ("Company-level lines (no branch)") — a TB payload change, App needs a label; (b) wording only, no BE change.
Pick: (a).
Why: the user's complaint is that equity looks like it belongs to "other branches"; only a separate row says what it is, and the TB still balances. Payload change is additive (a new row kind).
Sources: BE `phase/4-b2-fix-be` (builder report); App spec `accounts-a1.md` C-13, `accounts-a2-a3.md` C-3; QA `G03.md`, `T18.md`.
Fable 5.2 (medium): APPROVE — critical (money report). (a) is right, with three conditions: it is not additive, it replaces `OUTSIDE_FILTER` (BE `ReportModels.kt:103`, `ReportReadModel.kt:201-206`, `TrialBalanceExporter.kt:216`; App `ReportsWording.kt`, `TrialBalanceState.kt`), so BE, export and App ship together; the two rows must sum per column to today's all − match (test), and NO_BRANCH only exists under a branch filter — with a cost-centre filter (alone or combined) keep one row. Source fix: the TB contract is A2 C-6, not C-3 (`accounts-a2-a3.md:742`); I found A1 C-13 only by reference (`accounts-dimensions.md:233`), not in `accounts-a1.md`.
Status: **approved by Jabran 2026-11-21** with Fable's conditions (replaces OUTSIDE_FILTER: BE, export and App ship together; the two rows sum to today's row; NO_BRANCH only under a branch filter); sent to FIX-BE; App label to App B.

## D-17 FIX-BE R19 "Ends after N times" and skipped runs — 2026-11-21
Question: C-17 (S3a review M2/M3) counts every settled run, SKIPPED_* and DISMISSED included, in maxOccurrences; QA (R19) says skipped dates should not count.
Options: (a) keep the count; a template with unresolved skipped runs stays ACTIVE until they are resolved (like WAITING_FISCAL_YEAR and FAILED), so it never shows Ended while it needs the user and N never overshoots; (b) skipped and dismissed runs stop counting (N means N journals; the schedule runs past skipped months) — a contract change.
Pick: (a).
Why: keeps the approved contract and its review findings; fixes the real problem (an ended template hiding work that needs the user); (b) can post more journals than the user set.
Sources: App spec `accounts-a4.md` C-17; BE `domain/recurring`; QA `A7.md`, `G23.md`.
Fable 5.2 (medium): APPROVE — not critical. (a) extends the end rule that already keeps a template ACTIVE for WAITING/FAILED runs (`RecurringOccurrences.kt:72-78`) and keeps the spec's count ("skipped and dismissed ones included", `accounts-a4.md:270-271`). Conditions: "unresolved skipped" is a new notion beside `settled` (`RecurringJournal.kt:175-177`), so the count and next date do not change; Dismiss and Create draft now must end the template when the last one is resolved (test); spec C-17 and the App's ACTIVE-with-no-next-date row are updated.
Status: approved (Fable, not critical) with its conditions; sent to the FIX-BE builder.

## D-18 FIX-BE R29 classifying the 60 unscoped repositories — 2026-11-21
Question: About 24 of the 60 are SYSTEM (outboxes, queues, IdP and session ports, identity, platform authority/staff, AuthzQueryRepository) and the three annotations cannot express that; user, audit and auth have no CompanyTenantScope resolver; about 15 mix per-company and cross-company methods (Membership, Role/RolePermission/RoleVersion, OnboardingInvite, OrgRequest, Company, Branch, Warehouse, audit query with null orgId), incl. person-facing cross-company reads with orgId null.
Options: (a) in this lane add a RATCHET_SYSTEM_ALLOWLIST (class → reason, allowed packages, like SYSTEM_ALLOWLIST), move the clearly SYSTEM ones there (~24 off the baseline, cap ~60 → ~36); the method splits and the user-service scope resolver become their own lane R29b, before RLS; (b) do all 60 in this lane.
Pick: (a).
Why: the system ones are mechanical and shrink the baseline now; the splits change service APIs and person-facing reads (security design), which need their own brief and reviews; R29's deadline (empty before RLS / first customer) is kept by R29b.
Sources: BE `architecture-tests` (FrozenTenantBaselines, tenant-classification-baseline.txt, SYSTEM_ALLOWLIST); ISO-R1 bind allowlists (`shared/tenant-security`); fix-list R29; ADR-026 D2, D4.
Fable 5.2 (medium): APPROVE — critical (security), with conditions. The existing list means "machine path, never a person request" and its test imports only hr and accounts (`TenantRepositoryArchitectureTest.kt:86-93`); AuthzQueryRepository, the session/IdP ports and platform authority/staff serve person requests, so the new list needs its own meaning (reason names the key: caller identity or platform permission), the package rule extended to user/org/auth/audit, and AuthzQueryRepository pinned to `AuthzService` (its role-name reads take ids with no company, `AuthzQueryRepository.kt:44-52`). Keep out of the list, for PlatformWide or R29b: PlatformPeopleRepository, PlatformCompanyAccessRepository, PeopleQueryRepository, UserRepository and the two `inventory()` ports (people across companies); I read signatures, not every adapter, so the builder's list needs the second reviewer. RLS order is compatible: ADR-026 D2 puts no RLS on org/user/auth (`ADR-026:202`), so R2+R3 and R4 do not wait; R29b must land before R7 (audit_events, `:168`) and the pen test — Jabran to confirm rewording fix-list R29's "before RLS" to that, since R2+R3/R4 may start now (Q5 b, `:157`).
Status: **approved by Jabran 2026-11-21** with Fable's conditions (own meaning and package rule for the new list; PlatformPeople, PlatformCompanyAccess, PeopleQuery, UserRepository and the inventory ports stay off it); sent to FIX-BE; R29b added to the fix list (before R7 and the pen test).

## D-19 FIX-BE R08 {month} and {period} format — Jabran 2026-11-21
Jabran: "we already have one formatting based on the country, decide based on that." **Decided:** both `{month}` and `{period}` render with the company's country format that the App's NeoFormat uses (same month and month-year patterns), not a fixed English form; this supersedes the ledger-language part of D-180 for these two tokens; contract test BE output = NeoFormat pattern per country.
Clarified (lead, from the App code 2026-11-21): NeoFormat month-year is "<short month> <year>", {month} the full name; names come from the language tables `core_fmt_months_short/long` (en, nb, sv, da; no dots); the country changes only numbers. Stored memo text uses the ledger language (D-180): NO → nb, SE → sv, DK → da, PK/FI/IS → en. QA's "nov./des." came from Java's locale. App mirror test to add in an App lane.
Status: acted (sent to the FIX-BE builder)

## D-20 Migration numbers V73/V75 (approval limits S5) vs FIX-BE V76 — 2026-11-21
Question: FIX-BE adds accounts V76 (R30 b CHECK, `NOT VALID`). V73 and V75 were reserved for approval limits S5, which Jabran put after QA batch 2, so V76 would merge first and a later V73/V75 would be refused by Flyway (outOfOrder is off).
Options: (a) S5 takes the next free numbers when built (V77 on); V73 and V75 stay permanent gaps; (b) turn on `outOfOrder`; (c) hold V76 until S5 merges.
Pick: (a).
Why: no branch holds a V73/V75 file (checked all remotes: only the old `phase/4-sec1` V73, merged as V72); S5 is not built; Flyway accepts gaps; outOfOrder weakens the order guarantee for every later migration; holding V76 blocks a money-invariant fix for no gain.
Class: small (lead), no money or schema meaning changes.
Status: acted; PROJECT-STATE AL-1 row updated; the S5 brief must use the next free number.

## D-21 FIX-BE R29 NotificationDeliveryAttemptRepository — 2026-11-21
Question: PlatformWide needs a PlatformTenantAccess-first method rule; audit-service has no resolver or gateway, and save() is machine-called.
Options: (a) back on the baseline for R29b with a note (platform read PLATFORM.AUDIT.READ + every company, pin to NotificationService; split machine save from platform read once audit-service has a resolver), cap 44; (b) build the audit resolver/gateway now; (c) PlatformWide with a method-rule exemption.
Pick: (a). Why: (b) is new security wiring beyond a fix lane; (c) weakens the rule; (a) matches review 1's own alternative and keeps the ratchet honest (44 still below the original 60).
Class: small (lead). Status: acted (sent to FIX-BE).

## D-22 FIX-APP-A builder questions — 2026-11-21
Fold order: UX-1 merged with Jabran's MERGE (87ae114c), so its fold order is approved. R22 "Leave without saving?": keep it in all six editors that share the Cancel rule (one behaviour). iPad mini grid row growth: fix in this lane (R14 named it), caption moved, size test at 744.
Class: small (lead). Status: acted (sent to App A).

## D-23 FIX-BE control-posting reason: where the 6–500 rule lives — 2026-11-21
Question: round 2 (on the lead's instruction) put "6–500 visible characters" in the V76 CHECK, the invariant and the service. PostgreSQL checks a `NOT VALID` constraint on every later UPDATE, so an old reason of 1–5 characters would block reversing or posting that row with a 500 (Opus 1b N1, Fable 2b N3); a reason over 500 raw characters or with emoji passes the service and fails in the database with a 500 (Opus 1b N2, Fable 2b N1); some invisible characters still count (Fable 2b N2).
Pick: one definition of "visible" (code points left after removing every Unicode space, control and format character and the filler/blank characters, e.g. U+2060, U+00AD, U+180E, U+200B–U+200F, U+FEFF, U+3164, U+2800, U+115F, U+1160, U+FFA0), used everywhere. **Database CHECK and invariant: at least one visible code point** (a backstop that never blocks old legitimate rows). **Service: 6–500 visible code points and at most 500 code points in all**, checked when a reason is entered or edited and when a draft is posted (a short old reason on a draft gives a 400 with the field message). A recurring template's reason is checked the same way and the invariant covers templates. ACC-R27: run `money-invariants.sh` on every existing database, the local one included, before V76 is applied, and say how a POSTED row is corrected.
Why: the lead's round-2 instruction over-reached (blank refusal was the row's ask); 6 matches the app's MIN_REASON_LENGTH; a database backstop must not break reversals of old journals.
Class: small (lead; corrects its own instruction). Status: acted (sent to FIX-BE round 3). Fable 2b N4 → R29b follow-up.
Note (Opus 1c L1, lead): an old short reason at submit or post is refused with 422 `CONTROL_REASON_REQUIRED` `{reason: INVALID, min, max}`, as other submit/post refusals, not 400; accepted. A U+0000 in a reason is refused by the service with a field error (Sonnet 3 F1). Table name: `accounts.recurring_journals`.

## D-24 FIX-APP-A round 2: the grid "not taken" reason and tab fling — 2026-11-21
Question: round 1 moved a disabled grid cell's reason into its tooltip to stop the iPad mini row growing (D-22); both reviews found it breaks the approved spec (`accounts-a1.md:216`, R-22 "never only a tooltip"), on desktop too, and touch has no hover. The R15 fix also removed fling/overscroll on NeoTabs.
Pick: the spec wins. The reason is shown inside the disabled cell as its one-line content ("Not used for 1920"), ellipsis allowed, full text in tooltip and spoken name; the row keeps its height; the account kind stays on the account's own line. NeoTabs keeps fling/overscroll with the R15 first-tap fix; if not possible, the builder reports why and it comes to Jabran.
Why: an approved spec rule is not changed by a fix lane; the in-cell text meets both the spec and the row-height finding.
Class: small (lead). Status: acted (sent to App A round 2).

## D-25 R29b builder stop: owner lookups, platform writes, catalogue, lane size — 2026-11-22
Question: The R29b builder stopped before any code (BackEnd `phase/4-b2-r29b` `9cb5fbd7`, `docs/agents/r29b/builder-report.md` Q1–Q7). (Q1) ~40 by-id endpoints in org and user carry no company; today an `@PreAuthorize` helper loads the row by id across all companies (an "unscoped owner lookup", forbidden by ADR-012 §2), then the service reads it unscoped again. (Q2) Platform-staff writes: some in one company, some with no company (person-wide changes, the role/permission catalogue, company creation). (Q3) Invite accept by token for a person who is not yet a member. (Q4) Role repositories mix standard roles (`company_id` null) and company roles (ADR-012 §4 forbids that mix); the catalogue is written at runtime by `PLATFORM.CATALOG.WRITE`. (Q5) A durable platform-access audit port for the platform-wide reads in user, audit, auth. (Q6) PlatformCompanyAccessRepository's `findLiveForActor`/`endLiveForActor`, keyed by the staff member's own identity. (Q7) ~280 methods, ~100–150 main + ~100 test files across 4 services.
Options and picks:
- Q1: (a) one owner-lookup port per service, `WHERE id = ? AND company_id IN (:caller's reach)` (reach = the caller's ACTIVE memberships, or a staff member's checked platform scope), returning only the company id, used only by the scope resolver, which then checks the permission there and issues `CompanyTenantScope`; every later read scoped. (b) add `companyId` to the ~40 requests (HR v2 precedent `hrms-v2-h0.md` §3; an App change). (c) keep the unscoped lookup. **Pick (a)**, recorded as a narrow ADR-012 §2 note: an owner lookup is allowed only when bounded by the caller's reach, returning a company id only, pinned to the resolver. **Wrong-company answer:** 404 outside the reach, 403 inside it without the permission, in both org and user (user-service gives 403 today; it moves to org's 404).
- Q2: **(a)**: a platform action in one company gets a `CompanyTenantScope` from a resolver that runs the platform-permission check itself (ADR-012 §3 allows a platform operation against one company through `CompanyTenantScope`); writes with no company go on the ratchet system list with the platform permission as the key, classes pinned, each through its own use case with an audit event (ADR-012 §3's "reviewed use case and audit contract"). Not (b), a new ADR contract, while (a) covers every case found.
- Q3: **Yes**: a ratchet system entry keyed by the invite token hash **and** the signed-in identity's email match, pinned to the accept path in OnboardingService (the token is single-use, high-entropy and stored hashed).
- Q4: **Split** each Role* repository into a standard-role catalogue port and a company-role `@TenantOwnedRepository`. Catalogue **reads** (standard roles and versions, `PermissionRepository`, `ApprovalKindRepository`) become `@PlatformReferenceRepository`; catalogue **writes** get their own ratchet system entry keyed by `PLATFORM.CATALOG.WRITE`, pinned to the catalogue admin use case — so "platform reference" keeps its meaning of read-only reference data.
- Q5: **Yes, in scope**: one `PlatformAccessAuditPort` adapter per service on the existing outbox or table (user `iam` audit outbox, audit `audit_events`, auth `V9__audit_event_outbox`), recorded before the read; no migration (stop if one turns out to be needed). Lands with sub-lanes 4 and 5.
- Q6: **Yes**: the caller-identity part goes on the system list (key: caller identity), pinned to AuthzService, CallerAccessResolver and PlatformCompanyAccessService; the rest follows Q1/Q2. This keeps Fable's D-18 condition for the people-across-companies reads (those stay platform-wide or split).
- Q7: **Five sub-lanes**, in order, each lowering `MAX_UNCLASSIFIED` and the frozen set as it lands, each an Opus high builder on the builder Mac and Opus + Fable reviews on the test Mac: R29b-1 org (10 entries incl. R34 `AuditEventOutboxStore`); R29b-2 user resolver + RBAC; R29b-3 user onboarding, queues, employee link; R29b-4 user platform and people + user audit port; R29b-5 audit + auth. R29b-5 lands before ADR-026 R7 and the pen test.
Why: (a) in Q1 keeps every App request unchanged in Phase 4 and removes the unscoped lookup, which is what ADR-012 §2 is about (a lookup bounded by the caller's reach cannot reveal another company's row); (b) is the right shape for new APIs (HR v2 already does it) and can follow when these APIs are rebuilt. Q2/Q4/Q6 keep each list's meaning narrow and pinned, as Fable asked in D-18. Q7: one pass of ~250 files is beyond a reviewable lane.
Sources: BackEnd `docs/agents/r29b/builder-report.md` (Q1–Q7, per-entry draft, facts checked); `docs/adr/ADR-012-tenant-query-isolation.md` §2–§4; ADR-026 D2, R7; D-18 (Fable's conditions).
Fable 5.2 (high), 2026-11-22: **APPROVE WITH CONDITIONS for Q1, Q2, Q4, Q5, Q6, Q7; REJECT Q3** (premise wrong in code; lead checked: `findByTokenHash` has no production caller, accept runs at sign-in in `OnboardingFirstLoginService.acceptForUser:74-86` by the identity's verified email). Conditions adopted by the lead:
- Q1: no "null or empty means all" (scope-all staff reach `null`, super admin's empty set, OrgAuthorization:65-67, 92-97): scope-all staff get a separately named lookup keyed by the checked platform permission (own list entry); staff reach incl. companies under a scoped company computed by a keyed query, not `findAll()`; the lookup may return **company, branch or warehouse id only** (user-service judges at the row's branch/location, UserAdminAuthorization:198-199, 232-233, 393-394); an arch rule that owner-lookup methods return only those id types; the reach is a resolver-minted value, not a raw `Set<UUID>`; pinned by class to the resolver only; `roles/{id}`: catalogue lookup (`company_id IS NULL` in SQL) first, then the owner lookup; org `requests/{id}` move from 403 to 404 for missing/other-company ids (behaviour change, listed); a reach failure answers 503, never an empty set read as 404; mutations need a fresh reach.
- Q2: every platform write (one company or none) writes an audit event in the same transaction (staff identity, permission code, company or "none", reason); audit failure refuses the write; a test per use case; an ADR-012 §3 note listing each company-less write (person status, catalogue, company creation, staff); a standard-role edit needs fresh authority, scope-all, before/after and version in the event; each company-less write is its own small port with frozen methods, never a whole repository.
- **Q3 replaced:** delete `findByTokenHash`; the accept reads become a caller-identity port pinned to `OnboardingFirstLoginService`; the email comes only from the identity row; verified email stays required outside local. No request-carried secret becomes a list key.
- Q4: reference ports get frozen methods and a no-write-method arch rule; `findCopiesOf` and `countReferences` go on the catalogue-write entry; every role query `company_id IS NULL` or `= scope`, two-company tests both ways.
- Q5: the audit record commits in its own transaction before the read; failure denies; permission and endpoint carried in `reason`; R7's platform policy must cover audit-service's own records.
- Q6: pin to `PlatformCompanyAccessService` alone (AuthzService, CallerAccessResolver, AppBootstrapService, UserLifecycleService go through `activeFor(userId)`); the reader takes the principal, or a test per caller that the id is the token's own person.
- Q7: two gates: R7 waits only for R29b-5 (independent of 1–4, may run earlier); the pen test waits for all five with `MAX_UNCLASSIFIED` 0; the Q4 catalogue split lands in R29b-2 before R29b-4.
- Missed by the lead: `canChangeEmail` / `canManageSecurity` read the target person's memberships in every company for a company admin (UserAdminAuthorization:280-285, 294-297): a boolean-only port "has an accepted membership outside the companies where the caller holds the permission", pinned to those two policies.
Status: **approved by Jabran 2026-11-22** ("good with recommendations also": all four owner points as the lead recommended, with Fable's conditions). Was: waiting for Jabran on four owner points: (1) split-off small ports of `UserRepository` and `PlatformCompanyAccessRepository` on the system list (reads D-18's condition narrowly) — lead: yes, as small pinned ports with frozen methods and audit; (2) accept the ADR-012 §4 storage deviation (nullable `iam.roles.company_id`, V14) for now, with query discipline and tests both ways — lead: yes, plus a backlog row to separate standard roles into their own table before the pen test; (3) the visible 403→404 changes (user by-id endpoints, org `requests/{id}`) — lead: yes, and the App retest checks the not-found messages; (4) the email/security cross-company check as a boolean-only pinned port — lead: yes.

## D-26 R29b-1 review round 1 (Opus FIX 0H/2M/6L, Fable FIX 0H/5M/9L) — 2026-11-22
Both reviews found no path to another company's rows and no request id that widens reach; FIX is for unmet D-25 conditions, pins and tests. **Lead decisions (small, rule 2):** (1) a base run (old FAIL / new PASS) for the three HTTP-visible changes (`requests/{id}` 403→404, 503 on reach failure, enrolled company outside the reach), per the regression-test rule; (2) Fable M4 fixed in this lane: `CompanyEnrollmentRollback.removeEnrolledCompany` and `EntitlementChangeLog.findByCompany` classified or pinned so cap 0 means what it says; (3) Fable L5: a write whose audit fails answers a typed 503 like the read path, not a raw 500; (4) the evidence folder stays until R29b-5 (the sub-lanes use it).
**Owner points (Jabran):** (a) Fable M3b: `GET /companies` and `/overview` are any-active-person endpoints whose scope-all staff branch is a platform-wide read; the library forbids `@PlatformWideRead` on such an endpoint. Options: give them a real staff rule (an API split: a separate staff directory endpoint, App change), or record a pinned ADR-012 §3 exception for these two endpoints (the staff branch is still recorded before the read). Lead recommends the **pinned exception** (no App change in Phase 4; the read is recorded either way). (b) Enter-company session writes keep the existing `enterCompany` attribution in the same transaction and are not also recorded as `PLATFORM_WRITE`. Fable judges it acceptable; lead recommends **confirm**.
Status: lead decisions sent to the fix round; **(a) and (b) approved by Jabran 2026-11-22 ("Ok")**: pinned ADR-012 §3 exception for `GET /companies` and `/overview` (staff branch recorded before the read); Enter-company writes keep the `enterCompany` attribution.

## D-27 FIX-APP-B2a R21: Delete on a draft opened from the list — 2026-11-22
Question: the A4 spec opens draft rows in the editor and keeps Delete on the detail page, so a draft opened from the list has no Delete (G04). Options: (a) "Delete draft" in the editor footer's ⋯ in all five editors (invoice, credit note, bill, debit note, journal), with the existing confirm; (b) draft rows open the detail page.
Pick: (a). Why: keeps the spec's flow (drafts open where they are edited) and removes the dead end where the person is; (b) changes the approved navigation and adds a click to every draft edit. Small, reversible UI placement: lead decision under rule 2; the B2a reviewers check it.
Also for the reviewers to judge (builder's own calls, in its report): the reversals Status filter mapping; "Cancelled" with no name; journal numbers as plain text on reversal rows; the added notice sentence for reversals that could not post; a comment-only `distinct` marker in the strings.

## D-28 FIX-APP-B2a review round 1 — 2026-11-22
Reviews on `phase/4-b2-fix-app-b2-r` 358d944c: Opus FIX (0H/2M/8L; 153 targeted tests 0 failed, iOS compile 0 errors), Sonnet FIX (0H/1M/7L). Files: `docs/agents/fix-app-b2/review-1-opus.md`, `review-2-sonnet.md` (f50b0467).
Lead decisions (rule 2; small, reversible UI and docs calls; the fix checks judge them):
1. Fix both MEDIUMs and the Sonnet MEDIUM in this lane: Opus M1 keep the tab's filters in `JournalsPageHolder` (the reviewer's pick, matches the code comment, the developer page and S3); Opus M2 correct S3 and the user guide to what the default filter shows; Sonnet M1 Due from / Due to keep the raw text in state as `JournalsListViewModel` does, plus a typing test.
2. Fix all LOWs that are cheap in this lane (Opus L3–L10; Sonnet: refusal re-read in the editors, `deleting` blocks Save/Submit, nb "Reverser automatisk", `today` per read, the attention refresh queued not dropped, the stale Reverse now explanation if small). `AccountsJson.tolerant`: narrow it to the reads that need it if cheap, otherwise keep it and say why (A4 statuses are strings, no enum is coerced). Anything not cheap → a fix-list row, named in the report.
3. Footer change (Sonnet decision 1): accepted. Invoice, credit note and debit note now fold like the bill on a tight footer; wide footers unchanged. The builder confirms "wide unchanged" with a size test.
4. Builder calls 1–5: accepted. Calls 1, 3, 4 and "Cancelled with no name" are recorded as built differences in `docs/design/specs/accounts-a4.md` §3/§4.1 (a short "As built" note, not a redesign); listed for Jabran as design owner in JABRAN-TODO.
Status: sent to the B2a builder as fix round 1; re-checks by both reviewers (both said FIX), Opus re-runs.

## D-29 R29b-1 fix checks (round 2, the last) — 2026-11-22
Fix checks on `phase/4-b2-r29b-1-r2` 1d2d199a: Opus ACCEPT (arch 75/0, org 219/0 incl. `PlatformWriteRealTransactionTest` 6 executed, Java 21, Docker up), Fable FIX (13 of 14 fixed, L4 partly; no path to another company's rows). Files `docs/agents/r29b/review-1-3-opus-fixcheck.md`, `review-1-4-fable-fixcheck.md` (60c02809).
Lead decisions (rule 2):
1. Fix in this lane (fix round 2): Fable N1 MEDIUM (the sweeper's `SystemScopes` back to private, or pinned to the sweeper by an arch rule, with a fixture offender); Opus N1 LOW (the arch pins also check method references, so `scopes::tryIssue` cannot pass), since both are in the same pin family and cheap; Fable N2 LOW only if a flush inside the audit write makes the INSERT failure a typed 503 in a few lines; otherwise a follow-up row; the builder report's hashes and header refreshed for `-r2` (Opus L8).
2. Follow-up rows (named in lane-ready, picked up by R29b-2 or the backlog): `hasPermission` answers 503 on a user-service failure (with R29b-2); the operation-log machine methods and Fable L9 `OrgPlatformFactsScopes` refactor; the unused `accessibleOrgIds` (delete or make it fail closed); Fable N2 if not fixed.
3. Scope-all staff without the endpoint's permission get 404 on by-id resources (was 403): consistent with D-25 Q1 (no checked platform permission → no reach → 404). It is one more visible 403→404 change, so lane-ready lists it with the others and it joins the App retest list; Jabran is told (FYI, no new decision).
Re-check after round 2: Fable only (the only FIX), diff look; Opus does not re-run unless round 2 changes behaviour (then the targeted arch + changed classes once, by the builder).

## D-30 FIX-APP-B2a fix checks (round 2, the last) — 2026-11-22
Fix checks on `phase/4-b2-fix-app-b2-r` 5bd38d06: Opus ACCEPT (all ten fixed; 62 tests 0 failed), Sonnet FIX (all its findings fixed; new N1 MEDIUM, N2 LOW). Files `review-3-opus-fixcheck.md`, `review-4-sonnet-fixcheck.md`.
Lead decisions (rule 2): fix Sonnet N1 in this lane (`AutoReversalListViewModel.read()` compares the query, not the raw filters, so a typed-only date change does not drop an answer; test old FAIL / new PASS). N2 (a version conflict on delete hides Delete draft until reopen) stays: it fails safe; a fix-list row for part b. Re-check: Sonnet only, diff look; the builder runs the changed class plus the JVM compile; the old Mac's gate covers the iOS compile.

## D-31 GATE-2: align the two lanes; the clean-up after --stop — 2026-11-22
Built: BE `phase/4-b2-gate-2-be` `77cd7eb0` (self-tests 97/97; 12 fail on the base scripts), App `phase/4-b2-gate-2-app` `503e5c4e` (89/89; 12 fail on the base).
Lead decisions (rule 2; gate scripts, reviewed by Opus + Fable):
1. The BackEnd report's table "Names and wording the App lane must match" is the shared spelling. The App lane matches
   it where the item applies to both: the shared-home override `VERIFY_SHARED_GRADLE_HOME` (not a separate seed knob),
   seed, clean-up and slowest-class console lines, the hook `gate=` rule and refusal texts, git `core.quotePath=false`
   quoting, `--stop` then TERM after 10 s only for processes on the gate's own `gradle-home*` folder (never the shared
   home). App-only differences stay where they have a reason (D8 scans code only: a JSON fixture names a docs page in
   prose), written in its report.
2. TERM after `--stop` is accepted: it is limited to the gate's own home, under its own lock. Moving the gate to the
   in-process Kotlin compiler changes how the gate runs: not in GATE-2 (a GATE-3 candidate if daemons still stay behind).
3. Real-Gradle proof of item 2 and `scripts/gw`: the old Mac's first two full gates in parallel (memory and swap logged,
   per the brief) plus `scripts/gw --version` showing a 21.0.9+ Daemon JVM; the lane-ready files ask for it.
Reviews: one Opus and one Fable call, each covering both lanes (and their alignment), each writing a gate file per lane.

## D-32 GATE-2 review round 1 — 2026-11-22
Reviews: Opus BE ACCEPT / App FIX (M1: an outer `lockf` on the App lock around the App `verify.sh`, as docs still say, makes the gate wait for itself with no message; self-tests BE 97/97, App 91/91), Fable both ACCEPT (BE 11 LOW, App 8 LOW; no bypass of light, full or risk found).
Lead decisions (rule 2; one fix round in **both** lanes so they stay aligned; both reviewers re-check):
1. Both lanes: verify tests its own lock first (`lockf -t 0`) and, when busy, prints one line ("waiting for the <repo> Gradle lock (held by another run; run verify.sh without a lockf wrapper)") before waiting; a test; one verify.md line.
2. Cheap LOWs, both lanes where they apply: review-refusal paths quoted (BE L1); `scripts/gw` uses `java_home -F -v 21` so the `JAVA_HOME` fallback really runs, a stub that fails like the real one, and gw refuses to run outside its repo root (BE); the App's `/?docs` D8 tail in the BE; `tree_clean` with `--ignore-submodules=none`; a `.gitignore` under `docs/` is never light; a single misspelled `gate=` line gets a clear message; the seed line only after a successful copy (and how to re-seed in verify.md); TERM only for `java` processes naming `<home>/`.
3. GATE-3 row (not now; for Jabran and the old Mac): port the BackEnd's older rules to the App gate (Fable App finding 8: a non-ASCII or control-character path is RISK, the hook re-runs `--reviews` with the remote's `risk-check.sh`, the stricter review-file checks); the clean-up LOWs left (lock dropped on TERM, non-atomic seed, `bash -c` picking another bash); retire "a `.ok` with no `gate=` counts as full"; the same `java_home -F` pattern in `gradle-job.sh` (workspace) and verify.
4. Workspace WORKFLOW "Test scope" text (App report's version plus "run verify.sh without a lockf wrapper" and "old-Mac gradle-job.sh slot jobs keep their slot locks"), `docs/lead-memory/gradle-one-at-a-time.md` and the handoff: changed by the lead when GATE-2 merges (the text goes in the lane-ready file), since today's gates still take the lock the old way.
5. Old-Mac proof run: log a `pgrep -fl "<home>/"` count before the clean-up, so real Gradle and Kotlin daemons are proven to carry the home on their command lines.

## D-33 FIX-APP-B2b builder questions — 2026-11-22 (proposed; reviewers and a Fable check judge them)
Built: App `phase/4-b2-fix-app-b2b` `a511cb24` (12 rows done, R33 and R26 partly; targeted 346/0 and 281/0; iOS 0 errors).
Proposed lead decisions (rule 2; small, reversible App calls, except 1, which is a money-account suggestion):
1. **R07 Sweden:** in BAS, 2960 is accrued interest (the same mistake QA found with 2950 in the Norwegian chart). Accrued expenses suggest **2990** in SE-pack charts and **2960** elsewhere. It is a suggestion the person can change; reviewers check it against the seeded charts.
2. **R11:** "Entered as opening items" lasting one session only is accepted for now. Making it durable needs a BackEnd link from the opening-items import to its opening-balance import, so it becomes a BackEnd fix-list row. The server must still refuse a duplicate: the reviewers check whether it does today, and if not, that is a HIGH for a BackEnd lane.
3. **R26 G19:** the App explains on the row why it cannot create account 1925 (BAS and PK group 19 is bank control accounts only; a bank account needs bank details). This means new wording in en, nb, sv and da. Whether an import may ever create a bank account is a product question for Jabran, not this lane.
4. **R20 phone:** Cost centre and Project as labelled lines on the GL card, and columns that are never dropped on wider screens. Accepted. Recorded as an "As built" note in the spec; Jabran is the design owner (JABRAN-TODO N8).
5. **Scope:** the N2 re-read in the other four editors (invoice, credit note, bill, debit note) and the screen rig's trial balance rows (`accounts-a2.jsx`) are in this lane's fix round. The short screenshot frames for the other ~45 screenshot classes go to a follow-up App row (R33b).
Fable 5.2 (high), 2026-11-22: **no REJECT.** 1 APPROVE WITH CONDITIONS, 2 APPROVE WITH CONDITIONS, 3 APPROVE, 4 APPROVE, 5 APPROVE WITH CONDITIONS.
- **1 (R07):** the numbers are right for every seeded chart (pack 2026.2): 2960 is accrued expenses in BASE, NO, DK, FI, IS and PK; in SE, 2960 is accrued interest and 2990 is other accrued expenses. All pack rows are still `UNCHECKED`, so the accountant check at go-live stays. Conditions:
  - (a) Pick the account whose own `templateRef` is the pack's 2990 (SE) or 2960.
  - (b) If that account is missing or off, suggest nothing. Today it falls back to the first ACCRUAL account: 2950 again in NO, 2910 in SE.
  - (c) A BackEnd row for a pack role (`ACCRUED_EXPENSES`, and the same for prepaid expense, which uses the same first-in-chart rule) that the App reads, before any new country pack.
- **2 (R11):** session-only is acceptable; the mark is a convenience, not the control.
  - Facts: a receivables duplicate (same customer and original number) is only the warning `POSSIBLE_DUPLICATE`, which must be acknowledged at confirm. Payables refuse only bill rows against a submitted or posted bill (`DUPLICATE_SUPPLIER_INVOICE`). `FILE_ALREADY_IMPORTED` is skipped at the confirm re-check.
  - Conditions:
    - (a) "Warn or refuse" for receivables duplicates is a written money rule (OI C-20): it goes to Jabran (JABRAN-TODO), not the lead.
    - (b) A BackEnd row with a go-live gate: a durable per-side link or a server-computed "already entered", and `FILE_ALREADY_IMPORTED` acknowledged at confirm.
    - (c) A test or simulator step: after a restart, a second hand-off shows the duplicate warning and cannot be created without ticking it. The user guide says the mark lasts one session.
- **3 (G19):** the cause is confirmed: group 19 is all `BANK` control accounts in the PK, SE and NO packs. Condition: the wording says what to do (map to an existing bank account, or add the bank account first). The product question goes in a JABRAN-TODO row.
- **4 (R20 phone):** the "As built" spec note is written, and JABRAN-TODO N8 names it.
- **5:** the four editors are money documents, so each gets its own regression test (old FAIL, new PASS), and both reviewers cover them. R33b is filed now.
Status: approved with Fable's conditions; the conditions go into the B2b fix round, together with the review findings. BackEnd rows: `ACCRUED_EXPENSES`/prepaid pack role (before a new country pack); a durable opening-items link and `FILE_ALREADY_IMPORTED` acknowledged at confirm (go-live gate). App row R33b: the short screenshot frames in the other ~45 classes.

## D-34 R29b-2 review round 1 — 2026-11-22
Reviews on `phase/4-b2-r29b-2` `beaf1b10`. Opus: FIX, 0 HIGH / 3 MEDIUM / 6 LOW; architecture 83/0, 11 user classes 62/0, org security 54/0, real-DB executed. Fable: FIX, 0 HIGH / 2 MEDIUM / 11 LOW. Both found no path to another company's users, memberships, roles or overrides. Files: `review-2-1-opus.md`, `review-2-2-fable.md`.
Lead decisions (rule 2):
1. **Franchise reach for scoped staff:** Opus says it must change; Fable would accept it with conditions. Pick: **build the bounded lookup in this lane.** An internal org-service lookup, "franchises (child companies) of these companies", keyed by the resolver-minted reach, feeds the user reach. Remove `org_id NOT IN (:reach)` from `UserOwnerLookupJdbcAdapter`. Add real-DB and resolver tests for the franchise path. Why: this meets D-25 Q1 as Jabran approved it ("companies under a scoped company by a keyed query"), so no deviation needs his decision. It also closes the exists-elsewhere oracle (timing, or 503 vs 404 during an org outage) before the pen test instead of carrying it.
2. **Fix in this lane:**
   - Opus M2: frozen method sets on the 4 catalogue reference ports.
   - Opus M3 / Fable M2: real-DB tests for the `UserPlatformAccessAudit` adapter, plus route tests for `GET /api/rbac/memberships` and `/api/admin/onboarding/invites` without `orgId`: 200 with one event, 503 when the audit fails, 403 for scoped staff.
   - Opus L1: the org parent lookup fails closed and is pinned to the resolver.
   - Opus L2: the "built only by the resolver" rule also catches constructor references, with a fixture offender.
   - Opus L3 / Fable L3: `PersonMembershipSpreadPort` takes a resolver-minted value, never a raw set, and no empty set means "anywhere". Fix the onboarding caller.
   - Opus L4: the endpoint list is completed.
   - Opus L5: the comment is corrected.
   - Opus L6 / Fable L2: an audit-failure refusal test for each catalogue use case.
   - Fable L1: the `countReferences` SQL gets its company bound.
   - Fable L5–L9 and L11 where cheap; any left go to follow-up rows.
3. `countReferences` on the company port: **accepted** (both). Add a one-line D-25 note in the builder report (its only caller deletes a company's own role; it answers 0 for a role the company does not own).
4. Rows for the next sub-lanes: `PersonAuditFanOutPort` key → R29b-4 (Fable L4); staff writes on invitations, person updates, onboarding, stand-ins and employee links not yet `PLATFORM_WRITE` → R29b-3 and R29b-4 briefs (Fable L10, Opus decision 5); `OrgScopeAccessPort` → R29b-4.
Re-check: both reviewers (both said FIX). Opus re-runs.

## D-35 FIX-APP-B2b review round 1 — 2026-11-22
Reviews on `phase/4-b2-fix-app-b2b` `a511cb24`:
- **Opus: FIX**, 1 HIGH (BackEnd), 2 MEDIUM, 6 LOW. Targeted 806/0. Old FAIL proven for R04, B2a N2, R09, R07.
- **Sonnet: FIX**, 3 MEDIUM, 5 LOW.
- Both: D-16, the control-reason codes, the new fields and all four languages are right.

Lead decisions (rule 2):
1. **Opus H1** (the server does not refuse a second receivables opening-items entry; drafts on the payables side only warn) is the BackEnd rule already put to Jabran as **N10** (Fable D-33: a written money rule, OI C-20, Jabran's call). It is not App code. It goes on a BackEnd row with a go-live gate (durable link + refusal or acknowledged warning, as Jabran decides). Lane-ready states it does not block this App lane.
2. **Fix in this lane:**
   - **Opus M1:** Cost centre and Project columns may drop on a narrow table (drop order per spec §4.3), so the ledger keeps its table down to 720 px and turns into cards only below that. The size test checks the mode (table vs cards) at 744 and 1032, not only the text. This replaces D-33 item 4's "never dropped".
   - **Opus M2 / Sonnet F2:** the R11 mark lasts for the app session (a session-scoped holder, not the route), across module and company switches. The user guide says "until you close the app". Fable condition (c): a test that a second hand-off still shows the duplicate warning, plus a simulator step after a restart.
   - **Sonnet F1:** the G19 row wording, general because `creatable=false` has more than one cause. "This account can't be created from an import. Map the row to an existing account, or create the account first (a bank account needs its bank details)." In en, nb, sv and da.
   - **Sonnet F3:** `importedAt` and `discardedAt` show in the company's local date (`formats::localDate`), with a boundary test (00:30 Oslo).
   - **Fable D-33 conditions:**
     - R07: pick by the pack `templateRef` (2990 SE, 2960 others); if it is missing or off, suggest nothing (no first-ACCRUAL fallback; covers Sonnet's 2910 LOW).
     - The N2 re-read in the invoice, credit note, bill and debit note editors, each with its own regression test.
     - The screen rig's trial balance rows.
   - **The cheap LOWs:**
     - Opus L1: a test for G41.
     - Opus L3: every field message shows, not only the reason's.
     - Opus L4: a GL account 404 drops only that account's saved filter.
     - Opus L5: the simulator steps.
     - Sonnet: the toast plural ("Approval limits were"), the stale spec lines `accounts-a2-a3.md:255, :867` and the rig label, the byAt edge.
3. **Rows:** R33b (short screenshot frames for the other ~45 classes); BackEnd `ACCRUED_EXPENSES`/prepaid pack role; BackEnd durable opening-items link (N10); BackEnd per-row reason for `creatable=false` (so the App can be specific).

Re-check: both reviewers (both said FIX). Opus re-runs.

## D-36 RISK-NARROW-1 review round 1 — 2026-11-22
Reviews (both lanes, gate format, committed in the worktrees as `2c7f65c0` App, `9d20e59a` BE):
- **App `da221f03`:** Opus FIX (2 MEDIUM, 4 LOW); Fable FIX (4 MEDIUM from the range, 1 MEDIUM not from it, 2 LOW). Runs 95/95.
- **BE `a29e0ac9`:** Opus FIX (1 MEDIUM, 1 LOW); Fable FIX (1 HIGH, 1 MEDIUM, both there before the range; 1 LOW). Runs 108/108.
- Both: nothing in the BE range makes a RISK path NORMAL; the App replay results hold.

Lead decisions (rule 2; each item is one a reviewer proposed, and the fix checks confirm it):
1. **App, keep RISK (the union of both lists):** `PaymentsHost`, `PayablesHost`, `ReceiptsHost`, `ReceivablesHost`, `RefundsHost`, `ObImportHost`, `SupplierRefundsScreen`, the Payment, Receipt and Refund editor screens, `SalesDocumentDetailScreen`, `AllocateSheet`, `WriteOffSheetScreen`, `journals/editor/JournalLineGrid.kt` with `TouchNumberKeyboardTest` and `JournalGridKeyboardTest`. They build view models with company, currency and access, or decide amounts, sides or owner actions. The new NORMAL self-test case must not pin any of them.
2. **App, unlisted deciding files (Fable 5, Opus LOW):** add `Suppliers.kt`, `Customers.kt`, `GoLiveReviewViewModel.kt`, `AdvanceDeductionPlan.kt` and `journals/route/**`. This widens the list (safe direction).
3. **Guard for narrowed folders (both MEDIUM):**
   - `risk-check.sh`: a file **added or renamed into** any folder whose folder glob this lane replaced with file names is RISK until it is listed (diff status A/R). One self-test for each case (added, renamed in, modified unlisted file stays NORMAL).
   - `verify.sh` runs the dead-glob check (`--unmatched-globs`), so a glob that matches nothing fails the gate. In both repos.
   - Opus's alternative (a buildrules jvmTest on view-model shapes) is not taken: the diff-status rule is simpler and also catches `BillEditor.kt`-style names.
4. **BE, widen now (Fable HIGH + MEDIUM, Opus MEDIUM):** add `services/*/src/main/kotlin/com/neovatus/*/delivery/**`, `services/*/src/main/kotlin/com/neovatus/*/application/port/**`, accounts `domain/**`, `infrastructure/iam/**`, `infrastructure/org/**`, `infrastructure/persistence/**`, `application/service/setup/**`, `shared/file-store/**`, `shared/domain-events/**`, plus the security test folders and `src/test/resources/fe3/**` from Fable's list. Reason: these hold endpoint permissions, wire amount parsing, company keys and crypto. Leaving them NORMAL lets a one-reviewer lane change them. The replay states how many of the last Phase 4 BE lanes would change from NORMAL to RISK. Fix `verify.md:387-389` to say what is covered.
5. **LOWs:** the WORKFLOW text says "host" correctly; BE notes that wording under the resources catch-all stays RISK; the App amount-text code in `JournalLineGrid.kt:464` is covered by item 1.
Re-check: Opus and Fable (both said FIX), Opus re-runs the self-tests and the replay.

## D-37 R29b-3U and R29b-5 briefs (trial B) — 2026-11-22
Context: R29b-2 merged (BE `phase/4` `409f45e5`, workspace `fbf3cf9`). Trial B (Jabran): R29b-3U (18 user-service
entries + R29b-2 follow-ups F1–F5, Fable N1–N3, Opus N1) and R29b-5 (4 audit + 1 auth) in parallel from `409f45e5`.
Briefs: `docs/agents/r29b/brief-3u-user-rest.md` (`r29b-3u` worktree) and `brief-5-audit-auth.md` (`r29b-5`).
Lead decisions (rule 2):
1. **F1 `PersonAuditFanOutPort` key** (D-25 left it open): a system entry keyed by "a person change that
   `UserAdminAuthorization` already allowed", pinned to `UserAdminService`, frozen; the company ids only feed the audit
   events and never reach a caller or a read (arch rule or test). Why: it widens no read; the events are what the
   companies' own audit trails need. **Fable checks this item explicitly in the R29b-3U round-1 review** (approval or
   not recorded there); if Fable does not approve, it goes to Jabran.
2. Fable N1 (limit org's `franchisesOf` to user-service's machine client) is an org change, allowed in R29b-3U because
   it is the R29b-2 wire; R29b-5 touches neither user nor org.
3. `MAX_UNCLASSIFIED`: each lane lowers it by its own count (23 → 5 and 23 → 18); the second to merge rebases, and the
   cap meets at 0. The lead deletes `docs/agents/r29b/evidence/` in a docs commit after both merge.
4. Start (amended same day): R29b-3U started when AL-REST-BE's fork builder finished and freed a BackEnd slot
   (at most 2 BE builders on this Mac); R29b-5 starts when the next BE slot frees (AL-REST-BE). Each Timeline logs its
   wait, and the L37 comparison counts R29b-5's later start as Waiting.

## D-38 RISK-NARROW-1 fix round 1 results, rebase and small follow-up — 2026-11-22
- Fix round 1 done in both lanes. App `2bb4355b`: self-tests 100/100; replay: only QA1 size fix moves RISK→NORMAL, none
  NORMAL→RISK; keep 83 / narrow 15 / drop 3. BE `bc63769c`: 118→129 globs; self-tests 110/110; replay: no Phase 4 BE
  lane moves NORMAL→RISK; R29b-1 +44 paths, FIX-BE +9, ISO-R1 +2.
- Rebased after the merges (all commits `=`, base moves touch no gate script, dead-glob check OK): App
  `phase/4-b2-risk-narrow-app-r` on `430bc5ab` (B2b), BE `phase/4-b2-risk-narrow-be-r` on `409f45e5` (R29b-2).
- Lead decisions (rule 2), so the fix checks see one final state:
  1. App item 3: the builder guards all 23 old globs (incl. the payables/receivables prefix globs and the three
     dropped folders): accepted, it is the stricter reading.
  2. App: chart, dimensions and templates view models that write company data are listed (the reason used for
     Suppliers/Customers). `SalesDocumentsList`, ageing/statement, commonTest route tests and reports view models stay
     NORMAL: display only, figures computed by the server; one-line reason each in the report.
  3. App: B2b's new `ControlReasonRules.kt` and `OpeningItemsEnteredMarks.kt` must be RISK.
  4. BE: add accounts `application/service/books/**`, `sie/**`, `obimport/**`, `journalimport/**` (Fable named them;
     they create journals and opening items). hr, payroll and audit main code wait for their rebuild (verify.md line).
- Re-check: Opus and Fable fix checks on the final heads (both said FIX); they check D-36 and D-38 items. Opus re-runs.

## D-39 AL-REST-BE review round 1 and Jabran's two money answers — 2026-11-22
Reviews on `phase/4-b2-al-rest-be-r` `c226151b` (committed `e5161f79`): **Opus FIX** (0 HIGH, 1 MEDIUM, 4 LOW;
accounts 519/0, user 28/0, arch 84/0); **Fable FIX** (0 HIGH, 1 MEDIUM, 6 LOW). Both: no path for one person to create and
decide an over-limit payment or refund; scoping, permissions, `expectedStep`, replay, races and V77 hold.
**Jabran 2026-11-22 (in chat):**
- Fable F1 (the Owner turns the Owner's-own switch back on alone): **a lone confirm only when no other person in the
  company holds `APPROVAL_LIMIT.CONFIRM`**; recorded as an Owner's-own row in the self-approval report and in the
  audit trail; written into the contract.
- Opus decision 2 (switch off on a no-limits kind stores a version): **don't change deciders**: a no-limits kind keeps
  today's approvers (branch level included); the switch only blocks the Owner deciding their own items.
Lead decisions (rule 2) for the fix round:
1. Opus M1: tests for the Owner switch on the payment and refund earlier-step endpoints and with the limits feature
   off (the three tests the review names), each old FAIL / new PASS where the guard can be removed.
2. Opus LOW: the Owner's own counts on payments as on refunds (contract §10.7 "Owner: own ones too").
3. Opus/Fable LOW: `forMe` and the summaries take the **oldest** 500 and compute the capped flag before filtering
   (Fable F4); the API table matches the code exactly (the three rows Opus names).
4. Fable F2: the V70 proposals guard covers `owner_own_allowed` (in the new migration). Fable F5 (report loses an
   Owner's-own earlier step when the draft is deleted), F7 (bank-details editor hint): fix if small, else rows.
5. Rows, not this lane: the snapshot currency next to `amount_base` and foreign-currency payment tests (multi-currency
   lane, Opus/Fable LOW + decision 5); F6 one company switch = three proposals (AL-REST-APP sends all three).
6. Rebase (old-Mac doorbell): AC418-BE merged with accounts V78, so this lane's V77 becomes **V79** with its
   migration-head tests; new branch `phase/4-b2-al-rest-be-r2` on `095a8989`; check overlaps in receivables opening
   items and tax codes. L36 addition (old Mac): before hand-back, the full suites of accounts-service and user-service
   plus `:architecture-tests`.
Re-check: both reviewers (both said FIX); Opus re-runs.

## D-40 R29b-3U and R29b-5 builder questions (proposed; Fable checks before the builders continue) — 2026-11-22
R29b-3U `2473b616`: 16 of 18 classified (cap 23 → 7), user 704/0/4, org 194/0/6, arch 84/0. R29b-5 `4cf2ee1a`: 5 of 5
(cap 23 → 18), arch 89/0, audit 104/0/6, auth 31/0.
Proposed (from D-25's own patterns):
1. **`UserRepository` rest** (a person not yet the company's): split by use, each id-only or boolean-only, frozen and
   pinned, keyed by "an action `UserAdminAuthorization` or the invite rule already allowed at a company in the
   caller's reach": (a) invite by email and add-existing-account by id return the user id only, pinned to the invite /
   add use cases; (b) the People "an account exists" check and the email-uniqueness check return a boolean only, pinned
   to those callers; (c) the security policy's target read is the D-25 owner-point (4) boolean port. No person data
   from another company is returned.
2. **`PlatformStaffRepository`:** the caller's own staff mark and platform access are caller identity (Q6 pattern); a
   staff mark of another person is boolean-only, keyed by the checked platform staff permission; the platform role
   catalogue is `@PlatformReferenceRepository` (frozen, no-write); staff-table writes are company-less staff writes
   with `PLATFORM_WRITE` in the same transaction (Q2).
3. **R29b-5 Q5 auth adapter:** not built, because auth has no platform-wide read left once the dead `inventory()` was
   deleted; the ADR-012 note says the adapter is added with the first such read.
4. D-37 item 1 (the `PersonAuditFanOutPort` key) is in the same Fable check.

## D-41 Jabran's direct-add answer, D-40 conditions, RISK-NARROW-1 fix round 2 — 2026-11-22
**Jabran 2026-11-22 (in chat), R29b-3U:** adding an existing account by user id becomes an **invitation the person
accepts**; until accepted the row opens nothing (the admin sees only what they typed: name and email).
**D-40, Fable APPROVE WITH CONDITIONS on items 1–4** (`.review-channel/evidence-d40-fable.md`). All conditions are
adopted for the R29b-3U build step:
1. `UserRepository` rest: the id-only split. The entry is frozen only once a pending or un-accepted row opens nothing,
   proven by a two-company test. No `User` return, no general `save`, the issued scope passed as a parameter, and no
   person-row read before the reach check (`UserSecurityPolicy.kt:71`).
2. `PlatformStaffRepository`: staff callers are keyed by the platform staff permission. The eleven company-side callers
   get their own boolean-only entry. Fail closed: a missing bean must never read as "not staff". Platform-role writes
   get `PLATFORM_WRITE`.
3. R29b-5: no auth adapter. The ADR-012 note says it is added with the first platform-wide read, and names what
   enforces that.
4. F1 key: a test that the ids never reach an answer or a log; fix the always-true SQL clause
   (`PersonMembershipJdbcAdapter.kt:64`); make the port required; update its KDoc.
**RISK-NARROW-1 fix checks:**
- App `24b8ee40`: Opus ACCEPT, Fable ACCEPT. Rows (not blocking): Fable N1 (`UsedForTabHolder`,
  `CalendarTabHolder`, `AccountsRoute`), the amounts parsed in wording files, commonTest rule tests, and the App
  dead-glob check with the head's script (GATE-3).
- BE `b6262c0d`: Opus FIX, Fable ACCEPT (with Fable N1/N2 open, as on `phase/4`).
  - Fix round 2 (the last one) adds user and org `infrastructure/persistence/**` (rbac, jpa/rbac, adapter/scope,
    entitlement, company), `IamPermissions.kt`, `PermissionEffectCodec`, and the accounts `ApOpeningImportSide`,
    `ArOpeningImportSide`, `DebitNoteDraftService`, `RoleMappingService`, `ChartService`, `SupplierService` and
    `CustomerService`.
  - Each gets a self-test assertion, plus a replay.
  - Re-check: Opus (it said FIX) plus a Fable re-stamp of the delta.

## D-42 R29b-5 review round 1 — 2026-11-22
**Opus** ACCEPT `7439b8f1` (after its docs LOWs), with LOW 1 as row R29b-5-F1 (pins check ports only). Audit 56/0, auth
10/0 and arch 89/0 re-run. **Fable** FIX `7439b8f1`: one text-only MEDIUM; the code holds on every focus point.
Lead decisions (rule 2):
1. Fable M1: ADR-012 §3 and D-25 Q5 get both D-40 item 3 conditions (auth adapter with the first platform-wide read;
   what enforces it).
2. Fable L2: refuse audit-service-shaped records on the machine append path (typed 4xx), with an old-FAIL/new-PASS test.
   The safe choice over "ADR says identify by producer".
3. Fable L3 (scope-all staff `?orgId=` reads unrecorded, inside D-25): row for R7 / the pen-test list.
4. R29b-5-F1: gated "before the pen test and before R7 is switched on"; extended to concrete use-case classes.
Builder follow-up (lead confirms): only `service = audit-service` (or producer `audit-service`) is refused, 400
`RESERVED_AUDIT_SOURCE`; `resource = platform-access` stays allowed because user- and org-service send their own
platform-access events on this path (refusing them would stall their outboxes). Fix head `8f77a276`.
Re-check: Fable (said FIX). Opus re-stamps and checks the L2 code delta.

## D-43 Second reviewer when Fable reaches 45 % — 2026-11-22
**Jabran 2026-11-22 (in chat):** "fable only goes to 45, other opus". Fable stops at 45 % of its weekly limit (42 % at
13:20). After that, until the weekly reset (2026-11-24 15:00 Oslo), the second reviewer on gate, money and security lanes
is a fresh, independent Opus 5.5 at high effort, given only the brief and the diff. Each lane-ready names which reviewer
was used. Fable's remaining budget goes first to the AL-REST-BE fix check and the R29b-3U round-1 review.

## D-44 Agent effort (Jabran) — 2026-11-22
**Jabran 2026-11-22 (in chat):** "stop using high efforts for opus default and fable, only security review with opus high
effort, sonnet can work with high if needed".
- Opus builders and non-security reviews run at the default effort.
- Only **security reviews** use Opus at high effort: gate, company isolation, auth and permissions.
- Fable runs at the default effort, including for decision checks.
- Sonnet may use high effort when a task needs it.
- Briefs that say "Opus 5.5, high" now mean the default, except for security reviews. Agents already running keep the
  effort they started with.

## D-45 GATE-3 approved (Jabran) — 2026-11-22
**Jabran 2026-11-22 (in chat):** GATE-3, "after what you're doing". Scope:
- the three App gate rules Fable found in GATE-2 (finding 8): non-ASCII or control-character paths are RISK; the push
  hook re-runs `--reviews` with the remote's `risk-check.sh`; review-file checks as strict as the BackEnd's;
- the App dead-glob check uses the base's script (RISK-NARROW-1 Opus LOW);
- the patch-identical rule (old-Mac proposal, ea3b7d7 item 3): a review still counts across a rebase when the reviewed
  commits are patch-identical (`git patch-id`) and the base move touches none of the lane's files.

It starts after RISK-NARROW-1 merges and the running lanes are handed back. One builder per repo (Opus, default effort).
Reviews: Opus high plus Fable, or a fresh Opus once Fable is at 45 % (D-43). The brief is written then.
GATE-3 scope from the old-Mac suggestions (`.review-channel/gate-3-suggestions.md`, c1fdfca), lead's pick:
- **In GATE-3:** 1 (check the reviews before Gradle, fail fast), 2 (name the failing tests and mark each inside or outside
  the lane), 4 (patch-identical rule), 5 (`gradle-job.sh` waits on the gate lock itself; `gate-busy.sh`), 6 (a thin
  `gradle-job.sh` wrapper in each code repo, or a clear error), 7 (`merge-lane.sh`), 8 (the hook gates every `phase/*`).
- **Not GATE-3; backlog rows:** 3 (an automatic rerun of flaky tests outside the lane: it weakens the gate, so the flake
  is fixed instead), 9 (jar start reuses built jars), 10 (`stack-down.sh`), 11 (App `sim-signin.sh`). 9–11 can be a
  small DEV-TOOLS lane later.
D-43 tightened (Jabran 2026-11-22, in chat): "currents those was running, and the fable we should not use it". The
Fable agents already running finish (the AL-REST-BE fix check); **no new Fable work** until the weekly reset, starting
now (Fable at 42 %). The second reviewer on gate, money and security lanes is a fresh, independent Opus (high effort for
security reviews), starting with R29b-3U and GATE-3.

## D-46u R29b-3U build step 2 results and Jabran's two answers — 2026-11-22
(Numbered D-46 at first; renamed D-46u because the old Mac's D-46 "Review tiers" below took that number.)
R29b-3U head `e6ac1344` classifies all 18 entries (cap 23 → 5; the 5 left are R29b-5's). Suites: user 709/0/4, org
626/0/6, arch 85/0. The 13 real-DB two-company cases ran. A pending invitation opens nothing (proven).
**Jabran 2026-11-22 (in chat):**
1. The company admin's add-by-id already refuses a non-member (404), so D-41's invitation rule already holds there.
   The org-service company-enrollment owner (platform staff create a company and name an existing account as owner, who
   is ACTIVE at once) **stays as is, audited** (`PLATFORM_WRITE`), plus a backlog / release-gates row: "owner accepts
   before go-live".
2. `iam.users.email` has no unique index (checked in code only, so a race is possible): **its own small BE lane**
   EMAIL-UNIQ-BE. It starts with a read-only duplicate check of the local data, then adds one migration (a unique index
   on `lower(email)`) with a test. It is queued after the current BE lanes.
Reviews for R29b-3U (D-43, no Fable): Opus high plus a fresh, independent Opus high, each given only the brief and the
diff.

## D-47u R29b-3U review round 1 — 2026-11-22
(Numbered D-47 at first and named so in the R29b-3U builder report and reviews; renamed because the old Mac's D-47 "Whole suite only before a phase goes to main" took that number.)
Two independent Opus reviews (high; no Fable, D-43) on `e6ac1344` (committed):
- **A:** FIX, 0 HIGH / 2 MEDIUM / 6 LOW. Re-runs: arch 85/0, real-DB two-company 13/0, user 155/0.
- **B:** FIX, 0 HIGH / 3 MEDIUM / 5 LOW.
Lead decisions (rule 2; each item a reviewer proposed or named; the fix checks confirm them):
1. **B M1 (a write into company A):** withdrawing an invitation closes the shared account only when the account has no
   other membership of any status in any company. That check is a boolean-only port keyed by the account, pinned to the
   withdraw use case. Test: a real-DB two-company case.
2. **B M2 (a scoped staff read):** platform People for scoped staff shows another company's person through a pending
   invitation only as the invitation's typed name and email, never the account's current data or last sign-in, as the
   company People list already does. Test: two companies.
3. **B M3:** the enrollment-owner add is keyed by the checked platform permission (machine client or staff), and
   `enrollmentAccountExists` uses its scope. `MembershipUseCases.createAs` has no production caller, so delete it (or
   pin and refuse it).
4. **A M1 + B LOW:** Super Admin grant and revoke run under the same advisory lock, write `PLATFORM_WRITE` in the same
   transaction, answer 503 on an audit failure, and are listed in ADR-012 §3. Test the race and the refusal.
5. **A M2:** HTTP-level tests that compile on both trees prove each answer change (F5 403→404, the company-access end,
   F4 503, the hr push 422, the added `PLATFORM_WRITE` events): old FAIL on `409f45e5`, new PASS.
6. **LOWs, all in this round:**
   - the platform-write audit is required, not optional (no silent skip); `record` asserts that a transaction is active;
   - `PlatformPersonPort.save` and the staff and role write ports are pinned by method, and the key is tied to the
     write; the adapter's public `save` and `findById` are removed;
   - the caller's own platform access checks that the user id is the token's identity;
   - refusal tests for staff add and Enter-company start;
   - the invitee adopt and create use SQL guards, and the scope they take is checked;
   - **account-existence signals:** the refusal text and code for "not found", "already a member" and "is Neovatus
     staff" are the same to a company admin, so they reveal nothing (the industry-standard no-oracle answer; Fable D-40
     condition 5);
   - the ADR-012 notes and the stale report sections are updated.
7. Before hand-back: the full user-service and org-service suites plus `:architecture-tests`.
Re-check: both reviewers (both said FIX). Reviewer A re-runs the tests. This is fix round 1 of at most 2.

## D-46 Review tiers instead of a second reviewer on every money/security lane — 2026-11-22 (old-Mac lead, Jabran approved in chat)
**Jabran 2026-11-22:** "let go with your recommendation, but 2nd review based on the severity, not all time". Data: 25 review runs on four lanes today, 8 first reviews, 17 repeats (68%); all findings came from first reviews; the second reviewer found the AC418-BE HIGH and the R29b-5 MEDIUM. Rule in WORKFLOW "Review tiers": tier 2 (two reviewers, round 1 only) for books/isolation/auth/gate/large changes; tier 1 (one Opus, high on risk paths) for the rest; simulator check for App screens; no Sonnet second review; only the FIX reviewer re-checks; no re-stamp for clean rebases. **GATE-3 additions:** a `Review tier:` line the gate reads (one file allowed for tier 1), and keeping the other reviewer's stamp when later commits were reviewed by the first and touch none of its angle.

GATE-3 scope additions (D-45, from the old-Mac inbox item "D-46 review tiers"):
- (a) The gate reads the lane's `Review tier:` line and accepts one review file for tier 1.
- (b) It keeps the other reviewer's older stamp when the first reviewer reviewed (ACCEPT) every later commit and none
  of them touches the other reviewer's angle.
Together with item 4 (patch-identical rebase) these teach the gate the D-46 review tiers. Until then, RISK-flagged
lanes carry two gate-format files; AL-REST-APP keeps its running Sonnet seat for that reason.

## D-48 AL-REST-APP review round 1 and Jabran's three design answers — 2026-11-22
Reviews on `bb2aa051` (committed `b1b7560d`):
- **Opus:** FIX, 2 MEDIUM and 4 LOW; re-ran 52 tests, 0 failed.
- **Sonnet:** FIX, 2 MEDIUM and 8 LOW.
- Both: amounts, dates, the four languages, the approve flow, `expectedStep`, the three proposals and the
  `NeoApprovalSteps` API hold.
**Jabran 2026-11-22 (in chat):**
1. Keep the label "Owner's decisions" and add the date filter in this round.
2. The "1 of 2 approved" tag shows on payments and refunds too, on its own line on narrow phones (spec §4.6).
3. Follow the spec: wire "Why 2 approvals?" on payments and refunds, and move the stand-in count out of the badge
   tooltip into the Waiting-for-you list header (§4.7 tooltip unchanged).
Fix round 1, every item:
- `OWNER_OWN_NOT_ALLOWED` gets words on one-step (Standard) items, on journal, payment and refund detail and on the
  editor's "Post my own journal". This is the MEDIUM both reviewers found.
- An unclear payment or refund step matches by `byUserId`, as journals do (Opus M2).
- Report rows:
  - The Item column gets words for Owner-switch rows instead of raw `JOURNAL v4` (Sonnet M2).
  - Each kind has its own name, not "Other document".
  - Amounts show their currency.
  - The Reason column is never cut.
- Kind names are lower case mid-sentence; the spec §4.5/§9 wording returns (with the step number); the Owner's own
  list row keeps its "post it as Owner" note.
- Thin refund tests: `expectedStep` on the last step, a raced step, an unclear step and an Owner's own step. APP-7 is
  tested on its real editor-draft path.
- The CSV number and date format: check the BackEnd CSV, and say what it is in the report.
Re-check (WORKFLOW review tiers, D-46): each reviewer re-checks only its own findings. Opus re-runs the tests.

## D-47 Whole suite only before a phase goes to main — 2026-11-22 (Jabran in chat)
**Jabran:** "whole suite only when full phase to merge to main; before merging to main, update it from main so we have all code". Rule in WORKFLOW "Gate scope": lane merges use the scoped gate (changed modules + dependents + architecture + money invariants); phase → main merges `main` into the phase first, then runs the whole suite. TEST-SCOPE-1 (new Mac) delivers the scoped gate; until then lane gates stay full.

## D-49 Who tests what: no reviewer re-runs; builder runs the gate's scope — 2026-11-22 (old-Mac lead; Jabran approved 1 and 3 in chat)
Each change is tested once by its builder and once in combination by the gate. Reviewers stop re-running the builder's tests (they test only to prove a finding). Builders keep the full suites of touched services + architecture tests (insurance: a gate failure costs ~40–60 min; AC418-BE and B2b gate failures today came from tests outside the targeted set); after TEST-SCOPE-1 they run exactly the gate's scoped set. Gate scoped per lane (D-47). No stack/simulator on the test Mac while a gate runs. WORKFLOW "Who tests what".

## D-50 EMAIL-UNIQ-BE review round 1 — 2026-11-22
Opus (tier 1, high) on `bbca0748`: FIX, 1 MEDIUM and 3 LOW. V50, the partial index, the mapping and the invitations
hold.
Lead picks (rule 2):
1. **M1, option (a):** when two creates race for the same email they reuse the same provisioned identity id. The loser's
   `users_pkey` / `uq_users_idp_subject` collision now answers the same 409 "email taken", and a same-id race test
   proves it. Only those named constraints map; any other violation stays a 500.
2. **LOW 2:** the db-design duplicate query adds `AND btrim(email) <> ''`.
3. **LOW 3:** `findByEmailIgnoreCase` matches what the index sees (`lower(btrim(email))`), so an invite for a stored row
   with spaces finds the account instead of a 409. A test covers it.
Re-check: the same Opus, on its findings only (D-46).

## D-51 Speed rules: batch, flow test before review, brief check, check-first-don't-repeat — 2026-11-22 (Jabran in chat)
Jabran approved the three process changes (bigger lanes merged in batches; simulator/flow test before review; Opus brief check before building) and added: "we must be smart, so we don't repeat; test only when needed, and ask each other, leads or sub-agents". WORKFLOW "Speed rules". Measured on the first Phase 4b and HR lanes against the Phase 4 MEASURE-1 baseline (build 28 %, review+fix 42 %, gate 19 %, waiting 12 %; 17 of 25 review runs repeats on 2026-11-22).

## D-53 One phase test plan, owned by the old-Mac lead — 2026-11-22 (Jabran in chat)
Jabran: "one lead fully decides and plans where to test for the full phase; I might review; both follow in sequence". Owner: the old-Mac lead (test + integration Mac). First plan: `.review-channel/phase4-plan.md` (test points T1–T5, merge batches A/B, flow session, fix batch, phase gate, budgets). WORKFLOW Speed rules item 6.

Addendum (Jabran 2026-11-22): the plan covers the whole flow, not only tests: lanes, builders, branches and bases, order, tiers, batches, test points. File renamed `.review-channel/phase4-plan.md`.

## D-55 Phase 4 plan efficiency changes + phase review feeds the next plan — 2026-11-22 (Jabran approved)
1 GATE-3 rebase piece first; 2 two parallel testers by company in T4; 3 stream fixes from T4; 4 final BE + App gates in parallel; 5 old Mac uses gaps for non-Gradle work. Each phase ends with a one-page plan review whose changes go into the next phase plan. `.review-channel/phase4-plan.md` "Efficiency changes".

## D-57 Lanes and fixes by feature — 2026-11-22 (Jabran: "yes, if that is efficient")
Feature work as vertical lanes (one roadmap item = BE lane + App lane, one end-to-end flow test); fixes grouped by feature, not by QA round (small features joined; ≤ 3 retest fix lanes per repo); cross-cutting lanes separate and small. Why: QA-list fix lanes (B2a/B2b) mixed 5–6 features, which widened reviews and flow tests. `.review-channel/phase4-plan.md` "Lanes by feature".

## D-59 HR H1 open questions — 2026-11-22
**Jabran (in chat, "Yes, all three"):** OQ-4 (a) no End employment / HR-officer job-change request in H1 (H4 owns them; actions hidden); OQ-6 (a) ESS bank-account request fails closed in H1, the `auth_time` sign-in change is its own lane for his approval; OQ-A3 (a) hide Time/Leave/Pay tabs and cards until each area ships.
**Lead (recommendations, industry practice):** OQ-1 (a) narrow internal cost-centre read in accounts-service in BE-1 (lead checks no Phase 4/4b lane touches those files); OQ-2 (a) `shared/field-cipher` now, Accounts moves later in its own tier-2 lane with a compatibility test; OQ-3 (a) internal audit read by company + service + subject in BE-2; OQ-5 (a) payroll column grants in P0's first migration; OQ-7 (a) sensitive facts block with P1; OQ-A1 (a) reuse `features.hr`/`features.ess`, rule refuses v1 names; OQ-A2 (a) build missing components with their first screen; OQ-A4 (a) each App slice starts at its BE slice's lane-ready, merges after it.
**D-59 addendum (after the brief check):** Jabran: OQ-9 (a) attachments in H1 (optional document on HR bank changes and ESS change requests, 24 h purge of unlinked uploads); OQ-11 (a) non-bank pay-details fields are direct sensitive edits with reason and audit; only the bank account waits for a second person. Lead: OQ-8 (a) server derives job-change `kind`; OQ-10 (a) directory status Active · Ended · All; OQ-12 (a) probation and contract end on Overview.

## D-52 GATE-3a review round 1 — 2026-11-22
Two Opus seats (high; D-43):
- **BE `4621e84a`:** seat 1 FIX (1 MEDIUM parity, 2 LOW); seat 2 ACCEPT (7 LOW).
- **App `caeb1a60`:** seat 1 FIX (MEDIUM parity, 4 LOW); seat 2 FIX (**MEDIUM 1, a real bypass**: `commit_of` reads refs
  before short SHAs and `Range:` takes any name, so a fetched tag named like the short SHA can point at a forged chain
  that is patch-identical and passes; MEDIUM 2 parity; 6 LOW).
Lead decisions (rule 2), applied in both repos so the scripts match:
1. **The carry path takes full 40-hex SHAs only**, for both `Reviewed:` and `Range:`, resolved with
   `^{commit}`-checked object IDs and never as ref names. Port BE's `sha_of_text` and the `Range` regex to the App. Set
   `GIT_NO_REPLACE_OBJECTS=1` for the gate.
2. **Fail closed:** `set -o pipefail` in the carry code. An empty patch-id, an empty commit list or an empty lane-path
   list refuses the carry.
3. **One wording, using BE's:** the same messages, the same self-test names and the same five-condition list in both
   `verify.md` files. Correct App `verify.md:416`.
4. **App:**
   - a NUL-safe tail check (`-z`), so a path with a newline can't pass as a review file;
   - case folding in condition 3, as BE does;
   - an explicit check that the base is an ancestor of the head;
   - the after-NORMAL run on the carry branch.
5. **BE:** `patch-id` with `--root --no-color` (as the App has it).
6. **New self-tests in both repos:** merge refusal, base not an ancestor of head, no commits, mode-bit change, short
   SHA refused, tag or ref name refused, empty patch-id refused. Each must fail on the round-1 head.
7. **Rows, not this lane:**
   - the App hook re-running `--reviews` with the remote copy (GATE-3 G2);
   - rule 3 being path-only, so a semantic merge break can pass (by design; GATE-3a only skips re-stamps, while
     builders and the gate still run the tests);
   - `$range` resolved twice (pre-existing, fails closed).
Re-check: both seats, on their own findings.

## D-61 Accounts independent on the new Mac (trial from Phase 4b) — 2026-11-22 (Jabran: "yes, let's try this and see how it works")
From Accounts 4b (after the Phase 4 PR): the **new-Mac lead** runs Accounts end to end from the phase plan the old-Mac lead writes and Jabran reviews: briefs, builders, reviewers, **its own scoped gates and fast-forward merges into the Accounts phase branch** (one gate at a time, no builder during a gate; 16 GB). It asks the old Mac only for: simulator/flow sessions (batched per Accounts feature, scheduled in the plan, run on the old Mac's 36 GB), changes to shared code (shared libraries, user/org/auth services, gate scripts, migrations others depend on), decisions, and the phase → `main` merge. The **old-Mac lead** runs HR & Payroll end to end, the simulator sessions for both, and every phase → `main` merge (merge `main` in, whole suite, MERGE verdict).
**Measured** (MEASURE-1, per lane): new-Mac gate minutes and swap use, queue waiting for simulator slots, cross-module conflicts found at phase → `main`. **Check-in after the first 4b batch** (2–3 lanes): keep, shift more to the new Mac (e.g. small simulator checks), or shift back.
**D-61 addendum (shared platform lanes in 4b):** PLAT-A/B/C and RT-3 are shared platform code (they serve HR too). The new Mac builds them; the old Mac provides the second review seat (a fresh Opus started on the old Mac, brief + diff only) and gates and merges them as integrator. Accounts-only 4b lanes (DIM-RULES, SPREAD, ALC, BUD) the new Mac gates and merges itself.

## D-63 Principles first, measure cost and first-pass, prune rules — 2026-11-22 (Jabran: "Yes", after the self-improving-agents tips)
`docs/PRINCIPLES.md` (8 principles, one page) is read first and linked from every brief; WORKFLOW rules become examples of them. MEASURE-1 adds cost per lane and first-pass gate. Each phase review marks every rule added in the phase keep / change / drop and removes dropped ones.

## D-65 Fewer sub-agents where a hand-off costs more than it gives (trial from 4b / HR H1) — 2026-11-22 (Jabran: "if it makes us efficient for development and limits")
After Anthropic's "single agent vs subagents" guidance. **Keep sub-agents** for reviewers (independence: brief + diff only), builders (large context) and parallel testers. **Fold:** (1) fix rounds **resume the same builder** (SendMessage) instead of a new one; (2) small planning tasks (merging step lists, verdicts, plan edits, ≤ 3 files to read) are done by the lead directly; (3) re-stamps after clean rebases go away with GATE-3a. Measured with D-63 (cost per lane, first-pass gate); a fold whose numbers get worse is undone at the phase review.

## D-67 Agents report brief gaps in every hand-back — 2026-11-22 (Jabran: "Yes add")
Closes the "easy feedback" tip: every builder, reviewer and tester hand-back ends with "Brief: unclear or missing — …" or "none". Leads log them per lane (Timeline) and, at the phase review, fix the brief template and the brief check for gaps that repeat.

## D-69 Automate what repeats; simulator for first looks and real-device behaviour — 2026-11-22 (Jabran: "yes")
Every simulator FAIL becomes an automated test in its fix lane; every feature lane ships a Compose UI test for its main flow; simulator sessions keep only first looks, device behaviour, wording and feel (covered steps dropped, backend-only steps via API); end-to-end trial (e.g. Maestro) for the main money flows after Phase 4, spike first, in the 4b plan. WORKFLOW "Automate what repeats", PRINCIPLES 4.

## D-54 T4 fix lanes start before the weekly reset (Jabran) — 2026-11-22
Weekly usage reached 90 % (the stop line) at 18:40. **Jabran (in chat): "Start fixes now".**
- The T4 retest fix lanes start as failures arrive: by feature, at most 3 per repo (D-57), each with a reproducing
  automated test first (D-69).
- Each lane gets one builder and one review at default effort; tier 2 only where the fix touches books or isolation.
- Nothing else new starts before Mon 2026-11-24 15:00, including GATE-3, TEST-SCOPE-1, DOCS-2c and 4b.

## D-71 Usage at 90 %: Phase 4 fix lanes only, until the reset — 2026-11-22 ~19:00 (Jabran: "Start fixes now", on the new Mac)
Weekly all-models usage 90 % (reset **Tue 24 Nov 15:00**, not Monday). Exception to the 90 % "start nothing new" rule: the T4 fix lanes start as FAILs arrive (≤ 3 per repo, one builder + one review each, default effort, reproducing test first). Nothing else new before the reset (no HR H1, no 4b, no other reviews). At 92 % both Macs finish the current step, write handoffs and stop. The running T4 testers (Sonnet) finish.

## D-56 Full plan usage allowed; replaces the 90 % / 92 % stop (D-71 widened) — 2026-11-22 ~19:20 (Jabran, on the new Mac: "i think we can use full usage in as that my pernsonal subscrption")
- The plan is Jabran's own subscription, so both Macs may use it fully (weekly and 5-hour).
- Jabran, follow-up: "at lteast 99% should be used". New work may start until **99 %**. At **99 %** both Macs start nothing new, finish the current step, write handoffs and stop (the handoff fits in the last 1 %).
- So the D-71 hold ends: the queue resumes now — T4 fix lanes first, then GATE-3 remainder, TEST-SCOPE-1, DOCS-2c; 4b after Jabran reviews `phase4b-plan.md`.
- Unchanged: effort rules (D-44), review tiers (D-46), no new Fable (D-43), one Gradle job per repo lock.

## D-58 T4 OBS-2: the Excel template comes as .xlsx — 2026-11-22 ~19:40 (Jabran, chat: "Excel gets .xlsx")
- The spec (`accounts-ob-import.md` §2.1) said the template is always CSV, so OBS-2 matched the spec. Jabran chose: when Excel is chosen, the template is `.xlsx` with the same columns.
- So OB-IMPORT becomes a pair: `phase/4-b2-fix-ob-import-be` (new `template.xlsx`, reusing `XlsxExportWriter`) and `phase/4-b2-fix-ob-import-app` (the template follows the format, plus the G6 "Held out offers re-entry" check). Tier 1 each; reproducing test first (D-69). The briefs are in each worktree under `docs/agents/t4-fix-ob-import/`. A fresh Opus checks the briefs first (D-51).

## D-60 TEST-SCOPE-1 flows = Gradle flow tests only — 2026-11-22 ~20:00 (Jabran, chat: "Gradle flow tests only (Recommended)")
"Flow" in Jabran's "target & affected services & flow" means the flow and integration tests inside each affected Gradle module. The `*-acceptance.sh` stack scripts are not added to the scoped gate; they stay at phase → main and the T sessions. The brief check's 11 other corrections are the lead's (brief "Lead corrections").

## D-73 Seam tests: strict fakes, contract tests, four-language size tests — 2026-11-22 (Jabran: "yes, if it adds value and reduces time")
Today's 4 escaped bugs were all seam bugs (wrong data across a flow, role path, release flag, file type); money rules are well covered by unit/integration tests. Add, don't swap: (1) **STRICT-FAKES-APP** lane first in 4b (the App's shared fake backend validates like the real API); (2) **contract tests** per new/changed endpoint in every 4b and HR brief; (3) **four-language size tests** (en, nb, sv, da) for every new/changed screen. Each prevents a bug class that cost a fix lane + gate + retest (~2–4 h per bug).

## D-75 Simulator personas + accessibility pass; AXe in the E2E spike — 2026-11-22 (Jabran: "yes add")
From the open-source "mobile-agent-testers" template: tester sessions use personas (device × language × text size × dark mode) and an accessibility check per screen; AXe is trialled beside Maestro in the 4b E2E spike (must see Compose Multiplatform iOS screens); run locally, no GitHub Actions. WORKFLOW rule; `phase4b-plan.md`; T4 short retest.

## D-62 TEST-SCOPE-1: the bar for the cross-module read scan — 2026-11-22 ~22:45 (lead; both seats asked in round 2)
- The scan must catch **every natural code form** of a read outside the project's own folder, and anything unsure is FULL:
  - relative and absolute paths, walk-ups, `user.dir` and `PWD`, NIO `resolveSibling`, `Path.of(".")` and `Paths.get(".")`;
  - bare literals naming another project's folder or a repo-root folder;
  - reads in files outside `src/`, and non-text files.
- **Files that hold a `KNOWN_READS` line or an allowed build line are pinned by blob sha.** Any change to such a file is FULL until the table is updated (a reviewed gate change).
- **Deliberate evasion is out of scope** for the scan: hand-split strings, building names from parts. The guards for that are the two reviews every gate and test change gets, `:architecture-tests` on every range, and the whole suite at phase → main. `verify.md` states this limit.
- The same bar applies to the App lane's import scan.

## D-64 T4 R-AL: AL-P6, P7 and O3 are by design; SR-L4 applies to every proposal — 2026-11-22 ~23:10 (Jabran, chat: "Same rule for all")
- **AL-P6/P7:** AL-6 `KEEP_LATER_STEP`. Kystgruppe has 3 payment approvers, so Kari acting for Ola at step 2 would leave nobody for step 3. Ola does step 2 directly.
- **AL-O3:** SR-L4. The proposer can't confirm, and the named person and their stand-in in force can't confirm either. The ways out: end the stand-in, a 4th CONFIRM holder, withdraw, or the 14-day expiry.
- **Jabran:** a switch-only proposal also follows SR-L4. There is no exemption.
- No fix lane. The old Mac fixes the T4 plan's expected lines.
- **Rows for after Phase 4** (both repos):
  - the KEEP_LATER words name the person when acting as a stand-in;
  - `canConfirm` on every proposal view, plus a "nobody can confirm" message with the ways out for a non-Owner proposer.

## D-77 GATE-3 remainder is its own phase, between the workflow review and the parallel streams — 2026-11-24 (Jabran)
"Move it to the next phase, and we'll see its own phase before doing the parallel." GATE-3's remainder (bash gate/hook scripts; developer tooling, not shipped) leaves Phase 4. Order: Phase 4 → `main` → workflow review → GATE-3 phase (own branch from `main`, merged back) → 4b + HR in parallel from a `main` with the finished gate. Includes porting the BE gate-v3 dispatcher to the App (the App still reads each worktree's own `.githooks/pre-push`).

## D-79 Phase and process reviews are independent too — 2026-11-24 (Jabran: "it should be independent review, as an independent review finds more")
Every phase review (and the workflow review) gets an **independent** reviewer: a fresh Opus that reads only the raw sources (verdicts, ledger, escaped defects, decisions, review files), never the lead's draft or conclusions, and makes its own calls (top problems, keep/change/drop per rule, what the author is likely to miss). The lead compares both; every disagreement goes to Jabran. Same hooks on both Macs (Jabran): each lead installs from the `phase/<N>` tip in its own checkout.

## D-81 Workflow v2 direction — 2026-11-24 (Jabran, workflow review)
Jabran: "a lot of review is unnecessary and multiple; our briefs and builders are not efficient, reviewers and testers find findings all the time; we have made it complex."
- **Branches:** `main` → one branch per module phase (`accounts/phase-<x>`, `hr/phase-<x>`). Work goes straight into the phase branch when one builder works per repo; batch branches (`<module>/<x>-<batch>`) only for parallel work, deleted at merge. Phase complete → whole-phase review (by feature, BE + App together, like the Phase 4 seam reviews) → fixes → whole suite → PR to `main` (merge commit).
- **Batch = the unit:** one feature part, both repos, full flow: brief → builder discovery + plan → plan check → build (BE first, then App) → tests → flow test → one review of the batch (BE + App together) → fix → merge into the phase.
- **Brief = a frame, not a fence:** goal, principles, rules, checklist, Definition of Done, links to the project standards; "not a limit" clause: follow the standards, reuse, no duplication, no departure from the architecture; the standard wins over the brief.
- **Every agent owns the flow** (builder, reviewer, tester): looks end to end, decides within the standards, records "decisions I took" and "found outside the brief"; money rules, product scope and the BE↔App contract go to the lead.
- **Discovery is the builder's first step** (same agent builds and fixes); the lead writes the brief and checks the plan.
- **Definition of Done incl. tests for all cases**, not only success: refusals, edge values, rights/company, repeats/races, contract (missing/empty fields), screens (UI flow, sizes in en/nb/sv/da); a test table first; a missing case is a finding.
- **Review:** own end-to-end pass first, then a verdict on each builder decision; checks the test table.
- **Builders read both repos, write only their own** (changes the 2026-11-10 rule's read side; write side unchanged).
Draft: `docs/process/workflow-v2-draft.md` + `docs/templates/`. Replaces WORKFLOW.md after the independent check and Jabran's approval. Phase 4 merged to `main` the same day; seam findings = the first phase run this way (SEAM-FIX).
- **Addendum (Jabran, same day):** (1) branches `<module>/<feature>` (simple, one PR) or `<module>/<feature>/feature` + `<module>/<feature>/<flow>` (split); cross-module work is owned by the module whose user flow it delivers, shared work under `core/`. (2) Fixes after a review or test go to **one fixer per repo** (the builder, resumed), not one agent per finding or flow. (3) **One reviewer: Fable at high effort** for books, money, isolation, auth and gate work ("only one fable with high is enough"); Opus otherwise. This replaces the second, different reviewer of the 2026-11-20 guardrails and D-46 tier 2.
- **Addendum 2 (Jabran, same day):** Phase 4 findings are fixed directly (light v2: no brief check, no plan stop); the full v2 trial runs on the first real features. **No hooks for feature branches** ("why we need that, when we already have done the testing?"): `main` stays hook-protected, the lead gates every merge, the whole suite runs before every PR to `main`; `core/gate-branches` and the GATE-3 hook work are dropped; the leftover-branch check is a line on the lead's close checklist.
- **Addendum 3 (Jabran, same day, speed):** builders and fixers run only the tests they wrote or changed plus a compile; the lead's gate runs scoped before each merge and the whole suite once before `main`. (Today two fixers lost ~65 min to full runs.)
