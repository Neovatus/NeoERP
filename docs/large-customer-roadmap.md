# Large-customer roadmap

Owner: **Code · ERP lead (trial)**. Started 2026-10-22. Status: **Draft**: waiting on the module leads' gap check (ERP-194, ERP-195), then Jabran sets the order.

## Why

NeoERP is for small **and** large companies (Jabran, 2026-10-22). Large customers expect budgets, cross-module reporting, position management and more. This page is the one list of what that needs, which module owns each part, and how the parts link. Nothing here stops current work: it all comes **after** the core phases in progress (Accounts Phase 3; HR & Payroll H0 + P0).

Every large-customer feature is **optional per company and off by default**, so small companies see none of it (ux §14 fewest steps).

## 1. Foundations first (ERP lead, cross-module)

Order matters: each one depends on the one before.

| # | Item | Document | Why first |
|---|---|---|---|
| F1 | **Shared dimensions**: account, period, company, branch, department, cost centre, project, product, free dimensions; one owning service each; every money line carries them | ADR-021 (Proposed) | Budgets and reports compare across modules only if every module tags the same way. Sales, purchase and inventory designed later must carry them from the start. |
| F2 | **Budget control**: Accounts owns budgets; one shared check / reserve / release contract that every spending module calls | ADR-022 (Proposed) | Purchase, sales, HR, payroll, assets and expenses all need it; one contract instead of six. |
| F3 | **Reporting layer**: a read store fed by domain events (ADR-019), same dimensions, permissions carried over, drill-down to source | ADR-023 (Proposed) | Cross-module reports can't join databases; dashboards, scheduled reports and BI access sit on it. |

## 2. Accounts

| Pri | Feature | Notes |
|---|---|---|
| 1 | **Budgets**: versions, grid entry and paste, spread, copy ± %, approval and lock, budget vs actual, forecast | ADR-022; personnel-cost line from Payroll |
| 1 | **Budget check on purchases and bills**, commitments | ADR-022 check / reserve |
| 1 | **Fixed assets**: register, depreciation, disposal, capex budget | Not on the roadmap today (Accounts README) |
| 2 | Group consolidation across legal entities, currency, eliminations | Later; ADR-023 level 6 |
| 1 | **Dimensions on lines**: department, project and cost-centre maintenance (cost centres read-only today); department from HR | ADR-021; storage by dimension-set id (ERP-197) |
| 1 | **Integration posting API**: outside systems post daily totals as balanced journals with dimensions, idempotency, source and batch; extends `AccountsPostingV2`, no second path; two-person rule per company | ADR-021 D10 |
| 1 | **Import with dimensions**: journal CSV columns; SIE `#DIM`/`#OBJEKT`/object lists and `#PBUDGET`; SIE export writes objects; budget import | ADR-021 D10, ADR-022 D5 |
| 1 | **Approval limits** per role and amount (journals, payments), shared approval model with HR | Links HR approval chains |
| 2 | Recurring journals and **allocations** by key or % across cost centres and departments | |
| 2 | **Multi-currency depth**: revaluation, realised and unrealised FX, currency per bank account | Single currency today |
| 2 | **Bank integrations**: statement feeds (camt.053, Nordic bank APIs), payment files (pain.001) | Accounts D |
| 2 | **Imported invoices and bills as documents** for Accounts-only companies (ageing and payment matching without Sales/Purchasing) | |
| 2 | **Volume**: partitioning by company and year, report snapshots, archive and audit export, background report jobs | ADR-023 |
| 3 | Intercompany matching, group chart (with consolidation) | |

## 3. HR

| Pri | Feature | Notes |
|---|---|---|
| 1 | **Position management**: headcount per position, vacancies, budgeted vs filled | Feeds the personnel-cost budget (ADR-022) |
| 1 | **Org chart** from departments and reports-to | |
| 1 | **Bulk import and mass changes** with a review step | |
| 1 | **Approval chains and delegation** (multi-step; hand over while on leave) | Shared approval model, not HR-only |
| 1 | **HR reports**: headcount, turnover, absence rate, cost by department | ADR-023 |
| 1 | **Employee documents**: generated contracts and letters, e-signature | File store ADR-020 |
| 2 | **Expense claims** (Jabran, 2026-10-22): employee submits in self-service (receipt photo per line, category → account, mileage and per-diem rates from the country rules, checks for missing receipt, over-limit and duplicates) → **line manager approves** (from HR reports-to; always first) → **second approval only when needed** (above a company amount or on a policy exception, to the cost-centre or budget owner; HR only if the company adds it for exceptions) → **Accounts checks, releases and posts** (receipts, VAT, accounts, dimensions; can return a line with a reason) → **payment split by tax:** tax-free parts paid by Accounts in the next payment batch; taxable parts (above legal rates, taxable allowances) go to **Payroll** in the next run and its filings. Rules: nobody approves their own claim; the approving manager can't also release the payment; delegation while away; reminders and escalation; lines carry the employee's department, cost centre and project; receipts kept per country retention. Later: company cards, receipt reading, cash advances. | Spans HR (ESS, approvals), Accounts (release, post, pay), Payroll (taxable parts); budget check (ADR-022 stage 2) |
| 2 | Performance and goals; training and certifications (expiry reminders); recruitment (vacancy → applicant → offer → onboarding) | |
| 3 | Surveys, succession planning, learning | |
| — | *Lead to add* | ERP-195 |

## 4. Payroll

| Pri | Feature | Notes |
|---|---|---|
| 1 | **Salary grades**: min, midpoint and max per pay group, dated; position default grade; out-of-grade needs a reason (and optionally a second approver); compa-ratio report | HR shows the grade name only, never amounts |
| 1 | **Salary review cycle**: proposals, budget, approval, effective date | Budget check (ADR-022) |
| 1 | **Employee list in Payroll** (Employee pay has no list today) | Already in the principles audit |
| 1 | Personnel-cost budget: positions × headcount × grade midpoint | Feeds Accounts budget |
| — | *Lead to add* | ERP-195 |

## 5. Future modules (not started)

**Projects** will come (Jabran, 2026-10-22); project is a dimension from now (ADR-021), so entries tagged today carry over. Sales, purchase, inventory, projects: each is designed with the dimensions (ADR-021) and, where it spends or earns, the budget contract (ADR-022) from its first spec.

## 6. Links between modules

| From | To | What flows |
|---|---|---|
| HR positions × headcount | Payroll grades → Accounts budget | Planned personnel cost |
| Payroll postings | Accounts ledger → budget actuals | Actual personnel cost |
| Purchase / expense approval | Budget control | Reserve; bill or payment consumes |
| Every module's events | Reporting layer | Facts by dimension, for cross-module reports and dashboards |

## 7. Next

1. Leads return their gap lists (ERP-194, ERP-195).
2. I merge them here, settle the cross-module links, and bring the order to Jabran.
3. **Order approved by Jabran (2026-10-22): ADR-021 → ADR-022 → ADR-023.** Each moves from Proposed to Accepted after the gap lists are merged and its machine-client scopes are approved; module specs follow.
