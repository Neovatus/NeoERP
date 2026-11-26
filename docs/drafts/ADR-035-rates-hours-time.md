# ADR-035: Who owns rates, hours and time — HR, Payroll, Projects and Time, Workforce scheduling

**Status: Proposed (draft, 2026-11-26).** Written by the old-Mac lead after Jabran's discussion of service, project and shift businesses (`docs/VISION.md` §3–4). Numbers 029–034 are reserved by the ARCH-1 plan (`docs/agents/arch1/brief.md`).

## Context
NeoERP targets service and project companies (time logged on projects → billed, costed, paid) and shift-based workforces (rotas, clocking, overtime rules), as well as companies that log time on **internal** projects with no client and no bill rate (R&D, internal IT, an office move, a capital project). HR and Payroll are built next (HR H1). If rates and hours have no single owner now, Projects and Scheduling later either copy pay data (two truths) or force HR/Payroll rework on live data.

## Decision (proposed)
1. **One owner per number; others read, never copy** (ADR-001, ADR-027).

| Data | Owner | Read by |
|---|---|---|
| Person, employment, contract, position, role, grade, working-time pattern, cost centre and department | **HR** | Payroll, Projects and Time, Scheduling, Accounts (dimensions) |
| Pay (salary, hourly wage), supplements (overtime, night, weekend, holiday), employer costs, country and collective-agreement rules | **Payroll** | Projects and Time (cost rate), Scheduling (planned cost), Accounts (postings) |
| **Cost rate per person per date** (fully loaded: pay + employer tax + holiday pay + pension, optionally overhead) | **Payroll** publishes it; HR has no money | Projects and Time (project cost), budgets (ADR-022) |
| Projects, tasks, budgets per project, **bill rates** (per role, person, client, contract, date; optional), time entries, approval, invoice proposals | **Projects and Time** | Accounts (invoices, cost postings with the `project` dimension), reporting (ADR-023) |
| Rotas, shift templates, shift swaps, clock-in/out, attendance | **Workforce scheduling** | Payroll (hours by type), Projects and Time (hours on a project when a shift is project work) |

2. **Time is not only for billing.** A time entry needs a project (or an internal activity) and hours; a bill rate is optional. Internal projects carry cost only (cost rate × hours), feed project budgets, and can feed capitalisation later (fixed assets). Billable projects add bill rate → invoice proposal → Accounts invoice.
3. **Hours flow one way into pay:** approved time and attendance → Payroll as hours by type (normal, overtime, night, absence). Payroll applies the rules; Projects and Scheduling never compute pay.
4. **Money posts only through Accounts** (ADR-005): project cost (from payroll cost per project) and revenue (from invoices) post with the `project` dimension (ADR-021). No module writes the books directly.
5. **Customers on their own systems** send time or attendance through the integration API (owning service = Projects and Time or Scheduling), with the same rules as the app (ADR-027).
6. **HR H1 builds the fields now:** role/position, grade, working-time pattern and cost centre on the employment, dated, so Projects and Scheduling only read them later.

## Consequences
- HR and Payroll contracts gain a dated cost-rate read and an hours-in endpoint before Projects exists (small, planned in their scopes).
- A person's cost rate is sensitive: Projects shows margin per project to people with the right; individual cost rates only to Payroll/finance rights (permission per action, `permission-actions.md`).
- Collective-agreement shift rules (Nordics) are Payroll country packs, not Scheduling logic.

## Open (for Jabran)
1. Overhead in the cost rate: payroll costs only, or a configurable overhead % per company?
2. Internal time for all employees (e.g. absence and activity tracking), or only project time?
3. Order after Payroll: Projects and Time first (proposed), then Workforce scheduling?
