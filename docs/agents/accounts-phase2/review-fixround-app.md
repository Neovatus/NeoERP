# Review: Phase 2 app fix round (b9e799e2..0aeaf766)

Independent read-only review of `0aeaf766 fix(accounts): Phase 2 findings and route acceptance` (NeoERP-App). Gradle was not run. Paths are relative to `NeoERP-App/composeApp/src/` unless stated.

Each fix checked against the real AccountsRoute (desktop 1440 and phone 390):
- **F1:** the optional `companyName` flows from the setup DTO to the mapper, the domain model, page state, the breadcrumb (AccountsRoute.kt:743-747), the checklist, Review and SIE. A blank or missing server name keeps the context name. The backend sends it (SetupDtos.kt:153).
- **F3:** `canChooseChart` needs more than one distinct code plus replace permission. The backend `CountryChartPolicy` filters by country, with BASE only as a fallback.
- **F4:** `ReviewCode` wraps. On phone the code sits on its own full-width line. The test checks the text layout for overflow.
- **F6:** the flag no longer depends on `obDone`. The backend reports `openingBalanceEquityZero=true` before any opening balance (SetupReadTest:41).
- **F7:** the d27ae775 host environment is kept.
- **F8:** see A2.

Other checks:
- No new money arithmetic. S-1 does Int count arithmetic only, in a test.
- No sideways scroll. Only design tokens are used.
- The XFAIL masks are removed, so the finding checks are now strict.
- The J-1 and E-2..E-4 expectation changes match test-plan.md (A1 C-17 three-line J-1; Erik confirms, Sara approves).

| id | severity | file:line | finding | fix |
|---|---|---|---|---|
| A1 | MINOR | commonMain/.../accounts/presentation/home/AccountsHomeScreen.kt:365 | New screen text `" No opening-balance equity to clear."` (and the reworked `"$currency 0.00."` concatenation) is an inline literal, not a string resource. The surrounding checklist strings are older inline debt, but this round adds new text. | Move the F6 detail strings (both branches) to `Res.string` with a currency placeholder. |
| A2 | MINOR | jvmTest/.../accounts/phase2/Phase2AccountsRouteTest.kt:394-409 (`shown`) | F8 is fixed in the test harness only: the helper now scrolls nested viewports before `performScrollTo`. No product code changed. That is plausible, because ReportTable.kt:102/127 is a `LazyColumn` with `heightIn(max)` that users scroll themselves. But the findings doc lists F8 as an app defect, and nothing here proves it on a real phone. | Mark F8 in click-through-findings.md as "test harness, no product defect" and re-check R-2/R-3 by hand on a phone (390 px). |
| A3 | MINOR | commonMain/.../accounts/presentation/home/AccountsPageViewModel.kt:118,147; AccountsRoute.kt:743-747,796-798 | F1 placeholder can still show inside Accounts. Before setup loads (Loading), and in the NotEnabled, FactsMissing and failure states (setup not `Ok`), the breadcrumb and cards use the context name "Org d3300000". | Accept as interim, or have preflight/failure payloads carry the name. The real fix is A4. |
| A4 | MINOR (outside Accounts, needs ERP lead) | commonMain/.../iam/data/mapper/IamMapper.kt:49,116; iam/data/service/IamServiceImpl.kt:260; hr/data/remote/HrRemoteDataSource.kt:60 | The root cause of F1, the "Org ${id.take(8)}" fallback in IAM/session mapping, is untouched. The shell and other modules still show the placeholder. The Accounts fix is a local override, which is correct scoping for this round. | Follow-up for the ERP lead: membership/session should carry the Org display name. |
| A5 | MINOR | jvmTest/.../accounts/phase2/Phase2AccountsRouteTest.kt:213; Phase2RouteFixtures.kt:310-330 | The F5 "strict assertion" checks the test's own fixture (`Phase2Setup.taxes`), which this commit rewrote. It cannot fail because of app or backend behaviour. The real evidence is backend V22__phase2_approved_names.sql. phase2-acceptance.md presents F5 alongside the app-verified checks. | Label F5 in phase2-acceptance.md as a fixture snapshot of backend V22, or drop the `finding("F5")` wrapper. |
| A6 | MINOR | jvmTest/.../accounts/phase2/Phase2RouteFixtures.kt:162-166 | The F3 route test now gets a one-chart catalogue, so it proves "hidden when one". Nothing at route level shows that the app does not filter a multi-country list itself: it relies on backend D-172. The unit test PlannedGoLiveReviewTest covers `canChooseChart`. | No change needed if backend D-172 is the contract. Optionally keep one NO+BASE route case to show the chooser still appears when there are two options. |
| A7 | MINOR (shared file, not a defect) | NeoERP-App/docs/user-guide/tools/app-shots.json:552-569 | The shared screenshot manifest gains two Accounts entries. They are additive and Accounts-only. All other changed files are under `features/accounts`, Accounts tests, or Accounts docs. | None. Listed for ERP lead awareness only. |

**Verdict:** approved. F1, F3, F4 and F6 are correct and complete in the real Accounts route on desktop and phone, and F7 is kept. There are no BLOCKER or MAJOR issues, and the tests are stricter than before (XFAIL removed, nothing skipped).
**Open items:** F8 is a test-harness fix that needs a manual phone re-check. One new hard-coded string (A1) should move to resources. The F1 root cause in IAM (A4) needs an ERP-lead follow-up.
