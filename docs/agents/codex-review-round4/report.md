# Independent review: C2, C5, C6, C8

Reviewed 2026-11-01 in a fresh review session. Scope: the four requested commits against the C2/C5/C6/C8 briefs in `docs/agents/codex-briefs/README.md`, layouts triage, professional PK T1 and Nordic S1 checks, SIE triage, and app UX §23. No implementation changes. No PROJECT-STATE files read. Only this report is written and committed; Gradle ran only in the four task worktrees. No push or merge performed.

| Commit | Verdict | Reason |
| --- | --- | --- |
| C2 `9048846` | **FIX-FIRST** | Implementation checks pass; the combined C1/C2 candidate still has the manifest-test integration failure R4-01 below. |
| C5 `3cd1c05` | **MERGE** | Twelve intended PK codes use GROSS through template attributes; names and posted snapshots are preserved; rent is excluded. |
| C6 `2b4cba9` | **MERGE** | Zero-balance acceptance, bounded diagnostics, encoded object uniqueness and requested documentation/schema work match the brief. |
| C8 `dc211a51` | **MERGE** | Uses the shared visibility helper for People tools; no payment-reference changes. |

## R4-01 — Medium — combined manifest breaks C1's exact-list test

**Location:** `int-be/services/accounts-service/src/test/kotlin/com/neovatus/accounts/infrastructure/persistence/pack/C1TaxDataMigrationTest.kt:155`, at integration HEAD `91c14f0fc797add59c2a80bfd144a7a638439b13`. Related C2 handoff: `docs/api/accounts-packs-2026-4.md`, “C1 integration order”. This is an integration finding, not an unsafe SQL change introduced by C2.

**Failure scenario:** retaining the required five-entry union in `packs/2026.4/MANIFEST.txt` makes `stagedNextPackHashesAndDatedValuesMatchCorrectionsWithoutEditingFrozenPacks` compare five actual filenames with exactly three expected tax filenames. The full integrated accounts test gate therefore fails even though every file hash is correct. Static reproduction read the actual combined manifest: five entries, five unique filenames, all five SHA-256 hashes valid, and the existing three-name assertion evaluates false. I did not run Gradle in `int-be` or alter it.

**Fix:** the integrator must update the assertion to the exact five-file union, or assert the three tax files separately while still hash-checking all five entries. Keep one manifest and all staged tax files; do not drop chart entries to satisfy the old test. Run the C1 migration/hash tests together with C2 release tests and the final integrated accounts-service gate. Settle manifest bytes before first applying V42 because they contribute to its Flyway checksum. C2 already documents this integration action; it remains outstanding in the inspected revision.

## C2: scope and migration safety

The 31 subtype changes match A2–A5/A8/A9: long-term receivables, short-term investments, other long-term liabilities, Swedish borrowing maturities, NO 2030 paid-in equity and the four Swedish operating FX accounts. The two new subtypes have BS and cash-flow mappings. Roles and SIE metadata are cloned rather than reconstructed.

V42 adds the FI subtotal before appropriations, with the final result subtracting appropriations and tax. Iceland gets the requested expense ordering and provisions within non-current liabilities. Selected FI/DK captions reach nullable `nameLocal`. Older chart versions report MANAGEMENT; PK and BASE remain MANAGEMENT. A7 external-cost classification/order is deferred; A10 Pakistan presentation, A12 Finnish equity classification and A17 Norway-law conclusions are not implemented. PK maturity corrections explicitly required by A2/A3/A5 are present; no new BS_PK/PL_PK presentation is introduced.

`Pack2026_4.kt:78` onwards checks changed account numbers for expected provenance, type and subtype before adopting an entire company. Conflicting companies retain their prior chart. Company names are never assigned. Account IDs, role mappings, posted journals/lines and balances remain intact; the upgrade test snapshots these tables and retains the original go-live chart pointer. Adoption locks account/setup tables and records deterministic audit outcomes; repeat adoption is covered.

**Combined pack check:** at the inspected integration revision there is one manifest with the three C1 tax entries plus C2 layouts SQL and subtype CSV, and every hash matches. `Pack2026_4.kt:11–32` reads and validates tax bytes for the checksum, but its release object carries only layouts and chart changes. `write`/`adopt` do not apply tax CSVs or invoke V41. Thus V42 does not re-apply C1 corrections. R4-01 prevents calling the combined gate complete. The standalone C2 worktree does not contain V41; its test with a synthetic added tax entry is not a substitute for the final integrated gate.

## C5: scope and migration safety

`V44__pk_s153_gross_withholding.sql:9–19` changes only `base_type` on PK WITHHOLDING templates for the eleven named s.153 codes and PK-WHT-BY-CUST, including legacy pack versions. Existing company codes obtain that attribute through the company-scoped `(tax_pack_id, code)` join in `TaxCodeAttributesJdbcAdapter`; company names, rate versions and document snapshots are not rewritten. Company codes without pack provenance remain unaffected. PK-WHT-155 is absent from the update and the migration test confirms its 2026.2 template remains NET_OF_SALES_TAX.

The API regressions prove the requested example: 100,000 + 18,000 sales tax, 5% of 118,000 = **5,900 withheld**, bank **112,100**, AP settled **118,000**, with the journal's WHT base/rate recorded. Existing posted AP and AR rows are compared before/after migration; new documents use gross. The named B/C/PK-5a contract corrections are present. Frozen historical CSVs are unchanged; staged C1 tax deltas are not published or replayed by V42, so their old base text does not override V44. A future tax-pack publication must carry the gross correction as the updated contract states.

## C6: scope and hardening

A declared valid year with no balance records produces SIE_BALANCES_OMITTED INFO; missing/invalid years, unsupported 4I and voucher checks remain guarded. Both zero-company and reversing zero-net-year fixtures pass parser and worker/preview paths without fabricated IB/UB/RES records.

Post-checksum data and duplicate balances receive bounded warnings; existing checksum coverage and last-row-wins semantics remain explicit. Optional transaction/registration dates are diagnosed, including ignored/replacement transactions. Object identities are compared using the writer's shared cleaning and CP437 encoding, including empty and colliding outputs, separately per dimension. No import/export monetary convention or migration is added.

The requested INK2R-only annotation scope and year-end UB/RES convention are documented. SAF-T design targets pinned 1.40, required grouping fields, NOK VAT/currency ordering, SelectionCriteria, Owners and remaining H-NO readiness gates, and removes the period-13 remapping claim. This is a design/schema update; it does not claim a delivered SAF-T exporter or validated golden exports.

## C8: first use and first load

`PlatformPeopleScreen.kt:128–129,192` derives tools visibility from existing rows or an active typed/applied search/filter. An empty unfiltered first answer has no toolbar; filtered empty results retain tools and Clear filters; rows retain tools during refresh. The existing null-page skeleton path still handles first load. Changes are confined to the People composable and its task documentation. No permission, query, service or reference-validation behavior is changed. Visual behavior was checked by code/state-path inspection, not by launching the UI.

## Verification and limits

All four reviewed worktrees were clean at pickup and after checks, and remained at their requested commit hashes. Independent checks performed:

| Worktree | Check | Result |
| --- | --- | --- |
| `c2-layouts` | accounts-service tests: StatementCorrections2026_4Test, StatementLayoutTest | 13 tests, 0 failures, 0 skips; test task executed. |
| `c5-pk-gross` | PkGrossWithholdingMigrationTest, WithholdingBaseTest, ReceiptGrossBaseTest, PaymentApprovalTest | 17 tests, 0 failures, 0 skips; test task executed. |
| `c6-sie` | SieParserTest, SieImportWorkerTest, SiePreflightDetailsTest, SieWriterTest | 40 tests, 0 failures, 0 skips; test task executed. |
| `c8-app` | `:composeApp:jvmTest --tests '*platform*'` and `:composeApp:compileDebugKotlinAndroid` | BUILD SUCCESSFUL; both gates UP-TO-DATE. Existing filtered XML has 70 tests, 0 failures/skips; no fresh execution claimed. |

Backend checks used `./gradlew :services:accounts-service:test` with the class filters above, `--no-daemon --max-workers=2 -Pkotlin.compiler.execution.strategy=in-process -Dorg.gradle.jvmargs=-Xmx3g --console=plain`. Full accounts/architecture suites were not independently rerun; prior implementation reports are not represented as this review's execution evidence. No local service was started.

The integration checkout changed during read-only inspection; combined observations above are pinned to `91c14f0`, not a claim about later revisions. No integrated migration/test run or production tenant inspection was performed. This review compares implementation with the approved briefs; it is not a fresh six-country legal audit.

**Handoff:** review complete. The integration owner must resolve R4-01 and verify the final combined candidate. No runtime implementation finding remains in the four fixed commits. Shared plans/checkpoints were not edited under the user's one-file restriction; their owner should record this review and the integrated gate outcome.

Commit coordination: another workspace session included the initially staged report in `8772eea` while committing its round-three report. That commit is preserved. This report-only follow-up uses the requested round-four commit message and changes no other file.
