# HR and Payroll — reserved roles and default codes (E9)

From: HR & Payroll lead, 2026-10-09. Status: **draft for the ERP lead's approval (E9)**. Nothing is seeded until approved.
> **Amended 2026-10-10 (HRP lead): ERP-34 integrity fixes.** V40–V42 "reserved" line removed (E-12).
> **user-service migration numbers (ERP lead, 2026-10-09):** no numbers are reserved. `U-split`, `U-defaults`, `U-h1`, `U-p1` and `U-h2h3` are names, not numbers. The builder takes the next free user-service number right before committing, and renumbers its own unpushed migration on a clash.
Sources: `hrms-v2-h0.md` §6 and `payroll-v2-p0.md` §6 (both point here; this file replaces `roles-h0.md` and `roles-p0.md`). Codes follow `permission-actions.md` (`READ` = label "View", one code per action).

## 1. How it ships (user-service, shared by H0 and P0)

| Migration | What | Rule |
|---|---|---|
| **U-split `hr_payroll_permission_split`** | Old HR and Payroll codes split into the new ones (§5). Every role, Extra and Taken away carried; Taken away wins. | Rule 7: nobody's codes change in meaning. Payroll Admin still holds `PAYROLL.RUN.APPROVE`. `HR.EMPLOYEE.ALL_TEAMS` is not given to line-manager-only roles or as an Extra. |
| **U-defaults `hr_payroll_standard_defaults`** | The defaults of §3 and §4 as new standard-role versions with change-log lines; **seeds `IAM.PAYROLL_APPROVER`** and removes `RUN.APPROVE` from Payroll Admin in the same file. | Reviewed change (P-5). Ships only after this file is approved, in the **same release** as U-split. Writes a report of companies where only the Owner holds `RUN.APPROVE` afterwards (payroll is behind the 503 gate, so no live company runs payroll today); the demo seed gives each demo company a Payroll approver besides the Owner. |

No migration numbers are reserved in any service: each takes the next free number at build time (E-12).

## 2. Roles

| Role (code) | Status | Scope | Purpose | Never |
|---|---|---|---|---|
| **HR Admin** (`IAM.HR_ADMIN`) | Exists (V27). E9 "reserved" = its v2 defaults; no new role. | Company | HR set-up and decisions, incl. sensitive employee data (D5) | Any payroll code (V27 gave it payroll reads; narrowed); self-decisions except as Owner |
| **HR Officer** (`IAM.HR_MANAGER`, renamed D-R3) | Exists. | Company (branch limit of standard-roles §2 **not enforced in H0**; the role editor must not offer it yet) | Day-to-day HR: records, attendance, leave on behalf of others; job changes **by request** | Approve what they submitted; direct job changes (`CHANGE_JOB`, H0-23); HR set-up |
| **Payroll Admin** (`IAM.PAYROLL_ADMIN`) | Exists (V27). **Changed defaults** (V27: approved and posted, never calculated) → "everything except approve". Decided in P0 Q1 only. | Company | Payroll set-up, employee pay, prepare and calculate runs; later post, pay, publish, filings | Approve runs (`RUN.APPROVE`); approve a run they contributed to even if granted; any HR code |
| **Payroll Approver** (`IAM.PAYROLL_APPROVER`) | **New**, seeded by U-defaults. | Company | View setup, runs and payslips; approve, send back, withdraw approval (four eyes) | Prepare, calculate, post, pay, change setup; approve a run they contributed to, changed pay inputs for, or have their own pay in; any HR code |
| **Payroll Officer** (`IAM.PAYROLL_EXEC`) | Exists. Kept as the preparer subset. | Company | Prepare and calculate runs; view setup, employee pay, payslips | Approve, post, change setup; any HR code |

Payroll roles hold **no HR codes**: payroll shows employee code and name from HR's machine facts (H0 §10.1/§10.1a), stored on its own items. Pay facts never reach payroll through a person's HR read.

## 3. HR codes per role (U-defaults)

✓ company · T own team only (reporting line, no `ALL_TEAMS`) · S self · — none

| Code | Owner | HR Admin | HR Officer | Line Mgr | Employee | Auditor | Payroll Admin | Payroll Officer | Payroll Approver |
|---|---|---|---|---|---|---|---|---|---|
| `HR.EMPLOYEE.READ` | ✓ | ✓ | ✓ | T | — | ✓ | — | — | — |
| `HR.EMPLOYEE.CREATE` / `UPDATE` | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| `HR.EMPLOYEE.CHANGE_JOB` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.EMPLOYEE.END` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.EMPLOYEE.REQUEST` | ✓ | ✓ | ✓ | T | — | — | — | — | — |
| `HR.EMPLOYEE.APPROVE` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.EMPLOYEE.ALL_TEAMS` (marker, H0 Q2) | ✓ | ✓ | ✓ | — | — | ✓ | — | — | — |
| `HR.EMPLOYEE.EXPORT` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.EMPLOYEE.SENSITIVE.READ` / `UPDATE` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.CHANGE_REQUEST.DECIDE` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.ORG.READ` | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — | — |
| `HR.ORG.MANAGE` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.LEAVE.READ` | ✓ | ✓ | ✓ | T | — | ✓ | — | — | — |
| `HR.LEAVE.CREATE` / `CANCEL` | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| `HR.LEAVE.APPROVE` | ✓ | ✓ | — | T | — | — | — | — | — |
| `HR.LEAVE.BALANCE.ACCRUE` / `ADJUST` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.LEAVE.POLICY.READ` | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — | — |
| `HR.LEAVE.POLICY.CREATE` / `UPDATE` / `DEACTIVATE` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.ENCASHMENT.CREATE` | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| `HR.ENCASHMENT.APPROVE` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.ATTENDANCE.READ` | ✓ | ✓ | ✓ | T | — | ✓ | — | — | — |
| `HR.ATTENDANCE.RECORD` / `CORRECT` | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| `HR.ATTENDANCE.APPROVE` | ✓ | ✓ | — | T | — | — | — | — | — |
| `HR.OVERTIME.CREATE` | ✓ | ✓ | ✓ | T | — | — | — | — | — |
| `HR.OVERTIME.APPROVE` | ✓ | ✓ | — | T | — | — | — | — | — |
| `HR.HOLIDAY.READ` / `HR.SHIFT.READ` | ✓ | ✓ | ✓ | ✓ | — (ESS reads own) | ✓ | — | — | — |
| `HR.HOLIDAY.CREATE` / `UPDATE` / `DELETE`; `HR.SHIFT.CREATE` / `UPDATE` / `DEACTIVATE` | ✓ | ✓ | — | — | — | — | — | — | — |
| `HR.SHIFT.ASSIGN` | ✓ | ✓ | ✓ | T | — | — | — | — | — |
| `HR.MANAGER.READ` | ✓ | ✓ | — | T | — | — | — | — | — |
| `HR.PERFORMANCE.READ` | ✓ | ✓ | — | T | — | ✓ | — | — | — |
| `HR.PERFORMANCE.GOAL` / `REVIEW` | ✓ | ✓ | — | T | — | — | — | — | — |
| `HR.ESS.READ` / `LEAVE` / `ATTENDANCE` / `OVERTIME` | — (O-1) | — | — | — | S (automatic with the employee link) | — | — | — | — |
| `HR.SYSTEM` | machine only, never on a role | | | | | | | | |

## 4. Payroll codes per role (U-defaults)

| Code (`PAYROLL.`) | Slice | Owner | Payroll Admin | Payroll Approver | Payroll Officer | HR Admin | Finance Mgr / Accountant | Auditor | Line Mgr, Company Admin, others | Employee |
|---|---|---|---|---|---|---|---|---|---|---|
| `SETUP.READ` | P0 | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | — | — |
| `ELEMENT.CREATE` | P0 | ✓ | ✓ | — | — | — | — | — | — | — |
| `ELEMENT.UPDATE`, `ELEMENT.DEACTIVATE` | P1 | ✓ | ✓ | — | — | — | — | — | — | — |
| `STRUCTURE.CREATE`, `STRUCTURE.UPDATE` | P0 | ✓ | ✓ | — | — | — | — | — | — | — |
| `PERIOD.CREATE`, `PERIOD.LOCK` | P0 | ✓ | ✓ | — | — | — | — | — | — | — |
| `PAY_GROUP.*`, `PAYEE.*`, `POLICY.UPDATE` | P1 | ✓ | ✓ | — | — | — | — | — | — | — |
| `EMPLOYEE.READ` | P0 | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| `EMPLOYEE.UPDATE` | P0 | ✓ | ✓ | — | — | — | — | — | — | — |
| `RUN.READ` | P0 | ✓ | ✓ | ✓ | ✓ | — | — (posted-runs read in P2) | ✓ | — | — |
| `RUN.PREPARE`, `RUN.CALCULATE` | P0 | ✓ | ✓ | — | ✓ | — | — | — | — | — |
| `RUN.APPROVE` | P0 | ✓ (Owner's own only when no other approver, P0 PC-11) | — | ✓ | — | — | — | — | — | — |
| `RUN.POST`, `RUN.REVERSE` | P2 | ✓ | ✓ | — | — | — | — | — | — | — |
| `RUN.PAY` | P3 | ✓ | ✓ | — | — | — | — | — | — | — |
| `PAYSLIP.READ` | P0 | ✓ | ✓ | ✓ | ✓ | — | — | — (D-R5) | — | — |
| `PAYSLIP.EXPORT` | P0 | ✓ | ✓ | — | — | — | — | — | — | — |
| `PAYSLIP.PUBLISH`, `PAYSLIP.REISSUE` | P3 | ✓ | ✓ | — | — | — | — | — | — | — |
| `FILING.READ`, `FILING.GENERATE`, `FILING.SUBMIT` | P4+ | ✓ | ✓ | — | — | — | — | — | — | — |
| `ESS.READ` | P0 (kept) | — (O-1) | — | — | — | — | — | — | — | S (automatic with the employee link) |

## 5. U-split splits (old → new)

**HR:** `HR.EMPLOYEE.WRITE` → `CREATE`, `UPDATE`, `CHANGE_JOB`, `END`, `REQUEST`, `APPROVE`; `HR.DEPARTMENT.*` / `HR.DESIGNATION.*` → `HR.ORG.READ` / `HR.ORG.MANAGE`; `HR.ATTENDANCE.WRITE` → `RECORD`, `CORRECT`, `HR.OVERTIME.CREATE`; `HR.ATTENDANCE.APPROVE` → kept + `HR.OVERTIME.APPROVE`; `HR.LEAVE.WRITE` → `HR.LEAVE.CREATE`, `CANCEL`, `HR.LEAVE.BALANCE.ADJUST`, `HR.ENCASHMENT.CREATE`; `HR.LEAVE.APPROVE` → kept + `HR.ENCASHMENT.APPROVE`; `HR.LEAVE.POLICY.WRITE` → `CREATE`, `UPDATE`, `DEACTIVATE`, `HR.LEAVE.BALANCE.ACCRUE`; `HR.HOLIDAY.WRITE` → `CREATE`, `UPDATE`, `DELETE`; `HR.SHIFT.WRITE` → `CREATE`, `UPDATE`, `DEACTIVATE`, `ASSIGN`; `HR.PERFORMANCE.WRITE` → `HR.PERFORMANCE.GOAL`; `HR.ESS.WRITE` → `HR.ESS.LEAVE`, `ATTENDANCE`, `OVERTIME`; any non-ESS HR code on a role that is not line-manager-only → + `HR.EMPLOYEE.ALL_TEAMS`. New with no old code (U-defaults defaults only): `HR.EMPLOYEE.EXPORT`, `SENSITIVE.READ`, `SENSITIVE.UPDATE`, `HR.CHANGE_REQUEST.DECIDE`, `HR.SYSTEM` (machine).

**Payroll:** `STRUCTURE.READ` → `SETUP.READ` + `EMPLOYEE.READ`; `STRUCTURE.WRITE` → `ELEMENT.CREATE` + `STRUCTURE.CREATE` + `STRUCTURE.UPDATE` + `EMPLOYEE.UPDATE`; `TAX.READ`, `STATUTORY.READ` → `SETUP.READ`; `TAX.WRITE`, `STATUTORY.WRITE` → none (rule writes removed; holders lose nothing usable); `RUN.CALCULATE` → `RUN.PREPARE` + `RUN.CALCULATE` + `PERIOD.CREATE`; `RUN.APPROVE` → `RUN.APPROVE` + `PERIOD.LOCK`; `PAYSLIP.READ` → `PAYSLIP.READ` + `PAYSLIP.EXPORT`; `RUN.POST`, `PAYSLIP.PUBLISH` kept.

## 6. Rules that come with the rows

- **Four eyes holds even when one person holds both codes** (standard-roles rule 7).
- **Owner's own differs by module, on purpose.** HR: Owner may decide own/submitted items with confirmation and a reason (Accounts C-7). Payroll: additionally only when no other non-contributor approver exists (payroll spec §6.3), checked fresh with user-service.
- **`HR.EMPLOYEE.ALL_TEAMS` is not tied to a code:** it makes every T code a person holds company-wide. Combining Line Manager with HR Officer or Auditor makes that person's LM approvals company-wide; the role editor warns. A per-code team scope from IAM would remove this (H0 Q2).
- **Enter-company (D5):** HR — Owner's codes minus `HR.EMPLOYEE.SENSITIVE.*`, `HR.EMPLOYEE.EXPORT`, `HR.CHANGE_REQUEST.DECIDE` and sensitive handlers, read-only, encashment amounts hidden. Payroll — refused entirely until a grant exists. Platform roles get no HR or payroll code.
- **Company Admin and Branch Manager:** no HR or payroll codes (written down, rule 1).

## 7. Decisions asked of the ERP lead

| # | Question | Recommendation |
|---|---|---|
| R1 | Redefine Payroll Admin to "everything except approve" and add Payroll Approver (P0 Q1)? | Yes; U-defaults does both in one file. |
| R2 | HR Officer: requests only, no direct `CHANGE_JOB` (H0 Q10)? | Yes, as standard-roles; hr-h1 §9 updated. |
| R3 | Payroll roles with no HR codes? | Yes; names come from HR machine facts. |
| R4 | `HR.EMPLOYEE.ALL_TEAMS` marker now, per-code team scope later (H0 Q2)? | Yes, with the role-editor warning. |
| R5 | HR Admin loses V27's payroll reads? | Yes (D5: HR does not see pay). |
