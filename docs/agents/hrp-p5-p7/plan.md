# HRP P5–P7 country design drafts

| Field | Checkpoint |
|---|---|
| Identity and ownership | HRP-P5-P7; Norway, Sweden and Denmark Payroll design/spec/contract drafts. User requested 2026-10-17. Codex owns this new task and shared rig integration; HRP lead retains existing workstream plans and approval decisions. |
| Stage and status | Focused independent re-review PASS; draft authoring/integration/verification complete. Awaiting required formal Opus review and Final Approval; no approved delivery or production implementation. |
| Approval | Draft documents, source research and browser rig only. No production code, deployments, external filing, credentials, migrations, pushes or PRs. Existing P0–P4/H0–H4 contracts remain read-only. Never open PROJECT-STATE*.md. No new commit authorization inferred for new-country contracts. |
| Write scopes | Country workers: new Backend docs/api/payroll-v2-p5.md, p6.md, p7.md respectively and corresponding workspace docs/drafts/hr-payroll/payroll-p5-norway.md, payroll-p6-sweden.md, payroll-p7-denmark.md. Codex integration: App docs/design/screen-rig/payroll-data.jsx, payroll-setup.jsx, payroll-rig.jsx and only matching app.html payloads; App docs/design/specs/payroll-p.md; this checkpoint. No shell/routes/Tweaks/other module changes. |
| Progress | Existing P5–P7 contracts absent; existing Nordic fixtures identified. All three proposed contracts and flow drafts are authored; common workbench integrated in standalone Payroll files and matching app.html blocks. Initial independent review returned three P2 findings; one fix batch applied. Focused independent re-review accepted all three fixes. Final verification is green; formal review/approval and country evidence gates remain. |
| Evidence | App dev-app and backend dev; App has only unrelated untracked spot-state audit at pickup, Backend clean. Pickup revisions: App 574ffe1c914b54bb66c29469ec1bf15ad270ba13; Backend c521bd3509c3752d2d15969167c1335c3a101084. Final exact-version local-CDN headless Chrome sweep: 218 focused checks and 367 route/scenarios × 4 widths (390/768/1024/1280; 1468 visits), zero page/console errors or document overflow. Includes permission loss/own identity changes before apply and replay, partial import counts, filing correlation/history and prior ESS/payee regressions. Three changed JSX files parse. Six draft documents pass whitespace, six JSON examples and four local-link checks; 85 actual screen keys catalogued. App diff --check passes. Independent actual-source VM re-review PASS in /tmp/hrp-independent-rereview.cjs; browser evidence is lead-run, not independently claimed. Three owned app payloads equal JSX; other 57 payloads and wrapper unchanged against pre-task baseline. Official sources must be dated and tax-year specific; researched does not mean practitioner CHECKED or country READY. |
| Findings | Country source review found material shared-amendment gates: Norway employment-only A-melding and 2026 withholding payment changes; Sweden first-declaration absence finality and SLP posting mapping; Denmark ATP/Samlet Betaling payee mapping and conditional refund routes. They are proposed in new contracts; existing core contracts remain unchanged. Engine, posting, bank-maker checks and HR facts boundaries are inherited. Independent P2 findings accepted/fixed and independently re-reviewed PASS: apply/replay now rechecks current employee membership, confidential permission and own identity before writes; all country proposals require the same source re-upload on BOTH mapping/apply with request-only identity pairing (shared amendment approval still required); workbench displays actual eligible/skipped then applied/skipped counts. |
| Resume point | HRP lead/Jabran: review the linked Draft package and arrange required formal Opus review; resolve proposed P1/P2/P4/HR amendments and practitioner/parser/schema/pilot evidence before country readiness or implementation approval. WORKFLOW requires Final Approval before approved delivery. Codex has paused after verified draft preparation; no commit/push/PR, production code or live submission. Do not treat synthetic acceptance as country READY. |

## Acceptance

- Each country: scope, official-source register, unresolved source/practitioner gates, contracts/DTOs/errors/security/audit, tax-card or tax-table lifecycle, dated rules, contributions, holiday pay, pensions, filing/correction/acknowledgement, concrete cases and implementation checkpoints.
- Shared draft rig: reachable country setup, preview/mapping/import outcomes with no NID-only matching, stale-run handling, source/pilot readiness gates, generation versus authority acceptance, corrections retaining history, permission and cross-company guards.
- New text keys payroll_<area>_<name>; no object-rest destructuring; existing search pickers; CSS pay- prefixes only.
- app.html re-read immediately before each write; only owned blocks; standalone equality and other hashes unchanged.
- Targeted behavior checks plus all inventoried HR/ESS/Payroll routes at 390/768/1024/1280; no screenshots; CDN exact versions from npm packs; no errors/overflow. Review proposed contract changes and new key catalogue before Final Approval.

## Reviewable artifacts

| Slice | Detailed flow | Proposed contract | Rig route |
|---|---|---|---|
| P5 Norway | [Flow](../../drafts/hr-payroll/payroll-p5-norway.md) | [Contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p5.md) | `#pay:kyst\|setup\|country` |
| P6 Sweden | [Flow](../../drafts/hr-payroll/payroll-p6-sweden.md) | [Contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p6.md) | `#pay:sthlm\|setup\|country` |
| P7 Denmark | [Flow](../../drafts/hr-payroll/payroll-p7-denmark.md) | [Contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p7.md) | `#pay:kystdk\|setup\|country` |

Headless script, local npm-packed CDN dependencies and results are in `/tmp/hrp-p57-check/`; no screenshots or test files were added to either repository. Shared project state was not opened/edited under the task restriction; workspace integration lead owns any index update.

## Lead continuation request — 2026-10-19

Jabran requested consolidated findings and a prompt to obtain a design-completion
go-ahead. [Request and findings](../../drafts/hr-payroll/hrp-design-completion-lead-prompt.md)
written; HRP-C-6 appended to the HRP lead inbox without changing its existing bytes.
Next action: lead dispositions F-01…F-09 and an exact design-only batch/file/review
brief in the design inbox; Codex then reconciles and executes that approved scope.
No go-ahead is assumed, no design gates are closed, no production or contract edits
were made by this handoff. Historical browser checks were not rerun today and their
/tmp artifacts are unavailable on this pickup; recreate them for the next changed batch.
F-09 is a newly noticed P5 salary/payee-file wording mismatch pending owner disposition;
previous independent PASS results apply to their reviewed findings, not this new one.

## HRP-63/65 batch 0 + A — 2026-10-19

The lead accepted F-09 and authorized Draft commits and shared import batch A.
0a clarifies SALARY locks versus PAID-only PAYEE files. Existing country package
committed Backend 01d7b85 / App 20162615 / workspace a397564; CA-14 is separate
App 503cf517. All five country proposals now inherit Draft P1-43 rather than
separately approving transport A-ids. Current active checkpoint/evidence is
[batch 0/A](../hrp-p8-p9/plan.md#active-brief--hrp-63--hrp-65-batch-0--a-2026-10-19).
Final checks: 264 browser/helper + 21 CA-14 exact-source, 744 route visits clean.
Lead-session formal review and acceptance pending; Codex stops after HRP-C-7,
before B. Prior no-commit boundaries above describe the earlier draft request;
HRP-63/65 now supersede those for the explicit batch paths only.
