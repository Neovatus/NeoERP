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
Fable 5.2 (medium): pending
Status: pending (critical: money reporting → Jabran with Fable's view)

## D-17 FIX-BE R19 "Ends after N times" and skipped runs — 2026-11-21
Question: C-17 (S3a review M2/M3) counts every settled run, SKIPPED_* and DISMISSED included, in maxOccurrences; QA (R19) says skipped dates should not count.
Options: (a) keep the count; a template with unresolved skipped runs stays ACTIVE until they are resolved (like WAITING_FISCAL_YEAR and FAILED), so it never shows Ended while it needs the user and N never overshoots; (b) skipped and dismissed runs stop counting (N means N journals; the schedule runs past skipped months) — a contract change.
Pick: (a).
Why: keeps the approved contract and its review findings; fixes the real problem (an ended template hiding work that needs the user); (b) can post more journals than the user set.
Sources: App spec `accounts-a4.md` C-17; BE `domain/recurring`; QA `A7.md`, `G23.md`.
Fable 5.2 (medium): pending
Status: pending

## D-18 FIX-BE R29 classifying the 60 unscoped repositories — 2026-11-21
Question: About 24 of the 60 are SYSTEM (outboxes, queues, IdP and session ports, identity, platform authority/staff, AuthzQueryRepository) and the three annotations cannot express that; user, audit and auth have no CompanyTenantScope resolver; about 15 mix per-company and cross-company methods (Membership, Role/RolePermission/RoleVersion, OnboardingInvite, OrgRequest, Company, Branch, Warehouse, audit query with null orgId), incl. person-facing cross-company reads with orgId null.
Options: (a) in this lane add a RATCHET_SYSTEM_ALLOWLIST (class → reason, allowed packages, like SYSTEM_ALLOWLIST), move the clearly SYSTEM ones there (~24 off the baseline, cap ~60 → ~36); the method splits and the user-service scope resolver become their own lane R29b, before RLS; (b) do all 60 in this lane.
Pick: (a).
Why: the system ones are mechanical and shrink the baseline now; the splits change service APIs and person-facing reads (security design), which need their own brief and reviews; R29's deadline (empty before RLS / first customer) is kept by R29b.
Sources: BE `architecture-tests` (FrozenTenantBaselines, tenant-classification-baseline.txt, SYSTEM_ALLOWLIST); ISO-R1 bind allowlists (`shared/tenant-security`); fix-list R29; ADR-026 D2, D4.
Fable 5.2 (medium): pending
Status: pending (critical: security → Jabran with Fable's view)
