# M3 test steps: payables, suppliers, bills, debit notes, payments, bank-detail change (Accounts Phase 3, C)

Scenario: Stockholm Handel (SEK) adds a supplier whose bank details wait for approval, enters a bill with 25 % input VAT
(one line 50 % deductible), is stopped by the duplicate rule, writes a debit note, pays part of the bill with two
people, then changes the supplier's bank details with a second person's approval. Sialkot Mills (PKR) pays a supplier with
s.153 withholding and shows the Owner's own approval. Contracts: `NeoERP-BackEnd/docs/api/accounts-c.md` (C-3, C-4, C-9,
C-10, C-11, C-12, C-13, C-21, C-22, §7.2, §7.9); plan `docs/agents/accounts-phase3/plan.md` §4 "M3".

Sign-in users (passwords: `NeoERP-BackEnd/docs/local-demo-data.md`, "Signing in" table; never copy them elsewhere):

- `erik.berg`: Accountant, Stockholm. Writes suppliers, bills, debit notes and payments, requests bank changes. Cannot approve anything.
- `sara.lind`: Owner, Stockholm. The only holder of the payment-approve right there. Approves.
- `omar.farooq`: Owner of Sialkot Mills (pick **Sialkot Mills**). The only member, so the Owner's own approval applies.

Money is shown in the company's number format; the digits are what matters. M3 does not need M1 or M2. If M4 was run,
read your own supplier's row in the ageing, not the grand total (M4 adds five suppliers and 61 200,00).

## Kystgruppe is not used (read first)

The plan names Kystgruppe (anna.lindh / bjorn.eriksson) for M3. It cannot run today: its FY2026 is CLOSED, FY2027 starts
2027-01-01, and a bill's posting date must be in an open period (C-5). Stockholm and Sialkot run. A short Kystgruppe appendix
(the bank-change rules that differ because Bjorn also holds the approve right) is at the end.

## 0. Preconditions

| Needed | State found locally (2026-10-31) |
|---|---|
| Backend restarted, DB at V39 | DB is at V39 (V35 to V39 are the bank-safety work). **Restart accounts-service from `dev`** so code matches |
| Bank-details key | `.local-secrets/accounts-bank-keys.properties` exists in NeoERP-BackEnd. Without it every bank-detail write is refused 503 `BANK_DETAILS_KEY_UNAVAILABLE` (create it once with `scripts/accounts-bank-keys.sh`, then restart) |
| Stockholm | LIVE, SEK, 2026 periods OPEN, AP control 2440, default bank 1930. Input codes `SE-MOMS-IN-25` (input VAT 2641) and `SE-MOMS-IN-25-CAR50` (25 %, **50 % deductible**), ACTIVE. Accounts 6110 Office supplies, 6540 IT services |
| Stockholm approvers | Only Sara holds `ACCOUNTS.PAYMENT.APPROVE` (Erik, the Accountant, does not). So Sara may approve her own bank request, and Erik's requests need her |
| Suppliers / bills / payments | None in any company yet |
| Tax override threshold | SEK 1,00 (a typed input-VAT figure further than that from the computed one needs a reason): leave the computed tax |
| Sialkot | LIVE, PKR, all periods OPEN. Omar is the only member and holds every right. AP control 2400, bank 1920, input tax 1600, `WHT_PAYABLE` 2750 |
| Sialkot withholding codes | `PK-WHT-153-GOODS` (purchases) exists but is **INACTIVE**: step 24 activates it |
| Valid test IBANs (check digits verified) | SE `SE3550000000054910000003` with account number `50000000054910000003`; second SE `SE4550000000058398257466` with `50000000058398257466`; PK `PK36SCBL0000001123456702` with `0000001123456702` (an IBAN must end with the account number) |

## A. Stockholm: supplier, bill, duplicate, debit note

### A1. Supplier (erik.berg)

Sign in as `erik.berg`. Companies, Stockholm Handel, Accounts, Payables.

1. Suppliers, **New supplier**. Name `Testleverantör AB`, Payment terms (days) `30`. Under Bank details: Bank name `Test Bank`, Account title `Testleverantör AB`, Account number `50000000054910000003`, IBAN `SE3550000000054910000003`. Click **Save**.
   Expected: toast "Testleverantör AB added as SUPP-000001". The sheet says "Its bank details wait for approval." and "Bank details typed here wait for approval: you can use the supplier at once, but no payment goes to that account until someone other than you approves them." The supplier can be picked on a bill at once.

### A2. Bill with 25 % VAT and a 50 % deductible line (erik.berg)

2. Bills, **New bill**. Supplier `Testleverantör AB`. Supplier's invoice number `TL-2026-0420`. Bill date `2026-10-05`. Payment reference type OCR, Payment reference `12345675`.
   Expected: the reference field shows "This OCR … isn't valid: check the digits." (noun may read "OCR number"). Due date fills to `2026-11-04` ("30 days after the bill date"). Posts on the bill date.
3. Change the reference to `12345674`.
   Expected: the message goes away.
4. Line 1: Description `Billeasing`, Qty `1`, Unit price `4000.00`, Account `6110`, Tax code `SE-MOMS-IN-25-CAR50`. Click **Add a line**. Line 2: `Programvara`, Qty `1`, Unit price `2000.00`, Account `6540`, Tax code `SE-MOMS-IN-25`. Click **Save draft**.
   Expected: after the save, line 1 shows "You can claim 500,00 (50 %); 500,00 is part of the cost." Footer: Net 6 000,00 · Input tax 1 500,00; "Non-deductible VAT 500,00 (added to cost)"; **Total to pay (SEK) 7 500,00** (6 000,00 + 1 000,00 + 500,00).
5. Click **Submit for approval**.
   Expected: Waiting for approval; for Erik "You wrote, changed or sent this bill, so someone else must approve it." No Approve.
6. Sign out, sign in as `sara.lind`. Bills, **Waiting for approval**, open the bill, click **Approve**, confirm.
   Expected: toast "… approved as BILL-…-000001." (numbers read `BILL-{FY}-{6 digits}`), status Posted. Journal (type purchase invoice, source "From Purchase bill …"): **Cr 2440** 7 500,00 (party Testleverantör AB); **Dr 6110** 4 500,00 (4 000,00 net + 500,00 non-deductible VAT); **Dr 6540** 2 000,00; **Dr 2641** 1 000,00 (500,00 on the 50 % line + 500,00 on line 2). Dr 7 500,00 = Cr 7 500,00.

### A3. Duplicate bill refused (erik.berg)

7. Sign in as `erik.berg`. Bills, **New bill**. Supplier `Testleverantör AB`, Supplier's invoice number `tl 2026-0420` (different spelling), Bill date `2026-10-05`, one line `Duplicate test`, Qty 1, Unit price `100.00`, Account `6110`, tax `SE-MOMS-IN-25`. **Save draft**.
   Expected: the draft saves with a warning that the invoice number is already on `BILL-…-000001` (the number is compared by its digits, so "tl 2026-0420" equals "TL-2026-0420"; draft save never blocks).
8. Click **Submit for approval**.
   Expected: refused, 409 `DUPLICATE_SUPPLIER_INVOICE`, naming `BILL-…-000001`; the editor says "It can't be sent for approval while the other bill with this supplier invoice number exists." The bill stays a draft.
9. Delete the duplicate draft: **Delete**, reason `Duplicate test`, confirm.
   Expected: "Draft … deleted."

### A4. Debit note

10. Open the posted bill `BILL-…-000001` and click **Write a debit note**. Credit line 2 (`Programvara`) in full: use "Credit everything left" on that line only, or enter quantity `1`. Reason `Software not delivered (test)`. **Save draft**, **Submit for approval**.
    Expected: line 2 "Billed 1 × 2 000,00 · left 2 000,00"; credit net 2 000,00, input tax 500,00 (proportional to the line's tax), Total credit **2 500,00**. Waiting for approval.
11. Sign in as `sara.lind`, approve the debit note (Payables, Debit notes, Waiting for approval).
    Expected: number `DN-…-000001`, Posted, "Applied to BILL-…-000001: 2 500,00". Journal: **Dr 2440** 2 500,00; **Cr 6540** 2 000,00; **Cr 2641** 500,00. The bill's open amount is **5 000,00**.

## B. Stockholm: the payment waits for the bank details (payments need two people)

12. As `erik.berg`: Payments, **Record payment**. Supplier `Testleverantör AB`, Amount paid `3000.00`, Paid from `1930`, Reference `TL-2026-0420`. Click **Oldest due first** so the bill takes 3 000,00.
    Expected: the editor shows "The supplier's bank details are waiting for approval" and "A payment from a bank account can't be approved until they are. Pay from a cash account, or approve the details first." Summary "Paid 3 000,00 = 3 000,00 · Allocated 3 000,00 · 0,00 stays as credit with Testleverantör". Text "Money out. Someone else approves it before it goes into the books…".
13. **Submit for approval**.
    Expected: Waiting for approval; Erik has no approve action.
14. Sign in as `sara.lind`, open the payment, click **Approve**, confirm.
    Expected: **refused**, 422 `BANK_DETAILS_PENDING`: "Testleverantör AB's bank details are waiting for approval. Pay from a cash account, or approve the details first." Nothing posted.
15. Still as Sara: Payables, Suppliers, open `Testleverantör AB`, click **Approve change** (card "Bank details change waiting for approval", asked for by Erik Berg). In the dialog "Approve the bank details change?" tick "I confirmed the new details with Testleverantör AB by a channel I already had (not through this request)." Approve.
    Expected: "From now on payments to Testleverantör AB go to the new account. For 30 days every payment shows the change." The sheet now shows the live details, masked to the last four characters; **Bank details history** has one row, decided by Sara Lind. (If a signal such as "same account elsewhere" shows, none is expected: nothing else uses this IBAN.)
16. Open the payment again, click **Approve**. The dialog asks you to confirm the bank details with the supplier ("I have confirmed the new bank details with the supplier by a number I already had."). First click Approve **without** ticking it.
    Expected: refused, 422 `BANK_DETAILS_NOT_CONFIRMED`: "Bank details changed recently. Confirm them with the supplier, then tick the box to approve."
17. Tick the box, add note `Checked the details by phone (test)`, **Approve**.
    Expected: number `PAY-…-000001`, status Posted, approved by Sara Lind. Journal: **Dr 2440** 3 000,00 (party Testleverantör AB); **Cr 1930** 3 000,00. The bill is **Part paid**, open **2 000,00**. A warning "Bank details changed" is recorded. The **Transfer details** card shows Pay to Testleverantör AB, the bank, the account masked to the last four characters, and the payment reference 12345674 (the bill's).

## C. Stockholm: ageing, statement, second-person bank change

18. Payables, Ageing (as of today).
    Expected: row Testleverantör AB: Not due 2 000,00 (the bill is due 2026-11-04), **We owe 2 000,00**, chip **Matches the books** (control 2440). Click the row (open items): bill `BILL-…-000001` open 2 000,00.
19. Click **Statement**, From `2026-10-01`.
    Expected: BILL 7 500,00 (credit), DEBIT NOTE 2 500,00, PAYMENT 3 000,00; closing balance **2 000,00** "Agrees with the closing balance". Statement 2 000,00 = ageing 2 000,00 = Suppliers list "We owe" 2 000,00.
20. As `erik.berg`: Suppliers, `Testleverantör AB`, **Change bank details**. Fill the new IBAN `SE4550000000058398257466`, Account number `50000000058398257466`. Reason `Supplier moved to another bank (test)`. Click **Ask for the change**.
    Expected: the dialog first says "It asks for a change that someone other than you approves, after confirming it with Testleverantör AB. Until then payments go to the current account." After sending, the sheet shows "Bank details change waiting for approval"; the live (old) details are unchanged.
21. Still Erik: open that card.
    Expected: no approve action for him: "Approving needs the payment approval right, which your role doesn't have." and "You asked for this change, so someone else approves it." (Refusal: the person who asked cannot approve.)
22. Sign in as `sara.lind`, open the supplier, **Reject the change** first with an empty reason.
    Expected: refused, "Say why, in 6 to 500 characters." Then reject with reason `Test of reject` and confirm: "Change rejected", "Testleverantör AB stays with the current bank details." The history shows the rejection.
23. As Erik ask for the same change again (step 20). As Sara approve it with the confirmation tick.
    Expected: the live details are now the second account (last four `7466`); history has three rows (first approved, one rejected, second approved), each with from and to masked. Erik is now, for 30 days, a contributor on payments to this supplier (he could not approve them anyway).

## D. Sialkot: payment with s.153 withholding, Owner's own approval (omar.farooq)

Sign out, sign in as `omar.farooq`, Companies, **Sialkot Mills**, Accounts.

24. Tax codes tab: **Reactivate PK-WHT-153-GOODS**, confirm. Payables, Suppliers, **New supplier**: Name `Faisalabad Yarn Test`, **Sales tax registration** `1234567890123` (needed: the input tax code requires the supplier's STRN), Bank details: Bank name `Test Bank PK`, Account title `Faisalabad Yarn Test`, Account number `0000001123456702`, IBAN `PK36SCBL0000001123456702`. **Save**.
    Expected: "Faisalabad Yarn Test added as SUPP-000001"; its bank details wait for approval.
25. Open the supplier. The change card says "You asked for this change, so someone else approves it", but as the Owner there is **Approve my own change**. Tick "This is my own request. I approve it as the Company Owner." and approve.
    Expected: approved: nobody else in Sialkot holds the payment-approve right, so the Owner's own is allowed. If you get 422 `OTHER_APPROVER_EXISTS` instead, someone else now holds `ACCOUNTS.PAYMENT.APPROVE` there: report it.
26. Bills, **New bill**: Supplier `Faisalabad Yarn Test`, Supplier's invoice number `FY-7781`, Bill date `2026-10-05`, line `Yarn`, Qty `1000`, Unit price `100.00`, Account `4300`, Tax code `PK-ST-IN`. **Save draft**, **Submit for approval**, then **Approve my own bill** (tick the box).
    Expected: net 100,000.00, input tax 18,000.00, Total to pay (PKR) 118,000.00. Posted as `BILL-2026-27-000001`, "Approved by Omar Farooq (Owner's own)". Journal: **Cr 2400** 118,000.00; **Dr 4300** 100,000.00; **Dr 1600** 18,000.00 (input sales tax).
27. Payments, **Record payment**: Supplier `Faisalabad Yarn Test`, Amount paid `114000.00`, Paid from `1920`. Click **Add tax withheld**: code `PK-WHT-153-GOODS`, Withheld `4000.00`, leave "Withheld from" empty ("worked out from the bills' amount before sales tax"). Click **Oldest due first**.
    Expected: "Paid 114,000.00 + withheld 4,000.00 = 118,000.00 · Allocated 118,000.00 · 0.00 stays as credit with Faisalabad Yarn Test". "Withheld from" resolves to 100,000.00 (the net of the bill). **Save draft**, **Submit for approval**.
28. Open the payment, click **Approve my own payment**. Tick only the Owner box first, leave the bank-details confirmation unticked.
    Expected: refused 422 `BANK_DETAILS_NOT_CONFIRMED` (the details were approved within 30 days). Untick the Owner box and tick only the confirmation: refused 422 `OWNER_CONFIRMATION_REQUIRED`: "Tick the box to approve your own payment as the Company Owner." (Omar wrote and submitted it.)
29. Tick both and approve.
    Expected: number `PAY-2026-27-000001`. Journal: **Dr 2400** 118,000.00 (party Faisalabad Yarn Test); **Cr 1920** 114,000.00; **Cr 2750** 4,000.00 (income tax withheld from suppliers, tagged with base 100,000.00). The bill is Paid. Payables ageing: Faisalabad Yarn Test is gone (zero); supplier statement closes at 0.00.

## Optional appendix K: Kystgruppe (only when it has an open period)

K1. `anna.lindh` adds a supplier with Norwegian bank details (IBAN `NO8330001234567`, account `30001234567`); `bjorn.eriksson` approves the first request with the confirmation tick. A bill with a KID (`12345674`, type KID) at `NO-MVA-IN-25`: net 4 000,00, VAT 1 000,00 (input 2710), Total 5 000,00; approved by Bjorn; journal Cr 2400, Dr 4300, Dr 2710.
K2. `bjorn.eriksson` asks for a bank change. `ola.nordmann` (Owner) is not the requester and may approve it. Bjorn is then a contributor: he cannot approve payments to that supplier for 30 days (403 `TWO_PERSON_RULE`, `details.role` BANK_DETAILS_EDITOR).
K3. `ola.nordmann` asks for a change and tries to approve it as his own: refused 422 `OTHER_APPROVER_EXISTS` (`details.count` 1), because Bjorn also holds the payment-approve right. This differs from Stockholm and Sialkot, where nobody else holds it.

## Could not verify (read from code and DB only; nothing was run)

- The plan's "50 % deductible" line on Kystgruppe: Norway's pack has no domestic partly deductible input code (only the reverse-charge "no deduction" ones), so the 50 % step uses Stockholm's `SE-MOMS-IN-25-CAR50`.
- Whether the first bank-detail approval (step 15) already requires the same "confirmed with the supplier" tick as a later change. The dialog text above is from the app; tick it if shown.
- Exact toast and number wording (`BILL-`, `DN-`, `PAY-` prefixes and the fiscal-year part).
- Whether the duplicate warning in step 7 appears on save or only at submit; step 8 is the guaranteed refusal.
- Evidence-file upload on a bank-change request (optional, PDF/JPEG/PNG up to 10 MB) is not exercised.
- The supplier notice email is recorded only (no sender yet): nothing to see in the app.
- Which of the two refusals in step 28 shows first when both boxes are wrong; each must show when its own box is missing.
