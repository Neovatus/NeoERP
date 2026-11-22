# Accounts spreading schedules: prepaid costs and deferred income (spec AC-SPR, draft)

Status: **Draft for Jabran (lead, 2026-11-22). Not approved.** Roadmap 4.15 (`docs/drafts/accounts-roadmap.md` "Phase
4b"): "Spreading schedules (prepaid costs, deferred income). No spec yet. Depends on 4.14; reuse `domain/recurring`."
The "Decide before building" list (§13) holds the choices that shape the database or a contract; Jabran answers those
before backend work starts. When approved, the screen part moves to `NeoERP-App/docs/design/specs/accounts-spreading.md`
and the contract to `NeoERP-BackEnd/docs/api/accounts-spreading.md`.

Sources: AC-A4 (recurring journals: schedule picker §4.3, run results §4.4, schedule words §6, three widths §7; contract
`accounts-a4.md` C-3 "nothing is posted without a second person", C-4 contributors, C-5 books LIVE, C-16 editing changes
the future only, C-19/C-20 automatic reversal approved at post, D-179 feature off), BackEnd
`docs/modules/accounts/recurring-journals.md` (job, run outcomes, lock order), `domain/recurring/Schedule.kt`
("spreading and allocation schedules can reuse it"), AC-DIM and 4.14 (Required / Optional / Not used per account),
AC-ALC (allocations: own record that creates ordinary journals, run history, Reverse and run again), approval limits
(`accounts-approval-limits.md`, journal kind, Owner switch 4.11), ADR-021 D4/D5/D6, ADR-024 D3 (keyset lists), ADR-025 A3
(action ids, notification service), [`ux-principles.md`], [`screen-standard.md`], `building-blocks.md`,
`list-controls.md`, `approval-card.md`, `date-range-field.md`; RULES §7 (books belong to companies).

Goal: **a cost paid for a year ahead, or income invoiced for a year ahead, lands in the right months of the P&L by
itself, after one person sets it up and a second person approves it once; anyone can see, per schedule, what has been
released, what is left, and which journal did it.**

## 1. Scope

In:
- **Two kinds:** **Prepaid cost** (the amount sits on a prepaid asset account and is released to a cost account) and
  **Deferred income** (the amount sits on a deferred-income liability account and is released to an income account).
- **Sources:** a posted bill line, a posted sales invoice line, a posted journal line, or **Opening balance** (an
  amount already on the balance account at go-live, typed by hand, with a reason).
- **Methods:** **Equal per period** and **By days** (each period's share in proportion to its days).
- **Schedule preview** of every period before anything is saved, and live while editing.
- **Approval once** under the company's journal limits; then each period's journal posts on the period's last day.
- **Change** (remaining amount, end, P&L account, dimensions) as a new version, approved again; **End early** (post
  the rest now, or leave it on the balance account) with a reason; **Post again** after a period journal was reversed.
- **List, editor, detail**, the entry points on bill, invoice and journal lines, a Period close row and a
  reconciliation line (balance account vs remaining on schedules).

Out (other specs or later): accruals of costs not yet invoiced (A4 automatic reversal covers them); IFRS 16 leases;
IFRS 15 contract revenue (performance obligations, variable consideration); usage- or quantity-based release; import
of schedules from a file; spreading in a foreign currency (the base amount is spread: a prepaid is non-monetary, so no
revaluation); budget phasing (AC-BUD's own "spread"); group-level schedules across companies.

## 2. Personas and permissions

| Code (proposed) | Owner | Finance Manager | Accountant | Accounts Viewer | Auditor | Others |
|---|---|---|---|---|---|---|
| `ACCOUNTS.SPREADING.READ` | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `ACCOUNTS.SPREADING.EDIT` (create, change drafts, submit, propose a change, end) | ✓ | ✓ | ✓ | — | — | — |
| `ACCOUNTS.SPREADING.APPROVE` (approve a schedule or a change; steps under the journal limits) | ✓ | ✓ | — | — | — | — |

- **Two-person rule (A4 C-4 applied):** a schedule's **writers** (who created it, changed it or proposed a change)
  never approve it. Approval follows the company's journal limits (steps, stand-ins, `SUBMIT_FIRST`), banded on the
  amount still to release in base currency (§13 SP-7). The Owner's own approval follows the 4.11 switch.
- Feature `FINANCE.SPREADING_SCHEDULES` (new). Off: the pages open read-only with the feature-off notice; approved
  schedules keep posting (§13 SP-8, as approved reversals do under D-179).
- No READ: Spreading is not in the menu (ux §6). Neovatus (Enter company): read-only with the Enter-company bar.
  Books not LIVE: read-only "Read-only until go-live" (A4 C-5).

## 3. Navigation

- Accounts menu: **Spreading** after Recurring journals (Journals group). Route `accounts/spreading`.
- **New journal ▾** gains **Spread a cost or income** after Recurring journals (opens the editor empty).
- Bill line, invoice line and posted journal line menus: **Spread over periods…** (opens the editor with the source,
  amount, accounts and dimensions filled). A line already in a schedule shows a tag "Spread · SP-0007" (link).
- Journal detail of a period journal: source line "From the spreading schedule SP-0007 {name}, period {n} of {N}".
- Period close checklist: row **Spreading posted for {period}** (§4.6).

## 4. Screens

### 4.1 Spreading list

Page head "Spreading", subtitle "Costs paid ahead and income invoiced ahead, released to the P&L month by month."
Primary (EDIT): **New schedule**. Tabs (`NeoTabs`): **Prepaid costs · {n}** · **Deferred income · {n}**.

Toolbar (`NeoListToolbar`): search "Name, source or account"; **Status** `NeoMultiSelect` (Draft, Waiting for approval,
Active, Ended, Finished; default all but Ended and Finished); chip **Needs you · {n}**; **Account** filter.

| Column | Content |
|---|---|
| Name | name (`rowTitle`), muted line the source ("Bill B-2026-000312 line 2 · Kontorhotell AS") |
| Accounts | "1720 → 6300" (balance → P&L), names on hover and in the accessible name |
| Total | amount in base currency, right-aligned, tabular figures |
| Released | amount released so far; muted line "5 of 12 periods" |
| Remaining | amount still on the balance account for this schedule |
| Next | "30.11.2026 · 1 000,00"; warning "Nov 2026 · Closed" or "No fiscal year yet" |
| Status | `NeoEntityStatusPill` Draft (neutral), Waiting for approval (warning), Active (success), Finished (neutral), Ended (neutral); **Needs you** tag beside it |

Footer total row: Total · Released · Remaining for the filtered rows. Keyset paging with "Load more" (ADR-024 D3).
Rows needing a person first. Row tap opens the detail. Row More (holders): Edit (Draft), Propose a change, End early.
Empty: "No spreading schedules yet" · "Spread a yearly insurance, a rent paid ahead or a subscription invoiced ahead
over the months it covers." · **New schedule**. Filtered empty: "No schedules match" · **Clear filters**.

### 4.2 Schedule editor (page; Draft and "Propose a change")

Header card (`NeoResponsiveForm`):
- **Kind** segmented: Prepaid cost · Deferred income (fixed once submitted).
- **Name** (3–100, unique among open schedules), **Memo on journals** (placeholders `{period}`, `{n}`, `{N}` as A4).
- **Source**: picker "Bill line, invoice line or journal line" (posted, this company, not already spread in full), or
  **Opening balance** (amount + reason 6–500). Picking a line fills amount, date, accounts, branch and dimensions.
- **Amount to spread** (base currency; ≤ the source line's net amount, VAT never included).
- **Balance account** (prepaid asset / deferred income; default from the pack role, §13 SP-9) and **P&L account**
  (cost / income). If the source line sits on a P&L account: a notice "The first journal moves 12 000,00 from 6300
  to 1720 on 15.01.2026, then releases it month by month." (§13 SP-3).
- **Periods** card: **Start** (date), **Ends** segmented "After {n} periods" (1–120) / "On {date}", **Method**
  segmented Equal per period · By days; with Equal and a start inside a period, **First period** "Full period" /
  "From the start date (by days)".
- **Dimensions** card: Branch and each dimension the P&L account takes (4.14 rules: Required cells need a value before
  Submit; Not used shows "—" with "Not tagged by …"). Values come from the source line; changing them is allowed.
- **Preview** card (§4.4) beside the fields on wide screens, under them on narrow.
Footer: Cancel · Save draft · **Submit for approval** (primary). Submit reasons in the footer as A1 (line errors first):
"Choose a cost centre: 6300 requires one.", "Period Mar 2027 has no fiscal year yet: it will wait."

### 4.3 Schedule detail

- **Summary card:** status, kind, accounts, source (link), total / released / remaining, method, start and end,
  version "v2 · changed 01.06.2026 by Siri Dahl", writers.
- **Approval card** (`approval-card.md`): steps, who approved, who is next, Approve / Reject for the person whose step
  it is, or the line that says why not ("You wrote this schedule, so someone else approves it.").
- **Periods table:** # · Period · Date · Amount · Cumulative · Status (Waiting, Posted JV-… (link), Waiting for fiscal
  year, Period closed: needs you, Couldn't post: reason, Reversed by hand, Moved to {period}) · row action (EDIT):
  **Post again** (after a hand reversal), **Post in {next open period}** (after a closed period).
- **History** (timeline): created, submitted, approved, each posting, change proposed and approved (before/after),
  ended (mode and reason). Audit link.
- Head actions (EDIT): Propose a change · End early. Draft: Edit · Delete.

**End early** dialog: reason (6–500); **What happens to the remaining {amount}?** "Post it now, in {open period}" /
"Leave it on {1720}" (e.g. a refund is expected); preview of the closing journal. Ending needs no second person when
it leaves the amount; posting the rest goes through approval as a change (SP-1).

### 4.4 Schedule preview (in the editor, the change dialog and the detail's "as approved" view)

Table: # · Period ("Jan 2026") · Date (period's last day) · Amount · Cumulative · Remaining. Total row equals the
amount. A muted line under it: "Equal per period: 1 000,00 a month; the last period takes the 0,04 rounding." or "By
days: 31/365 of the amount in January." Periods without a fiscal year are listed with "No fiscal year yet: waits".
A change shows two columns, **Now** and **After the change**, and greys posted periods ("Posted, never changes").

### 4.5 Entry points on lines

Bill, invoice and journal detail: the line's More → **Spread over periods…**; a spread line shows the tag and a one-line
summary in its expanded row ("Spread over 12 periods from Jan 2026 · 5 released"). Draft bills: the line editor offers
"Spread over periods" which sets the line's account to the balance account and creates the schedule as Draft when
the bill is posted (§13 SP-3 note).

### 4.6 Period close and reconciliation

Period close row **Spreading posted for {period}**: "12 of 12 posted" (ticked by code) or "2 waiting: Nov 2026 is
locked" (warning, links to the filtered list); never blocking. Below the list totals, a reconciliation line per
balance account: "1720 balance 54 000,00 · remaining on schedules 54 000,00 · difference 0,00"; a difference shows as a
warning with "Open account 1720 in the general ledger".

### 4.7 Sizes

QA sizes 375×667, 667×375, 874×402, 744, 1032, 1376 (`ScreenSizes.QaSize`). Layout changes where content stops fitting
(screen-standard), not on a viewport breakpoint:

| Screen | Wide (1032, 1376) | Medium (744, 874×402) | Narrow (375×667, 667×375) |
|---|---|---|---|
| List | All seven columns, total row | Accounts folds into Name's muted line; Released folds under Total | Cards: name, accounts, remaining, next, status |
| Editor | Fields two columns, Preview beside | Fields one or two columns, Preview under | One column; Preview as a folded card "12 periods · 1 000,00 a month"; footer buttons full width |
| Detail | Summary + Approval side by side, periods table full | Cards stacked, periods table tight (Cumulative folds) | Periods as rows with the action in More |
| End early | Side sheet 560 | Side sheet, one column | Full-screen sheet (`NeoPhoneSheet`) |

Touch targets ≥ 44; every action reachable by keyboard; the field typed in stays above the keyboard.

## 5. States on every screen

Skeleton, `NeoLoadError` with Try again, offline strip (writes paused), feature off (read-only notice), books not LIVE,
no access. A schedule changed by someone else while open: "Siri Dahl changed this schedule at 10:41" · Load their
version / Keep mine (409 `VERSION_CONFLICT`). Live updates follow ADR-025 (stream contract, 4.13) once available.

## 6. Money, dates and numbers

Amounts in base currency, company format and currency scale (`NeoMoney`, shared amount field); "1 000,00" NO,
"1,000.00" PK. Dates in the company format and time zone. Periods are the company's **fiscal periods** (normal
periods, never a period 13 year-end period); a PK company with a July–June year gets July–June periods. Equal: amount
÷ periods rounded to the currency scale, the remainder on the last period. By days: day share per period, cumulative
rounding (each period = round(cumulative to date) − released so far), so the total is exact. Counts grouped in the
company format.

## 7. Rules (the contract must hold them)

- **R-1 Ordinary journals.** Each period creates one JV journal (origin `SPREADING`, schedule id, period n of N) through
  A1's posting path: Dr P&L / Cr balance for a prepaid cost, Dr balance / Cr P&L for deferred income, dated the
  period's last day, memo from the template. Period, account and dimension checks apply as for any journal.
- **R-2 Approved once, posted by the job** (§13 SP-1). Approval covers every period at the amounts in the preview. The
  job posts each due period as the approver's authorisation (the C-19/C-20 automatic-reversal pattern); nothing
  else posts without a second person (C-3).
- **R-3 One run per schedule and period.** `UNIQUE (company_id, schedule_id, period)` (C-9 pattern); a second
  instance, retry or catch-up inserts nothing. Catch-up in date order, at most 36 periods per schedule per run.
- **R-4 Reuse of the recurring machinery.** `domain/recurring/Schedule` for start/end/occurrence counting, the A4 job
  shape (transaction-level company lock, one transaction per occurrence, lock order setup → schedule → run → period),
  `AccountsCompanyClock.todayForJob`, the run-outcome words (`WAITING_FISCAL_YEAR`, `SKIPPED_PERIOD_CLOSED`,
  `SKIPPED_PERIOD_LOCKED`, `FAILED` with `max-attempts`), Org facts fetched before each transaction.
- **R-5 Closed or locked period.** Nothing is re-dated by itself; the run waits and the schedule Needs you; a person
  chooses **Post in {next open period}** (dated that period's last day, memo says "for Oct 2026") or reopens (§13 SP-6).
- **R-6 Changes change the future only** (C-16). A change is a new version (remaining amount, end, method, P&L
  account, dimensions, memo) and goes through approval again; posted periods never change; until approved the old
  version keeps running. Amount and balance account of posted periods are fixed. Kind and source never change.
- **R-7 End early.** With a reason: post the remaining amount in one journal in a chosen open period (approved as a
  change) or leave it on the balance account (no journal). Ending never touches posted journals.
- **R-8 Reversal.** A period journal may be reversed by hand (A1 Reverse, needs `JOURNAL.REVERSE`); the run becomes
  "Reversed by hand", its amount returns to Remaining and the schedule Needs you: **Post again** (same period if open,
  else the next open period) or End early. A reversed source (bill credited, invoice credited) never changes the
  schedule by itself: the schedule shows "Source credited" and Needs you.
- **R-9 Dimensions.** The P&L line carries the schedule's branch and dimension values; the balance line carries the
  branch and only the values its account takes (Required or Optional, 4.14); values a line's account does not take are
  dropped, never refused. Rules are checked at Submit, at approval and again at each posting (4.14 OD-2); a refusal
  makes the run `FAILED` with the line and dimension, and the schedule Needs you.
- **R-10 Approval limits.** Banded on the amount still to release (base currency) under the journal kind; a change is
  banded on the new remaining amount; stand-ins, `SUBMIT_FIRST`, fail closed (`AUTHZ_UNAVAILABLE`) as AL-D*.
- **R-11 Company isolation.** Schedules, runs, sources and accounts belong to one company; a source line, account or
  dimension value of another company is refused as a foreign reference (404 / `DIMENSION_INVALID`); the job runs per
  company; a franchise is its own company with its own schedules (RULES §7, §8). No schedule spans companies.
- **R-12 Limits.** 1–120 periods; at most 5,000 open schedules per company (`SPREADING_LIMIT`, advisory-lock guarded
  create as A4); a source line's spread amounts never exceed its net amount (`SOURCE_OVERSPREAD`).
- **R-13 VAT and tax.** VAT stays on the source document's date and return; only the net amount is spread. PK
  withholding is settled on the payment, not on the schedule.
- **R-14 Year-end.** A schedule crosses fiscal years freely; periods of a year not yet created wait
  (`WAITING_FISCAL_YEAR`); the year-end journal leaves the balance account as is (balance sheet).
- **R-15 Messages.** "Spreading needs you" goes to EDIT holders through the notification service; Post again and End
  early answer with an action id (ADR-025 A3).

## 8. Wording

| Use | Not |
|---|---|
| Spreading; spreading schedule; "Spread over periods…" | Amortisation schedule, deferral, periodisation (English screens) |
| Prepaid cost · Deferred income | Prepayment asset, unearned revenue |
| Balance account · P&L account | Source account, target account |
| Released · Remaining | Amortised, unamortised |
| Equal per period · By days | Straight line, daily pro rata |
| End early | Cancel, terminate, write off |
| Post again | Re-run, retry |

Ledger languages: nb/sv/da strings use the local accounting word (e.g. "Periodisering"); to be confirmed with the
I18N reviewer.

## 9. Refusals in words

| Code | Says | Next step |
|---|---|---|
| `SOURCE_OVERSPREAD` | "Only {amount} of this line is left to spread." | Lower the amount |
| `SOURCE_NOT_POSTED` | "Spread a line once its bill is posted." | Post the bill first |
| `ACCOUNT_KIND` | "{1720} isn't a balance-sheet account." / "{6300} isn't a cost account." | Choose another account |
| `SCHEDULE_INVALID` | as A4 (`END_BEFORE_START`, `TOO_MANY`, `NO_OCCURRENCE`, `START_BEFORE_GO_LIVE`) | Fix the dates |
| `DIMENSION_REQUIRED` | "{6300} needs a cost centre." | Choose one |
| `WRITER_CANNOT_APPROVE` | "You wrote this schedule, so someone else approves it." | — |
| `PERIOD_CLOSED` | "Nov 2026 is closed. Post in Dec 2026 or reopen Nov." | Post in next open period |
| `SPREADING_LIMIT` | "This company has 5 000 open schedules, the most allowed." | End finished ones |
| `VERSION_CONFLICT` | "Someone changed this schedule. Load their version." | Reload |
| `REASON_REQUIRED` | "Say why, in at least 6 characters." | — |

## 10. API sketch (contract to write after approval)

```
GET    /api/accounts/spreading-schedules?kind=&status=&needsYou=&accountId=&q=&cursor=&limit=   keyset, ≤ 200
GET    /api/accounts/spreading-schedules/summary            counts per tab, Needs you (capped 99), reconciliation lines
POST   /api/accounts/spreading-schedules                    create Draft  {kind, name, memoTemplate, source{type, id} | opening{amount, reason},
                                                            amountBase, balanceAccountId, plAccountId, startDate, periods | endDate,
                                                            method EQUAL|DAYS, firstPeriod FULL|FROM_START, branchId, dimensions: DimensionSetV1}
POST   /api/accounts/spreading-schedules/preview            same body → {periods[{n, period, date, amount, cumulative, remaining, waits}]}
GET    /api/accounts/spreading-schedules/{id}               detail, version, approval block, periods with runs, actions{…}
PUT    /api/accounts/spreading-schedules/{id}               Draft only, If-Match version
DELETE /api/accounts/spreading-schedules/{id}               Draft only
POST   …/{id}/submit · …/{id}/approval-steps/{n}/approve · …/{id}/approve {expectedStep} · …/{id}/reject {reason}
POST   …/{id}/changes {fields…, reason}                     proposes version n+1 (approval as above on …/changes/{v}/…)
POST   …/{id}/end {mode POST_REST|LEAVE, periodId?, reason} 202 + action id when it posts
POST   …/{id}/periods/{n}/post-again {periodId?}            202 + action id
```
Idempotency-Key on every write (A1 pattern); `Prefer` per ADR-025 A2. Bill, invoice and journal line reads gain
`spreading{scheduleId, number, status, spreadAmount}`. Journal `source.module = SPREADING` (additive; A4 Origin filter
gains "Spreading"). Stream contract types `accounts.spreading-schedule` (ids + status only).

## 11. Audit events

| Resource | Actions (with fields) |
|---|---|
| `accounts-spreading-schedule` | CREATE, UPDATE (Draft), DELETE (Draft), SUBMIT, APPROVE_STEP, APPROVE, REJECT (reason), CHANGE_PROPOSE (before/after), CHANGE_APPROVE, END (mode, amount, reason) |
| `accounts-spreading-run` | POST (journal id, period, amount), SKIP (status, reason), FAIL (code), POST_AGAIN (by, period), MOVE (from → to period) |

Every entry carries company, schedule id and version; the job's entries name the approver whose authorisation it used.

## 12. Nordic and Pakistan needs

- **NO / SE / DK / FI / IS:** period journals are ordinary vouchers in the company's number series, each naming its
  source voucher, so SAF-T NO, SIE and DK/FI/IS statutory files carry them unchanged. Typical accounts (to confirm in
  the ERP-Q1 AI double review, decision 13): NO NS 4102 class 17xx (prepaid) and 29xx (deferred income); SE BAS 17xx
  and 29xx; DK periodeafgrænsningsposter on both sides. The balance-account reconciliation (§4.6) supports the
  year-end specification of prepaid items.
- **PK:** fiscal years often July–June (handled by fiscal periods); input sales tax claimed on the bill per FBR rules,
  never spread; withholding on the payment; advance income tax is a tax asset, not a spreading case. English UI; PK
  number format.

## 13. Decide before building (shapes the database or a contract)

| # | Question | Recommendation |
|---|---|---|
| SP-1 | Who posts each period? | **Approve once (two people, under the limits); the job posts each due period** as the approver's authorisation, like the automatic reversal (C-19/C-20). Why: 200 prepaid items × 12 months = 2,400 journals someone would post by hand; amounts and accounts are fixed at approval. Alternative: each period created "Waiting to post" (recurring `SUBMIT`). This widens D-108/C-3, so Jabran decides. |
| SP-2 | One journal per schedule per period, or one combined journal per period? | **Per schedule per period**: each journal names its source; a hand reversal touches one schedule. Revisit if volume in the D14 load test says otherwise. |
| SP-3 | Source line on a P&L account? | **Allowed**: the first journal moves the amount to the balance account on the source date, then releases. A draft bill line can choose "Spread over periods" and post to the balance account directly. |
| SP-4 | Methods in v1? | **Equal per period and By days**, first period "Full" or "From the start date". |
| SP-5 | Run table: own, or shared with allocations ("4.15 shared run table", roadmap 4.16)? | **One table `period_runs (company_id, kind SPREADING or ALLOCATION, source_id, period_id, status, journal_id, …)`** with the A4 outcome words, used by 4.15 now and by 4.16; AC-ALC §12 A1/A6 amended to use it. Recurring keeps its applied `recurring_journal_runs`. |
| SP-6 | A due period is closed or locked? | **Wait and Needs you**; a person picks "Post in {next open period}" or reopens. Never re-dated by itself (A4 C-12). |
| SP-7 | Which approval limits? | **The journal kind**, banded on the amount still to release (base); no new limits kind. |
| SP-8 | Feature switched off? | **Approved schedules keep posting** (as approved reversals, D-179); no new schedules or changes while off. |
| SP-9 | Default accounts? | **Packs gain roles `PREPAID_COST` and `DEFERRED_INCOME`** (one default account each per pack; accounts confirmed in the ERP-Q1 review); the editor prefills from the role. |
| SP-10 | Permission codes? | **`ACCOUNTS.SPREADING.READ / EDIT / APPROVE` as §2**, Accountant holds EDIT; one user-service migration with the V-pattern defaults. |

**Amendments to other specs** (applied when this one is approved): AC-A1 New journal ▾ gains "Spread a cost or
income"; AC-A4 §4.7 Origin filter gains "Spreading"; AC-A2A3 Period close gains the §4.6 row; AC-B/C line menus gain
"Spread over periods…"; AC-ALC §12 A1/A6 use the SP-5 run table; Accounts packs gain the SP-9 roles.

## 14. App tests (named before build)

List tabs, filters, Needs you first, totals row, keyset Load more; editor from a bill line (filled), from scratch,
Opening balance with reason; Equal and By days previews with rounding on the last period; P&L-source notice (SP-3);
Required dimension refused at Submit; writer sees "someone else approves"; approval steps card; detail periods with
Posted / Waiting / Period closed / Reversed by hand and their actions; Propose a change shows Now / After; End early
both modes; feature off read-only; books not LIVE read-only; NO and PK formats; the six QA sizes for list, editor,
detail and End early; keyboard in view for the editor fields.

Rig routes (to add, file `screen-rig/accounts-spreading.jsx`, prefix `sp`): `#accounts:kyst|spreading` (prepaid
insurance 12 000,00 over 12, rent 54 000,00 by days, one Needs you on a locked period), `|spreading|SP-0007`,
`|spreading|new`, `|spreading|deferred` (annual subscription invoiced ahead), `#accounts:lahore|spreading` (July–June
year, PKR format).

## 15. Later

Schedules imported from a file and from SIE; usage-based release; spreading in foreign currency; a minimum amount
below which small companies expense at once; group dashboards across companies; IFRS 16 leases with their own spec.
