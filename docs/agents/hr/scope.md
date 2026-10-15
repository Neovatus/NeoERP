# HR v2 and ESS — scope

Owner: **Cowork · HR & Payroll lead**. Written 2026-10-09. Status: **signed off by Jabran 2026-10-09**.
Based on: `docs/drafts/hr-payroll/HR-PAYROLL-LEAD-REVIEW.md` (accepted 2026-10-09, D1 and D4–D8), `claude/target-countries.md`, handover §2a.

HR v2 **replaces** HR v1 and ESS v1:

- **Screens:** every screen is designed in the Screen Rig first and approved, then built. The v1 screens are removed when their replacement ships.
- **Backend:** replaced area by area through migrations that keep existing data.
- **Seed and demo data:** updated with each slice.

## 1. In scope

### H0 Foundation (backend only)
- **Company id:** on all 15 tables that lack it (new migrations, backfilled from `employees.company_id`).
- **Isolation:**
  - ADR-012 `CompanyTenantScope` on every repository method;
  - two-company tests;
  - the tenant baseline for HR shrunk to zero.
- **Security:**
  - SEC tier 2;
  - remove the hidden `employee_id`-claim fallback;
  - client secrets from config only.
- **Who acts:**
  - the approver and actor always come from the token, never from the request body;
  - the manager rule and separation of duties are enforced on the server.
- **Audit:**
  - a transactional audit outbox with before/after values and a reason for every reasoned change;
  - the workflow initiator and assignee are the IAM user id (fixes "my inbox").
- **Permissions:** one code per action, with standard-role defaults (written in the contract, §4).

### H1 Employee record and organisation
- **Employee** = one employment with one employer company (D4). Fields:
  - code, legal name, date of birth, national id (fødselsnummer / D-nummer, personnummer, CPR, henkilötunnus, kennitala, CNIC; format checked per country);
  - contact details, address, emergency contacts;
  - start date, end date and end reason;
  - status: Active / On leave / Ended.
- **Job assignment**, effective-dated, so every change is a new row from a date:
  - branch (drives the AGA zone and province), department, position, manager (the reporting line);
  - cost centre (default from the department);
  - employment type (permanent, temporary, hourly, apprentice), FTE % (stillingsprosent), weekly hours;
  - collective agreement (optional);
  - pay group and work calendar.
  - A branch transfer inside the company is a job change on the same record (D4).
- **Pay details** (sensitive codes):
  - bank account (IBAN, Pakistani account), with changes approved;
  - tax residence;
  - pension provider or fund, union (IS), and holiday-pay route (DK).
  - Salary amounts live in Payroll; HR only shows them through Payroll's read.
- **Organisation:**
  - departments (tree, head of department, default cost centre);
  - positions (job titles, optional grade).
- **Ending and starting:**
  - Ending an employment keeps its history.
  - Moving to another company or country = end here and start a new record there (D4), with an optional "copy details" step.
- **App access:**
  - one login can link to employee records in several companies (D4), and ESS shows each;
  - links in both directions with People (PA-1 split stays: HR owns the record, IAM owns the login).
- **HR → Payroll:** an employee-facts internal endpoint for Payroll's machine client.
- **Screens:** directory, employee record (tabs: Overview, Job, Pay, Personal, Documents (list only), Time, Leave, App access, Activity), departments, positions.
- **ESS shell (phone first):** Home, Me (view; bank, tax and address changes sent as requests to HR), and an employer switcher when someone has several employers.

### H2 Leave
- **Six country leave packs** (PK, NO, SE, DK, FI, IS) plus the **base pack**, chosen by the company's Org country.
  - Each pack holds leave types, legal entitlements, the leave year, public holidays and working-time limits.
  - Every pack row has a source and a check state, as in Accounts.
- **Company policy on top of the pack:** extra days or a holiday bonus from agreements; it never goes below the legal minimum.
- **Balance ledger** per employee, leave type and leave year:
  - earned, taken, adjusted (with a reason), carried over, expired;
  - accrual is idempotent.
- **Requests:**
  - full and half days, hours where the pack allows;
  - checks for overlap, balance and the work calendar (not a hard-coded Saturday/Sunday);
  - cancel and withdraw.
- **Absences that matter to Payroll:** sick leave (with self-certified and doctor-certified periods), parental leave, care of a sick child (VAB, omsorgsdager), unpaid leave. Each is flagged with its pay effect, for Payroll to read.
- **Approvals inbox** for leave, plus a team calendar.
- **Encashment:** the amount is calculated by Payroll, never typed in.
- **ESS:** balance, request, my requests, cancel.

### H3 Time
- **Company and branch time zones**, and work calendars per country and branch.
- **Shifts and rosters** per company.
- **Clock-in and clock-out:**
  - ESS on the phone; web too;
  - the server time is converted into the branch's time zone.
- **Attendance corrections and overtime** with working-time thresholds from the pack and approvals.
- **Period totals** (hours, overtime, absences) handed to Payroll.
- **ESS:** clock in/out, my month, requests.

### H4 Lifecycle
- **Onboarding wizard:** record → job → pay details → app access.
- **Job changes:** transfer, promotion, change of hours, through a reason gate and effective-dated (a future-dated change applies on its date).
- **Ending an employment:** end date and reason; final settlement handed to Payroll; app access and the Employee role removed on the end date.

### Approvals and ESS across all slices
- One **approvals inbox** for leave, time, job changes and ESS change requests.
- **Who approves:**
  - managers see and approve **their own team only** (D5), from the reporting line;
  - HR roles see the whole company.
- **ESS access:** every linked employee automatically gets **own-data-only ESS** (D5).

## 2. Out of scope (later slices)
- Performance (D6). The tables stay frozen and the screens are hidden.
- Secondment abroad within one company (D4).
- Recruiting, training, documents with expiry and e-signing, org chart drawing, a library of full collective agreements, geofenced clock-in, time-clock hardware.
- Direct links to government registers (e.g. the NO Aa-register through the A-melding is Payroll's file; no API in v2).

## 3. Domain rules
1. **The company's Org country decides the leave pack.** Nobody is asked again. Countries without a pack use the base pack.
2. **One employee record per employer company.** No shared person across companies.
3. **History is never overwritten.** Every job change is a new effective-dated row, and ending keeps the record.
4. **Legal minimums can't be lowered by policy**; policy can only add.
5. **Leave balances are a ledger.** A balance is the sum of its entries, and every manual entry needs a reason.
6. **Times are stored in UTC** and shown in the branch's time zone.
7. **The approver is the signed-in person.** Nobody approves their own request.
8. **Sensitive data** (national id, bank, date of birth, pay details) needs its own code, is masked in lists, and every change is audited with before and after.
9. **Enter company sees no sensitive data** unless explicitly granted (D5).
10. **No v1 UI is carried over** (§2a).

## 4. Roles (defaults; exact codes in the contract)
| Role | Default in HR |
|---|---|
| Company Owner | Everything, including sensitive data; can delegate (D5) |
| HR admin (reserved for this module) | Everything in HR, including sensitive data |
| Manager | Their own team only: view job and leave, approve leave, time and changes |
| Employee (automatic when linked) | Own data only, through ESS |
| Neovatus Enter company | Read-only; no sensitive data unless granted |

## 5. Dependencies
- **ERP lead:**
  - Org: AGA zone and sub-unit number per branch (NO); province per branch (PK); company and branch time zone; employer registration number per company; DK/FI/IS region-profile labels checked.
  - The audit initiator fix.
  - Tier 2.
  - Shared components: date range, time field, month calendar, time grid, tabs, phone bottom bar and sheet, approval card.
- **Payroll scope:** the employee-facts endpoint, absences, period totals and final settlement.
- **People / IAM:** one login ↔ several employee records (one per company) is already supported (`iam.employee_links` is unique per company and user; ERP lead, 2026-10-09). Only the ESS employer switcher is new. Also the automatic Employee role.

## 6. Open decisions
None blocking. Small choices go into the rig review.
