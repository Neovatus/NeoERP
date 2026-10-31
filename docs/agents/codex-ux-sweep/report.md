# NeoERP App UX conformance sweep

2026-10-31 · Codex · source review only

Findings are grouped by rule below, followed by the per-feature score table. All findings are **open proposals**, not approved implementation. **P1** means misleading data or failure/recovery behavior; **P2** means a visible conformance break; **P3** means consistency or token maintenance debt. Repeated instances of one defect are grouped rather than counted as separate defects.

## Scope and evidence

- Workspace: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP` (the task's explicit path). Workspace branch `master`, reviewed HEAD `63d837ecaaa1a737d9e69c334d10b17744a62524`.
- App: branch `dev-app`, HEAD `7ef508a1c1353da53e0319e1de9a4fa2127e064f`; app working tree clean at pickup and final source check. Findings describe that app snapshot, not an app revision on master.
- Method: repository-wide pattern searches over production `composeApp/src/commonMain`, followed by targeted inspection of screens, shared renderers, state, validators and data mappings. The Kotlin inventory excluding mock/test/preview/catalog paths contains 873 files; this is a search inventory, not a claim of line-by-line review of every file. Tests and mocks are excluded from findings.
- No Gradle, builds, app launch, screenshots, backend mutations, app mutations, or PROJECT-STATE file reads. Static inspection cannot prove click counts, above-the-fold placement at every width, keyboard behavior, actual screen-reader announcements, or elapsed toast timing. No live UX acceptance is claimed.
- Existing workspace changes were preserved: `docs/agents/accounts-bc-readiness/brief-sb2a.md`, `docs/handover/design-principles.md`, `docs/inbox/erp-lead.md`, and untracked `.review-channel/handoff-implementer.md`, `docs/agents/accounts-cp-ev-1c/`, `docs/agents/accounts-flow56-fixes/`.
- Authority: `NeoERP-App/docs/design/ux-principles.md` §21–24; `specs/building-blocks.md`; `notes/empty-error-states-audit.md` ES-Q1–Q7 and `notes/formats-audit.md` FMT-Q1–Q6, relative to the same design directory. The decided rules override historical observations in the audit notes. Workspace workflow and frontend guide were read; the explicit one-file/no-state instruction takes precedence over creating or updating a separate plan/state record.

**Source path convention:** unless prefixed otherwise, every `features/...`, `core/...`, `ui/...` or `designsystem/...` location below is relative to `NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`. Line numbers refer to the reviewed app snapshot.

## §21 — Click-through rules

**C1 · P2 · Missing values still become em dashes.** `features/accounts/presentation/chart/AccountsTabParts.kt:143` converts both null and blank facts to `—`; `chart/AccountsChartTab.kt:414` and `:438`, relative to `features/accounts/presentation/`, supply further dash fallbacks. `features/dashboard/presentation/DashboardScreen.kt:298` and `:306` show a dash for absent clock-in. A missing fact therefore renders visible punctuation despite “empty values are blank.” **Fix:** keep absent values blank, and omit empty optional fact rows where appropriate; do not change a real zero total into a blank.

**C2 · P2 · Payroll gives a status two signals and marks the normal state.** `features/payroll/presentation/PayrollFeatureScreen.kt:236` and `:241` draw a dot and a status pill on the same period row, including normal Open; run rows repeat the pattern at `:349` and `:354`. **Fix:** one shared exception-status pill, with Open omitted where it is the normal state; remove the separate dot.

**C3 · P3 · Counts do not drive grammar.** `features/payroll/presentation/PayrollFeatureScreen.kt:300` always says “employees”; `:352` does the same for a run; `features/hr/presentation/HrFeatureScreen.kt:934` always appends “days.” Inputs of one produce “1 employees” and “1 days.” **Fix:** resource plurals for each count, formatted through `NeoFormat.count` or `quantity` as appropriate.

## §22 — Page errors and support references

**E1 · P1 · Payroll first-load failure is a red banner over its workspace.** `features/payroll/presentation/PayrollFeatureScreen.kt:92` reads `errorMessage` and `:93` renders “Payroll Error” as `NeoNotificationCard`; `:88` falls back to the literal breadcrumb “Company.” The typed cause and its page recovery action do not reach the renderer. **Fix:** retain the typed failure, use `NeoFailureState` with an explicit loaded-content distinction, return after a whole-page failure, and obtain the real selected-company name. Preserve previous data only for refresh failure.

**E2 · P1 · Inbox discards the typed failure and still draws empty content after initial failure.** `features/inbox/presentation/InboxFeatureState.kt:45` stores `displayText("Something went wrong")`; `features/inbox/presentation/InboxFeatureScreen.kt:42` shows a red text line, then `:55` and `:89` draw empty sections regardless of that failure. A failed read can look like an empty inbox. **Fix:** retain `NeoErrorDisplay`, use `NeoFailureState` before any successful read, retain content with a strip on refresh failure, and render empty sections only after a successful load.

**E3 · P2 · Permission guards bypass page context.** `features/hr/presentation/HrFeatureScreen.kt:141`, `features/payroll/presentation/PayrollFeatureScreen.kt:74`, and `features/ess/presentation/EssFeatureScreen.kt:73` return `NeoNoAccess` before rendering the page header/breadcrumb. **Fix:** keep the real company breadcrumb and title outside the permission branch, then render the denied state within that page frame. This preserves context without granting any access.

**E4 · P2 · A failed history section gets the whole-page illustration.** `features/organization/presentation/organization/CompanyLegalCard.kt:194` uses `NeoFailureState(..., hasContent = false)` inside the collapsible Legal history section. A server/offline error there selects a page-sized spot inside a small section. **Fix:** render the section's typed error with inline `NeoLoadError` and its retry; preserve the surrounding legal details.

**E5 · P2 · Invitation error toast references are not restricted to server errors.** `features/organization/presentation/organization/CompanyPeopleTab.kt:200` passes any resend failure's `requestReference` directly to the toast. `designsystem/components/NeoToast.kt:79` derives a reference whenever one is supplied; it has no cause check. Thus a permission/business failure carrying a request id can show a Reference line. **Fix:** map the typed cause and pass the reference only for Broken or ServiceUnavailable; keep denied/offline/not-found/business-refusal toasts reference-free. Preserve this row action's error toast and Try again behavior.

## §23 / ES-Q1–Q7 — Empty states

**S1 · P2 · Accounts filter misses still use the retired illustrated table state.** `features/accounts/presentation/chart/AccountsChartTab.kt:257`, `tax/AccountsTaxCodesTab.kt:211`, `templates/ChartTemplateTabs.kt:95`, and `usedfor/UsedForList.kt:153`, with the latter three relative to `features/accounts/presentation/`, use `NeoTableEmptyState`. For a narrowed list, this is the wrong state even where Clear filters exists. **Fix:** use `NeoNoResults` under the retained toolbar; keep the typed filters and one Clear filters action.

**S2 · P2 · Accounts first-use and access states still use retired components.** `features/accounts/presentation/tax/AccountsTaxCodesTab.kt:137` uses `NeoTableEmptyState` for first use; `features/accounts/presentation/templates/ChartTemplatesScreen.kt:84` uses `NeoEmptyState`. `features/accounts/presentation/home/AccountsHomeScreen.kt:76` also uses `NeoEmptyState` for denial. **Fix:** first use goes through `NeoSpotState` with its module illustration and the one permitted create action; denial goes through the typed denied mapping rather than an empty component. Do not turn a not-built endpoint into first use.

**S3 · P2 · Organization filter misses are illustrated.** `features/organization/presentation/organization/CompanyListUi.kt:171` uses a Search spot for “No companies match.” `features/organization/presentation/organization/CompanyActivityTab.kt:102` also selects a Search illustration when events exist but the activity filters remove them. **Fix:** `NeoNoResults` with the appropriate noun and clear callback, left-aligned under the existing toolbar.

**S4 · P2 · People filter miss is illustrated.** `features/people/presentation/PeopleListUi.kt:204` draws a Search spot for a search/role/status/branch-scope miss. **Fix:** `NeoNoResults` with the same clear operation, preserving the inputs until Clear filters is chosen.

**S5 · P2 · Platform filter misses are illustrated.** `features/platform/presentation/PlatformPeopleScreen.kt:229`, `PlatformStaffScreen.kt:236`, and `PlatformAuditLogScreen.kt:247`, all under `features/platform/presentation/`, select Search spots for narrowed lists. **Fix:** split first-use and no-results branches; use `NeoNoResults` for the narrowed branch and retain the toolbar.

**S6 · P2 · Agreements filter miss is illustrated.** `features/agreement/presentation/AgreementsScreen.kt:188` selects a Search illustration when companies exist but no row matches. **Fix:** separate the true first-use branch from `NeoNoResults(noun = "agreements", onClear = ...)`.

**S7 · P2 · Requests and platform attention queue mix all-clear and filter-miss components.** `features/organization/presentation/requests/RequestInboxScreen.kt:359` selects Search or Clear through the same spot call. `features/dashboard/presentation/PlatformDashboardScreen.kt:407` and `:412` use retired `NeoTableEmptyState` for both cases. **Fix:** genuine queue-clear uses `NeoSpotState` with Clear; narrowed zero rows use `NeoNoResults` with Clear filters. Do not show a picture for the filtered branch.

**S8 · P2 · Detail-card sections use page illustrations.** `features/people/presentation/PersonAccessTab.kt:151` shows a spot for no memberships; `features/platform/presentation/PlatformStaffDetailPage.kt:759` does so inside Activity; `features/security/presentation/MySessionsCard.kt:64` does so inside the signed-in-sessions card. **Fix:** one `NeoText(role = EmptyLine)` in each section; keep the section title and any sole permitted add action.

**S9 · P2 · HR emptiness is styled as a warning.** `features/hr/presentation/HrFeatureScreen.kt:472` uses a yellow notification for a filter miss, with no Clear filters action there. Empty attendance, departments, designations, holidays and shifts do the same at `:885`, `:976`, `:1164`, `:1239`, `:1301`, `:1323`. **Fix:** distinguish first-use pages (`NeoSpotState`), narrowed lists (`NeoNoResults` + Clear filters), and empty detail sections (`EmptyLine`); remove warning surfaces for emptiness.

**S10 · P2 · Payroll and ESS have private/ad hoc empty states.** `features/payroll/presentation/PayrollFeatureScreen.kt:176`, `:222`, `:290` use plain body text for empty lists; `:334` and helper `:781` use info notification cards. `features/ess/presentation/EssFeatureScreen.kt:320`, `:362`, `:476` use body text inside sections; `:564` uses an info card for no payslips. **Fix:** choose the shared kind by scope: first-use or all-clear for the whole page; `EmptyLine` for a section. Remove the instructional “Tap '+ Apply Leave'” at ESS `:476`; the action itself provides the way to start.

**S11 · P2 · HR/Payroll report tables have no distinct no-results state.** `features/reports/presentation/ReportsFeatureScreen.kt:382` accepts only `rows` and `emptyMessage`; `:388` centres a caption whenever rows are empty, whether the source is empty or the filter removed the rows. There is no Clear filters action in that branch. **Fix:** pass the original-data/filtered distinction and reset callback into the scaffold; render `NeoNoResults` for filter misses and the appropriate first-use/section state otherwise.

**S12 · P2 · First-use lists retain duplicate create actions and empty search controls.** `features/organization/presentation/organization/CompanyListUi.kt:111`, `:141` and `:167` leave the header action and toolbar alongside the first-use create action. `features/people/presentation/PeopleListUi.kt:137`, `:194` and `:219` likewise keep the search/invite toolbar and spot Invite action. `features/platform/presentation/PlatformStaffScreen.kt:178`, `:223` and `:239` likewise retain header Add staff, the toolbar, and first-use Add staff. **Fix:** compute true first use after a successful load; hide header create/search/filter chrome only in that branch and keep the one spot action. Do not hide the toolbar on a filter miss.

## §24 — Toasts and one message per action

**T1 · P2 · Completed actions still leave success notices in several features.** `features/hr/presentation/HrFeatureScreen.kt:202`, `features/payroll/presentation/PayrollFeatureScreen.kt:96`, and `features/ess/presentation/EssFeatureScreen.kt:96` display “Done” success cards. `features/inbox/presentation/InboxFeatureScreen.kt:43` displays success text. `features/profile/presentation/ProfileFeatureScreen.kt:93` renders the “Profile saved.” notice set by `ProfileFeatureState.kt:78`. **Fix:** when completion needs confirmation beyond the visible result, emit one one-shot toast naming the action; otherwise omit the extra message. Never also keep the notice, and keep failed saves in the open form.

**T2 · P2 · Finished opening approval leaves a success notice.** `features/accounts/presentation/openingimport/OpeningImportPageScreen.kt:139` renders `ApprovalCard.Done` as an info `NeoNotice` saying the documents were approved and are in the books. **Fix:** publish the completion once through the toast host and render the resulting documents/status normally. If this is only a visible status update, omit the extra confirmation instead.

**Checked, no finding:** `designsystem/components/NeoToastHost.kt:58` resolves lifetimes by kind/action, `:87` resolves desktop/phone placement and obstructions, `:189` caps the stack, `:245` anchors it at the bottom, and the host handles hover/focus pause. `designsystem/tokens/NeoComponentTokens.kt` supplies toast values. Source behavior now covers the requested 5 s / 8 s / sticky-error rules, max three, newest on top, key replacement, bottom-right desktop / bottom-centre phone and footer/panel insets. These are static checks, not a device timing/placement test. No confirmed form-error toast was found: `features/organization/presentation/organization/OrgPageNav.kt:85` and `OrganizationScreen.kt:585` explicitly suppress it when a form holds the failure. The resend toast in E5 is a permitted row-action error, not a form error.

## Formatting / FMT-Q1–Q6 — NeoFormat, dates, amounts, percentages and zones

**F1 · P1 · HR renders raw ISO dates and ranges.** `features/hr/presentation/HrFeatureScreen.kt:876` interpolates employment dates; `:893` renders `rec.date`; `:934`, `:960`, `:992`, `:1006`, `:1050`, `:1076`, `:1313` and `:1446` render further dates/ranges directly. An API day `2026-10-09` appears unchanged. **Fix:** `LocalNeoFormat.current.date`, `dateRange` and, for instants, the appropriate zone-aware method. Keep date-only values date-only; branch-time HR rules remain applicable to attendance times.

**F2 · P1 · Payroll renders raw API money and dates.** `features/payroll/presentation/PayrollFeatureScreen.kt:239` shows raw period endpoints; `:300` shows raw effective date. `:352`, `:391`, `:393`, `:566`, `:676`, `:719`, `:746` show raw gross/net/line amounts. `features/payroll/data/mapper/PayrollMapper.kt:84`, `:104`, `:113`–`:115` confirm those are unformatted DTO strings. **Fix:** format displayed dates/ranges and parse/format money through the company's `NeoFormat`, using the real currency scale. For NO, API `-1250.5` should display `−1 250,50`, not raw `-1250.5`; totals retain their decimals.

**F3 · P1 · ESS displays raw dates, money and prebuilt API-date ranges.** `features/ess/presentation/EssFeatureScreen.kt:236` and `:297` display date strings; `:577` displays `slip.netPay`. `features/ess/data/mapper/EssMapper.kt:64` constructs a range from raw start/end strings, and `:76` passes net pay unchanged. **Fix:** keep raw values in the model and format them at presentation through `NeoFormat.date`, `dateRange`, `money` and `quantity`; do not build a display range in the mapper.

**F4 · P1 · HR/Payroll reports bypass the shared number/date formatter.** `features/reports/presentation/ReportsFeatureScreen.kt:500` and `:501` pass raw start/end dates into table cells; `:549` and `:551` pass raw gross/net money; `:520`–`:525`, `:574`, `:602` use ungrouped `toString()` counts. **Fix:** apply the company `NeoFormat` before creating the display rows, including currency scale, true minus and grouped counts. Keep export serialization separate from on-screen text.

**F5 · P2 · Legacy date inputs bypass company parsing and picker behavior.** `features/hr/presentation/HrFeatureScreen.kt:1371`, `:1388`, `:1403`, `:1421`; `features/payroll/presentation/PayrollFeatureScreen.kt:458`, `:459`, `:475`, `:476`, `:492`, `:506`; `features/ess/presentation/EssFeatureScreen.kt:632`, `:633`, `:663`, `:696` use text inputs with ISO examples or raw dates. **Fix:** use `NeoDateField`, holding ISO internally while accepting the edited company's pattern and ISO through the shared parser. The Reports date filter is already migrated at `features/reports/presentation/ReportsFeatureScreen.kt:340` and is not a current finding.

**F6 · P1 · Concurrent go-live notice uses the device zone.** `features/accounts/presentation/review/ReviewAndGoLiveScreen.kt:247` calls `AccountsFormat.dateTime(notice.record.at)` without the company zone. `features/accounts/presentation/home/AccountsFormat.kt:24` defaults that argument to `TimeZone.currentSystemDefault()`. For a company in Oslo and a device elsewhere, the same event shows a different time/day. **Fix:** use the current company `NeoFormat.dateTime` here; require an explicit company zone in company-scoped wrappers rather than relying on the device default.

**F7 · P2 · SIE settings' “changed by” moment is reduced to a date.** `features/accounts/presentation/chart/AccountsChartTab.kt:175` passes `AccountsTabWords::date` as `formatDateTime`; `features/accounts/presentation/chart/sie/SieSettingsDialog.kt:164` applies it to `updatedAt`. `features/accounts/presentation/chart/AccountsTabWords.kt:28` reads only the incoming date part, losing the time and any zone conversion. **Fix:** pass the company's `NeoFormat.dateTime` callback, yielding e.g. `19:05, 27 Oct 2026`.

**Checked, no finding:** `core/format/NeoFormat.kt` exists and covers shared date/range/money/percent behavior. The reviewed shared money implementation uses true minus; sales-document screens now call shared percentage and quantity helpers. No executable production `String.format`, `"%.2f"`, `BigDecimal.toString()` display, or direct `LocalDate.toString()` display defect was confirmed. ISO serialization for routes, requests and field state is not a display violation. Remaining raw string interpolation and count conversion are documented above rather than assuming every `toString()` is wrong. The old formats audit's missing-module, invoice-zero and Reports-filter observations must not be treated as current defects without checking today's code.

## Required fields — explicit required = true, always visible

**R1 · P2 · Profile required name/email are visually and semantically optional.** `features/profile/presentation/ProfileFeatureScreen.kt:77` prevents saving without both; `:96` and `:101` wrap them in `NeoField` without `required = true`. `designsystem/components/NeoForm.kt:298` defaults it to false. **Fix:** mark both required using the API and the shared required legend; retain optional Phone. Do not show an error for a pristine blank field merely to communicate that it is required.

**R2 · P2 · Organization's field wrapper cannot mark required branch/location fields.** `features/organization/presentation/organization/CompanyRecordForms.kt:223` validates branch name/code; inputs at `:322`, `:325` go through private `TextField`, whose `:518`–`:529` signature/forwarding has no required flag. The required multi-branch location picker at `:489` also omits the flag. **Fix:** add and forward `required`, set it on validated required names/codes and the required branch picker, and leave optional fields unmarked.

**R3 · P2 · Enrollment fiscal facts omit required markers.** `features/organization/presentation/enrollment/EnrollmentCompanyModuleSteps.kt:312` and `:323` draw Currency and Fiscal year starts without the flag, despite the documented required behavior for countries without defaults at `:297`–`:300`. **Fix:** mark required fields through `NeoField`/select APIs, including the no-default case. A hint saying “Required” does not replace the marker or semantics.

**R4 · P2 · People invite name/email omit required markers.** `features/people/presentation/AccessSheet.kt:259` and `:265` use unmarked `NeoField`; `features/people/presentation/PeopleWording.kt:347` and `:348` require both before progressing in the invite/give-access modes. **Fix:** set `required = true` in those modes, and retain the read-only email behavior when editing an existing invitation.

**R5 · P2 · Platform role name and staff email omit required markers.** `features/platform/presentation/PlatformRolesScreen.kt:274` makes name length mandatory but `:291` leaves its field unmarked. `features/platform/presentation/PlatformStaffScreen.kt:442` requires a valid new-staff email but `:470` leaves its field unmarked. **Fix:** mark those inputs required with the shared API/legend. Do not mark optional new-staff Full name unconditionally.

**R6 · P2 · Company-role names rely on copy rather than the required API.** `features/roles/presentation/RoleFlowsUi.kt:267`/`:277` require a valid name; `:300` does not mark it. `features/roles/presentation/RolePageUi.kt:469` spells “Role name (required)” in the label instead of setting the flag. **Fix:** use sentence-case “Role name” plus `required = true` in both creation/edit paths.

**R7 · P2 · Legacy forms hand-type asterisks instead of the shared requirement contract.** `features/hr/presentation/HrFeatureScreen.kt:1370`, `:1386`, `:1489`–`:1491`; `features/payroll/presentation/PayrollFeatureScreen.kt:423`, `:424`, `:455`, `:456`, `:490`, `:491`; `features/ess/presentation/EssFeatureScreen.kt:630`, `:632`, `:633`, `:668`, `:696`–`:698` use labels with `*`. `designsystem/components/NeoTextField.kt:60`–`:75` has no required parameter, so these do not opt into shared required-label semantics. **Fix:** migrate the form controls to `NeoField(required = true)` with shared inputs/date/select components, or extend the shared field API once and migrate the call sites; remove manually embedded asterisks.

**Checked, no finding:** no confirmed required input hidden by a fold was found in the inspected form paths. The inspected Legal fold holds historical read-only records, not the required editor. This is not a runtime guarantee for every form/width.

## Tokens — shared sizes, typography and colours

**D1 · P3 · Accounts keeps local design values and duplicated editor geometry.** `features/accounts/presentation/home/AccountsUi.kt:55`–`:71` declares local dp layout values; `:104` declares `14.5.sp`, used by `:149`. `features/accounts/presentation/receivables/InvoiceEditorScreen.kt:182`, `:190`–`:195`, `:232` and `features/accounts/presentation/payables/BillEditorScreen.kt:250`, `:258`–`:263`, `:297` duplicate the 760 dp threshold and column widths. **Fix:** use existing design-system sizing/type tokens where equivalent; promote any intentionally distinct, approved geometry into shared component tokens and reuse it across the two editors. Do not replace deliberate geometry with arbitrary nearest values.

**D2 · P3 · Toast action typography still has literal sizes.** `designsystem/components/NeoToast.kt:193` and `:194` hard-code `13.sp`/`24.sp` for actions despite the shared token policy. **Fix:** add/use the approved toast-action typography tokens in the shared component, retaining the specified appearance.

**Checked, no finding:** the production search did not confirm feature-local hard-coded hex colours outside token definitions. `Color.Transparent`, zero-dimension layout sentinels and icon vector viewport dimensions were not counted as palette/spacing violations.

## Sentence case — headers, labels and overlines

**W1 · P2 · Legacy feature headings/actions remain title case.** Examples: `features/hr/presentation/HrFeatureScreen.kt:188` “HR Operations”, `:191` “Add Employee”; `features/payroll/presentation/PayrollFeatureScreen.kt:171` “Salary Components”, `:217` “Payroll Periods”, `:418` “Add Salary Component”; `features/ess/presentation/EssFeatureScreen.kt:86` “My Self-Service”, `:272` “Attendance Records”, `:315` “Regularization Requests”; `features/reports/presentation/ReportsFeatureScreen.kt:112` “Export Ready”; `features/inbox/presentation/InboxFeatureScreen.kt:39` “Notifications and Workflow Inbox”, `:85` “Workflow Inbox”. **Fix:** sentence case in the presentation strings/resources (“HR operations”, “Add employee”, “Payroll periods”, “My self-service”, “Export ready”, “Workflow inbox”), preserving proper names/acronyms. Apply to the related form labels/buttons in the same legacy screens, not to user-entered names or official document titles.

## User-facing technical values — no raw enum names or error codes

**U1 · P2 · HR exposes enum identifiers directly.** `features/hr/presentation/HrFeatureScreen.kt:434`, `:621`, `:690`, `:896`, `:936`, `:995`, `:1008`, `:1052`, `:1078` use `status.name` as a badge label; `:1334` inserts `shift.type.name` into `Text`. `features/hr/domain/model/HrModels.kt:27` defines `OnLeave`, which therefore appears without a space. **Fix:** explicit exhaustive enum-to-resource label mappings (“On leave”), independent of the wire names. Normal-state badges also need the §21 exception-only rule.

**U2 · P2 · Inbox exposes service/action/status wire strings.** `features/inbox/presentation/InboxFeatureScreen.kt:65` and `:100` concatenate all three into notification descriptions. `:97` compares the status to `PENDING`, establishing that this path receives technical status values. **Fix:** map known action/status values to user wording, omit service identifiers unless meaningful to the person, and use a safe generic label for unknown values; keep diagnostic codes in local-only details.

**U3 · P2 · Payroll/ESS status fields print server values verbatim; legacy forms ask people for technical codes.** `features/payroll/presentation/PayrollFeatureScreen.kt:242`, `:355`, `:574` display raw status strings; the mapper preserves DTO status at `features/payroll/data/mapper/PayrollMapper.kt:86`, `:102`, `:116`. `features/ess/presentation/EssFeatureScreen.kt:304` prints attendance status directly. HR `features/hr/presentation/HrFeatureScreen.kt:1420` labels an input “Status (ACTIVE / INACTIVE / LEAVE)”; ESS `features/ess/presentation/EssFeatureScreen.kt:630` suggests “ANNUAL / SICK / UNPAID”. **Fix:** typed mappings and labelled selects/pickers, storing codes internally. The user should choose “On leave” or “Annual leave”, not type an enum/code.

**Checked, no finding:** no additional confirmed raw error-code-in-Text defect was established. Real company/account/tax/document codes and domain `name` properties are not enum leaks. Known-code lookups and `.name` used only as select keys are not findings.

## Per-feature score table

These are **ordinal source-conformance scores, not percentages or runtime acceptance**: **1/5** systemic breaks across most applicable rules; **2/5** several important breaks; **3/5** mixed, with working shared patterns and recurring gaps; **4/5** localized confirmed gaps; **5/5** no confirmed break in the sampled production surface. **N/A** means no independent screen to score. Shared-component findings affect their consumers and are listed separately. Finding IDs make the judgement reviewable; no score implies that every screen/state was executed.

| Feature / surface | Score | Evidence and remaining breaks |
| --- | --- | --- |
| Accounts (home, setup, journals, reports, receivables, payables, imports, year end) | 3/5 | Shared formatter and newer customer/supplier empty flows are present; C1, S1–S2, T2, F6–F7, D1 remain. Journals' ISO routing/state serialization is not a display finding. |
| Organization / enrollment / requests | 3/5 | Typed page errors and company scope exist; E4–E5, S3, S7, S12, R2–R3. |
| People / access / invitations | 3/5 | Typed failure and inline form patterns exist; S4, S8, S12, R4. Resend reference defect is rendered by Organization (E5). |
| Platform people, staff, roles, audit-log screens | 3/5 | Typed errors and shared moment formatting exist; S5, S8, S12, R5. |
| Agreements | 4/5 | Percentage uses `LocalNeoFormat`; confirmed no-results break S6. |
| Dashboard (tenant and platform) | 3/5 | Platform loading/error patterns exist; missing-value fallback C1 and attention-queue states S7. Tenant snapshot fields require runtime/source-contract follow-up for full formatting assurance. |
| HR | 1/5 | C3, E3, S9, T1, F1, F5, R7, W1, U1, U3. Shared failure and productivity-percent formatting are already present. |
| Payroll | 1/5 | C2–C3, E1, E3, S10, T1, F2, F5, R7, W1, U3. Initial error recovery and money formatting are the highest-priority items. |
| ESS / self-service | 2/5 | Typed page failures already exist; E3, S10, T1, F3, F5, R7, W1, U3. |
| HR/Payroll Reports (outside Accounts reports) | 2/5 | Typed page failure and shared date filter already exist; S11, F4, W1. |
| Inbox / workflow | 1/5 | E2, T1, W1, U2; failure vs empty is not distinguished. |
| Profile | 3/5 | Typed load failures and skeleton already exist; T1, R1. |
| Company roles / standard roles | 4/5 | Shared failure and moment-display paths present; required-name markers R6. |
| Security / sessions | 4/5 | Typed errors and `LocalNeoFormat` present; empty card section S8. |
| Auth / native sign-in entry | 5/5 (sample) | Native sign-in entry uses shared notices/tokens; no confirmed requested-rule break in its sampled live entry path. Hosted credential forms are outside commonMain and were not assessed. |
| Company access / acting-as banner | 5/5 (sample) | Token-based banner and contextual action error; no confirmed requested-rule break in the sampled banner. This is not a security audit. |
| Audit domain / wording helpers | N/A | No independent screen in this feature directory; user-facing audit-list findings are counted under Platform. |
| Context | N/A | Data/domain helpers; no independent screen in this feature directory. |
| Entitlement | N/A | Data/domain feature; UI belongs to Organization and its scores. |
| Shared design-system / formatting infrastructure | 4/5 | New spot alignment, format system and toast placement/timing/stack are present; E5's caller contract and D2 remain. Legacy consumers are scored above. |

## Verification, disposition and checkpoint

- **Owner / integrator:** Codex for this report only. Authorized write/commit scope: `docs/agents/codex-ux-sweep/report.md` in workspace `master`, commit message `docs(codex): UX conformance sweep`; no push authorized.
- **Stage:** discovery, evidence classification, report drafting and structured self-check complete; delivery authorized by the task. This is a source audit, not an implementation stage or independent review of fixes.
- **Disposition:** 42 grouped findings, all open/proposed. No product code was fixed or accepted as corrected. Historical audit findings were checked against current code rather than copied as current evidence.
- **Concurrent workspace activity:** other documentation tasks advanced workspace master during this sweep; their commits and newly appearing untracked task directories were preserved. The app revision and clean app working tree remained unchanged.
- **Verification:** source locations and displayed values inspected; rule coverage and finding references self-checked; one-file commit scope checked during delivery. No tests, mocks or Gradle runs used as UX evidence.
- **Limits:** no runtime click-through, screenshots, device widths or hosted-auth review; no claim of independent reviewer sign-off. App and backend remain read-only. Existing workspace dirty paths remain outside the report commit.
- **Resume point:** the feature owners may triage the referenced findings; implementation requires its own scoped authorization. No separate plan or project-state record was read/created/updated, per the explicit task constraints. This report is the sole durable task artifact.
