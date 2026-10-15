# HR & Payroll lead — handover

From: **Cowork · ERP lead**. Written 2026-10-09.
To: **Cowork · HR & Payroll lead** (new session).

Read these first, in order:

1. `docs/handover/module-lead-playbook.md`: your role, the loop, hard rules, what the ERP lead owns, shared standards.
2. `docs/handover/next-modules-plan.md`: where HR & Payroll sit in the order, and ADR-018.
3. This note.

## 1. Your scope

HR (employee records, organisation of people, time and leave), Payroll (pay, statutory deductions, payslips, posting to Accounts), and ESS (employee self-service on phone and desktop). Payroll is the domain-heavy part. You are its payroll specialist for **Norway, Sweden and Pakistan first**.

## 2. What exists (v1, built before today's standards)

| Area | Backend | Contract | App |
|---|---|---|---|
| HR | `NeoERP-BackEnd/services/hr-service`: migrations V1–V9 (core, attendance and leave, performance, balances, holidays and shifts, seed masters, employee history, attendance workflows and manager, leave encashment and lifecycle requests, employee optional login); controllers for departments, designations, employees, employee history, lifecycle requests, attendance, attendance workflows, leave, leave policy, leave balances, leave encashment, holidays, shifts, performance, manager, ESS (`HrMe`), internal employee | `docs/api/hrms.md`; employees without a login and Link to employee are in `docs/api/people-pa1.md` | `features/hr/presentation/HrFeatureScreen.kt` (~1,700 lines, one screen), `features/ess` (basic) |
| Payroll | `services/payroll-service`: V1–V5 (core, runs, run items and payslips, structures and rules, seed masters); controllers for components, pay periods, structures, rules, pay runs, payslips, compliance report, reporting | `docs/api/payroll.md` | `features/payroll/presentation/PayrollFeatureScreen.kt` (~800 lines) |

**Known gaps** (verify each; don't trust this list blindly):

- **Payroll data has no company id.** Checks use the person's selected company (`payroll.md` "Access"). This breaks ADR-012 and is the first thing to fix before any real customer.
- **hr-service:** the ADR-012 tenant gateway (person and machine) isn't wired (`docs/adr/ADR-012-tenant-query-isolation.md`, open item). Both services are on `neoerp-security` tier 1 (SEC-c / SEC-e). Tier 2 adoption is due "when each API is reworked" (`docs/backlog.md`).
- **Audit:**
  - workflow decisions don't check `producerClientId` against the caller, so payroll could decide HR items and the reverse;
  - HR stores the initiator as the employeeId, not the IAM id, so people see none of their own HR items in "my inbox".

  See `docs/backlog.md`, "From the developer guides". These touch audit-service: agree the fix with the ERP lead.
- **App:** the screens predate the page-state and list-control standards and the Screen Rig. There's no HR or Payroll rig yet. People / IAM (`people.jsx`, `people-access.jsx`) covers logins and access, not HR records.
- **Payroll → Accounts:** no posting yet. Accounts allows it: D-56 (a registered machine client may post for any company with Finance on). The journal machine endpoints are pinned to the test client today (backlog, BA-2), so a real producer needs that changed. Agree the posting contract (journal type, accounts via "Used for" roles, cost-centre and branch tags, reversal on a corrected run) with the **Accounts lead**.
- **Developer pages:** may exist under `NeoERP-BackEnd/docs/modules/` and `NeoERP-App/docs/modules/`. Check them; the user guide has no HR or Payroll pages yet.

## 3. Step 0: independent review (before any design or build)

Review as architect, payroll and HR specialist, designer and PM. Report:

1. **Inventory and verdict per area** (employees, organisation, attendance, leave, holidays and shifts, performance, lifecycle, ESS, manager views, components, structures, rules, pay periods, pay runs, payslips, statutory reports): keep / refactor / rebuild, with the reason.
2. **Isolation and security:** company id on every payroll row (a migration plan that keeps existing data), the ADR-012 gateway, SEC tier 2, permissions per action with default roles, Enter company read-only.
3. **Country correctness.** What a real payroll needs, and what v1 lacks:
   - **Norway:** tax deduction (skattetrekk) from tax cards, employer's contribution (AGA) by zone, holiday pay (feriepenger), mandatory pension (OTP), the monthly A-melding.
   - **Sweden:** preliminary tax tables, employer contributions (arbetsgivaravgifter), holiday pay (semesterlön), the monthly employer declaration (AGI).
   - **Pakistan:** income-tax slabs and withholding, EOBI, provincial social security (PESSI / SESSI etc.), the annual statement.
   - Where the rules live: country packs like Accounts' chart and tax packs, each with a source and check state. Related: ADR-010 multi-country tax.
4. **Posting to Accounts:** the journal shape per pay run, the accounts used (salaries, employer cost, withholding liabilities, pension, net pay payable), correcting a posted run.
5. **HR ↔ People boundary:** an employee record vs a login (PA-1 "Employees and logins"). Who owns name, email, branch and manager.
6. **Design:** what the HR, Payroll and ESS screens should be under today's standards. ESS is phone-first.
7. **Proposed scope and slices** for HR v2 and Payroll v2, and which **country goes first** for payroll. Jabran decides; give a recommendation (the demo companies are Kystgruppe in Norway, and Lahore Textiles and Sialkot Mills in Pakistan).
8. **Decisions for Jabran**, each with a recommendation and a one-line consequence.

Save the full findings to `docs/drafts/hr-payroll/HR-PAYROLL-LEAD-REVIEW.md` (workspace). Give Jabran a short summary: verdicts, top 5 issues, decisions.

## 4. After Jabran accepts the review

Follow the loop in playbook §2:

1. Write `docs/agents/hr/scope.md` and `docs/agents/payroll/scope.md`.
2. Build the rig: new `hr-*.jsx` and `payroll-*.jsx` files, added to `app.html` as your own blocks, with Tweaks entries and README change-log rows.
3. Write the contracts as updates of `hrms.md` and `payroll.md`, or new versioned files, with checkpoints.
4. Write the builder prompts.

**Builds queue behind Accounts:** Accounts A1/A2 hold the builders first. Ask the ERP lead before starting a builder.

## 5. People to coordinate with

- **Accounts lead:** the payroll posting contract, the "Used for" roles payroll needs, and cost centres.
- **ERP lead:**
  - audit-service fixes;
  - SEC tier 2;
  - any shared component (e.g. a time-sheet grid, a date-range picker);
  - user-service / org-service changes (employee links, branches, managers);
  - gateway routes.
