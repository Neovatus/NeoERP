# Dimension rules: flow 2 (post-with-rules) simulator results

- **Devices:** iPad Pro 13-inch (M5) `5AB86CDD-21F1-45AB-A677-66079974BE1F` (en); iPhone 18 Pro `45AD3FD4-4FF6-4EF3-A68B-F044AC85C269` (nb for step 6, then back to "Device language" = English)
- **Commits:** App 12b40271 (debug, worktree `NeoERP-worktrees/sim-dr-app`), BE `accounts/dimension-rules` 1d3c6fc5
- **Time:** 2026-11-25 00:37–00:57 CET
- **Driver:** AXe 2.1.1 (`describe-ui`, `tap`, `type`, `key`, `swipe`); screenshots from `xcrun simctl io`
- **User:** Ola Nordmann, Owner, Kystgruppe Nordic
- **Shots:** `.review-channel/dr-flow2-shots/`

## Steps

| Step | Device | Result | What I saw | Shot |
|---|---|---|---|---|
| 1 Journal: 6750 Dr 1000 with no cost centre, 1920 Cr 1000 | iPad | PASS | Line 1 cost-centre cell reads "Required on this account" (AX value is the same); Submit is enabled once the memo, document reference and document date are filled in. The hint is cut off in the 164 pt cell ("Required on this a…"), see F6. | 01-ipad-hint.png |
| 2 Submit without a cost centre | iPad | PASS | Line 1 cost-centre cell gets the red danger border, and the footer reads "Line 1 needs a cost centre." Nothing is posted. Submit first saved the draft (JV-DRAFT-000042). The cell now reads "Default · No cost centre" (the hint is gone), see F5. | 02-ipad-submit-blocked.png |
| 3 Pick OSL-OPS, Submit | iPad | PASS | The footer message clears as soon as a cost centre is picked. Submit works: JV-DRAFT-000042 shows under "Waiting to post" (5→6) with status "You wrote it". | 03a-ipad-cc-picked.png, 03b-ipad-waiting.png |
| 4 Bill: 6750, no cost centre, Fjord Energi, Submit | iPad | PASS | Before Submit, "Required on this account" shows under the line. After Submit, a red banner reads "Draft BILL-DRAFT-000043 saved. Line 1 needs a cost centre." Not sent for approval. | 04a-ipad-bill-before.png, 04b-ipad-bill-refused.png |
| 5a Write-off: prefill from an invoice whose lines share a cost centre | iPad | BLOCKED-DATA | Open invoices INV-2026-000001, -2, -4 and -5 all open the write-off with Cost centre "None". INV-3 is fully credited. The posted journal SI-2026-000005 has no cost-centre column, so the seeded invoice lines carry no cost centre. To unblock: one approved invoice whose lines share one cost centre. | 05a-ipad-writeoff-before.png |
| 5b Write-off rest: refusal, pick, post | iPad | PASS | INV-2026-000005, amount 100,00. "Required on this account" shows under Cost centre. Submit with no cost centre: "Line 1 needs a cost centre." under the field (wording, see F4). Picked BRG-OPS, submitted (WO-DRAFT-000044), then used Approve my own write-off, which posted WO-2026-000002. Journal line 2 is 7830 Tap på fordringer 86,96 with cost centre BRG-OPS Bergen operations. | 05b-ipad-writeoff-nocc.png, 05c-ipad-writeoff-submitted.png, 05d-ipad-writeoff-journal.png |
| 6 Steps 1–2 in nb | iPhone | FAIL | The hint "Påkrevd på denne kontoen" shows in full, not cut. After "Send inn for bokføring", JV-DRAFT-000045 is saved, but line 1's Kostnadssted field has **no danger border** and no error text (F1). "Linje 1 må ha kostnadssted." is only in the totals block at the end of the scrolling page, so nothing changes on screen where you tapped Submit (F2). | 06a-iphone-nb-hint.png, 06b-iphone-nb-refused.png, 06c-iphone-nb-line1-border.png, 06d-iphone-nb-footer-msg.png |
| 7 Accessibility: journal grid and write-off dialog | iPad + iPhone | FAIL (LOW items) | iPad grid: good labels ("Line 1 cost centre"), ids `journal.line.N.cc`, targets 48 pt, and unavailable cells read "…not available. This account isn't tagged by cost centre." Gaps: F3, F7, F8, F9. | AX dumps (text) |

## Findings

| # | Severity | Validity | Screen | What vs expected | Steps |
|---|---|---|---|---|---|
| F1 | MEDIUM | CONFIRMED (shot 06c + code) | Journal editor, phone cards | After a Required refusal the line card's cost-centre field gets no danger border and no error text. Expected the same mark as the iPad grid cell. Cause: `JournalLineGrid.kt:647` sets `error = if (compact) cell.refused… else null`, and the cards call `CostCentreCell(..., compact = false)` (`JournalLineGrid.kt:824`). The comment at :646 says "Cards (compact)", but cards are not compact, so the refusal is only drawn in the grid. | iPhone › Journals › New › line 1 6750 Dr 1000, line 2 1920 Cr 1000 › Submit |
| F2 | MEDIUM | CONFIRMED (shots 06b, 06d) | Journal editor, phone | The refusal sentence sits in the totals block at the end of the scroll (`journal.requiredRefusal` at y≈1002 while the viewport ends at 874). The sticky action bar only holds Cancel / … / Submit. With F1, the user taps Submit and sees nothing change. Expected: the "footer" message visible after Submit. | Same as F1; look at the screen right after Submit, then scroll to the bottom |
| F3 | LOW | CONFIRMED (AX dump) | Journal grid, iPad | The refused cell exposes no error to VoiceOver: AX value is "Default · No cost centre", and the red border is visual only. Expected the refusal ("Line 1 needs a cost centre.") in the cell's value or hint. | iPad step 2, then `describe-ui` on `journal.line.1.cc` |
| F4 | LOW | CONFIRMED (shot 05b) | Write-off dialog | The refusal reads "Line 1 needs a cost centre." The write-off dialog shows no lines, only one Cost centre field. Expected wording without "Line 1", e.g. "Choose a cost centre: required on the bad-debts account." | Invoice › Write off… › Submit with Cost centre None |
| F5 | QUESTION | CONFIRMED (shots 01 vs 02) | Journal grid / cards | After the refusal the cell's hint "Required on this account" is replaced by "Default · No cost centre" (`JournalEditorRules.kt:656-657`: the refused branch drops `requiredHint`). In the grid only the border is left, and on the phone nothing is left (F1). Is losing the hint by design? | Step 1, then step 2 |
| F6 | LOW | CONFIRMED (shot 01) | Journal grid, iPad 13" | The hint is cut off: "Required on this a…" in the 164 pt cost-centre column ("Not tagged by cost c…" too). Expected readable text (brief: no cut text). | Step 1 on iPad |
| F7 | LOW | CONFIRMED (AX dump) | Journal cards, iPhone | Card fields have no line number in their labels: two "Konto" buttons, two "Kostnadssted" buttons. The amount field's label is empty, and its placeholder "0,00" serves as the label. The grid's labels say "Line 1 …". Cause: same `compact` switch, `JournalLineGrid.kt:626`. | iPhone journal with 2 lines, `describe-ui` |
| F8 | LOW | CONFIRMED (AX dump) | Journal cards; journal list; write-off approve | Selected state is not exposed. Debet/Kredit segments have value '' for both. The list filter chips ("Waiting to post", "Only mine to post") have value '' when on. The "I am approving my own write-off…" checkbox has value '' whether ticked or not. | `describe-ui` before and after tapping |
| F9 | LOW | CONFIRMED (AX dump) | Write-off dialog | The Amount field has no label and no id (`AXTextArea '' '6 900,00'`). The Why field has no label (id `writeoff.reason`). The dimension selects get ids built from the visible label (`neoSelect.Cost centre`, with a space), which will change per language (the language part is PLAUSIBLE, not run in nb). Expected stable ids like `writeoff.amount` / `writeoff.dim.costCentreId.select`. | Invoice › Write off…, `describe-ui` |

## Seen around the steps

- The submit gates came in order: memo, then document reference, then document date. Each needed filling before Submit was enabled. The hint showed throughout.
- After step 3, the journal list switched itself to "Waiting to post" + "Only mine to post · 5", which hides your own journals. I had to clear "Only mine" to find JV-DRAFT-000042. This is probably by design (you can't post your own).
- The draft write-off page (WO-DRAFT-000044) does not show the chosen cost centre. You only see it on the posted journal.
- Bill refusal shows as a top banner, not a cell mark (the known gap; not logged).
- Phone Settings › Language help text says "A change applies when you open the app again", but the change applied at once.
- "Sales channel" (a free dimension name) stays English in nb. It is company data, so not a finding.
- Side menus: iPad flyout items are 30 pt tall and iPhone menu items 31–35 pt, both under 44 pt (outside this flow).
- Data left behind: JV-DRAFT-000042 (waiting to post), BILL-DRAFT-000043 (draft), JV-DRAFT-000045 (nb draft, refused, doc ref "DRF2+NB"), WO-2026-000002 posted (100,00 on INV-2026-000005, BRG-OPS).

## AXe notes

- With the nb software keyboard / Norwegian layout, `axe type "-"` produced "+". Avoid "-" in typed values.
- `axe type` right after a tap drops the first characters while focus moves ("6750"→"60", "1920"→"920"). Typing one character at a time with about 0.4 s between, after a 0.6 s wait, works.
- On the iPhone the software keyboard is up, so fields under it get the typed text and taps meant for the page hit keys. Close it with the ✓ key (about 350,780) and re-read the frames.
- Compose labels come back '' for elements partly off-screen. Only judge labels on fully visible elements.
- Ids work well with `tap --id` (`journal.line.N.acc/.dr/.cr/.cc`, `journal.submit`, `bill.submit`). Rows and flyout items need `-x -y`.

Brief: unclear or missing: step 5's "lines share a cost centre" needs seeded invoices with line cost centres, and none exist in Kystgruppe. Step 5 expected "posted", but write-offs go to approval: the Owner can only post with "Approve my own write-off", which I used. Step 2 "nothing is posted" holds, but Submit saves a draft each time. The brief didn't say whether leftover drafts are fine.
