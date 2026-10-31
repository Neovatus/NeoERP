# Triage of the Codex UX sweep

2026-10-31 · Claude (Opus) · source check on NeoERP-App branch `dev-app`, read-only, no Gradle.
Input: `docs/agents/codex-ux-sweep/report.md` (42 grouped findings). Rules: `ux-principles.md` §21-§24, `building-blocks.md`, ES-Q / FMT-Q notes.

## Summary

| Verdict | Count | IDs |
|---|---|---|
| CONFIRMED | 41 | all except D1 |
| WRONG | 0 | |
| UNCLEAR | 1 | D1 |

How each was checked: every cited `file:line` was opened in `composeApp/src/commonMain`. All are production code (no tests, mocks or previews). HR, Payroll, ESS, Inbox and Reports are reachable (`NeoSmartContentArea` routes `Inbox`, `Payroll`, `Ess`; HR and Reports are called from their routes). None of the cited sites is already routed through NeoFormat or the shared states.

Caveats on depth:
- S12 (People and Platform staff): I opened the cited lines and the Company list branch in full. People and Staff were confirmed from the cited lines (toolbar and header action stay in the first-use branch), not traced end to end.
- F1, F2, F4 and U1 cite many lines each. I opened a sample of each (HR 876, 893, 934, 1050, 1446; Payroll 239, 300, 352, 391, 393, 566, 676, 719, 746; Reports 500, 501, 520, 549, 551, 574; HR 434, 621, 690, 896). All matched. The rest are the same pattern.
- Severity is Codex's (P1/P2/P3). I agree with P1 on E1, E2, F1-F4 and F6. The deprecated `NeoTableEmptyState` KDoc already says "callers compile until their batch moves them", so S1, S2 and S7 are known pending migrations, not new regressions.

## Fix batches

### Batch A: Accounts and dashboard (size M, about 12 files)
Findings: C1, S1, S2, S7 (platform dashboard half), F6, F7, T2.
- `features/accounts/presentation/chart/AccountsTabParts.kt` (143), `chart/AccountsChartTab.kt` (175, 257, 414, 438), `chart/AccountsTabWords.kt`, `chart/sie/SieSettingsDialog.kt` (F7: pass a dateTime formatter)
- `features/accounts/presentation/tax/AccountsTaxCodesTab.kt` (137, 211)
- `features/accounts/presentation/templates/ChartTemplateTabs.kt` (95), `templates/ChartTemplatesScreen.kt` (84)
- `features/accounts/presentation/usedfor/UsedForList.kt` (153)
- `features/accounts/presentation/home/AccountsHomeScreen.kt` (76), `home/AccountsFormat.kt` (24; make the zone explicit)
- `features/accounts/presentation/review/ReviewAndGoLiveScreen.kt` (247)
- `features/accounts/presentation/openingimport/OpeningImportPageScreen.kt` (139)
- `features/dashboard/presentation/PlatformDashboardScreen.kt` (407, 412), `DashboardScreen.kt` (298, 306)

Notes: S1 uses `NeoNoResults`. S2 first use uses `NeoSpotState`, and the denial at `AccountsHomeScreen:76` uses the typed no-access mapping. Do not turn a not-built endpoint into first use. This batch also finishes the `NeoTableEmptyState` and `NeoEmptyState` retirement (all remaining callers are in Accounts and the platform dashboard), after which the deprecated components can be deleted. F6 and F7 are P1/P2 correctness bugs and should go first.

### Batch B: HR and HR/Payroll reports (size L, about 3 files, HR screen is about 1500 lines)
Findings: C3 (HR), E3 (HR), S9, S11, T1 (HR), F1, F4, F5 (HR), R7 (HR), W1 (HR and Reports), U1, U3 (HR status input).
- `features/hr/presentation/HrFeatureScreen.kt`, `features/hr/domain/model/HrModels.kt` (label mapping)
- `features/reports/presentation/ReportsFeatureScreen.kt`
- `res` strings if the screen uses resources.

Notes: needs `NeoDateField`, a labelled select for status, and `NeoField(required = true)` in place of `*` labels. Split HR into two builders if one is too long. HR is scored 1/5, so this is the largest single piece.

### Batch C: Payroll, ESS, Inbox, Profile (size L, about 7 files)
Findings: C2, C3 (Payroll), E1, E2, E3 (Payroll and ESS), S10, T1 (Payroll, ESS, Inbox, Profile), F2, F3, F5, R1, R7 (Payroll and ESS), W1, U2, U3.
- `features/payroll/presentation/PayrollFeatureScreen.kt`, `features/payroll/data/mapper/PayrollMapper.kt`, `PayrollViewModel`/state (keep the typed failure)
- `features/ess/presentation/EssFeatureScreen.kt`, `features/ess/data/mapper/EssMapper.kt` (stop building the display range)
- `features/inbox/presentation/InboxFeatureScreen.kt`, `InboxFeatureState.kt` (keep `NeoErrorDisplay`)
- `features/profile/presentation/ProfileFeatureScreen.kt`, `ProfileFeatureState.kt`

Notes: E1 and E2 (P1) go first. Status and money mapping needs typed enums in the mappers. Payroll money must use the company currency scale (see the Q on scale below).

### Batch D: Organization, People, Platform, Agreements, Roles, Security and the shared toast (size M-L, about 20 files, mostly small edits)
Findings: S3, S4, S5, S6, S7 (request inbox half), S8, S12, E4, E5, R2, R3, R4, R5, R6, D2.
- Organization: `organization/CompanyListUi.kt`, `CompanyActivityTab.kt`, `CompanyLegalCard.kt` (E4: inline `NeoLoadError`), `CompanyPeopleTab.kt` (E5), `CompanyRecordForms.kt` (R2: add `required` to private `TextField`), `enrollment/EnrollmentCompanyModuleSteps.kt` (R3), `requests/RequestInboxScreen.kt`
- People: `PeopleListUi.kt`, `PersonAccessTab.kt`, `AccessSheet.kt`, `PeopleWording.kt`
- Platform: `PlatformPeopleScreen.kt`, `PlatformStaffScreen.kt`, `PlatformAuditLogScreen.kt`, `PlatformStaffDetailPage.kt`, `PlatformRolesScreen.kt`
- Others: `agreement/presentation/AgreementsScreen.kt`, `roles/presentation/RoleFlowsUi.kt`, `RolePageUi.kt`, `security/presentation/MySessionsCard.kt`
- Shared: `designsystem/components/NeoToast.kt` (D2 tokens; E5 is caller-side: pass the reference only for Broken or ServiceUnavailable)

Notes: could be split into D1 (S-series and E4/E5/D2) and D2 (R-series) if the builder needs smaller pieces. Highest value: E5 (a reference line on non-server errors breaks ES-Q6).

Suggested order: A (P1 F6, F7), C (P1 E1, E2, F2, F3), B (P1 F1, F4), then D.

## Rejected or deferred

- D1 (UNCLEAR, deferred): Accounts-local dp values and the 14.5 sp review title may be deliberate geometry. Codex itself says not to swap in nearest tokens. It is P3 and needs a design-token decision, so do not bundle it with a builder batch.
- No finding is WRONG.

## Questions for Jabran

1. HR, Payroll, ESS and Inbox are the legacy screens (scored 1-2/5). Fix them in place as batches B and C, or wait for their module rebuilds and only fix the P1 items (E1, E2, F1-F4) now? The fixes are large and may be thrown away.
2. S3: `CompanyListUi.kt` says its illustrated "No companies match" is "the design's copy, word for word" from the rig. §23 (decided 2026-10-30) says no picture for a filter miss. I am treating §23 as winning and the rig as stale. Confirm, and should the screen-rig be updated too?
3. T1 and T2: where a completed action's result is already visible on screen (HR, Payroll and ESS "Done", Profile saved, opening-import approved), drop the message or emit a toast? The report allows either. I would use a toast for Profile saved and the opening approval, and drop "Done" where the row updates in place.
4. C1, dashboard clock-in: a blank value under a "Clock-in" label looks broken. Hide the tile when there is no clock-in, or leave it blank per the rule?
5. F2 and F3: Payroll and ESS money arrives as strings with no currency. Which currency scale is the source of truth, the company currency or a per-run currency? A builder needs this before formatting (the report assumes company NeoFormat).
6. S12: should the first-use hiding of the header create action apply to the Platform staff and Company list pages even where a role could only reach "Request a company" and not "Enroll"? (It affects the no-permission first-use case.)
