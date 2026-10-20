# HRP P8–P9 country design drafts

| Field | Checkpoint |
|---|---|
| Identity and ownership | HRP-P8-P9; Finland and Iceland Payroll design/spec/proposed contracts, requested by Jabran 2026-10-18. Codex leads draft integration. HRP lead retains approval and existing plans. |
| Stage and status | HRP-68 B1 F1–F3 and B2 DK/FI/IS Draft work, integration, verification and focused independent re-review complete. Await lead-session formal Opus review/acceptance of HRP-C-9. Stop before C or new scope. |
| Approval | HRP-68 explicitly authorizes B1 review fixes first with separate commit, then B2 DK/FI/IS Drafts and explicit-path docs commits. No production, migrations, HR screens, live submissions, push, PR or PROJECT-STATE access. Formal acceptance remains lead-owned. |
| Write scopes | Finland worker: new Backend docs/api/payroll-v2-p8.md and workspace docs/drafts/hr-payroll/payroll-p8-finland.md. Iceland worker: corresponding p9.md/payroll-p9-iceland.md. Codex: App docs/design/screen-rig/payroll-data.jsx, payroll-setup.jsx, payroll-rig.jsx, matching app.html payloads only; App docs/design/specs/payroll-p.md; this checkpoint. No shell/routes/Tweaks/Org/People/Roles/Activity changes. |
| Progress | B1 F1 separates accrual/payment; F2 visible row kinds; F3 negative deductions. Five-country trace panel now includes DK card/AM/ATP/holiday/refund, FI card/TyEL/category insurances/holiday, IS declared credit/residency/pension/union/orlof. Current unserved Org/HR facts remain blockers; only explicit alternate fixtures demonstrate pending arithmetic. |
| Evidence | Pickup App dev-app d27ae775, Backend dev ad72db7, workspace master 9740dd7; unrelated dirty paths preserved. Final 2292 browser/helper checks, 191 route/scenarios × four widths = 764 visits, zero errors/blank/overflow. Three JSX parse/no-rest, three equal app blocks/57 others plus wrapper unchanged. See HRP-C-9 closeout below for limits. |
| Findings | Formal C8 F1 Medium/F2/F3 Lows fixed separately in b92dfb92. Independent B2 review found one Low: fractional ISK input could break displayed orlof reconciliation; whole-ISK monetary sample inputs now refuse fractions before calculation, focused re-review PASS. No unresolved actionable findings; legal/practitioner/Org/HR/provider evidence remains unverified. |
| Resume point | HRP lead: run fresh formal Opus review and accept or return concrete HRP-C-9 findings. Codex stops. Batches C–E and further implementation need their owning brief and approvals. |

## Discovery and plan

Payroll admin imports scoped tax data, maps employee IDs and previews country outcomes; Payroll approver may view, ordinary HR/ESS actors gain no pay access, platform writes refused. HR retains identity/birth facts and returns paired match booleans; Org chooses country; Payroll stores financial snapshots only; Accounts owns posting roles. Upload bytes/national IDs stay request-only; BOTH later mapping/apply proposals require same bound source re-upload, shared-owner gated. No new permission or core endpoint is introduced.

Reuse existing session-only synthetic workbench with new FI/IS profiles, country-specific reporting-family selection, validated period/date requirements and bounded credit/income-limit examples. Generated, manually uploaded and accepted are separate; corrections retain parent history, company scope and payment-date semantics. All rules remain UNCHECKED / PARALLEL_ONLY. Existing P5–P7 outcomes are regression checked. Real calculation, statutory file parsing/export, authority submission and production persistence are deferred and clearly marked.

Advisor 1 structured self-challenge: existing common pattern covers permission/own-pay, stale versions, offline, replay, matching and audit; extending it avoids parallel APIs or duplicate financial state. New country report families must not collapse FI payment-level and employer-monthly periods or IS fund/tax files into one ambiguous document. Production differences stay in proposed contracts behind owner approval. Proceed within draft scope.

## Acceptance and verification

- Two proposed contracts + two detailed screen-flow drafts: source register dated 2026, explicit applicability/effective dates, import/privacy/security/error/DTO/permission/audit/own-pay/replay boundaries, dated rules, holiday/pension/contribution cases, filing/feedback/corrections, posting/payee mapping, concrete arithmetic and unresolved shared/practitioner/schema/pilot gates.
- Browser workbench reachable at #pay:hki|setup|country and #pay:reyk|setup|country with correct FI/IS country/currency, no country READY toggle. No sensitive data in browser persistence; no production claim.
- Keyed copy payroll_<area>_<name>, no object-rest destructuring, existing pickers, pay- CSS only.
- Before app.html mutation re-read; only three owned payloads; all three equal standalone bytes and every other payload hash plus wrapper unchanged against pickup snapshot.
- One /tmp headless Playwright script; React/ReactDOM/Babel exact app CDN versions acquired via npm pack. No screenshots. Meaningful helper/UI regressions and every inventoried HR/ESS/Payroll route at 390/768/1024/1280: page/console errors, blank roots and document scrollWidth overflow.
- Formal Opus/practitioner/shared amendment/Final Approval remain separate from Codex independent review and browser evidence. No commits under this draft request.

## Advisor 2 and current evidence

Country worker QA: four documents, each JSON examples/local links/whitespace checked; official source registers remain researched, not practitioner CHECKED. Root parsed the three changed JSX files with exact Babel 7.29.0. Fresh app.html integration confirms three byte-equal owned payloads and 57 other payloads plus wrapper unchanged against pickup snapshot. New rig preserves shared permission/own-pay/replay/matching/readiness guards and adds FI payment date/event context plus IS recipient-family checks. No production source or core contract changed. A single /tmp headless script uses npm-packed React/DOM 18.3.1 and Babel 7.29.0; final results: 265 focused assertions and 1484 route/scenario visits pass with zero errors or overflow. Advisor 2 is self-challenge; independent and required formal review remain separate.

## Independent review and fix batch

Round 1 returned one accepted P2: correction controls selected latest family report,
ignoring the currently entered FI payment reference/date/month. With same-day EVENT-A
then EVENT-B, correcting A targeted B; history did not distinguish the event reference.
Fix: action target now matches selected family, month, payment date/reference and
recipient; history displays the event reference. Stand-in enforces unchanged parent
context independently. Focused independent source/Node VM re-review PASS: EVENT-A target retained, EVENT-B unchanged, unmatched month has no action target; history displays event reference. Both regressions also pass in the final root-run headless browser check.
No additional audit round or production scope was opened.

## Final verification and evidence limits

Final post-fix run: **265 focused assertions**, **371 inventoried HR/ESS/Payroll
route/scenarios × 4 widths (390/768/1024/1280) = 1484 visits**. Zero page errors,
console errors, blank React roots or document horizontal overflow. Exact locally
npm-packed React/ReactDOM 18.3.1 and Babel 7.29.0 routed over the app CDN URLs.
Single script and results: `/tmp/hrp-p89-check/check.cjs`, `behavior.js`,
`final-run.log` and `result.json`; no screenshots or repository test files.
This is root-run browser evidence. The independent reviewer used actual-source
Node VM reproduction/re-review and spot-checked official sources; no independent
browser execution is claimed. Advisor 3 self-challenge accepted the concrete P2
within scope; no additional broad audit round opened.

The three changed JSX sources parse. Four new draft documents pass whitespace,
five JSON examples and twelve local-link checks; App spec/checkpoint links resolve.
All 116 actual workbench text keys are catalogued. Three owned app.html payloads
are byte-equal to standalone JSX; 57 other payload hashes and the wrapper equal the
pickup snapshot. App and Backend diff --check pass. Only the planned draft paths
changed; pre-existing P5–P7/unrelated work is preserved. NeoERP-Design/README.md is
absent here; App building-blocks and screen-rig patterns were used.

This is a verified **Draft proposal**, not accepted design or country readiness.
Named practitioner checks, exact official schemas/profiles and rounding, shared
amendment approval, required formal Opus review and parallel-customer pilot remain
open gates with owners in the country proposals. No rates or formats were marked
CHECKED. No physical import, calculation provider, real payment, statutory export,
credential or authority connection is delivered. No production code, existing
core contract, migration, commit, push or PR changed.

## Reviewable artifacts

| Slice | Detailed flow | Proposed contract | Rig route |
|---|---|---|---|
| P8 Finland | [Flow](../../drafts/hr-payroll/payroll-p8-finland.md) | [Contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p8.md) | `#pay:hki\|setup\|country` |
| P9 Iceland | [Flow](../../drafts/hr-payroll/payroll-p9-iceland.md) | [Contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p9.md) | `#pay:reyk\|setup\|country` |

Shared project state was not opened/edited under the task restriction; the
workspace integration lead owns any index update.

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

## Active brief — HRP-63 / HRP-65, batch 0 + A (2026-10-19)

Stage: Discovery complete → Plan/Advisor 1 self-challenge complete → Engineer.
User explicitly authorized HRP-63 and HRP-65: Draft commits for 0a/0b, separate 0c,
then batch A only. Formal Opus review and acceptance run in the lead's session;
stop after HRP-C-7 report, before B. No PROJECT-STATE read, production, push or PR.
P1-43 prerequisite verified: P1 carries the exact 2026-10-19 HRP amendment.

Pickup: App dev-app 9289e44c94710eba126fa7805499d2ca5fdf8374, Backend dev
8b5cd8e493c4d27ae7d7ea8a354f419540632cda, workspace master
39b36328060975c6bf56db5f07680e958671b23f. Existing country dirt is ours; App
accounts-bc.jsx and the untracked spot-state audit are unrelated and excluded.
One root integrator owns app.html. Re-read before every replacement, preserve
all unowned payloads/wrapper and staged work. Only explicit --only commit paths.

0a: clarify salary/payee PAID lifecycle, normalize five country Draft status lines.
0b: commit existing country package in three repos with approved paths, workspace
flows and two owned checkpoint directories force-added. 0c separate App commit:
worker owns only ess-shell.jsx/hr-employee.jsx/hr-data.jsx/hr-approvals.jsx; root
owns payee helper-name fix and integration. Worker may not change app.html or commit.
A root owns Payroll JSX/spec, country clarifications/flows/checkpoints and app blocks.
One shared synthetic import lifecycle per P1-43: upload, mapping, preview, apply,
done; reselect source on mapping/apply; expiry clears stored rows; no retained IDs
or files; version/fresh authorization/eligibility/HR-pair checks and counted skips.
Persist only non-sensitive synthetic source binding metadata, no source objects.

Checks: per-state behaviors, CA-14 negative/request refusal + direct sensitive
edit/audit, Babel parse, one recreated /tmp Playwright exact npm CDN packs over
all inventoried pay routes at four widths plus touched HR/ESS scenarios and prior
regressions. Formal reviewer remains lead-owned; root may use independent source
review to catch defects before handoff. No new statutory decisions or batch B–E.
Next: complete 0a/0b, integrate/test/commit 0c, build/test/commit A, append HRP-C-7.

### Batch 0 delivery / batch A integration checkpoint

0a corrected P5 SALARY/PAYEE wording; no identical overbroad sentence found P6–P9.
0b committed existing country Draft package: Backend 01d7b85, App 20162615,
workspace a397564. Exact Draft status in all five contracts. 0c App 503cf517 is
separate with specified subject; four HR/ESS sources + helper-name fix + app blocks.
Its four Babel parses and 21 exact-source behaviors pass; unified browser checks
pending. Unrelated Accounts source/spot-state audit excluded.

Batch A implemented in shared helpers/PySuTaxImport, and ten country docs aligned
by a file-disjoint worker to P1-43. Three Payroll/HR/ESS bundle integration sets
preserved all other payloads on each fresh write; current owned set seven blocks.
Country doc QA: eleven JSON examples, twenty-six local links, whitespace pass.
All five stages and required source/failure/row/count/replay/privacy states are
in the current draft. Root owns final parse/browser/source-hash checks and commits.

### Batch A final verification / review checkpoint

Independent source review PASS, then focused fingerprint-hardening re-review PASS:
source binding accepts only registered ID-free string fixture tokens, rejects nested
identity-bearing metadata without writes, copies arrays defensively, and detects
valid reordered fingerprints as IMPORT_SOURCE_CHANGED. Reporting functions unchanged.
Formal read-only Opus review remains the lead's task after this report.

Final /tmp/hrp-c7-check/check.cjs: seven full JSX Babel parses; 264 browser/helper
assertions plus 21 exact-source CA-14 behaviors; 186 Payroll design/manual route
scenarios × 390/768/1024/1280 = 744 visits, zero page/console errors, blank roots
or document overflow. Includes all required A failure states across five countries,
five-stage source reselection/mapping/apply/retry UI, ESS NID no-action/contact-HR,
ESS populated correction render/withdraw, PAID/duplicate payee files and FI report
parent-context regression. Fingerprint injection checks pass without persistence.
No screenshots. npm-packed React/DOM 18.3.1 and Babel 7.29.0 used for CDN routes.

Seven owned blocks equal JSX; 53 other payload hashes and wrapper equal the first
fresh integration snapshot. Source/script test files stay in /tmp. Ten country docs
inherit Draft P1-43, eleven JSON examples and twenty-six local links pass; exact
five backend Draft statuses preserved. Final diff whitespace clean.
One automation run scrolled the shared picker while open (documented close behavior);
the final harness centers before opening. Tightened binding validation required
using a valid different digest fixture in the changed-source test. Both harness
issues were corrected; no product failure remains in the exercised scope.

Remaining approvals: lead acceptance of 0/A, fresh lead-session Opus review,
ERP review of Draft P1-43 sensitive-data handling and Jabran's design gates.
Source/practitioner/pilot gates remain UNCHECKED/PARALLEL_ONLY. None blocks safely
showing unverified design states, but B must not start until the lead accepts A.

### Draft delivery closeout

Backend batch A 8ba3a05 inherits shared P1-43; App batch A is the inspected
`docs(payroll): shared tax-card import workflow (Draft)` commit. The workspace
batch A flow/checkpoint commit contains the reviewed country notes and final
verification record. HRP-C-7 carries all exact hashes/subjects, including this
workspace commit. All commits use the required author/email, explicit --only
paths and no trailers. No push, PR or production code. Batch B not started.


## Active HRP-68 — 2026-10-20: B1 review fixes then B2

Discovery: App dev-app d27ae775 (clean except unrelated untracked spot-state audit),
Backend dev ad72db7 (unrelated accounts-decisions dirty), workspace master 9740dd7
with unrelated accounts/inbox work. Root owns the shared Payroll JSX/app/spec and
this canonical checkpoint. HRP-68 permits explicit-path docs-only Draft commits,
B1 fixes first with exact subject; P7/P8/P9 clarifications and existing country
flows only for B2. No production, push, PR, PROJECT-STATE access, HR screens or
core H/P0–P4 contract edits. Missing NeoERP-Design/README noted; actual design
reference is App screen-rig README and payroll-p spec. H2 §7.11i read-only input
now exists; UNKNOWN remains blocked until recorded. F-04 owners remain binding.

Plan/Advisor 1 structured self-challenge: retain one session-only guarded model
and country workbench. F-1 separates earned accrual from released holiday payment;
F-2 every trace row has an explicit Payslip/Employer cost/Intermediate kind;
F-3 employee deductions are negative. No ledger or second calculation engine.
Verify/freeze/commit B1 first. Then file-disjoint DK/FI/IS workers own only their
P7/P8/P9 clarification plus existing flow and /tmp snippet; root integrates shared
files, no worker writes shared JSX/app/checkpoints or commits. Every topic uses
complete/missing HR/Org/Payroll/refused scenarios, employee/company sample scopes,
source/version/applicability/payee/provenance. Missing O2/O3/O4 stays a company
settings blocker; alternate response fixtures never establish recorded facts.
No invented statutory rates: missing evidence becomes Pending verification.

Security/lifecycle scan: existing read/platform/company/confidential/offline guards
precede projections. Synthetic HR facts contain no NID, raw DOB, health narrative
or bank details; Payroll sample inputs stay component state. Credit instructions
are employee-declared, pension/holiday payer modes Payroll-owned. No master writes,
real payslip, authority export, posting, run snapshot, or local/session persistence.
Acceptance: F1/F2/F3 assertions across all five countries, all B2 topics × five
states/scopes; changed JSX Babel/no-object-rest; fresh exact npm CDN Playwright
all pay routes at 390/768/1024/1280, zero errors/blank/overflow; earlier regressions;
byte-equal owned payloads, every unowned hash/wrapper unchanged. Distinct independent
review + one focused fix re-review, formal Opus review remains lead's. B1 not yet
accepted, B2 preparation specifically authorized; no later scope inferred.


B1 correction stage: App b92dfb92 exact requested subject; 17 actual-source VM
assertions and three JSX parses pass, independent focused static review no
findings. No separate P5/P6 amendments needed; allowed spec documents changed
trace semantics. Three country workers now assigned only their contract/flow and
/tmp snippet; root owns app HTML integration. Recreated exact-version npm packs
in /tmp/hrp-c9-check because prior C8 /tmp evidence was gone. Root new acceptance
harness includes earlier actual-source import, NID, ESS/time, payee and FI context
regressions rather than assuming unavailable old scripts still ran.


## HRP-C-9 verified Draft closeout — 2026-10-20

Engineer/Advisor 2: integrated the three disjoint country snippets into the
existing guarded country workbench and dispatcher, not a new route/provider or
financial state store. Employee-declared facts/controls have explicit provenance.
All 23 money topics across five countries use visible row kinds and consistent
negative employee deductions. DK refund remains a nonmonetary worksheet; FI has
no universal insurer rate; IS unknown union policy/partial residence remains
pending. Actual O2/O3/O4 (and missing HR) blockers are never silently cleared by
an illustrative fixture. No raw DOB/NID/health narrative/account in projections.

Independent Reviewer: B1 focused review PASS; integrated B2 bounded source/model
review found only fractional-ISK display mismatch. Reproduction open0/base10/
release0.5 displayed earned1/released1/closing1. Improver: whole-ISK monetary input
constraint + keyed validation and input step1 (percentages keep step any), not a
statutory rounding ruling. Focused independent re-review PASS; no remaining
finding. Root browser checks confirm fraction suppresses money and integer
open0/base10/release1 closes0. This is Codex evidence, not the formal lead review.

Final actual-source harness /tmp/hrp-c9-check/check.cjs, recreated because C8 tmp
was gone, uses newly npm-packed React18.3.1 / ReactDOM18.3.1 / Babel7.29.0 with
exact CDN URL interception and headless Chrome; no screenshots. 2292 helper/UI
checks and 191 inventoried design/manual route-scenarios × 390/768/1024/1280 =
764 visits; zero page/console errors, blank roots or document horizontal overflow.
147 distinct hashes; duplicate index entries intentionally exercise scenarios.
Includes 23 topics × five states × two scopes × four widths, all trace tags,
negative input-driven payslip changes for five countries, B2 actual arithmetic,
required-owner/refusal/current/alternate/invalid states, card ceiling/revised
opening, ATP hours, insurer sensitivity, credit/carry/residence, holiday earned/
release, and explicit Org/source gates. Earlier regressions recreated: P1 map/
apply source binding/failure precedence/expiry/partial counts/replay/discard,
legacy NID badge/apply/creation refusal, direct reasoned sensitive edit field-only
audit, address apply, ESS NID no-action/time-correction withdraw, PAID-only and
duplicate payee file/download, FI separate-payment correction context. No local/
session persistence. Supplementary isolated worker checks: DK1185/FI377/IS279;
17 focused B1 actual-source checks also pass. Final JSON/log stay only in /tmp.

Three changed JSX parse and no object-rest; every owned payload equals its JSX.
All 57 other payload hashes and wrapper unchanged against fresh pickup and every
integration write. Whitespace/scope checks green. P7/P8/P9 changes are B2 Draft
clarifications only; H0–H4/P0–P4 untouched. No production tests/builds required for
these docs-only synthetic files. App B1 fix b92dfb92; Backend B2 d990111; App B2
subject docs(payroll): Denmark Finland Iceland money traces (Draft). Workspace
country-flow/checkpoint commit carries this final evidence; report has exacthashes.

Final Approval boundary: all values Pending verification / UNCHECKED /
PARALLEL_ONLY, no ready country, actual declaration/policy save or legal/practitioner
approval. Lead must review/accept B1 fixes+B2 and supply the next approved brief.
Append one HRP-C-9 then stop; no push/PR, C–E or HR protection screen inferred.
