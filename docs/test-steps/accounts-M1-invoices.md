# M1 test steps: customer invoices and credit notes (Accounts Phase 3, B)

Scenario: Stockholm Handel (STOCKH, SE, SEK, LIVE since 2026-01-01) writes, approves and credits an invoice with two VAT
rates. Sialkot Mills (SIALKT, PK, PKR, LIVE since 2026-07-01) shows the Owner's own approval. Contracts:
`NeoERP-BackEnd/docs/api/accounts-b.md` (§4, §5, §6.3, §7.9 to §7.11); plan: `docs/agents/accounts-phase3/plan.md` §4 "M1".

Sign-in users (passwords: `NeoERP-BackEnd/docs/local-demo-data.md`, "Signing in" table; never copy them elsewhere):

- `erik.berg`: Accountant at Stockholm Handel. Writes and submits invoices and credit notes. Has no approve right.
- `sara.lind`: Owner at Stockholm Handel. Approves.
- `omar.farooq`: Owner of Sialkot Mills (also Accounts Admin at Lahore Textiles: pick **Sialkot Mills** in Companies).

Money is shown in the company's number format (Stockholm "13 508,00", Sialkot "118,000.00"); the digits are what matters.
Document numbers read `INV-{fiscal year}-{6 digits}`: the first one a company ever takes ends in `000001`. Write down the
exact numbers you see, you need them in M2.

## Why Stockholm and not Kystgruppe (read first)

The plan names Kystgruppe Nordic (anna.lindh / bjorn.eriksson) for M1 to M3. **That cannot run today.** Read from the
local accounts DB on 2026-10-31: Kystgruppe's FY2026 is CLOSED (year-end done 2026-10-27, all 2026 periods closed or locked)
and FY2027 starts 2027-01-01. An invoice's date must be in an open period and not after today (B C-8, `maxDaysAhead` 0), so
no date is both. Stockholm (every 2026 period OPEN) and Sialkot (every period OPEN) can run. An optional Kystgruppe
appendix is at the end; it needs an open period first (Jabran's decision: reopening FY2026 undoes the year-end demo).

## 0. Preconditions

| Needed | State found locally (2026-10-31) |
|---|---|
| Accounts DB at V39, code at V39 | DB is at V39 (`bank safety review`). **Restart accounts-service from backend `dev` anyway**, so the code matches the DB. (user-service roles for Accountant and Finance Manager already hold the B and C codes.) |
| Stockholm LIVE, SEK, 2026 periods | Yes: LIVE, go-live 2026-01-01, periods 1 to 13 OPEN |
| Sialkot LIVE, PKR | Yes: LIVE, go-live 2026-07-01, FY2026-27 periods OPEN |
| Customers / invoices in either company | None (0 customers, 0 documents in every company) |
| Roles | Stockholm: Erik `IAM.ACCOUNTANT` (INVOICE.CREATE, INVOICE.CREDIT, no APPROVE), Sara `IAM.ORG_ADMIN` (everything). Sialkot: Omar is the only member and holds everything |
| Tax codes | Stockholm: `SE-MOMS-25` (output 2611), `SE-MOMS-12` (output 2621), ACTIVE. Sialkot: `PK-ST-18` (output 2700), ACTIVE |
| Accounts | Stockholm: AR 1510, income 3041 (services 25 %), 3002 (sales 12 %). Sialkot: AR 1500, income 3000, output tax 2700 |
| Fiscal (FBR) | Sialkot has no fiscal registration: no FBR pill shows (document is `NOT_REQUIRED`) |
| **Clash with M4** | M4 expects Stockholm's Customers list empty and 0 customers found. **Run M4 first**, or accept that M4 step 1.6 and 2.5 then also show "Testkund AB". The M4 2009 figures are not touched by invoices. |

Nothing is seeded for you: every customer and document below is created in the steps.

## A. Stockholm Handel: write, submit, approve

### A1. Customer and invoice (erik.berg)

Sign in as `erik.berg`. Open Companies, Stockholm Handel, Accounts.

1. Receivables, Customers. Click **New customer**. Name `Testkund AB`, Payment terms (days) `30`, tick **Registered for sales tax**. Leave Code empty. Click **Save**.
   Expected: toast "Customer added · Testkund AB". The list shows it, status Active, Balance 0,00.
2. Receivables, Invoices. Click **New invoice**. Choose Customer `Testkund AB`. Set **Invoice date** to `2026-09-15`.
   Expected: Due date fills to `2026-10-15` ("Due in 30 days"). The customer line shows "Terms 30 days", "Balance 0,00".
3. Line 1: Description `Konsulttimmar`, Qty `10`, Unit price `1000.00`, Income account `3041`, Tax code `SE-MOMS-25`. Click **Add a line**. Line 2: Description `Böcker`, Qty `4`, Unit price `250.00`, Discount `10 %`, Income account `3002`, Tax code `SE-MOMS-12`.
   Expected, live, before saving: line 1 "25 %" on 10 000,00 = 2 500,00; line 2 "12 %" on 900,00 = 108,00 (gross 1 000,00 less 100,00 discount). Footer "Net 10 900,00 · Tax 2 608,00", **Total (SEK) 13 508,00**.
4. Click **Save draft**.
   Expected: a draft reference (`INV-DRAFT-…`) and the banner "Draft. Nothing reaches the books until someone else approves it." The server's totals equal the screen's: 10 900,00 / 2 608,00 / 13 508,00. Nothing in the journals yet.
5. Click **Submit for approval**.
   Expected: toast "… sent for approval. Someone else approves it." The invoice is under the **Waiting for approval** tab. On its detail the only action is **Withdraw to draft**, with the line "You wrote, changed or sent this invoice, so someone else must approve it." There is **no Approve** button.

### A2. Refusal: the writer cannot approve (erik.berg)

6. Still as Erik, open the same invoice. Look for Approve.
   Expected: none. Erik's role also lacks the approve right, so the page may instead say "Approving needs the approve right, which your role doesn't have. A Finance Manager or the Owner can approve it." Either way an invoice written by Erik cannot be posted by Erik. (The server refusal for a non-Owner writer who does hold the right is 403 `TWO_PERSON_RULE`; it can only be seen with Bjorn in the appendix.)

### A3. Approve (sara.lind)

7. Sign out, sign in as `sara.lind`. Companies, Stockholm Handel, Accounts, Receivables, Invoices. Open the **Waiting for approval** tab (or click **Only mine to approve**).
   Expected: the invoice is listed, "Waiting for you", written by Erik Berg. Open it: the main button reads **Approve** (not "Approve my own invoice").
8. Click **Approve**. In the dialog "Approve INV-DRAFT-…?" leave the note empty and click **Approve**.
   Expected: toast "INV-DRAFT-… approved as INV-…-000001." Status Posted, number `INV-…-000001`, period "September 2026", Due date 2026-10-15, Approved by Sara Lind, total 13 508,00. No Edit action: the text says it can't be changed afterwards and a mistake is corrected with a credit note.
9. On the invoice, click the **Journal** link.
   Expected: a posted journal dated 2026-09-15, memo "Testkund AB · INV-DRAFT-…", source "From Sales invoice INV-…-000001", balanced (Dr 13 508,00 = Cr 13 508,00), lines in this order: **Dr 1510** 13 508,00 (party Testkund AB); **Cr 3041** 10 000,00; **Cr 2611** 2 500,00 (SE-MOMS-25, 25 %); **Cr 3002** 900,00; **Cr 2621** 108,00 (SE-MOMS-12, 12 %).
10. Receivables, Customers.
    Expected: Testkund AB, Balance (SEK) 13 508,00, Overdue 13 508,00 (due 2026-10-15; 16 days late today).

## B. Stockholm Handel: credit part of the invoice

### B1. Over-credit refused (erik.berg)

11. Sign out, sign in as `erik.berg`. Open invoice `INV-…-000001`, click **Credit**.
    Expected: page "Credit note for INV-…-000001", "What to credit" lists both lines ("Invoiced 10 × 1 000,00 · left 10 000,00", "Invoiced 4 × 250,00 · left 900,00"). Credit date defaults to today.
12. On line "Böcker" enter quantity `5`.
    Expected: the line is refused at its field: "Line 2: only 900,00 can still be credited." Save draft and Submit stay blocked until it is fixed.

### B2. Part credit

13. Change the quantity to `2`. Reason `Two books returned damaged`. Click **Save draft**, then **Submit for approval**.
    Expected: Total credit 504,00 = net 450,00 (2 × 250,00 = 500,00 less 50,00 of the 100,00 discount, the same share) plus tax 54,00 (12 % of 450,00). The credit note is a draft then Waiting for approval, "You wrote, changed or sent this credit note, so someone else must approve it."
14. Sign in as `sara.lind`, open the credit note (Receivables, Credit notes, Waiting for approval), click **Approve**.
    Expected: number `CN-…-000001`, status Posted. Detail shows "Applied to INV-…-000001: 504,00" (it allocates at approval). Journal: **Dr 3002** 450,00; **Dr 2621** 54,00; **Cr 1510** 504,00 (source: the credit note CN-…-000001).
15. Open invoice `INV-…-000001`.
    Expected: Open amount 13 004,00 (13 508,00 less 504,00), status still Posted (it may carry a "Credited" mark); the "Payments and credits" table lists the credit note 504,00. Line "Böcker" shows "Credited 2 / 450,00".
16. As Erik again, open the invoice, click **Credit**, enter quantity `3` on "Böcker".
    Expected: refused, "only 450,00 can still be credited" (2 books left, 450,00). Click **Cancel**. Nothing was saved.
17. Receivables, Customers.
    Expected: Testkund AB Balance 13 004,00 (= 13 508,00 less 504,00), Overdue 13 004,00.

## C. Sialkot Mills: the Owner approves their own invoice (omar.farooq)

Sign out, sign in as `omar.farooq`. Companies, **Sialkot Mills**, Accounts.

18. Receivables, Customers, **New customer**. Name `Karachi Retail`, Payment terms `14`. Leave **Registered for sales tax** **unticked** (an unregistered buyer). **Save**.
    Expected: "Customer added · Karachi Retail".
19. Invoices, **New invoice**. Customer `Karachi Retail`, Invoice date `2026-10-01` (due `2026-10-15`). One line: `Cotton fabric`, Qty `100`, Unit price `1000.00`, Income account `3000`, Tax code `PK-ST-18`. Click **Save draft**, then **Submit for approval**.
    Expected: net 100,000.00, tax 18,000.00 (18 %), Total (PKR) 118,000.00. After submit, the main button on the detail reads **Approve my own invoice** (Omar is the Owner and the writer).
20. Click **Approve my own invoice**. In the dialog, do **not** tick the box "I am approving my own invoice as the Company Owner. This is written to the audit log." Try to approve.
    Expected: refused. Approve stays disabled, or the server answers 422 `OWNER_CONFIRMATION_REQUIRED`: "Tick the box to approve your own invoice as the Company Owner." Nothing is posted; the invoice is still Waiting for approval.
21. Tick the box and approve.
    Expected: toast "… approved as INV-2026-27-000001." (last part `000001`). Detail shows "Approved by Omar Farooq (Owner's own)". No FBR / fiscal pill. Journal: **Dr 1500** 118,000.00 (party Karachi Retail); **Cr 3000** 100,000.00; **Cr 2700** 18,000.00 (PK-ST-18).
22. Open the invoice, click **Credit**, quantity `10` on the line, reason `Ten metres short-shipped`. Save draft, Submit, then **Approve my own credit note** (tick the box).
    Expected: credit 10,000.00 net + 1,800.00 tax = 11,800.00 (inside the 180-day tax window, so the tax reverses). Number `CN-2026-27-000001`. Journal: **Dr 3000** 10,000.00; **Dr 2700** 1,800.00; **Cr 1500** 11,800.00. Invoice open amount 106,200.00.
23. Receivables, Customers.
    Expected: Karachi Retail Balance (PKR) 106,200.00.

## Not testable here (and why)

- **PK further tax (4 % on a supply to an unregistered buyer, B C-12):** the invoice editor has one tax code per line; there is no second-code field, so `PK-ST-FURTHER` cannot be added. The plan's Sialkot "PK-ST-18 plus further tax" step is not runnable.
- **KID or OCR payment reference on the invoice (B C-35), legal-content checks (C-33), FBR states (C-34):** the approval service says these are not in SB3, so no reference, no `LEGAL_CONTENT_MISSING` and no FBR pill appear. Do not expect them.
- **Credit note on account, write-off, refund:** the on-account credit note is exercised in M2.

## Optional appendix K: Kystgruppe Nordic (NO, 25 % and 15 %)

Only after Kystgruppe has an open period on or before today. As of today it has none (see top).

K1. `anna.lindh` writes an invoice for a new customer with line 1 account 3000, `NO-MVA-25`, net 10 000,00 (tax 2 500,00, output 2700) and line 2 account 3030, `NO-MVA-15`, net 1 000,00 (tax 150,00, output 2701); Total 13 650,00. Submit.
K2. `bjorn.eriksson` (Finance Manager) approves it. Expected: `INV-{FY}-000001`, journal Dr 1500 13 650,00; Cr 3000 10 000,00; Cr 2700 2 500,00; Cr 3030 1 000,00; Cr 2701 150,00.
K3. Refusal with the right held: `bjorn.eriksson` writes a second invoice and submits it. Expected: no Approve on his own document ("You wrote, changed or sent this invoice, so someone else must approve it."); a direct approve call gets 403 `TWO_PERSON_RULE`, `details.role` SUBMITTER. `ola.nordmann` (Owner, not a contributor) can approve it.

## Could not verify (read from code and DB only; nothing was run)

- Exact toast and document-number wording (the fiscal-year part of `INV-…-000001`, "INV-DRAFT-…" prefix).
- Whether Stockholm applies whole-unit total rounding (these amounts are whole, so it does not matter).
- Whether the Approve dialog without the tick box is blocked in the UI or refused by the server (either result passes).
- The `Journal` link wording and where "From Sales invoice …" shows (journal detail source line).
