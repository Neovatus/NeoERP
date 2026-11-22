# Brief: HRP-H0-APP — delete the v1 HR, Payroll and Self-service features (App, 2026-11-22)

**Workstream:** PROJECT-STATE HRP-2, step **H0 foundation**, App side. v2 screens come per area from H1 on.
**Repo / lane:** NeoERP-App, branch `phase/hrp-v2-h0-app` from `origin/phase/hrp-v2` (`b91d4abf`), worktree `NeoERP-worktrees/hrp-h0-app`.
Copy this file to `docs/agents/hrp-h0/brief-app.md` as the first commit.
**Slicing:** L37 style B (one lane per feature per repo). Plain deletion lane, not money/security (one review, WORKFLOW §money/security lanes).
**Builder:** recommended **Sonnet high** (all decisions made below once OD-A1/A2 are answered; the work is deletion plus one empty state);
Opus 5.5 high if Jabran leaves OD-A1 or OD-A2 open. **Old Mac**, targeted runs through `scripts/gradle-job.sh app <dir> <args>` (L34).
**Review:** fresh Opus. **Twin:** `brief-hrp-h0-be.md` (parallel; it removes the v1 backend these screens call, so merge this one first or the same day).

## Goal
The app builds and runs with **no v1 `hr`, `payroll` or `ess` feature code**: no menu entry, route, DI binding, endpoint constant, mock or test
for them. A person with HR or Payroll rights sees no HR or Payroll area until H1 ships one. An employee-only user (Self-service is their whole app)
sees one plain v2 empty state at sign-in. Everything H1 reuses stays.

## Evidence (read first)
- `docs/design/specs/hr-h1.md` **§12.1** (v1 deleted, not hidden; the employee-only empty state; "each v2 area's menu entry appears when it ships"),
  §12.13 (four languages), H0-21; `ess.md` §2 and §11 point 16; `payroll-p.md` §17.1 last line; `docs/agents/hrp-specs/applied.md` H1.2.
- To delete: `composeApp/src/commonMain/.../app/features/{hr (19 files), payroll (20), ess (11)}`, `commonTest/.../features/{hr, ess}`;
  references in `app/di/NeoAppDi.kt`, `ui/shell/routing/NeoSmartContentArea.kt`, `ui/shell/NeoShellHelpers.kt` (`essAccess`, icons, access),
  `ui/shell/navigation/NeoMenuModel.kt` (HR and Payroll groups), `ui/shell/topbar/NeoSmartTopBar.kt`, `core/navigation/NeoDestination.kt`,
  `core/navigation/NeoFeatureMap.kt` (HRMS/PAYROLL feature refs), `core/contract/NeoApiEndpoints.kt` (hr/payroll/ess groups),
  `features/dashboard/presentation/DashboardScreen.kt`, `data/mock/MockEnterpriseData.kt`, `ui/auth/NeoLoginScreen.kt` (dev persona module lists).
- Tests that name them: `NeoAppDiRepositoryResolutionTest`, `NeoEnterpriseFoundationTest`, `ModuleAccessTest`, `DestinationAccessTest`,
  `DestinationFeatureAccessTest`, `NeoMenuModelTest`, `QuickAccessAndRoleLabelTest`, jvmTest `buildrules/FeatureImportRuleTest`, `MoneyFloatFieldRuleTest`.
- i18n: `i18n/baseline/{hr,payroll,ess}.txt` (+ `reports.txt` under OD-A1); the v1 texts are hard-coded (modules skipped in I18N, memory
  "App languages"), so few keys exist; `i18n/translated-modules.txt`; `unused-keys.txt` (only shrinks). `APP-DOCUMENTATION.md`.

## Decided (do not reopen)
1. **v1 code is deleted, not hidden** (Jabran 2026-11-21, HRP-DES decision 2; amends the 2026-10-09 rule that each old screen goes with
   the checkpoint that replaces it). Old data is not kept (decisions 1–3). Dev: no legacy constraints, target design (memory, 2026-11-15).
2. **Employee-only user:** a plain v2 empty state at sign-in, "Self-service is being rebuilt. You'll see it here when it's ready."; removed when
   ESS v2 Home ships (lead 2026-11-21, kept by Jabran's decision-2 answer). It uses the shared empty-state component, no other action.
3. **Four languages from the first slice** (§12.13): every new string in en, nb, sv, da in the same commit; the build check fails on a missing key.
4. **IAM data is unchanged** (rule 7, D9 drops only HR/Payroll tables): HR.*, PAYROLL.*, ESS.* permission codes stay in the roles editor,
   people sheet and role catalog; module codes HRMS/PAYROLL stay in entitlement, Org modules, agreement and sign-in art.
5. The screen rig (`docs/design/screen-rig/hr*`, `payroll*`, `ess-shell.jsx`, `people-access.jsx`) **is the approved v2 design: keep it**.

## Decisions (old-Mac lead 2026-11-22, as recommended: OD-A1 delete `features/reports` (v1 HR/Payroll reports only, inside Jabran's 2026-11-21 v1 deletion); OD-A2 keep `features/inbox` (shared audit-service inbox). Builder: Sonnet high, Opus review.)
- **OD-A1 Reports.** `features/reports` (7 files) is the v1 HR and Payroll reports page only (tabs HR / Payroll) and calls only v1
  `/api/hr` and `/api/payroll` paths that H0-BE deletes. Rec: **delete it with the `Reports` destination** in this lane. Why: kept, it is a v1
  screen calling dead endpoints; memory "App languages" already lists HR reports with the old modules; v2 reports come with their areas.
- **OD-A2 Inbox.** `features/inbox` lists audit-service workflow items and notices (generic, not an HR feature). Rec: **keep it** unchanged;
  after the backend clears hr/payroll workflow items it shows its empty state. Why: it is the shared inbox later areas feed (ADR-025); deleting
  it is a different decision.

## Scope
| ID | Item |
|---|---|
| H0-A1 | Delete `features/hr`, `features/payroll`, `features/ess` (main and tests) and, under OD-A1, `features/reports`. |
| H0-A2 | Navigation: remove `NeoDestination.Hr`, `Payroll` (and `Reports` under OD-A1); their routes, menu groups, top-bar and dashboard entries, quick-access, icons. |
| H0-A3 | `NeoDestination.Ess` stays only as the employee-only empty state (Decided 2); nobody else sees an Ess entry. |
| H0-A4 | DI (`NeoAppDi`), endpoint constants, mocks and seeds used only by the deleted code. Nothing left unused (`unused-keys`, dead mocks). |
| H0-A5 | Strings: new empty-state keys in en/nb/sv/da (core module, so `MissingTranslationTest` covers them); keys only the deleted code used are deleted in all four languages; i18n baselines for deleted modules removed (shrink only). |
| H0-A6 | Tests updated (list above); build-rule allowlists shrink (`FeatureImportRuleTest`, `MoneyFloatFieldRuleTest`); nothing added to any allowlist. |
| H0-A7 | Docs: `APP-DOCUMENTATION.md`, `docs/modules/` pages that mention the v1 features, dev persona texts in `NeoLoginScreen`. |

**Keep for H1** (say in the report where each is used): `NeoModule.Hr/Payroll/Ess`; `NeoRole.HrAdmin/PayrollAdmin/EmployeeSelf` and their
session mapping (`AuthSessionMapper`, `NeoPermissionResolver`, `NeoStandardRoles`); module-name strings (`core_module_hr`, `core_module_payroll`,
`core_module_hrms`, `core_title_self_service`); HR/Payroll permission groups in roles and people screens; journal source labels for payroll in
Accounts (`AccountsWording`, `SourceDocumentLinks`); every design-system component (time, date-range, stepper, approval card…); the rig.

## Neighbours (outside this scope)
- **HRP-H0-BE** (twin): deletes v1 endpoints, tables and gateway routes; clears dev employee links and HR workflow items.
- **H1 App**: v2 HR areas, their menu entries, v2 endpoint constants and DI; **ESS v2 Home** removes the empty state; **P-slices**: Payroll areas.
- **AL-REST-APP** (shared approval-steps component, ApprovalCard): no shared file; if both touch `NeoMenuModel` or `NeoAppDi`, the lead rebases.
- I18N rounds: HR/Payroll/ESS strings are new v2 work in H1, not a move of the v1 texts.

## Tests (deletion lane: nothing else breaks; a test per changed behaviour)
- **Old FAIL / new PASS** (run on `b91d4abf`, say how): (1) an employee-only session lands on the empty state, not the v1 ESS home;
  (2) an HR-admin session's menu has no HR, Payroll or Reports group; (3) a build rule fails on any import of `features.hr|payroll|ess|reports`
  (extend `FeatureImportRuleTest` or add one). (4) a person with ESS codes and other rights sees no Ess entry.
- Existing: the shell, menu, destination-access, DI-resolution, module-access and build-rule tests above; `MissingTranslationTest`,
  `HardcodedUiTextTest`, unused-keys check.
- **Compile JVM, iOS and Android** before hand-back (L36 4). Targeted runs only; no `verify.sh` by the builder.
- Manual (for Jabran, test-steps format, in the report): sign in as an employee-only demo user and as an HR admin; numbered clicks, Expected per step.

## Rules
- One repo (App). Gradle only through `scripts/gradle-job.sh`; one watcher; never `gradlew --stop` outside your slot.
- Plain commits, **no AI attribution, no Co-Authored-By**. No push, merge or rebase (the lead does).
- **Never open or print** `.env`, `infra/.env`, `.local-secrets/*`, token/session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys.
- Migrations: none in this repo; the rule "migrations freeze once applied" is the BE twin's.
- **Gate:** the hook does not cover `phase/hrp-v2`; the lead runs `scripts/verify.sh` before merging there, by rule.
- Docs: developer pages in H0-A7; user guide: "none: no HR user-guide pages exist; the empty state is temporary" unless one names v1 screens.
- Stop and ask: a kept file needs a v1 type; a shared component turns out to be used only by v1 code (keep it and ask); anything in OD-A1/A2 unanswered.

## Builder self-check (L36; in the report, one row per scope row)
| ID | Proof (test class.method, file:line, screenshot) | Status |
|---|---|---|
| H0-A1 … H0-A7 | | |
Every review finding fixed with its own old-FAIL/new-PASS test and a re-run of the touched targets; the review file in gate format from round 1.

## Review and report
Fresh Opus (whole diff; deletion complete, nothing H1 reuses removed, menu and employee-only routing) → `docs/agents/hrp-h0/review-app-1-opus.md`.
**Report:** `docs/agents/hrp-h0/builder-report-app.md` (keep-list with uses, deleted counts). **Lane-ready:** `.review-channel/lane-ready-hrp-h0-app.md`, with:
```
## Timeline
- Build: … · Rework: … · Review: … · Test: … · Waiting: …   (minutes; tokens per agent; FIX rounds)
- Changed files: … (added/deleted/modified) · Items: 7 scope rows, … findings
```

## Done when
H0-A1…A7 proven in the self-check; JVM, iOS, Android compile; targeted tests 0 failed; the review ACCEPTs; docs listed; the lead's `verify.sh`
green on the lane; merged to App `phase/hrp-v2` no later than HRP-H0-BE.
