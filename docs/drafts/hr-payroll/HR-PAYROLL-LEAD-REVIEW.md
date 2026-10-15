# HR, Payroll & ESS — Step 0 lead review

Owner: **Cowork · HR & Payroll lead**. Written 2026-10-09. Status: **accepted by Jabran 2026-10-09** (D1, D4–D8 decided; uncommitted draft). Revised the same day to follow handover §2a (v2 replaces v1).

> **§2a alignment (Jabran, 2026-10-09).** v2 replaces v1:
> - **Screens:** every HR, Payroll and ESS screen is designed in the Screen Rig first, in every state and at every width, and approved before it's rebuilt. The v1 screens are removed when their v2 replacement ships. Nothing from the v1 UI is carried over.
> - **Backend:** replaced area by area. A "KEEP" or "REFACTOR" verdict below means the code is kept *and brought up to standard* (ADR-012, SEC tier 2, permissions with defaults, audit, docs).
> - **Data:** every data change goes through new migrations that **keep existing data**, and seed and demo data are updated with each slice.
>
> **D1 decided (Jabran, 2026-10-09):** countries follow `claude/target-countries.md`. Full packs at launch for **PK, NO, SE, DK, FI and IS**. The company's Org country switches them on, and every other country gets HR on the base leave pack and Payroll "coming". Payroll order: PK → NO → SE → DK → FI → IS, with the engine and filing interface designed against Norway from the start. §4.4–4.6, §4.7, §5 and §8 below are revised for DK, FI and IS.
>
> This revision withdraws the earlier D2 (clearing dev data) and D3 (how much of v1 to keep, now decided), and puts the full rig before any build.
Inputs: `module-lead-playbook.md`, `next-modules-plan.md`, `hr-payroll-lead-handover.md`; a read-only review of `services/hr-service` (about 15.1k lines, V1–V9), `services/payroll-service` (about 5.4k lines, V1–V5), `docs/api/hrms.md`, `payroll.md` and `people-pa1.md`, and the app features `hr`, `payroll` and `ess` (about 9.1k lines). Paths are relative to the service or app `src/main` / `commonMain` root unless they're shown in full. The key claims (§9) were spot-checked by hand.

---

## 1. Verdict in one paragraph

v1 is a useful **skeleton**, not a base to polish. Six things are reusable:

- the hexagonal service layout;
- the tier-1 security wiring;
- the PA-1 employee ↔ login link with its outbox;
- ESS `HrMe`;
- the internal link endpoint;
- the app's DTOs, remote data sources and `*Access` gates.

Everything that makes HR and Payroll *correct* is missing or wrong, and needs a rebuild:

- tenant isolation;
- who approves;
- audit;
- the employment data model;
- leave balances;
- the payroll calculation and run lifecycle;
- every country rule;
- posting;
- all three app screens.

Payroll has **no real calculation engine**: it uses flat amounts and a flat percentage of gross. Nothing in it is country-correct for Norway, Sweden or Pakistan.

---

## 2. Inventory and verdict per area

### 2.1 HR backend

| Area | What it really is | Verdict | Reason |
|---|---|---|---|
| Employees | Job placement only (code, branch, department, designation, manager, status, dates) plus the PA-1 login link | **REFACTOR** | The link work is solid. Department, designation and manager are checked by id only, so they can belong to another company (`EmployeeService.kt:46-51, 315-331`). Branch isn't checked against Org. There's no person/employment model and no effective dating. |
| Departments, designations | Scoped tables. Designations have no update or deactivate. A list without a company id falls back to `findAll()`. | **REFACTOR** | Right shape. Needs scoped repositories and the missing endpoints. "Designation" becomes "Position / job title" (glossary). |
| Employee history | Department, designation and status before/after only. No `company_id`. Branch and manager changes are lost. | **REFACTOR** | Becomes the effective-dated job assignment record. |
| Lifecycle requests | Transfer, promote and separate, with approval | **REFACTOR** | Approval applies the change immediately and ignores `effectiveFrom`. The approver comes from the request body. The manager rule passes whenever the employee has no manager. |
| Attendance | Check-in/out stamped with the server clock (`LocalTime.now()`). No company time zone, no shifts. | **REBUILD** | Wrong for a three-country product. No ESS clock-in. |
| Attendance workflows | Regularization and overtime | **REFACTOR** | Approver from the body. `findAllByStatus` crosses companies. No working-time rules. |
| Leave (types, requests, balances, policy, encashment) | Global types CASUAL, SICK and UNPAID (**no annual leave**). Balance is a single number with no ledger. Accrual runs by hand and isn't idempotent. Encashment amount comes from the client. Weekend hard-coded to Saturday/Sunday. | **REBUILD** | Not legally usable in any of the three countries. |
| Holidays | Company id plus an optional branch, scoped correctly | **KEEP** (light refactor) | Add country and region calendars. |
| Shifts | Global table. Create and update always return 403: they need an `employee_id` claim that no token carries (`ShiftController.kt:31,43`). | **REBUILD** | Dead code. |
| Performance | No company id. A review can be written on **another company's goal** (`PerformanceService.kt:45-58`). | **REBUILD, later** | Defer out of v2 (D6). |
| Manager views | Loads every company's pending leave and filters it in memory. `managerEmployeeId` is a parameter, so anyone with read can view any team. | **REFACTOR** | Take the manager from the token. Becomes the approvals inbox. |
| ESS (`HrMe`, 13 endpoints) | The employee is resolved from the company plus the token's user. There's a two-company web test. | **KEEP** | The best-built area. Only the repositories need scoping. |
| Internal link endpoint | Pinned to user-service's client, scope and audience. Idempotent and audited. | **KEEP** | Reference quality. |

### 2.2 Payroll backend

| Area | What it really is | Verdict | Reason |
|---|---|---|---|
| Components | Code, type and `taxable` flag. The calculation **ignores `taxable` and employer contributions**. | **REFACTOR** | Needs company, country, a statutory income-code mapping and calculation behaviour. |
| Structures and assignments | Flat amounts. No overlap check, no effective dates. A UNION of direct and structure rows can **double-count**. No proration. | **REFACTOR** | Keep the tables. Add effective-dated pay elements. |
| Tax and statutory rules | One flat `rate_percent` on gross. Edited in place. Seeded "HRA/PF 10%/5%" (Indian terms). | **REBUILD** | Replace with country packs (§4.7). |
| Pay periods | OPEN/LOCKED only. Global code. No frequency or pay date. | **REFACTOR** | Becomes the pay calendar per pay group. |
| Pay runs | One run per period. DRAFT → CALCULATED → APPROVED → POSTED. One person can calculate, approve and post. The workflow actor is hard-coded `"payroll-checker"`. "POST" only publishes payslips. | **REBUILD** | Needs four-eyes control, off-cycle and correction runs, a version and an idempotency key. |
| Run items | Tax and statutory lines get synthetic `componentId = nameUUIDFromBytes(...)` (`PayRunService.kt:185`), but `pay_item_components.component_id` has an FK to `salary_components` (`V3:35`). **Calculate should fail on real Postgres.** No test touches the database. | **REBUILD** | New line model: element, base, rate, quantity, rule version. |
| Payslips | Totals only, no lines and no year-to-date. An unknown `period` returns every period. | **REBUILD** | |
| Compliance report | Shows the *current* configured rates, not the rates applied (breaks ADR-010 §5) | **REBUILD** | The real outputs are the country filings. |
| Reporting / CSV | Plain sums. The CSV has no company scope. | **KEEP the idea, rewrite** | |
| Audit publisher | Exists but **is never called** | **Wire it in** | |
| HR data | Payroll never calls hr-service. `employee_id` is a free UUID. | **NEW contract** | An HR → Payroll employee-facts endpoint for the machine client. |

### 2.3 App (KMP)

| Feature | What it is | Verdict |
|---|---|---|
| HR (`HrFeatureScreen.kt`, 1,704 lines, 12 dialogs) | Four tabs plus an employee drill-down | **REPLACE (§2a).** The v2 screens come from the rig. Of the data layer, only parts that meet the standards may be reused: the `HrAccess` gate pattern and the endpoint list, re-checked against the v2 contract. The `HrService`/`MockHrService` fallback is not carried over. |
| Payroll (`PayrollFeatureScreen.kt`, 793 lines) | Components, periods, structures, runs, payslips, compliance. Money is held as `String`. | **REPLACE (§2a).** The v2 contract changes almost every shape, so only the `PayrollAccess` gate pattern is reusable. |
| ESS (`EssFeatureScreen.kt`, 718 lines) | Profile, attendance, leave, payslips. Each section loads on its own (good). | **REPLACE (§2a), phone-first.** Keep the idea of loading each section on its own, and the `EssAccess` gate pattern. v2 uses a ViewModel and has no mock paths in live mode. |

**Correctness bugs in the app today (live mode)**

- **It fakes saves.** `HrServiceImpl(fallbackService = MockHrService())`: department and designation create, update and delete *always* go to the mock (`HrServiceImpl.kt:46-65`). So does the employee profile, including bank details. When a write returns null, the mock runs and the user is told it worked. ESS update and cancel leave always use the mock (`EssRepositoryImpl.kt:111-114`).
- **HR admin tabs read the signed-in user's own records.** `scope.userId` is sent as `employeeId`, and shifts call `/api/hr/me/...`. Attendance asks for 1900-01-01 to 2999-12-31.
- **Wrong approver.** Leave approval uses the *first employee in the list* (`HrFeatureScreen.kt:301,311`).
- **Records matched by name.** The employee drill-down matches attendance and leave by full name (`:163-165`).
- **Check-in dialog.** Dismissing it checks the person *out* (`:1414-1425`).
- **Unsafe forms.** They ask for raw UUIDs, silently pick the first department and designation, and default a blank date to `"2026-01-01"`. Status and leave type are free text.

**Standards gaps**

- **Page states:** no `NeoSpotState`, `NeoSkeleton`, `NeoOfflineStrip` or `NeoFailureState`; "Loading…" text instead.
- **List controls:** no `NeoSearchSelect`, `NeoListToolbar` or multi-select.
- **Layout:** `BoxWithConstraints` at screen level.
- **Error copy:** Payroll and ESS show raw server error text.
- **Lost input:** dialogs close before the save result comes back, so typed input is lost.
- **Deprecated components:** 57 `NeoTextField` and 27 `NeoDialogCard` uses.
- **Reason gates:** none.
- **Offline:** no handling.
- **Sensitive data:** bank and family details are visible to anyone with `HR.EMPLOYEE.READ`.
- **Accessibility:** tabs have no tab semantics.

The Org People screens (`CompanyPeopleTab.kt`, `CompanyListUi.kt`) are the template for the full page-state pattern. Accounts covers skeletons and load errors, but not spot or offline states.

---

## 3. Isolation and security

### 3.1 Tenant isolation (ADR-012)

**HR.** 15 tables have no `company_id`:

attendance_logs, attendance_daily, leave_types, leave_requests, leave_balances, leave_encashments, attendance_regularizations, overtime_requests, employee_history, employee_lifecycle_requests, shifts, shift_assignments, performance_cycles, performance_goals, performance_reviews.

Every `findById` is unscoped. The ports carry `@TenantOwnedRepository`, but no method takes a `CompanyTenantScope`. They pass only because of the legacy baseline (about 59 HR lines in `tenant-scope-baseline.txt`). The gateway isn't wired.

- **Exploitable today:**
  - the cross-company performance review write;
  - cross-company department, designation and manager references.
- **Latent:** unscoped lists are blocked only because no token carries the `employee_id` claim that `HrAuthorization.kt:247-282` falls back to. If anyone adds that claim, every company's data leaks.

**Payroll.** **None of the 12 tables has `company_id`.** Every unique index is global (`code`, `period_id`). Access checks the person's selected company, but data isn't filtered. Today it's contained only by `PayrollTenantIsolationGateFilter`, which returns 503 outside local and test. 39 baseline lines.

### 3.2 Migration plan for payroll `company_id`

Applied V1–V5 are frozen; this adds V6 and later.

1. **V6:**
   - add a nullable `company_id` to all 12 tables, with indexes;
   - add `payroll.tenant_backfill_quarantine(table_name, row_id, reason, candidates jsonb)`.
2. **Backfill job (application code).** The services have separate databases, so SQL can't join to HR. Sources, in order:
   - employee → company, through a new HR internal endpoint for payroll's machine client;
   - runs ← their items, only if every item agrees on one company;
   - periods ← their runs;
   - structures ← the assignments that use them;
   - components ← their structure, assignment and item lines.
   - Anything with zero or several candidate companies goes to quarantine. That includes the V5 seed and all tax and statutory rules: they are retired in favour of packs, and a company is **never** chosen by default.
3. **V7, only after zero quarantine rows:**
   - `SET NOT NULL`;
   - recreate the unique indexes as `(company_id, code)` and `(company_id, period_id, run_type, seq)`;
   - add `UNIQUE (company_id, id)` on parents and composite FKs `(company_id, parent_id)`.
4. **Code:** every repository method takes `CompanyTenantScope`, by-id lookups use `(company_id, id)`, and two-company adapter tests are added. Then shrink the baseline to zero and lift the 503 gate.

**No data is dropped (§2a).** The backfill and quarantine plan above is *the* plan.

- **Seed rows** (the V5 components, rules and periods) are global today. They are cloned per demo company (Kystgruppe, Lahore Textiles, Sialkot Mills) by the slice's seed update, never assigned to a default company.
- **Quarantine:** rows that stay in quarantine are shown to Jabran before V7 runs.
- **Old rules:** the flat tax and statutory rules are kept as read-only history and stop being used once the PK pack is live.

HR follows the same pattern (V10, then backfill, then V11) for its 15 tables. For HR the backfill is simple, because every row hangs off `employees.company_id`, which already exists.

### 3.3 Security tier, permissions and read-only

- **Tier:** both services are on tier 1. Tier 2 needs:
  - an explicit `companyId` on every endpoint;
  - `CompanyScoped` request bodies;
  - by-id handlers that check ownership;
  - a `ServiceEndpoint`-style annotation like `AccountsEndpoint`;
  - removal of the `employee_id`-claim fallback.
- **Approvals trust the client.** `approverEmployeeId` and `changedByEmployeeId` come from the request body on every approve and reject (leave, regularization, overtime, encashment, lifecycle). In v2 the approver is always the caller from the token, with the manager rule and segregation of duties enforced on the server.
- **HR permissions are too coarse:**
  - `HR.EMPLOYEE.WRITE` covers create, transfer, promote, separate *and* approving lifecycle requests;
  - encashment (money) uses the leave codes;
  - there's no CANCEL or ACCRUE, and no ESS split.
  - The app rig already uses `HR.EMPLOYEE.UPDATE`, which differs from the backend's interim `WRITE`.
  - v2 proposes one code per action (examples):
    - `HR.EMPLOYEE.CREATE` / `UPDATE` / `CHANGE_JOB` / `SEPARATE`;
    - `HR.EMPLOYEE.SENSITIVE.READ` / `UPDATE` (national id, bank, salary);
    - `HR.LIFECYCLE.APPROVE`;
    - `HR.LEAVE.REQUEST` / `APPROVE` / `CANCEL` / `ADJUST` / `ACCRUE`;
    - `HR.TIME.*`;
    - `HR.ESS.LEAVE` / `ATTENDANCE` / `PROFILE`.
  - Default roles get filled in at contract time against `standard-roles.md`.
- **Payroll permissions:**
  - `PAYSLIP.READ` sees every payslip in every company;
  - opening a period needs `RUN.CALCULATE`, while lock and unlock need `RUN.APPROVE`;
  - `PAYSLIP.PUBLISH` is unused;
  - there's no maker/checker.
  - v2 needs `PAYROLL.RUN.PREPARE` / `CALCULATE` / `APPROVE` / `POST` / `PAY`, with calculate ≠ approve enforced, plus `PAYROLL.PAYSLIP.PUBLISH`, `PAYROLL.FILING.*` and `PAYROLL.SETUP.*`.
- **Enter company (read-only):** respected by the shared library in both services. Salaries are sensitive, so the recommendation is that Enter company sees **no** payroll or HR-sensitive data without an explicit grant (D5).
- **Secret defaults:** client-secret defaults are hard-coded in `WorkflowPublisher.kt` (HR and Payroll) and `IamEmployeeLinkClient.kt`. They should come from config only. This goes to the ERP lead (security).

### 3.4 Audit

- **Gap (a), workflow `producerClientId`: already fixed.** `audit-service .../WorkflowService.kt:73-78` (`ownItem` / `ownPendingItem`), tested in `AuditCallerScopeTest`. **`docs/backlog.md:46` is stale and can be closed** (ERP lead).
- **Gap (b), HR initiator: confirmed.** `initiator = body.employeeId` (e.g. `LeaveController.kt:44`), but audit-service treats "mine" as the IAM user id, so HR items never reach "my inbox". HR also sends no org, branch or assignee. Workflow calls are fire-and-forget outside the transaction.
- **Reasoned changes aren't audited.**
  - Only link/unlink, lifecycle requests and encashment are centrally audited.
  - There's no before/after, and only unlink requires a reason.
  - Actors are recorded as employee ids.
  - Publishing is a best-effort HTTP call, whereas Accounts uses a transactional audit outbox.
  - v2 adopts the Accounts outbox pattern in both services.

---

## 4. Country correctness (payroll and HR)

v1 has **none** of the items below. Values marked *verify* must be checked against the source and recorded in the pack with `check_state`. No rate in this review is final.

### 4.1 Norway

| Need | Notes |
|---|---|
| Skattetrekk | Electronic tax card (skattekort) from Skatteetaten's API through Maskinporten: tabelltrekk or prosenttrekk, frikort, half tax in December, the reduced deduction in the holiday-pay month. |
| Arbeidsgiveravgift (AGA) | By zone: 1, 1a (fribeløp), 2, 3, 4, 4a and 5 at 0%. The zone follows the **underenhet** (sub-unit), so Org needs a zone and organisation number per branch. Rates *verify*. |
| Feriepenger | 10.2%, or 12% with 5 weeks by agreement; +2.3% for workers over 60 (capped at a 6G base, *verify*). Earned over the opptjeningsår and paid the next year (June). Monthly accrual posted to `HOLIDAY_PAY_ACCRUED`. |
| OTP | Minimum 2% of pay between 1G and 12G (the 1G floor may change, *verify*), with a G-value table by date. |
| A-melding | Monthly to a-ordningen (Altinn) by the 5th. Income-type codes per element (e.g. fastloenn, timeloenn, fordel codes), employment records with stillingsprosent, AGA base by zone. |
| HR side | Fødselsnummer / D-nummer, stillingsprosent (FTE), work-time arrangement, employment type, sick leave with egenmelding vs sykemelding, feriedager (25 days / 5 weeks). |

### 4.2 Sweden

| Need | Notes |
|---|---|
| Preliminary tax | Skattetabeller by municipality table and column; engångsskatt for one-off payments; jämkning; SINK for non-residents (*verify* scope). |
| Arbetsgivaravgifter | 31.42%. Only ålderspensionsavgift (10.21%) for older workers. Youth reduction in 2026 (*verify* ages and rate). |
| Semesterlön | Sammalöneregeln plus semestertillägg (0.43% per day under the law, often 0.8% by agreement), or procentregeln at 12%. Semesterskuld (holiday liability). |
| Sjuklön | 80% for days 1–14 paid by the employer, minus the karensavdrag (20% of a week's sick pay). Försäkringskassan pays from day 15. Needs HR absence data. |
| AGI | Monthly employer declaration per person to Skatteverket (by the 12th, *verify* the exception months). |
| HR side | Personnummer / samordningsnummer, semesterdagar (25), VAB, föräldraledighet, sick-leave periods. |

### 4.3 Pakistan

| Need | Notes |
|---|---|
| Income tax | Salary slabs from each Finance Act (effective **1 July**). s.149 monthly withholding = (projected annual tax − tax already deducted) ÷ remaining months. Arrears, bonus and previous-employer income. |
| EOBI | Employer 5% and employee 1% of the **notified minimum wage** (figure *verify*). |
| Provincial social security | PESSI (Punjab: Lahore Textiles, Sialkot Mills) or SESSI (Sindh), about 6% employer up to a wage ceiling (*verify*). Needs the **province per branch**. The PK chart account 2771 has **no "Used for" role** today. |
| Filings | s.165 withholding statement (frequency *verify*); s.164 employee tax certificate; EOBI and PESSI contribution returns. |
| WWF / WPPF | Calculated on company profit, so it belongs to Accounts or the company tax return, not the pay run. Out of payroll scope. |
| HR side | CNIC, NTN where relevant, annual/casual/sick leave under the Factories / Shops & Establishments Acts (provincial). |

### 4.4 Denmark

| Need | Notes (all *verify* against SKAT, ATP and Ferieloven) |
|---|---|
| A-skat | From the **eSkattekort** (hovedkort, bikort or frikort): withholding percentage plus a monthly allowance (fradrag), applied **after AM-bidrag**. |
| AM-bidrag | Labour-market contribution, 8% of gross before A-skat. Some benefits are AM-exempt, so each pay element needs an AM flag. |
| ATP | Fixed amounts by hours worked (employer ⅔, employee ⅓), not a percentage. Paid with the other employer contributions (AES, AUB, Barsel.dk, FIB) in the **samlet betaling**. |
| Feriepenge | Ferieloven 2020 (holiday earned and taken in the same period): 2.08 days per month. Hourly staff get **12.5% feriegodtgørelse** paid to **FerieKonto** or the company's holiday fund. Salaried staff get pay during holiday plus a **1% ferietillæg**. Ferie fridage come from agreements. |
| Pension | No statutory employer pension beyond ATP. Labour-market pension comes from **overenskomst** (collective agreement), so it's a company policy on top of the pack. |
| Sick pay | The employer pays during the employer period, then sygedagpenge with a refund claim. Needs HR absence data. |
| Filing | **eIndkomst** (indkomstregisteret) for each pay event by its deadline. Holiday-pay reporting to FerieKonto. |
| HR side | CPR number, employment type (monthly or hourly), working hours (often 37 per week by agreement), public holidays (including Grundlovsdag by agreement). |

### 4.5 Finland

| Need | Notes (all *verify* against Vero, TyEL and the Incomes Register) |
|---|---|
| Withholding (ennakonpidätys) | From the **verokortti** (tax card): base percentage, extra percentage and an annual income limit, which the employer receives electronically. A cumulative income limit is tracked per employee. |
| TyEL pension | Earnings-related pension: employer and employee shares (the employee rate is higher for ages 53–62). Paid to the employee's **pension insurer**, so a pension provider is needed per employee. |
| Social security | Unemployment insurance (employer and employee shares, with an exemption by age), the employer's health-insurance contribution, and the employee's health-insurance contributions. Accident and group life insurance go through an insurer. |
| Holiday pay | Vuosilomalaki: 2 or 2.5 days per month by length of service. Holiday pay (lomapalkka) plus the **lomaraha** holiday bonus, usually 50% by agreement (TES). Holiday liability. |
| Sick pay | The employer pays from the day of illness for about 9 working days, then Kela with a refund claim (*verify*). |
| Filing | **Incomes Register (Tulorekisteri)** within **5 calendar days of each payment**, plus a monthly employer report. This is *per payment event*, not per month (§4.7). |
| HR side | Henkilötunnus, TES (collective agreement) per employee, holiday credit year (1 April–31 March), public holidays. |

### 4.6 Iceland

| Need | Notes (all *verify* against Skatturinn and pension-fund rules) |
|---|---|
| Staðgreiðsla | Withholding with income brackets, minus the **persónuafsláttur** (personal tax credit), which can be transferred or partly used per employer. |
| Tryggingagjald | Employer social security contribution on gross pay. |
| Pension | Mandatory **15.5%** (employee 4%, employer 11.5%) to the employee's **pension fund**, plus optional supplementary pension (séreign) with an employer match. Union dues and union funds come from the agreement. |
| Holiday pay (orlof) | At least 24 days, and orlofslaun of at least 10.17%, often paid into a holiday account. |
| Sick pay | Earned per month of service, by law and agreement. |
| Filing | Monthly **staðgreiðsluskilagrein** to Skatturinn by the 15th. Contribution files to **each pension fund and union**, usually monthly. |
| HR side | Kennitala, pension fund and union per employee, collective agreement, public holidays. |

### 4.7 Where the rules live: payroll country packs

**Rule (Jabran, 2026-10-09): the company's country decides.** The country chosen for the company in Org selects its HR pack (leave types, entitlements, holidays, working time) and its payroll pack (tax, contributions, holiday pay, pension, filings), just as Accounts derives its setup from Org. Nobody is asked again in HR or Payroll.

- **Branch facts refine the pack** within that country: the Norwegian AGA zone and sub-unit number, and the Pakistani province (PESSI vs SESSI).
- **One country per company.** v2 doesn't cover an employee working abroad for the company.
- **Launch scope** (`claude/target-countries.md`): full HR and payroll packs for **PK, NO, SE, DK, FI and IS**.
- **Countries without a pack:** HR uses the base leave pack and Payroll shows "coming". When a country's pack ships, it switches on by itself. Nothing is ever calculated with another country's rules.

**What the six countries ask of the shared design.** The engine is designed against Norway from the start, and must also hold these shapes without rework:

- **Tax cards from the authority** in NO, DK and FI (and the personal tax credit in IS): one `TaxCard` entity per employee and year, with fields that vary by country and a source (API or file).
- **Filing cadence:**
  - monthly per person: NO A-melding, SE AGI, IS staðgreiðsla;
  - per payment event: DK eIndkomst, FI Incomes Register within 5 days.
  - So filings hang off **payment events**, grouped per month where a country wants that, never off the run alone.
- **Pay to third parties:** pension funds and insurers (FI TyEL, IS funds, NO and SE pension companies), DK FerieKonto and holiday funds, ATP, unions. A **payee/provider** register per company, each element routed to a payee, and payee files.
- **Collective agreements** (overenskomst, TES, kjarasamningur): rules above the legal minimum. v2 holds them as **company policy on top of the pack** (holiday bonus, extra holiday days, pension rates, union dues). Libraries of full agreements come later.
- **Element flags per country:** taxable, AM-liable (DK), holiday-pay basis, pension basis, contribution basis, and the income code for the filing.


Payroll packs mirror Accounts' packs (`accounts-service/.../packs/2026.1`: CSV files, a `MANIFEST.txt` with sha256, and `source`, `evidence_version` and `check_state` on each row):

- **Effective-dated rules:** `valid_from` / `valid_to` on every rate, slab, zone, threshold (G, minimum wage) and table reference (ADR-010 §4/§7).
- **Fetched tables:** external tables are fetched data versioned per year, not hand-typed rows. This covers the SE skattetabeller and the tax cards (NO skattekort, DK eSkattekort, FI verokortti).
- **One calculation interface per country:** a `PayrollCountryProvider` per country, covering gross-to-net, employer cost, holiday pay and the filing export.
- **Snapshot the applied version:** each run line stores the rule version it used (ADR-010 §5), so a recalculation or a report never uses today's rates for last year.
- **Leave packs:** HR leave types, entitlements, public holidays and working time come from a leave pack per country in the same format. There are six at launch (PK, NO, SE, DK, FI, IS) plus a base pack.

---

## 5. Posting to Accounts

**Today:** nothing. "POST" is a status change.

**What Accounts already gives us** (`docs/api/accounts-a1.md`):

- machine posting `POST /api/internal/accounts/postings`;
- reversal through `.../{journalId}/reverse`;
- GET by idempotency key;
- journal type **PR**;
- the PAYROLL control kind;
- two-person evidence (`requestedBy ≠ approvedBy`);
- idempotency on (company, sourceModule, key) plus a request hash;
- `max_lines` 1000.

**Proposed journal per approved run.** Lines are summed by branch × cost centre, not one per employee.

| Side | "Used for" role | Amount | Tags |
|---|---|---|---|
| Dr | PAYROLL_EXPENSE | gross pay | branch, cost centre |
| Dr / Cr | HOLIDAY_PAY_EXPENSE / HOLIDAY_PAY_ACCRUED | holiday-pay accrual (NO, SE) | branch, cost centre / branch |
| Dr / Cr | EMPLOYER_CONTRIB_EXPENSE / EMPLOYER_CONTRIB_PAYABLE | AGA, arbetsgivaravgifter, EOBI employer share | branch, cost centre / branch |
| Dr / Cr | (new) PK provincial social security expense / payable | PESSI / SESSI | as above |
| Dr / Cr | PENSION_EXPENSE / PENSION_PAYABLE | OTP / tjänstepension / PF (employer part; the payable also carries the employee part) | as above |
| Cr | PAYROLL_TAX_PAYABLE | tax withheld | branch |
| Cr | PAYROLL_OTHER_DEDUCTIONS | other deductions (EOBI employee share, loans, union dues) | branch |
| Cr | PAYROLL_PAYABLE | net pay | branch |

- **Timing:** post on approval (accrual), dated at the period end or pay date. Payment is a separate Bank & cash event that clears `PAYROLL_PAYABLE`.
- **Idempotency:** `PAYROLL_RUN:{runId}:{seq}`. Payroll keeps its own outbox and retries, and recovers a lost response with the GET by key.
- **Two-person evidence:** comes from the run's calculator (`requestedBy`) and approver (`approvedBy`), so payroll needs the four-eyes control first.
- **Corrections:**
  - before payment or filing: reverse and repost;
  - after payment or filing: a **correction run** that posts the differences. The statutory filings correct per person and per period, so this is the only correct model.
- **Cost centre:** HR has none today. Add it to the employee's job assignment, with a default from the department.
- **Asks to the Accounts lead:**
  1. Lift **BA-2**: make the machine posting clients config-driven and register `neoerp-payroll-service` (scope `accounts.posting.write`, PAYROLL module, type PR).
  2. Add the PK provincial social security roles. Decide whether employee pension/PF deductions get their own role.
  3. For the new DK, FI and IS charts: the same payroll roles, plus DK **AM-bidrag and ATP payable**, DK **FerieKonto/holiday payable**, FI **TyEL and unemployment-insurance payable**, IS **pension fund and union payable**, and **tryggingagjald payable**. Payables to many funds or insurers are tagged by payee, not one account each (*to agree*).
  4. Confirm the cost-centre tag model.
  5. Confirm that **D-56** is safe only once payroll's `companyId` comes from its own tenant-scoped run. Until §3.2 is done, payroll must not get a posting client.

---

## 6. HR ↔ People boundary

`people-pa1.md:1219-1246` already sets the rule, and v2 keeps it:

- **hr-service** owns the employee record and the `user_id` link;
- **user-service** owns users, memberships, roles and the automatic Employee role;
- user-service keeps a read-only projection in `iam.employee_links`, fed by HR's outbox.

| Data / screen | Owner | The other side shows |
|---|---|---|
| Legal name, employee code, position, department, **manager (reporting line)**, employment branch, status, dates, contract, FTE, personal details, emergency contacts, documents | HR → Employee record | People: a read-only "EMP-0042 · Store lead →" link |
| National id, bank account, tax card/table, pay group, salary | HR record, **Pay** tab, behind `HR.EMPLOYEE.SENSITIVE.*` / `PAYROLL.*` | — |
| Sign-in email, credentials, memberships, roles, exceptions, sessions | People → Person → Access | HR: an "App access" card (Linked / Invited / Give app access) linking to the person |
| Link | From either side | — |
| Unlink | People only, with a reason | — |
| Display name | **Decision (D4):** recommend HR's legal name is the employee name, and IAM's is the login's display name. Shown side by side, never synced silently. | |

**Fixes to make here:**

- HR passes `onOpenPerson = null`, so there's no navigation from HR to People. Add it in both directions.
- An employee set to EXITED must drop the Employee role; the outbox already carries this.
- Workflow `initiator` and `assignee` must be the IAM user id.

**Branch vs membership branch:**

- **The employment branch (HR)** drives payroll: AGA zone, province, cost.
- **The membership branch (IAM)** drives data access.
- They're allowed to differ.

---

## 7. Design under today's standards

All three UIs are rebuilt from a Screen Rig first. HR and Payroll are desktop/iPad first, with list and record side by side. ESS is **phone-first**.

### HR

- **Directory:** `NeoDataTable`, `NeoListToolbar`, multi-select filters (department, position, branch, status, has login).
- **Employee record.** The header shows code, position, department, branch, manager and a status pill. Tabs:
  - Overview
  - Job (an effective-dated timeline)
  - Pay (sensitive)
  - Personal
  - Documents
  - Time
  - Leave
  - App access
  - Activity
- **Organisation:** departments (tree, head of department) and positions.
- **Time:** daily register, timesheet grid, regularization and overtime queue, holiday calendars, shift patterns and roster.
- **Leave:** request queue, balances grid (from the ledger), leave types from the country pack, team calendar.
- **Lifecycle:**
  - onboarding wizard (record → job → pay → app access);
  - effective-dated changes through `NeoReasonGateDialog`;
  - exit with final settlement handed to payroll.
- **Approvals inbox:** the Org `RequestInbox` pattern.
- **Performance:** deferred.

### Payroll

- **Setup:** pay groups and calendars, pay elements, structures, country pack (read-only, with check state), GL map (a read-only view of the "Used for" roles).
- **Pay run as a stepper:**
  1. Prepare: inputs from Time and Leave, plus one-off amounts
  2. Calculate
  3. **Review variances** against last period
  4. Approve (four-eyes, reason)
  5. Post: journal preview
  6. Pay: bank file
  7. Publish payslips
  8. Filings
- **Payslips:** search, preview and reissue.
- **Statutory:** filings per country.

### ESS (phone)

- **Home:** clock-in card, next payslip, leave balance chips, pending items.
- **Pay:** payslips and a PDF, the tax certificate.
- **Leave:** balance, request (date range), my requests.
- **Time:** clock in or out, my month.
- **Me:** profile; bank, tax and address changes sent as **requests** to HR.
- **Team:** for managers — approvals and who's in today.

### Every screen

Every screen covers the empty, loading, error, read-only, no-access and offline states. Business refusals use fixed copy, never server text. Data lists use searchable selects, and short fixed sets use plain dropdowns. Money uses a shared money type, never `String`.

### Rig files

- **HR:** `hr-data`, `hr-directory`, `hr-employee` (replaces the `PaEmployeePage` stub), `hr-org`, `hr-time`, `hr-leave`, `hr-lifecycle`, `hr-inbox`.
- **Payroll:** `payroll-data`, `payroll-setup`, `payroll-run`, `payroll-payslips`, `payroll-statutory`.
- **ESS:** `ess-home`, `ess-pay`, `ess-leave`, `ess-time`, `ess-me`, `ess-team`.

### Shared components to request from the ERP lead

- `NeoDateRangeField`
- `NeoTimeField`
- `NeoCalendarMonth`
- `NeoTimeGrid` (timesheet/roster: sticky header and first column, cell picker)
- `NeoStepper`
- `NeoVarianceTable`
- `NeoMoney` (promoted from `AccountsAmount`)
- `NeoFileDownload`
- `NeoBottomTabBar` and a phone sheet for ESS
- `NeoApprovalCard`
- a general `NeoTabs` with tab semantics

Until these exist, the rig uses local reference components, as Accounts did.

### Docs

These are missing for all three modules:

- developer pages (`docs/modules/hr|payroll|ess`);
- user-guide folders;
- specs;
- scope docs;
- glossary entries;
- seed notes.

`hrms.md` and `payroll.md` are thin next to `accounts.md`: no permission per endpoint, no error catalogue, no state machines, no audit section. They're rewritten as versioned v2 contracts.

---

## 8. Proposed scope and slices

Following §2a, the work runs in three phases:

1. **Design phase (no builders needed).** I design the scopes, then the **full rig** for HR, Payroll and ESS: every screen, every state, desktop, iPad and phone, with ESS phone-first. Then the v2 contracts. Jabran approves the rig and contracts per slice group. This can all happen while Accounts holds the builders.
2. **Foundation build (H0 + P0).** Backend only, no screens: isolation, security, audit and the run state machine, through data-keeping migrations.
3. **Slice builds.** Each slice is vertical (backend → app data → screens → acceptance), with its ESS part, and updates the seed and demo data. **Each one removes the v1 screen part it replaces.** v1 screens are untouched until then; no fixes go into v1 UI.

### HR v2

| Slice | Contents | ESS part |
|---|---|---|
| **H0 Foundation** | V10/V11 `company_id` on 15 tables; ADR-012 scope plus two-company tests; tier 2; permission split; approver from the token; audit outbox with before/after and reason; IAM user id as initiator; remove the `employee_id` fallback and the secret defaults; migrations that keep data (HR backfill from `employees.company_id`). | — |
| **H1 Employee record and organisation** | Employment model with **effective-dated job assignments** (position, department, branch, manager, cost centre, FTE, contract type, start/end); sensitive fields (national id, bank) behind their own code; departments and positions; directory and record; People link both ways; HR → Payroll employee-facts internal endpoint. | ESS shell plus "Me" (read; change requests) |
| **H2 Leave** | Leave types, entitlements, public holidays and working time from **six country leave packs (PK, NO, SE, DK, FI, IS) plus the base pack**; **balance ledger**; idempotent accrual by leave year; overlap and balance checks; half days; working calendar per company/country; approvals inbox; encashment amount calculated on the server (or moved to payroll). | Request, balance, cancel |
| **H3 Time** | Company/branch time zone; holiday calendars per country/region; shifts and roster per company; clock-in/out; regularization and overtime with working-time thresholds; period totals exported to payroll. | Clock in/out, my month |
| **H4 Lifecycle** | Onboarding wizard; effective-dated transfer, promotion and status; exit with final-settlement hand-off to payroll. | — |
| later | Performance, documents with expiry, org chart. | |

### Payroll v2

| Slice | Contents |
|---|---|
| **P0 Foundation** | V6/V7 `company_id` (§3.2); scoped repositories and two-company tests; lift the 503 gate; tier 2; currency on runs; new run state machine (prepare → calculate → approve → post → paid) with **four-eyes**, `@Version`, run types (regular, off-cycle, correction); audit outbox wired; fix the FK line model; Postgres/Testcontainers tests. |
| **P1 Engine and PK pack** | Engine **designed against Norway** and checked against all six: pay-element line model (element, base, rate, quantity, rule version, per-country flags); `TaxCard`; payee/provider register; payment events as the anchor for filings; company policy on top of packs; pack format with effective dates and check state; `PayrollCountryProvider` for PK (s.149 projection, slabs, EOBI, PESSI/SESSI by branch province); proration; payslip with lines and year-to-date; variance review. |
| **P2 Posting** | Payroll machine client; the journal in §5; reversal and correction runs; journal preview step. Needs BA-2 and the PK roles from the Accounts lead. |
| **P3 Pay and publish** | Bank file (PK bank formats first, *verify* which banks); payslip PDF; publish. ESS payslips and tax certificate. |
| **P4 PK statutory** | s.165 statement, s.164 certificate, EOBI and PESSI/SESSI returns. |
| **P5 Norway** | Skattekort import (API through Maskinporten; manual file import as the first step), AGA zones per sub-unit, feriepenger year and accrual, OTP, A-melding file. |
| **P6 Sweden** | Skattetabeller import, arbetsgivaravgifter by age, semesterlön/-skuld, sjuklön and karensavdrag, AGI file. |
| **P7 Denmark** | eSkattekort import; AM-bidrag; ATP and the samlet betaling contributions; feriepenge (FerieKonto or holiday fund, ferietillæg); sick-pay refund; eIndkomst file per pay event. |
| **P8 Finland** | Verokortti import with the income limit; TyEL by age; unemployment and health insurance; holiday pay and lomaraha; Incomes Register file within 5 days of payment, plus the employer report. |
| **P9 Iceland** | Staðgreiðsla with brackets and personal tax credit; tryggingagjald; pension funds and séreign; orlof; staðgreiðsluskilagrein and pension-fund and union files. |
| **Each country's "ready" gate** | The pack is checked against its official source (`check_state` CHECKED) and **runs a pilot customer's parallel payroll** before the country is called ready (target-countries P17). |

**Build order once builders are free** (the rig and contract for each slice must be approved first):

1. H0 + P0 as one isolation checkpoint
2. H1
3. P1
4. P2
5. H2
6. P3
7. H3
8. P4
9. H4
10. P5 Norway
11. P6 Sweden
12. P7 Denmark
13. P8 Finland
14. P9 Iceland

H2 (leave) builds all six leave packs in one slice: they share one format and are much smaller than payroll packs.

H1 comes before P1 because payroll needs employee facts (job, cost centre, national id, bank).

**Country order (decided, D1): PK → NO → SE → DK → FI → IS.**

- **Pakistan first** for the first end-to-end demo: two demo companies, the simplest maths, periodic statements.
- **Norway is the design target from day one.** P1's engine, line model and filing interface are designed against Norway (tax card, zones, holiday-pay year, monthly A-melding), and checked against FI's per-payment Incomes Register and IS's pension funds. Later countries then only add a provider and a pack.
- **Sweden, Denmark, Finland and Iceland** each reuse the Nordic shape: a holiday-pay liability, per-person filing, and contributions to third parties.
- **Pace:** P5–P9 are pack-and-provider slices. Each needs source checks and a pilot, so for the launch date the long pole is **verification, not code**. Each country's pack work should start (sources gathered, cases written) well before its build slot.

---

## 9. Spot-checked evidence

These were checked by hand on 2026-10-09:

- `audit-service .../WorkflowService.kt:73-78` checks `producerClientId`, so gap (a) is fixed.
- `PayRunService.kt:185` builds synthetic ids, and `V3__payroll_run_items_payslips.sql:35` has the FK to `salary_components`, so calculate should fail on Postgres. This still needs confirming by a real run (builder task in P0).
- `PerformanceService.kt:45-58` checks goal existence without the company.
- App `HrServiceImpl.kt:33-65`: the mock fallback, and department/designation writes always going to the mock.

---

## 10. Top 5 issues

1. **Tenant isolation isn't structural.** Payroll has no `company_id` anywhere and is held back only by a 503 gate. HR has 15 unscoped tables, plus live cross-company writes (performance review; department, designation and manager references).
2. **Payroll has no real calculation and no control.** Flat percentages of gross, no country rules, no applied-rule snapshot, one person can calculate, approve and post, no audit, and calculate likely fails on Postgres.
3. **The app fakes data and saves in live mode.** It falls back to the mock and reports success. HR admin views show the signed-in user's own records, leave is approved by "the first employee", and forms take raw UUIDs.
4. **Approvals and audit can't be trusted.** The approver comes from the request body, there are no reasons and no before/after, events are best-effort, and HR items never reach "my inbox" (gap b).
5. **The data model isn't payroll- or law-ready.** No effective-dated employment, FTE, contract type, national id, bank, cost centre, time zone or country leave types (no annual leave at all), and no leave ledger.

---

## 11. Decisions for Jabran

| # | Decision | Recommendation | Consequence |
|---|---|---|---|
| D1 | Country scope and payroll order | **Decided (Jabran, 2026-10-09):** `target-countries.md`. Full packs at launch for PK, NO, SE, DK, FI and IS, switched on by the company's Org country. Every other country gets base HR and Payroll "coming". Order PK → NO → SE → DK → FI → IS, designed against Norway. | Six payroll packs and six leave packs before launch. Pack verification and pilots are the critical path. |
| ~~D2~~ | ~~Clear dev data~~ | Withdrawn: §2a says keep data. Backfill plan in §3.2. | — |
| ~~D3~~ | ~~How much of v1 to keep~~ | Decided by §2a: v2 replaces v1, backend area by area as in §2. | — |
| D8 | Rig before the first build | **Decided as recommended:** the full rig before H0/P0 finish, approved in three groups (HR core + ESS shell; Payroll; Time/Leave/Lifecycle). | — |
| D4 | Employment model | **Decided (Jabran):** one employee record per **employer company**. The branch is an effective-dated part of the job assignment, so a branch transfer inside a company is a job change on the same record and payroll, and branch facts drive the AGA zone and province. A franchise is its own company with its own employees. A person working for two companies has two employee records and two payrolls (each under its country's rules), but **one login linked to both**; ESS shows both. Moving between companies or countries means ending in one and starting in the other, with history kept. Secondment abroad within one company is a later slice, out of v2. | ESS needs an employer switcher. The IAM link allows one user ↔ many employee records (one per company), which PA-1 already permits. |
| D5 | Roles and sensitive data | **Decided (Jabran):** the same role and permission model as every module (one code per action, standard-role defaults, custom roles). Sensitive data and payroll get their own codes. Defaults: the **Company Owner gets everything, including payroll**, and can delegate. Manager roles see **their own team only**. Every linked employee automatically gets **own-data-only ESS** (own payslips, leave, attendance and profile; bank, tax and address changes go as requests to HR). Neovatus Enter company sees **no sensitive or payroll data** unless explicitly granted. | Team scope needs the reporting line (HR manager) on the server, not just a role. ESS is granted by the employee link, not by a role someone must remember to give. |
| D6 | Performance in v2 | **Decided as recommended: defer.** Hide the UI, keep the tables frozen, scope them later. | Smaller v2. Performance comes back as its own slice. |
| D7 | Government filings | **Decided as recommended:** v2 produces files for upload (A-melding, AGI, PK statements); direct API submission (Altinn/Maskinporten, Skatteverket, SKAT, Incomes Register, Skatturinn) is a later slice** | No certificates or agreements needed for the first release. Customers upload files by hand at first. |

## 12. Requests to other leads (drafted 2026-10-09 in `docs/drafts/hr-payroll/requests-to-leads.md`)

- **→ Cowork · ERP lead:**
  - close `backlog.md:46`;
  - fix the HR workflow initiator (audit-service contract);
  - remove the hard-coded client-secret defaults;
  - plan tier 2 for HR and Payroll;
  - Org: AGA zone and organisation number per branch (NO), province per branch (PK), company time zone; the DK, FI and IS region-profile labels checked; employer registration numbers per company (DK CVR/SE number, FI Y-tunnus, IS kennitala);
  - the shared component list in §7.
- **→ Cowork · Accounts lead:**
  - BA-2 config-driven clients and the payroll client;
  - PK provincial social security roles;
  - the pension deduction role;
  - the cost-centre tag;
  - agreement on the §5 journal shape and correction model;
  - DK, FI and IS payroll roles in the new charts (§5).
