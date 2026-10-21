# Review: backend fix round (ACC-232 F1–F8, ACC-236/239/240/241, D-172)

Independent read-only review, 2026-10-21. Range `bd0f1849..50bb1f9a` (single commit `50bb1f9`, NeoERP-BackEnd). No Gradle run, no services started.

## What was verified

- **V21 frozen.** `V21__phase2_pack_verification.sql` is byte-identical to `build/acc232/recovery/V21-matches-applied.sql` (`cmp`). The Flyway CRC32 recomputed here is **639820139**. The value is pinned by `Phase2PackVerificationMigrationTest.kt:20-23` (resource CRC) and `:82` (`flyway_schema_history`), and `validate()` runs at `:83`.
- **Frozen packs untouched.** The range changes no files under `packs/2026.2` or `V12`. The test pins the 2026.2 MANIFEST SHA-256 and the V7/V12/V15 checksums (`:16-25`, `:32-34`, `:84-85`).
- **V22 shape.** The migration only adds rows. It updates catalog labels in `tax_code_templates` and `coa_template_accounts`, and `check_state` on Nordic templates. It changes no rates (`tax_code_versions` is snapshot-equal at test `:78-80`), kinds or mappings. Company rows change only when they are still equal to the catalog value from before V22, matched by provenance: `origin='PACK'` + pack id + code + source + evidence for tax codes, and `template_ref` + number + source + evidence for accounts. Each label field is preserved independently. Rerunning it is a no-op in effect, because after the first run the templates equal the approved labels and the rows are already CHECKED. It is tenant-neutral: every company row is compared with its own template and nothing is copied across companies. PK rows change only `name`, and `check_state` stays unchanged (`V22:145`). COMPANY-origin codes are excluded (`V22:149`, test `:88`).
- **Labels.** All 108 SQL rows were compared programmatically, not by sampling:
  - 44 rows match `nordic-local-names-draft.md` exactly, in English and the local language. This includes "frivillig beskattning", "som omsätts utomlands", and the å/ø/ä/ö/Þ/á spellings.
  - 60 rows match `english-tax-names.md` exactly, with local name NULL (kept).
  - 4 rows match ACC-239 exactly. Their local values equal the current `2026.2/tax-codes.csv` locals.
  - Nothing is missing and there are no extra rows. The test oracle `phase2/nordic-approved-names.tsv` also matches the SQL for all 108 rows.
- **D-172.**
  - `CountryChartPolicy.kt:13-17` offers the COUNTRY charts for the books country, and BASE only when the country has none.
  - `GET /charts` is filtered per company (`ChartCatalogService.kt:28-40`, `SetupController.kt:60`).
  - Go-live refuses with 422 `CHART_NOT_FOR_COUNTRY` in two places:
    - Early, after the CHART.REPLACE permission and before the Org call (`GoLiveService.kt:104-112`).
    - Again inside the transaction after `findForUpdate` (`GoLiveService.kt:171-173`), so the check is enforced under the books lock.
  - LIVE replays return before the check. Tests `GoLiveTest.foreignChartAndBaseRefusedWithoutMutatingReadyBooks` and `unknownCountryBaseFallbackCanGoLive`, plus `ChartReplaceTest` `/charts` = `[PK]` and GB = `[BASE]`.
- **F1 `companyName`.**
  - The source of truth is the Org facts `name` (`SetupReadService.kt:110`). Org-service sends the name (`AccountsFactsDtos.kt:26`).
  - It is fetched for `scope.companyId` only and filtered with `it.companyId == companyId` (`SetupSupport.kt:28-31`), so it cannot leak across companies.
  - The value is trimmed, and is null when Org is down. GET /setup does not fail in that case (`SetupReadTest.companyNameFollowsOrgAndMissingOrgDoesNotBlockSetup`).
- **Tests.**
  - `known()` is now strict (no XFAIL), and the runner exits non-zero on XFAIL (`accounts-phase2-test.py:149`).
  - P-3, S-1, J-1 and E-2…E-8 were changed to match the ACC-232 rulings: Base/PK English-only; 195/192/3; three explicit lines; Erik confirms and Sara approves. They were not loosened.
  - Pinning `FlywayHseTest`/`SieBackfillTest` to targets 16/15 keeps those migration tests isolated. V21/V22 are covered by their own test.
  - Go-live tests that previously moved PK→NO now use a test-only `PK-ALT` chart (`SetupTestHarness.kt:149-165`). This keeps the chart-replacement regressions under D-172.

## Findings

| id | severity | file:line | finding | fix |
|---|---|---|---|---|
| R1 | MINOR | `services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/setup/ChartReplaceService.kt:98` (and `ChartCatalogService.kt:42-49` preview) | The D-172 country rule is applied only to go-live. `POST /setup/replace` on LIVE books with no postings still accepts any published chart, so PK→NO succeeds. `ChartReplaceTest.kt:58` asserts this as a success. Meanwhile `GET /charts`, which the replace UI also reads, now lists only the country chart. The API and the chooser disagree, and the country rule can be bypassed through the API after go-live. Preview also accepts any chart. D-172's text covers only Review and go live, so this is a scope question, not a contract breach. | Lead ruling: either apply `CountryChartPolicy.allowed` in `ChartReplaceService` (and preview) with the same 422, or record in A0 that replace after go-live is deliberately unrestricted. |
| R2 | MINOR | `services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/setup/GoLiveService.kt:171-173` | The check also runs when the chart is unchanged (`target = currentTemplate`). READY books created on BASE before their country chart was published (`BooksCreator.kt:74` falls back to BASE) can no longer go live on their own chart. They now need CHART.REPLACE and a reason. This is consistent with D-172 but not stated in it, and no test covers this path or the in-lock recheck on its own (the existing refusal test is answered by the early check at `:104-112`). | Add a GoLiveTest where the current template is ineligible and no chart change is requested. Have the lead confirm that this outcome is intended. |
| R3 | MINOR | `services/accounts-service/src/test/kotlin/com/neovatus/accounts/infrastructure/persistence/pack/Phase2PackVerificationMigrationTest.kt:31,79` | ACC-241 asked for a V20→V21→V22 test. The test migrates 20→latest in one step, so the live-DB path (V21 applied → company edits a V21-written label → V22) is not exercised. The SQL handles it correctly, because V22 compares with the post-V21 template, but this is untested. | Migrate to `"21"`, edit one NO import label and leave another at its V21 value, then migrate to latest. Assert the edited label is preserved and the unedited one gets the V22 name. |
| R4 | MINOR | `docs/api/accounts-a0.md:410-457, 881` | The contract body is not updated. §6.5 does not list the new nullable `companyName`, and the 422 table at `:881` does not list `CHART_NOT_FOR_COUNTRY`. Both are recorded only in the D-172 ruling line and `docs/modules/accounts/phase2-acceptance.md`. | Add `companyName` (nullable, from Org facts) to §6.5 and `CHART_NOT_FOR_COUNTRY` to the error table and §6.6. |

## Verdict

PASS: 0 BLOCKER, 0 MAJOR, 4 MINOR. V21 is byte-identical to the applied migration (CRC32 639820139, pinned by a test), V22 is additive and keeps company-edited labels, all 108 labels match the approved files exactly, and the D-172 refusal is enforced under the books lock.
The minors are a scope ruling (country rule on LIVE replace), two test gaps (unchanged ineligible chart, V21→edit→V22) and contract-doc sync. None blocks Jabran's V22 start.
