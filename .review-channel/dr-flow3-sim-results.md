# Simulator results: dimension-rules flow 3 `branch-default` + flow 1–2 re-checks

- Devices: iPad Pro 13-inch (M5) 5AB86CDD-21F1-45AB-A677-66079974BE1F · iPhone 18 Pro 45AD3FD4-4FF6-4EF3-A68B-F044AC85C269
- Commits: BE `accounts/dimension-rules` ad4e323 · App 8097bc2d (debug)
- Persona: Ola Nordmann, Owner, Kystgruppe Nordic (step 9: see row)
- Time: 2026-11-25 03:41–04:10 (sim clock)
- Driver: AXe 2.1.1 (`describe-ui`, `tap --id/--label`, `type`, `swipe`); shots `xcrun simctl io … screenshot`
- Shots: `.review-channel/dr-flow3-shots/` (s* = iPad, p* = iPhone)

## Steps

| Step | Device | Result | What I saw | Shot |
|---|---|---|---|---|
| 1 | iPad · en | PASS | "Default for" column: OSL-OPS → Oslo HQ. `branchDefaults.card` with rows OSL/BRG/TRO (sorted Bergen, Oslo HQ, Tromsø); Oslo OSL-OPS, Bergen/Tromsø None. | s01-ipad-costcentres |
| 2 | iPad · en | PASS (with F5, F6) | `branchDefaults.row.BRG.select` → BRG-OPS → gate. "Short" (5): Change default disabled. Valid reason: row shows BRG-OPS, BRG-OPS "Default for" Bergen, toast "Default for Bergen: BRG-OPS… Recorded: …". Second try (OSL-OPS) → Cancel: Bergen back to BRG-OPS. No required marker on Reason (F5). | s02a…s02e |
| 3 | iPad · en | **FAIL** (F1) | Bergen page: "Default cost centre: None" right after step 2; Oslo HQ page also "None" (expected OSL-OPS). Tromsø None. Re-opened Bergen: still None. | s03a, s03b, s03c, s03d |
| 4 | iPad · en | PASS | New journal, Oslo, header default None; line 1 on 6750 → cc cell OSL-OPS, spoken "Line 1 cost centre, From branch Oslo HQ". (Note: prefilled before any account is chosen too.) | s04a, s04b |
| 5 | iPad · en | PASS | Cleared line 1 → cell shows "Required". Line 2 1920 credit. Saved JV-DRAFT-000047, reopened, edited description, saved, reopened: cc still empty each time. | s05a…s05e |
| 6 | iPad · en | PASS / **QUESTION** (Q1) | Header default BRG-OPS → both lines "Use default · BRG-OPS" (not OSL-OPS). With header default OSL-OPS, line 2 branch → Bergen keeps "Use default · OSL-OPS" (header wins; brief expected Bergen's default). With header None: Bergen line → BRG-OPS "From branch Bergen"; Tromsø line → "Default · No cost centre". | s06a, s06b, s06c |
| 7 | iPad · en | PASS (credit: Required part not testable) | Credit note on account, Oslo, 3000: after a description+amount, Tags → `credit.0.dim.costCentreId.select` OSL-OPS + caption "From branch Oslo HQ" (`.fromBranch`). Credit-note account list holds only 3xxx, none Required, so Required part only on the debit note. Debit note, 6750: OSL-OPS from branch Oslo; cleared → `.required` "Required on this account"; Save draft is allowed (DN-DRAFT-000048); Submit → `debit.0.dim.costCentreId.refused` "Line 1 needs a cost centre." + red banner at top, both visible without scrolling. | s07a…s07h |
| 8 | iPad · en | PASS / BLOCKED (delete) | `deactivate.warnings`: "It is the default for Oslo HQ. New Oslo HQ lines will have no default cost centre until you choose another. 3 draft journals use it…". Cancelled. Delete: no Delete button on OSL-OPS (it is hidden when the value is used on lines, `DimensionValuePanel.kt:242`), so the branch-default refusal can't be reached in the app. | s08a, s08b |
| 9 | iPhone · Anna Lindh, Accountant | PASS | Anna lacks the right: rows `branchDefaults.row.{BRG,OSL,TRO}.readOnly` show the value (None / OSL-OPS Oslo operations / None) and the muted line "You can't change branch defaults."; no `.select`. | p09-iphone-anna-readonly |
| 10 | iPhone · nb · AX-XXXL | **FAIL** (F4) | Norwegian text everywhere on card/gate/warning. Cut: gate button "Endre stan…", deactivate "Bruk endri…", picker values "BRG-OPS Bergen op…" / "OSL-OPS Oslo operat…" (picker fixed 320 pt in a 375 pt row), page title "Ko…". Targets 44–48 pt. Picker close button (`branchDefaults.row.BRG.select.close`) has no label. | p10a…p10g |
| 11 | iPad · sv / da | PASS | Swedish ("Standard per filial", "Var det används…") and Danish ("Standard pr. filial", "Hvor det bruges…") wording, nothing cut. | s11a…s11d |
| 12a | iPhone · en | **FAIL** (F2) | Submit with 6750 no cc: field gets red border, words "Line 1 needs a cost centre." and `journal.requiredRefusal`. But the words sit under the sticky footer (clipped at y 751, footer from 757) — not readable without scrolling. VoiceOver: field reads "Line 1 cost centre, Required on this account" — the refusal is not in label/value. | p12a-iphone-submit-refused |
| 12b | iPad · en | Prefill fixed · M2 fixed · Required **FAIL** (F3) | Write off… → cost centre OSL-OPS. No draft save in the dialog; Cancel discards (reopen = OSL-OPS). M2 checked via submit → Withdraw to draft → Edit: BRG-OPS came back. Submit with None on "Required on this account": accepted, WO-DRAFT-000049 "Waiting for approval"; no refusal. | s12b-* |
| 12c | iPad · en | fixed | 6705 side sheet: "Branch · Required (2 or more branches)". | s12c-ipad-6705-sheet |
| 12d | iPad + iPhone | partly fixed (F5, F7) | Row checkboxes `accounts.rules.select.{n}` "Choose account 6705 …" and group headers "Group 67 …, open. Fold it" labelled ✔. Reason field labelled while empty ✔ (placeholder only; loses label once typed). Rule picker reads only "Required" (no "Rule"), checkbox has no checked state, Debit/Credit segment reports the selected one as "disabled". Phone journal cards: account/debit/credit/branch/cc read "Line n …" ✔, Description reads only "Description", memo has no label. | s12d-* , p12a-line2 |

## Findings

- **F1 · HIGH · CONFIRMED · Org › Branches › {branch}** — "Default cost centre" always "None" (Oslo HQ too, which is seeded OSL-OPS). Expected "OSL-OPS Oslo operations" / Bergen's new value. Likely cause: BE `CompanyBranchResponse` (services/org-service/.../company/dto/CompanyResponse.kt:45-60) has no `defaultCostCentreId`, while `BranchResponse` (BranchResponse.kt:20) has it; the App reads `branch.defaultCostCentreId` (CompanyBranchDetail.kt:608) from `OrgCompanyBranchDto`, which also comes embedded in the company DTO (OrgCompanyDtos.kt:31). Steps: set Bergen default in Cost centres → Company › Branches › Bergen / Oslo HQ. Shots s03a, s03b, s03d.
- **F2 · MEDIUM · CONFIRMED · iPhone journal (12a, flow 2 F1/F2)** — after Submit refusal, "Line 1 needs a cost centre." is clipped under the sticky footer; VoiceOver on the field does not read the refusal (label "Line 1 cost centre", value "Required on this account"). Expected: sentence visible without scrolling and read on the field. Shot p12a-iphone-submit-refused.
- **F3 · HIGH · CONFIRMED · Write-off (12b)** — Submit with Cost centre None while the field says "Required on this account" is accepted (WO-DRAFT-000049 waiting for approval). Expected "Choose a cost centre: required on the bad-debts account." The App shows that text only when the server refuses with DIMENSION_REQUIRED (WriteOffSheet.kt:255); the BE didn't refuse at submit (may only check at approve/post — not tried; I did not approve). Shot s12b-ipad-writeoff-refused. WO-DRAFT-000049 left as a draft (withdrawn) with BRG-OPS.
- **F4 · LOW · CONFIRMED · iPhone nb largest text** — truncated action buttons "Endre stan…" (gate), "Bruk endri…" (deactivate); branch-default picker values truncated though the row has space. Shots p10d, p10g, p10b.
- **F5 · LOW · CONFIRMED · Reason gate (all reason dialogs)** — Reason TextArea has no accessible name of its own: label = placeholder while empty, '' once typed; `content_required` false, no visible required marker. Brief step 2 asks for "required marker announced". Same pattern on Account rules search. describe-ui output.
- **F6 · LOW · CONFIRMED · Gate wording when choosing None** — "BRG-OPS Bergen operations → Ingen. Nye linjer fra Bergen bruker det." (en: "… New lines from Bergen use it.") reads wrong when the new value is None. Shot p10d.
- **F7 · LOW · CONFIRMED · a11y labels** — journal phone card Description reads "Description" (no "Line n"), memo TextArea unlabelled; write-off Evidence TextArea unlabelled; picker close button unlabelled; row checkbox exposes no checked state; segment/selected option reported as disabled; rule picker label is the value only.
- **F8 · LOW · CONFIRMED · Picker placeholder** — "Search default cost centre for bergen" (branch name lower-cased), nb "…for bergen" too. Shot s02a.

## Questions

- **Q1 (step 6)** — With a header default cost centre, a line moved to Bergen keeps the header default (OSL-OPS), not Bergen's. Brief says it should take Bergen's default. Which wins: header default or the line's branch default?
- **Q2** — Empty option wording differs: journal "Default · No cost centre", note/write-off pickers "None", branch defaults "None". Also on a 1920 line (cost centre not used) the disabled cell shows "Default · No cost centre".
- **Q3** — Account rules cell editor for 6705 cost centre (currently Optional) opens with "Required" preselected, not the current value.
- **Q4 (step 8)** — "Delete on OSL-OPS is refused" can't be reached: Delete is hidden for values used on lines. Test needs an unused cost centre that is a branch default.

## Seen around the steps

- Activity cards on branch pages show the actor as a raw UUID "1a000000-0000-4000-8000-000000000011 · 03:42" instead of a name (s03a).
- Journal Cancel asks "Leave without saving?"; Write-off Cancel discards silently.
- Credit/debit lines show the cost centre only after Description+Net are filled (`shown = !isBlank`), then behind "Tags".
- nb menu: "Slått sammen" for collapsed; "Approval limits" not translated.
- iPad journal grid: cost-centre column off to the right, needs horizontal scroll at 13-inch.
- End state: iPad as Ola (Owner), iPhone as Anna Lindh (lead's switch for step 9); both Kystgruppe, Device language (English), normal text size.
- Data left: JV-DRAFT-000047 (6750 no cc, memo "DR flow3 step5 clear"), DN-DRAFT-000048 (Bergen Kontorservice, 6750 no cc), WO-DRAFT-000049 (INV-2026-000006, draft, BRG-OPS). Bergen default back to None (reason "Korte tilbake til seed"; typo from the short-reason check).

## AXe notes

- `tap --id` worked for every testTag listed (branchDefaults.*, journal.line.n.*, credit/debit.0.dim.*, writeoff.*, accounts.rules.*). Items inside pickers have ids `…select.item.<uuid>` / `.item.__empty`.
- `--label` fails when two elements share a label; add `--element-type Button`.
- Compose exposes labels for off-screen nodes only partly (phone line card fields show '' until scrolled in); scroll first, then judge labels.
- `gesture scroll-down` did nothing on the Compose pages; `axe swipe --start-x … --end-y …` scrolls.
- Taps on elements under the iPhone top bar or the keyboard are refused or land elsewhere; tap the keyboard "done" (`--id Done`) first.
- App language switch is live (no relaunch needed despite the hint text).

Brief: unclear or missing — step 6 precedence (Q1); step 7 credit note has no Required account (only 3xxx selectable); step 8 delete unreachable (Q4); 12b "save the draft" — the Write-off dialog has no draft save (used submit → Withdraw to draft → Edit); step 10 "small iPhone" — only iPhone 18 Pro available.

## Delta run (BE e3e2fbcd / App 2103d756, 2026-11-25 04:13–04:27 sim clock)

Same devices, persona Ola Nordmann (Owner, Kystgruppe Nordic), English, normal text. AXe 2.1.1. Shots `dr-flow3-shots/delta-*.png`.

| Check | Device | Result | Evidence |
|---|---|---|---|
| Steps 1–2 | iPad | PASS | Card rows OSL OSL-OPS, BRG/TRO None; Bergen → BRG-OPS through the gate (reason "Delta run Bergen default check"); toast "Default for Bergen: BRG-OPS…"; BRG-OPS "Default for" Bergen. delta-s01, delta-s02. |
| **F1 HIGH** (step 3) | iPad | **FIXED** (CONFIRMED) | Org › Branches: Bergen "Default cost centre: BRG-OPS Bergen operations", Oslo HQ "OSL-OPS Oslo operations", Tromsø "None". delta-s03a, delta-s03b. |
| **F3 HIGH** (12b write-off) | iPad | **NOT FIXED as briefed**: no refusal. Cause looks like design, not a missing check (PLAUSIBLE) | Write off… on INV-2026-000006: prefilled OSL-OPS; set None → field shows "Required on this account"; Submit accepted → WO-DRAFT-000051 "Waiting for approval" (delta-s12b-ipad-writeoff-none, -accepted). BE `WriteOffRules.prepare` (e3e2fbcd) puts `l.costCentreId ?: centre` on the bad-debt line, where `centre` is the cost centre all the invoice's item lines share (D-82). Both INV-6 lines carry OSL-OPS (delta-s12b-ipad-invoice-lines-osl), so "None" means "inherit OSL-OPS" and the BE has nothing to refuse. Posting not checked (not approved). See F3′. |
| **F2 MEDIUM** (12a iPhone Submit) | iPhone | **NOT FIXED** (CONFIRMED) | 6750 debit 1000 without a cost centre, 1920 credit 1000, memo/doc ref/doc date filled, **Submit for posting** → field red, "Line 1 needs a cost centre." at y 752–767, sticky footer from y 758, so the text is cut under the footer (delta-p12a-iphone-submit-refused). VoiceOver: label "Line 1 cost centre", value "Required on this account". The refusal is not read. App fix ade4c034 says "phone save through the menu with the marked line in view"; the Submit path is unchanged. |
| Step 4 payment | iPad | PASS | Record payment, Oslo HQ, supplier Bergen Kontorservice, Add bank fee: `payment.adjustment.1.dim.costCentreId.select` OSL-OPS + `.fromBranch` "From branch Oslo HQ" (delta-s04a). Branch → Bergen: untouched line follows to BRG-OPS "From branch Bergen". Cancelled, not saved. |
| Step 4 receipt | iPad | Prefill PASS · one-invoice values (D-84) **NOT SEEN** (PLAUSIBLE) | Record receipt, Fjordtech, Oslo HQ, Add fee: OSL-OPS "From branch Oslo HQ" (delta-s04b). Branch → Tromsø: None + "Required on this account". Allocated 10 000 to INV-2026-000006 only (lines OSL-OPS): the fee line stays None/Required (delta-s04c). `ReceiptEditor.adjustmentDimensions` (2103d756) takes only the branch default. A grep of the BE accounts-service at e3e2fbcd finds no receipt rule that takes one invoice's values. Not posted, so post-time behaviour wasn't checked. Cancelled, not saved. |

### New / changed findings

- **F3′ · MEDIUM · PLAUSIBLE · Write-off dialog (replaces F3 HIGH, if D-82 inheritance is intended)**: with Cost centre None the dialog says "Required on this account", but the BE silently uses the invoice's shared cost centre (OSL-OPS here) and accepts. The user can't see what will be posted. Expected one of two things: the App shows the inherited value (e.g. "From invoice: OSL-OPS") and drops the Required marker, or the BE refuses an explicit None. Lead decision: should None mean "inherit" or "none"? A refusal can only be tested on an invoice whose lines have different cost centres, and no such invoice exists.
- **F2 (still open)**: Submit refusal on phone. The sentence is under the sticky footer and the field's VoiceOver label leaves it out. The fix covered the menu Save path only.
- **F9 · MEDIUM · PLAUSIBLE · Receipt clearing exactly one invoice (D-84)**: the fee line doesn't take that invoice's cost centre in the editor. I found no BE code that does it either. Evidence: delta-s04c plus code reads. Needs a post-time check or a builder to confirm whether it's implemented.
- **Note**: a phone journal Submit that gets refused still creates a draft (JV-DRAFT-000052 appeared in the list after Cancel). This may be intended (save, then submit).
- Still seen: activity cards on branch pages show the actor as UUID `1a000000-…0011` (Bergen page, "Update default cost centre").

### Data left

- WO-DRAFT-000051 (INV-2026-000006, cost centre None, reason "Delta F3 recheck no cost centre"). Withdrawn to draft.
- JV-DRAFT-000052 (6750 1 000 no cc / 1920, memo "DR delta F2 recheck", doc ref DELTA-F2).
- Bergen default back to None (reason "Delta run reset to seed"); Oslo OSL-OPS, Tromsø None. The audit log has two more entries on Bergen.
- No payment or receipt saved. Both devices: Ola, Kystgruppe, English, normal text (iPad on Cost centres, iPhone on Journals).
