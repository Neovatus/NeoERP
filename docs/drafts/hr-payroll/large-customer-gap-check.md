# HR & Payroll: large-customer gap check (ERP-195)

Owner: HR & Payroll lead. Draft, 2026-10-22. Read-only check of `docs/large-customer-roadmap.md` §3/§4 against the v2 contracts (`NeoERP-BackEnd/docs/api/hrms-v2-h0…h4.md`, `payroll-v2-p0…p4.md`), the scopes and ADR-021/022/023. Priorities: 1 = needed to sell to a large employer, 2 = soon after, 3 = later. Nothing here is built; H0 + P0 wait for the build gate.

## 1. HR (roadmap §3)

| Feature | v2 has (contract §) | Missing | Pri | Links |
|---|---|---|---|---|
| Position management | `hr.positions` (renamed designations): code, title, free-text `grade`, optional `department_id`, status (H1 §3.1-1/2, §5.5); `employeeCount` on the list (H1 §6.1) | Headcount and FTE budget per position, vacancies (open/frozen/filled), budgeted vs filled, position→incumbent link and history, position cost centre | 1 | ADR-022 personnel-cost budget; Payroll grade (§2) |
| Org chart | Data exists: department tree with `parent_id` and `head_employee_id` (H1 §3.1-3), reports-to with cycle check (H1 §5.4) | Chart read and screen ("org chart drawing" out of scope, hr scope §2); matrix / dotted-line managers | 1 | — |
| Bulk changes and import | One-by-one job changes (H1 §5.1, H4 §7.3); CSV export only (`HR.EMPLOYEE.EXPORT`, H1 §4.1, no sensitive columns) | Employee import (onboarding thousands), mass job change (reorg: move department / manager / cost centre for N people, one effective date), with preview, row errors, all-or-nothing, audit per row | 1 | Payroll retro (§2); shares the P1-43 import transport pattern |
| Approval chains and delegation | One step: approver = manager up the reporting line or `HR.EMPLOYEE.ALL_TEAMS` holder (H0-10, H0 §7.1); separation of duties (H0-11); one inbox over all kinds (H2-29, §9.8); workflow outbox to the direct manager (H0-12) | Multi-step chains (manager → HR → finance by amount or kind), delegation / out-of-office stand-in with dates, escalation after N days, reassignment when a manager leaves | 1 | Shared approval model (roadmap §3, ERP lead); expense claims; Payroll run approval |
| Salary grades, review cycles | HR `positions.grade` is free text (ADR-022 context l.21) | Grade table is Payroll's (roadmap §4); HR needs position → default grade id and shows the grade name only | 1 | See §2 |
| Expense claims | Flow decided (roadmap §3, ADR-021 Q8); nothing in contracts | Contract: ESS claim, manager + conditional second approval, Accounts release, taxable part → Payroll one-off | 2 | Accounts (post, pay), Payroll (P1 one-offs need dimensions, §3 D7), ADR-022 stage 2 |
| Performance | Frozen (D6): scoped tables, hidden screens (H0 §5.3, Q7) | Cycles, goals, calibration, ratings feeding salary review | 2 | Salary review (§2) |
| Training | None (out of scope, hr scope §2); document `kind = CERTIFICATE` without expiry (H1 §3.1-10) | Courses, certifications with expiry reminders, mandatory training per position | 2 | — |
| Recruitment | None (out of scope) | Vacancy → applicant → offer → H4 onboarding | 2 | Position vacancies; ADR-022 hiring reserve (stage 2) |
| Documents / e-sign | Encrypted per-file store, kinds, soft delete + 30-day purge (H1 §3.1-10, §6.1) | Generated contracts and letters from templates, e-signature, expiry dates, bulk letters (e.g. after a pay review) | 1 | ADR-020 file store |
| HR analytics | Lists with filters (H1 §6.2), CSV export | Headcount, FTE, joiners/leavers, turnover, absence rate, by department/branch over time | 1 | ADR-023 module reports + HR facts (`HR_CONFIDENTIAL` class) |
| Group of employers | One record per employment per company (H1 D4, scope rule 2); move via H4 §7.11; one login, several employers (H1 §10) | Group-wide person view, cross-company headcount, group transfer in one step | 2 | ADR-023 (never a cross-tenant query; group reports through the read store) |
| Workforce planning | None | Planned positions and hires by month, scenario versions | 2 | ADR-022 budget versions |
| Collective agreements | Code + name on the job row, free (H1-12); full libraries out of scope | Agreement table per company, rules per agreement (hours, leave, pay scales) | 2 | Payroll policy (P1-15) |
| Leave accrual at scale | Accrual and year-end jobs (H2 §7.4–7.5), policy by employee group (H2 §5.1-3) | Stated time budget for 5,000+ employees; mass leave grant/adjust with import | 2 | — |
| GDPR requests | Encryption, masking, audited reveals (H1-13, H2-23); document purge | Data-subject export (access), erasure / anonymisation after retention per country, retention schedule for the whole record | 1 | ADR-020 D5; Payroll retention (P3 §6.4) |
| Audit trails | Outbox audit catalogue for every write and sensitive read (H0 §8, H1 §8) | Bulk-change audit grouping (one batch id, N rows) | 2 | — |

## 2. Payroll (roadmap §4)

| Feature | v2 has (contract §) | Missing | Pri | Links |
|---|---|---|---|---|
| Runs at volume | Async calculate above 200 employees, one worker per run, one result transaction (P1 §10.2); per-employee errors (P1-28); bank file async above 200 (P3 §5.1-9) | Performance budget (e.g. 5,000 employees in ≤ N min), chunked writes instead of one huge transaction, parallel workers per run, HR facts paging cost (`size=200`, H0 §10.2) at volume, load test in the CP list | 1 | ADR-023 load assumption (5,000 employees) |
| Many pay groups | Pay groups own periods (P1-19); `POST /runs` derives the group from the period (P1 §3); confidential group (P1-37) | "Run all groups due this week" view; PC-14 one Regular run per **company and period** is fine only because periods are per group: confirm in P1 | 2 | — |
| Retro / arrears at scale | One-off arrears with `relates_to_period_id` (P1 §4.1, §7.5); HR flags `retroactiveFrom` (H1 §5.3); correction runs (P2 §9.3) | Automatic retro: recalc past periods, diff, generate arrears lines for every employee touched by a mass change; across closed years is out of scope (payroll scope §2) | 1 | HR bulk changes (§1) |
| Multi-company group runs | Each company runs alone (tenant, ADR-012) | Group calendar and status across companies, one approval session per group, consolidated cost report | 2 | ADR-023 |
| Cost allocation per dimension | Branch + one cost centre per line from segment → job → department default (P2-9) | Percentage split across cost centres/projects per employee or element; project from timesheets | 1 | ADR-021 (§3 D5, D8) |
| Payroll budget vs actual | Postings reach the ledger as actuals (P2) | Personnel-cost budget (positions × headcount × grade midpoint), feed to ADR-022 budget versions; payroll-side variance vs budget | 1 | ADR-022, roadmap §6 |
| Salary grades and review cycle | None | Grade table (min/mid/max per pay group, dated), out-of-grade reason, compa-ratio; review cycle with proposals, budget, approval, bulk effective-dated elements | 1 | HR positions, ADR-022 check |
| Employee list in Payroll | None (roadmap §4) | List with pay group, grade, salary (masked by `CONFIDENTIAL.READ`) | 1 | — |
| Mass import of variable pay | One-offs entered one by one (P1 §8.4, `source = MANUAL`); tax-card import exists (P1-43) | CSV/Excel import of one-offs and recurring element changes per run, reusing the P1-43 transport (preview, row errors, apply) | 1 | — |
| Bank file splitting | One file per run, kind and paying account (P3 §5.1-4); format row has `max records` (P3-5) | Split by max records, by paying account / bank / currency, by branch; behaviour when a run exceeds `max records` is unspecified | 2 | — |
| Approvals for large runs | Four eyes, one approver (P0 PC-11, payroll scope rule 4) | Multi-level (Payroll → Finance above an amount), approval per pay group, variance sign-off delegated by department | 2 | Shared approval model (§1) |
| Reporting / analytics | Run totals by branch and cost centre (P2 §10.3), variance (P1-21), filings (P4) | Cost by department and over time, headcount cost trend, YTD registers, export to BI | 1 | ADR-023 payroll cost line fact, `PAYROLL_PERSONAL`/`AGGREGATE` |

## 3. Conflicts with shared dimensions (ADR-021)

Already aligned: cost centre is an Accounts id, never free text (H1-10); department has a default cost centre (H1 §3.1-3); every payroll line carries a branch and Accounts never defaults it (P2-9 ACC-24); defaults are resolved by the producer and frozen on the line (P2-9 = ADR-021 D4). **H0 tables need no change** (H0 §10.2 `job` already carries `departmentId`).

| # | Where | Today | Fix | When |
|---|---|---|---|---|
| D1 | P0 §4.6 V8 `pay_run_lines` (and `pay_run_items`) | Line hooks are `posting_role`, `branch_id`, `cost_centre_id` only | Add nullable `department_id`, `project_id`, `free1_id…free4_id` (ADR-021 D3, Q4 = 4) to lines (and items as defaults). Also state that the line is the source of truth (§4.6 puts branch/cost centre on items, §8 reads them from lines) | **Fix before P0 build** |
| D2 | P0 §8 hand-off table `lines[]` (frozen at approval) | `role`, `branchId`, `costCentreId` | Hand off the full `DimensionSetV1` (`departmentId`, `projectId`, free dims); P2 §6 body, §5.1 sum key and §5.4 split order follow as a P2 amendment | **Fix before P0 build** |
| D3 | H1 §11 `segments[]` (`HrEmployeeFactsV1`) | `branchId`, `costCentreId`; no `departmentId` | Add `departmentId` (and `projectId` if the job gains one) so a mid-period department move posts to both departments | Before H1 build |
| D4 | H1 §3.1-3 `hr.departments`; H1 §13 | Status + deactivated_at only; no `validFrom`/`validTo`; no `hr.department.changed` event | Add validity dates and a header-node flag (ADR-021 D5, Q6); publish `hr.department.changed` via ADR-019 and a machine read by ids (D2.4–5); Accounts' validity cache needs it (Q1) | Before H1 build |
| D5 | H1 §3.1-5 `job_assignments.cost_centre_id` | One cost centre per job row | Additive `job_cost_allocations (job_row_id, cost_centre_id, project_id, percent)` later; engine splits lines per allocation. Not blocking: P0 lines can already repeat per segment | Pri 1, after P1 |
| D6 | P2-9; P2-A8 | Payroll checks only branch-required at calculate | Read ADR-021 D6 account rules (required / not allowed per dimension and account range) and stop at calculate, as for branch; payable/liability lines stay branch-only unless a rule requires more | P2 amendment |
| D7 | P1 §4.1 `one_off_inputs` | No dimension fields | Add nullable dimension override (bonus charged to another cost centre; taxable expense-claim parts carry the claim line's department / cost centre / project, roadmap §3) | Before P1 build |
| D8 | H3 §11.1 `HrPeriodTotalsV1` | Hours per employee and period, no cost centre / project | Hours by project/cost centre when Projects arrives (labour cost by project) | Pri 2 |
| D9 | P2 §5.4 split rule | Split by branch → cost centre → employee chunks | Adding department raises line counts; keep department inside the cost-centre key and re-test `split-over-max-lines` | P2 amendment |
| D10 | H1 §3.1-1 `positions.grade` | Free text | Not a dimension; replace by a Payroll grade id reference when grades land (HR shows the name only) | With grades |
