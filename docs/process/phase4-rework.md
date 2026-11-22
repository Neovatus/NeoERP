# Phase 4 rework: why lanes need several review and fix rounds, and what is repeated (MEASURE-1, rework pass)

Read-only data collection, written 2026-11-22. Nothing else was changed or committed. Facts only; "unknown" where the files do not say.

## Sources and how to read this

- Review files, fix lists, builder reports and lead-decision files under `docs/agents/<topic>/` on `origin/phase/4` of NeoERP-App and NeoERP-BackEnd, plus the unmerged lane `phase/4-b2-fix-app-b2-r` (App, `docs/agents/fix-app-b2/`, read with `git show`). Workspace `.review-channel/lane-ready-*.md`, `lane-verdict-*.md`, `claims.md`, and `docs/process/phase4-lane-timing.md`.
- Lanes: the 15 merged lanes of `phase4-lane-timing.md` (Lane 0 BE, Lane 0 App, DOCS-2a, DOCS-2b, ISO-R1, R34-BE, FIX-BE, FIX-APP-A, BE-RUN-1, BE-DOCS-1, TEST-SPEED-1, TEST-SPEED-APP, BE-JDK21, R29b-1, FIX-APP-B1) plus FIX-APP-B2 part a (unmerged, verdict MERGE pending). 16 lanes in all.
- Reviewer models: Opus = Opus 5.5, Fable = Fable 5.2, Sonnet = Sonnet 5.5, as the review files state.
- One row = one distinct finding. When both reviewers of a lane found it, both are named and the higher severity is shown; a lower severity from the other reviewer is in brackets. Opus used BLOCKER/MAJOR/MINOR in Lane 0 BE and the DOCS-2 lanes; BLOCKER is shown as HIGH, MAJOR as MEDIUM (written MAJOR(=MEDIUM)).
- Every HIGH and MEDIUM finding that is in a review file is a row. LOW findings are not listed one by one: the LOWs that a fix round fixed are counted per lane in a second table with a category count (the lists are in the fix-list and builder-report files). LOWs that were not fixed are not counted. Findings that only the lead's gate run or compile run produced (no reviewer) are rows with severity "n/r".
- **The category and the "overlap" labels are my reading of the review text; the files do not carry them.** Category 8 is used for any defect in the gate scripts themselves (verify.sh, risk-check.sh, the hook, markers, review-file parsing, risk globs, self-tests of those) and for ArchUnit-style build rules of Lane 0 App; category 6 is for tenant isolation / company scope in product code and its guard tests; category 1 where the brief or an approved decision gave the builder no way to know (or the brief conflicted with a repo rule).
- "Also found by 2nd reviewer" applies to lanes with two reviewers and compares the two reviewers' findings in the round where the row first appeared: yes = the other reviewer listed the same finding (any severity), partly = a related but narrower or different finding, no = not in the other reviewer's file, n/a = single-reviewer lane or a gate-run finding.
- "Fix-caused": "fix caused it" = the finding exists because of a change made in the previous fix round (the review file says so or the cause is that change); "fix left it open" = the same hole as an earlier finding, only partly closed by the fix; "rebase caused it" = introduced when a lane was rebased onto a newer base.
- Limits of the data: the Sonnet round-1 files of BE-JDK21 and FIX-APP-B1 were overwritten by their later (round-2) files, so Sonnet's round-1 findings for those lanes are known only from the later files and the lane-ready texts. BE-RUN-1's review 1b has no file (recorded in the builder report only). BE-DOCS-1 and BE-RUN-1 review fixes were checked by the lead; no second review file exists. The App DOCS-2a gate is not stated. Review-agent runs cannot be counted exactly from files (a resumed agent writes several files, a file can be rewritten); file counts are given and, where the lane-ready or timing text lists more runs than files, that number.

## Part A: findings

### A1. Findings table (HIGH/MEDIUM and gate-run defects)

| ID | Lane | Reviewer (model) | Sev | Finding | Cat | Also found by 2nd reviewer | Round | Fix-caused |
|---|---|---|---|---|---|---|---|---|
| L0B-1 | Lane 0 BE | Opus+Fable | HIGH | Hook checks only that a marker file exists; range not bound to the push (HEAD..HEAD reads NORMAL, marker without reviews, push passes) | 8 | yes | R1 |  |
| L0B-2 | Lane 0 BE | Opus+Fable | MEDIUM | Review files with Verdict FIX, or any pair naming an ancestor, accepted by the gate | 8 | yes | R1 |  |
| L0B-3 | Lane 0 BE | Opus | MEDIUM | Money, approval and auth files (ApDocumentApprovalService, WriteOffService, RecurringRunService, many jdbc adapters) not in risk-paths | 8 | partly | R1 |  |
| L0B-4 | Lane 0 BE | Opus | MEDIUM | MoneyInvariantsTest has negative cases for only 6 of 12 invariant checks | 3 | no | R1 |  |
| L0B-5 | Lane 0 BE | Fable | MEDIUM | Risk globs read from the HEAD copy: a commit that deletes globs classifies itself NORMAL | 8 | no | R1 |  |
| L0B-6 | Lane 0 BE | Fable | MEDIUM | git diff C-quotes non-ASCII names, so anchored globs miss (V99__e.sql reads NORMAL) | 8 | no | R1 |  |
| L0B-7 | Lane 0 BE | Fable | MEDIUM | Platform-reference repositories in org/user/audit/auth have no allowlist or method rule in the tenant ratchet | 6 | partly | R1 |  |
| L0B-G1 | Lane 0 BE | gate run | n/r | verify.sh failed on 3caadc50: LibraryTierOne/ReadOnlyExempt contract tests (8 skips) missing from the skip allowlist | 8 | n/a | gate run |  |
| L0B-G2 | Lane 0 BE | gate run | n/r | verify.sh printed risk lines through sed on a range containing '/', sed error, risk lines lost | 8 | n/a | gate run |  |
| L0A-1 | Lane 0 App | Opus+Fable | HIGH | jvmTest can come from the Gradle build cache, so scans of androidMain/iosMain/jvmLocal are skipped | 8 | yes | R1 |  |
| L0A-2 | Lane 0 App | Opus+Fable | HIGH | Risk globs miss money posting/approval, auth, permission tables, module gating, platform auth config | 8 | yes | R1 |  |
| L0A-3 | Lane 0 App | Fable | HIGH | Test runner and two build scripts not risk paths; a stub gradlew gets a marker and the hook accepts it | 8 | partly | R1 |  |
| L0A-4 | Lane 0 App | Fable | HIGH | A wider verified range hides a change the push makes; hook accepts it (proven in a scratch clone) | 8 | no | R1 |  |
| L0A-5 | Lane 0 App | Opus | HIGH | Self-test assertions do nothing (set -e skips non-final && chains) | 3 | no | R1 |  |
| L0A-6 | Lane 0 App | Opus+Fable | MEDIUM | Koin boundary allows any path containing /app/di/ | 8 | yes | R1 |  |
| L0A-7 | Lane 0 App | Opus | MEDIUM | Koin reachable through a wrapper in app/di | 8 | no | R1 |  |
| L0A-8 | Lane 0 App | Fable | MEDIUM | Koin member calls (koin.getOrNull<X>()) not seen by the rule | 8 | no | R1 |  |
| L0A-9 | Lane 0 App | Opus+Fable | MEDIUM | Money-text rule bypasses (toLong/toFloat shapes, method refs, !!, aliases) | 8 | yes | R1 |  |
| L0A-10 | Lane 0 App | Opus+Fable | MEDIUM | Money float-field rule bypasses (inferred types, typealias, function types) | 8 | yes | R1 |  |
| L0A-11 | Lane 0 App | Fable | MEDIUM | Review files not tied to the pushed commit and parsed loosely | 8 | partly | R1 |  |
| L0A-12 | Lane 0 App | Fable | MEDIUM | Inputs outside the repo (KMM-Network, Gradle home) decide the result and are not recorded | 8 | no | R1 |  |
| L0A-13 | Lane 0 App | Fable | HIGH | A review written against an older base still hides a dropped fix (residual of the round-1 review-base fix) | 8 | no | R2 | fix left it open |
| L0A-G1 | Lane 0 App | lead full run | HIGH | Gradle daemon out of memory in verify: /tmp/gradle-home gradle.properties caps heap at 2 GB over the repo's 4 GB | 4 | n/a | gate run |  |
| D2A-1 | DOCS-2a | Opus | MAJOR(=MEDIUM) | User guide and dev pages describe an Automatic reversals tab that is not built | 2 | n/a | R1 |  |
| D2A-2 | DOCS-2a | Opus | MAJOR(=MEDIUM) | Owner self-approval of refunds stated without its condition (only when nobody else may approve) | 2 | n/a | R1 |  |
| D2A-3 | DOCS-2a | Opus | MAJOR(=MEDIUM) | Reverse now advised before the due date, where the app does not offer it | 2 | n/a | R1 |  |
| D2B-1 | DOCS-2b | Opus | MAJOR(=MEDIUM) | Create draft now permission described wrongly (builder called a spec difference what the code does) | 2 | n/a | R1 |  |
| RUN-1 | BE-RUN-1 | Opus | MEDIUM | Jar mode takes Java from PATH (JBR 21) while the toolchain and bootRun are Java 17; locale/CLDR data differ | 4 | n/a | R1 |  |
| RUN-2 | BE-RUN-1 | Opus | MEDIUM | spring-boot-devtools is on the bootRun classpath but not in the jar; README says 'same settings' | 1 | n/a | R1 |  |
| BD1-1 | BE-DOCS-1 | Opus | MEDIUM | go-live P-8 rewritten beyond the brief (gate moved, CI weakened); P-16 depends on it | 2 | n/a | R1 |  |
| BD1-2 | BE-DOCS-1 | Opus | MEDIUM | docout still uses ELMA as the receiver test in three places | 2 | n/a | R1 |  |
| ISO-1 | ISO-R1 | Opus+Fable | MEDIUM | Session-setting ban matches only literal setting names (constants, concatenation, BIND_SQL, quoted SET missed) | 6 | yes | R1 |  |
| ISO-2 | ISO-R1 | Opus+Fable | MEDIUM | D-13 'RLS tables but binder off' does not refuse start-up in mode OFF (brief asked every mode) | 2 | yes | R1 |  |
| ISO-3 | ISO-R1 | Opus+Fable | MEDIUM | Start-up check and autoconfig read the binder switch differently (enabled=on/yes/1) | 6 | yes | R1 |  |
| ISO-4 | ISO-R1 | Fable (Opus LOW) | MEDIUM | hr-service and payroll-service have no start-up check wired | 6 | yes | R1 |  |
| ISO-5 | ISO-R1 | Fable | MEDIUM | Bind-caller allowlist does not see method references passed to a Java functional interface | 6 | no | R1 |  |
| ISO-6 | ISO-R1 | Opus (Fable LOW) | MEDIUM | Savepoint SQL rule no longer sees multi-line raw strings (regression from the round-1 fix) | 6 | yes | R2 | fix caused it |
| R34-1 | R34-BE | Opus | MEDIUM | Item 7d raises a ratchet cap that may only go down (60 to 61); brief allowed up to 10 frozen lines, repo rule forbids | 1 | no | R1 |  |
| R34-2 | R34-BE | Fable (Opus MEDIUM) | HIGH | Groovy *.gradle files are not risk paths and Gradle prefers them over .gradle.kts | 8 | yes | R1 |  |
| R34-3 | R34-BE | Fable (Opus LOW) | HIGH | Pushed tree classifies itself: hook and verify run the branch's own risk-check.sh/pre-push | 8 | yes | R1 |  |
| R34-4 | R34-BE | Fable | HIGH | Non-ASCII alias of a risk folder (long-s, Kelvin sign) reads NORMAL but lands in the risk folder on APFS | 8 | no | R1 |  |
| R34-5 | R34-BE | Fable | MEDIUM | Service application*.properties can point Flyway at an unguarded folder | 8 | no | R1 |  |
| R34-6 | R34-BE | Fable | HIGH | verify advises installing the dispatcher from the pushed tree before the push is judged | 8 | no | R2 | fix left it open |
| R34-7 | R34-BE | Fable | HIGH | Base's hook still runs the pushed tree's risk-check.sh | 8 | no | R2 | fix left it open |
| R34-8 | R34-BE | Fable | MEDIUM | Spring config/, SQL outside db/, Kotlin migrations, packs/ seed data still NORMAL | 8 | no | R2 | fix left it open |
| R34-9 | R34-BE | Opus+Fable | MEDIUM | verify cannot write a marker when the range base is pre-R34 and it runs the old installer (bootstrap) | 8 | yes | R2/R3 | fix caused it |
| FBE-1 | FIX-BE | Opus+Fable | MEDIUM | R29: allowlisted 'inventory()' port and two company-row ports on the system list against D-18; package rule cannot tell person from machine path | 2 | yes | R1 |  |
| FBE-2 | FIX-BE | Opus (Fable LOW) | MEDIUM | NotificationDeliveryAttemptRepository serves a person read but is listed as delivery machinery | 6 | yes | R1 |  |
| FBE-3 | FIX-BE | Opus | MEDIUM | R10: NO_BRANCH also sent under a combined branch + cost-centre filter (D-16 condition) | 2 | no | R1 |  |
| FBE-4 | FIX-BE | Opus | MEDIUM | R30 b fix added a 6-character minimum with no lead decision; V76 then refuses old short reasons | 1 | partly | R2 | fix caused it |
| FBE-5 | FIX-BE | Sonnet | MEDIUM | Reason with U+0000 passes the service and PostgreSQL refuses it: 500 (lead rule: no path may store a reason the DB refuses) | 2 | no | R3 | fix caused it |
| FBE-6 | FIX-BE | Opus+Sonnet (Sonnet LOW) | MEDIUM | After rebase onto R34, R34RatchetCapRegressionTest allows 16 new names (gate weakened) | 5 | yes | rebase | rebase caused it |
| FAA-1 | FIX-APP-A | Opus+Sonnet | MEDIUM | R22: more ways out of an editor (reselect open area, breadcrumbs, journal/recurring) still drop typed work | 2 | yes | R1 |  |
| FAA-2 | FIX-APP-A | Opus+Sonnet | MEDIUM | Grid 'not taken' reason moved into a tooltip, against the approved spec (accounts-a1.md:216), desktop too | 2 | yes | R1 |  |
| FAA-3 | FIX-APP-A | Opus | MEDIUM | Disabled primary's reason unreachable by keyboard or screen reader under short-height rules | 2 | no | R1 |  |
| FAA-4 | FIX-APP-A | Opus+Sonnet | MEDIUM | Leave during a running save cancels the save / no question (Sonnet had it as LOW in round 1) | 9 | yes | R2 | fix caused it |
| FAA-5 | FIX-APP-A | Opus (Sonnet LOW) | MEDIUM | On desktop the disabled primary became an invisible Tab stop | 5 | yes | R2 | fix caused it |
| TS1-1 | TEST-SPEED-1 | Opus+Fable | HIGH | Test-read docs files (accounts-document-math.json, country-region-profiles.json, tenant-binder.md) classify as light | 1 | yes | R1 |  |
| TS1-2 | TEST-SPEED-1 | Opus+Fable | MEDIUM | Nothing requires the base to have passed a full verify; light pushes stack on untested tips | 1 | yes | R1 |  |
| TS1-3 | TEST-SPEED-1 | Fable (Opus LOW) | MEDIUM | 17 tests run only in tmpdirTest; test floor 4200 vs 4320 would not notice broken wiring | 3 | partly | R1 |  |
| TSA-1 | TEST-SPEED-APP | Fable | MEDIUM | Light marker written as <sha>.ok, so a pre-lane hook treats it as a full marker (BE and App built different marker designs) | 1 | no | R1 |  |
| TSA-2 | TEST-SPEED-APP | Fable (Opus LOW newline) | MEDIUM | light-check has no non-ASCII or file-mode rule (APFS alias docs/de-long-s-ign/ reads LIGHT) | 8 | partly | R1 |  |
| TSA-3 | TEST-SPEED-APP | Fable+Opus (Opus LOW) | MEDIUM | Light gate trusts the remote tip (no full marker on an ancestor) | 1 | yes | R1 |  |
| J21-1 | BE-JDK21 | Opus+Sonnet | MEDIUM | No floor on the Java 21 update; currency/time-zone data differ by update (claim measured on one Mac) | 4 | yes | R1 |  |
| R29-1 | R29b-1 | Opus+Fable | MEDIUM | Platform-write audit events of provision and fiscal-facts edit have no test | 3 | yes | R1 |  |
| R29-2 | R29b-1 | Opus | MEDIUM | Old-FAIL proof never run for reach changes (brief asks for it on base) | 2 | no | R1 |  |
| R29-3 | R29b-1 | Fable | MEDIUM | OrgScopeResolver is an open minting API; no rule pins its callers | 6 | no | R1 |  |
| R29-4 | R29b-1 | Fable (Opus LOW) | MEDIUM | 'null = every company' survives in public adapter helpers | 6 | yes | R1 |  |
| R29-5 | R29b-1 | Fable | MEDIUM | Platform-wide reads minted in org with the caller's own check (owner decision) | 6 | no | R1 |  |
| R29-6 | R29b-1 | Fable | MEDIUM | Two unscanned ports (CompanyEnrollmentRollback, EntitlementChangeLog) hold company rows | 6 | no | R1 |  |
| R29-7 | R29b-1 | Fable | MEDIUM | Pin gap opened by the L4 fix: sweeper's system scopes reachable from every class | 6 | no | fix check | fix caused it |
| B1-1 | FIX-APP-B1 | Opus | MEDIUM | Keyboard height read in composition on every touch field: recomposition each frame of the iOS keyboard animation | 4 | no | R1 |  |
| B1-2 | FIX-APP-B1 | Opus | MEDIUM | Write-off sheet is not a side panel; fix and test do not reach it although the report says covered | 2 | no | R1 |  |
| B1-G1 | FIX-APP-B1 | compile run | n/r | Android compile failed, 3 errors (2 from 19 Nov, 1 from F10) in the shell drawer DialogProperties | 4 | n/a | fix round |  |
| B2-1 | FIX-APP-B2 (unmerged) | Opus | MEDIUM | Automatic reversals tab loses its filters when a row's journal opens (comment, dev page and S3 say the opposite) | 9 | no | R1 |  |
| B2-2 | FIX-APP-B2 (unmerged) | Opus | MEDIUM | S3 steps and user guide expect a row the filter hides | 9 | no | R1 |  |
| B2-3 | FIX-APP-B2 (unmerged) | Sonnet | MEDIUM | Due from/Due to cannot be typed by keyboard: editing a date wipes it, a read per keystroke | 9 | no | R1 |  |
| B2-4 | FIX-APP-B2 (unmerged) | Sonnet | MEDIUM | Text-only date change drops an in-flight read; list stays dimmed (Opus fix check had ACCEPTed the same code) | 9 | no | fix check | fix caused it |

### A2. Counts per category

Total rows 78 (75 HIGH/MEDIUM, 3 gate-run or compile-run defects), plus 123 LOW findings that a fix round fixed. Severity of the 75: 14 HIGH, 61 MEDIUM (including 4 MAJOR(=MEDIUM)).

| Category | HIGH/MEDIUM rows | Gate/compile-run defects (no severity) | LOW fixed | Total |
|---|---|---|---|---|
| 1 brief/spec unclear or silent | 7 | 0 | 1 | 8 |
| 2 builder missed what brief/spec said | 15 | 0 | 17 | 32 |
| 3 missing or weak test | 4 | 0 | 13 | 17 |
| 4 platform/build | 4 | 1 | 3 | 8 |
| 5 regression in existing behaviour | 2 | 0 | 3 | 5 |
| 6 security/company-scope gap | 12 | 0 | 19 | 31 |
| 7 money/number/locale formatting | 0 | 0 | 0 | 0 |
| 8 gate format/process | 26 | 2 | 32 | 60 |
| 9 other | 5 | 0 | 35 | 40 |
| **Total** | **75** | **3** | **123** | **201** |

Category 7 (money/number/locale formatting) has no row: the amount and locale findings that were raised (BE-JDK21 locale data, FIX-APP-B1 Amount font) are in categories 4 and 1/3. Gate-script defects (category 8) are 28 of the 78 rows and 32 of the 123 fixed LOWs; they sit in the five lanes whose deliverable was a gate (Lane 0 BE, Lane 0 App, R34-BE, TEST-SPEED-1, TEST-SPEED-APP): those five lanes hold 36 of the 75 HIGH/MEDIUM rows, 26 of them category 8.

### A3. Counts per lane

| Lane | HIGH | MEDIUM | no severity (gate/compile run) | LOW fixed | Categories of the HIGH/MEDIUM rows (category: rows) |
|---|---|---|---|---|---|
| Lane 0 BE | 1 | 6 | 2 | 7 | 3: 1, 6: 1, 8: 5 |
| Lane 0 App | 7 | 7 | 0 | 9 | 3: 1, 4: 1, 8: 12 |
| DOCS-2a | 0 | 3 | 0 | 9 | 2: 3 |
| DOCS-2b | 0 | 1 | 0 | 1 | 2: 1 |
| BE-RUN-1 | 0 | 2 | 0 | 5 | 1: 1, 4: 1 |
| BE-DOCS-1 | 0 | 2 | 0 | 5 | 2: 2 |
| ISO-R1 | 0 | 6 | 0 | 9 | 2: 1, 6: 5 |
| R34-BE | 5 | 4 | 0 | 10 | 1: 1, 8: 8 |
| FIX-BE | 0 | 6 | 0 | 7 | 1: 1, 2: 3, 5: 1, 6: 1 |
| FIX-APP-A | 0 | 5 | 0 | 13 | 2: 3, 5: 1, 9: 1 |
| TEST-SPEED-1 | 1 | 2 | 0 | 5 | 1: 2, 3: 1 |
| TEST-SPEED-APP | 0 | 3 | 0 | 7 | 1: 2, 8: 1 |
| BE-JDK21 | 0 | 1 | 0 | 5 | 4: 1 |
| R29b-1 | 0 | 7 | 0 | 13 | 2: 1, 3: 1, 6: 5 |
| FIX-APP-B1 | 0 | 2 | 1 | 2 | 2: 1, 4: 1 |
| FIX-APP-B2 (unmerged) | 0 | 4 | 0 | 16 | 9: 4 |
| **Total** | **14** | **61** | **3** | **123** | |

### A4. LOW findings fixed in a fix round (per lane)

Categories here are assigned per LOW by me; where one LOW was found by both reviewers it is counted once.

| Lane | LOW fixed | Categories (category: n) | Source / note |
|---|---|---|---|
| Lane 0 BE | 7 | 3: 1, 6: 1, 8: 3, 9: 2 | Opus MINOR 3 + Fable LOW 4, all fixed in round 2 |
| Lane 0 App | 9 | 8: 8, 9: 1 | fix-list R1-13..R1-21; 6 more LOW rows not fixed (R1-21b..R1-24, R1-14b, R1-01b) |
| DOCS-2a | 9 | 2: 8, 9: 1 | 9 MINOR, all fixed in round 2 |
| DOCS-2b | 1 | 2: 1 | 1 MINOR (stale README slice table) |
| BE-RUN-1 | 5 | 9: 5 | 5 LOW fixed by lead decisions (1b ACCEPT) |
| BE-DOCS-1 | 5 | 2: 4, 9: 1 | of 8 LOW: 5 fixed or dropped, 3 kept/skipped |
| ISO-R1 | 9 | 5: 1, 6: 6, 9: 2 | 7 in round 1 (F6-F11, F13) + 2 in round 3 (F18, F19); 4 not fixed (F12, F16, F20, F21) |
| R34-BE | 10 | 4: 1, 8: 9 | R1-06..R1-11 (6), R2-04, R2-05, R3-02, R3-04; 5 not fixed (R1-12..R1-16) |
| FIX-BE | 7 | 2: 2, 6: 2, 9: 3 | Opus L1-L6 fixed in round 2 + the regression LOW (N2) |
| FIX-APP-A | 13 | 3: 3, 5: 2, 8: 2, 9: 6 | distinct LOW rows addressed per builder-report (Opus 10 + Sonnet 5 found, overlapping; R05/R06 not fixed) |
| TEST-SPEED-1 | 5 | 3: 2, 8: 3 | Opus 3,4,6 and Fable A4,A5,A6,A7 (overlapping); Opus #5 left for a fix-lane row |
| TEST-SPEED-APP | 7 | 1: 1, 3: 2, 8: 4 | Opus 2,3,5 and Fable B4,B5,B7,B8,B9 (overlapping); Opus 1, 4, 6 and Fable B6 left to lead or info |
| BE-JDK21 | 5 | 3: 1, 4: 2, 8: 2 | Opus 2-5 + Sonnet 1; Opus 6 and Sonnet 3, 4 left out by decision |
| R29b-1 | 13 | 3: 1, 6: 10, 8: 1, 9: 1 | Opus L3-L8 and Fable L1-L8 (overlapping) + 2 fix-check LOWs; Fable L9 accepted unchanged |
| FIX-APP-B1 | 2 | 3: 1, 9: 1 | Opus #5 and #6 fixed; #3 (Jabran decision) and #4 (Android QA) left open |
| FIX-APP-B2 (unmerged) | 16 | 2: 2, 3: 2, 9: 12 | Opus L3-L10 (8) + Sonnet 2-8 (8 incl. 7a/7b); one new LOW (N2) left to part b |

### A5. Reviewer overlap (first-round HIGH/MEDIUM rows, lanes with two reviewers)

| Lane | first-round rows | found by both | partly | by one only |
|---|---|---|---|---|
| Lane 0 BE | 7 | 2 | 2 | 3 |
| Lane 0 App | 12 | 5 | 2 | 5 |
| ISO-R1 | 5 | 4 | 0 | 1 |
| R34-BE | 5 | 2 | 0 | 3 |
| FIX-BE | 3 | 2 | 0 | 1 |
| FIX-APP-A | 3 | 2 | 0 | 1 |
| TEST-SPEED-1 | 3 | 2 | 1 | 0 |
| TEST-SPEED-APP | 3 | 1 | 1 | 1 |
| BE-JDK21 | 1 | 1 | 0 | 0 |
| R29b-1 | 6 | 2 | 0 | 4 |
| FIX-APP-B1 | 2 | 0 | 0 | 2 |
| FIX-APP-B2 (unmerged) | 3 | 0 | 0 | 3 |
| **All 12 lanes** | **53** | **23 (43%)** | **6 (11%)** | **24 (45%)** |
| 11 merged lanes only | 50 | 23 (46%) | 6 (12%) | 21 (42%) |

- Counting every HIGH/MEDIUM row in these 12 lanes (all rounds, 67 rows): 28 found by both (42%), 7 partly, 31 by one reviewer only, 1 not applicable (a compile-run row).
- DOCS-2a, DOCS-2b, BE-RUN-1 and BE-DOCS-1 had one reviewer by design (docs and dev-script lanes): no overlap figure.
- First-round verdicts differed in 3 of the 12 lanes: TEST-SPEED-APP (Opus ACCEPT with 6 LOW; Fable FIX with 3 MEDIUM), BE-JDK21 (Opus FIX with 1 MEDIUM; Sonnet ACCEPT), FIX-APP-B1 (Opus FIX with 2 MEDIUM; Sonnet ACCEPT). In the other 9 both said FIX. In all 12 lanes at least one reviewer said FIX in round 1.
- Later rounds in which the two reviewers' verdicts differed: 7 (Lane 0 App round 2, ISO-R1 round 2, FIX-BE round 2, FIX-BE round 3, FIX-BE rebase, R29b-1 fix check, FIX-APP-B2 fix check). In each of the 7 the FIX came from one reviewer alone. In 4 of them one reviewer's ACCEPT covered the same fix diff in which the other found a MEDIUM or HIGH: Lane 0 App round 2 (L0A-13, Fable; Opus ACCEPT), FIX-BE round 3 (FBE-5, Sonnet; Opus 1c ACCEPT), R29b-1 fix check (R29-7, Fable; Opus wrote "no other new hole"), FIX-APP-B2 fix check (B2-4, Sonnet; Opus wrote the fixes "add no new problem").
- R34-BE: the Opus round-2 file (which held the bootstrap MEDIUM, R34-9) is dated about 38 min after Fable's round-2 file (11:58 and 11:20 in the timing doc). The round-2 fixes were made from Fable's file alone (fix list: "The Opus round-2 file had not arrived; nothing in it was acted on"). Fable then found the same MEDIUM in round 3.

### A6. Did a fix round introduce a new finding?

HIGH/MEDIUM rows where the previous fix round (or a rebase) caused the finding, or left the earlier hole open:

| Row | Lane | What |
|---|---|---|
| ISO-6 | ISO-R1 | savepoint rule lost multi-line raw strings (MEDIUM, regression of the round-1 F9 fix) |
| R34-9 | R34-BE | round-2 fix made verify run the range base's old installer; no marker for a pre-R34 base (MEDIUM; found by Opus and by Fable) |
| FBE-4 | FIX-BE | round-2 reason rule added a 6-character minimum no decision covered (MEDIUM) |
| FBE-5 | FIX-BE | rewritten reason rule let U+0000 through, PostgreSQL refused it: 500 (MEDIUM) |
| FAA-4 | FIX-APP-A | R22 fix: leaving during a running save cancelled the save (MEDIUM) |
| FAA-5 | FIX-APP-A | footer fix: disabled primary became an invisible desktop Tab stop (MEDIUM) |
| R29-7 | R29b-1 | L4 fix left a pin gap: sweeper's system scopes reachable from every class (MEDIUM) |
| B2-4 | FIX-APP-B2 | M1 fix: a text-only date change dropped an in-flight read, list stayed dimmed (MEDIUM) |
| FBE-6 | FIX-BE | rebase onto R34-BE weakened `R34RatchetCapRegressionTest` (MEDIUM, rebase-caused) |
| L0A-13 | Lane 0 App | fix of the review-base hole left a HIGH (a review against an older base still hid a dropped fix): fix left it open |
| R34-6, R34-7 | R34-BE | round-1 design still let the pushed tree judge itself in two places (2 HIGH): fix left it open |
| R34-8 | R34-BE | config-path hole stayed open through `config/`, SQL outside `db/`, Kotlin migrations (MEDIUM): fix left it open |

- Count: 8 HIGH/MEDIUM rows caused by a fix, 1 by a rebase, 4 left open by a fix = 13 of 75 HIGH/MEDIUM rows (17%), in 7 of the 16 lanes (Lane 0 App, ISO-R1, R34-BE, FIX-BE, FIX-APP-A, R29b-1, FIX-APP-B2).
- LOW findings caused or left open by a fix: Lane 0 App round 3 (2: a file name starting with `:` read as pathspec magic; a glob removed inside the reviewed part), Lane 0 BE round 3 (1: allowlist reason texts named the wrong cases, flagged by both reviewers), ISO-R1 (1 consequence noted: hr/payroll now refuse to start outside local/test; 2 more left open by the F1 fix, fixed in round 3: case-sensitive setting names, `SET $NAME`), FIX-BE (1: raw-length check removed, found by Opus and by Fable), BE-JDK21 (2: plain `./gradlew` on a JBR 21.0.7 Gradle home fails the new floor; a second copy of the floor value), R29b-1 (1: audit INSERT deferred, residual of the L5 fix), FIX-APP-B2 (1: a refused delete hides Delete draft; left to part b).
- FIX-verdict review rounds counted from the review files: 26 (Lane 0 BE 1, Lane 0 App 2, DOCS-2a 1, DOCS-2b 1, ISO-R1 2, R34-BE 3, FIX-BE 4, FIX-APP-A 2, BE-RUN-1 1, BE-DOCS-1 1, TEST-SPEED-1 1, TEST-SPEED-APP 1, BE-JDK21 1, R29b-1 2, FIX-APP-B1 1, FIX-APP-B2 2). 10 of them exist because the previous fix round caused or left open a HIGH/MEDIUM (R34-BE 2, FIX-BE 3, ISO-R1 1, Lane 0 App 1, FIX-APP-A 1, R29b-1 1, FIX-APP-B2 1).

## Part B: repeated work per lane

### B1. Full gate runs, modules, review runs

BackEnd `verify.sh` always runs all 16 modules (architecture-tests, 8 services, 7 shared). The only per-module table in the files (Lane 0 BE, 4222 tests) shows accounts-service alone at 2126 tests (50%). The App has one test module (composeApp), so each App run covers the whole `jvmTest` plus the iOS compile.

| Lane | Full gate runs (stated) | Why each extra run happened | BE: modules the lane's code touched / modules run | Review files (first + later = total; runs if different) | Review of code unchanged since an earlier ACCEPT |
|---|---|---|---|---|---|
| Lane 0 BE | 3: old `./gradlew test` 2347 s; verify.sh on 3caadc50 FAILED (time unknown); verify.sh OK on 5e00b131 2288 s | old-vs-verify comparison asked by Jabran (trust check); verify.sh failed on 2 script defects (L0B-G1, L0B-G2), fixed and reviewed again (round 3) | 2 of 16 (architecture-tests; one accounts test file) / 16 | 2 + 5 = 7 | The final pair at fbcb8d99 restates the whole lane (`Range e36b6c6a..fbcb8d99`) after the round-2 checks; reviewers re-ran the same architecture, invariant and risk-check tests (Opus at 861a85a3 and again at fbcb8d99). Whether unchanged code was re-read: unknown |
| Lane 0 App | 4: old jvmTest 2187 s; verify FAILED on Gradle daemon memory (time unknown); verify passed with no marker 2263 s (hook not installed); verify with marker after install (verdict step 2; claims line: verify OK 3862/0/1; time unknown) | comparison with the old command; OOM (L0A-G1); hook not yet installed in the clone; marker run | n/a (one App module) | 2 + 6 = 8 | Round 4 (heap fix) read only the new diff (601e85b1..5414d4bb). No re-read of unchanged code stated |
| DOCS-2a | none stated | docs only; the App hook was installed later (merge 05:16, hook installed in the Lane 0 App merge at 10:08) | n/a | 1 + 1 = 2 | no |
| DOCS-2b | 1: verify OK 4222/0/59 at the first hook push (time unknown) | marker needed for a docs-only range | 0 of 16 / 16 | 1 + 1 = 2 | no |
| ISO-R1 | 1: 2982 s | none | 6 of 16 (tenant-security, domain-events, hr, payroll, accounts, architecture-tests) / 16 | 2 + 4 = 6 | round 3 read only `47ae6eef..21d83756` |
| R34-BE | 1: 2402 s (bootstrap from a pre-R34 base) | none | 1 of 16 (architecture-tests) plus gate scripts / 16 | 2 + 7 = 9 (5 fix checks, 2 rebase checks) | rebase onto ISO-R1: `range-diff` 30 of 32 commits identical; both reviewers confirmed again (1d, 2e) |
| FIX-BE | 1: 54 min (on the rebased head) | none | 2 of 16 (accounts-service 51 files, architecture-tests) / 16 | 2 + 9 = 11 (5 fix checks, 2 rebase checks, 2 checks of the rebase fix) | rebase onto R34-BE: `range-diff` 29 of 30 commits identical; Opus and Sonnet each re-read the conflict files; two more reviewer runs (1e, 2f) for the one-line fix |
| FIX-APP-A | 1: 36 min | none (simulator checks S1-S4 left open) | n/a | 2 + 4 = 6 | no (round 3 limited to the N1-N4 diffs) |
| BE-RUN-1 | 2 attempts, neither completed: first failed on the flaky `SupplierBankEventsTest`, second stopped by the lead; then none of its own (covered by TEST-SPEED-1's run) | flaky test; stopped run; rode on the next full run | 0 of 16 | 1 file (+ review 1b without a file) = 2 runs | looked at again in TEST-SPEED-1 (see that row) |
| BE-DOCS-1 | none own (rides on TEST-SPEED-1's run) | docs-only range needs a marker; avoided its own 54 min run | 0 of 16 | 1 | same |
| TEST-SPEED-1 | 1: 11 min wall (certifies BE-RUN-1, BE-DOCS-1 and itself) | none | 1 of 16 (accounts-service build file and 4 tests) plus gate scripts / 16 | 2 + 2 = 4 files (Fable's round-1 file is the same file as in the App lane) | yes: Fable review 3 "Part 1" and Opus review 3 "(c)" looked at `a50eabbb..32b07dac` (BE-RUN-1 script diff, BE-DOCS-1 docs), already ACCEPTed by Opus 1b (BE-RUN-1) and checked by the lead (BE-DOCS-1); Opus: "not a line-by-line review of the BE-DOCS-1 prose" |
| TEST-SPEED-APP | 1: about 11 min run, 22 min wall (waited for the BackEnd gate on the Gradle lock) | none | n/a | 2 + 2 = 4 files | no |
| BE-JDK21 | 1: 10 min | none | build files of all 16 modules plus org-service main code / 16 | 3 files; 5 runs (Opus and Sonnet round 1, Opus round 3, final files Opus and Sonnet) | rebase onto the TEST-SPEED-1 fixes: `range-diff` 12 of 12 commits `=`; both reviewers say they did not re-read the build commits |
| R29b-1 | 1: 12 min (Docker up) | none | 2 of 16 (org-service 112 files, architecture-tests) / 16 | 2 + 5 = 7 | no (fix checks limited to the fix range) |
| FIX-APP-B1 | 1: 8 min | none | n/a | 3 files; 5 runs (Opus and Sonnet round 1, Opus round 3, final files Opus and Sonnet) | rebase check: `range-diff` 19 of 19 commits `=` |
| FIX-APP-B2 (unmerged) | 2: 11 min, tests passed but no marker (`--reviews` not passed); 9 min OK | missing `--reviews` argument | n/a | 2 + 5 = 7 | no |

Totals. Stated full runs: 19 in the 15 merged lanes (Lane 0 BE 3, Lane 0 App 4, DOCS-2b 1, ISO-R1 1, R34-BE 1, FIX-BE 1, FIX-APP-A 1, BE-RUN-1 2 unfinished attempts, TEST-SPEED-1 1, TEST-SPEED-APP 1, BE-JDK21 1, R29b-1 1, FIX-APP-B1 1), 21 with FIX-APP-B2. Beyond one run per lane: 7 in the merged lanes (Lane 0 BE +2, Lane 0 App +3, BE-RUN-1 +2 unfinished) and +1 in FIX-APP-B2. BackEnd lanes with a completed full run: 8 (Lane 0 BE, DOCS-2b, ISO-R1, R34-BE, FIX-BE, TEST-SPEED-1, BE-JDK21, R29b-1); 7 of them (all but BE-JDK21) touched 0 to 6 of the 16 modules and ran 16. Review files: 74 in the 15 merged lanes, 81 with FIX-APP-B2; at least 79 and 86 review runs respectively (BE-RUN-1 1b, and the BE-JDK21 and FIX-APP-B1 final-file runs, have no separate file).

### B2. Facts on review passes and repeated test runs

- First reviews: 26 files in the merged lanes (25 distinct agent runs, because one Fable run read both TEST-SPEED lanes) and 2 in FIX-APP-B2. Rebase checks: 6 files (R34-BE 2, FIX-BE 4).
- A separate "final gate review files ... written by the reviewers" commit follows the last ACCEPT in TEST-SPEED-1 (02:37 to 02:55), TEST-SPEED-APP (02:37 to 02:56), BE-JDK21 (02:29 to 03:32), FIX-APP-B1 (02:10 to 03:42) and R29b-1 (04:16 to 04:17). FIX-APP-B2 has two one-paragraph final files that restate earlier results. Lane 0 BE and Lane 0 App had final pairs that are also their last fix-check pair. Whether these were new agent runs or resumed ones: unknown. The new-Mac timing notes give 0.7 min (Opus) and 2.2 min (Fable) for the R29b-1 final files, 3.7 min total for the FIX-APP-B2 Opus fix check plus final file and about 1.6 min for the Sonnet fix checks plus final file.
- Reviewers re-ran tests inside review rounds (not counted as gate runs). Examples stated in the files: Lane 0 BE Opus round 1 (architecture-tests 44, MoneyInvariantsTest, risk-check-test, money-invariants.sh on the seeded stack) and again at fbcb8d99 (47/0/0, 8 tests, 25 cases); FIX-APP-A Opus 1b 99 tests and 1c 77 tests (Phase2AccountsRouteTest 53 in both); R29b-1 Opus 70 + 490 tests in round 1 and 75 + 219 in the fix check; FIX-APP-B1 Opus 24 tests and Sonnet three classes (2 min 57 s); BE-JDK21 Opus and Sonnet targeted org-service runs in rounds 1 and 2. A complete count per lane: unknown (the files do not always say).

## The 5 biggest causes of repeated rounds or runs (facts only)

1. **Defects in the gate scripts themselves.** 36 of the 75 HIGH/MEDIUM rows (48%) are in the five lanes whose deliverable is a gate (Lane 0 BE, Lane 0 App, R34-BE, TEST-SPEED-1, TEST-SPEED-APP), and 26 of those 36 are category 8; 28 of all 78 rows are category 8, plus 32 of the 123 fixed LOWs. R34-BE needed 3 FIX rounds and 9 review files for 9 HIGH/MEDIUM rows (5 HIGH); Lane 0 App needed 4 rounds and 8 review files for 14 HIGH/MEDIUM rows (7 HIGH, one found by the lead's full run). The lead's gate and compile runs found 4 defects no reviewer had found: 2 verify.sh defects (Lane 0 BE), the verify heap setting (Lane 0 App), an Android compile failure (FIX-APP-B1).
2. **The two reviewers find different things.** In the 12 lanes with two reviewers, 24 of the 53 first-round HIGH/MEDIUM rows (45%) were found by one reviewer only and 23 (43%) by both. First-round verdicts differed in 3 lanes (TEST-SPEED-APP, BE-JDK21, FIX-APP-B1), each time one reviewer's FIX added a fix round. In 4 fix-check rounds one reviewer's ACCEPT covered a diff in which the other found a MEDIUM or HIGH.
3. **Fix rounds that cause or leave open a problem.** 13 of 75 HIGH/MEDIUM rows (8 caused by a fix, 4 left open, 1 by a rebase); 10 of the 26 FIX-verdict rounds exist for that reason (FIX-BE 3, R34-BE 2, one each in ISO-R1, Lane 0 App, FIX-APP-A, R29b-1, FIX-APP-B2). FIX-BE had a fix-caused MEDIUM in rounds 2 and 3 and a rebase-caused MEDIUM.
4. **Brief or spec silent, in conflict, or not followed.** Categories 1 and 2 are 22 of the 75 HIGH/MEDIUM rows (7 + 15) and 18 of the 123 fixed LOWs. Category 1: the TEST-SPEED brief put `docs/**` on the light list while tests read three docs files (HIGH); R34 brief item 7d allowed freezing up to 10 lines while R29 says the ratchet may only shrink (MEDIUM); FIX-BE round 2 added a 6-character minimum no decision covered; the two TEST-SPEED builders built different marker designs (2 MEDIUM rows). Category 2: the three docs lanes (DOCS-2a, DOCS-2b, BE-DOCS-1) account for 6 of the 15 rows and 13 of the 17 LOWs, where the brief said to describe the code and the pages described unbuilt screens or changed things beyond the brief; FIX-BE, FIX-APP-A and ISO-R1 rows against approved conditions (D-13, D-16, D-18, D-22).
5. **Repeated full gate runs and the separate final-file step.** 7 extra full runs in 3 merged lanes (Lane 0 App OOM and no-hook runs, Lane 0 BE verify defects, BE-RUN-1's flaky and stopped attempts) plus 1 in FIX-APP-B2 (missing `--reviews`, 11 min). Docs-only lanes needed a full BackEnd run for the marker: between the last commit and the verdict DOCS-2a waited 3.4 h, DOCS-2b 3.4 h, BE-RUN-1 2.0 h, BE-DOCS-1 1.4 h (verdicts partly written as a batch), and BE-RUN-1 and BE-DOCS-1 then waited 3.2 and 3.4 h from verdict to the TEST-SPEED-1 merge. Every BackEnd full run covers 16 modules while the lane code touched 0 to 6 (R34-BE 1, FIX-BE 2, R29b-1 2) and accounts-service is about half of the tests. Five lanes (TEST-SPEED-1, TEST-SPEED-APP, BE-JDK21, FIX-APP-B1, R29b-1) had a separate final-file step of 1 to 92 min after the last ACCEPT.
