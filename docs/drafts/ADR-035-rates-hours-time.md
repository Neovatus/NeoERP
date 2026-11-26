# ADR-035: Time and attendance, rates and hours: HR, Payroll, Projects and Time, Workforce scheduling

**Status: Proposed (draft v2, 2026-11-26).** Written by the old-Mac lead from Jabran's discussion (`docs/VISION.md` §3–4) and the rules check `.review-channel/rules-check-time-attendance.md` (sources per claim; its "Not verified" list must be closed before each country pack is built). Numbers 029–034 are reserved by the ARCH-1 plan.

## Context
Recording working time is an **employer duty for every company**, not a project feature: the EU Court of Justice requires an objective, reliable and accessible time-recording system (C-55/18, 2019), and the Nordic countries apply it (Norway arbeidsmiljøloven §10-7; Denmark daily totals from 1 July 2024; Iceland Act 58/2023 with a 12-month employee view; Finland and Sweden to verify). Cash-intensive trades also need **tax-authority staff registers** (Sweden *personalliggare*: restaurants, construction and more, fines 12 500 SEK + 2 500 per missing person, electronic change log; Norway *personalliste*: restaurants, hair and beauty, car workshops and washes). Pakistan keeps attendance and wage registers under federal and provincial law (to confirm with a Pakistani labour lawyer). On top of that, customers want hours **per project or customer** (cost and billing) and **rotas** for shift work. Contractors and consultants are not covered by working-time law; their hours are for invoices and cost.

## Decision (proposed)
1. **Time and attendance is HR core, for every company** (in HR from H1/H2, before Payroll takes hours):
   - one **hours record per person per day**: start, end, breaks, source (clock, app, manual, import/API), status, approver;
   - **worker types**: employee (permanent, part-time, hourly), temporary, agency worker (linked to the agency supplier), contractor (optional);
   - **absence and leave** are time types in HR, not projects;
   - **legal-limit checks** (daily and weekly rest, maximum hours, night work) from a per-country **working-time law pack**: warnings and blocks, not pay;
   - **period close** per company (week or month), locked after the payroll cut-off; later changes are dated corrections with a reason; a **tamper-evident change log**;
   - **employee self-view** of their own records (DK, IS, and good practice everywhere).
2. **Allocation is optional:** an hours record may be split into **allocation lines** to a project, a customer (without a project), a cost centre or an internal activity. This is the only bridge to Projects and Time. An hours record needs no project.
3. **Payroll owns pay:** salary and hourly wage, supplements (overtime: Norway at least 40 % by §10-6; night, weekend, holiday), employer costs, **collective-agreement rule packs** (versioned data, NO/SE/DK/FI/IS) and **Pakistan's provincial rules**; it reads approved hours by type and publishes a dated **cost rate per person** (fully loaded). Time and attendance never computes pay.
4. **Projects and Time (optional module):** projects, tasks, project budgets, **optional bill rates** (per role, person, customer, contract, date), invoice proposals, margin. It reads attendance hours and their allocation lines, and accepts **time-only entries** for people without a clock (consultants, contractors). Internal projects carry cost only (cost rate × hours), against budgets, later capitalisation.
5. **Contractors and agency workers:** supplier timesheets in Projects and Time; approved hours become a **purchase invoice or an accrual** in Accounts. Agency workers on site also get an attendance record linked to the agency supplier.
6. **Workforce scheduling (optional module):** rotas, shift templates, swaps, availability. A planned shift is not worked time: clock-in confirms it into the attendance record.
7. **Tax staff registers (SE, NO):** not a separate product: a **register view and inspection export** of the attendance record, with the change log, for the listed trades, switched on per company by trade and country.
8. **Privacy per company:** allowed clock-in methods; **biometrics off by default** (Danish Datatilsynet rejected fingerprints for ordinary time registration, 2019); location only as a geofence check at clock-in, no tracking; retention period per country pack.
9. **Money posts only through Accounts** (ADR-005) with the `project` dimension (ADR-021): payroll cost per project, contractor purchase invoices, revenue from invoices.
10. **Back-office-only customers** send clock events and hours through the integration API with the same checks (ADR-027).
11. **Data owners**

| Data | Owner | Read by |
|---|---|---|
| Person, employment, worker type, position, role, grade, working-time pattern, cost centre | HR | all |
| Hours records, allocation lines, absence, period close, change log, legal-limit pack, register exports | HR (Time and attendance) | Payroll, Projects and Time, Scheduling, reporting |
| Pay, supplements, agreement packs, provincial rules, cost rate | Payroll | Projects and Time, budgets, Accounts |
| Projects, tasks, bill rates, time-only entries, supplier timesheets, invoice proposals | Projects and Time | Accounts, reporting |
| Rotas, shifts, swaps, availability | Workforce scheduling | HR (planned vs worked), Payroll (planned cost) |

## Must-have for a first sale (per country, from the rules check)
- **Norway:** daily hours overview (§10-7) available to the labour inspection; *personalliste* for restaurants, hair/beauty and car trades.
- **Sweden:** *personalliggare* with change log for the listed trades (restaurants, construction, …).
- **Denmark:** daily totals, visible to the employee.
- **Finland:** records with overtime split (law to verify). **Iceland:** records plus a 12-month employee view.
- **Pakistan:** attendance, overtime and shift reports per province (legal specifics to confirm).

## Consequences
- HR H1/H2 gains Time and attendance before Payroll; Payroll's scope reads approved hours by type.
- A person's cost rate is sensitive: margin per project for people with the right; individual cost rates only for Payroll/finance rights (permission per action).
- Each country pack (law limits, agreements, registers, retention) is built only after its "Not verified" items in the rules check are closed.

## Open (for Jabran)
1. Overhead in the cost rate: payroll costs only, or a configurable overhead % per company?
2. Attendance in HR H1 (with the first HR release) or H2 (right after)?
3. Order after Payroll: Projects and Time first, then Workforce scheduling?
4. A Pakistani labour lawyer and a Nordic payroll accountant to confirm the packs before they are built (go-live list)?
