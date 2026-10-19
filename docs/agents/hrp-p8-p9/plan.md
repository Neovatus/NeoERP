# HRP P8–P9 country design drafts

| Field | Checkpoint |
|---|---|
| Identity and ownership | HRP-P8-P9; Finland and Iceland Payroll design/spec/proposed contracts, requested by Jabran 2026-10-18. Codex leads draft integration. HRP lead retains approval and existing plans. |
| Stage and status | HRP-63/65 batches 0 and A complete as verified Draft delivery. Awaiting HRP lead acceptance and lead-session Opus review; B not started. |
| Approval | HRP-63/65 explicitly authorize batch 0 and A Draft work and explicit-path docs commits. No production, migrations, live submissions, push, PR or PROJECT-STATE access. B–E wait for lead acceptance. Formal review remains lead-owned. |
| Write scopes | Finland worker: new Backend docs/api/payroll-v2-p8.md and workspace docs/drafts/hr-payroll/payroll-p8-finland.md. Iceland worker: corresponding p9.md/payroll-p9-iceland.md. Codex: App docs/design/screen-rig/payroll-data.jsx, payroll-setup.jsx, payroll-rig.jsx, matching app.html payloads only; App docs/design/specs/payroll-p.md; this checkpoint. No shell/routes/Tweaks/Org/People/Roles/Activity changes. |
| Progress | Recorded scope confirms P8 FI: income-limit card, TyEL, unemployment/health, holiday/lomaraha, per-payment Incomes Register and employer report. P9 IS: brackets/credit, social charge, pension/séreign, orlof, tax/fund/union files. Reuse the country workbench, P1 import, P2 role mapping, P3 files and P4 immutable filing model. |
| Evidence | App dev-app 574ffe1c914b54bb66c29469ec1bf15ad270ba13; Backend dev c521bd3509c3752d2d15969167c1335c3a101084. Pickup dirty App: five existing P5–P7 files (three JSX/app/spec) plus unrelated untracked spot-state audit. Backend: three untracked P5–P7 contracts. They are preserved. At pickup, prior /tmp artifacts were unavailable; the exact-version local-CDN harness was recreated for the recorded final run. Its /tmp artifacts are again unavailable at the 2026-10-19 handoff; final evidence is recorded below. |
| Findings | P8/P9 contracts were absent at pickup; both are now drafted. Material gates recorded: FI per-payer income ceiling and revised-card opening facts, per-payment versus monthly no-wages/cancellation reporting and unemployment payee mapping; IS annual/monthly credit discrepancy, child applicability wording, social base/rounding and recipient-specific formats. HR Helsinki/Reykjavík seeds are reused; the missing Helsinki Payroll wrapper/profile was added in the draft, and Reykjavík retains its rig wrapper. Country source research, 2026 rule/schema checks and practitioner/pilot gates required. Do not invent country rules or let simulated acceptance mark READY. |
| Resume point | Wait for lead acceptance of HRP-C-7 and the fresh lead-session Opus review before any batch B work. |

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
