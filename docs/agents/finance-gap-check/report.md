# Finance gap check: NeoERP Accounts against professional practice

Date: 4 Nov 2026. Read-only check (Opus, for the ERP lead). Checklists: the Anthropic finance skills `reconciliation`,
`close-management`, `journal-entry`, `audit-support`, `sox-testing`, `financial-statements`, `variance-analysis`.
QuickBooks Labs skills were used for product ideas only (bank rules come from general practice).

Sources: `docs/domain/RULES.md`, `FLOWS.md`; backend `docs/api/accounts-roadmap.md`, `accounts-a1/a2/a3/a4/d/g-design.md`,
`accounts-b.md`, `accounts-c.md`, `accounts-attachments.md`; `docs/modules/accounts/period-close.md`, `reports.md`;
`docs/agents/accounts-phase3/plan.md`, `m5-plan.md`; `docs/large-customer-roadmap.md`; `docs/backlog.md`;
`NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md`; draft app specs in `NeoERP-App/docs/design/specs/`.

Gaps only: what a controller or external auditor expects that NeoERP neither has nor plans, or plans too late for
"large multi-company customers from day one". Severity: **Must** (before go-live), **Should** (large customers), **Nice**.

**Not a gap** (built or planned at a sensible point): two-person rule on journals, payments and bank entries; close,
reopen and final lock with reasons and history; close checks with acknowledgement and snapshot; gapless numbers;
recurring journals, accruals with auto-reversal, CSV import (A4); vouchers with "voucher required" (Attachments);
bank reconciliation with continuity, report and old-items warning (D); AR/AP ageing reconciled to control; P&L and
balance sheet with comparatives; cash flow (A3b); nightly ledger check; duplicate-bill rule; supplier bank-change
controls; credit-limit warning; Auditor role; retention per country; SIE and SAF-T.

## Top 10

| # | Gap | Severity | Where it stands today |
|---|---|---|---|
| 1 | Foreign-currency documents, currency bank accounts, month-end FX revaluation | Must for customers with foreign suppliers or currency accounts | Roadmap "After launch"; draft `accounts-multi-currency.md` has no phase; columns exist (B C-37, C C-26, D C-28) |
| 2 | Owned multi-company groups: intercompany postings, intercompany reconciliation, consolidation with currency translation | Should (core to product direction) | G covers franchise children only, same currency, after launch (`accounts-g-design.md` §3, §9); large-customer roadmap priority 2–3 |
| 3 | Reconciliation workbench for every balance-sheet account (preparer/reviewer, items by category and age, evidence, period status, close check) | Should | Not planned |
| 4 | Reviewer sign-off on bank reconciliations; option to make "bank not reconciled" block the close | Should (cheap now, D is a draft) | D C-14 says no second person; `BANK_NOT_RECONCILED` warning only (XD-5) |
| 5 | Close management: tasks with owner, due day, dependencies, status; board across companies; report-pack sign-off | Should | A2 has automatic checks per period only |
| 6 | Approval limits by amount and role; switch to stop Owner self-approval of journals; report of self-approvals | Should (Must for SOX-audited customers) | Draft `accounts-approval-limits.md`, no phase; Owner exception (A1 C-7) has no company switch |
| 7 | Segregation-of-duties matrix and user access review | Should | Only per-person access view exists |
| 8 | ISAE 3402 / SOC 1 Type II for the hosted service and the IT general controls behind it | Must before the first large customer (Type II needs 6–12 months of operation) | Not in go-live doc or backlog |
| 9 | Audit evidence export: change log of master data and settings; full journal export with a control total tying to the TB | Should | Large-customer roadmap "archive and audit export", priority 2, no phase |
| 10 | Spreading schedules for prepaid costs and deferred income, reconciled to the balance-sheet account | Should | Excluded from A4 (`accounts-a4.md` §2) |

## 1. Reconciliation

| Missing | Why | Severity | Suggested slice | In backlog/roadmap? |
|---|---|---|---|---|
| Workbench for every balance-sheet account: preparer, reviewer, frequency, reconciling items (timing / adjustment / investigate) aged 0–30/31–60/61–90/90+, attachments, period status, history | Auditors ask for signed reconciliations of every material account | Should | New "BS-REC" after D; close check `BS_ACCOUNTS_RECONCILED` (warning, can block) | No |
| Reviewer sign-off on a completed bank statement by another person | Key control: preparer ≠ approver | Should | Amend D: Review step, code `BANK_RECONCILIATION.REVIEW` | No (D C-14 says the opposite) |
| Company setting making `BANK_NOT_RECONCILED` / `BANK_OLD_ITEMS` block the close | "No close with unreconciled bank" | Should | D amendment | No |
| Escalation thresholds on reconciling items (amount/age), trend per period | Finds stale items early | Nice | With BS-REC | No |
| Intercompany reconciliation for owned sister companies | Group close needs it | Should | With intercompany postings (§7) | Roadmap priority 3 (too late) |
| Standing bank rules and saved categorisation | Saves most manual statement work | Should | D2 or bank feeds | "Later" in `accounts-bank-feeds.md` §14 |
| Alerts on AR/AP control-difference gauges | A difference must reach a person | Must | Before go-live | Yes (`docs/backlog.md` "Accounts monitoring") |

## 2. Close management

| Missing | Why | Severity | Suggested slice | In backlog/roadmap? |
|---|---|---|---|---|
| Close task list per company and period (owner, due day T+n, dependencies, manual tasks, status, monthly template) | Sequencing, owners, blockers | Should | New "CLOSE-T" after A4, reusing A2 checks | No |
| Close status board across companies | Groups close many companies | Should | With CLOSE-T | No |
| Report-pack sign-off stored with the period | Management-review control evidence | Should | With CLOSE-T | No |
| Close metrics (days to close, late journals, reopens, late tasks) | Improvement | Nice | With CLOSE-T | No |
| Separate close per sub-ledger (AR/AP) | Stops late invoices in a reconciled month | Nice | After launch | No |

## 3. Journal entries

| Missing | Why | Severity | Suggested slice | In backlog/roadmap? |
|---|---|---|---|---|
| Approval limits by amount and role, with stand-ins | Key SOX control | Should | Phase the approval-limits spec right after SB2d or with A4 | Draft spec; roadmap priority 1, no phase |
| Switch "Owner may not post own journal" + self-approval report | Management override monitoring | Should | A1/A2 amendment | No |
| Spreading schedules for prepaid/deferred items | Standard close entry, reconciled | Should | Extend A4 or right after | No (excluded A4 §2) |
| Allocations by key or % | Monthly cost distribution | Should | After SB2d | Draft `accounts-allocations.md`, no phase |
| Prior-period comparison shown when posting recurring/accrual journals | Consistency check | Nice | A4 app | No |
| Income tax provision / deferred tax help | Year-end entry | Nice | After launch | No |

## 4. Audit support and SOX-style testing

| Missing | Why | Severity | Suggested slice | In backlog/roadmap? |
|---|---|---|---|---|
| ISAE 3402 / SOC 1 Type II and ITGC evidence (change approval, production access separation, tested restores, monitoring) | Customers' auditors rely on it | Must for large customers | Go-live doc row now; start control period before first large pilot | No |
| Segregation-of-duties matrix of conflicting codes, checked on role change, reported | Role-level SoD | Should | user-service with roles work | No |
| User access review report and quarterly re-certification | Standard ITGC test | Should | user-service + app report | No |
| Audit log export per company and date range | Auditors need files | Should | "Archive and audit export" before first large pilot | Roadmap priority 2, no phase |
| Full journal export for testing with control total tying to TB | Completeness of samples | Should | Extend A2 journal listing export | No |
| Sample-selection helper | Auditor time | Nice | After launch (ADR-023) | No |
| Control evidence log | "Show me the control operated in March" | Nice | Falls out of CLOSE-T, BS-REC, access review | No |

## 5. Financial statements

| Missing | Why | Severity | Suggested slice | In backlog/roadmap? |
|---|---|---|---|---|
| Trend P&L (12 monthly columns + total) by dimension | Management packs, flux review | Should | A3 follow-up or reporting layer | Not in A3 |
| Statutory annual accounts (notes, equity changes, filing) | Annual reports | Nice (state boundary) | After launch | Out of scope D-106 |
| Prior-year comparatives in the first NeoERP year | First-year statements | Should | D-104 TB import as reference | Decided D-104, not v1 |
| Consolidated statements for owned groups in different currencies | Multi-company groups | Should | After multi-currency; rework G | G excludes it |
| Frozen report pack per closed period | Reproducible after reopen | Nice | Reporting layer | Roadmap "report snapshots", priority 2 |

## 6. Variance analysis

| Missing | Why | Severity | Suggested slice | In backlog/roadmap? |
|---|---|---|---|---|
| Budget vs actual vs forecast | Core for large customers | Should | Phase the budgets spec soon after SB2d | Draft `accounts-budgets.md`, ADR-022; roadmap "After launch" (too late) |
| Materiality flags, "checked" tick and explanation per flagged line | Investigation step; review-control evidence | Should | Reuse `NeoVarianceTable` | No |
| Price/volume drivers and waterfall | Leadership commentary | Nice | Reporting layer | Partly |

## 7. Intercompany, FX and consolidation

| Missing | Why | Severity | Suggested slice | In backlog/roadmap? |
|---|---|---|---|---|
| Foreign-currency invoices, bills, payments, bank accounts; realised FX | Daily need in the Nordics | Must | Before first large/SE pilot with foreign suppliers; next to D | Roadmap "After launch"; draft spec |
| Period-end FX revaluation with auto-reversal; close check | Standard close step | Must (with the row above) | Multi-currency spec | Draft spec; FX journal type inactive |
| Intercompany postings between owned companies | Monthly recharges and loans | Should | After SB2d, before G | Roadmap priority 3 |
| Consolidation for owned groups with eliminations | See §5 | Should | Rework G | Franchises only |
| Payment files (pain.001, Bankgirot) | Large AP volumes | Should | Pull D3 / PF-1 into phase 5 | D3 "after launch" unless PF-1 first |
