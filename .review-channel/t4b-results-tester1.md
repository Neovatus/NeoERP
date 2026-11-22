# T4b results, tester 1

Devices: iPad Pro 13 (ola), iPad mini (bjorn/kari swapped), iPhone 18 Pro (anna). Local stack, 2026-11-22.

| Step | Feature | Device/user | Result | What I saw |
|---|---|---|---|---|
| P4 | Approval limits switch | iPad Pro 13 / ola | PASS | Company > Modules > Finance: Approval limits already On; Accounts > Approval limits opens |
| AL-L2 | Limit proposal (UI) | iPad mini / bjorn | PASS | Journals band over 500 000, step 2 "Any Finance Manager" is offered; "Change proposed" shown |
| AL-L3 | Confirm journals band | iPad Pro 13 / ola | PASS | Ladder "Amounts over 500 000,00 · 2", toast "The new limits are in force." |
| AL-L4 | Payments 3-step band | mini bjorn proposes; kari confirms | PASS (note) | Ola is named in the band so he cannot confirm ("You're named in this change..."); Kari confirmed. Expected by rule (coordinator). Ladder lists 3 steps in order |
| AL-P1 | Stand-in (UI) | iPad Pro 13 / ola | PASS | Kari decides for Ola 22-29 Nov, Supplier payments, Active. LOW: first open of "Add stand-in" showed a blank checked row in "Who is away" until people loaded (shot t4b-AL-P1-whoisaway-blank.png) |
| AL-P2 | Bank change + 1.2M payment (UI) | iPhone anna, mini kari | PASS | Bank change asked by Anna, approved by Kari; PAY-DRAFT-000039 "0 of 3 approved · Bank details changed" |
| AL-J1 | Submit 750 000 journal | iPhone / anna | PASS | JV-DRAFT-000040 toast "Journal JV-DRAFT-000040 submitted"; row "Waiting to post · You wrote it · 0 of 2 approved". (Doc reference needs a document date: expected) |
| AL-J3 | Why 2 approvals? | iPad Pro 13 / ola | PASS | "Needs 2 approvals · 0 done"; link opens Approval limits on Limits |
| AL-J5 | Ola approves step 1 (UI) | iPad Pro 13 / ola | PASS | Gate "Approve JV-DRAFT-000040 (step 1 of 2)?", note kept, toast "Step 1 of 2 approved" |
| AL-J7 | Bjorn posts step 2 | iPad mini / bjorn | PASS | Toast "Journal posted as JV-2026-000005"; both steps ticked; timeline "Posted by Bjorn Eriksson as JV-2026-000005 (step 2 of 2)" |
| AL-P5 | Bjorn approves payment step 1 | iPad mini / bjorn | PASS (see note) | Bank tick required; toast "Step 1 of 3 approved." Timeline on the payment page reads "Approved and posted (step 1 of 3)" - misleading wording, LOW |
| AL-P6 | Stand-in: Waiting for you | iPad mini / kari | FAIL | Kari's list shows PAY-DRAFT-000039 as "Waiting for approval · 1 of 3 approved", not "Waiting for you · Step 2 of 3 · for Ola"; "Waiting for you" filter excludes it. Ola's own list shows "Waiting for you · Step 2 of 3". Shot t4b-AL-P6.png |
| AL-P7 | Stand-in approves step 2 | iPad mini / kari | FAIL | Kari opens it: no Approve button, text "You're the only one who can approve step 3. Leave step 2 to someone else." Stand-in for a named person is not honoured. Shot t4b-AL-P7.png |
| AL-P9 | Last step approval | ola step 2, kari step 3 | PASS (adapted) | Because of P7, Ola approved step 2 and Kari step 3 (button "Approve payment" with bank tick). Toast "Payment PAY-2026-000004 approved"; all three steps ticked |
| AL-O1 | Stop Owner approving own items | iPad mini / bjorn | PASS | Gate text as expected; toast "Proposed for Journals, Supplier payments and Customer refunds..."; cards show "Yes -> No" |
| AL-O3 | Kari confirms 3 proposals | iPad mini / kari | PARTIAL | Journals and Customer refunds confirmed ("The new limits are in force"). Supplier payments: Kari cannot ("named in this change, or stand in for someone who is") and Ola is named, Bjorn proposed: nobody can confirm it in the demo data. Needs a decision (see main) |
| B2a-S3.3 | Auto reversal cancel | iPad Pro 13 landscape / ola | PARTIAL | Cancel half PASS: row menu shows only "Cancel automatic reversal" (not due), reason gate, toast "Automatic reversal of JV-2026-000006 cancelled", detail "Cancelled by Ola Nordmann". Post half (RV-... after Bjorn posts D1 journal) NOT RUN: no journal due today (D1 not made) |
| B2a-S6 | Feature off -> draft note | jonas iPad Pro 11, ola iPad Pro 13 | FAIL (refresh) / PASS (text) | Jonas switched Recurring journals and accruals off (toast "Change recorded with its reason"). Ola: Home, wait 5 s, open draft with Reverse automatically ticked: Submit still enabled, no grey note (t4b-B2a-S6.png). After cold app restart the note appears, ends "Untick it to go on.", Submit disabled (t4b-B2a-S6-after-restart.png). So refresh-on-return does not work. Feature switched back on |
| SW-A1 | Company switch Kystgruppe -> Lahore | iPad Pro 13 / ola | PASS | From a Kystgruppe draft journal, chip to Lahore Textiles: Lahore Journals list (PKR), no Kystgruppe detail, no error, no skeleton; switch back shows Kystgruppe list. Gateway log not checked |
| SW-B6 | New journal at Lahore then switch | iPad Pro 13 / ola | BLOCKED | Ola is "Accounts Viewer" at Lahore: no New journal button (data N5 not seeded as read/write) |
| AL-R3 | Owner's decisions CSV | iPad Pro 11 / erik.sand | BLOCKED (DATA N4) | erik is Platform admin only; Platform admin > Companies > Kystgruppe has no Enter company, Approval limits not reachable |
| AL-Lang | Language nb/sv/da | iPhone / anna, Norsk, xxxl text | PARTIAL | Norsk applies at once (menus, Innstillinger, journal detail "Venter pa bokforing", Godkjenningsgrenser). No item with approval steps left, so "Trenger 2 godkjenninger" not seen. Svenska and Dansk NOT run. Menu item "Approval limits" stays English in Norsk |
| AC418-10b | Decided rows leave Waiting | - | NOT RUN | Prep only partial |
| B2b-3 | Reports stale filter reload | - | NOT RUN | Needs two-user cost-centre delete scenario |
| AC418-10a prep | Anna submissions | iPhone / anna | PARTIAL | Supplier payment PAY-DRAFT-000041 (100) submitted and waiting. Customer receipt and supplier refund received post directly (one-person flow); customer refund and write-off not submitted |

## A11Y findings (iPhone, accessibility-extra-extra-extra-large, Norsk)
- A11Y-1 Top bar: company and user names cut ("Kystgrupp...", "Anna Lindh ...").
- A11Y-2 Journals header: "Ny journal" button cut to "Nyt...".
- A11Y-3 Journal cards: document number wraps mid-token ("PAY-2026-0000 / 04"), memo ends with ellipsis.
- A11Y-4 Settings: language picker value cut ("Device lang...").
- A11Y-5 Top bar: search icon on iPhone small target (about 20 pt).
- A11Y-6 (i18n) Menu "Approval limits" not translated in Norsk.
- A11Y-7 (LOW, iPad) Add stand-in "Who is away" list first shows a blank row.
Unnamed controls via accessibility tree: not checked (screenshots only).

## Other notes
- AL-P5: payment timeline reads "Approved and posted (step 1 of 3)" before it is posted (LOW wording).
- kari.hansen session needed re-issue after about 30 min.
- Minutes: R-AL incl. setup about 95, R-SW about 10, R-misc about 15, AL-Lang about 10.
