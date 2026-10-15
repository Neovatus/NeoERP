# Accounts Phase 2 — implementation checkpoint

| Field | Checkpoint |
| --- | --- |
| Identity / ownership | Accounts Phase 2; backend `dev`, App `dev-app`. Backend main: Codex · Accounts backend, under the Accounts lead (ACC-89 / ERP-75). Checkpoint integration: Codex; module acceptance: Accounts lead. Accounts/ERP design decisions stay with their owning leads. |
| Stage / status | CP-P26.2 accepted by Accounts lead ACC-105; local delivery complete, independent fixes-only Proceed. Jabran pushes only after ERP lead OK; no push by Codex. |
| Approval | Jabran authorized implementation of the already-defined Phase 2 on 2026-10-11 (“ok sure than go ahead”). ACC-103 explicitly authorizes buyer ruling, separate three-test correction and grouped local checkpoint commits; accepts P1-FIX-BE. No redesign, auth change or push authorized. |
| Scope | CP-P26.2 packs/runtime/docs and ACC-103 separate test fixes only. ORG-FACTS-2 waits for its own brief; A3/A3b/H-SE are later roadmap, not current execution scope. |
| Evidence | Backend dev currently ae021fd; App dev-app dc7234f6 (resume backend baseline dbc959f); unrelated dirty design/contracts/ADR and cp-a2.1b plan preserved. Owned checkpoint files committed and clean; unrelated lead-owned dirty files preserved. Workspace generator remains outside Git; committed manifest identifies delivered reference bytes. Full accounts521/22failed/3intentional skips; all19 affected failures corrected and focused52/52pass,0skips; architecture15/15pass. ACC-103 separate corrections resolve three remaining failures with12/12pass; buyer/loader/migration24/24pass,0skips. Fresh cp_final_review fixes-only verdict Proceed, no blocking findings; actual HTTP acceptance remains deferred to accepted local stack. |
| Progress | Both prior blockers resolved ACC-89/91. New rulings ACC-92/93 applied: 77 roles, mutable READY plans, retention table, SE3041 extension. Runtime/data/migration integrated; seed SQL parser/static checks and two throwaway PostgreSQL15 executions pass. Docker restored. P1-FIX-BE delivered separately (1bd47ca,617af07). Seed11ea703/dff145a and CP-P26.2ae54277/9f5b616/ae021fd committed locally; App docsdc7234f6. Implementation reviewed; module scope check/launch acceptance belong to lead. No push. |
| Findings | Resolved contract questions recorded in ACC-C-1/2 and replies ACC-92/93. ORG-FACTS-2 now exists and remains a separate future brief; no work on it in this checkpoint. Independent review: BAS moved-row provenance fixed; buyer-identity vocabulary/cases resolved by ACC-103, encoded and golden-tested; Nordic creation/historical retention/concurrent isolation tests passed. |
| Resume point | ACC-103 complete and reported as ACC-C-8 with all nine origin/dev..HEAD commits grouped. Await Accounts lead scope check/push order; ORG-FACTS-2 requires its own brief. No later slice execution or push. |

## Discovery assignments

- Codex root: readiness/ownership, approval evidence, current backend runtime and schema, integration; plan is root-owned.
- `phase2_pack_readiness`: read-only contract/generator/loader audit; no writes, commits or pushes.

## Intended checkpoint order

1. CP-P26.2: deterministic 2026.2 generator/resources; additive migration + loader validation; runtime amendments PA-2/3/4/5/7/8; isolated tests and acceptance assets; developer/user documentation.
2. ORG-FACTS-2: only after the ERP-owned contract/design is available and approved.
3. A3 and A3b: contract slice waves, backend/app integration and named tests.
4. H-SE: approved SIE contract/spec and storage dependencies.

Tests for CP-P26.2 are named in `NeoERP-BackEnd/docs/api/accounts-packs-2026-2.md` §8.1. Run affected classes quietly to build logs; migration requires full accounts-service suite and architecture tests. Never run an unfinished migration against Jabran's databases. No pushes; checkpoint reports go to the Accounts lead inbox as ACC-C-n for review.

## Blocking findings — 2026-10-11

1. `accounts-packs-2026-2.md` §3.4, lines 472–483: four expected DK/FI rate-version rows use `<earliest>`, defined only as “the pack's earliest supported date”. No concrete supported date is specified. For example `FI-ALV-STD` must contain both a first 24% version and the 25.5% version from 2024-09-01; an invented start date changes which historical transactions get which rate. Required ruling: explicit supported start dates per affected code/country.
2. Same contract §2.1(3), lines 185–188 requires a verified `std_account_ref` on every DK posting row except 2090. §2.3a provides representative mappings, not a full chart. BASE skeleton includes 1010 Capitalised development costs and 1020 Software and licences (`coa/_generator/base.py`), neither mapped in that table or the supplied DK verification sheet. Read-only discovery counted 188 BASE posting accounts; after excluding the two WHT-role accounts and 2090, 132 inherited posting accounts lack a mapping in the representative table (final DK additions/removals may change that count). Required ruling: remaining mappings supplied/approved by Accounts design owner, or explicit delegated scope for source verification and accounting classification. Do not drop these accounts, invent references or weaken the loader requirement.

Disposition: resolved by ACC-89 (2015-01-01 supported floor) and ACC-91 (full approved DK map, exceptions 2090/2098/2999). WORKFLOW.md Shared stages and gates requires a pause for contract/product decisions; Guardrails freezes design and sends needed changes to the reviewer. Existing D-90 allows report layouts to ship later (handover CP-P26.2 row explicitly confirms no layouts); no reopening needed. CLEARING is expressly specified by §6.2b and can be added in the implementation; its absence in current enums alone is not a contract blocker.

## CP-P26.2 resume — 2026-10-13

- Authority: ACC-89 and ACC-91 authorize the current packs contract and ERP-5 demo seed, local commits only. Accounts · Backend is paused. Contract is dirty approved design input; do not commit its unrelated edits. No auth/security changes, no live DB execution, no push.
- Baseline: backend dev at dbc959f; dirty ADR-016, cp-a2.1b-fix plan, accounts-a4/b/decisions/docout/h-se/packs contracts plus untracked later contracts and operations docs are other owners' work.
- Scope / file owners (all under this main; file-disjoint):
  1. Pack data worker: workspace docs/drafts/accounts/coa/_generator and backend resources/packs/2026.2 except schema.sql; test resources expected rates and country data validation tests. Own deterministic generation and V-1…V-35 corrections; no mapping inventions.
  2. Migration worker: resources/packs/2026.2/schema.sql, new Kotlin migration, persistence/pack code and pack loader tests. Frozen V7/2026.1 untouched; next free migration number, manifest checksum and L-1…L-14 validation.
  3. Runtime worker: domain, application, inbound/outbound ports, JDBC reference/runtime adapters outside persistence/pack, delivery DTOs/controllers; runtime tests. PA-2/3/4/5/7/8 only, country-scoped roles and ISK scale.
  4. Main: integration, seed-demo-tenants.sql and seed-demo-iam.sql (+ accounts seed if needed), docs, acceptance script, owning plan, lead report and done file.
- Models: available Codex model gpt-6.1-sol explicitly selected for delegated workers (Claude model families in handover are unavailable through this session). Fresh independent read-only review required for migration/runtime/data before checkpoint report; lead retains acceptance.
- Tests: contract §8.1 named pack/rates/rules/country/currency/create-books/role/isolation/Flyway tests; affected runtime tests, full accounts-service once and architecture-tests for migration. Quiet logs in build/, only summaries read. No local service start/stop or live database use.
- Discovery refresh: countries/roles/rates are platform reference; books retain copied 2026.1; no cross-service schema ownership. DK refs now complete. Layouts deferred under D-90; H-DK guards and ORG-FACTS-2 excluded.
- Next: implement file-disjoint parts, integrate, verify, independent review, fix, local commits, ACC-C-n report. Any new contract ambiguity goes to Accounts lead.

### Current rulings and gate — ACC-92

- Discovery blockers ACC-C-1 resolved in the live contract: 77 unique roles, PA-4 mutable setup rate reconciliation/deletion before go-live (history insert-only after go-live), explicit retention_rules table and counted_from values.
- Advisor 1 structured self-challenge: Proceed inside the approved contract; preserve country ownership, copied books, company scopes and unchanged date uniqueness. No migration installed on live databases. Country pack source verification already supplied by lead; implement it, do not reclassify statutory mappings.
- Nullable retention document_class represents all classes; physical UNIQUE NULLS NOT DISTINCT implements its logical composite key without silently making null non-null. Runtime PostgreSQL 15 supports this; tests must prove duplicate null-class rows refused.
- Main seed: DK/FI/IS company/FINANCE/profile rows, existing Ola persona memberships, Tromsø branch. Stockholm HRMS already present and preserved. Both SQL files parse (32/31 statements), structural company/branch/agreement/membership key audit passes; no DB run yet.
- Next: complete integrated migration/runtime/data; quiet affected tests, full accounts/architecture once; fresh read-only independent review; report local commit range and remaining evidence limits to Accounts lead.

### ACC-93 integration decision

- SE SERVICE_REVENUE_DEFAULT remains 3041, explicit NeoERP extension in BAS group 30; SALES_REVENUE_DEFAULT remains 3001. Lead owns future SRU/SIE mapping as 3001. No arbitrary role collision fix.
- Lead accepted nullable retention UNIQUE NULLS NOT DISTINCT implementation; duplicate-null test retained.
- New CountryPackReferenceRepository is typed and platform read-only; architecture inventory updated from 55 to 56 with its explicit classification. Existing ports cover tax rate versions and role countries. No IAM/auth permission changes.
- User guide/glossary/decisions text updated for six-country packs and pre-live planned rates; existing screen illustrations retained because this backend slice adds no screen/control. ISK app input remains later app scope.
- Acceptance asset scripts/packs-acceptance.sh drafted and bash syntax checked; not run against local stack. Seed parser/static checks only; throwaway execution/independent review remain.

### ACC-97 priority hold and exact restoration

- Lead directs P1-FIX-BE before finishing CP-P26.2; owning fix plan is NeoERP-BackEnd/docs/agents/p1-fix-be/plan.md.
- Backend CP stash: 80f4d3e333f339dafaea92320e6959c1f3d7a74c; app guide CP stash: 6dba7fa151cc4ab2a2d6a61d9e3b3750ad111e86. Only owned paths stashed; unrelated dirty design/ADR/plans and lead's payroll role fixture preserved. Workspace generator stays on disk. Restore exact hashes after P1 fix commits (do not pop/drop other stashes).
- Current evidence: deterministic regeneration byte-for-byte; 2026.1 workspace CSV copies match frozen backend inputs; data/pure runtime32/32 and architecture15/15 pass, no skips. Earlier migration worker27/27 passed. Full integrated accounts and remaining runtime DB checks blocked by unavailable Docker; ACC-C-3 asks lead to resolve. Two existing teardown methods fail after Docker assumption; no unrelated broad fix.
- Independent reviewer identified missing voucher fields in acceptance script; fixed. Full independent checkpoint verdict not received: agent execution reached workspace spend cap. Do not claim accepted review or complete checkpoint.
- BAS official PDF downloaded/read with visual inspection of group30/37/46; factual number fixture proves absent posting numbers carry explicit NeoERP provenance. Payment-reference vectors added and non-DB tests pass.
- Next after P1: restore drafts, Docker-backed runtime/full accounts checks, full independent review/fixes, seed and pack local commits, ACC-C-n report. No push.

### Post-P1 CP resumption

- Exact backend/App stashes restored after P1 commits; retained for recovery. No conflicts or unrelated edits absorbed. Current backend baseline617af07; CP remains dirty.
- Docker available (Jabran); runtime-focused29 reached all DB tests, no skips, two stale fixture expectations pending correction. Architecture15/15 passes.
- Reviewer cp_final_review first pass identified incorrect buyer-identity applicability and stale provenance on eleven moved BAS rows. Provenance now cites new BAS numbers; buyer condition schema/code list sent to Accounts lead as ACC-C-5, dependent data edits paused. Reviewer requests fixes-only review and final integrated scope.
- Next: add missing contract integration tests; run affected classes; full accounts/architecture once. Apply buyer-condition ruling when received, re-review fixes, then local commits and ACC-C-n report. No live seed/acceptance execution; static evidence only unless throwaway verification can be completed.

### Seed delivery and full verification

- Seed-only independent reviewer clearance received; both scripts ran twice successfully in disposable PostgreSQL15 databases after unchanged Org32/IAM39 migration SQL with per-file transaction semantics. Nordic country/currency/FY3, Tromsø1, StockholmHRMS1 and Ola memberships3 asserted each cycle; QA container removed. This is SQL/schema smoke evidence, not a Flyway history or live HTTP acceptance run.
- Local seed commit11ea703, seed documentationdff145a. Automatic approval review rejected committing credential-containing docs/local-demo-data.md; safer alternative keeps that file byte-unchanged and places only the new Nordic section in docs/demo-country-packs.md (no credentials). No permission request or unresolved safety block needed.
- Focused corrected/new integration suite31 tests:30pass, one old IsolationTest replacement target2026.1 failed; explicitly corrected to2026.2. Full accounts/architecture now running once, current old expectations migration11 and NO3710 being corrected, no runtime defect inferred from those fixture failures.
- Buyer applicability data remains pending ACC-C-5 ruling; no overall final acceptance.

### Full accounts regression disposition

- Full accounts run completed521 tests,22 failures,3 skipped (shared security contracts intentionally skip because Accounts defines no lifecycle/user-not-found/read-only exemptions). Full XML copied to build/cp-p26-2/full-results before focused reruns. Architecture task did not run after service failure; it is included in the follow-up command.
- Nineteen affected failures: current published replacement/version/list/count/NO-number expectations and historical V9/V10 fixture reads through V12 adapters. Test expectations corrected; historical migration fixtures explicitly use validated frozen2026.1 reference data with matching deterministic IDs, never advance the old schema or weaken production queries.
- Three unrelated failures: PeriodCloseApiTest/PeriodReopenApiTest expected history maps omit actorId although baseline dbc959f DTO already includes it; AccountsDbRolesScriptTest expects missing-password exit1 but receives2. Script/test/period DTO and tests byte-unchanged from dbc959f; script behavior may depend on local env sourcing, not diagnosed further. Report to lead; no unrelated fix in CP scope.
- Focused rerun of10 affected classes plus architecture in progress; only test edits since full run. Runtime/schema/data unchanged apart from earlier reviewed provenance fix. ACC-C-5 buyer applicability ruling still required, pack commit and overall round2 await it.

### Safe pause — 2026-10-14

- Corrected10 affected classes52/52pass,0skipped (full-failures-final.log); architecture15/15pass (full-failures-focused.log), cached on final rerun. Full521 run retained separately; do not present the focused scope as a second full run or claim all full tests passed. Three unchanged unrelated failures remain as reported above.
- New Nordic/historical/concurrent tests passed in the preceding focused31 and full521 scopes. BAS remap provenance golden test passed in full run. Frozen2026.1/V7 unchanged; deterministic regeneration and all20 manifest checksums reverified.
- Requirements, flow and development-guide checkpoint state updated alongside developer page and pending App guide/glossary/decisions text. Original credential-containing demo doc remains byte-unchanged; only seed notes in dff145a.
- Current HEADdff145a; owned pack runtime/loader/V12/schema/resources/test/architecture/docs and App four user-guide files remain dirty. Workspace generator remains outside Git; original CP stashes retained for recovery, not to reapply over later fixes. Unrelated lead-owned dirty files preserved.
- ACC-89 remains OPEN. Seed11ea703/dff145a delivered; P1-FIX-BE1bd47ca/617af07 separate and done. No pack commit, no push, no migration on user databases. HTTP acceptance and screenshot regeneration not performed; this backend slice adds no app controls and ISK input belongs to later App checkpoint.
- Exact next action: Accounts lead ruling on ACC-C-5. Dependent buyer condition edits and overall final review paused under WORKFLOW contract-decision gate; other authorized verification completed. Final report ACC-C-7 sent.

### ACC-103 resume — 2026-10-14

- Accounts lead accepted P1-FIX-BE1bd47ca/617af07 and resolved buyer applicability in contract§4.2. AND within row, OR acrossseq, taxCodes anyline, buyerRegistered and unregisteredBuyerAboveThreshold accepted. DK/SE EUgoods/services/triangulation/domesticRCsale; FI existing EUgoods/services and constructionRCsale (no FItriangulation launchcode); NOdomRCbuyeridentity; PKregisteredNTN/STRN only. No invoice interpreter or new tax code.
- Separate test-fix worker owns PeriodCloseApiTest, PeriodReopenApiTest and AccountsDbRolesScriptTest only; expected actorId and temp script copy without repo.env. Root owns generator/resources/buyer golden tests/docs. Models unchanged available gpt-6.1-sol; fresh read-only cp_final_review resumes only for fixes.
- Verification: named buyer and loader/migration affected cases plus three dispositions; full521 already run, subsequent scope-only reruns per lead. Existing unchanged20manifestfiles become updated invoice rules+manifest; V7frozen.
- Approved delivery: separate test fixes, packdata, loader/runtime and docs local commits; seed commits retained. App guide-only commit authorized as checkpoint docs, no app runtime/UI changes. Report full origin/dev..HEAD list grouped, including pre-existing CP-A2.1c handoff commit; no omission or push.
- Exact next: encode/verify ruling, finish doc checkpoint, fixes-only independent review; commit cleared scopes and update report/done records. No ORG-FACTS-2 work.

### ACC-103 verification / delivery gate

- Final focused36/36pass,0skips: separate test-fix scope12 (PeriodClose8,PeriodReopen3,DbRoles1); buyer/BAS/loader/rates/migration scope24. Full run already521; affected52 and architecture15 passed earlier. No second full run claimed. Existing3 security skips intentional; all22 original failures now covered by passing affected checks.
- Buyer rules now338rows; DK/SE4codes each, FI3existing codes. Exact frozen2026.1/V7 and deterministic generation/20checksums retained. Data source generator remains workspace-only outside Git; do not initialize a repo there.
- Documentation refreshed: backend developer/SRS/flow/database/roadmap, App country-packs developer page plus four guide/glossary/decisions files. No app control change or screenshot regeneration; no live HTTP acceptance.
- Independent cp_final_review fixes-only inspection reports no blocking finding; final verdict requested on these exact docs/evidence. Local commit approval already explicit in user/ACC-103; no repeated permission gate needed. Commit groups: three test fixes; resources2026.2; loader/runtime/tests+architecture+acceptanceasset; backend docs; App docs separately. Preserve dirty lead-owned contracts/ADR/backlog/fixtures.

### Delivery / handoff — ACC-103

- Independent cp_final_review round2: Proceed, no blocking findings; exactly fixes-only, no new scope. Review covered buyer ruling/provenance/integration tests, test dispositions and documentation/evidence accuracy; read-only. Available model-family limitation remains recorded; no claim of Claude execution.
- Authorized local commits: ac27d96 separate3test fixes; ae54277packdata;9f5b616loader/runtime/tests/acceptanceasset;ae021fdbackenddocs;Appdc7234f6docs. ExistingP1 andseed commits retained unchanged. V12confirmed nextfree immediately beforecommit.
- Every backend commit origin/dev..HEAD included in ACC-C-8: pre-existing dbc959f CP-A2.1c handoff; P1 1bd47ca/617af07;seed11ea703/dff145a;testac27d96;CPae54277/9f5b616/ae021fd. No fetch/push or remote-state claim beyond local origin/dev tracking ref.
- Same reviewed artifact committed; owned backend/App paths clean. Unrelated contracts/ADR/cp-a2.1b plan/payroll fixture and future design/operations files untouched. Original credential-containing demo doc unchanged. Workspace-only generator deterministic; manifestSHAf6dee66934b6cf2331621f081b1f462e953484aadaead6aa1ccb8899fe16c2d5.
- Evidence: full521 initially22failed/3intentional skips; all22 subsequently covered by affected52/52andACC10336/36(12testfix+24pack),0focused skips; architecture15/15. Not a second full green run. Seedtwiceruns in throwawayPostgres15. HTTP acceptance not run; Appno controlchanges/screenshotregen; all2026.2reference evidence UNCHECKED. No live DB migration or servicechanges.
- ACC89/103handled in donefile, reportACC-C-8. Next onlyleadscopecheck/pushorder, then separateORG-FACTS-2brief. Recovery stashes retained; never reapply them over these final commits.

### Accepted handoff — ACC-105

- Accounts lead scope check accepted all nine backend commits dbc959f…ae021fd and App docsdc7234f6. Prior phase/seed/testfix/CP groups remain exactly as ACC-C-8. Implementation, focused checks and independent review complete; local HTTP acceptance not performed, evidence labels remain UNCHECKED.
- Jabran owns push after ERP lead one-line OK on seed and architecture-test file (ACC-104). Codex has no push order and did not push. No migration ran on user databases.
- All owned checkpoint paths committed; only other owners' ADR/plan/design/operations changes were dirty at pickup. Recoverystashes retained but obsolete; never apply over final commits. Workspace generator remains outsideGit and deterministic.
- Next authorized work: ACC-107 ORG-FACTS-2, backend only, owning planNeoERP-BackEnd/docs/agents/org-facts-2/plan.md. Separate first approved contract-docs commit9e98d97; no Appscreens, no A3 until anotherbrief.
