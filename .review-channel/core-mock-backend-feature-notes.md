# core/mock-backend: feature notes for the feature review (flow lead, 2026-11-25)

Feature heads: App `core/mock-backend/feature` = `33cd72f5`, BackEnd `core/mock-backend/feature` = `3d3414c`. Flows merged: 1 `data-source` (App), 2 `be-examples` (BE), 3 `move-areas` (App), 4 `be-examples-2` (BE), 5A `move-areas-2` (App). On hold (Jabran deciding "now" or "when touched"): `be-examples-3` (BE, 7 gaps), 5B `move-areas-3` (journals persona scripts), 5C `move-areas-4` (ScriptedJournals files).
Per-flow records: `docs/agents/mock-backend/` in each repo (brief, plan, hand-back incl. fix rounds, review, fix brief). Measures: `.review-channel/v2-trial-measures.md` (5 rows).

## What the feature delivers
- **App mock data source** (test-only, no production change): `MockDataSource` implements `NeoErpNetworkRuntime` and is handed to the real `*Api` classes → real repositories, mappers, strict decoding, error mapping, ViewModels, screens. Mirrors every runtime method (get/post/put/patch/delete/answer; stream/upload recorded as unmatched). Developer page: App `docs/operations/mock-data-source.md`.
- **Strict checks**: unknown path/method; missing or other company (403 for a non-member); body keys and values as the BE readers check (UUIDs, dates, money as strings, ranges, band/step counts, ROLE/PERSON ids, path params); malformed `Idempotency-Key`; a scenario not set. `MockBackendRule` fails any test with an unmatched request; a scan test fails a test file that builds a mock without it.
- **Server answers only from BE examples**: BE publishes `docs/api/fixtures/app/accounts/{approval-limits,journals,strict}/` (≈170 files + `index.json` + README), each proven by a BE test against the real endpoint: exact JSON (null ≠ missing), one id and one name per named thing across all files and services, exact times (2 named exemptions), every index row proven compared, a second company with no shared ids, and **only state reachable by real paths** (every SQL/rig input listed in the README). The App copies them byte for byte; `SOURCES.md` records BE sha, path and blob id, and a test checks every blob (171 rows at BE `3d3414c`).
- **App-only** answers only where the server can't produce them, marked `simulated`: network failure / lost answer, gateway 503 (json, html, no body), unknown future enum (derived from a copy).
- **Rules in the dev page**: new UI tests use the mock data source, not a repository mock; no copy is hand-edited; a refusal may be paired with another record's page only if the pair is reachable.

## What's covered (App tests on the real data layer + copies)
- **Approval limits**: 54 → 60 tests (by `@Test`, no name lost): limits/check/proposals/propose/confirm/decline/withdraw/acknowledge-alone/history/owner-self on the copies; the Phase 4 `null` proof (pre-fix DTO from `ebd50e43` reverted → 2/3 fail; restored → pass); phone/tablet propose and confirm flows; contract tests for C1–C5; wording tests.
- **Journals**: 30 → 36 tests by name: contract and refusal tests, create → save → reopen → change → save and submit-unbalanced at phone and tablet (lines checked on reopen, Submit clicked), C5b (post VERSION_CONFLICT), C6–C8, ALREADY_POSTED and version races on their own records.
- **Mock infra self-tests**: runtime parity, value checks, edges, routes reach every real App call, provenance, simulated answers.

## What stays on repository mocks, and why
- **`MockApprovalLimitsRepository`** (class kept): Local dev DI (`NeoAppDi.kt:192-194`, `useMockData`); `ApprovalLimitsStateTest.ownerAloneOpensTheAloneDialogAndSendsTheTick` (waits on GA3b) plus its pure and stand-in tests via `ScriptedLimits`.
- **`MockJournalsRepository`** (class kept): Local dev DI (`NeoAppDi.kt:351-353`); `ScriptedJournals`' default delegate (42 files, ~367 tests: ~57 would move, ~9 split, ~171 hand-built placeholders that never assert the Local mock, ~126 other areas → 5C); the journals persona scripts (5B: long scripts over Local-mock personas, the copies answer ~1/5 of their assertions); tests tagged "Waits on BE gap GJ14" (`versionConflictShowsSecondLine`, `alreadyPostedFromTheEditor…`); company-switch tests ×8 (need a second-company mock answer, 5B); other areas (receivables `DeleteDraftFromEditorTest`, SIE `SieHostFx`/`SieResultFx`, reports company-switch/two-company/parallel/refetch tests).
- **`MockApprovalStandInsRepository`**: stand-ins area, out of scope.
- Every kept user is listed by file in App `docs/agents/mock-backend/handback-move-areas-2.md` §Repository mocks and flow 3's plan §7.

## The 7 open BE gaps (for `be-examples-3`)
| # | Example needed | Waiting App test(s) |
|---|---|---|
| GA1b | limits after the owner switch (new pending proposals with the `ownerOwnAllowed` departure) | owner-switch departure on the page (words covered by the propose copies) |
| GA3b | a limits copy whose pending proposal is `…b1701` (`proposal/200-alone`) | `ownerAloneOpensTheAloneDialogAndSendsTheTick` |
| GA5b | limits after `…b0103` is confirmed (no pending proposal) | the `tookEffect` → Confirmed path |
| GJ11 | a draft detail in a closed or locked month, only if reachable | period notice on a draft |
| GJ12 | delete `409-VERSION_CONFLICT` | delete-draft race |
| GJ13 | a posted journal's detail with a live automatic reversal and `cancelAutoReversal` allowed (`…e0601` / `…e0602` before the cancel) | cancel auto-reversal from the screen |
| GJ14 | detail copies of the race journals `…e0501`, `…e0502` and the voucher/unbalanced-refused ones (`…e0005`, `…e0006`, `…e0801`–`…e0803`) before their refusal | `versionConflictShowsSecondLine`, `alreadyPostedFromTheEditor…`, page-level refusal words |

## For the feature end (Jabran's calls, not done by any flow)
- `KNOWN_FILES` pins (BE): accounts-service `support/examples/ContractExamples.kt` `bd96b702932828a42dbaafef0efb3235ddae3bd9`; user-service `support/ContractExamples.kt` `3963ce05…` (full row in BE `handback-be-examples.md`).
- `verify-test-floor.txt` (App): rows for the 5 new test classes of flow 3 (listed in App `handback-move-areas.md`); none from 5A.
- Gate check that App copies match BE files (ADR-027 Q6): not built; the App blob test checks copies against the recorded BE blobs, not against the current BE head.
- DoD line for `docs/templates/brief.md` (App), proposed in flow 1 report B.

## Backlog rows written (workspace `docs/backlog.md`)
Mock data source LOWs (unused `inOrder` answers, one company per mock, simulated failures' text); Security "end session" reads a timeout as success (PLAUSIBLE); BE fixtures not a Gradle test input (gate unaffected); `approval.periodNotice` in the contract but never set or read.

## Lessons (for the phase review)
- Brief gaps found: BE-examples rule came after the start; key-only strict checks; runtime methods not named; ids across services; exact times; reachable-state rule; cross-record pairs; C5b endpoint scope; test counts overestimated (only tests that read the server move).
- Invalid findings: 0 across 5 reviews. No HIGH. Every MEDIUM had a failing-first test.
- BE builders twice handed back mid-Gradle-run; fixed by "wait in the foreground; notes are not hand-backs" in every later brief.
