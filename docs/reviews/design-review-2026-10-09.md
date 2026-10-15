# Design review: Accounts B–E and HR drop 1

ERP lead, 2026-10-09. A product and flow review of the clickable Screen Rig against the specs. Five reviewers clicked through the rig at desktop and phone widths, using the Norwegian (Kystgruppe), Pakistani (Lahore, Sialkot) and HR demo companies, every persona and every screen state. This is not a code review.

## Verdicts

| Area | Verdict | Blocking items before approval |
|---|---|---|
| **B Receivables** | Ready after small fixes | none; 6 Majors are layout, wording or data |
| **C Payables** | Ready after small fixes | none; 7 Majors, mostly around the bank-details guard and duplicates |
| **D Bank and cash** | Approve after 2 fixes | BNK-1 (Finish reconciling with almost nothing reconciled), BNK-2 (the cash count is really the bank-statement form) |
| **E Tax report and returns** | Not ready yet (fixable, no rethink) | TAX-1 no due dates (NO, PK), TAX-2 opens on the unfinished period, TAX-3 no link between live figures and a filed return, TAX-4 PK annexes don't add up to the boxes |
| **Reports (A3 part)** | Rig behind the latest A3 design | TAX-16: P&L and balance-sheet layouts and the cash-flow tab still need the lead's A3 pass |
| **HR drop 1** | Approve with changes | HR-1/2/7 bank-change fraud controls, HR-3 job change blocked by a scheduled future change |

The core daily flows work end to end in every area:
- **Receivables:** invoice → approve → post → receipt → allocate → statement → ageing.
- **Payables:** bill → duplicate check → approve → pay.
- **Bank:** import → match → report.
- **Tax:** period → check → prepare → file → settle.
- **HR:** hire → job → pay → app access → self-service.

The wording is plain and the states are complete. The work left is detail, not redesign.

## Patterns that repeat across areas (fix once, everywhere)

| # | Pattern | Seen in | Fix |
|---|---|---|---|
| X-1 | **Date inputs are ISO** ("YYYY-MM-DD"), while tables show the company format. Typed 15.10.2026 is silently ignored | RCV-5, PAY-10, BNK-4, TAX-19 | Apply E2 (building-blocks "Typing dates") to every date field in the rig: placeholder and input in the company format, ISO also accepted, an error when unreadable |
| X-2 | **Line grids squeeze Qty, Unit and Tax** at 1440 (25 reads as "2") | RCV-1, PAY-1 | Minimum widths for Qty, Unit and Tax; Account and Cost centre on a second row |
| X-3 | **A writer can't withdraw their own submitted document** | RCV-4, PAY-15 | "Withdraw" back to draft while it's waiting (no reason needed) |
| X-4 | **Disabled or hidden actions without a reason** | RCV-8, PAY-5, BNK-13 | Every hidden or disabled action says who can do it (building-blocks rule) |
| X-5 | **Bank-detail changes** (suppliers, customers, employees): weak confirmation, the old → new account isn't shown, direct edits skip approval | PAY-2, PAY-6, PAY-8, HR-1, HR-2, HR-7, HR-9 | One **shared bank-details-change pattern** (ERP lead writes it): masked old → new, the reason, a second person approves, an "I confirmed it with the owner" tick, re-authentication for self-service, an audited reveal, a notice to the owner of the account, and the details still visible (masked) after posting |
| X-6 | **Demo data contradicts itself**, so "agrees with the books" can't be shown | RCV-2, TAX-4, TAX-8, TAX-15, PAY-17 | A data pass: statement = balance = ageing; tax → TB → GL agree; valid KIDs |
| X-7 | **Country lists show codes** (IS, GB, DE) | RCV-12, PAY-9 | Country names |
| X-8 | **"withheld 0,00" shown in Norwegian companies** | RCV-13, PAY-13 | Hide withholding when the company has no withholding code |
| X-9 | **Phone:** the active tab is scrolled out of view, filters fill the screen, cards are full of 0,00 rows | PAY-16, RCV-16, BNK-8, TAX-14 | Scroll the active tab into view, put filters in a sheet, hide empty rows on cards |

## Feature gaps a bookkeeper will ask about on day one

These are scope questions, not bugs. Each lead should decide: in this slice, or a named later slice with a placeholder on the screen.
- **Receivables (RCV-18):** reminders and dunning (Nordic purring, reminder fee, late interest), copy or recurring invoice, credit note without an invoice, unidentified receipts, sending statements.
- **Payables (PAY-7):** a debit note not tied to a bill (supplier rebates).
- **Tax (TAX-7):** paying the return (KID / CPR-PSID, Paid status, link to the bank entry).
- **Tax (TAX-13):** PDF and Excel export of the return.
- **HR (HR-5, HR-6):** probation end and contract end dates, work calendar, PK EOBI and PESSI/SESSI numbers.

## Full findings by area

### B Receivables
| id | sev | finding | fix |
|---|---|---|---|
| RCV-1 | Major | Invoice line grid at 1440: Qty 27px ("25" reads "2"), Unit invisible, Tax and Discount truncated, Cost centre cut off | X-2 |
| RCV-2 | Major | Customer statement doesn't reconcile with the balance and ageing (89,503.49 vs 95,403.49); a credit note and an advance are missing; the opening row is at the bottom | Statement = balance = ageing; opening row first |
| RCV-3 | Major | "Credit everything left" credits the whole invoice, not what's still open | Rename it; add "Credit what's still open" |
| RCV-4 | Major | The writer can't withdraw a submitted invoice | X-3 |
| RCV-5 | Major | Date inputs are ISO | X-1 |
| RCV-6 | Major | Receipt "Withheld from" field collapses at 390 and isn't prefilled | Stacked field; prefill the base |
| RCV-7 | Minor | After Submit the Waiting tab hides the new invoice ("Only mine" filter on) | Turn the filter off or highlight the new row |
| RCV-8 | Minor | Reject disabled with no reason; read-only roles see disabled Credit and Write off with no reason | X-4 |
| RCV-9 | Minor | No More menu after approving until the page is reloaded | Rebuild actions from the re-read |
| RCV-10 | Minor | Ageing control strip: green dot with two different advance figures | Same net-of-VAT basis, or explain |
| RCV-11 | Minor | Advance labelled "On account" while the On account tile says 0.00 | "Advance · open" |
| RCV-12 | Minor | Customer sheet shows raw "{2} %" placeholders; country codes; address line 2 and region missing | Fill them in; X-7 |
| RCV-13 | Minor | "slice D" jargon on screen; NO shows "withheld 0,00"; mixed words | X-8; one vocabulary |
| RCV-14 | Minor | Posted invoice period "—"; "Written by" without a time | Data |
| RCV-15 | Minor | Credit notes list has an always-empty Due column; missing counts and links; Account column wraps; no ageing search | List polish |
| RCV-16 | Minor | Ageing cards on phone show 9 rows of mostly 0.00 | X-9 |
| RCV-17 | Minor | Spec cross-reference and PK percent format | Spec fix |
| RCV-18 | Major (scope) | Dunning, recurring invoices, credit without an invoice, unidentified receipts, sending statements | Decide (see gaps) |

### C Payables
| id | sev | finding | fix |
|---|---|---|---|
| PAY-1 | Major | Bill line grid: Qty 25px, Unit blank, Cost centre clipped | X-2 |
| PAY-2 | Major | Bank-change warning shows no old → new and no reason; approving needs no confirmation | X-5 |
| PAY-3 | Major | Duplicate bill has no way forward; the contract's "supplementary bill" is missing in the UI | "Enter as supplementary bill" |
| PAY-4 | Major | Duplicate check misses "BE20931" vs "BE-20931" | Strip punctuation and leading zeros (contract change) |
| PAY-5 | Major | Approve hidden from the Accountant with no reason | X-4 |
| PAY-6 | Major | Payee bank details vanish after posting; no copyable transfer details | X-5 masked snapshot + "Transfer details" |
| PAY-7 | Major | No debit note without a bill (rebates, goodwill) | On-account debit note |
| PAY-8 | Minor | Bank edit lacks the consequence text; IBAN and account number not cross-checked | X-5 |
| PAY-9 | Minor | Country codes; "Buyer type" on a supplier; no bank-change history | X-7; hide; add history |
| PAY-10 | Minor | Date inputs ISO; a typed Nordic date is ignored | X-1 |
| PAY-11 | Minor | "Due in 30 days" counts from the bill date; seed due date wrong | Clearer copy; fix the seed |
| PAY-12 | Minor | "Same as the date"; "Posted on" shown before posting | Wording |
| PAY-13 | Minor | Amount not in the Before you approve card; "withheld 0,00" in NO | Put the amount in the card; X-8 |
| PAY-14 | Minor | Pointless "Waiting · 0" tab for refunds received; wrong noun in the connection message | Remove; fix wording |
| PAY-15 | Minor | Writer can't withdraw a submitted bill | X-3 |
| PAY-16 | Minor | Phone: active tab off screen, filters fill the screen, tall footer | X-9 |
| PAY-17 | Minor | Seed KID invalid; reference-duplicate warning not shown | X-6 |

### D Bank and cash
| id | sev | finding | fix |
|---|---|---|---|
| BNK-1 | **High** | Finish reconciling allowed with 2 of 8 lines matched; lines with exact suggestions get carried forward | Carry only lines without a suggestion; state the carried count and amount |
| BNK-2 | **High** | Cash count reuses the bank-statement form; no counted amount, denominations, counted-by or over/short entry; no Edit details for cash boxes | Real cash-count sheet + over/short entry; cash-box details and status words |
| BNK-3 | Med | Green "0,00" difference while lines are still unmatched; report double-lists pairs | "Still to explain: 6 bank / 4 book lines" |
| BNK-4 | Med | Date inputs ISO | X-1 |
| BNK-5 | Med | Match bar wording wrong (singular); signs differ from the grid | Spec wording; same signs |
| BNK-6 | Med | Drafts created from statement lines aren't shown on the lines (risk of double entry) | "Draft BK-… waiting to post" with a link |
| BNK-7 | Med | PK CSV dates dd-mm-yyyy and dd-MMM-yy not read | Add the formats per bank template |
| BNK-8 | Low | Reconcile layout: status wraps, reference shown twice, tall phone cards, no search | Layout polish |
| BNK-9 | Low | "No VAT on this line?" on never-taxable lines; PK says VAT | Default tax code per account; country word |
| BNK-10 | Low | s.151 footer: net bigger than money in, unexplained | "Profit − withheld = bank receives" |
| BNK-11 | Low | No running balance on book lines; header too tall | Balance column; compact facts |
| BNK-12 | Low | Below-zero banner has no action | Links to cash count and book lines |
| BNK-13 | Low | Unreconcile while a later statement is open; no consequence text; hidden without a reason | Consequence line; X-4 |
| BNK-14 | Low | PK import hint mentions camt.053 | Country wording |

### E Tax report and reports
| id | sev | finding | fix |
|---|---|---|---|
| TAX-1 | **High** | No due dates for NO and PK returns; an unfiled due return isn't flagged | Due column and "Due {date}", with due-soon and overdue tones |
| TAX-2 | **High** | Opens on the unfinished current period | Default to the oldest ended unfiled period |
| TAX-3 | **High** | No link between live figures and an existing return; "books moved since filing" not shown | Banner with Open return / Start a correction |
| TAX-4 | **High** | PK annexes have no totals and don't tie to the boxes; no document date | Totals row = box check; Document date column |
| TAX-5 | Med | PK adjustments table empty while the boxes show adjustments; confusing note | Generate the rows; rewrite the note |
| TAX-6 | Med | Prepare return enabled when nothing can be prepared; wrong reason shown | Disable with the real reason |
| TAX-7 | Med | No payment step after filing (KID, CPR/PSID, Paid status) | Payment record linked to the bank entry |
| TAX-8 | Med | Check-panel wording, plurals and fixtures inconsistent | Spec words; consistent data |
| TAX-9 | Med | Drill panel clips the taxable amount; no Tax column, no links | Fit the columns; add links |
| TAX-10 | Med | "To pay / To get back" unsigned | Say which |
| TAX-11 | Med | FI channel label, missing FI bases, FI food rate to verify (13.5 %?), NO intro mentions Sweden, zero-box rule inconsistent | Per-country fixes |
| TAX-12 | Med | Switching to PRA keeps FBR annexes | Reset the view; PRA layout |
| TAX-13 | Med | Export CSV only | Same export menu as Reports (PDF, Excel, CSV) |
| TAX-14 | Med | Phone cards too tall; label as value | Card layout |
| TAX-15 | Med | Demo TB lacks the tax accounts the report uses | X-6 |
| TAX-16 | Med | P&L and balance-sheet rig behind the A3 design; no cash-flow tab | Finish the A3 rig pass |
| TAX-17 | Low | "Late documents" confusing for same-period postings | Separate the two cases |
| TAX-18 | Low | 15 % lines posted to standard-rate accounts | Medium-rate accounts or general names |
| TAX-19 | Low | "25%" without space; "1 payees"; ISO dates; "0,00 Dr/Cr"; "the company" | Wording and format pass |

### HR drop 1
| id | sev | finding | fix |
|---|---|---|---|
| HR-1 | **High** | Approving a bank change is one click; the new account is masked; no holder or bank name | X-5 |
| HR-2 | **High** | Self-service bank request is one free-text field; no IBAN check, re-authentication or notice | X-5 structured fields |
| HR-3 | **High** | A scheduled future change blocks any change from today; fields prefilled from the future row | Allow changes between dated rows, or "Edit the 1 Nov change" |
| HR-4 | Med | Ended employee still "Linked" for app access; card title "Job now" | Prompt in End employment; "Last job" |
| HR-5 | Med | No probation or contract end date; no work calendar | Add them |
| HR-6 | Med | PK pay tab lacks EOBI and PESSI/SESSI numbers | Add them (sensitive block, HRP-4.5) |
| HR-7 | Med | HR can edit a bank account directly, skipping approval | X-5: a second person |
| HR-8 | Low | Manager sees the Pay tab with an "ask your admin" hint | Hide, or "Pay details are only for HR" |
| HR-9 | Low | New account shown unmasked after approve without a fresh reveal | Re-mask; audit every reveal |
| HR-10 | Low | Job-history cards hard to read on phone; date meaning unclear | Layout; "Entered {date}" |
| HR-11 | Low | Department counts direct only; phone tree as big cards | "4 (19 incl. sub-departments)"; compact list |
| HR-12 | Low | Employee can't see their own national id in self-service | Masked row + request change |

Not covered yet: Sweden, Denmark, Finland and Iceland demo companies (coming with CP-P26.2), Payroll drop 2, HR drop 3.

## Re-review 2026-10-10 (Code · ERP lead)

Static check of the rig, specs and contracts on disk (two reviewers, read only).

| Area | Verdict | Left (non-blocking unless marked) |
|---|---|---|
| **B Receivables** | Ready for Jabran | spec wording only (ERP-28) |
| **C Payables** | Ready for Jabran | bank pattern fully followed; small contract fixes (ERP-28) |
| **D Bank and cash** | Ready for Jabran | BNK-3 (pairs listed twice), BNK-7, BNK-8, BNK-9, BNK-11, X-9 on phone |
| **E Tax** | Ready after fixes | TAX-9, TAX-14 to close first; TAX-8, 11, 15, 18, 19 as a named follow-up |
| **A3 reports** | Ready for Jabran | — |
| **HR drop 1** | Not ready | Fix round not on disk: HR-1, HR-2, HR-3, HR-7 still open in the rig |
| **HR drop 3 (Leave, Time, Lifecycle)** | Not reviewable | No screens on disk yet |
| **Payroll drop 2** | Not ready | Fix round not on disk: PR-1, PR-2, PS-1, PS-2, PS-3 and Owner's own (ERP-11) still open |

Shared rules decided from this pass (building-blocks "Numbers and money", "Bank details changes"): percent format per country; one date parser with fixed inputs; bank details on a new record are the first change request.

Note: the "Addendum 2026-10-10: Payroll drop 2" that ERP-11 cites is not in this file on disk. Only the five blocking ids and the Owner's-own decision survive, in ERP-11.
