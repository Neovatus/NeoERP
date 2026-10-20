# Phase 2 click-through — Jabran

> **Superseded 2026-10-19 by `test-plan.md`** (same steps, with exact expected results). Kept for the findings it produced.

About 45 minutes. Desktop app against your local backend (`./scripts/run-all-services.sh`), then one step on Android and iOS.
Sign-ins: `docs/local-demo-data.md` § Signing in (password = name in PascalCase + `123!`).
Note each problem in one line: step number, what you saw, what you expected. Send the list to the Accounts lead; it becomes one fix round.

## Before you start
- [ ] All services UP. Accounts books are READY_TO_GO_LIVE for all companies (rebuilt 2026-10-16).
- [ ] Copy the test SIE file to your Desktop: `NeoERP-BackEnd/services/accounts-service/src/test/resources/sie/golden/kyst-se-fy2026.se`.
- [ ] **Gap:** Stockholm Handel (the Swedish company) has no one who can sign in. Part C needs two Stockholm sign-ins (an owner and a second person). Ask the Accounts lead to have them seeded first, or skip Part C today.

## Part A — Norway: books, journals, statements (Kystgruppe Nordic)

| # | Sign in as | Do | You should see |
|---|---|---|---|
| A1 | `ola.nordmann` (owner) | Accounts → Overview. Look through Chart of accounts, Used for, Fiscal calendar and Tax codes (Norway 2026.2, NOK, Jan–Dec). Then on Overview press **Review and go live**, pick 1 Jan 2026 and go live. | Setup steps all ticked; after go-live the books say LIVE. Opening balances step offered. |
| A2 | `ola.nordmann` | Enter a small opening balance (bank 100 000 / equity 100 000) and post it as owner (reason asked). | Journal POSTED; trial balance balances. |
| A3 | `anna.lindh` (accountant) | New journal: office supplies 1 250 incl. 25 % VAT from bank, date this month. Submit. | She can submit but not post (two-person rule). |
| A4 | `bjorn.eriksson` (finance manager) | Open Anna's journal and post it. Then reverse it, then post it again as a new journal. | Posted; reversal journal linked; ledger shows all three. |
| A5 | `bjorn.eriksson` | Reports: Trial balance, General ledger (bank account), Profit and loss, Balance sheet, Cash flow. Change dates, compare with prior period, export one to CSV/PDF. | Figures agree across reports. Balance sheet title is the **statutory** layout (not "Management"). VAT on its own account. Cash flow shows the supplies payment. |
| A6 | `bjorn.eriksson` | Period close: close last month. Try to post a journal dated in it. | Close checks shown first; posting into a closed month is refused with a clear reason. Reopen it (reason asked). |
| A7 | `bjorn.eriksson` | Year-end page for 2026. | Checks and a preview of the closing entry with the result going to the year-result account. Closing a year that hasn't ended is refused with a clear reason. |

## Part B — Pakistan: country pack (Lahore Textiles)

| # | Sign in as | Do | You should see |
|---|---|---|---|
| B1 | `ayesha.khan` (owner) | Accounts → Overview. Look through Chart of accounts, Tax codes (sales tax) and the reporting framework. Overview → **Review and go live** (PK fiscal year Jul–Jun). | Pakistan chart and tax codes; framework shown on statement titles. |
| B2 | `ayesha.khan` | Post one opening balance; open the balance sheet. | Title carries the reporting framework. |

## Part C — Sweden: SIE (Stockholm Handel) — needs the two sign-ins above

| # | Sign in as | Do | You should see |
|---|---|---|---|
| C1 | Stockholm owner | Overview → **Review and go live**, 1 Jan 2026 (BAS chart). Accounts → Journals → SIE import → pick `kyst-se-fy2026.se`, purpose History. | Upload progress, then the file check: program, company, years, voucher counts. Warnings, if any, in plain words. |
| C2 | Stockholm owner | Map accounts (most map automatically), confirm. | "Waiting for a second person." The confirmer gets no Approve button. |
| C3 | Stockholm second person | Approve the import. Then Reports → P&L → compare "From imported history". | Imported figures appear as last year's comparison; nothing posted into the live books. |
| C4 | Stockholm owner | Reports → SIE file → export 2026. Download it. | Preflight list first; file ready; downloaded file opens in a text editor with Swedish letters right. |
| C5 | Stockholm owner | Import the same file again and discard it before confirming. | Discarded, with your name on it. |

## Part D — File picker and upload on devices

| # | Device | Do | You should see |
|---|---|---|---|
| D1 | Android emulator or phone | SIE import → pick a file. | The system file picker opens; the file uploads (or a clear refusal for a non-SIE file). |
| D2 | iOS simulator | Same. | Same. |

## Done when
- Every row passes, or each problem is written down.
- Jabran says "Phase 2 accepted" (after any fix round).
