# Phase 4 simulator retest: trimmed (KEEP steps only)

Trimmed from `sim-session-phase4-retest.md` against App `origin/phase/4` (6c680b49) and BE `origin/phase/4` (66148f9d). Only steps that need a real screen remain. Dropped steps are in the first table (covered by a named automated test), API steps are in the second (the lead runs one HTTP call on the local stack; the call also does the data prep a later kept step needs).

**Code, stack, users, device rules:** as in the plan (jar mode, quiet machine, check load before the first step; soft keyboard ON for iPad mini). Passwords: `NeoERP-BackEnd/docs/local-demo-data.md`. Mark each step PASS / FAIL / DATA / BLOCKED; screenshot every FAIL. Test steps format: sign in, numbered clicks, Expected per step.

**Two testers by company.** Tester 1: Kystgruppe users (ola, bjorn, anna, FM2, jonas for the feature switches, erik.sand). Tester 2: Lahore / Sialkot (ayesha, omar). No Stockholm step is left (SW-C7 is covered), so no Stockholm user is needed.

**Lead prep before tester 1 starts (API table):** N1 (FM2), N3 (supplier bank change), N5 (Ola member of Lahore Textiles, journal read/write), N6 (fresh opening-balance import at Lahore for tester 2). N2, N4, N7, N8 are no longer needed.
**Order inside tester 1:** G1 (limits set by the lead through the API rows AL-L2..AL-P1) then G2, then the lead's remaining API rows, then G3, G4, G5. The two G3 steps AL-J7 and AL-P6/P7/P9 need the lead's API steps done first (see the table).

## Setup (once, tester 1)
- **S0.1** Restart BE (V79) and install the App on all five devices; sign in ola (iPad Pro 13), bjorn (iPad mini). **Expected:** top bar shows Kystgruppe Nordic and the person.
- **S0.2** Ola: Settings > company features: make sure **Approval limits**, **Recurring journals and accruals** and **Refunds, advances and write-offs** are on. **Expected:** Approval limits appears under Accounts.

## G1 · TESTER 1 · iPad Pro 13 (ola) + iPad mini (bjorn): refresh, bill, soft keyboard
(The lead has set the limits and the stand-in (API rows AL-L2, AL-L3, AL-L4, AL-P1) before this group.)
**B2a-S5** (R16 refresh on return; Ola = iPad Pro 13, Bjørn = iPad mini, portrait). 1. Bjørn: Journals, tap the Waiting to post chip. Ola: write and submit a small journal (under 500 000, so one person posts). **Expected:** Ola gets toast "Journal JV-DRAFT-… submitted"; Bjørn's list does not change yet. 2. Bjørn: Home, wait 3 s, reopen. **Expected:** the new journal is listed, chip count one higher. 3. Bjørn: toggle the chip off and on. **Expected:** counts equal the rows. 4. Ola opens the journal; Bjørn posts it; Ola: Home, 3 s, back. **Expected:** Ola's page shows Posted with Bjørn's name, no Post button.
**AC418-16** (bill, uses nothing earlier) Bjørn: Payables > Bills > New bill (Bergen Kontorservice AS, one line 1000 + 25% tax), Save, **Submit for approval**. **Expected:** the bill reaches Waiting for approval (not "We couldn't confirm"). 2. Open the bill, tap Approve. **Expected:** "You sent this for approval, so someone else must approve it."; no approval happens. Leave the bill waiting (Ola approves in G3, AC418-10b).
**B2a-S2** (R02 soft keyboard, iPad mini, Bjørn) 1. Journals > Recurring > New: a Waiting-to-post journal (6300 D 5 000,00 / 1920 C 5 000,00, start 01.12.2026, reference "A4T-R02", a memo). 2. Leave the Credit cell focused with the **soft keyboard visible**, tap Save once. **Expected:** one tap saves (toast "Saved. Next journal on 01.12.2026.", detail opens). 3. A second one "A4T-R02b": close the keyboard first, tap Save once. **Expected:** one tap saves. 4. New journal ▾ > Import journals, tap Earlier imports once. **Expected:** it opens. If a step needs a second tap: note whether the side menu was opened before, screenshot.

## G2 · TESTER 1 · iPhone 18 Pro (anna) + iPad Pro 13 (ola): submit and the Why link
**AL-J1** Anna (iPhone): journal **750 000,00** (debit 6300, credit 1920), open month, **Submit for posting**. **Expected:** toast "… submitted"; row "Waiting to post · 0 of 2 approved". (Tell the lead the journal number: AL-J5 and AL-K3 act on it.)
**AL-J3** Ola (iPad Pro 13): open that journal (card "Needs 2 approvals · 0 done"), tap **Why 2 approvals?**. **Expected:** Approval limits opens on Limits. Back to the journal.
*Now the lead runs the API rows AL-J5, AL-K1, AL-K3, AL-P2, AL-P5, D1, D4, AC418-10a (Ola's step 1 on the journal, the second journal, the payment, the data for G3).*

## G3 · TESTER 1 · iPad Pro 13 (ola) + iPad mini (bjorn; FM2 signs in on the mini when named): decide
**AL-J7** Bjørn opens the journal Ola approved at step 1 (step 2 "Next: you", button **Post**). Post, reason, confirm. **Expected:** toast "… posted as JV-2026-…"; status Posted; both steps ticked; timeline "Posted by {Bjørn} as JV-2026-… (step 2 of 2)".
**B2a-S3.3** (needs D1 from the lead, API row D1) Bjørn posts the D1 journal; Ola: Recurring > Automatic reversals, Status tick Posted (the reversal posts when due; if still waiting use Reverse now). **Expected:** the posted one reads "Posted as RV-…". Then Ola (iPad Pro 13 landscape): cancel a pending reversal: ⋯ shows only Cancel automatic reversal (Reverse now only when due/failed); give a reason. **Expected:** toast "Automatic reversal of JV-… cancelled.", row leaves the default list, tick Cancelled to see it.
**AL-P6** FM2 signs in (on the iPad mini): payments list (the payment of API row AL-P2 after Bjørn's step 1, API row AL-P5). **Expected:** row "Waiting for you · Step 2 of 3 · for {Ola}"; the Payables badge counts it.
**AL-P7** FM2 opens it, Approve (bank tick again), confirm. **Expected:** toast "Step 2 of 3 approved."; timeline "Approved (step 2 of 3), for {Ola} (stand-in)".
**AL-P9** Ola opens it (button **Approve**, last step, today's sheet with the bank tick), confirm. **Expected:** payment posted; all three steps ticked.
**AL-O1** Bjørn: Limits > "The Company Owner's own items" > **Stop the Owner approving own items**. **Expected:** gate "Stop the Company Owner approving their own items?" (journals, supplier payments, customer refunds, one proposal each); reason field. Enter a reason, confirm (toast "Proposed for Journals, Supplier payments and Customer refunds. Another person confirms each change."; each kind card shows "… Yes → No"). The lead then confirms the three proposals (API row AL-O3).
**AC418-10b** (uses the lead's prep (API row AC418-10a) and AC418-16) Ola approves: Bjørn's bill (AC418-16, bill), the supplier refund, write-off, receipt, supplier payment from AC418-10a. Bjørn then leaves the app (Settings) and returns on the iPad mini. **Expected:** each list (bills, refunds, write-offs, receipts, payments, supplier refunds) shows the row as decided and no longer under Waiting for approval, without a pull; the menu badges (Payables, Receivables, Journals) drop by the number approved (Bjørn's starting badges were read by the lead from the API baseline, or read them on the mini first).

## G4 · TESTER 1 · iPad Pro 13 (ola) + iPad Pro 11 (jonas, then erik.sand)
**B2b-14** Ola: Payables > Refunds received > Record refund received, keep the form open. Jonas: switch **Refunds, advances and write-offs** off for Kystgruppe. **Expected (Ola):** toast "Refunds, advances and write-offs were switched off." (not cut) with "This form was closed. Nothing was saved."; off page title "Accounts", crumbs "Companies / Kystgruppe Nordic / Accounts / Payables / Refunds received". Jonas switches it on again.
**AL-R3** erik.sand (Reader) on the iPad Pro 11: Kystgruppe > Approval limits > Owner's decisions > More > Export the Owner’s decisions (CSV). **Expected:** the file save sheet opens, CSV saved; toast that it was exported. (If erik cannot open Kystgruppe's Owner's decisions, API row AL-R1 shows 403: mark DATA N4.)
**SW-A1** (needs N5: Ola member of Lahore Textiles with journal read/write) Ola, iPad Pro 13: select Kystgruppe Nordic, Accounts > Journals, open any posted journal. Keep the gateway log open. Company chip: Lahore Textiles. **Expected:** Journals list of Lahore (tabs All, Drafts, Waiting, Posted; Lahore figures); no Kystgruppe detail, no "We couldn't find this", no error toast, no skeleton left. Gateway log: no `GET /api/accounts/journals/<Kyst id>?companyId=<Lahore>`, no 404; Lahore's list and summary calls are there. Switch back to Kystgruppe: the Kystgruppe Journals list, not the old journal.
**SW-B6** At Lahore: New journal, then switch to Kystgruppe. **Expected:** the Kystgruppe list; no draft created; no wrong request in the log.
**AL-Lang** iPad Pro 13: Settings > On this device > Language Norsk, Svenska, Dansk; open the waiting journal (the second journal from API row AL-K1, or any journal waiting for approval) and the payment detail of AL-P3. **Expected:** "Trenger 2 godkjenninger · 0 gjort", "Behöver 2 godkännanden · 0 klara", "Kræver 2 godkendelser · 0 klaret" and gates and toasts in that language. Set back to English. (Do it before AL-P9 if the payment must still wait; otherwise use any waiting item.)

## G5 · TESTER 1 · iPhone 18 Pro (anna) + iPad Pro 11 (jonas)
**B2a-S6** (R23; Anna iPhone, Jonas iPad Pro 11) 1. Anna: open a draft journal, tick Reverse automatically, Save, keep the editor open. **Expected:** Submit for posting enabled. 2. Jonas: Settings > the company's features > switch **Recurring journals and accruals** off for Kystgruppe Nordic, with a reason. **Expected:** toast "Change recorded with its reason". 3. Anna: Home, wait 3 s, back. **Expected:** Submit for posting greyed with "Reverse automatically is part of Recurring journals and accruals, which is off for this company. Untick it to go on."; no old red banner. Jonas switches it on again.

## G6 · TESTER 2 · iPad Air 13 (ayesha, Lahore Textiles) + iPad Pro 11 (omar, Lahore Textiles FM)
**B2b-5** (needs N6) Ayesha: Journals > Imported files > the CSV opening-balance import > Held out > Enter as opening items (Customers) > check > Create as Waiting for approval > Create. **Expected:** "2 balances created."; Back to receivables opens the Receivables Invoices list (not a blank Import opening balances wizard).
**B2b-6** Open that import again (same session). **Expected:** Customers' balances says "Entered as opening items. …", no Enter as opening items button.
**B2b-16a** Same session: open Payroll and come back; switch company and back. **Expected:** "Entered as opening items" stays. (The after-restart half already passed.)
**OBS-1** (observation) On the iPad Pro 11 and iPad Air: open a few report and list pages (Reports tabs, lists). **Expected:** rows load without needing a tap; skeletons do not stay until you tap. Note the load time and the load average.
**OBS-2** Ayesha: Import opening balances > Download the template, choose Excel, save. **Expected:** the saved file is named `.xlsx` (it was `.csv`); CSV choice stays `.csv`.
**SW-D9** Omar (iPad Pro 11, Lahore and Sialkot): Chart of accounts, Fiscal calendar, Tax codes (Dimensions if on): switch company on each. **Expected:** the new company's data after a short load; nothing old flashes. (Omar's two companies are both Pakistani: the stale-format trigger of the journal bug is absent, so this checks data isolation only.)

## Dropped — covered

| Step | Automated test (merged code) |
|---|---|
| AL-L1 | `ApprovalLimitsScreenSizeTest` (limits, limitsReadOnly), `ApprovalLimitsAccessTest` |
| AL-K2 | `JournalApprovalUiTest.keepLaterStepOpenHidesApprove` ("only Finance Manager who can approve step 2"), BE `JournalApprovalStepsTest` |
| AL-C1 | BE `RefundApprovalStepsTest` (refund submit and limits), data prep for AL-C4 only |
| AL-C2 | BE `RefundApprovalStepsTest.stepOneThenApproveAndMoneyInvariants` |
| AL-C3 | BE `RefundApprovalStepsTest.bankEditorAndPayeeChangeBetweenSteps`, `CustomerBankRequestTest` |
| AL-C4 | `PaymentRefundApprovalUiTest.refundStepOneThenTheLastAndThePayeeChange` (notice, Draft), BE `RefundApprovalStepsTest.bankEditorAndPayeeChangeBetweenSteps` |
| B2a-S3p (phone) | `A4ScreenSizeTest` (Automatic reversals cards), `AutoReversalListStateTest` |
| D2, D3 | data for B2a-S4 and B2b-1 only; both steps dropped |
| AL-J2 | `JournalApprovalUiTest.stepOneThenPost` ("Needs 2 approvals · 0 done", Next: you, After step 1, Approve not Post), `ApprovalStepsScreenSizeTest.journalWithTwoApprovals` |
| AL-J4 | `JournalApprovalUiTest.stepOneThenPost` ("Step 2 then goes to…"), `JournalDetailScreenTest` ("What you checked") |
| AL-J6 | `JournalApprovalUiTest.stepOneThenPost` (step 2 Next: you, Post with expectedStep); the tester still opens it as part of AL-J7 |
| AL-K3 (check part) | `JournalApprovalUiTest.stepOneThenPost`; the approval itself is API row AL-K3 |
| AL-P3 | `PaymentRefundApprovalUiTest.paymentStepOneThenApprove` ("Needs 3 approvals", "away until"), `AlSpecNamedTests.activeStandInCountsInWaitingForYou`, `ApprovalStepsScreenSizeTest.paymentOnItsFirstStep` |
| AL-P4 | `PaymentRefundApprovalUiTest.bankDetailsAreConfirmedOnEveryStep` |
| AL-P8 | `PaymentRefundApprovalUiTest.paymentStepOneThenApprove` (last step Approve with expectedStep); folded into AL-P9 |
| AL-O2 | `LimitsAlRestTest.oneOwnerSwitchSendsThreeProposalsAndSaysWhichFailed`; the tester does it as the second half of AL-O1 |
| AL-O4 | `OwnerOwnSwitchWordsTest.oneStepOwnItemsSayTheSwitch`, BE `JournalOwnerSwitchTest.ownerOwnRefusedOnEveryJournalPath` |
| AL-O5 | `OwnerOwnSwitchWordsTest.postMyOwnDraftThatNeedsTwoApprovalsOffersSubmit`, `JournalApprovalUiTest.ownersOwnDraftThatNeedsTwoApprovalsOffersSubmit` |
| B2b-3 | `ReportsStaleFilterReloadTest`, `ReportsCompanySwitchTest.aBareRouteAfterTheSwitchReadsTheStaleSavedFilterOnceThenTheDefaults`, `TrialBalanceStateTest` |
| B2b-10c | `JournalImportByAtTest` (By name and time), BE `JournalImportApiTest` (discardedBy); see API row B2b-10b |
| B2b-1 | `TrialBalanceStateTest` ("Other branches", "Company-level lines", Balanced), `TrialBalanceScreenshotTest`, BE `TrialBalanceTotalsTest` |
| B2a-S4 | `RecurringNeedsYouTest`, `RecurringListStateTest`, `A4ScreenSizeTest` (button n, "n need you", ended list) |
| AL-R2 | `LimitsAlRestTest.ownerOwnReportRowsFilterAndCsv`, `ApprovalLimitsScreenSizeTest.ownerOwnReport` |
| AL-N1, AL-N2 | `AlSpecNamedTests.readersAndNeovatusSeeNoButtons`, `JournalApprovalUiTest`, `CompanyAccessEnterContextTest` |
| SW-A2, SW-A3, SW-A4, SW-B5 (merged into SW-A1 on device, one smoke) | `JournalsCompanySwitchUiTest` (detail/edit, tablet 820 and phone 390, host variants; asserts no request for the old id), `NeoCompanyScopeSwitchTest` |
| SW-C7 | `SieCompanySwitchUiTest.importPageTablet`, `importPagePhone`, `SieTwoCompanyTest` (no Swedish multi-company user needed) |
| SW-D8 | `ReportsCompanySwitchUiTest` (trial balance Sialkot to Lahore), `ReportsCompanySwitchTest` |
| B2b-17 | `ObNotCreatableHintTest`, BE `ObImportApiTest` |
| AL-PK1, AL-PK2 | `PaymentRefundApprovalUiTest.moneyInTheCompanyFormatNoAndPk`, `ItemApprovalDtoTest` (5,000,000 comma grouping), BE `PaymentApprovalStepsTest`; PK1 was only its setup |
| SW-phone | `JournalsCompanySwitchUiTest.detailPhone`, `editPhone`, `hostDetailPhone`, `hostEditPhone`, `SieCompanySwitchUiTest.importPagePhone` (New-journal-on-phone is only in SW-B6 on the iPad: see unsure notes) |

## API checks (the lead, local stack, one call each)

Auth: demo session of the named user (do not print token files). Paths are the BE controllers on `origin/phase/4`; request bodies as in `ApprovalLimitsApiHarness` / `JournalApprovalsRig` / `PaymentSupport`.

| Step | Method path | Expected |
|---|---|---|
| AL-L2 (as bjorn) | `POST /api/accounts/approval-limits/{kind=journals}/proposals` (band over 500000, step 1 anyone who may post journals, step 2 any Finance Manager); `GET /api/rbac/approval-stand-ins/decide-roles` | 2xx with a PENDING proposal id; "Any Finance Manager" is in the deciders for bjorn (FM) although FM cannot read roles. Tests: `LimitProposalTest`, `LimitsAlRestTest.editorReadsTheDecidingRolesForEveryProposer` |
| AL-L3 (as ola or FM2) | `POST /api/accounts/approval-limits/proposals/{id}/confirm`; then `GET /api/accounts/approval-limits` | 200; journals ladder shows the band "over 500000 · 2 steps"; proposal no longer pending. `ConfirmedByUserIdTest` |
| AL-L4 (bjorn proposes, ola confirms) | same two calls for `{kind=supplier-payments}`, three steps over 1000000: Any Finance Manager, named person ola, anyone who may approve payments | 200; ladder lists the three steps in that order. Refund limit is not needed any more (AL-C dropped) |
| AL-P1 (as ola) | `POST /api/rbac/approval-stand-ins` (FM2, supplier payments, today to next week); `GET /api/rbac/approval-stand-ins/mine` | 2xx; the stand-in is listed with the dates. `StandInServiceTest` |
| AL-K1 (as anna) | create `POST /api/accounts/journals` (750000,00; 6300 D / 1920 C) then `POST /api/accounts/journals/{id}/submit` | 200; status SUBMITTED, approvals 0 of 2 (the second 750 000 journal AL-Lang uses) |
| AL-P2 (as anna) | supplier bank change first: `POST /api/accounts/suppliers/{id}/bank-change-requests`, FM2 `.../{requestId}/approve`; then `POST /api/accounts/payments` (1 200 000,00 to that supplier) and `POST /api/accounts/payments/{id}/submit` | 200; payment SUBMITTED, needs 3 approvals (over 1 000 000); bank details flagged changed within 30 days. `PaymentApprovalStepsTest` |
| D1 (as anna) | `POST /api/accounts/journals` with 1000,00 and reverse automatically on today (22.11.2026), `POST .../{id}/submit` | 200; SUBMITTED; autoReverse date set. Bjørn posts it in the app (B2a-S3.3) |
| D4 (as anna) | `POST /api/accounts/journal-imports` (CSV upload, left at the check step) | 2xx; appears in `GET /api/accounts/journal-imports` (JournalImportApiTest) |
| AC418-10a (as anna) | submit a supplier refund, a write-off, a customer receipt and a supplier payment (small); `GET /api/accounts/payments/summary` and `GET /api/accounts/refunds/summary` for bjorn and ola | 200; `waitingForYou` baseline noted (these are the badge numbers before AC418-10b). `ApprovalLimitsWaitingCountTest` |
| AL-J5 (as ola) | `POST /api/accounts/journals/{id}/approval-steps/1/approve` with note "Checked against the freight contract" on the 750 000 journal of AL-J1 | 200; step 1 done by ola with the note; step 2 next for any Finance Manager; ola's own repeat call on step 2 gives a refusal (409/403). `JournalApprovalStepsTest`. (Do this after AL-J3.) |
| AL-K3 (as ola) | `POST /api/accounts/journals/{id}/approval-steps/1/approve` on the second 750 000 journal | 200; then `GET /api/accounts/journals/{id}` shows step 2 next, post allowed for bjorn |
| AL-P5 (as bjorn) | `POST /api/accounts/payments/{id}/approval-steps/1/approve` with the bank-details confirmation set | 200; "step 1 of 3" done. Without the confirmation: expect 4xx (PAY-6 refusal). `PaymentApprovalStepsTest` |
| AL-O3 (as FM2, 3 calls) | `POST /api/accounts/approval-limits/proposals/{id}/confirm` for the journals, supplier-payments and customer-refunds proposals of AL-O1 | 200 each; then `GET /api/accounts/approval-limits` shows ownerOwn false on all three kinds. `OwnerOwnSwitchLimitsTest.switchOffProposedAndConfirmedByTwoPeople` |
| B2b-10b (as anna D4 import, ola discards) | `POST /api/accounts/journal-imports/{id}/discard` (reason) then `GET /api/accounts/journal-imports/{id}` | 200; status DISCARDED, discardedBy = ola's person (name "Ola Berg" as shown), discardedAt set. `JournalImportApiTest`, `SieImportDiscardedByMigrationTest` |
| AL-R1 (as erik.sand) | `GET /api/accounts/approval-limits/owner-self-approvals?companyId=<Kystgruppe>` | 200 with rows newest first (rows from AL-J/AL-O if the Owner approved own steps), or 403 if erik cannot read Kystgruppe (then DATA N4). `OwnerSelfApprovalReportTest` |

(AL-P5 above also covers "Bjørn approves step 1"; the tester steps AL-P6/P7/P9 follow it.)

## Counts and time

Listed step IDs in the plan: 76 (the plan's own total says 82; it counted some grouped IDs twice, mainly the AL-C and AL-N pairs). Decisions:
**KEEP 26 · DROP 35 · API 15.**

| Tester | Kept steps | Estimate |
|---|---|---|
| Tester 1 (Kystgruppe: G1 to G5) | 20 (S0.1, S0.2, B2a-S5, AC418-16, B2a-S2, AL-J1, AL-J3, AL-J7, B2a-S3.3, AL-P6, AL-P7, AL-P9, AL-O1, AC418-10b, B2b-14, AL-R3, SW-A1, SW-B6, AL-Lang, B2a-S6) | about 75 min: 20 steps at 2 min = 40, plus 20 for setup and sign-ins, plus about 15 for the steps with many sub-steps (S5, S2, S3.3, 10b, S6) |
| Tester 2 (Lahore / Sialkot: G6) | 6 (B2b-5, B2b-6, B2b-16a, OBS-1, OBS-2, SW-D9) | about 30 min: 12 plus 15 setup (CSV, sign-ins) plus 3 |
| Lead (API rows and data N1, N3, N5, N6) | 15 calls | about 30 min, interleaved: between G2 and G3 about 15 min |

Old estimate was 3 h 30 min at one tester per device: this is under 80 min of the critical path (two testers can run in parallel).

## Unsure notes (decided without a way to prove it)
- **AL-J2/J4/J5/J6/P3/P4 dropped on `JournalApprovalUiTest` / `PaymentRefundApprovalUiTest`** (commonTest view-model tests on fixtures) plus the size tests. No Compose UI test draws these screens on the real stack; the cross-user flow stays proven on the device by AL-J7, AL-P6, AL-P7, AL-P9 only. If you want the full UI path for each approval type, re-add AL-J4/J5 and AL-P4/P5.
- **"Why 2 approvals?" (AL-J3)** has no test hit: kept. The wording of the Owner-switch gate (AL-O1) has no test hit either: kept.
- **B2a-S3.3** kept: posting plus the reversal row and the ⋯ menu on iPad landscape have only state tests (`AutoReversalListStateTest`, `AutoReversalCardTest`).
- **B2b-6 and B2b-16a** kept: `ObImportControllerTest.aSideAlreadyEnteredAsOpeningItemsIsNotHandedOffAgain` and `OpeningItemsEnteredTest` cover the state, but no BE test names the "entered as opening" flag and the "Entered as opening items" text has no test hit. Cheap, same session as B2b-5.
- **B2b-3 dropped** on `ReportsStaleFilterReloadTest`: it is a two-user live scenario (cost centre deleted by another user); the logic is covered by a view-model test, not a device run. Re-add if you want the live version.
- **SW-A1 and SW-B6 kept** only as one device smoke (the original failure was seen on device); the rest is `JournalsCompanySwitchUiTest`. No test draws the "New journal" editor route (it covers Detail and Edit), so SW-B6 stays.
- **SW-D9** (chart of accounts, fiscal calendar, tax codes, dimensions) has no company-switch UI test: kept, with Omar only (Pakistan to Pakistan).
- **B2b-17 dropped** on `ObNotCreatableHintTest` and the BE import tests, without confirming the exact sentence appears in the test.
- Step counts: the plan's 82 does not match its listed IDs (76).

## Lead review of the trim (2026-11-22)
- **Restored as KEEP (weak drops):** B2b-3 (two-user live reload; only `ReportsStaleFilterReloadTest` covers it) and B2b-17 (exact "not creatable" sentence not confirmed against `ObNotCreatableHintTest`). Add both to tester 1's last group. New total: 28 KEEP, 33 DROP, 15 API.
- **API checks:** run by the lead with a small local script that sources the demo token env exactly like the seeders (`source /private/tmp/neoerp-demo-tokens.env`), prints only HTTP status and the named response field, never a token. Request bodies taken from `ApprovalLimitsApiHarness`, `JournalApprovalsRig`, `PaymentSupport`.
- Plan said 82 steps; listed IDs are 76 (counting error in the merge, no step lost).

## Correction after T4b (2026-11-22, AL-P6/P7/O3 by design)
Kystgruppe has only 3 payment approvers (Ola, Bjørn, Kari). **AL-P6/P7:** if Kari took step 2 as Ola's stand-in nobody would be left for step 3, so AL-6 KEEP_LATER_STEP holds her back (not in her Waiting for you; no Approve). Correct path: **Ola approves step 2, Kari step 3** (or add a 3rd Finance Manager with PAYMENT_APPROVE to the demo). **AL-O3:** the proposer cannot confirm (SR-L4), and the named person and their stand-in in force are CONFIRMER_NAMED (contract §7.5 step 6): confirm the AL-O1 proposals **before** the AL-P1 stand-in starts, or after it ends. Sources: BE `StepAuthority.waitingFor`/`decide`, contract §10.7, App spec §4.7 / AL-D9 / AL-6.
