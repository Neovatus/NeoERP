# HR & Payroll lead — design completion findings and request for a continuation brief

From: Codex · For: HR & Payroll lead · Requested by: Jabran
Date: 2026-10-19 · Status: REQUEST / DRAFT / awaiting lead decision

## Copy-ready prompt to the HR & Payroll lead

Please review this consolidation and issue a numbered, actionable design-only brief
for Codex to finish the remaining HR & Payroll design. Jabran requested this handoff
so Codex can obtain the go-ahead to continue; this request does not itself approve
new contracts, design gates, implementation or commits.

All major scoped HR H0–H4 and Payroll P0–P9 areas now have draft coverage. Core HR,
Leave, Time, lifecycle, ESS and shared Payroll screens exist. P5–P9 now also have
country flow specifications, proposed contracts and a shared interactive workbench.
The country workbench demonstrates a subset of those detailed flows. Please do not
mark the entire design complete or build-ready merely because the browser checks pass.

Please:

1. Accept, amend or reject the proposed completion checklist in section 3; distinguish
   must-have rig interactions from behavior that can remain in the written specification.
2. Give a go/no-go for the next design-only batch and assign exact files to Codex.
   Recommendation: finish shared import/reporting flows first, then country-specific
   financial setup and exception/correction screens in small, reviewable batches.
3. Disposition every open finding in section 4 with an owner and decision. Coordinate
   Accounts/ERP/HR approvals yourself where ownership is outside Codex's files.
   Permit unaffected screen drafting while unresolved values stay explicitly unverified.
4. Resolve the salary-bank-file versus statutory-payee-file contradiction in F-09.
5. Confirm required formal review ownership/model and arrange it. Codex's independent
   reviews are documented; they are not represented as the required Opus review.
6. Reconcile the older design-gate bundles and HRP-C-5 acceptance against decisions you
   actually hold. Supply current decisions; do not ask Codex to infer approval from code.
7. Reply in your append-only [design inbox](../../inbox/hr-payroll-lead-design.md)
   using the response template in section 6, and update your own progress/approval record.

Recommendation: authorize additional **Draft design work** with placeholders for
unresolved statutory values, keep existing core contracts read-only unless their
owners explicitly authorize numbered amendments, and leave final design/contract
approval to Jabran. Production implementation and country launch are separate gates.

## 1. Reviewable package and current snapshot

| Area | Artifacts | Current status |
|---|---|---|
| Core HR / Payroll | [Recorded progress](hr-payroll-progress.md), [HRP-C-5 and earlier reports](../../inbox/hr-payroll-lead.md), [contract-audit dispositions](../../reviews/hrp-contract-audit-2026-10-16-dispositions.md) | Earlier fixes are reported complete; existing design approvals must be reconciled by the lead. The progress copy is dated 2026-10-16 and predates the country drafts. |
| P5 Norway | [Flow](payroll-p5-norway.md), [proposed contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p5.md) | Draft; workbench `#pay:kyst\|setup\|country`. |
| P6 Sweden | [Flow](payroll-p6-sweden.md), [proposed contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p6.md) | Draft; workbench `#pay:sthlm\|setup\|country`. |
| P7 Denmark | [Flow](payroll-p7-denmark.md), [proposed contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p7.md) | Draft; workbench `#pay:kystdk\|setup\|country`. |
| P8 Finland | [Flow](payroll-p8-finland.md), [proposed contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p8.md) | Draft; workbench `#pay:hki\|setup\|country`. |
| P9 Iceland | [Flow](payroll-p9-iceland.md), [proposed contract](../../../NeoERP-BackEnd/docs/api/payroll-v2-p9.md) | Draft; workbench `#pay:reyk\|setup\|country`. |
| Shared rig/spec | [Payroll spec](../../../NeoERP-App/docs/design/specs/payroll-p.md), [saved bundle](../../../NeoERP-App/docs/design/screen-rig/app.html) | Session-only synthetic stand-in; no physical parser, real calculation provider, official file export or authority connection. |
| Owned checkpoints | [P5–P7](../../agents/hrp-p5-p7/plan.md), [P8–P9](../../agents/hrp-p8-p9/plan.md) | Codex independent fix re-reviews passed; required formal review and Final Approval remain pending. |

Read the **working files**, not only HEAD: App `dev-app` remains at
`574ffe1c914b54bb66c29469ec1bf15ad270ba13`; Backend `dev` remains at
`c521bd3509c3752d2d15969167c1335c3a101084`.
Country work is uncommitted. App dirty scope is three Payroll JSX sources,
matching `app.html` payloads and `payroll-p.md`; the unrelated untracked spot-state
audit is excluded. Backend has untracked proposed P5–P9 contracts. Workspace
country flows/checkpoints accompany them. No production changes, commits, pushes
or PRs were made for these country packages.

Saved app.html SHA-256 at consolidation: `2aac2847ca8d39b581ed1864a5380e053dd2331f902831babfe653c6ae5e6170`.
This handoff is a documentation consolidation, not a fresh runtime or legal audit.

## 2. Findings already fixed and verification evidence

Do not reopen these findings without a concrete regression. Their remaining issue
is acceptance/recording, not an instruction to implement the same fix again.

| Finding group | Fixed behavior / evidence |
|---|---|
| Earlier HR/design fixes | Bank reveal and maker user-ID checks; sensitive identity copied by server stand-in for move/re-hire; directory-based re-hire offer; sensitive wizard draft exclusion; statutory Confirm/refusal and fail-closed Owner checks; lifecycle routing/counts; ESS ended access. Detailed earlier item dispositions are in the linked lead inbox and drop-3 review. |
| Contract audit CA-1…CA-35 | Accepted dispositions and contract-alignment reports already exist. HRP-C-5 reports all 19 assigned rig/spec items done, including payee bank approval, direct sensitive ID edits, protected attachments, same-illness, DST choice, run coverage, published-run reversal, bank-file cancellation and linked statutory payment/deposit void guards. Lead must confirm its acceptance; this handoff does not re-audit or re-approve them. |
| P5–P7 review P2-1 | Apply and replay recheck current employee eligibility, confidential grant and own employee association before mutation; original failures refuse without writes. |
| P5–P7 review P2-2 | All country proposals explicitly require same bound source re-upload on BOTH mapping and apply, with transient fresh HR paired validation. Discard stays JSON/file-free. This closes contradictory draft transport wording; shared-owner approval is still required by F-02. |
| P5–P7 review P2-3 | Workbench shows actual eligible/skipped before apply and applied/skipped after apply. |
| P8–P9 review P2-1 | FI correction now targets selected month/date/payment reference; another same-day payment remains unchanged. History distinguishes event references; unmatched month exposes no correction target. |
| Earlier follow-up review | ESS correction rows render/withdraw; statutory payee-file make requires PAID and duplicate READY files are refused. This behavior must not be regressed by F-09 resolution. |

Recorded checks, each against its own reviewed dirty snapshot:

- P5–P7: 218 focused checks; 367 route/scenarios × 4 widths = 1468 visits,
  zero page/console errors or document overflow; independent fix re-review PASS.
- P8–P9 final: 265 focused checks; 371 route/scenarios × 4 widths = 1484 visits,
  zero page/console errors, blank roots or document overflow; independent fix
  re-review PASS. The four widths were 390, 768, 1024 and 1280 px.
- Exact React/ReactDOM 18.3.1 and Babel 7.29.0 npm packs were routed over CDN URLs;
  no screenshots. Three owned payloads were byte-equal to JSX and 57 other payloads
  plus wrapper unchanged against each task baseline. Latest pass catalogued 116 keys.
- Independent reviews used separate reviewer contexts and actual-source checks;
  browser sweeps were Codex lead-run, not independently executed browser reviews.
- `/tmp` evidence is ephemeral and is unavailable at this 2026-10-19 pickup.
  These are recorded historical results, not checks rerun today. Recreate and rerun
  the approved browser harness for the next changed design snapshot.

## 3. Proposed remaining design completion checklist

This is a proposed acceptance checklist for the lead to confirm, not a claim that
all listed production functions must be implemented in the rig. Detailed future
flows already exist in the country documents; the missing work is complete,
reviewable interaction coverage where the lead requires it.

| Batch | Proposed design deliverable | Recommendation |
|---|---|---|
| A — shared import | Realistic upload/mapping/reselect-source screens; expiry, changed source, stale card, HR unavailable, forbidden own/confidential rows, permission loss, partial counts, discard and retry states. IS wording remains credit instruction, not invented authority tax-card feed. | Reuse one shared pattern; synthetic fixtures only; no identity/file persistence. |
| B — country inputs and money trace | NO withholding/AGA zones, holiday/OTP; SE tax/cohort/holiday/sick-pay/pension; DK card/AM/ATP/holiday-payer/refund; FI card ceiling/revised-card basis/TyEL/insurance/holiday; IS credit allocation/carry/residency/pension/séreign/orlof. Show applicability, source/version, payee and missing-fact/refusal states. | Distinguish detailed per-employee/company setup from static calculation illustrations. No guessed values or extra HR master fields. |
| C — reporting and corrections | Shared preflight, identity/content access, diagnostic/partial rejection states, manual transmission versus authority evidence; NO employment-only/replacement; SE first-declaration absence finality; DK correction cutoffs; FI earnings versus employer report and cancellation/new; IS tax/fund/union profile selection and correction lineage. | No live API, official file generation or fabricated authority acceptance. |
| D — posting/payee evidence | Preview country component/payee mapping, missing roles, holiday accrual/release and pension/union/authority splits; preserve approved account/maker controls and statutory payment/deposit linkage. | Accounts approves mappings; no second ledger or hardcoded fallback accounts. |
| E — final reconciliation | Align approved numbered contract amendments with rig/spec text; review supported/blocked profile matrix, localization keys, responsive/error/offline states and security guards. | Small independent review batches, then fix-only re-review; final lead/Jabran click-through and approval. |

The next brief should identify exact route/state acceptance examples for each batch.
Unresolved practitioner values can be labeled pending while screen structure and
safe failure states are drafted. A passing mock is never a legally checked rule.

## 4. Open findings and recommendations requiring disposition

| ID | Finding / decision needed | Owner and recommendation |
|---|---|---|
| F-01 | All five country flows extend beyond current workbench coverage; static examples and synthetic histories do not establish complete country interaction design. | HRP lead: approve/amend section 3 and define required mock coverage. Recommendation: authorize A→B→C/D→E as bounded Draft batches. |
| F-02 | JSON-only inherited mapping/apply cannot freshly pair identity after request-only national IDs are cleared. P5-A3, P6-A1, P7-A1, P8-A1 and P9-A1 propose multipart `command` + the same source file on BOTH operations. | P1/HRP/ERP: accept or replace the proposed transport explicitly; compare preview source digest/employer/year/parser profile/row order, reparse transiently, fresh HR pair validation, no retained IDs/proof store. Keep the feature blocked pending amendment approval; do not silently edit P1. |
| F-03 | P4's cash-event/monthly model does not by itself cover NO employment-only months; FI payment-level deadlines/noncash/no-wages/cancel-new; IS zero-payment obligations or separate fund/union families. Correlated manual feedback is also proposed beyond existing submission evidence. | P4/HRP and HR/ERP as needed: disposition P5-A1/A2, SE absence/finality and feedback extensions, DK correction/evidence fields, P8-A2/A3 and P9-A4. Keep immutable evidence, payment-driven monetary snapshots and distinct generated/uploaded/accepted states; never invent zero-value paid events. |
| F-04 | Country applicability needs exact HR/Org fact boundaries: SE sick-spell/karens/absence inputs; DK ATP/hour/payer/refund facts; FI insurance/age/leave and revised-card own-payer opening facts; IS residency/age/external credit-use inputs and TaxCard mapping. | HR/Org/P1 owners: approve minimal versioned DTOs and privacy policy; Payroll reads facts, not duplicate HR masters or diagnoses. Show missing-fact blockers until resolved. |
| F-05 | Accounting/payee decisions are open: SE SLP role, DK ATP/Samlet Betaling collection reference and gross/net holiday payer modes, FI Employment Fund payee against P2 NONE tagging, IS fund/union/holiday roles and social-base postings. | Accounts/P2/P3 owners with HRP: decide actual roles/payee identities and accrual/release mapping; no hardcoded account or alternative ledger. See P6 §7, P7 §13, P8 §10/§12 and P9-A3. |
| F-06 | Country source/format/rounding/applicability evidence remains unverified; details below. | HRP assigns a named country checker and evidence owner; record explicit source/schema/profile snapshots and verified fixtures. Keep rows/formats UNCHECKED/PARALLEL_ONLY until the applicable gates pass. |
| F-07 | Earlier unresolved decisions remain recorded: PK payroll figures, statutory reminder lead times and Iceland leave expiry; G-1…G-6 approval bundles; HRP-C-5 acceptance/formal security review. The 2026-10-16 progress copy is stale for newer country work. | HRP lead/Jabran: reconcile actual answers, update lead-owned progress and bundles, obtain missing decisions. Do not infer they are open or closed from their age alone. Unknown statutory expiry stays disabled. Auth-time/design-system/Accounts seed dependencies remain owned by their existing leads. |
| F-08 | Codex review/test success is not formal model-specific review, practitioner sign-off, design approval or production readiness. Country drafts are uncommitted. | HRP lead: name required reviewers and review scope; Jabran retains Final Approval. Keep production implementation, real pilots and any commit/push authorization separately explicit. Pilots validate production readiness, not a prerequisite for drawing safe pending states. |
| F-09 | **New handoff reconciliation finding:** [P5 §6](../../../NeoERP-BackEnd/docs/api/payroll-v2-p5.md#6-aga-holiday-pay-pensions-and-accounting) says PAID runs cannot create/remake/cancel "payment files" without distinguishing kind. [P3 §5.4](../../../NeoERP-BackEnd/docs/api/payroll-v2-p3.md#54-payee-amounts-and-files) requires PAID for PAYEE creation; the rig `payRunMakePayeeFile` also requires paid. A valid PAID Norwegian run therefore has contradictory design guidance for a statutory payee file. | HRP/P3 owner: correct the P5 Draft sentence to distinguish SALARY bank-file locks from PAYEE lifecycle, preserving P3's PAID requirement and requester/approved-account/duplicate guards. Do not change the already-correct rig to match the overbroad sentence. This mismatch was noticed during consolidation; it has not been independently re-reviewed or fixed here. |

Country-specific F-06 details (source investigations and full matrices remain in each contract):

| Country | Evidence/decision still required |
|---|---|
| NO / P5 | Exact 2026 tax table algorithm and rounding; skattekort response schema; A-melding XSD/code lists/payment-date fields; AGA aid/group/mobility applicability; dated G/OTP assessment/premium basis; holiday age/cap/leaver fixtures; working-day due calendar and retention. |
| SE / P6 | Exact tax/one-off table files/checksums, permitted import profile and AGI schemas/calendar; ordinary/special cohorts and monthly youth capacity across runs; agreement holiday/pension methods, SLP; sick-pay/karens fact pricing; first-declaration absence correction rules. |
| DK / P7 | Permitted tax-card profile and instruction/allowance/free-balance rules; ATP eligibility/frequency/fractional hours; holiday payer/tax timing; conditional sickness-refund deadlines; pension agreements; eIndkomst schema/employer-category calendar, prior-year cutoffs and partial correction evidence. |
| FI / P8 | Revised-card own-payer residual and gross withholding base; insurer-specific employer TyEL (average is not a universal employer rate); coverage/age thresholds and Employment Fund bands; holiday method/lomaraha agreement; exact Incomes Register schemas/codelists/calendar/cancel-new matrix; no-card/foreign coverage/retention profile. |
| IS / P9 | Published annual credit versus 12×monthly discrepancy, annual/proration/ISK rounding; child applicability wording; current social-charge base; pension/extra-savings/fund agreements; current holiday law; each tax/fund/union schema/calendar/correction profile; credit allocation and cross-employer usage evidence. |

Do not resolve legal uncertainty by approving an invented number. Assign the checker,
show an explicit unverified state, and distinguish supported from blocked profiles.

## 5. Proposed continuation boundaries

- Remain design-only: rig JSX + matching payloads, specs/flow drafts, owned checkpoints.
- Reuse existing HR/Payroll/ESS architecture and components; no new module or permission aliases.
- Existing H0–H4 and P0–P4 contracts stay read-only. The lead/shared owners draft or
  explicitly delegate exact numbered amendments before Codex aligns dependent screens.
- Proposed P5–P9 contracts may be clarified only within an explicitly assigned next brief.
- Lead assigns exact file-disjoint batches. Codex integrates app.html after a fresh read;
  owned blocks must equal JSX and unrelated hashes/wrapper stay unchanged. Preserve others' work.
- No object-rest destructuring; scoped hr-/ess-/pay- CSS, keyed screen copy and existing controls.
- No production code, migrations, real identity or bank data, credentials, live submissions,
  push or PR. No commit unless separately authorized for a reviewed file list after Final Approval.
- Recreate one /tmp Playwright harness with same-version npm-packed CDN dependencies,
  390/768/1024/1280 px, page/console/blank-root/overflow checks; no screenshots.
- Do not open PROJECT-STATE*.md under this task restriction. The integration lead owns
  any approved index update. Do not rewrite another lead's progress, decisions or inbox.

## 6. Requested lead response template

Please append your own numbered decision/brief to the design inbox; this template
is **not an approval already given**:

> HRP-<next lead ID> · DECISION / BRIEF · Re: HRP-C-6 · Design completion
>
> 1. Continuation: GO / GO WITH LIMITS / HOLD. This authorizes Draft design only.
> 2. First batch and order: …
> 3. Exact files Codex may edit and shared-file integrator: …
> 4. Required route/state acceptance examples and definition of design complete: …
> 5. F-01…F-09: accept / amend / defer / reject; owner, required ruling and dependency for each: …
> 6. Shared contract amendments approved for drafting/alignment, exact scope and writer: …
> 7. Statutory values still unresolved and named checker; allowed unverified placeholders: …
> 8. Formal reviewer/model, review scope and final approval owner: …
> 9. Prior HRP-C-5/G-1…G-6 decisions confirmed or still required: …
> 10. Commit permission: none / separately specified reviewed paths. No push, PR or production implementation.

After that brief is available, Codex can reconcile it with the working snapshot,
update the owning checkpoint and execute the approved, non-blocked design batch.
An unresolved country rule need not stop unrelated screen drafting; no dependent
financial behavior is invented. Final approval and production scope remain separate.
