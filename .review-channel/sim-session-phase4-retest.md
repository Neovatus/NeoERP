# Phase 4 simulator retest: one merged session (draft for the lead)

**Purpose:** one backend session that covers AL-REST (BE + App), FIX-APP-SWITCH, the deferred B2a/B2b items and the AC418 leftovers. Sources: `sim-steps-al-rest-and-switch.md`, `lane-verdict-fix-app-b2*.md`, the B2a/B2b builder reports (`origin/phase/4`), `ac418-app-simulator-*.md`, `test-ledger.md`.
**Code to test:** App `<sha>` (phase/4 with AL-REST-APP + FIX-APP-SWITCH), BE `<sha>` (phase/4 with AL-REST-BE, migration V79). Local stack in jar mode, **quiet machine** (AC418-16 failed under load ~570: check load before the first step). Soft keyboard ON for iPad mini (Simulator I/O > Keyboard > untick Connect Hardware Keyboard).
**Users:** ola.nordmann (Owner, Kystgruppe Nordic NO), anna.lindh (Accountant), bjorn.eriksson (Finance Manager), ayesha.khan (Owner, Lahore Textiles), omar.farooq (Finance Manager at Lahore Textiles), jonas.moe (Platform Admin, features), erik.sand (Neovatus read-only: the "Reader"), **FM2** = second Finance Manager at Kystgruppe (see Needs data N1). Passwords: `NeoERP-BackEnd/docs/local-demo-data.md` (not repeated). Test steps format: sign in, numbered clicks, Expected per step. Mark each step PASS / FAIL / DATA / BLOCKED; screenshot every FAIL.
**Device order (pairs, never more than two at once):** R1 iPad Pro 13 + iPad mini; R2 iPhone 18 Pro + iPad mini; R3 iPad Pro 13 + iPad mini; R4 iPhone + iPad Pro 11; R5 iPad Pro 13 + iPad Pro 11; R6 iPad Air 13 + iPad Pro 11; R7 iPhone + iPad Pro 13. Stay signed in on a device while the other pair member changes.

## Setup (once)
- **S0.1** Restart BE (V79) and install the App on all five devices; sign in ola (iPad Pro 13), bjorn (iPad mini). **Expected:** top bar shows Kystgruppe Nordic and the person.
- **S0.2** Ola: Settings > company features: make sure **Approval limits**, **Recurring journals and accruals** and **Refunds, advances and write-offs** are on. **Expected:** Approval limits appears under Accounts.

## R1 · iPad Pro 13 (ola, Owner) + iPad mini (bjorn, FM): set limits
**AL-L1** Bjørn: Accounts > Approval limits. **Expected:** Limits, Stand-ins, History, Owner's decisions; a card per kind; card "The Company Owner's own items" (Owner may approve one step of their own items).
**AL-L2** Bjørn, Journals > Edit limits: band **Over 500 000**, step 1 Anyone who may post journals, step 2 Any Finance Manager; Save limits, reason, confirm. **Expected:** Any Finance Manager is offered although FM cannot read roles under People; toast: change proposed.
**AL-L3** Ola (as the confirmer; or FM2): Approval limits > Confirm on Journals. **Expected:** band "Amounts over 500 000,00 · 2 · 1. Anyone who may post journals · 2. Any Finance Manager".
**AL-L4** Bjørn: Supplier payments, three steps over **1 000 000**: Any Finance Manager, then named person Ola, then anyone who may approve payments. Ola confirms. **Expected:** ladder shows the three steps in that order. Also set a refund limit (customer refunds over a small amount, two steps) the same way for AL-C/AC418-10.
**AL-P1** Ola: Stand-ins > Set my stand-in: FM2, supplier payments, today to next week. **Expected:** toast "{FM2} decides for {Ola} from … to …".
**B2a-S5** (R16 refresh on return; Ola = iPad Pro 13, Bjørn = iPad mini, portrait). 1. Bjørn: Journals, tap the Waiting to post chip. Ola: write and submit a small journal (under 500 000, so one person posts). **Expected:** Ola gets toast "Journal JV-DRAFT-… submitted"; Bjørn's list does not change yet. 2. Bjørn: Home, wait 3 s, reopen. **Expected:** the new journal is listed, chip count one higher. 3. Bjørn: toggle the chip off and on. **Expected:** counts equal the rows. 4. Ola opens the journal; Bjørn posts it; Ola: Home, 3 s, back. **Expected:** Ola's page shows Posted with Bjørn's name, no Post button.
**AC418-16** (bill, uses nothing earlier) Bjørn: Payables > Bills > New bill (Bergen Kontorservice AS, one line 1000 + 25% tax), Save, **Submit for approval**. **Expected:** the bill reaches Waiting for approval (not "We couldn't confirm"). 2. Open the bill, tap Approve. **Expected:** "You sent this for approval, so someone else must approve it."; no approval happens. Leave the bill waiting (Ola approves in R3, AC418-10).

## R2 · iPhone 18 Pro (anna, Accountant) + iPad mini (bjorn): submit the items
Anna signs in on the iPhone once; she writes everything that others decide later.
**AL-J1** Anna: journal **750 000,00** (debit 6300, credit 1920), open month, **Submit for posting**. **Expected:** toast "… submitted"; row "Waiting to post · 0 of 2 approved".
**AL-K1** Anna: submit a second journal of 750 000,00. **Expected:** same. (Bjørn must be the only Finance Manager at Kystgruppe, besides FM2 who is not asked; see N1.)
**AL-K2** Bjørn (iPad mini): open the second journal. **Expected:** no Approve, no Post; "You’re the only Finance Manager who can approve step 2. Leave step 1 to someone else." (Do this before Ola approves step 1 in R3.)
**AL-P2** Anna: supplier payment **1 200 000,00** to a supplier whose bank details changed in the last 30 days (see N3), **Submit for approval**. **Expected:** submitted.
**AL-C1** Anna: submit a customer refund over the refund limit set in AL-L4. **Expected:** submitted.
**B2a-S3p** (R31a, phone half) Anna: Journals > Recurring journals. **Expected:** tabs "Recurring" and "Automatic reversals n". Tap Automatic reversals. **Expected:** cards (not a table) with Reverses on, Journal, Memo, Amount, Approved by, Status.
**B2a-S2** (R02 soft keyboard, iPad mini, Bjørn) 1. Journals > Recurring > New: a Waiting-to-post journal (6300 D 5 000,00 / 1920 C 5 000,00, start 01.12.2026, reference "A4T-R02", a memo). 2. Leave the Credit cell focused with the **soft keyboard visible**, tap Save once. **Expected:** one tap saves (toast "Saved. Next journal on 01.12.2026.", detail opens). 3. A second one "A4T-R02b": close the keyboard first, tap Save once. **Expected:** one tap saves. 4. New journal ▾ > Import journals, tap Earlier imports once. **Expected:** it opens. If a step needs a second tap: note whether the side menu was opened before, screenshot.
**D1 (data for B2a-S3.3)** Anna: journal 1 000,00 with **Reverse automatically** on 22.11.2026 (today), submit. Bjørn posts it in R3.
**D2 (data for B2a-S4)** Anna: a recurring journal "A4T Old fee 2" that has ended and has a skipped date (see N2); Anna also keeps "needs you" state.
**D3 (data for B2b-1)** Anna: journal with three lines: one line branch Oslo, one branch Bergen (or other), one with no branch, balanced; submit (Bjørn posts in R3).
**D4 (data for B2b-10)** Anna: Journals > New journal ▾ > Import journals, upload a CSV, leave at the check step (do not discard). **Expected:** the upload shows as an import in Earlier imports.
**AC418-10a (prep)** Anna: submit a supplier refund, a write-off, a customer receipt and a supplier payment (small, over the relevant limit if any); note the Payables/Receivables menu badges for Bjørn and Ola before they approve (read them on the iPad mini now: Bjørn). **Expected:** badges count what waits for that person.

## R3 · iPad Pro 13 (ola) + iPad mini (bjorn; FM2 signs in here when named): decide
**AL-J2** Ola: open the first 750 000 journal. **Expected:** beside Waiting to post the tag "0 of 2 approved"; Approvals card: "Needs 2 approvals · 0 done", "Amounts over 500 000,00 · journal limits of {date}", **Why 2 approvals?**; step 1 "Next: you" in accent, step 2 "After step 1"; main button **Approve** (not Post).
**AL-J3** Tap Why 2 approvals?. **Expected:** Approval limits opens on Limits. Back to the journal.
**AL-J4** Tap Approve. **Expected:** gate "Approve JV-DRAFT-… (step 1 of 2)?", "Step 2 then goes to: Any Finance Manager. Nothing reaches the books until the last step posts it.", field "What you checked".
**AL-J5** Type "Checked against the freight contract", confirm. **Expected:** toast "Step 1 of 2 approved."; step 1 ticked with name, time and quote; "You approved an earlier step. Someone else approves step 2."; no Approve/Post; timeline "Approved (step 1 of 2) by {Ola}".
**AL-J6** Bjørn: open it. **Expected:** step 2 "Next: you"; button **Post**.
**AL-J7** Post, reason, confirm. **Expected:** toast "… posted as JV-2026-…"; status Posted; both steps ticked; timeline "Posted by {Bjørn} as JV-2026-… (step 2 of 2)".
**AL-K3** Ola approves step 1 of the second journal; Bjørn reopens. **Expected:** **Post** is offered.
**B2a-S3.3** (needs D1) Bjørn posts the D1 journal; Ola: Recurring > Automatic reversals, Status tick Posted (the reversal posts when due; if still waiting use Reverse now). **Expected:** the posted one reads "Posted as RV-…". Then Ola (iPad Pro 13 landscape): cancel a pending reversal: ⋯ shows only Cancel automatic reversal (Reverse now only when due/failed); give a reason. **Expected:** toast "Automatic reversal of JV-… cancelled.", row leaves the default list, tick Cancelled to see it.
**AL-P3** Bjørn: open the payment from AL-P2. **Expected:** Approvals "Needs 3 approvals · 0 done", "Amounts over 1 000 000,00 · supplier payment limits of …"; step 1 "Next: you"; step 2 names Ola and "Next: {FM2}, for {Ola} (away until {date})"; button Approve.
**AL-P4** Approve. **Expected:** sheet "Approve PAY-DRAFT-… (step 1 of 3)?", bank-details warning with required tick, note field.
**AL-P5** Tick bank details, confirm. **Expected:** toast "Step 1 of 3 approved."; "You approved an earlier step. Someone else approves step 2."
**AL-P6** FM2 signs in (on the iPad mini): payments list. **Expected:** row "Waiting for you · Step 2 of 3 · for {Ola}"; the Payables badge counts it.
**AL-P7** FM2 opens it, Approve (bank tick again), confirm. **Expected:** toast "Step 2 of 3 approved."; timeline "Approved (step 2 of 3), for {Ola} (stand-in)".
**AL-P8** Ola opens it. **Expected:** button **Approve** (last step), today's sheet with the bank tick.
**AL-P9** Confirm. **Expected:** payment posted; all three steps ticked.
**AL-C2** Bjørn approves step 1 of the refund (AL-C1). **AL-C3** Anna (iPhone, R2 device is idle: do it as FM2 on the mini instead if Anna is out): change the customer's bank details; FM2 approves the change. **AL-C4** Ola opens the refund, Approve, confirm. **Expected:** notice "{name} changed the customer’s bank details at {time}, so this approval was cancelled. The refund is back in drafts; …"; status **Draft**; timeline "Approval cancelled: the payee’s bank details changed".
**AL-O1** Bjørn: Limits > "The Company Owner's own items" > **Stop the Owner approving own items**. **Expected:** gate "Stop the Company Owner approving their own items?" (journals, supplier payments, customer refunds, one proposal each); reason field.
**AL-O2** Reason, confirm. **Expected:** toast "Proposed for Journals, Supplier payments and Customer refunds. Another person confirms each change."; each kind card shows "… Yes → No". If a kind already had a change waiting: notice names which were proposed or not.
**AL-O3** FM2 confirms each of the three. **Expected:** kind cards "The Company Owner may not approve their own items of this kind."; switch card says the Owner may not approve own journals, payments or refunds.
**AL-O4** Ola: journal over 500 000,00, submit, open. **Expected:** no Approve; "The approval limits don’t let the Company Owner approve their own journals. Someone else approves this one."
**AL-O5** Ola: new journal 750 000,00 in the editor, try **Post my own journal** (switch on first if needed). **Expected:** "This journal needs 2 approvals. Submit it first; then others approve it step by step." with **Submit for posting**.
**AC418-10b** (uses AC418-10a prep, AL-C and AC418-16) Ola approves: Bjørn's bill (AC418-16, bill), the supplier refund, write-off, receipt, supplier payment from AC418-10a. Bjørn then leaves the app (Settings) and returns on the iPad mini. **Expected:** each list (bills, refunds, write-offs, receipts, payments, supplier refunds) shows the row as decided and no longer under Waiting for approval, without a pull; the menu badges (Payables, Receivables, Journals) drop by the number approved.
**B2b-3** (R-stale filter; Bjørn iPad mini, Ola iPad Pro 13) 1. Bjørn: Reports > Trial balance, Cost centre = a test cost centre. 2. Ola: Accounts > Dimensions, deactivate and delete that cost centre. 3. Bjørn: close and reopen Accounts > Reports. **Expected:** the trial balance opens on defaults (current year, no branch/cost centre), not "We couldn't find this"; every tab opens.
**B2b-10b** Ola: Journals > Import journals > Earlier imports, open the D4 import, **discard** it with a reason. **Expected:** discarded. (Anna checks in R4.)

## R4 · iPhone 18 Pro (anna) + iPad Pro 11 (jonas.moe)
**B2b-10c** Anna: Import journals > Earlier imports. **Expected:** the discarded row says By "Ola Berg" (name as shown) with the discard time.
**B2b-1** Anna: Reports > Trial balance, Branch = Oslo (needs D3 posted). **Expected:** under the accounts "Other branches" and "Company-level lines (no branch)" as two italic rows; totals say Balanced. (The "Lines outside this filter" row with Cost centre OSL-OPS is B2b-2, dropped.)
**B2a-S4** (R31b, R25, R19; needs D2) Anna: Accounts > Journals. **Expected:** button "Recurring journals · n" with "n need you"; warning notice "n recurring journals need you: a date was skipped or couldn't be completed." with Open Recurring journals and Dismiss. Tap Open: the list (Active, Paused), chip "Needs you · n", below it "1 ended recurring journal needs you." with Show them; Show them: Status All statuses, A4T Old fee 2 listed Ended and Needs you. Back, tap Dismiss: gone until next sign-in.
**B2a-S6** (R23; Anna iPhone, Jonas iPad Pro 11) 1. Anna: open a draft journal, tick Reverse automatically, Save, keep the editor open. **Expected:** Submit for posting enabled. 2. Jonas: Settings > the company's features > switch **Recurring journals and accruals** off for Kystgruppe Nordic, with a reason. **Expected:** toast "Change recorded with its reason". 3. Anna: Home, wait 3 s, back. **Expected:** Submit for posting greyed with "Reverse automatically is part of Recurring journals and accruals, which is off for this company. Untick it to go on."; no old red banner. Jonas switches it on again.

## R5 · iPad Pro 13 (ola) + iPad Pro 11 (jonas, then erik.sand)
**B2b-14** Ola: Payables > Refunds received > Record refund received, keep the form open. Jonas: switch **Refunds, advances and write-offs** off for Kystgruppe. **Expected (Ola):** toast "Refunds, advances and write-offs were switched off." (not cut) with "This form was closed. Nothing was saved."; off page title "Accounts", crumbs "Companies / Kystgruppe Nordic / Accounts / Payables / Refunds received". Jonas switches it on again.
**AL-R1** erik.sand (Reader; N4) on the iPad Pro 11: Kystgruppe > Approval limits > Owner's decisions. **Expected:** table When · Kind · Item · Amount · Step · Reason, newest first (rows from AL-O/J if the Owner approved own steps); only the kind filter and More > Export the Owner’s decisions (CSV).
**AL-R2** Kind > Supplier payments. **Expected:** only payment rows. **AL-R3** More > Export the Owner’s decisions (CSV). **Expected:** CSV saved; toast that it was exported.
**AL-N1** (uses the state from AL-J1/J5) Erik opens the journal of AL-K1 (unposted). **Expected:** Approvals card with steps and names; no Approve, no Post, no line about a button. **AL-N2** Enter the company as Neovatus (read only). **Expected:** same.
**SW-A1** (needs N5: Ola member of Lahore Textiles with journal read/write) Ola, iPad Pro 13: select Kystgruppe Nordic, Accounts > Journals, open any posted journal. **Expected:** journal detail; breadcrumb ends with the journal number. Keep the gateway log open.
**SW-A2** Company chip: Lahore Textiles. **Expected:** the Journals list of Lahore (tabs All, Drafts, Waiting, Posted; Lahore figures); no Kystgruppe detail, no "We couldn't find this", no error toast, no skeleton left.
**SW-A3** Gateway log. **Expected:** no `GET /api/accounts/journals/<Kyst id>?companyId=<Lahore>`, no 404; Lahore's list and summary calls are there.
**SW-A4** Switch back to Kystgruppe. **Expected:** the Kystgruppe Journals list, not the old journal.
**SW-B5** Kystgruppe: Journals > Drafts, open a draft, change nothing, switch to Lahore. **Expected:** Lahore Journals list, no editor ("Leave this page?" if edited: Leave); no wrong request in the log.
**SW-B6** At Lahore: New journal, then switch to Kystgruppe. **Expected:** the Kystgruppe list; no draft created.
**SW-C7** Stockholm Handel (SIE import; sara.lind or erik.berg on the iPad Pro 11, with Ola's member company switch if allowed): Journals > Import history, open an import, switch company. **Expected:** the other company's Journals list; no request for that import id. (If no multi-company Swedish user exists: DATA, see N5.)
**SW-D8** Lahore: Reports > Trial balance, switch to Kystgruppe. **Expected:** Kystgruppe's trial balance.
**SW-D9** Chart of accounts, Fiscal calendar, Tax codes (Dimensions if on): switch company on each. **Expected:** the new company's data after a short load; nothing old flashes.

## R6 · iPad Air 13 (ayesha, Lahore Textiles) + iPad Pro 11 (omar, Lahore Textiles FM)
**B2b-5** (needs N6) Ayesha: Journals > Imported files > the CSV opening-balance import > Held out > Enter as opening items (Customers) > check > Create as Waiting for approval > Create. **Expected:** "2 balances created."; Back to receivables opens the Receivables Invoices list (not a blank Import opening balances wizard).
**B2b-6** Open that import again (same session). **Expected:** Customers' balances says "Entered as opening items. …", no Enter as opening items button.
**B2b-16a** Same session: open Payroll and come back; switch company and back. **Expected:** "Entered as opening items" stays. (The after-restart half already passed.)
**B2b-17** Ayesha: Import opening balances with the CSV containing 1925 Meezan savings account (N7). **Expected:** row "This account can't be created from an import. Map the row to an existing account, or create the account first (a bank account needs its bank details)."; only the picker is offered.
**AL-PK1** Omar (FM): Supplier payments over **5 000 000** two steps; Ayesha confirms. **AL-PK2** An accountant at Lahore (N8) submits a payment of **7 500 000.00**; Omar opens it. **Expected:** "Amounts over 5,000,000.00 · supplier payment limits of …"; comma grouping and a point, never spaces.
**OBS-1** (observation) On the iPad Pro 11 and iPad Air: open a few report and list pages (Reports tabs, lists). **Expected:** rows load without needing a tap; skeletons do not stay until you tap. Note the load time and the load average. **OBS-2** Ayesha: Import opening balances > Download the template, choose Excel, save. **Expected:** the saved file is named `.xlsx` (it was `.csv`); CSV choice stays `.csv`.

## R7 · iPhone (ola) + iPad Pro 13 (ola)
**SW-phone** Repeat SW-A1 to SW-B6 on the iPhone as Ola (journal detail switch, editor switch, New journal switch). **Expected:** as above, no wrong-company request.
**AL-Lang** iPad Pro 13: Settings > On this device > Language Norsk, Svenska, Dansk; repeat AL-J2 (a waiting journal) and AL-P3. **Expected:** "Trenger 2 godkjenninger · 0 gjort", "Behöver 2 godkännanden · 0 klara", "Kræver 2 godkendelser · 0 klaret" and gates and toasts in that language. Set back to English.

## Dropped as duplicate / already passed (35)
- AC418 steps 1–14 and 17–20 (18): PASS on App bbb1dd5b + BE 095a8989 in `test-ledger.md`; this batch does not change exact dates, period panels, cards, PRJ-9 picker, recurring memo, tax defaults. AC418-12/13/14 (opening-balance wizard) overlap B2b-5/6, which retest the changed hand-off instead.
- AC418-15 (1): the company-switch-from-Reports PASS (App 8356aba9) is kept as SW-D8 because FIX-APP-SWITCH changes the switch code.
- AC418-16a (bill creates as Draft) and 16d (journal banner, record only) (2): PASS in the retest; 16b/16c run as AC418-16.
- B2a S1, S7, S8 (3) PASS in the lane verdict; S3 iPad half (steps 1–10 except 3.3) (1) PASS; S2 steps without soft keyboard (a hardware-keyboard PASS), kept only as the soft-keyboard run (1).
- B2b 2, 4, 7, 8, 9, 11, 12, 13, 15, 12-phone (10) and the after-restart half of 16 (1) PASS in the b2b verdict.
- Merged (not counted): AL-P6 badge with AC418-10 (the payments badge); B2a-S6 and B2b-14 share one Jonas feature switch each in R4/R5; AL-N1 reuses AL-J1/J5 state; AL-Lang reuses AL-J2/P3 state; SW-A..B repeats on phone as one step.

## Needs data first
- **N1** FM2: a second Finance Manager at Kystgruppe (`IAM.ACCOUNTS_ADMIN`, username to be added by the lead before R1). Demo data has only Bjørn as FM. Needed for AL-L3/L4, P1, P6, P7, O3, C3. Without FM2 use Ola for confirms and skip AL-P6/P7 (DATA).
- **N2** An ended recurring journal with a skipped date (B2a-S4): create in R2 (D2); needs the scheduler to skip a date (e.g. Period closed for the skipped month). If it cannot be made in the UI the lead seeds it in BE.
- **N3** A supplier whose bank details changed in the last 30 days (AL-P2): edit a supplier's bank details in R2 before submitting.
- **N4** "Reader" = APPROVAL_LIMIT.READ only: erik.sand (Neovatus read-only) or a new Accounts Viewer at Kystgruppe; the lead confirms which can open Kystgruppe Approval limits and Owner's decisions.
- **N5** A person who is a member of two companies in different countries with journal rights (Ola + Lahore Textiles; the demo has Omar only in two Pakistani companies) and a multi-company Swedish SIE case (SW-C7). The lead adds the membership.
- **N6** B2b-5/6: Lahore Textiles already has a first opening-items set; the step would create a second set. The lead resets that import or provides a fresh company with an unentered opening-balance import.
- **N7** A CSV with account 1925 on the iPad Air (copy to the simulator Files app); the testers' CSVs from AC418 are in the old scratchpad, recreate.
- **N8** An accountant at Lahore Textiles for AL-PK2 (none in the demo list); Omar can write it only if he is not the approver.
- **D1–D4, AC418-10a** are created inside R2, used in R3/R4.

## Count and time
Steps: S0 2, R1 7, R2 13, R3 29, R4 4, R5 17, R6 8, R7 2 = **82 steps** (some have sub-steps: 31 numbered clicks are inside the grouped IDs).
Estimate: about 3 h 30 min of testing at one tester per device (R1 20, R2 30, R3 55, R4 15, R5 35, R6 25, R7 10, setup and sign-ins 20), plus 20 min for the lead's data work (N1, N5, N6). Split into two tester runs (R1 to R3 and R4 to R7) so no tester session runs over 2 h.
