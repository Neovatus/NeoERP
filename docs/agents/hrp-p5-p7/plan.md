# HRP P5–P7 country design drafts

| Field | Checkpoint |
|---|---|
| Identity and ownership | HRP-P5-P7; Norway, Sweden and Denmark Payroll design/spec/contract drafts. User requested 2026-10-17. Codex owns this new task and shared rig integration; HRP lead retains existing workstream plans and approval decisions. |
| Stage and status | HRP-67 two rig Lows and B1 NO/SE Draft authoring, integration, verification and independent fix-only re-review complete. Await lead-session Opus review and acceptance of HRP-C-8; stop before B2. |
| Approval | HRP-67 authorizes two specified rig fixes first, then Draft B1 NO/SE, docs commits with explicit paths. No B2/C/D/E, production, push, PR or PROJECT-STATE access. Formal money/identity review remains lead-session Opus, then lead/Jabran acceptance. |
| Write scopes | Country workers: new Backend docs/api/payroll-v2-p5.md, p6.md, p7.md respectively and corresponding workspace docs/drafts/hr-payroll/payroll-p5-norway.md, payroll-p6-sweden.md, payroll-p7-denmark.md. Codex integration: App docs/design/screen-rig/payroll-data.jsx, payroll-setup.jsx, payroll-rig.jsx and only matching app.html payloads; App docs/design/specs/payroll-p.md; this checkpoint. No shell/routes/Tweaks/other module changes. |
| Progress | Existing P5–P7 contracts absent; existing Nordic fixtures identified. All three proposed contracts and flow drafts are authored; common workbench integrated in standalone Payroll files and matching app.html blocks. Initial independent review returned three P2 findings; one fix batch applied. Focused independent re-review accepted all three fixes. Final verification is green; formal review/approval and country evidence gates remain. |
| Evidence | App dev-app and backend dev; App has only unrelated untracked spot-state audit at pickup, Backend clean. Pickup revisions: App 574ffe1c914b54bb66c29469ec1bf15ad270ba13; Backend c521bd3509c3752d2d15969167c1335c3a101084. Final exact-version local-CDN headless Chrome sweep: 218 focused checks and 367 route/scenarios × 4 widths (390/768/1024/1280; 1468 visits), zero page/console errors or document overflow. Includes permission loss/own identity changes before apply and replay, partial import counts, filing correlation/history and prior ESS/payee regressions. Three changed JSX files parse. Six draft documents pass whitespace, six JSON examples and four local-link checks; 85 actual screen keys catalogued. App diff --check passes. Independent actual-source VM re-review PASS in /tmp/hrp-independent-rereview.cjs; browser evidence is lead-run, not independently claimed. Three owned app payloads equal JSX; other 57 payloads and wrapper unchanged against pre-task baseline. Official sources must be dated and tax-year specific; researched does not mean practitioner CHECKED or country READY. |
| Findings | Country source review found material shared-amendment gates: Norway employment-only A-melding and 2026 withholding payment changes; Sweden first-declaration absence finality and SLP posting mapping; Denmark ATP/Samlet Betaling payee mapping and conditional refund routes. They are proposed in new contracts; existing core contracts remain unchanged. Engine, posting, bank-maker checks and HR facts boundaries are inherited. Independent P2 findings accepted/fixed and independently re-reviewed PASS: apply/replay now rechecks current employee membership, confidential permission and own identity before writes; all country proposals require the same source re-upload on BOTH mapping/apply with request-only identity pairing (shared amendment approval still required); workbench displays actual eligible/skipped then applied/skipped counts. |
| Resume point | HRP-C-8 records completed two Lows + B1 NO/SE. Stop for lead-session formal review and acceptance. Do not start B2 (DK/FI/IS), C/D/E, production or implementation without its next brief. |

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

## Active HRP-67 brief — 2026-10-19, two rig Lows then B1

Pickup App dev-app d4c3487fb4fc50e414996847815f5208cd693ded, Backend dev
a1fcb2f475fb2124206437c414f37220cf3bab1b, workspace master (current recorded
by git at pickup). App only unrelated spot-state audit untracked; Backend clean.
H4 and H2 F-04 amendment markers present; f04-fact-boundaries including Lead decisions
read. P1-43 item 7 now orders auth→expiry→source→row refusals→write and uses P1 codes.

Root integrator: hr3-data.jsx only badge filter; payroll-data.jsx/import order plus
B1 model integration; payroll-setup.jsx B1 generic panel; payroll-rig.jsx index;
matching app payloads only; payroll-p.md spec; owned checkpoints. NO worker owns
only P5 clarification + NO flow, /tmp NO model/text snippet. SE worker analogous
P6/SE flow and /tmp SE snippet. Workers do not edit shared JSX/app/checkpoints or
commit. Root merges snippets, validates exact code against read-only F-04 and
contracts. No overlapping file writes. Independent reviewer follows integration.

B1 target: company settings and selected-employee money trace for NO withholding
(card/table/percentage/no-card50), branch Org AGA, holiday/OTP; SE tax/one-off,
contribution cohort, holiday, sick spell/day/karens and pension. Show applicability,
source/version, payee and input-to-payslip line. Local controls edit sample Payroll
inputs only; HR/Org facts are provenance-labelled read-only fixture responses.
Unknown HR karens exemption and Org O-1 stay blockers; never invent fields or values.
Each owner-specific missing state routes to HR / company settings / named Payroll
field. All statutory rows Pending verification, UNCHECKED/PARALLEL_ONLY.

Advisor 1 structured self-challenge: reuse existing workbench/session-only model,
existing pay read/confidential gates and components; no second engine/provider,
HR store, live policy update, posting mapping or authority function. Financial
illustrations use only existing proposed contract values or explicit sample-card
inputs; unknown table/treatment stays pending. B2 countries and C/D scopes excluded.
Verification: per-topic normal/missing HR/Org/Payroll/refusal cases both countries,
pre-fix badge injection and import error precedence, prior C7 regressions, one
/tmp headless exact npm CDN harness over all pay routes/four widths, source/bundle
hash checks, independent source review then fix-only re-review as necessary.


## HRP-C-8 verification and handoff — 2026-10-19

Stage boundaries: the two Low fixes were implemented and checked before B1 was
integrated. Low-fix independent read-only review PASS, with 178 browser helper
checks and 21 existing exact-source checks; App 89e34852 records the isolated fix.
B1 country workers then supplied disjoint NO/SE model snippets and docs. Root
integrated those into the shared country workbench, source catalogs and design
index. Company-settings and employee scopes explicitly use a selected sample
employee basis, not an aggregate or an added employee Pay route.

Independent B1 source/model review found one actionable issue: SE sick trace
marked both net sick replacement and intermediate karens as candidate payslip
lines, allowing a reader to deduct karens twice. Root made gross/karens
intermediate only; focused independent re-review PASS (DAY4 one SEK3200 line,
DAY15 one zero line). No unresolved actionable review findings. This is evidence
for the lead's fresh Opus review, not its replacement or approval.

Final reconstructed /tmp/hrp-c8-check/check.cjs uses local npm-packed React
18.3.1, ReactDOM 18.3.1 and Babel standalone 7.29.0, routed from the exact app CDN
URLs. No screenshots or test files in the repo. 188 inventoried Payroll
route/scenarios (including two B1 index entries) × 390/768/1024/1280 = 752 visits:
zero page errors, console errors, blank roots or horizontal overflow. 919 browser
helper/UI checks plus 21 CA-14 exact-source checks pass. Includes every NO/SE
money topic × five states × employee/company scopes at four widths, input-driven
money change, true current Org/UNKNOWN blockers, alternate fixture trace, absence
day 15, permission/platform/company/confidential/offline refusal, invalid amounts,
no local/session storage writes, earlier P1 import/source/replay/expiry/refusal
precedence, ESS NID/time correction, PAID-only payee file and FI reporting context.
Worker isolated model checks: NO37, SE115; these are supplementary to actual
integrated browser checks. Initial harness money assertion assumed comma-grouped
formatting; corrected to compare the existing payMoneyCur formatter, no product
change. Final acceptance sweep green.

Static actual-source checks: four changed JSX parse; no object-rest destructuring;
four owned app payloads byte-equal standalone sources, all other 56 payload hashes
and wrapper unchanged against pickup. hr3-data diff is only the authorized
hrCrSupported predicate. Scope/whitespace checks pass. App B1 df8ccd32 and Backend
P5/P6 clarification 6750c0a are docs-only Draft commits. Root country flows and
this checkpoint are the remaining explicit-path Draft handoff commit.

Unresolved product facts are deliberately visible, not test failures: official NO
table/period algorithms, dated employer/zone eligibility, SE Org O-1, HR karens
exemption input, pension agreement/insurer/SLP source and all practitioner evidence.
Keep Pending verification / UNCHECKED / PARALLEL_ONLY. Missing owners/fields are
named; no new HR field, legal approval, real payable amount or ready country is
inferred. B2 and C–E remain unstarted by this task. Append one HRP-C-8 report, then
stop pending lead acceptance and Jabran's eventual click-through approval.
