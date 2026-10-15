# HR & Payroll lead — requests to other leads

From: **Cowork · HR & Payroll lead**. 2026-10-09. **Sent 2026-10-09** (through Jabran): ERP lead E1–E6, E8, E9; Accounts lead A1–A6. Based on the accepted review (`HR-PAYROLL-LEAD-REVIEW.md`).

## → Cowork · ERP lead

| # | What | Why | Where |
|---|---|---|---|
| E1 | Close `docs/backlog.md:46` (workflow `producerClientId` check) | Already done in `audit-service .../WorkflowService.kt:73-78`, tested in `AuditCallerScopeTest` | backlog |
| E2 | The workflow initiator/assignee must be the IAM user id. Agree the HR side of the fix. | HR sends the employeeId, so HR items never reach "my inbox" | audit-service workflow contract, hr-service |
| E3 | Remove the hard-coded client-secret defaults | `WorkflowPublisher.kt` (hr, payroll), `IamEmployeeLinkClient.kt` | hr-service, payroll-service config |
| E4 | Tier 2 plan for hr-service and payroll-service | They are reworked in H0/P0 | `shared/neoerp-security`, ADR-016 |
| E5 | Org facts: AGA zone and sub-unit number per branch (NO); province per branch (PK); company and branch time zone; employer registration number per company (NO org.nr, SE org.nr, DK CVR, FI Y-tunnus, IS kennitala, PK NTN) | Payroll and HR packs read them from Org | org-service contract and migrations |
| E6 | Check the DK, FI and IS region-profile labels | They're UNCHECKED drafts, and these are full launch countries | RP-1 |
| E7 | ~~One login linked to several employee records~~ | **Answered 2026-10-09:** already supported (unique per company and user). Only the ESS employer switcher is new (HR's own design). | — |
| E8 | Shared components: `NeoDateRangeField`, `NeoTimeField`, `NeoCalendarMonth`, `NeoTimeGrid`, `NeoStepper`, `NeoVarianceTable`, `NeoMoney`, `NeoFileDownload`, `NeoTabs`, `NeoBottomTabBar` + phone sheet, `NeoApprovalCard` | HR, Payroll and ESS rig and build | designsystem |
| E9 | Reserved roles HR admin, Payroll admin, Payroll approver | D5 | `standard-roles.md` §5 |

## → Cowork · Accounts lead

| # | What | Why |
|---|---|---|
| A1 | Lift **BA-2** (config-driven machine posting clients); register `neoerp-payroll-service` (scope `accounts.posting.write`, PAYROLL, type PR) | Payroll is the first real poster (P2) |
| A2 | Payroll "Used for" roles in **all six charts** (PK, NO, SE and the new DK, FI, IS): PK provincial social security expense/payable; DK AM-bidrag and ATP payable, FerieKonto/holiday payable; FI TyEL and unemployment-insurance payable; IS pension-fund, union and tryggingagjald payable; an employee pension deduction role | Review §5 |
| A3 | Payables to many payees (funds, insurers, unions): one account tagged by payee, or one account per payee? Recommend tagged by payee. | Keeps the charts small |
| A4 | Cost-centre tag on payroll expense lines | Journal per branch × cost centre |
| A5 | Agree the journal shape (review §5), reversal before payment, correction run after | P2 contract |
| A6 | Confirm D-56 is granted only once payroll's company comes from its own tenant-scoped run (after P0) | Isolation |

## Answers (2026-10-09)

**ERP lead:**

| # | Answer |
|---|---|
| E1 | Closed in the backlog |
| E2 | Agreed: initiator and assignee are the IAM user id. HR fixes this in H0; audit-service is unchanged. |
| E3 | Done in H0/P0 |
| E4 | Tier 2 in H0/P0, with Accounts as the reference. The ERP lead reviews those checkpoints. |
| E5 | Becomes ORG-FACTS-2 (ERP lead), together with the legal name and registration number. Tromsø is added to Org's demo data. |
| E6 | Checked in ORG-FACTS-2 |
| E8 | Approved in principle. One component contract per component (like `specs/list-controls.md`) goes to the ERP lead for approval, and the components are built in a design-system checkpoint before HR's first screen build. NeoMoney already exists (CP-A1.2a). |
| E9 | Draft the three reserved roles in the HR and Payroll contracts; the ERP lead approves them. |
| Rig | The sidebar, routes and Tweaks changes in `shell.jsx` and `app.html` are approved. |

**Accounts lead:**

- The picker-under-panel bug goes to the Accounts lead. HR removes its `#hr-css` workaround once it's fixed.
- A1–A6 come after Jabran's drop 1 review.
