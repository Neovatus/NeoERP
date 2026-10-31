# M2 test steps: receipts, allocation, ageing and statement (Accounts Phase 3, B)

Scenario: Stockholm Handel (SEK) receives money against the invoice written in M1, allocates it, undoes it, reverses a
receipt, and checks that statement = balance = ageing. Sialkot Mills (PKR) records a receipt with tax withheld, which
needs a second person (the Owner's own approval). Contracts: `NeoERP-BackEnd/docs/api/accounts-b.md` §7.12 to §7.14, §9,
§11 and decisions C-18, C-19, C-40; plan `docs/agents/accounts-phase3/plan.md` §4 "M2".

**Do M1 first** (`docs/test-steps/accounts-M1-invoices.md`). These steps start from its end state:

- Stockholm: customer Testkund AB, invoice `INV-…-000001` dated 2026-09-15, open amount **13 004,00** (13 508,00 less the 504,00 credit note).
- Sialkot: customer Karachi Retail, invoice `INV-2026-27-000001`, open amount **106,200.00** (118,000.00 less the 11,800.00 credit note).

Sign-in users (passwords: `NeoERP-BackEnd/docs/local-demo-data.md`, "Signing in" table; never copy them elsewhere):

- `erik.berg`: Accountant, Stockholm. Posts receipts alone, but cannot approve a receipt that needs a second person.
- `sara.lind`: Owner, Stockholm. Posts the second-person receipt, reverses receipts.
- `omar.farooq`: Owner of Sialkot Mills (pick **Sialkot Mills**).

Money is shown in the company's number format; the digits are what matters.

## Kystgruppe is not used

The plan names Kystgruppe for M2, but its FY2026 is CLOSED and FY2027 has not started, so no receipt date is possible (a
receipt date must fall in an open period and not after today). Stockholm and Sialkot are the runnable companies.

## 0. Preconditions

| Needed | State found locally (2026-10-31) |
|---|---|
| Backend restarted, DB at V39 | DB is at V39; restart accounts-service from `dev` so code matches |
| Bank and cash accounts | Stockholm: 1930 "Business current account" (default), 1920 "PlusGiro". Sialkot: 1920 "Bank - main operating account" (default) |
| Stockholm small-difference limit | SEK 10,00 per adjustment line (pack default); bank-fee lines have no limit |
| Stockholm adjustment accounts | Small differences 3741, bank charges 6570 (mapped) |
| Sialkot withholding codes | `PK-WHT-BY-CUST` (income tax deducted by customer, s.153) exists but is **INACTIVE**: step 18 activates it. The ledger account is 1620 (mapped) |
| Roles | Accountant holds RECEIPT.CREATE / POST / ALLOCATE, not RECEIPT.REVERSE; Owner holds all |
| Refunds | **Not built.** There is no refund service or screen (plan M5, BE-11/12, AP-7). Step 24 only confirms the notice |

## A. Stockholm: a receipt on account, then allocation (erik.berg)

Sign in as `erik.berg`. Companies, Stockholm Handel, Accounts, Receivables.

1. Receipts, **Record receipt**. Customer `Testkund AB`. Amount received `5000.00`. Paid into `1930`. In "Customer's payment reference" type `12345675`.
   Expected: the field shows "This reference doesn't look valid: check the digits. The receipt still saves." (a warning, never a block). The table of Testkund's open invoices lists `INV-…-000001`, Open 13 004,00.
2. Change the reference to `12345674`. Leave every Allocate box empty.
   Expected: the warning goes away. Summary reads "Allocated 0,00 · 5 000,00 stays on the customer's account". "Post receipt" needs no second person ("Money in. When you post it, it goes into the books and settles the invoices you pick.").
3. Click **Post receipt**, confirm "Post receipt for 5 000,00?".
   Expected: number `RCT-…-000001`, status Posted, Allocated 0,00, left to allocate 5 000,00. Journal: **Dr 1930** 5 000,00 (party Testkund AB); **Cr 1510** 5 000,00 (party Testkund AB). The invoice is unchanged, open 13 004,00.
4. Receivables, Ageing (as of today, "By due date").
   Expected: row Testkund AB: the 1 to 30 days bucket 13 004,00 (invoice 16 days overdue), Credit on account (5 000,00), **Total 8 004,00**; the chip **Matches the books**. If M4 was run, the grand total also holds M4's balances; read the Testkund row.
5. Open the row (open items) and click **Statement**. Set From `2026-09-01`.
   Expected: lines in date order: INVOICE debit 13 508,00; CREDIT NOTE credit 504,00; RECEIPT credit 5 000,00. Closing balance **8 004,00**, ageing block 1 to 30 days 13 004,00 and On account 5 000,00 (shown negative), and the line "Agrees with the closing balance". Statement 8 004,00 = ageing 8 004,00 = Customers list balance 8 004,00.

### A2. Allocate, refuse over-allocation, undo

6. Open receipt `RCT-…-000001`, click **Allocate**.
   Expected: sheet "Allocate RCT-… for Testkund AB", "5 000,00 left to allocate", the open invoice listed with Open 13 004,00.
7. Type `6000.00` on the invoice.
   Expected: refused: "You're allocating more than is left: 1 000,00." The Allocate button does not apply it. (If you type it and click, the server answers 422 `ALLOCATION_EXCEEDS_UNALLOCATED`; nothing changes: "Nothing was changed.")
8. Click **Clear**, then **Oldest first**.
   Expected: the invoice gets 5 000,00; "Allocating 5 000,00 · 0,00 stays on account". Click **Allocate**.
   Expected: the receipt shows Allocated 5 000,00, left 0,00, and a row "Invoice INV-…-000001, 5 000,00". The invoice is now **Part paid**, open **8 004,00**. No journal is created by an allocation. Ageing: Testkund 1 to 30 days 8 004,00, no credit on account, Total 8 004,00 (unchanged).
9. On the receipt click **Undo allocation**, reason empty, confirm.
   Expected: refused, "Say why, in 6 to 500 characters." Then type `Allocated to wrong invoice (test)` and confirm.
   Expected: the row shows "Undone … by Erik Berg: Allocated to wrong invoice (test)". Invoice open back to 13 004,00; the receipt has 5 000,00 to allocate again. Re-run step 8 so the invoice is open 8 004,00 again.

## B. Stockholm: close the invoice, reverse, then a second-person receipt

10. New receipt: `Testkund AB`, Amount received `7954.00`, Paid into `1930`. Click **Add fee or difference**: kind bank fee, amount `50.00`. Click **Oldest first**.
    Expected: "Received 7 954,00 + fees 50,00 = 8 004,00 · Allocated 8 004,00 · 0,00 stays on Testkund AB". A bank fee alone needs no second person.
11. Click **Post receipt**, confirm.
    Expected: number `RCT-…-000002`. Journal: **Dr 1930** 7 954,00; **Dr 6570** 50,00 (bank charges); **Cr 1510** 8 004,00. The invoice is **Paid**, open 0,00. Customers list: Testkund AB balance 0,00; Ageing no longer lists Testkund (zero customers are hidden; tick **Include customers at zero** to see 0,00).
12. Sign out, sign in as `sara.lind`. Open `RCT-…-000002`, click **Reverse**, reason `Cheque returned unpaid (test)`, leave the date empty.
    Expected: "A reversal journal is posted and every invoice it settled is open again…". Status Reversed, "Reversal journal …" shown. The invoice is open **8 004,00** again, status Posted/Part paid. Ageing (as of today) shows Testkund 8 004,00. Statement shows a RECEIPT_REVERSED line.
13. Refusal for the Accountant: sign in as `erik.berg`, open `RCT-…-000002`.
    Expected: no **Reverse** action (needs `RECEIPT.REVERSE`, which Accountant does not hold).
14. As Erik, new receipt: `Testkund AB`, Amount received `7992.00`, Paid into `1930`. **Add fee or difference**, kind small difference, amount `12.00`. **Oldest first**. Click **Save draft**.
    Expected: refused at the line: "A small difference can only be up to the company's limit. For more, write the rest off." (limit SEK 10,00; server 422 `ADJUSTMENT_OVER_LIMIT`, `limit` 10,00).
15. Change the small difference from `12.00` to `6.00` and the amount from `7992.00` to `7998.00` (7 998,00 + 6,00 = 8 004,00). **Oldest first**. Save draft.
    Expected: the editor says "Tax was withheld (or a small difference is taken), so someone else approves this receipt." The button is **Submit for approval**, not Post.
16. Click **Submit for approval**. Look for a post action.
    Expected: status Waiting for approval; for Erik "You wrote, changed or sent this receipt, so someone else must approve it." No Post button for him. (This is the receipt-side two-person refusal.)
17. Sign in as `sara.lind`, open the receipt (Receivables, Receipts, Waiting for approval), click **Post receipt**, note `Checked against bank (test)`, confirm.
    Expected: number `RCT-…-000003`, approved by Sara Lind. Journal: **Dr 1930** 7 998,00; **Dr 3741** 6,00 (small differences); **Cr 1510** 8 004,00. Invoice **Paid**, open 0,00.
18. Statement for Testkund (From `2026-09-01`).
    Expected: closing balance **0,00** and "Agrees with the closing balance"; ageing empty; Customers balance 0,00. Lines: invoice, credit note, three receipts (one reversed), the fee and small-difference adjustments, and the reversal. Trial balance or Journals: account 1510 shows Testkund nets to 0,00 (plus any M4 balance if M4 ran).

### B2. Manual journal to the receivables control account

19. As `erik.berg`, Journals, New journal. Type Journal. Line 1: account `1510`, Debit `100.00`; line 2: account `3001`, Credit `100.00`. Submit.
    Expected: refused, 422 `USE_RECEIVABLES` (the app says "Enter customer balances in Receivables"). Exact wording not verified: it may first ask for a control-account reason ("Why post to a control account?"), and after that the refusal comes. Nothing is posted. Click Cancel and discard the draft.

## C. Sialkot: tax withheld by the customer needs a second person (omar.farooq)

Sign in as `omar.farooq`, Companies, **Sialkot Mills**, Accounts.

20. Open the **Tax codes** tab. Find `PK-WHT-BY-CUST`, click **Reactivate PK-WHT-BY-CUST**, confirm.
    Expected: toast "PK-WHT-BY-CUST reactivated". (It was inactive.)
21. Receivables, Receipts, **Record receipt**. Customer `Karachi Retail`, Amount received `105200.00`, Paid into `1920`. Click **Add tax withheld**: code `PK-WHT-BY-CUST`, Withheld `1000.00`, "Withheld from" `100000.00`, Certificate number `WHT-TEST-001`. Click **Oldest first**.
    Expected: "Received 105,200.00 + withheld 1,000.00 = 106,200.00 · Allocated 106,200.00 · 0.00 stays on Karachi Retail". The editor says someone else approves receipts with tax withheld. Button **Submit for approval**.
22. Click **Submit for approval**, then open the receipt and click the post action (for an Owner who wrote it the dialog offers "I am approving my own receipt as the Company Owner. This is written to the audit log."). First try without ticking the box.
    Expected: refused, "Tick the box to approve your own receipt as the Company Owner." (server 422 `OWNER_CONFIRMATION_REQUIRED`); nothing is posted. This is the Sialkot Owner self-approval rule: Omar is the only person, so the Owner exception is the only way.
23. Tick the box and post. Then open Receivables, Customers and Ageing.
    Expected: number `RCT-2026-27-000001`, "Approved by Omar Farooq (Owner's own)". Journal: **Dr 1920** 105,200.00; **Dr 1620** 1,000.00 (income tax deducted by customers, party Karachi Retail); **Cr 1500** 106,200.00. Invoice Paid, open 0.00. Karachi Retail balance 0.00; statement lists RECEIPT 105,200.00 and WITHHELD 1,000.00 and closes at 0.00, "Agrees with the closing balance".
24. Receivables, **Refunds**.
    Expected: the calm notice "Refunds aren't available yet." and "This part of Accounts is still being built. The rest of Receivables works as usual." (refunds, advances and write-offs are M5).

## Could not verify (read from code and DB only; nothing was run)

- The tick box and button wording on a receipt that the Owner approves (this pack follows the receipt detail strings: "Post receipt", "I am approving my own receipt…").
- The exact label of the fee kinds in the "fee or difference" picker (bank fee, small difference, rounding): use the names the list shows.
- Whether step 7 blocks in the sheet or only on click (both end in nothing changed).
- The refusal wording for the manual journal on 1510 (step 19).
- PK `CASH_RECEIPT_OVER_LIMIT` (cash account, 200,000 limit) is not covered: no cash-receipt step here.
