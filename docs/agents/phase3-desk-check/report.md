# Phase 3 test script desk check (Opus, read-only, 2026-11-15)

Script: `docs/agents/phase3-test-steps.md`. Code: `fix/phase3-test-fixes` in both repos. No runs, no database.

## Code problems
1. **T8 1–6, T10 5 — Owner sees no features in Company → Modules.** `NeoERP-App/.../CompanyModulesTab.kt:163` draws "Module detail" (features, Required by law, Add-on/Bought tags) only when `canEdit` (`pg.entitlementWrite`, staff only, `CompanyDetailAccess.kt:97`). `docs/agents/fe-plan/plan.md:97,180` says the Owner sees "Required by law". Ask Neovatus (`NeoSmartContentArea.kt:228`) lands there with nothing to ask about. Fix: module detail read-only for non-staff (Owner paths at :453-470 exist).
2. **T14 6 — "Create account 1925" offered, server always refuses.** Server copies an ordinary account in the same 2-digit group (`SieMappingRules.kt:139-170`, `likeAccount` needs `controlKind == NONE`); PK group 19 is all BANK control (`packs/2026.2/pk.csv:66-72`) → NOT_CREATABLE. App draws the button on every unmapped row (`obimport/ObImportPages.kt:48-50`); server sends only a count (`SieImportPreviewer.kt:475-480`). Fix: per-row `creatable`, show button only then. Knock-on T15 5.
3. **T21 1–2, T22 1 — "Vessel" (company dimension) can never be picked.** Slot offered only when the account allows it (`DimensionCatalog.kt:150`, `DraftDimensionCheck.kt:105-108`); no pack account allows company slots; dimension setup adds the slot to no account (`DimensionMaintenanceService.kt:261-279`); Add account offers branch/location/cost centre/project only (`AccountsTabWords.kt:233-238`); backend refuses changing an account's allowed dimensions (`ChartController.kt:111-127`). Only seed account 3090 takes slot 1. **Design decision needed.**
4. **T21 3 — journal Cost centre picker offers group-only entries.** `JournalsPageHolder.kt:183-186` filters ACTIVE only; app model drops the group-only flag (`AccountsA1Dtos.kt:348-356`, `JournalModels.kt:424`) though the backend sends it (`DimensionDtos.kt:41`). Invoice/bill pickers do filter.
5. **T3 3 — waiting write-off shows no number on the invoice.** `SalesDocumentDetail.kt:202-207` uses `numberDisplay.orEmpty()`; backend sends `draftRef` (`ReceivablesJson.kt:143`) but `LinkedCreditNoteDto` (`SalesDocumentDtos.kt:102`) lacks it. Fix: `numberDisplay ?: draftRef`.
6. **T4 5 — receipt footer "stays on the customer’s account"** instead of the customer's name (`strings_accounts_receipt.xml:88`, `ReceiptEditorScreen.kt:213`; spec `accounts-b-c.md:652`).
7. **T7 5 — trial balance balancing row always "Other branches and lines without a branch"** even under cost centre/project filters (`TrialBalanceState.kt:276`, `strings_accounts_report.xml:351`).
8. **Wording — "Any Project" / "Any Sales channel"** capital after Any (`strings_accounts_report.xml:315`).
9. (Lead, from Jabran's T2 screenshot) **Refund detail shows a stray "You don’t have the right to do this." line** under the facts when Reverse is refused; and the "What it paid back" payment link is indented (ghost padding).

**Decision (T4 2, 6):** Owner's own approval while a second approver exists: server closes it only for refunds and bank-detail changes (`RefundApprovalService.kt:123`, `CustomerBankChangeService.kt:191`); invoices/receipts allow it once confirmed (`DocumentApprovals.kt:36-48`).

## Script problems (to apply to the test steps)
Preamble item 2 stale (Tags toggle with Cost centre/Project/company dimensions on invoice/bill lines; journal grid columns; report filters with Untagged).
- T1: 2 heading/block shown from the start; 3 option reads "NO-ADV-OOS-IN · No VAT on this advance", warning text "No VAT can be claimed without the supplier’s prepayment invoice number and date…"; 4 panel closes, list opens on waiting tab, toast "{ref} sent for approval." / "Someone else approves it.", row No bank details, opening it shows the "You wrote, changed or sent this payment…" line; 6 Advances table ("2 open · 5,500.00", Deduct oldest first, columns Advance · Date · What it’s for · Open, Deduct per row, total 12,500.00); 7 Deducted on this document, hint "All of this advance is used.", footer "Advance deducted 2,500.00 · left to pay 10,000.00"; 8 Approve opens "Approve {ref}?" sheet; 9 Deducted −2,500.00 / Open 0.00, "{BILL} deducted −2,500.00" link, Reverse disabled with the long reason.
- T2: 1 Posted chip only (Drafts/Reversed appear when present); 3 Pays back is a sub-heading with Everything, row "Credit with supplier · {date}", Left 1,000.00; 4 Everything also sets Amount; 5 sheet "Post refund for NOK 400.00?" / "…goes into the books for {period}."; 7 title = number, subtitle "Refund received from a supplier"; Anna sees Reverse disabled "You don’t have the right to do this." (Accountant lacks payment reverse, user V43 l.9,138), no Delete draft; 8 Suppliers list We owe (NOK) −600.00 or Statement.
- T3: 3 write-off page opens after Submit; invoice shows "Write-off {ref} · Waiting for approval" with Open; 4 status Waiting for approval; Anna always gets "You wrote, changed or sent this write-off…" + Withdraw to draft.
- T4: 2 Omar sees "Approve my own invoice" (don't click); 5 footer per code 6; 6 "Approve my own receipt"; 7 toast "{number} posted.".
- T5: 5 read On account column in Customers (20,000.00 → 15,000.00).
- T6: 1 Tags toggle offers Cost centre and Project (Sales channel only on 3090), drop "known gap"; 2 same; 4 source fact "{module} · Sales invoice {number}", columns Cost centre/Project/Sales channel; 5 899.00 line Project; 6 Project and Sales channel columns, Sales channel disabled on expense accounts.
- T7: 1 filters list (Fiscal year, From, To, Branch if >1, Cost centre, Project, Sales channel, Compare, Group by, Show empty lines); 7 delete (T23 covers).
- T8 (if code unchanged): run as `jonas.moe` via Platform → Companies → Modules; 6 Ayesha sees "Neovatus sets the company default…".
- T9: 1–2 ticked box / Untick; 3 "Features · {n−1} of {m} on".
- T10: 4 warning tone, Owner gets Ask Neovatus only; 6 "Ask your company admin to turn on Refunds and advances."
- T11: 2 name parties (Nordlys Bygg AS invoice, Fjord Energi AS bill); card only with open advances.
- T13: 1 Excel preselected at Lahore (switch Excel | CSV); 2 file `opening-balances-{company code}.csv`, save dialog then toast.
- T14: 5–6 pick 1930 for the 1925 row until code 2 fixed; 7 Difference 0.00, held-out 50,000.00 goes to 2098.
- T15: 5 "2098 Opening balance equity 50,000.00 Dr"; replace 1925.
- T16: intro drop fallback; Held out card → Enter as opening items; file `opening-items-ar-lahore-tb.csv`.
- T17: 1, 4 switch to CSV; 2 drop Excel hint check; 3 "Import discarded" is a status pill.
- T18: intro SIE included for Sweden; 2 switch SIE | Excel | CSV, hint "SIE file (.se) exported from your previous program. Up to 50 MB."; 4 What the file holds fields (no Currency/Version), no Date card, Year to use; 5 rows 1930 98,750.00 Dr, 2081 100,000.00 Cr, 2641 250.00 Dr, 6110 zero, Difference 1,000.00 → 2099 (or 2009).
- T19: 1 Sales channel already set up; 2 toast "P-100 Harbour crane added", button Create project; 3 row Inactive, reason in the panel; 4 codes `OPS` group-only then `CRANE` part of Operations.
- T20: 1 Vessel = company dimension 2, button Set up dimension; 2 codes `FJORD`, `KYST`; 4 next free slot 3.
- T21/T22: Vessel per code 3; T22 1 click Tags; 4 nothing offered on advance lines (2900/1480 branch only).
- T24: 2–3 precondition Stockholm live and `sara.lind` created a cost centre and a project.

## Can't tell from code (needs a run)
T1 4 No bank details pill; T1 8 deduction display; T3 2 VAT split on 1,500.00; counts including BE-14 data (T2 1, T3 1, T7 2–6, T13 5); T4 3 Sialkot STRN; T4 4; T5 2 and 6; T6 3 number format; T8 4 Budgets Not bought; T9 7 / T11 2; T10 3; T12 2 / T18 1 go-live dates; T14 6 To do; T16 2, 5; T20 5; T23 1.

## Steps right
T1 4/9 · T2 3/8 · T3 6/8 · T4 3/8 · T5 5/6 · T6 2/6 · T7 5/7 · T8 0/6 · T9 6/8 · T10 3/6 · T11 2/3 · T12 2/3 · T13 3/5 · T14 5/7 · T15 4/5 · T16 4/5 · T17 2/5 · T18 3/7 · T19 3/6 · T20 2/5 · T21 0/4 · T22 3/4 · T23 4/4 · T24 1/3. Seed amounts and the people table match.

## Decisions (Jabran 2026-11-15, lead's recommendations)
1. **Item 1 (T8):** the Owner (non-staff) sees Company → Modules → Module detail **read-only**: features, Required by law, Add-on / Bought / Not bought. Staff keep editing.
2. **Item 3 (T21):** Chart of accounts lets an account **switch a company dimension on**; switching it off is refused once posted lines carry that dimension. Backend + app.
3. **Owner's own approval (T4):** unchanged for Phase 3 (Owner's own with confirmation and history). The stricter "never while another approver exists" company setting belongs to Phase 4 approval limits (AL-D18).
Queue: items 1 and 3 start after the current fix builder (2, 4–9) finishes (one Gradle builder per checkout).
