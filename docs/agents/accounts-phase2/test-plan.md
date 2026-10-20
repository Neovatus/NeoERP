# Phase 2 test plan — Accounts (journals, reports, packs, statements, year-end, SIE)

Owner: Accounts lead. Used two ways:
- **Auto** — Codex turns each Auto row into an end-to-end test (API against a throwaway stack, plus UI tests that render the screen *inside the real Accounts route*). All Auto rows must pass before Jabran's review.
- **Manual** — Jabran's product review (≈15 min) after Auto passes. Manual rows are about judgement: wording, layout, "would an accountant understand this".

How to report a failure: `ID · what you saw · what you expected`. Findings so far: `click-through-findings.md` (F1–F7).

Demo sign-ins: `NeoERP-BackEnd/docs/local-demo-data.md` § Signing in. Amounts in NOK, Norwegian format (100 000,00).

---

## 0. Before every run

| ID | Type | Check | Expected |
|---|---|---|---|
| P-1 | Auto | All services `/actuator/health` | All UP |
| P-2 | Auto | Accounts books | One book per finance-enabled company, state READY_TO_GO_LIVE (fresh run) |
| P-3 | Auto | Packs | Every published pack's tax codes and chart rows have a proper English name (no generated names like "No Mva Import 15 Noded"); a local name is required for NO, SE, DK, FI, IS rows (Base and PK are English-only, lead ruling 2026-10-20); `check_state` matches the verification log (NO/SE/DK/FI/IS verified 2026-10-10/13) — catches F2, F5 |

## 1. Books setup and go-live — Kystgruppe Nordic (Norway), sign in `ola.nordmann` (owner)

| ID | Type | Steps | Expected |
|---|---|---|---|
| S-1 | Both | Accounts → Overview | Card "Books ready to go live"; chart **Norway (NS 4102 structure) NO@2026.2: 195 accounts, 192 in use, 3 off by company type**; Used for 20/20 required; FY2026 1 Jan–31 Dec; 2 branches. Company shown as **"Kystgruppe Nordic"** everywhere (breadcrumb, cards, texts), never an id — F1 |
| S-2 | Both | Overview → Review and go live | Country Norway, NOK, fiscal year from January (12 periods + year-end adjustments), 2 branches, 0 stock locations, "Owned company, franchisor of 2 franchises" with franchise income accounts on |
| S-3 | Both | Same page → "Use a different chart" | Only Norway's own chart(s). No Pakistan, Sweden or Base (D-172). With one chart only, the chooser is hidden — F3 |
| S-4 | Both | Same page → Tax codes section | 23 Norway codes; every code fully visible (no "NO-MVA-" cut off) — F4; proper names — F5; SAF-T codes: 3 (25 %), 31 (15 %), 33 (12 %), 5, 6, 52, 81–85, 1/11/13 inputs |
| S-5 | Auto | Press Go live without ticking "We have checked…" | Go live stays disabled |
| S-6 | Both | Pick 1 Jan 2026, tick, Go live | Banner "Kystgruppe Nordic is live in Accounts"; Overview checklist: chart, Used for, FY2026 open, go-live 1 Jan 2026 ticked; "gone live by Ola Nordmann on <today>" |
| S-7 | Both | Overview checklist before any opening balance | "Opening-balance equity" shown as done/neutral while it is 0 — F6 |
| S-8 | Auto | Go live a second time (API replay with the same key / a new key) | Same key: same result. New key: refused, books already LIVE |

## 2. Opening balances — `ola.nordmann`

| ID | Type | Steps | Expected |
|---|---|---|---|
| O-1 | Both | Overview → Enter opening balances | Journal editor shows header card (date **01.01.2026**, fixed for opening balances), line grid, Add line, footer — F7 |
| O-2 | Both | Lines: 1920 Bank deposits debit 100 000,00; 2000 Share capital credit 100 000,00 | Totals Dr 100 000,00 = Cr 100 000,00, difference 0,00; buttons enabled |
| O-3 | Auto | Make it unbalanced (credit 90 000) | Submit/Post disabled; difference 10 000,00 shown |
| O-4 | Both | Post my own journal | Asks for a reason (owner self-approval); after posting: status POSTED, journal type OB, number assigned |
| O-5 | Both | Reports → Trial balance at 01.01.2026 | 1920 100 000,00 Dr; 2000 100 000,00 Cr; totals equal |
| O-6 | Auto | Second opening balance dated 01.01.2026 | Allowed as a further OB per contract, or refused with the contract's code — test asserts the contract (A1 C-14) |

## 3. Journals and the two-person rule

| ID | Type | Sign in | Steps | Expected |
|---|---|---|---|---|
| J-1 | Both | `anna.lindh` (accountant) | New journal, date 15.10.2026, memo "Office supplies". Manual journals carry no tax code (A1 C-17), so enter VAT as its own line: 6800 Office supplies debit 1 000,00; 2710 Input VAT, standard rate debit 250,00; 1920 Bank deposits credit 1 250,00 | Three lines; totals 1 250,00 = 1 250,00, difference 0,00 |
| J-2 | Both | `anna.lindh` | Submit for posting | Status "Waiting to post"; she has **no** Post button |
| J-3 | Auto | `anna.lindh` | Try to post her own journal through the API | Refused (two-person rule, A1 §6.12) |
| J-4 | Both | `bjorn.eriksson` (finance manager) | Waiting to post → open Anna's journal → Post | POSTED; posted by Bjørn, created by Anna, both shown |
| J-5 | Both | `bjorn.eriksson` | Reverse it (reason asked), date 15.10.2026 | Reversal journal linked both ways; original shows "Reversed" |
| J-6 | Both | `anna.lindh` → `bjorn.eriksson` | Create J-1 again, submit, Bjørn posts | Second journal POSTED |
| J-7 | Auto | any | Journal dated 15.12.2025 (before go-live) | Refused: before go-live |
| J-8 | Auto | any | Journal on a header account (e.g. 19) or a switched-off account | Refused with a clear reason |
| J-9 | Auto | `faisal.mirza` (no finance rights) | Open Accounts | No access (module/permission refusal), no data shown |

## 4. Reports — `bjorn.eriksson`, after J-6

Expected figures (OB + one purchase; the reversed pair nets to zero):

| Account | Debit | Credit |
|---|---|---|
| 1920 Bank deposits | 98 750,00 | |
| 2000 Share capital | | 100 000,00 |
| 2710 Input VAT, standard rate | 250,00 | |
| 6800 Office supplies | 1 000,00 | |
| **Totals** | **100 000,00** | **100 000,00** |

| ID | Type | Steps | Expected |
|---|---|---|---|
| R-1 | Both | Trial balance, 01.01–31.10.2026 | Exactly the table above; difference 0 |
| R-2 | Both | General ledger, account 1920 | Opening 0; +100 000 (OB), −1 250, +1 250 (reversal), −1 250; closing 98 750,00; every line links to its journal |
| R-3 | Both | Profit and loss, year to date | Office supplies 1 000,00; result **−1 000,00** (loss); "matches trial balance" check true |
| R-4 | Both | Balance sheet at 31.10.2026 | Title is the **statutory** layout (not "Management"). Assets: bank 98 750,00. Equity: share capital 100 000,00, result for the year −1 000,00 = 99 000,00. Short-term liabilities: VAT −250,00 (input VAT claim). Total equity + liabilities 98 750,00 = total assets |
| R-5 | Both | Cash flow, year to date | Opening cash counts the opening balance as the start, not as cash moving. Net change −1 250,00; closing cash 98 750,00 |
| R-6 | Auto | Compare with prior period | Months before go-live shown as "before go-live", not as zeros |
| R-7 | Both | Export trial balance to CSV and PDF | Files download; same figures; amounts as exact decimals |
| R-8 | Manual | All reports | Labels make sense to an accountant; nothing in English-only codes; numbers right-aligned |

## 5. Period close — `bjorn.eriksson`

| ID | Type | Steps | Expected |
|---|---|---|---|
| C-1 | Both | Period close → close September 2026 (earlier months first if asked) | Close checks shown first (e.g. journals waiting); after close: status Closed |
| C-2 | Both | Post a journal dated 15.09.2026 | Refused: period closed, clear reason |
| C-3 | Both | Reopen September (reason asked) | Open again; event in the history with reason and name |
| C-4 | Auto | Close October while Anna has a SUBMITTED journal in October | Warning/blocked per A2 close checks |

## 6. Year-end — `bjorn.eriksson`

| ID | Type | Steps | Expected |
|---|---|---|---|
| Y-1 | Both | Fiscal calendar → FY2026 → Year-end | Checks list and a preview of the closing entry: result −1 000,00 moved to **2050 Other equity** (NO target), using period 13 |
| Y-2 | Both | Close FY2026 now | Refused: the year hasn't ended (clear reason) |
| Y-3 | Auto | On a throwaway stack with the clock after 31.12.2026: close, reopen (reason), lock | Close posts the YE journal in period 13; reopen reverses it; lock is final; a user without the P&L right can still reopen/lock after a version conflict (P2A-1) |

## 7. Other countries' packs

| ID | Type | Sign in | Steps | Expected |
|---|---|---|---|---|
| K-1 | Both | `ayesha.khan` (Lahore Textiles, PK) | Overview → Review and go live | Pakistan chart and sales-tax codes; fiscal year per Org; framework shown; only PK chart(s) offered (D-172) |
| K-2 | Both | `ayesha.khan` | Go live, post an OB, open Balance sheet | Title carries the reporting framework, statutory layout |
| K-3 | Auto | API | For each of NO, SE, DK, FI, IS, PK: create books on a throwaway stack, go live, post OB + one purchase, run TB/P&L/BS | All balance; BS statutory layout; year-end target = that country's rule |

## 8. SIE (Sweden) — `sara.lind` (owner), `erik.berg` (accountant); run `seed-demo-iam.sh` once first

| ID | Type | Sign in | Steps | Expected |
|---|---|---|---|---|
| E-1 | Both | `sara.lind` | Go live 1 Jan 2026 (BAS chart only offered) | LIVE |
| E-2 | Both | `erik.berg` (accountant) | Journals → SIE import → pick `kyst-se-fy2026.se`, purpose History | Upload progress; check page shows program, company, org number, years, voucher counts per year ("all balanced" only when true) |
| E-3 | Both | `erik.berg` | Map accounts (most automatic), confirm | Status "Waiting for a second person"; Erik has no Approve |
| E-4 | Both | `sara.lind` (owner) | Approve (she is not the confirmer, so a normal approve) | APPROVED; nothing posted to live books (TB unchanged) |
| E-5 | Both | `sara.lind` | Reports → P&L → compare "From imported history" | Imported year shown as comparison |
| E-6 | Both | `erik.berg` | Import the same file again | Refused: year already imported |
| E-7 | Both | `erik.berg` | Import, then discard before confirming | DISCARDED, "Discarded by you" |
| E-8 | Both | `sara.lind` | Reports → SIE file → export 2026 | Preflight list; file ready; opens in a text editor with å/ä/ö right; contains #IB, #UB, #RES, one #SRU per account |
| E-9 | Auto | API | 6 uploads at once for one company | 6th refused 429 SIE_IMPORT_QUOTA |
| E-10 | Auto | API | Opening-balance purpose, then a journal is posted before confirm | Confirm asks to acknowledge "already posted" and can be ticked (P2A-16) |

## 9. Devices

| ID | Type | Steps | Expected |
|---|---|---|---|
| D-1 | Manual | Android emulator: SIE import → file picker | System picker opens; .se uploads; a .pdf is refused with a clear message |
| D-2 | Manual | iOS simulator: same | Same |
| D-3 | Auto | Phone width (≤ 720 dp): journal editor, reports, review and go live | Everything reachable; primary action at the bottom; nothing cut off |

## Pass rule
- All Auto rows green (counts in the report), then Jabran's Manual rows.
- Phase 2 accepted when Jabran says so; open findings either fixed or moved with his OK.
